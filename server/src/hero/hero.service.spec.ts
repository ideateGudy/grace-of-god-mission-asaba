import { describe, expect, it, vi } from 'vitest';
import { HeroService } from './hero.service.js';
import type { CreateHeroDto } from '@ggm/types';

function createHeroService(options?: { heroes?: Array<Record<string, unknown>>; allowedHosts?: string }) {
  const prisma = {
    hero: {
      findMany: vi.fn().mockResolvedValue(options?.heroes ?? []),
      create: vi.fn().mockResolvedValue({ id: 'new-hero', slides: [] }),
    },
  };
  const audit = { log: vi.fn().mockResolvedValue(undefined) };
  const config = { get: vi.fn((key: string) => key === 'IMAGE_ALLOWED_HOSTS' ? options?.allowedHosts ?? '' : undefined) };
  return {
    service: new HeroService(prisma as never, audit as never, config as never),
    prisma,
  };
}

describe('HeroService', () => {
  it('returns null when there is no eligible public hero', async () => {
    const { service, prisma } = createHeroService();

    await expect(service.getPublicHero()).resolves.toEqual({ data: null });
    expect(prisma.hero.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        published: true,
        OR: [{ startsAt: null }, { startsAt: { lte: expect.any(Date) } }],
      }),
    }));
  });

  it('selects the most recently started eligible hero, then updatedAt for ties', async () => {
    const oldStart = new Date('2026-01-01T00:00:00Z');
    const recentStart = new Date('2026-02-01T00:00:00Z');
    const oldUpdate = new Date('2026-02-02T00:00:00Z');
    const recentUpdate = new Date('2026-02-03T00:00:00Z');
    const { service } = createHeroService({ heroes: [
      { id: 'old', name: 'Old', published: true, startsAt: oldStart, createdAt: oldStart, updatedAt: recentUpdate, endsAt: null, slides: [] },
      { id: 'tie-old', name: 'Earlier update', published: true, startsAt: recentStart, createdAt: oldStart, updatedAt: oldUpdate, endsAt: null, slides: [] },
      { id: 'winner', name: 'Winner', published: true, startsAt: recentStart, createdAt: oldStart, updatedAt: recentUpdate, endsAt: null, slides: [] },
    ] });

    const result = await service.getPublicHero();

    expect(result.data?.id).toBe('winner');
    expect(result.data).not.toHaveProperty('name');
    expect(result.data).not.toHaveProperty('published');
  });

  it('requires at least two slides when publishing a carousel', async () => {
    const { service, prisma } = createHeroService();

    await expect(service.create({ id: 'admin' }, {
      name: 'One slide', mode: 'CAROUSEL', published: true, slides: [{ title: 'Welcome' }],
    } as unknown as CreateHeroDto)).rejects.toThrow('Carousel mode requires at least 2 slides to publish');
    expect(prisma.hero.create).not.toHaveBeenCalled();
  });

  it('blocks published solid-color slides below 4.5:1 contrast', async () => {
    const { service, prisma } = createHeroService();

    await expect(service.create({ id: 'admin' }, {
      name: 'Low contrast', mode: 'SINGLE', published: true,
      slides: [{ title: 'Welcome', bgType: 'COLOR', bgColor: '#FFFFFF', textTone: 'LIGHT' }],
    } as unknown as CreateHeroDto)).rejects.toThrow(/must be at least 4\.5:1 to publish/i);
    expect(prisma.hero.create).not.toHaveBeenCalled();
  });

  it('keeps low-contrast drafts saveable and returns a warning', async () => {
    const { service } = createHeroService();

    await expect(service.create({ id: 'admin' }, {
      name: 'Draft', mode: 'SINGLE', published: false,
      slides: [{ title: 'Welcome', bgType: 'COLOR', bgColor: '#FFFFFF', textTone: 'LIGHT' }],
    } as unknown as CreateHeroDto)).resolves.toMatchObject({ warnings: ['contrast_low'] });
  });

  it('rejects image URLs outside the HTTPS host allowlist', async () => {
    const { service, prisma } = createHeroService({ allowedHosts: 'images.example.test' });

    await expect(service.create({ id: 'admin' }, {
      name: 'Unsafe image', mode: 'SINGLE', published: false,
      slides: [{ title: 'Welcome', bgType: 'IMAGE', imageUrl: 'http://untrusted.example.test/image.jpg' }],
    } as unknown as CreateHeroDto)).rejects.toThrow('Hero image URLs must use HTTPS and a host listed in IMAGE_ALLOWED_HOSTS');
    expect(prisma.hero.create).not.toHaveBeenCalled();
  });
});
