import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Profile } from 'passport-google-oauth20';
import { User } from '../../users/user.entity';
import { AuthService } from '../auth.service';
import { GoogleStrategy } from './google.strategy';

const mockUser: User = {
  id: 'uuid-abc-123',
  email: 'host@example.com',
  displayName: 'Host User',
  passwordHash: null,
  googleId: 'google-id-123',
  refreshTokenHash: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeProfile = (email?: string): Profile =>
  ({
    id: 'google-id-123',
    displayName: 'Host User',
    emails: email ? [{ value: email, verified: 'true' }] : undefined,
    provider: 'google',
    _raw: '',
    _json: {} as any,
  }) as Profile;

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  let authService: { findOrCreateGoogleUser: jest.Mock };

  beforeEach(async () => {
    authService = { findOrCreateGoogleUser: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('mock-value') },
        },
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    strategy = module.get(GoogleStrategy);
  });

  describe('validate', () => {
    it('calls findOrCreateGoogleUser and returns the user when profile has an email', async () => {
      authService.findOrCreateGoogleUser.mockResolvedValue(mockUser);
      const profile = makeProfile('host@example.com');

      const result = await strategy.validate('_access', '_refresh', profile);

      expect(authService.findOrCreateGoogleUser).toHaveBeenCalledWith({
        googleId: 'google-id-123',
        email: 'host@example.com',
        displayName: 'Host User',
      });
      expect(result).toEqual(mockUser);
    });

    it('throws UnauthorizedException and does not create a user when profile has no email', async () => {
      const profile = makeProfile(); // no emails array

      await expect(
        strategy.validate('_access', '_refresh', profile),
      ).rejects.toThrow(new UnauthorizedException('Google account has no email'));

      expect(authService.findOrCreateGoogleUser).not.toHaveBeenCalled();
    });
  });
});
