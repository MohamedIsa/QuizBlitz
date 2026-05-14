import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshUserPayload } from './strategies/jwt-refresh.strategy';
import { UserPayload } from './interfaces/user-payload.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new host account' })
  @ApiBody({ type: RegisterDto })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Log in and receive JWT tokens' })
  @ApiBody({ type: LoginDto })
  login(@CurrentUser() user: User) {
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
}
