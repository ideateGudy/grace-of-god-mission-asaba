import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';

@Injectable()
export class AnnouncementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listPublic() {
    const now = new Date();
    
    const data = await this.prisma.announcement.findMany({
      where: {
        published: true,
        OR: [
          { publishFrom: null },
          { publishFrom: { lte: now } }
        ],
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: now } }
            ]
          }
        ]
      },
      orderBy: [
        { pinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return { data };
  }

  async listAdmin(page: number = 1, limit: number = 12) {
    const [data, total] = await Promise.all([
      this.prisma.announcement.findMany({
        orderBy: [
          { pinned: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.announcement.count(),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async getAdmin(id: string) {
    const announcement = await this.prisma.announcement.findUnique({ where: { id } });
    if (!announcement) throw new NotFoundException('Announcement not found');
    return announcement;
  }

  async create(actor: any, dto: any) {
    const announcement = await this.prisma.announcement.create({ data: dto });

    if (announcement.published) {
      await this.audit.log({
        actorId: actor?.id,
        actorName: actor?.name,
        action: 'announcement.publish',
        entity: 'Announcement',
        entityId: announcement.id,
        meta: { title: announcement.title },
      });
    }

    return announcement;
  }

  async update(actor: any, id: string, dto: any) {
    const existing = await this.prisma.announcement.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Announcement not found');

    const announcement = await this.prisma.announcement.update({ where: { id }, data: dto });

    if (dto.published !== undefined && dto.published !== existing.published) {
      await this.audit.log({
        actorId: actor?.id,
        actorName: actor?.name,
        action: dto.published ? 'announcement.publish' : 'announcement.unpublish',
        entity: 'Announcement',
        entityId: announcement.id,
        meta: { title: announcement.title },
      });
    }

    return announcement;
  }

  async delete(actor: any, id: string) {
    const announcement = await this.prisma.announcement.findUnique({ where: { id } });
    if (!announcement) throw new NotFoundException('Announcement not found');

    await this.prisma.announcement.delete({ where: { id } });

    await this.audit.log({
      actorId: actor?.id,
      actorName: actor?.name,
      action: 'announcement.delete',
      entity: 'Announcement',
      entityId: id,
      meta: { title: announcement.title },
    });
  }
}
