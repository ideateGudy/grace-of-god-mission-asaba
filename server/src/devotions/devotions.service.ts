import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { ConfigService } from '@nestjs/config';
import type { AuthenticatedActor } from '../common/types.js';
import type {
  CreateDevotionDto,
  UpdateDevotionDto,
  DevotionDto,
} from '@ggm/types';

@Injectable()
export class DevotionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly configService: ConfigService,
  ) {}

  async getTodayDevotion(): Promise<DevotionDto | null> {
    // Normalize date to West Africa Time (Africa/Lagos, UTC+1)
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos' }).format(new Date());
    const todayDate = new Date(`${todayStr}T00:00:00.000Z`);

    // 1. Try finding an exact match for today's date
    let devotion = await this.prisma.devotion.findFirst({
      where: {
        published: true,
        date: todayDate,
      },
    });

    // 2. If no devotion is scheduled exactly for today, get the latest published devotion
    if (!devotion) {
      devotion = await this.prisma.devotion.findFirst({
        where: { published: true },
        orderBy: { date: 'desc' },
      });
    }

    if (!devotion) return null;

    return this.mapToDto(devotion);
  }

  async listPublic(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const where = { published: true };

    const [total, items] = await Promise.all([
      this.prisma.devotion.count({ where }),
      this.prisma.devotion.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: items.map((d) => this.mapToDto(d)),
      meta: { page, limit, total },
    };
  }

  async getById(id: string): Promise<DevotionDto> {
    const devotion = await this.prisma.devotion.findUnique({ where: { id } });
    if (!devotion) {
      throw new NotFoundException(`Devotion with ID ${id} not found`);
    }
    return this.mapToDto(devotion);
  }

  async listAdmin(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      this.prisma.devotion.count(),
      this.prisma.devotion.findMany({
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: items.map((d) => this.mapToDto(d)),
      meta: { page, limit, total },
    };
  }

  async create(actor: AuthenticatedActor, dto: CreateDevotionDto) {
    const dateObj = new Date(`${dto.date}T00:00:00.000Z`);

    const created = await this.prisma.devotion.upsert({
      where: { date: dateObj },
      update: {
        title: dto.title,
        scriptureRef: dto.scriptureRef,
        scriptureText: dto.scriptureText,
        content: dto.content,
        prayer: dto.prayer || null,
        published: dto.published ?? true,
      },
      create: {
        date: dateObj,
        title: dto.title,
        scriptureRef: dto.scriptureRef,
        scriptureText: dto.scriptureText,
        content: dto.content,
        prayer: dto.prayer || null,
        published: dto.published ?? true,
      },
    });

    await this.audit.log({
      actorId: actor?.id,
      actorName: actor?.name,
      action: 'devotion.create',
      entity: 'Devotion',
      entityId: created.id,
      meta: { title: dto.title, date: dto.date },
    });

    this.triggerRevalidate(['devotions', 'home']).catch(() => {});

    return this.mapToDto(created);
  }

  async update(actor: AuthenticatedActor, id: string, dto: UpdateDevotionDto) {
    const existing = await this.prisma.devotion.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Devotion with ID ${id} not found`);
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.scriptureRef !== undefined) data.scriptureRef = dto.scriptureRef;
    if (dto.scriptureText !== undefined) data.scriptureText = dto.scriptureText;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.prayer !== undefined) data.prayer = dto.prayer || null;
    if (dto.published !== undefined) data.published = dto.published;
    if (dto.date !== undefined) data.date = new Date(`${dto.date}T00:00:00.000Z`);

    const updated = await this.prisma.devotion.update({
      where: { id },
      data,
    });

    await this.audit.log({
      actorId: actor?.id,
      actorName: actor?.name,
      action: 'devotion.update',
      entity: 'Devotion',
      entityId: id,
      meta: { changes: Object.keys(dto) },
    });

    this.triggerRevalidate(['devotions', 'home']).catch(() => {});

    return this.mapToDto(updated);
  }

  async delete(actor: AuthenticatedActor, id: string) {
    const existing = await this.prisma.devotion.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Devotion with ID ${id} not found`);
    }

    await this.prisma.devotion.delete({ where: { id } });

    await this.audit.log({
      actorId: actor?.id,
      actorName: actor?.name,
      action: 'devotion.delete',
      entity: 'Devotion',
      entityId: id,
    });

    this.triggerRevalidate(['devotions', 'home']).catch(() => {});
  }

  private mapToDto(devotion: any): DevotionDto {
    return {
      id: devotion.id,
      date: devotion.date.toISOString().slice(0, 10),
      title: devotion.title,
      scriptureRef: devotion.scriptureRef,
      scriptureText: devotion.scriptureText,
      content: devotion.content,
      prayer: devotion.prayer,
      published: devotion.published,
      createdAt: devotion.createdAt.toISOString(),
      updatedAt: devotion.updatedAt.toISOString(),
    };
  }

  private async triggerRevalidate(tags: string[]) {
    const revalidateUrl = this.configService.get<string>('WEB_REVALIDATE_URL');
    const secret = this.configService.get<string>('REVALIDATE_SECRET');
    if (!revalidateUrl || !secret) return;

    for (const tag of tags) {
      try {
        await fetch(`${revalidateUrl}?tag=${tag}&secret=${secret}`, { method: 'POST' });
      } catch {}
    }
  }
}
