import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SermonsService } from './sermons.service.js';
import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { AuditService } from '../audit/audit.service.js';

describe('SermonsService', () => {
  let service: SermonsService;
  let prismaMock: any;
  let auditMock: any;

  beforeEach(() => {
    prismaMock = {
      sermon: {
        findMany: vi.fn(),
        count: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    auditMock = {
      log: vi.fn().mockResolvedValue(undefined),
    };
    service = new SermonsService(
      prismaMock as unknown as PrismaService,
      auditMock as unknown as AuditService,
    );
  });

  it('lists public published sermons with pagination', async () => {
    const mockSermons = [{ id: 's-1', title: 'The Power of Grace', published: true }];
    prismaMock.sermon.findMany.mockResolvedValue(mockSermons);
    prismaMock.sermon.count.mockResolvedValue(1);

    const result = await service.listPublic(1, 10, 'Grace');
    expect(result.data).toEqual(mockSermons);
    expect(result.meta).toEqual({ page: 1, limit: 10, total: 1 });
  });

  it('throws NotFoundException when public sermon slug does not exist or is unpublished', async () => {
    prismaMock.sermon.findFirst.mockResolvedValue(null);
    await expect(service.getPublicBySlug('missing-slug')).rejects.toThrow(NotFoundException);
  });

  it('creates sermon with auto-generated slug and audits', async () => {
    const actor = {
      id: 'admin-1',
      name: 'Pastor John',
      email: 'john@ggm.org',
      role: 'ADMIN' as const,
      permissions: ['SERMONS_MANAGE'],
    };
    const dto = {
      title: 'Walking in Victory',
      preacher: 'Rev. Dr. C. Nwankwo',
      preachedAt: '2026-10-10T09:00:00Z',
      scripture: 'Romans 8:31-39',
      description: 'Sunday service message',
      published: true,
    };
    const created = { id: 'sermon-123', slug: 'walking-in-victory', ...dto };
    prismaMock.sermon.findUnique.mockResolvedValue(null);
    prismaMock.sermon.create.mockResolvedValue(created);

    const result = await service.create(actor, dto);
    expect(result).toEqual(created);
    expect(auditMock.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-1',
        action: 'sermon.publish',
      }),
    );
  });
});
