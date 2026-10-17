import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestimoniesService } from './testimonies.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { AuditService } from '../audit/audit.service.js';
import type { ConfigService } from '@nestjs/config';

describe('TestimoniesService', () => {
  let service: TestimoniesService;
  let prismaMock: any;
  let auditMock: any;
  let configMock: any;

  beforeEach(() => {
    prismaMock = {
      testimony: {
        create: vi.fn(),
        count: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
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

    service = new TestimoniesService(
      prismaMock as unknown as PrismaService,
      auditMock as unknown as AuditService,
      configMock as unknown as ConfigService,
    );
  });

  it('creates a new testimony in PENDING status', async () => {
    prismaMock.testimony.create.mockResolvedValue({ id: 'test-1' });

    const result = await service.createTestimony({
      title: 'Miraculous Healing',
      content: 'God healed me during the Sunday service.',
      authorName: 'Brother Paul',
      isAnonymous: false,
    });

    expect(result).toEqual({ success: true });
    expect(prismaMock.testimony.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Miraculous Healing',
          status: 'PENDING',
          isAnonymous: false,
        }),
      }),
    );
  });

  it('anonymizes public output when isAnonymous is true', async () => {
    prismaMock.testimony.count.mockResolvedValue(1);
    prismaMock.testimony.findMany.mockResolvedValue([
      {
        id: 'test-1',
        title: 'Divine Provision',
        content: 'God provided school fees.',
        authorName: 'Sister Grace',
        isAnonymous: true,
        featured: false,
        createdAt: new Date('2026-10-10T10:00:00Z'),
      },
    ]);

    const result = await service.listPublic(1, 10);
    expect(result.data[0].displayName).toBe('Church Member');
    expect(result.data[0].title).toBe('Divine Provision');
  });

  it('updates testimony status and writes an audit record', async () => {
    const actor = { id: 'admin-1', name: 'Pastor Mike' };
    prismaMock.testimony.findUnique.mockResolvedValue({
      id: 'test-1',
      title: 'Divine Provision',
      content: 'Details',
      status: 'PENDING',
      featured: false,
    });
    prismaMock.testimony.update.mockResolvedValue({
      id: 'test-1',
      status: 'APPROVED',
      featured: true,
    });

    const result = await service.update(actor as any, 'test-1', {
      status: 'APPROVED',
      featured: true,
    });

    expect(result.status).toBe('APPROVED');
    expect(auditMock.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-1',
        action: 'testimony.update',
        entity: 'Testimony',
      }),
    );
  });
});
