import { z } from 'zod';
import { Permission } from './permissions.js';

export const createAdminUserSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  permissions: z.array(z.nativeEnum(Permission)).max(Object.keys(Permission).length),
}).strict();

export const updateAdminUserSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  permissions: z.array(z.nativeEnum(Permission)).max(Object.keys(Permission).length).optional(),
  isActive: z.boolean().optional(),
}).strict().refine((data) => Object.keys(data).length > 0, 'At least one field is required');

export type CreateAdminUserDto = z.infer<typeof createAdminUserSchema>;
export type UpdateAdminUserDto = z.infer<typeof updateAdminUserSchema>;
