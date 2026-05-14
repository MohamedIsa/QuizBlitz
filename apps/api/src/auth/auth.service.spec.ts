import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
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

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock.jwt.token') },
        },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('7d') },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('bcrypt-hash');
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
  });

  describe('register', () => {
    const dto: RegisterDto = {
      email: 'host@example.com',
      password: 'password123',
      displayName: 'Host User',
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
  });

  describe('login', () => {
    it('returns access and refresh tokens', async () => {
      userRepo.save.mockResolvedValue(mockUser);

      const result = await service.login(mockUser);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });
});
