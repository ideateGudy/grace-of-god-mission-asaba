import { z } from 'zod';
import { Permission } from './permissions.js';

export const createContactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().email().nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  message: z.string().trim().min(1).max(2000),
  honeypot: z.string().max(500).optional(),
  consent: z.boolean().refine((value) => value, "Consent is required"),
}).strict().refine(data => data.email || data.phone, {
  message: "Either email or phone must be provided",
  path: ["email"]
});

export type ContactMessageDto = z.infer<typeof createContactSchema> & {
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
  consent: z.boolean().refine((value) => value, "Consent is required"),
}).strict();

export type PrayerRequestDto = z.infer<typeof createPrayerSchema> & {
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
  meta: any;
  createdAt: string;
};
