import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventsService } from './events.service.js';

describe('EventsService', () => {
  const event = { findMany: vi.fn(), count: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn() };
  const audit = { log: vi.fn().mockResolvedValue(undefined) };
  const service = new EventsService({ event } as never, audit as never);

  beforeEach(() => vi.clearAllMocks());

  it('lists only published upcoming events by ascending start time', async () => {
    event.findMany.mockResolvedValue([{ id: 'upcoming' }]);
    event.count.mockResolvedValue(1);

    const result = await service.listPublic('upcoming', 2, 5);

    expect(result).toEqual({ data: [{ id: 'upcoming' }], meta: { page: 2, limit: 5, total: 1 } });
    expect(event.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { published: true, startsAt: { gte: expect.any(Date) } },
      orderBy: { startsAt: 'asc' }, skip: 5, take: 5,
    }));
  });

  it('does not expose an unpublished event by slug', async () => {
    event.findFirst.mockResolvedValue(null);

    await expect(service.getPublicBySlug('draft-event')).rejects.toBeInstanceOf(NotFoundException);
    expect(event.findFirst).toHaveBeenCalledWith({ where: { slug: 'draft-event', published: true } });
  });

  it('normalizes event URLs and generates a slug from the title on creation', async () => {
    event.findUnique.mockResolvedValue(null);
    event.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({ id: 'event-1', ...data }));

    await service.create({ id: 'admin-1' }, {
      title: 'Sunday Worship & Praise', startsAt: new Date('2026-12-01T10:00:00Z'),
      mapUrl: 'maps.example.test/church', imageUrl: 'https://images.example.test/event.jpg', published: false,
    });

    expect(event.create).toHaveBeenCalledWith({ data: expect.objectContaining({
      slug: 'sunday-worship-praise',
      mapUrl: 'https://maps.example.test/church',
      imageUrl: 'https://images.example.test/event.jpg',
    }) });
  });
});
