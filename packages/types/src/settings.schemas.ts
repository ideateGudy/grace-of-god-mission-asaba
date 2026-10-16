import { z } from 'zod';

export const updateSiteSettingsSchema = z.object({
  churchName: z.string().trim().min(1).max(160),
  phone: z.string().trim().min(1).max(40),
  email: z.string().trim().email().max(120),
  address: z.string().trim().min(1).max(255),
  whatsapp: z.string().trim().min(1).max(40),
  bankName: z.string().trim().min(1).max(80),
  accountName: z.string().trim().min(1).max(120),
  accountNumber: z.string().trim().min(1).max(40),
  googleMapsUrl: z.string().trim().url().nullable().optional().or(z.literal('')),
  facebookUrl: z.string().trim().url().nullable().optional().or(z.literal('')),
  youtubeUrl: z.string().trim().url().nullable().optional().or(z.literal('')),
  instagramUrl: z.string().trim().url().nullable().optional().or(z.literal('')),
}).strict();

export type UpdateSiteSettingsDto = z.infer<typeof updateSiteSettingsSchema>;

export type SiteSettingsDto = UpdateSiteSettingsDto & {
  id: string;
  updatedAt: string;
};
