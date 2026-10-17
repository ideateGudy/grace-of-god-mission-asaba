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
      title: 'Walking in the Spirit',
      scriptureRef: 'Galatians 5:16',
      scriptureText: 'Walk in the Spirit, and ye shall not fulfil the lust of the flesh.',
      content: 'Live in complete submission to God today.',
      prayer: 'Lord, guide my steps today.',
      published: true,
      createdAt: new Date('2026-10-17T00:00:00.000Z'),
      updatedAt: new Date('2026-10-17T00:00:00.000Z'),
    };
    prismaMock.devotion.findFirst.mockResolvedValue(mockDevotion);

    const result = await service.getTodayDevotion();
    expect(result).not.toBeNull();
    expect(result?.title).toBe('Walking in the Spirit');
    expect(result?.scriptureRef).toBe('Galatians 5:16');
  });

  it('creates or upserts a devotion', async () => {
    const actor = { id: 'admin-1', name: 'Pastor Joy' };
    const mockCreated = {
      id: 'dev-2',
      date: new Date('2026-10-18T00:00:00.000Z'),
      title: 'Grace Abounding',
      scriptureRef: '2 Corinthians 9:8',
      scriptureText: 'And God is able to make all grace abound toward you...',
      content: 'Abundance of every good work.',
      prayer: 'Thank you Lord for your grace.',
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prismaMock.devotion.upsert.mockResolvedValue(mockCreated);

    const result = await service.create(actor as any, {
      date: '2026-10-18',
      title: 'Grace Abounding',
      scriptureRef: '2 Corinthians 9:8',
      scriptureText: 'And God is able to make all grace abound toward you...',
      content: 'Abundance of every good work.',
      prayer: 'Thank you Lord for your grace.',
      published: true,
    });

    expect(result.id).toBe('dev-2');
    expect(auditMock.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-1',
        action: 'devotion.create',
      }),
    );
  });
});
