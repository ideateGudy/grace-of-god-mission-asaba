import { z } from 'zod';

export const heroSlideSchema = z.object({
  id: z.string().optional(),
  sortOrder: z.number().int().default(0),
  layout: z.enum(['FULL_BLEED', 'SPLIT', 'TEXT_ONLY']),
  align: z.enum(['START', 'CENTER', 'END']),
  title: z.string().trim().min(1).max(80),
  subtitle: z.string().max(200).nullable(),
  primaryLabel: z.string().nullable(),
  primaryUrl: z.string().nullable(),
  secondaryLabel: z.string().nullable(),
  secondaryUrl: z.string().nullable(),
  bgType: z.enum(['IMAGE', 'COLOR', 'GRADIENT']),
  bgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable(),
  bgGradient: z.enum([
    'dawn',
    'daybreak',
    'glow',
    'majesty',
    'celestial',
    'radiance',
    'serenity',
    'parchment',
    'milk-gold',
    'milk-sky',
    'milk-rose',
    'milk-olive',
  ]).nullable(),
  imageUrl: z.string().url().nullable(),
  mobileImageUrl: z.string().url().nullable(),
  imageAlt: z.string().nullable(),
  imageDecorative: z.boolean().default(false),
  focalX: z.number().int().min(0).max(100).default(50),
  focalY: z.number().int().min(0).max(100).default(50),
  overlay: z.number().int().min(0).max(80).default(40),
  textTone: z.enum(['LIGHT', 'DARK'])
}).superRefine((data, ctx) => {
  // FULL_BLEED requires IMAGE (or COLOR/GRADIENT with no imageUrl)
  if (data.layout === 'FULL_BLEED') {
    if (data.bgType === 'IMAGE' && !data.imageUrl) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Image URL is required for FULL_BLEED with IMAGE background.', path: ['imageUrl'] });
    }
    if (data.bgType !== 'IMAGE' && data.imageUrl) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Image URL should not be provided for FULL_BLEED without IMAGE background.', path: ['imageUrl'] });
    }
  }

  // SPLIT requires COLOR or GRADIENT + image required
  if (data.layout === 'SPLIT') {
    if (data.bgType === 'IMAGE') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'SPLIT layout requires COLOR or GRADIENT background type.', path: ['bgType'] });
    }
    if (!data.imageUrl) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Image URL is required for SPLIT layout.', path: ['imageUrl'] });
    }
  }

  // TEXT_ONLY requires COLOR or GRADIENT, no image
  if (data.layout === 'TEXT_ONLY') {
    if (data.bgType === 'IMAGE') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'TEXT_ONLY layout requires COLOR or GRADIENT background type.', path: ['bgType'] });
    }
    if (data.imageUrl) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Image URL should not be provided for TEXT_ONLY layout.', path: ['imageUrl'] });
    }
  }
});

export type HeroSlideDto = z.infer<typeof heroSlideSchema>;

export const heroSchema = z.object({
  id: z.string(),
  name: z.string(),
  mode: z.enum(['SINGLE', 'CAROUSEL']),
  autoplay: z.boolean().default(false),
  intervalSeconds: z.number().int().min(5).max(15).default(7),
  published: z.boolean().default(false),
  startsAt: z.string().nullable(),
  endsAt: z.string().nullable(),
  slides: z.array(heroSlideSchema).min(1).max(6)
});

export type HeroDto = z.infer<typeof heroSchema>;
export type PublicHero = Omit<HeroDto, 'name' | 'published' | 'startsAt' | 'endsAt'>;
export type HeroListItem = Pick<HeroDto, 'id' | 'name' | 'mode' | 'published' | 'startsAt' | 'endsAt'> & {
  status: 'LIVE' | 'SCHEDULED' | 'DRAFT' | 'ENDED';
  slideCount: number;
  thumbnailUrl: string | null;
};

export const heroLayoutBgMatrix = {
  FULL_BLEED: ['IMAGE', 'COLOR', 'GRADIENT'],
  SPLIT: ['COLOR', 'GRADIENT'],
  TEXT_ONLY: ['COLOR', 'GRADIENT'],
} as const;

const heroInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  mode: z.enum(['SINGLE', 'CAROUSEL']),
  autoplay: z.boolean().default(false),
  intervalSeconds: z.number().int().min(5).max(15).default(7),
  published: z.boolean().default(false),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  slides: z.array(heroSlideSchema).min(1).max(6),
}).superRefine((hero, ctx) => {
  if (hero.startsAt && hero.endsAt && new Date(hero.endsAt) <= new Date(hero.startsAt)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'End time must be after start time', path: ['endsAt'] });
  }
  if (hero.published && hero.mode === 'CAROUSEL' && hero.slides.length < 2) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'A published carousel needs at least two slides', path: ['slides'] });
  }
  hero.slides.forEach((slide, index) => {
    for (const key of ['primaryUrl', 'secondaryUrl'] as const) {
      const url = slide[key];
      if (url && !url.startsWith('/') && !/^https:\/\//i.test(url)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'CTA links must use a site path or HTTPS URL', path: ['slides', index, key] });
      }
    }
  });
});

export const createHeroSchema = heroInputSchema;
export const updateHeroSchema = heroInputSchema;
export const publishHeroSchema = z.object({ published: z.boolean() }).strict();
export type CreateHeroDto = z.infer<typeof createHeroSchema>;
export type UpdateHeroDto = z.infer<typeof updateHeroSchema>;
export type PublishHeroDto = z.infer<typeof publishHeroSchema>;
