import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsService } from './settings.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { AuditService } from '../audit/audit.service.js';
import type { ConfigService } from '@nestjs/config';

describe('SettingsService', () => {
  let service: SettingsService;
  let prismaMock: any;
  let auditMock: any;
  let configMock: any;

  beforeEach(() => {
    prismaMock = {
      siteSetting: {
        findUnique: vi.fn(),
        create: vi.fn(),
        upsert: vi.fn(),
      },
    };
    auditMock = {
      log: vi.fn().mockResolvedValue(undefined),
    };
    configMock = {
      get: vi.fn(),
    };

    service = new SettingsService(
      prismaMock as unknown as PrismaService,
      auditMock as unknown as AuditService,
      configMock as unknown as ConfigService,
    );
  });

  it('returns existing settings when available', async () => {
    const existing = {
      id: 'default',
      churchName: 'Grace of God Mission Asaba',
      phone: '+234 803 111 2222',
      email: 'office@ggmasaba.org',
      leadership: [],
    };
    prismaMock.siteSetting.findUnique.mockResolvedValue(existing);

    const result = await service.getSettings();
    expect(result).toEqual(existing);
    expect(prismaMock.siteSetting.create).not.toHaveBeenCalled();
  });

  it('creates default settings if none exist', async () => {
    prismaMock.siteSetting.findUnique.mockResolvedValue(null);
    const created = {
      id: 'default',
      churchName: 'Grace of God Mission Asaba',
      leadership: [],
    };
    prismaMock.siteSetting.create.mockResolvedValue(created);

    const result = await service.getSettings();
    expect(result).toEqual(created);
    expect(prismaMock.siteSetting.create).toHaveBeenCalled();
  });

  it('updates settings and writes audit record', async () => {
    const actor = {
      id: 'super-admin-1',
      email: 'admin@ggm.org',
      role: 'SUPER_ADMIN' as const,
      permissions: ['*'],
    };
    const dto = {
      churchName: 'Grace of God Mission Asaba Updated',
      phone: '+234 800 000 0000',
      email: 'info@ggmasaba.org',
      address: 'Cable Point Asaba',
      whatsapp: '+234 800 000 0000',
      bankName: 'Access Bank',
      accountName: 'Grace of God Mission',
      accountNumber: '0011223344',
      googleMapsUrl: 'https://maps.google.com',
      facebookUrl: null,
      tiktokUrl: null,
      youtubeUrl: null,
      instagramUrl: null,
      leadership: [
        {
          id: 'lead-1',
          name: 'Pastor John Doe',
          title: 'Senior Pastor',
          bio: 'Serving with grace and truth.',
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        },
      ],
    };
    const updated = { id: 'default', ...dto };
    prismaMock.siteSetting.upsert.mockResolvedValue(updated);

    const result = await service.updateSettings(actor as any, dto);
    expect(result).toEqual(updated);
    expect(prismaMock.siteSetting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'default' },
        update: expect.objectContaining({
          leadership: dto.leadership,
        }),
      }),
    );
    expect(auditMock.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'super-admin-1',
        action: 'settings.update',
        entity: 'SiteSetting',
      }),
    );
  });

  it('ensures getSettings always returns leadership as an array', async () => {
    prismaMock.siteSetting.findUnique.mockResolvedValue({
      id: 'default',
      churchName: 'Grace of God Mission Asaba',
      leadership: null,
    });

    const result = await service.getSettings();
    expect(result.leadership).toEqual([]);
  });
});
