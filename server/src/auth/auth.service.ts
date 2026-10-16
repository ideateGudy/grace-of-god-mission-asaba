import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';
import type { AdminUser } from '@prisma/client';
import type { LoginDto, ChangePasswordDto, SessionUser } from '@ggm/types';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import type { AuthenticatedActor } from '../common/types.js';
import * as bcrypt from 'bcrypt';

export interface AuthResult {
  token: string;
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
  cookieOptions: CookieOptions;
  accessCookieOptions: CookieOptions;
  refreshCookieOptions: CookieOptions;
}

function parseDurationToMs(durationStr: string | undefined, defaultMs: number): number {
  if (!durationStr) return defaultMs;
  const match = durationStr.trim().match(/^(\d+)\s*(s|m|h|d|w)?$/i);
  if (!match) return defaultMs;
  const value = parseInt(match[1], 10);
  const unit = (match[2] || 's').toLowerCase();
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'w': return value * 7 * 24 * 60 * 60 * 1000;
    default: return defaultMs;
  }
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly audit: AuditService,
  ) {}

  private getCookieOptions(): {
    accessCookieOptions: CookieOptions;
    refreshCookieOptions: CookieOptions;
  } {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const accessDuration =
      this.configService.get('JWT_ACCESS_EXPIRES_IN') ||
      this.configService.get('JWT_EXPIRES_IN') ||
      '15m';
    const refreshDuration =
      this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d';

    const accessCookieOptions: CookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: parseDurationToMs(accessDuration, 15 * 60 * 1000),
    };
    const refreshCookieOptions: CookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: parseDurationToMs(refreshDuration, 7 * 24 * 60 * 60 * 1000),
    };
    return { accessCookieOptions, refreshCookieOptions };
  }

  private async generateTokens(user: AdminUser): Promise<{ accessToken: string; refreshToken: string }> {
    const accessExpiresIn =
      this.configService.get('JWT_ACCESS_EXPIRES_IN') ||
      this.configService.get('JWT_EXPIRES_IN') ||
      '15m';
    const refreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d';

    const accessPayload = {
      sub: user.id,
      role: user.role,
      tv: user.tokenVersion,
      type: 'access',
    };

    const refreshPayload = {
      sub: user.id,
      tv: user.tokenVersion,
      type: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, { expiresIn: accessExpiresIn }),
      this.jwtService.signAsync(refreshPayload, { expiresIn: refreshExpiresIn }),
    ]);

    return { accessToken, refreshToken };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.prisma.adminUser.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // Always do bcrypt compare to avoid timing attacks
    const isMatch = user
      ? await bcrypt.compare(dto.password, user.passwordHash)
      : await bcrypt.compare(dto.password, '$2b$12$invalidhashfortimingnormalization');

    if (!user || !user.isActive || !isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update lastLoginAt
    await this.prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { accessToken, refreshToken } = await this.generateTokens(user);
    const { accessCookieOptions, refreshCookieOptions } = this.getCookieOptions();

    void this.audit.log({
      actorId: user.id,
      actorName: user.name,
      action: 'auth.login',
      entity: 'AdminUser',
      entityId: user.id,
    });

    return {
      token: accessToken,
      accessToken,
      refreshToken,
      user,
      cookieOptions: accessCookieOptions,
      accessCookieOptions,
      refreshCookieOptions,
    };
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    let payload: { sub: string; tv: number; type?: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type for refresh');
    }

    const user = await this.prisma.adminUser.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account is inactive or not found');
    }

    if (user.tokenVersion !== payload.tv) {
      throw new UnauthorizedException('Session expired');
    }

    const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user);
    const { accessCookieOptions, refreshCookieOptions } = this.getCookieOptions();

    void this.audit.log({
      actorId: user.id,
      actorName: user.name,
      action: 'auth.refresh',
      entity: 'AdminUser',
      entityId: user.id,
    });

    return {
      token: accessToken,
      accessToken,
      refreshToken: newRefreshToken,
      user,
      cookieOptions: accessCookieOptions,
      accessCookieOptions,
      refreshCookieOptions,
    };
  }

  async logout(user: AuthenticatedActor): Promise<void> {
    void this.audit.log({
      actorId: user.id,
      actorName: user.name,
      action: 'auth.logout',
      entity: 'AdminUser',
      entityId: user.id,
    });
  }

  async me(user: AuthenticatedActor): Promise<SessionUser> {
    return {
      id: user.id,
      email: user.email ?? '',
      name: user.name ?? '',
      role: (user.role ?? 'ADMIN') as SessionUser['role'],
      permissions: (user.permissions ?? []) as unknown as SessionUser['permissions'],
      mustChangePassword: user.mustChangePassword ?? false,
    };
  }

  async changePassword(user: AdminUser, dto: ChangePasswordDto): Promise<AuthResult> {
    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid current password');
    }

    const minLength = user.role === 'SUPER_ADMIN' ? 12 : 10;
    if (dto.newPassword.length < minLength) {
      throw new BadRequestException(`Password must be at least ${minLength} characters long`);
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    const newTokenVersion = user.tokenVersion + 1;

    const updatedUser = await this.prisma.adminUser.update({
      where: { id: user.id },
      data: {
        passwordHash,
        tokenVersion: newTokenVersion,
        mustChangePassword: false,
      },
    });

    void this.audit.log({
      actorId: user.id,
      actorName: user.name,
      action: 'auth.change_password',
      entity: 'AdminUser',
      entityId: user.id,
    });

    const { accessToken, refreshToken } = await this.generateTokens(updatedUser);
    const { accessCookieOptions, refreshCookieOptions } = this.getCookieOptions();

    return {
      token: accessToken,
      accessToken,
      refreshToken,
      user: updatedUser,
      cookieOptions: accessCookieOptions,
      accessCookieOptions,
      refreshCookieOptions,
    };
  }
}
