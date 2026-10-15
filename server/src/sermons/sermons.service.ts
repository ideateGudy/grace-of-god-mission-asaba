import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { generateSlug, normalizeUrl } from '../common/utils/url.util.js';
import type { Prisma, Sermon } from '@prisma/client';
import type { AuthenticatedActor } from '../common/types.js';
import type { CreateSermonDto, UpdateSermonDto } from '@ggm/types';

@Injectable()
export class SermonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listPublic(page: number = 1, limit: number = 12, q?: string, series?: string) {
    const where: Prisma.SermonWhereInput = { published: true };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { preacher: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (series) {
      where.series = series;
    }

    const [data, total] = await Promise.all([
      this.prisma.sermon.findMany({
        where,
        orderBy: { preachedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.sermon.count({ where }),
    ]);

    return { data, meta: { page, limit, total } };
  }

  async getPublicBySlug(slug: string) {
    const sermon = await this.prisma.sermon.findFirst({
      where: { slug, published: true },
    });
    if (!sermon) throw new NotFoundException('Sermon not found');
    return sermon;
  }

  async listAdmin(page: number = 1, limit: number = 12) {
    const [data, total] = await Promise.all([
      this.prisma.sermon.findMany({
        orderBy: { preachedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.sermon.count(),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async getAdmin(id: string): Promise<Sermon> {
    const sermon = await this.prisma.sermon.findUnique({ where: { id } });
    if (!sermon) throw new NotFoundException('Sermon not found');
    return sermon;
  }

  async create(actor: AuthenticatedActor, dto: CreateSermonDto): Promise<Sermon> {
    let slug: string = dto.slug || generateSlug(dto.title);
    
    // Ensure unique slug
    const existing = await this.prisma.sermon.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const sermon = await this.prisma.sermon.create({
      data: {
        ...dto,
        slug,
        videoUrl: normalizeUrl(dto.videoUrl),
        audioUrl: normalizeUrl(dto.audioUrl),
        thumbnailUrl: normalizeUrl(dto.thumbnailUrl),
      },
    });

    if (sermon.published) {
      await this.audit.log({
        actorId: actor?.id,
        actorName: actor?.name,
        action: 'sermon.publish',
        entity: 'Sermon',
        entityId: sermon.id,
        meta: { title: sermon.title },
      });
    }

    return sermon;
  }

  async update(actor: AuthenticatedActor, id: string, dto: UpdateSermonDto): Promise<Sermon> {
    const existing = await this.prisma.sermon.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Sermon not found');

    const data = { ...dto };
    if (data.videoUrl !== undefined) data.videoUrl = normalizeUrl(data.videoUrl);
    if (data.audioUrl !== undefined) data.audioUrl = normalizeUrl(data.audioUrl);
    if (data.thumbnailUrl !== undefined) data.thumbnailUrl = normalizeUrl(data.thumbnailUrl);

    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await this.prisma.sermon.findUnique({ where: { slug: data.slug } });
      if (slugExists) data.slug = `${data.slug}-${Date.now().toString().slice(-4)}`;
    }

    const sermon = await this.prisma.sermon.update({ where: { id }, data });

    if (data.published !== undefined && data.published !== existing.published) {
      await this.audit.log({
        actorId: actor?.id,
        actorName: actor?.name,
        action: data.published ? 'sermon.publish' : 'sermon.unpublish',
        entity: 'Sermon',
        entityId: sermon.id,
        meta: { title: sermon.title },
      });
    }

    return sermon;
  }

  async delete(actor: AuthenticatedActor, id: string): Promise<void> {
    const sermon = await this.prisma.sermon.findUnique({ where: { id } });
    if (!sermon) throw new NotFoundException('Sermon not found');

    await this.prisma.sermon.delete({ where: { id } });

    await this.audit.log({
      actorId: actor?.id,
      actorName: actor?.name,
      action: 'sermon.delete',
      entity: 'Sermon',
      entityId: id,
      meta: { title: sermon.title },
    });
  }
}
