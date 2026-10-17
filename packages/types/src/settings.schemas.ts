import { z } from 'zod';

const optionalUrlSchema = z.preprocess((val) => {
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}, z.string().url().nullable().optional().or(z.literal('')));

export const leaderProfileSchema = z.object({
  name: z.string().trim().min(1, 'Leader name is required').max(120),
  title: z.string().trim().min(1, 'Title or pastoral role is required').max(120),
  bio: z.string().trim().max(1000).optional().or(z.literal('')),
  imageUrl: optionalUrlSchema,
});

export type LeaderProfileDto = z.infer<typeof leaderProfileSchema>;

export const updateSiteSettingsSchema = z.object({
  churchName: z.string().trim().min(1).max(160),
  phone: z.string().trim().min(1).max(40),
  email: z.string().trim().email().max(120),
  address: z.string().trim().min(1).max(255),
  whatsapp: z.string().trim().min(1).max(40),
  bankName: z.string().trim().min(1).max(80),
  accountName: z.string().trim().min(1).max(120),
  accountNumber: z.string().trim().min(1).max(40),
  googleMapsUrl: optionalUrlSchema,
  facebookUrl: optionalUrlSchema,
  tiktokUrl: optionalUrlSchema,
  youtubeUrl: optionalUrlSchema,
  instagramUrl: optionalUrlSchema,
  leadership: z.array(leaderProfileSchema).optional().default([]),
}).strict();

export type UpdateSiteSettingsDto = z.infer<typeof updateSiteSettingsSchema>;

export type SiteSettingsDto = UpdateSiteSettingsDto & {
  id: string;
  updatedAt: string;
};
