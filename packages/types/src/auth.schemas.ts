import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(256),
}).strict();

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(256),
  newPassword: z.string().min(10).max(256),
}).strict();

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
}).strict();

export type LoginDto = z.infer<typeof loginSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
