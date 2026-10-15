import { Controller, Post, Get, Body, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { PublicRoute } from './decorators/public-route.decorator.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { ActiveUserGuard } from './guards/active-user.guard.js';
import { Throttle } from '@nestjs/throttler';
import { changePasswordSchema, loginSchema, type ChangePasswordDto, type LoginDto } from '@ggm/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicRoute()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body(new ZodValidationPipe(loginSchema)) dto: LoginDto, @Res({ passthrough: true }) res: any) {
    const { token, user, cookieOptions } = await this.authService.login(dto);
    res.cookie('gom_session', token, cookieOptions);
    return { data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      mustChangePassword: user.mustChangePassword,
    } };
  }

  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Post('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: any) {
    await this.authService.logout(req.activeUser);
    res.clearCookie('gom_session');
    return { data: null };
  }

  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Get('me')
  async me(@Req() req: any) {
    const data = await this.authService.me(req.activeUser);
    return { data };
  }

  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Post('change-password')
  async changePassword(@Req() req: any, @Body(new ZodValidationPipe(changePasswordSchema)) dto: ChangePasswordDto, @Res({ passthrough: true }) res: any) {
    const { token, user, cookieOptions } = await this.authService.changePassword(req.activeUser, dto);
    res.cookie('gom_session', token, cookieOptions);
    return { data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      mustChangePassword: user.mustChangePassword,
    } };
  }
}
