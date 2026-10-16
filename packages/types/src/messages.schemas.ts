import { z } from 'zod';
import { Permission } from './permissions.js';

export const createContactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().email().nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  message: z.string().trim().min(1).max(2000),
  honeypot: z.string().max(500).optional(),
  turnstileToken: z.string().max(2048).optional(),
  consent: z.boolean().refine((value) => value, "Consent is required"),
}).strict().refine(data => data.email || data.phone, {
  message: "Either email or phone must be provided",
  path: ["email"]
});

export type CreateContactDto = z.infer<typeof createContactSchema>;

export type ContactMessageDto = CreateContactDto & {
  id: string;
  status: 'NEW' | 'READ' | 'ARCHIVED';
  createdAt: string;
};

export const createPrayerSchema = z.object({
  name: z.string().trim().max(120).nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  request: z.string().trim().min(1).max(2000),
  honeypot: z.string().max(500).optional(),
  turnstileToken: z.string().max(2048).optional(),
  consent: z.boolean().refine((value) => value, "Consent is required"),
}).strict();

export type CreatePrayerDto = z.infer<typeof createPrayerSchema>;

export type PrayerRequestDto = CreatePrayerDto & {
  id: string;
  status: 'NEW' | 'READ' | 'ARCHIVED';
  createdAt: string;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  permissions: Permission[];
  mustChangePassword: boolean;
  twoFactorEnabled?: boolean;
};

export type AdminUserDto = SessionUser & {
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export type AuditLogDto = {
  id: string;
  actorId: string | null;
  actorName: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
};
