import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public-route.decorator.js';

@Injectable()
export class MustChangePasswordGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const path = request.path;
    
    // Check if it's an /auth/ endpoint
    if (path.startsWith('/api/v1/auth/')) {
      return true;
    }

    const activeUser = request.activeUser;
    
    if (activeUser && activeUser.mustChangePassword) {
      throw new ForbiddenException('You must change your password before continuing.');
    }

    return true;
  }
}
