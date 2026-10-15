import type { Request, Response } from 'express';
import type { AdminRole, Permission, AdminUser } from '@prisma/client';

export interface AuthenticatedActor {
  id: string;
  name?: string;
  email?: string;
  role?: AdminRole;
  permissions?: Permission[];
  isActive?: boolean;
  mustChangePassword?: boolean;
}

export interface AuthenticatedRequest extends Request {
  activeUser: AdminUser;
}

export type ExpressResponse = Response;
