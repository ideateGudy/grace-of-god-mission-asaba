import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { normalizeUrl } from '../common/utils/url.util.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class GalleryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listPublic(page: number = 1, limit: number = 12, album?: string) {
    const where: Prisma.GalleryImageWhereInput = { published: true };
    if (album) {
      where.album = album;
    }

    const [data, total] = await Promise.all([
      this.prisma.galleryImage.findMany({
        where,
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.galleryImage.count({ where }),
    ]);

    return { data, meta: { page, limit, total } };
  }

  async listAdmin(page: number = 1, limit: number = 12) {
    const [data, total] = await Promise.all([
      this.prisma.galleryImage.findMany({
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.galleryImage.count(),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async getAdmin(id: string) {
    const image = await this.prisma.galleryImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Gallery image not found');
    return image;
  }

  async reorder(actor: any, ids: string[]) {
    await this.prisma.$transaction(ids.map((id, sortOrder) =>
      this.prisma.galleryImage.update({ where: { id }, data: { sortOrder } }),
    ));

    await this.audit.log({
      actorId: actor?.id,
      actorName: actor?.name,
      action: 'gallery.reorder',
      entity: 'GalleryImage',
      meta: { count: ids.length },
    });

    return { updated: ids.length };
  }

  async create(actor: any, dto: any) {
    const data = { ...dto };
    data.imageUrl = normalizeUrl(data.imageUrl);

    const image = await this.prisma.galleryImage.create({ data });

    if (image.published) {
      await this.audit.log({
        actorId: actor?.id,
        actorName: actor?.name,
        action: 'gallery.publish',
        entity: 'GalleryImage',
        entityId: image.id,
      });
    }

    return image;
  }

  async update(actor: any, id: string, dto: any) {
    const existing = await this.prisma.galleryImage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Gallery image not found');

    const data = { ...dto };
    if (data.imageUrl !== undefined) data.imageUrl = normalizeUrl(data.imageUrl);

    const image = await this.prisma.galleryImage.update({ where: { id }, data });

    if (data.published !== undefined && data.published !== existing.published) {
      await this.audit.log({
        actorId: actor?.id,
        actorName: actor?.name,
        action: data.published ? 'gallery.publish' : 'gallery.unpublish',
        entity: 'GalleryImage',
        entityId: image.id,
      });
    }

    return image;
  }

  async delete(actor: any, id: string) {
    const image = await this.prisma.galleryImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Gallery image not found');

    await this.prisma.galleryImage.delete({ where: { id } });

    await this.audit.log({
      actorId: actor?.id,
      actorName: actor?.name,
      action: 'gallery.delete',
      entity: 'GalleryImage',
      entityId: id,
    });
  }
}
