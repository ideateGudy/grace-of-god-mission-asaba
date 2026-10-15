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
  user: AdminUser;
  cookieOptions: CookieOptions;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly audit: AuditService,
  ) {}

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

    const expiresIn = user.role === 'SUPER_ADMIN'
      ? '4h'
      : this.configService.get('JWT_EXPIRES_IN');

    const payload = { sub: user.id, role: user.role, tv: user.tokenVersion };
    const token = await this.jwtService.signAsync(payload, { expiresIn });

    void this.audit.log({
      actorId: user.id,
      actorName: user.name,
      action: 'auth.login',
      entity: 'AdminUser',
      entityId: user.id,
    });

    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    };

    return { token, user, cookieOptions };
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

    const expiresIn = user.role === 'SUPER_ADMIN'
      ? '4h'
      : this.configService.get('JWT_EXPIRES_IN');

    const payload = { sub: updatedUser.id, role: updatedUser.role, tv: updatedUser.tokenVersion };
    const token = await this.jwtService.signAsync(payload, { expiresIn });

    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
    };

    return { token, user: updatedUser, cookieOptions };
  }
}
