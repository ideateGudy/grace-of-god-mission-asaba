import { z } from 'zod';

export const createSermonSchema = z.object({
  slug: z.string().trim().min(1).max(180).nullable().optional(),
  title: z.string().trim().min(1).max(160),
  preacher: z.string().trim().min(1).max(120),
  preachedAt: z.string().datetime(),
  scripture: z.string().nullable().optional(),
  series: z.string().nullable().optional(),
  videoUrl: z.string().url().nullable().optional(),
  audioUrl: z.string().url().nullable().optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
  description: z.string().max(10000).nullable().optional(),
  published: z.boolean().default(true)
}).strict();

export type SermonDto = z.infer<typeof createSermonSchema> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export const createEventSchema = z.object({
  slug: z.string().trim().min(1).max(180).nullable().optional(),
  title: z.string().trim().min(1).max(160),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().nullable().optional(),
  venue: z.string().trim().min(1).max(180),
  address: z.string().max(500).nullable().optional(),
  mapUrl: z.string().url().nullable().optional(),
  description: z.string().max(10000).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  published: z.boolean().default(true)
}).strict();

export type EventDto = z.infer<typeof createEventSchema> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(10000),
  pinned: z.boolean().default(false),
  publishFrom: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  published: z.boolean().default(true)
}).strict();

export type AnnouncementDto = z.infer<typeof createAnnouncementSchema> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export const createGalleryImageSchema = z.object({
  imageUrl: z.string().url(),
  caption: z.string().max(500).nullable().optional(),
  album: z.string().max(120).nullable().optional(),
  width: z.number().int().nullable().optional(),
  height: z.number().int().nullable().optional(),
  sortOrder: z.number().int().default(0),
  published: z.boolean().default(true)
}).strict();

export const reorderGallerySchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(500).refine((ids) => new Set(ids).size === ids.length, 'Image ids must be unique'),
}).strict();

export type CreateSermonDto = z.infer<typeof createSermonSchema>;
export type UpdateSermonDto = Partial<CreateSermonDto>;

export type CreateEventDto = z.infer<typeof createEventSchema>;
export type UpdateEventDto = Partial<CreateEventDto>;

export type CreateAnnouncementDto = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementDto = Partial<CreateAnnouncementDto>;

export type CreateGalleryImageDto = z.infer<typeof createGalleryImageSchema>;
export type UpdateGalleryImageDto = Partial<CreateGalleryImageDto>;
export type ReorderGalleryDto = z.infer<typeof reorderGallerySchema>;

export type GalleryImageDto = CreateGalleryImageDto & {
  id: string;
  createdAt: string;
};
