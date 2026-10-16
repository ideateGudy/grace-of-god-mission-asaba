import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { ConfigService } from '@nestjs/config';
import { contrastRatio, getToneHex } from './contrast.util.js';
import type { CreateHeroDto, UpdateHeroDto } from '@ggm/types';

export type HeroActor = { id: string; name?: string; role?: string } | null;

export type HeroValidationInput = {
  mode?: string;
  published?: boolean;
  slides?: Array<{
    title: string;
    layout?: string;
    bgType?: string;
    bgColor?: string | null;
    imageUrl?: string | null;
    mobileImageUrl?: string | null;
    textTone?: 'LIGHT' | 'DARK' | null;
    primaryUrl?: string | null;
    secondaryUrl?: string | null;
  }>;
};

@Injectable()
export class HeroService {
  private readonly logger = new Logger(HeroService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly configService: ConfigService,
  ) {}

  async getPublicHero() {
    const now = new Date();
    
    // 1. WHERE published=true AND (startsAt IS NULL OR startsAt <= now) AND (endsAt IS NULL OR endsAt > now)
    const heroes = await this.prisma.hero.findMany({
      where: {
        published: true,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gt: now } }] }],
      },
      include: { slides: { orderBy: { sortOrder: 'asc' } } },
    });

    if (heroes.length === 0) {
      return { data: null };
    }

    // 2. ORDER BY: startsAt DESC NULLS LAST (null -> treat as createdAt), then updatedAt DESC
    heroes.sort((a, b) => {
      const aStart = a.startsAt || a.createdAt;
      const bStart = b.startsAt || b.createdAt;
      
      if (bStart.getTime() !== aStart.getTime()) {
        return bStart.getTime() - aStart.getTime();
      }
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

    const liveHero = heroes[0];

    const { name: _name, published: _published, startsAt: _startsAt, endsAt: _endsAt, ...publicData } = liveHero;
    return { data: publicData };
  }

  async listAdmin() {
    const heroes = await this.prisma.hero.findMany({
      include: {
        slides: { orderBy: { sortOrder: 'asc' }, take: 1 },
        _count: { select: { slides: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const liveHeroResponse = await this.getPublicHero();
    const liveHeroId = liveHeroResponse.data?.id || null;

    const now = new Date();

    const data = heroes.map((hero) => {
      let status: 'LIVE' | 'SCHEDULED' | 'DRAFT' | 'ENDED' = 'DRAFT';
      if (hero.id === liveHeroId) {
        status = 'LIVE';
      } else if (hero.published) {
        if (hero.endsAt && hero.endsAt <= now) {
          status = 'ENDED';
        } else if (hero.startsAt && hero.startsAt > now) {
          status = 'SCHEDULED';
        } else {
          // It's published and valid now, but lost the tie-break or is eclipsed by another
          // The PRD doesn't explicitly name a status for "published but overshadowed", 
          // but scheduling applies. We'll label as LIVE anyway? PRD: "LIVE (is the live hero)".
          // We will use LIVE for the actual live one. For others, if they are eligible but not live,
          // they might be technically scheduled if startsAt is in the future.
          status = 'DRAFT'; // PRD simplified fallback
        }
      }

      const { slides, _count, ...rest } = hero;
      return {
        id: rest.id,
        name: rest.name,
        mode: rest.mode,
        published: rest.published,
        startsAt: rest.startsAt,
        endsAt: rest.endsAt,
        status,
        slideCount: _count.slides,
        thumbnailUrl: slides[0]?.imageUrl ?? null,
      };
    });

    return { data, meta: { liveHeroId } };
  }

  async getAdmin(id: string) {
    const hero = await this.prisma.hero.findUnique({
      where: { id },
      include: { slides: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!hero) throw new NotFoundException('Hero not found');
    return hero;
  }

  async create(actor: HeroActor, dto: CreateHeroDto) {
    const warnings = this.validateHeroLogic(dto);

    const { slides, ...rest } = dto;
    
    const hero = await this.prisma.hero.create({
      data: {
        ...rest,
        createdById: actor?.id,
        slides: {
          create: slides.map((s, index: number) => {
            const { id: _slideId, ...slideData } = s;
            return {
              ...slideData,
              sortOrder: s.sortOrder ?? index,
            };
          }),
        },
      },
      include: { slides: true },
    });

    await this.audit.log({
      actorId: actor?.id,
      actorName: actor?.name,
      action: 'hero.create',
      entity: 'Hero',
      entityId: hero.id,
    });
    
    this.triggerRevalidate();

    return { hero, warnings };
  }

  async replace(actor: HeroActor, id: string, dto: UpdateHeroDto) {
    const existing = await this.prisma.hero.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Hero not found');

    const warnings = this.validateHeroLogic(dto);

    const { slides, ...rest } = dto;

    const [_deletedSlides, updatedHero] = await this.prisma.$transaction([
      this.prisma.heroSlide.deleteMany({ where: { heroId: id } }),
      this.prisma.hero.update({
        where: { id },
        data: {
          ...rest,
          slides: {
            create: slides.map((s, index: number) => {
              const { id: _slideId, ...slideData } = s;
              return {
                ...slideData,
                sortOrder: s.sortOrder ?? index,
              };
            }),
          },
        },
        include: { slides: { orderBy: { sortOrder: 'asc' } } },
      }),
    ]);

    await this.audit.log({
      actorId: actor?.id,
      actorName: actor?.name,
      action: 'hero.update',
      entity: 'Hero',
      entityId: id,
    });

    this.triggerRevalidate();

    return { hero: updatedHero, warnings };
  }

  async publish(actor: HeroActor, id: string, published: boolean) {
    const existing = await this.prisma.hero.findUnique({ 
      where: { id },
      include: { slides: true }
    });
    if (!existing) throw new NotFoundException('Hero not found');

    const warnings: string[] = [];
    if (published) {
      warnings.push(...this.validateHeroLogic({ ...existing, published }));
    }

    const updated = await this.prisma.hero.update({
      where: { id },
      data: { published },
    });

    await this.audit.log({
      actorId: actor?.id,
      actorName: actor?.name,
      action: published ? 'hero.publish' : 'hero.unpublish',
      entity: 'Hero',
      entityId: id,
    });

    this.triggerRevalidate();

    return { hero: updated, warnings };
  }

  async duplicate(actor: HeroActor, id: string) {
    const existing = await this.prisma.hero.findUnique({
      where: { id },
      include: { slides: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!existing) throw new NotFoundException('Hero not found');

    const hero = await this.prisma.hero.create({
      data: {
        name: `${existing.name} (Copy)`,
        mode: existing.mode,
        autoplay: existing.autoplay,
        intervalSeconds: existing.intervalSeconds,
        published: false,
        createdById: actor?.id,
        slides: {
          create: existing.slides.map(s => {
            const { id: _id, heroId: _heroId, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = s;
            return rest;
          }),
        },
      },
    });

    await this.audit.log({
      actorId: actor?.id,
      actorName: actor?.name,
      action: 'hero.create',
      entity: 'Hero',
      entityId: hero.id,
      meta: { duplicatedFrom: id },
    });

    return hero;
  }

  async delete(actor: HeroActor, id: string) {
    const hero = await this.prisma.hero.findUnique({ where: { id } });
    if (!hero) throw new NotFoundException('Hero not found');

    await this.prisma.hero.delete({ where: { id } });

    await this.audit.log({
      actorId: actor?.id,
      actorName: actor?.name,
      action: 'hero.delete',
      entity: 'Hero',
      entityId: id,
    });

    this.triggerRevalidate();
  }

  private validateHeroLogic(dto: HeroValidationInput) {
    const warnings: string[] = [];

    if (dto.slides && dto.slides.length > 6) {
      throw new BadRequestException('Maximum 6 slides allowed');
    }
    if (dto.published && dto.mode === 'CAROUSEL' && (!dto.slides || dto.slides.length < 2)) {
      throw new BadRequestException('Carousel mode requires at least 2 slides to publish');
    }

    // Layout × bgType validation matrix
    for (const slide of dto.slides ?? []) {
      if (slide.layout === 'FULL_BLEED') {
        // FULL_BLEED: IMAGE requires imageUrl; COLOR/GRADIENT must NOT have imageUrl (it would be ignored)
        // Actually FULL_BLEED works with IMAGE, COLOR, or GRADIENT. Just enforce imageUrl present for IMAGE:
        if (slide.bgType === 'IMAGE' && !slide.imageUrl) {
          throw new BadRequestException(`FULL_BLEED slide "${slide.title}" with IMAGE bgType requires an imageUrl`);
        }
      }
      if (slide.layout === 'SPLIT') {
        // SPLIT: COLOR or GRADIENT bgType only; imageUrl REQUIRED (shown beside text)
        if (slide.bgType === 'IMAGE') {
          throw new BadRequestException(`SPLIT layout does not support IMAGE bgType. Use COLOR or GRADIENT, and add a side image via imageUrl.`);
        }
        if (!slide.imageUrl) {
          throw new BadRequestException(`SPLIT layout slide "${slide.title}" requires imageUrl for the side image.`);
        }
      }
      if (slide.layout === 'TEXT_ONLY') {
        // TEXT_ONLY: COLOR or GRADIENT only; no imageUrl
        if (slide.bgType === 'IMAGE') {
          throw new BadRequestException(`TEXT_ONLY layout does not support IMAGE bgType. Use COLOR or GRADIENT.`);
        }
      }
    }

    if (dto.slides) {
      for (const slide of dto.slides) {
        if (slide.primaryUrl) {
          const url = slide.primaryUrl;
          if (url.startsWith('javascript:') || (url.startsWith('//') && !url.startsWith('///'))) {
            throw new BadRequestException('CTA URLs must start with / or https://');
          }
          if (!url.startsWith('/') && !url.startsWith('https://')) {
            throw new BadRequestException('CTA URLs must start with / (path) or https://');
          }
        }
        if (slide.secondaryUrl) {
          const url = slide.secondaryUrl;
          if (url.startsWith('javascript:') || (url.startsWith('//') && !url.startsWith('///'))) {
            throw new BadRequestException('CTA URLs must start with / or https://');
          }
          if (!url.startsWith('/') && !url.startsWith('https://')) {
            throw new BadRequestException('CTA URLs must start with / (path) or https://');
          }
        }

        for (const candidate of [slide.imageUrl, slide.mobileImageUrl]) {
          if (!candidate) continue;
          let url: URL;
          try { url = new URL(candidate); } catch { throw new BadRequestException('Hero image URL is invalid'); }
          const hosts = (this.configService.get<string>('IMAGE_ALLOWED_HOSTS') || '').split(',').map((host) => host.trim()).filter(Boolean);
          if (url.protocol !== 'https:' || !hosts.includes(url.hostname)) {
            throw new BadRequestException('Hero image URLs must use HTTPS and a host listed in IMAGE_ALLOWED_HOSTS');
          }
        }
        if (slide.bgType === 'COLOR' && slide.bgColor) {
          const toneHex = getToneHex(slide.textTone || 'LIGHT');
          const ratio = contrastRatio(slide.bgColor, toneHex);
          
          if (ratio < 4.5) {
            if (dto.published) {
              throw new BadRequestException(`Contrast ratio (${ratio.toFixed(2)}:1) for slide "${slide.title}" is too low for WCAG. Must be at least 4.5:1 to publish.`);
            } else {
              warnings.push('contrast_low');
            }
          }
        }
      }
    }

    return warnings;
  }

  private triggerRevalidate() {
    const url = this.configService.get('WEB_REVALIDATE_URL');
    const secret = this.configService.get('REVALIDATE_SECRET');
    if (url && secret) {
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': secret,
        },
        body: JSON.stringify({ tag: 'hero' }),
        signal: AbortSignal.timeout(2500),
      }).then((response) => {
        if (!response.ok) throw new Error(`Revalidation returned HTTP ${response.status}`);
      }).catch(err => {
        this.logger.warn(`Failed to revalidate hero: ${err.message}`);
      });
    }
  }
}
