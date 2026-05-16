import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { EmailService } from '../email/email.service';
import { PasswordResetToken } from '../password-reset-tokens/password-reset-token.entity';
import { User } from '../users/user.entity';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';

const BCRYPT_ROUNDS_PASSWORD = 12;
const BCRYPT_ROUNDS_REFRESH = 10;
const BCRYPT_ROUNDS_OTP = 10;
const OTP_TTL_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokenRepo: Repository<PasswordResetToken>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS_PASSWORD);
    const user = this.userRepo.create({
      email: dto.email,
      displayName: dto.displayName,
      passwordHash,
    });
    const saved = await this.userRepo.save(user);
    this.logger.log(`User registered: ${saved.id}`);

    return this.generateTokens(saved);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { email } });
    // Google-only accounts have no password — reject login attempts for them
    if (!user || !user.passwordHash) return null;

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return null;

    return user;
  }

  async findOrCreateGoogleUser(profile: {
    googleId: string;
    email: string;
    displayName: string;
  }): Promise<User> {
    // Returning Google user — already linked
    let user = await this.userRepo.findOne({
      where: { googleId: profile.googleId },
    });
    if (user) return user;

    // Existing email/password account — link the Google ID to it
    user = await this.userRepo.findOne({ where: { email: profile.email } });
    if (user) {
      user.googleId = profile.googleId;
      this.logger.log(`Linked Google account to existing user: ${user.id}`);
      return this.userRepo.save(user);
    }

    // Brand-new user via Google
    const newUser = this.userRepo.create({
      email: profile.email,
      displayName: profile.displayName,
      googleId: profile.googleId,
      passwordHash: null,
    });
    const saved = await this.userRepo.save(newUser);
    this.logger.log(`New user created via Google OAuth: ${saved.id}`);
    return saved;
  }

  async login(user: User): Promise<AuthResponseDto> {
    return this.generateTokens(user);
  }

  async refreshTokens(
    userId: string,
    rawRefreshToken: string,
  ): Promise<AuthResponseDto> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isMatch = await bcrypt.compare(rawRefreshToken, user.refreshTokenHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.generateTokens(user);
  }

  async logout(userId: string): Promise<void> {
    await this.userRepo.update(userId, { refreshTokenHash: null });
    this.logger.log(`User logged out: ${userId}`);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email } });
    // Silent return — never expose whether an email is registered
    if (!user) return;

    // Remove any previous unused OTP rows before issuing a new one
    await this.resetTokenRepo.delete({ userId: user.id, usedAt: IsNull() });

    // TODO (Phase 5): replace with crypto.randomInt(100000, 1000000) for CSPRNG
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(otp, BCRYPT_ROUNDS_OTP);
    const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);

    await this.resetTokenRepo.save(
      this.resetTokenRepo.create({ userId: user.id, otpHash, otpExpiresAt }),
    );
    await this.emailService.sendOtp(email, otp);
    this.logger.log(`Password reset OTP sent for user: ${user.id}`);
  }

  async verifyOtp(email: string, otp: string): Promise<{ resetToken: string }> {
    const user = await this.userRepo.findOne({ where: { email } });
    // Same error message for unknown email and invalid OTP — no enumeration
    if (!user) throw new UnauthorizedException('Invalid or expired OTP');

    // Find the most recent unused, unexpired OTP for this user
    const token = await this.resetTokenRepo.findOne({
      where: {
        userId: user.id,
        usedAt: IsNull(),
        otpExpiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });
    if (!token) throw new UnauthorizedException('Invalid or expired OTP');

    const isMatch = await bcrypt.compare(otp, token.otpHash);
    if (!isMatch) throw new UnauthorizedException('Invalid or expired OTP');

    token.usedAt = new Date();
    await this.resetTokenRepo.save(token);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resetToken = this.jwtService.sign(
      { sub: user.id, purpose: 'password-reset' },
      { expiresIn: '5m' as any },
    );
    this.logger.log(`OTP verified, reset token issued for user: ${user.id}`);
    return { resetToken };
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    let payload: { sub: string; purpose: string };
    try {
      payload = this.jwtService.verify<{ sub: string; purpose: string }>(resetToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Reject tokens not scoped to password-reset (prevents access token reuse)
    if (payload.purpose !== 'password-reset') {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('Invalid or expired reset token');

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS_PASSWORD);
    await this.userRepo.update(user.id, { passwordHash });
    await this.resetTokenRepo.delete({ userId: user.id });
    this.logger.log(`Password reset complete for user: ${user.id}`);
  }

  private async generateTokens(user: User): Promise<AuthResponseDto> {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    const refreshExpiry = this.config.getOrThrow<string>('JWT_REFRESH_EXPIRY');
    // ConfigService returns string; JwtSignOptions.expiresIn expects StringValue (ms union).
    // The runtime value ('7d', '30d' etc.) is always valid — the cast is safe.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: refreshExpiry as any },
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS_REFRESH);
    await this.userRepo.update(user.id, { refreshTokenHash });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, displayName: user.displayName },
    };
  }
}
