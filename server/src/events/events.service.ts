import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { generateSlug, normalizeUrl } from '../common/utils/url.util.js';
import type { Prisma, Event } from '@prisma/client';
import type { AuthenticatedActor } from '../common/types.js';
import type { CreateEventDto, UpdateEventDto } from '@ggm/types';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listPublic(scope: 'upcoming' | 'past' = 'upcoming', page: number = 1, limit: number = 12) {
    const now = new Date();
    const where: Prisma.EventWhereInput = { published: true };
    
    if (scope === 'upcoming') {
      where.startsAt = { gte: now };
    } else {
      where.startsAt = { lt: now };
    }

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        orderBy: scope === 'upcoming' ? { startsAt: 'asc' } : { startsAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.event.count({ where }),
    ]);

    return { data, meta: { page, limit, total } };
  }

  async getPublicBySlug(slug: string) {
    const event = await this.prisma.event.findFirst({
      where: { slug, published: true },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async listAdmin(page: number = 1, limit: number = 12) {
    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        orderBy: { startsAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.event.count(),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async getAdmin(id: string): Promise<Event> {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async create(actor: AuthenticatedActor, dto: CreateEventDto): Promise<Event> {
    let slug: string = dto.slug || generateSlug(dto.title);

    const existing = await this.prisma.event.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const event = await this.prisma.event.create({
      data: {
        ...dto,
        slug,
        mapUrl: normalizeUrl(dto.mapUrl),
        imageUrl: normalizeUrl(dto.imageUrl),
      },
    });

    if (event.published) {
      await this.audit.log({
        actorId: actor?.id,
        actorName: actor?.name,
        action: 'event.publish',
        entity: 'Event',
        entityId: event.id,
        meta: { title: event.title },
      });
    }

    return event;
  }

  async update(actor: AuthenticatedActor, id: string, dto: UpdateEventDto): Promise<Event> {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Event not found');

    const data = { ...dto };
    if (data.mapUrl !== undefined) data.mapUrl = normalizeUrl(data.mapUrl);
    if (data.imageUrl !== undefined) data.imageUrl = normalizeUrl(data.imageUrl);

    if (data.slug) {
      if (data.slug !== existing.slug) {
        const slugExists = await this.prisma.event.findUnique({ where: { slug: data.slug } });
        if (slugExists) data.slug = `${data.slug}-${Date.now().toString().slice(-4)}`;
      }
    } else {
      delete (data as any).slug;
    }

    const event = await this.prisma.event.update({ where: { id }, data: data as Prisma.EventUpdateInput });

    if (data.published !== undefined && data.published !== existing.published) {
      await this.audit.log({
        actorId: actor?.id,
        actorName: actor?.name,
        action: data.published ? 'event.publish' : 'event.unpublish',
        entity: 'Event',
        entityId: event.id,
        meta: { title: event.title },
      });
    }

    return event;
  }

  async delete(actor: AuthenticatedActor, id: string): Promise<void> {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');

    await this.prisma.event.delete({ where: { id } });

    await this.audit.log({
      actorId: actor?.id,
      actorName: actor?.name,
      action: 'event.delete',
      entity: 'Event',
      entityId: id,
      meta: { title: event.title },
    });
  }
}
