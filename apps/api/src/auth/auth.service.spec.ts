import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { EmailService } from '../email/email.service';
import { PasswordResetToken } from '../password-reset-tokens/password-reset-token.entity';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('bcrypt-hash'),
  compare: jest.fn().mockResolvedValue(false),
}));

const mockUser: User = {
  id: 'uuid-abc-123',
  email: 'host@example.com',
  displayName: 'Host User',
  passwordHash: 'hashed-pw',
  googleId: null,
  refreshTokenHash: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  };
  let resetTokenRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };
  let emailService: { sendOtp: jest.Mock };
  let jwtService: { sign: jest.Mock; verify: jest.Mock };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
    };
    resetTokenRepo = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation(v => v),
      save: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    emailService = { sendOtp: jest.fn().mockResolvedValue(undefined) };
    jwtService = {
      sign: jest.fn().mockReturnValue('mock.jwt.token'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(PasswordResetToken), useValue: resetTokenRepo },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('7d') },
        },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('bcrypt-hash');
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    jwtService.sign.mockReturnValue('mock.jwt.token');
    resetTokenRepo.create.mockImplementation((v: unknown) => v);
    resetTokenRepo.save.mockResolvedValue(undefined);
    resetTokenRepo.delete.mockResolvedValue(undefined);
    emailService.sendOtp.mockResolvedValue(undefined);
    userRepo.update.mockResolvedValue(undefined);
  });

  describe('register', () => {
    const dto: RegisterDto = {
      email: 'host@example.com',
      password: 'password123',
      displayName: 'Host User',
      turnstileToken: 'test-token',
    };

    it('creates a user and returns tokens', async () => {
      userRepo.findOne.mockResolvedValue(null);
      userRepo.create.mockReturnValue(mockUser);
      userRepo.save.mockResolvedValue(mockUser);

      const result = await service.register(dto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: dto.email, displayName: dto.displayName }),
      );
      expect(userRepo.save).toHaveBeenCalled();
    });

    it('throws ConflictException when email is already registered', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(userRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('returns the user when credentials are valid', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('host@example.com', 'correct-password');

      expect(result).toEqual(mockUser);
    });

    it('returns null when password does not match', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('host@example.com', 'wrong-password');

      expect(result).toBeNull();
    });

    it('returns null when user is not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      const result = await service.validateUser('nobody@example.com', 'any-password');

      expect(result).toBeNull();
    });

    it('returns null when passwordHash is null (Google-only account)', async () => {
      userRepo.findOne.mockResolvedValue({ ...mockUser, passwordHash: null });

      const result = await service.validateUser('host@example.com', 'any-password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('returns access and refresh tokens', async () => {
      userRepo.save.mockResolvedValue(mockUser);

      const result = await service.login(mockUser);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('refreshTokens', () => {
    const userWithHash = { ...mockUser, refreshTokenHash: 'stored-hash' };

    it('returns a new token pair when the refresh token matches', async () => {
      userRepo.findOne.mockResolvedValue(userWithHash);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.refreshTokens(mockUser.id, 'raw-refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(userRepo.update).toHaveBeenCalled();
    });

    it('throws UnauthorizedException when refreshTokenHash is null (logged out)', async () => {
      userRepo.findOne.mockResolvedValue({ ...mockUser, refreshTokenHash: null });

      await expect(
        service.refreshTokens(mockUser.id, 'any-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the token hash does not match (replayed token)', async () => {
      userRepo.findOne.mockResolvedValue(userWithHash);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.refreshTokens(mockUser.id, 'stale-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('clears refreshTokenHash by calling update with null', async () => {
      await service.logout(mockUser.id);

      expect(userRepo.update).toHaveBeenCalledWith(mockUser.id, {
        refreshTokenHash: null,
      });
    });
  });

  describe('findOrCreateGoogleUser', () => {
    const googleProfile = {
      googleId: 'google-id-123',
      email: 'host@example.com',
      displayName: 'Host User',
    };

    it('returns existing user when found by googleId (no save)', async () => {
      const googleUser = { ...mockUser, googleId: 'google-id-123' };
      userRepo.findOne.mockResolvedValueOnce(googleUser);

      const result = await service.findOrCreateGoogleUser(googleProfile);

      expect(result).toEqual(googleUser);
      expect(userRepo.save).not.toHaveBeenCalled();
    });

    it('links googleId to existing email account and saves', async () => {
      const existingUser = { ...mockUser, googleId: null };
      const savedUser = { ...existingUser, googleId: 'google-id-123' };
      // first findOne (by googleId) returns null; second (by email) returns the existing user
      userRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingUser);
      userRepo.save.mockResolvedValue(savedUser);

      const result = await service.findOrCreateGoogleUser(googleProfile);

      expect(result.googleId).toBe('google-id-123');
      expect(userRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ googleId: 'google-id-123' }),
      );
    });

    it('creates a new user with null passwordHash when no existing user found', async () => {
      const newUser = { ...mockUser, googleId: 'google-id-123', passwordHash: null };
      userRepo.findOne.mockResolvedValue(null);
      userRepo.create.mockReturnValue(newUser);
      userRepo.save.mockResolvedValue(newUser);

      const result = await service.findOrCreateGoogleUser(googleProfile);

      expect(result.passwordHash).toBeNull();
      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: null, googleId: 'google-id-123' }),
      );
      expect(userRepo.save).toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('silently returns without sending email when the email is not registered', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await service.forgotPassword('nobody@example.com');

      expect(emailService.sendOtp).not.toHaveBeenCalled();
      expect(resetTokenRepo.save).not.toHaveBeenCalled();
    });

    it('deletes old unused tokens, saves a new OTP row, and sends the email', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);

      await service.forgotPassword('host@example.com');

      expect(resetTokenRepo.delete).toHaveBeenCalledWith(
        expect.objectContaining({ userId: mockUser.id }),
      );
      expect(resetTokenRepo.save).toHaveBeenCalled();
      expect(emailService.sendOtp).toHaveBeenCalledWith(
        'host@example.com',
        expect.stringMatching(/^\d{6}$/),
      );
    });
  });

  describe('verifyOtp', () => {
    const validToken: Partial<PasswordResetToken> = {
      id: 'token-uuid',
      userId: mockUser.id,
      otpHash: 'bcrypt-hash',
      usedAt: null,
      otpExpiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
    };

    it('returns a resetToken when OTP is valid', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      resetTokenRepo.findOne.mockResolvedValue(validToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyOtp('host@example.com', '123456');

      expect(result).toHaveProperty('resetToken');
      expect(resetTokenRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ usedAt: expect.any(Date) }),
      );
    });

    it('throws UnauthorizedException when no valid OTP row exists (expired or already used)', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      // The query filters out expired/used rows — returns null
      resetTokenRepo.findOne.mockResolvedValue(null);

      await expect(service.verifyOtp('host@example.com', '000000')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when the OTP does not match the stored hash', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      resetTokenRepo.findOne.mockResolvedValue(validToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.verifyOtp('host@example.com', '000000')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when the email is not registered', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.verifyOtp('nobody@example.com', '123456')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('resetPassword', () => {
    const resetPayload = { sub: mockUser.id, purpose: 'password-reset' };

    it('updates passwordHash for a standard account', async () => {
      jwtService.verify.mockReturnValue(resetPayload);
      userRepo.findOne.mockResolvedValue(mockUser);

      await service.resetPassword('valid.reset.token', 'NewPassword1!');

      expect(userRepo.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ passwordHash: 'bcrypt-hash' }),
      );
      expect(resetTokenRepo.delete).toHaveBeenCalledWith({ userId: mockUser.id });
    });

    it('sets a password for a Google-only account (passwordHash was null) — AC-6', async () => {
      jwtService.verify.mockReturnValue(resetPayload);
      userRepo.findOne.mockResolvedValue({ ...mockUser, passwordHash: null });

      await service.resetPassword('valid.reset.token', 'NewPassword1!');

      expect(userRepo.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ passwordHash: 'bcrypt-hash' }),
      );
    });

    it('throws UnauthorizedException when the reset token JWT is invalid', async () => {
      jwtService.verify.mockImplementation(() => { throw new Error('invalid'); });

      await expect(
        service.resetPassword('bad.token', 'NewPassword1!'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the token purpose is not password-reset', async () => {
      jwtService.verify.mockReturnValue({ sub: mockUser.id, purpose: 'access' });

      await expect(
        service.resetPassword('access.token', 'NewPassword1!'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
