import { z } from 'zod';

export const createDevotionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  title: z.string().trim().min(2, 'Title is required').max(200),
  scriptureRef: z.string().trim().min(1, 'Scripture reference is required').max(120),
  scriptureText: z.string().trim().min(1, 'Scripture text is required').max(2000),
  content: z.string().trim().min(10, 'Reflection content is required').max(10000),
  prayer: z.string().trim().max(2000).optional().or(z.literal('')),
  published: z.boolean().optional().default(true),
}).strict();

export type CreateDevotionDto = z.infer<typeof createDevotionSchema>;

export const updateDevotionSchema = createDevotionSchema.partial().strict();
export type UpdateDevotionDto = z.infer<typeof updateDevotionSchema>;

export type DevotionDto = {
  id: string;
  date: string;
  title: string;
  scriptureRef: string;
  scriptureText: string;
  content: string;
  prayer: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};
