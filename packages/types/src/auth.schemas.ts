import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(256),
  twoFactorCode: z.string().trim().regex(/^\d{6}$/, "Must be a 6-digit code").optional(),
}).strict();

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(256),
  newPassword: z.string().min(10).max(256),
}).strict();

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
}).strict();

export const verify2faSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, "Code must be 6 digits"),
}).strict();

export type LoginDto = z.infer<typeof loginSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
export type Verify2faDto = z.infer<typeof verify2faSchema>;

