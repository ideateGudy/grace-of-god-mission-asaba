import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator.js';
import { SUPER_ADMIN_ONLY_KEY } from '../decorators/super-admin-only.decorator.js';
import { IS_PUBLIC_KEY } from '../decorators/public-route.decorator.js';
import { AdminRole, Permission } from '@prisma/client';

@Injectable()
export class PermissionsGuard implements CanActivate {
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
    const activeUser = request.activeUser;
    
    if (!activeUser) {
      throw new ForbiddenException('User context missing');
    }

    if (activeUser.role === AdminRole.SUPER_ADMIN) {
      return true;
    }

    const isSuperAdminOnly = this.reflector.getAllAndOverride<boolean>(SUPER_ADMIN_ONLY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isSuperAdminOnly) {
      throw new ForbiddenException('Super admin required');
    }

    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If route is not public, not super-admin only, and has no permissions, it's default deny!
    // But /auth/me and similar should not be blocked if they don't have permissions, so maybe those are allowed.
    // Actually, "default-deny: every /admin/* route must have @RequirePermissions(...) or @SuperAdminOnly()."
    const path = request.path;
    if (path.startsWith('/api/v1/admin/')) {
      if (!requiredPermissions && !isSuperAdminOnly && !isPublic) {
        throw new ForbiddenException('Missing route permissions configuration');
      }
    }

    if (!requiredPermissions) {
      return true; // e.g. /auth/me or non-admin routes
    }

    if (requiredPermissions.length === 0) {
      return true; // Authenticated routes with filtered, caller-specific responses such as dashboard stats.
    }

    const userPermissions = new Set(activeUser.permissions);
    const hasPermission = requiredPermissions.some((permission) => userPermissions.has(permission));

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
