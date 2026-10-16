import { Controller, Post, Get, Body, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { PublicRoute } from './decorators/public-route.decorator.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { ActiveUserGuard } from './guards/active-user.guard.js';
import { Throttle } from '@nestjs/throttler';
import {
  changePasswordSchema,
  loginSchema,
  refreshTokenSchema,
  verify2faSchema,
  type ChangePasswordDto,
  type LoginDto,
  type RefreshTokenDto,
  type Verify2faDto,
} from '@ggm/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { AuthenticatedRequest } from '../common/types.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicRoute()
  @Throttle({
    default: { limit: 5, ttl: 60000 },
    short: { limit: 5, ttl: 60000 },
    long: { limit: 15, ttl: 900000 },
  })
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);

    if ('requires2FA' in result && result.requires2FA) {
      return {
        data: {
          requires2FA: true,
          user: result.user,
        },
      };
    }

    const { accessToken, refreshToken, user, accessCookieOptions, refreshCookieOptions } = result;

    res.cookie('gom_session', accessToken, accessCookieOptions);
    res.cookie('gom_refresh_token', refreshToken, refreshCookieOptions);

    return {
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        mustChangePassword: user.mustChangePassword,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    };
  }

  @PublicRoute()
  @Throttle({
    default: { limit: 20, ttl: 60000 },
    short: { limit: 10, ttl: 60000 },
  })
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body?: { refreshToken?: string },
  ) {
    const cookieHeader = req.headers.cookie;
    let token = body?.refreshToken;

    if (!token && cookieHeader) {
      const match = cookieHeader.match(/gom_refresh_token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    if (!token) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const { accessToken, refreshToken: newRefreshToken, user, accessCookieOptions, refreshCookieOptions } =
      await this.authService.refresh(token);

    res.cookie('gom_session', accessToken, accessCookieOptions);
    res.cookie('gom_refresh_token', newRefreshToken, refreshCookieOptions);

    return {
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }

  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Post('logout')
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.activeUser);
    res.clearCookie('gom_session', { path: '/' });
    res.clearCookie('gom_refresh_token', { path: '/' });
    return { data: null };
  }

  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Get('me')
  async me(@Req() req: AuthenticatedRequest) {
    const data = await this.authService.me(req.activeUser);
    return { data };
  }

  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Throttle({
    default: { limit: 5, ttl: 60000 },
    short: { limit: 5, ttl: 60000 },
  })
  @Post('change-password')
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(changePasswordSchema)) dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user, accessCookieOptions, refreshCookieOptions } =
      await this.authService.changePassword(req.activeUser, dto);

    res.cookie('gom_session', accessToken, accessCookieOptions);
    res.cookie('gom_refresh_token', refreshToken, refreshCookieOptions);

    return {
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }

  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Post('2fa/setup')
  async setup2fa(@Req() req: AuthenticatedRequest) {
    const data = await this.authService.setup2fa(req.activeUser);
    return { data };
  }

  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Post('2fa/enable')
  async enable2fa(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(verify2faSchema)) dto: Verify2faDto,
  ) {
    const data = await this.authService.enable2fa(req.activeUser, dto.code);
    return { data };
  }

  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Post('2fa/disable')
  async disable2fa(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(verify2faSchema)) dto: Verify2faDto,
  ) {
    const data = await this.authService.disable2fa(req.activeUser, dto.code);
    return { data };
  }
}
