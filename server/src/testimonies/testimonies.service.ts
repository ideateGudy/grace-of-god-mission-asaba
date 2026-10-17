import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { ConfigService } from '@nestjs/config';
import type { AuthenticatedActor } from '../common/types.js';
import type {
  CreateTestimonyDto,
  UpdateTestimonyDto,
  PublicTestimonyDto,
  TestimonyStatus,
} from '@ggm/types';

@Injectable()
export class TestimoniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly configService: ConfigService,
  ) {}

  async createTestimony(dto: CreateTestimonyDto): Promise<{ success: boolean }> {
    if (dto.honeypot) {
      return { success: true };
    }

    await this.prisma.testimony.create({
      data: {
        title: dto.title,
        content: dto.content,
        authorName: dto.authorName,
        phone: dto.phone || null,
        email: dto.email || null,
        isAnonymous: Boolean(dto.isAnonymous),
        status: 'PENDING',
      },
    });

    return { success: true };
  }

  async listPublic(page: number = 1, limit: number = 12): Promise<{ data: PublicTestimonyDto[]; meta: { page: number; limit: number; total: number } }> {
    const skip = (page - 1) * limit;
    const where = { status: 'APPROVED' as const };

    const [total, items] = await Promise.all([
      this.prisma.testimony.count({ where }),
      this.prisma.testimony.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
    ]);

    const data: PublicTestimonyDto[] = items.map((t) => ({
      id: t.id,
      title: t.title,
      content: t.content,
      displayName: t.isAnonymous ? 'Church Member' : t.authorName,
      featured: t.featured,
      createdAt: t.createdAt.toISOString(),
    }));

    return { data, meta: { page, limit, total } };
  }

  async listAdmin(status?: TestimonyStatus, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [total, items] = await Promise.all([
      this.prisma.testimony.count({ where }),
      this.prisma.testimony.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
      }),
    ]);

    return { data: items, meta: { page, limit, total } };
  }

  async update(actor: AuthenticatedActor, id: string, dto: UpdateTestimonyDto) {
    const existing = await this.prisma.testimony.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Testimony with ID ${id} not found`);
    }

    const updated = await this.prisma.testimony.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        content: dto.content ?? existing.content,
        status: dto.status ?? existing.status,
        featured: dto.featured ?? existing.featured,
      },
    });

    await this.audit.log({
      actorId: actor?.id,
      actorName: actor?.name,
      action: 'testimony.update',
      entity: 'Testimony',
      entityId: id,
      meta: { changes: Object.keys(dto) },
    });

    this.triggerRevalidate(['testimonies', 'home']).catch(() => {});

    return updated;
  }

  async delete(actor: AuthenticatedActor, id: string) {
    const existing = await this.prisma.testimony.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Testimony with ID ${id} not found`);
    }

    await this.prisma.testimony.delete({ where: { id } });

    await this.audit.log({
      actorId: actor?.id,
      actorName: actor?.name,
      action: 'testimony.delete',
      entity: 'Testimony',
      entityId: id,
    });

    this.triggerRevalidate(['testimonies', 'home']).catch(() => {});
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
