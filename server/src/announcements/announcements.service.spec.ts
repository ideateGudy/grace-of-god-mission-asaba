import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnnouncementsService } from './announcements.service.js';
import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { AuditService } from '../audit/audit.service.js';

describe('AnnouncementsService', () => {
  let service: AnnouncementsService;
  let prismaMock: any;
  let auditMock: any;

  beforeEach(() => {
    prismaMock = {
      announcement: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    auditMock = {
      log: vi.fn().mockResolvedValue(undefined),
    };
    service = new AnnouncementsService(
      prismaMock as unknown as PrismaService,
      auditMock as unknown as AuditService,
    );
  });

  it('filters active published announcements pinned first for public view', async () => {
    const mockList = [
      { id: 'a-1', title: 'Workers Conference', pinned: true, published: true },
      { id: 'a-2', title: 'Midweek Communion', pinned: false, published: true },
    ];
    prismaMock.announcement.findMany.mockResolvedValue(mockList);

    const result = await service.listPublic();
    expect(result.data).toEqual(mockList);
    expect(prismaMock.announcement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ published: true }),
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      }),
    );
  });

  it('throws NotFoundException when announcement id is not found', async () => {
    prismaMock.announcement.findUnique.mockResolvedValue(null);
    await expect(service.getAdmin('nonexistent')).rejects.toThrow(NotFoundException);
  });

  it('creates an announcement and writes audit trail', async () => {
    const actor = {
      id: 'admin-1',
      name: 'Pastor Praise',
      email: 'praise@ggm.org',
      role: 'ADMIN' as const,
      permissions: ['ANNOUNCEMENTS_MANAGE'],
    };
    const dto = {
      title: 'Youth Camp 2026',
      body: 'All youth are invited to register.',
      pinned: true,
      published: true,
    };
    const created = { id: 'announcement-1', ...dto };
    prismaMock.announcement.create.mockResolvedValue(created);

    const result = await service.create(actor as any, dto);
    expect(result).toEqual(created);
    expect(auditMock.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-1',
        action: 'announcement.publish',
      }),
    );
  });
});
