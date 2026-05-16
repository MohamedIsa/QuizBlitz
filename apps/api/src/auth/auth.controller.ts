import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Post, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { TurnstileService } from './turnstile.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshUserPayload } from './strategies/jwt-refresh.strategy';
import { UserPayload } from './interfaces/user-payload.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly turnstileService: TurnstileService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new host account' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() dto: RegisterDto, @Ip() ip: string) {
    await this.turnstileService.verify(dto.turnstileToken, ip);
    return this.authService.register(dto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Log in and receive JWT tokens' })
  @ApiBody({ type: LoginDto })
  async login(@CurrentUser() user: User, @Body() dto: LoginDto, @Ip() ip: string) {
    await this.turnstileService.verify(dto.turnstileToken, ip);
    return this.authService.login(user);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate refresh token and receive a new token pair' })
  @ApiBody({ type: RefreshDto })
  refresh(@Body() _dto: RefreshDto, @CurrentUser() user: RefreshUserPayload) {
    return this.authService.refreshTokens(user.id, user.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate the current session' })
  logout(@CurrentUser() user: UserPayload) {
    return this.authService.logout(user.id);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset OTP (always returns 200)' })
  @ApiBody({ type: ForgotPasswordDto })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and receive a short-lived reset token' })
  @ApiBody({ type: VerifyOtpDto })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.otp);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set a new password using the reset token' })
  @ApiBody({ type: ResetPasswordDto })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.resetToken, dto.newPassword);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  @ApiOperation({ summary: 'Initiate Google OAuth 2.0 login' })
  googleLogin(): void {
    // Passport redirects to Google before this body runs
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth 2.0 callback — issues JWT token pair' })
  async googleCallback(@CurrentUser() user: User, @Res() res: Response) {
    const tokens = await this.authService.login(user);
    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    // TODO (Phase 5): replace query-string token handoff with a one-time code
    // stored in Redis to avoid tokens appearing in browser history / server logs.
    res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  }
}
