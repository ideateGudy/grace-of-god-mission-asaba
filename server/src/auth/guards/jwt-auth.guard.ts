import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public-route.decorator.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    let token: string | undefined;

    // 1. Support Authorization: Bearer <token>
    const authHeader = request.headers.authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }

    // 2. Support gom_session cookie
    if (!token && request.headers.cookie) {
      const match = request.headers.cookie.match(/gom_session=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    if (!token) {
      throw new UnauthorizedException('No session token found');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      if (payload.type === 'refresh') {
        throw new UnauthorizedException('Invalid token type for access session');
      }
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }
  }
}
