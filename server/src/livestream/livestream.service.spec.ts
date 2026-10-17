import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LivestreamService } from './livestream.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { AuditService } from '../audit/audit.service.js';
import type { ConfigService } from '@nestjs/config';

describe('LivestreamService', () => {
  let service: LivestreamService;
  let prismaMock: any;
  let auditMock: any;
  let configMock: any;

  beforeEach(() => {
    prismaMock = {
      siteSetting: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
    };
    auditMock = {
      log: vi.fn().mockResolvedValue(undefined),
    };
    configMock = {
      get: vi.fn(),
    };

    service = new LivestreamService(
      prismaMock as unknown as PrismaService,
      auditMock as unknown as AuditService,
      configMock as unknown as ConfigService,
    );
  });

  it('returns default offline status when settings do not exist', async () => {
    prismaMock.siteSetting.findUnique.mockResolvedValue(null);

    const result = await service.getStatus();
    expect(result.isLive).toBe(false);
    expect(result.liveVideoUrl).toBeNull();
  });

  it('updates live status and writes audit log', async () => {
    const actor = { id: 'admin-1', name: 'Media Lead' };
    const mockUpdated = {
      isLive: true,
      liveTitle: 'Sunday Celebration Service',
      liveServiceType: 'Sunday Service',
      liveVideoUrl: 'https://youtube.com/watch?v=123',
      liveNotes: 'Welcome to worship.',
      updatedAt: new Date(),
    };
    prismaMock.siteSetting.upsert.mockResolvedValue(mockUpdated);

    const result = await service.updateStatus(actor as any, {
      isLive: true,
      liveTitle: 'Sunday Celebration Service',
      liveServiceType: 'Sunday Service',
      liveVideoUrl: 'https://youtube.com/watch?v=123',
      liveNotes: 'Welcome to worship.',
    });

    expect(result.isLive).toBe(true);
    expect(result.liveTitle).toBe('Sunday Celebration Service');
    expect(auditMock.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-1',
        action: 'livestream.update',
      }),
    );
  });
});
