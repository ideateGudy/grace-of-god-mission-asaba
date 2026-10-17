import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DevotionsService } from './devotions.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { AuditService } from '../audit/audit.service.js';
import type { ConfigService } from '@nestjs/config';

describe('DevotionsService', () => {
  let service: DevotionsService;
  let prismaMock: any;
  let auditMock: any;
  let configMock: any;

  beforeEach(() => {
    prismaMock = {
      devotion: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        upsert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    auditMock = {
      log: vi.fn().mockResolvedValue(undefined),
    };
    configMock = {
      get: vi.fn(),
    };

    service = new DevotionsService(
      prismaMock as unknown as PrismaService,
      auditMock as unknown as AuditService,
      configMock as unknown as ConfigService,
    );
  });

  it('returns today devotion when available', async () => {
    const mockDevotion = {
      id: 'dev-1',
      date: new Date('2026-10-17T00:00:00.000Z'),
      series: 'DAILY GRACE',
      title: 'Walking in the Spirit',
      textRef: 'Galatians 5:16-25',
      scriptureRef: 'Galatians 5:16',
      scriptureText: 'Walk in the Spirit, and ye shall not fulfil the lust of the flesh.',
      content: 'Live in complete submission to God today.',
      prayer: 'Lord, guide my steps today.',
      bibleIn365Days: 'Genesis 1-3\nMatthew 1',
      actionPoint: 'Walk in love and patience.',
      published: true,
      createdAt: new Date('2026-10-17T00:00:00.000Z'),
      updatedAt: new Date('2026-10-17T00:00:00.000Z'),
    };
    prismaMock.devotion.findFirst.mockResolvedValue(mockDevotion);

    const result = await service.getTodayDevotion();
    expect(result).not.toBeNull();
    expect(result?.title).toBe('Walking in the Spirit');
    expect(result?.series).toBe('DAILY GRACE');
    expect(result?.textRef).toBe('Galatians 5:16-25');
    expect(result?.scriptureRef).toBe('Galatians 5:16');
    expect(result?.bibleIn365Days).toBe('Genesis 1-3\nMatthew 1');
    expect(result?.actionPoint).toBe('Walk in love and patience.');
  });

  it('creates a new devotion for a unique date', async () => {
    const actor = { id: 'admin-1', name: 'Pastor Joy' };
    const mockCreated = {
      id: 'dev-2',
      date: new Date('2026-10-18T00:00:00.000Z'),
      series: 'DAILY GRACE',
      title: 'Grace Abounding',
      textRef: '2 Corinthians 9:6-15',
      scriptureRef: '2 Corinthians 9:8',
      scriptureText: 'And God is able to make all grace abound toward you...',
      content: 'Abundance of every good work.',
      prayer: 'Thank you Lord for your grace.',
      bibleIn365Days: 'Job 42\nProverbs 25:1–14\nHebrews 5',
      actionPoint: 'MAKE PRAYER YOUR PRIORITY AS A BELIEVER.',
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prismaMock.devotion.findUnique.mockResolvedValue(null);
    prismaMock.devotion.create.mockResolvedValue(mockCreated);

    const result = await service.create(actor as any, {
      date: '2026-10-18',
      series: 'DAILY GRACE',
      title: 'Grace Abounding',
      textRef: '2 Corinthians 9:6-15',
      scriptureRef: '2 Corinthians 9:8',
      scriptureText: 'And God is able to make all grace abound toward you...',
      content: 'Abundance of every good work.',
      prayer: 'Thank you Lord for your grace.',
      bibleIn365Days: 'Job 42\nProverbs 25:1–14\nHebrews 5',
      actionPoint: 'MAKE PRAYER YOUR PRIORITY AS A BELIEVER.',
      published: true,
    });

    expect(result.id).toBe('dev-2');
    expect(result.textRef).toBe('2 Corinthians 9:6-15');
    expect(result.actionPoint).toBe('MAKE PRAYER YOUR PRIORITY AS A BELIEVER.');
    expect(auditMock.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-1',
        action: 'devotion.create',
      }),
    );
  });

  it('throws BadRequestException when creating a devotion on an already-taken date', async () => {
    const actor = { id: 'admin-1', name: 'Pastor Joy' };
    prismaMock.devotion.findUnique.mockResolvedValue({
      id: 'existing-dev',
      date: new Date('2026-10-18T00:00:00.000Z'),
      title: 'Existing Devotion',
    });

    await expect(
      service.create(actor as any, {
        date: '2026-10-18',
        title: 'Duplicate Devotion',
        scriptureRef: 'John 3:16',
        scriptureText: 'For God so loved the world...',
        content: 'Content...',
      }),
    ).rejects.toThrow(/Only one devotion can be created/);
  });
});
