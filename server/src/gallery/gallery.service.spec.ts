import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GalleryService } from './gallery.service.js';
import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { AuditService } from '../audit/audit.service.js';

describe('GalleryService', () => {
  let service: GalleryService;
  let prismaMock: any;
  let auditMock: any;

  beforeEach(() => {
    prismaMock = {
      galleryImage: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      $transaction: vi.fn().mockImplementation((promises) => Promise.all(promises)),
    };
    auditMock = {
      log: vi.fn().mockResolvedValue(undefined),
    };
    service = new GalleryService(
      prismaMock as unknown as PrismaService,
      auditMock as unknown as AuditService,
    );
  });

  it('lists published gallery images with pagination and album filtering', async () => {
    const mockImages = [
      { id: 'img-1', imageUrl: 'https://res.cloudinary.com/sample.jpg', album: 'Sunday Services', published: true },
    ];
    prismaMock.galleryImage.findMany.mockResolvedValue(mockImages);
    prismaMock.galleryImage.count.mockResolvedValue(1);

    const result = await service.listPublic(1, 12, 'Sunday Services');
    expect(result.data).toEqual(mockImages);
    expect(result.meta).toEqual({ page: 1, limit: 12, total: 1 });
  });

  it('throws NotFoundException when image does not exist', async () => {
    prismaMock.galleryImage.findUnique.mockResolvedValue(null);
    await expect(service.getAdmin('invalid-id')).rejects.toThrow(NotFoundException);
  });

  it('creates gallery image, assigns sortOrder, and records audit trail', async () => {
    const actor = {
      id: 'admin-1',
      name: 'Media Team',
      email: 'media@ggm.org',
      role: 'ADMIN' as const,
      permissions: ['GALLERY_MANAGE'],
    };
    const dto = {
      imageUrl: 'https://res.cloudinary.com/ggm/photo.jpg',
      caption: 'Choir ministration',
      album: 'Sunday Service',
      width: 1920,
      height: 1080,
      published: true,
    };
    prismaMock.galleryImage.count.mockResolvedValue(5);
    const created = { id: 'img-100', sortOrder: 5, ...dto };
    prismaMock.galleryImage.create.mockResolvedValue(created);

    const result = await service.create(actor, dto);
    expect(result).toEqual(created);
    expect(auditMock.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-1',
        action: 'gallery.publish',
      }),
    );
  });
});
