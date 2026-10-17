import { z } from 'zod';

export const createDevotionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  series: z.string().trim().max(100).optional().default('DAILY GRACE'),
  title: z.string().trim().min(2, 'Title is required').max(200),
  textRef: z.string().trim().max(150).optional().or(z.literal('')),
  scriptureRef: z.string().trim().min(1, 'Verse of the Day reference is required').max(120),
  scriptureText: z.string().trim().min(1, 'Verse of the Day text is required').max(2000),
  content: z.string().trim().min(10, 'Reflection content is required').max(15000),
  prayer: z.string().trim().max(3000).optional().or(z.literal('')),
  bibleIn365Days: z.string().trim().max(2000).optional().or(z.literal('')),
  actionPoint: z.string().trim().max(1000).optional().or(z.literal('')),
  published: z.boolean().optional().default(true),
}).strict();

export type CreateDevotionDto = z.infer<typeof createDevotionSchema>;

export const updateDevotionSchema = createDevotionSchema.partial().strict();
export type UpdateDevotionDto = z.infer<typeof updateDevotionSchema>;

export type DevotionDto = {
  id: string;
  date: string;
  series: string | null;
  title: string;
  textRef: string | null;
  scriptureRef: string;
  scriptureText: string;
  content: string;
  prayer: string | null;
  bibleIn365Days: string | null;
  actionPoint: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

