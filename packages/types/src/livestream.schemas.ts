import { z } from 'zod';

const optionalUrlSchema = z.preprocess((val) => {
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}, z.string().url().nullable().optional().or(z.literal('')));

export const updateLivestreamSchema = z.object({
  isLive: z.boolean(),
  liveTitle: z.string().trim().max(200).optional().or(z.literal('')),
  liveServiceType: z.string().trim().max(120).optional().or(z.literal('')),
  liveVideoUrl: optionalUrlSchema,
  liveNotes: z.string().trim().max(5000).optional().or(z.literal('')),
}).strict();

export type UpdateLivestreamDto = z.infer<typeof updateLivestreamSchema>;

export type LivestreamStatusDto = {
  isLive: boolean;
  liveTitle: string | null;
  liveServiceType: string | null;
  liveVideoUrl: string | null;
  liveNotes: string | null;
  updatedAt: string;
};
