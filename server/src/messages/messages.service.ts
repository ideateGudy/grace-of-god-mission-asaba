import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { MessageStatus, type ContactMessage, type PrayerRequest, type AuditLog } from '@prisma/client';
import type { AuthenticatedActor } from '../common/types.js';
import type { CreateContactDto, CreatePrayerDto } from '@ggm/types';

export interface DashboardStats {
  publishedSermons?: number;
  upcomingEvents?: number;
  unreadContactMessages?: number;
  unreadPrayerRequests?: number;
  liveHero?: { name: string; slides: number } | null;
  activeAdmins?: number;
  recentAudit?: AuditLog[];
}

export type CreateContactInput = CreateContactDto | { honeypot: string };
export type CreatePrayerInput = CreatePrayerDto | { honeypot: string };

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  async createContact(dto: CreateContactInput): Promise<{ success: boolean }> {
    if ('honeypot' in dto && dto.honeypot) {
      return { success: true };
    }
    const data = dto as CreateContactDto;

    await this.prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
      },
    });

    void this.notifications.sendContactAlert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
    });

    return { success: true };
  }

  async createPrayer(dto: CreatePrayerInput): Promise<{ success: boolean }> {
    if ('honeypot' in dto && dto.honeypot) {
      return { success: true };
    }
    const data = dto as CreatePrayerDto;

    await this.prisma.prayerRequest.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        request: data.request,
        shareOnWall: Boolean(data.shareOnWall),
      },
    });

    void this.notifications.sendPrayerAlert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      request: data.request,
    });

    return { success: true };
  }

  async getPrayerWall(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const where = { shareOnWall: true, wallApproved: true };

    const [total, items] = await Promise.all([
      this.prisma.prayerRequest.count({ where }),
      this.prisma.prayerRequest.findMany({
        where,
        select: {
          id: true,
          request: true,
          prayedCount: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return { data: items, meta: { page, limit, total } };
  }

  async incrementPrayedCount(id: string) {
    const updated = await this.prisma.prayerRequest.update({
      where: { id },
      data: { prayedCount: { increment: 1 } },
      select: { id: true, prayedCount: true },
    });
    return { data: updated };
  }

  async updatePrayerWallApproval(actor: AuthenticatedActor, id: string, wallApproved: boolean) {
    const updated = await this.prisma.prayerRequest.update({
      where: { id },
      data: { wallApproved },
    });

    await this.audit.log({
      actorId: actor?.id,
      actorName: actor?.name,
      action: 'prayer.wall_approval',
      entity: 'PrayerRequest',
      entityId: id,
      meta: { wallApproved },
    });

    return updated;
  }

  async listContact(status?: MessageStatus, page: number = 1, limit: number = 12) {
    const where = status ? { status } : {};
    const skip = (page - 1) * limit;
    const [total, newTotal] = await Promise.all([
      this.prisma.contactMessage.count({ where }),
      status && status !== 'NEW' ? 0 : this.prisma.contactMessage.count({ where: { status: 'NEW' } }),
    ]);
    const newMessages = skip < newTotal
      ? await this.prisma.contactMessage.findMany({ where: { status: 'NEW' }, orderBy: { createdAt: 'desc' }, skip, take: Math.min(limit, newTotal - skip) })
      : [];
    const remaining = limit - newMessages.length;
    const otherMessages = status === 'NEW' || remaining === 0
      ? []
      : await this.prisma.contactMessage.findMany({
          where: status ? { status } : { status: { not: 'NEW' } },
          orderBy: { createdAt: 'desc' },
          skip: Math.max(0, skip - newTotal),
          take: remaining,
        });
    const data = [...newMessages, ...otherMessages];
    return { data, meta: { page, limit, total } };
  }

  async updateContactStatus(actor: AuthenticatedActor, id: string, status: MessageStatus): Promise<ContactMessage> {
    const msg = await this.prisma.contactMessage.update({
      where: { id },
      data: { status },
    });
    await this.audit.log({ actorId: actor?.id, actorName: actor?.name, action: 'contact.status_update', entity: 'ContactMessage', entityId: id, meta: { status } });
    return msg;
  }

  async deleteContact(actor: AuthenticatedActor, id: string): Promise<void> {
    await this.prisma.contactMessage.delete({ where: { id } });
    await this.audit.log({
      actorId: actor?.id,
      actorName: actor?.name,
      action: 'contact.delete',
      entity: 'ContactMessage',
      entityId: id,
    });
  }

  async listPrayer(status?: MessageStatus, page: number = 1, limit: number = 12) {
    const where = status ? { status } : {};
    const skip = (page - 1) * limit;
    const [total, newTotal] = await Promise.all([
      this.prisma.prayerRequest.count({ where }),
      status && status !== 'NEW' ? 0 : this.prisma.prayerRequest.count({ where: { status: 'NEW' } }),
    ]);
    const newRequests = skip < newTotal
      ? await this.prisma.prayerRequest.findMany({ where: { status: 'NEW' }, orderBy: { createdAt: 'desc' }, skip, take: Math.min(limit, newTotal - skip) })
      : [];
    const remaining = limit - newRequests.length;
    const otherRequests = status === 'NEW' || remaining === 0
      ? []
      : await this.prisma.prayerRequest.findMany({
          where: status ? { status } : { status: { not: 'NEW' } },
          orderBy: { createdAt: 'desc' },
          skip: Math.max(0, skip - newTotal),
          take: remaining,
        });
    const data = [...newRequests, ...otherRequests];
    return { data, meta: { page, limit, total } };
  }

  async updatePrayerStatus(actor: AuthenticatedActor, id: string, status: MessageStatus): Promise<PrayerRequest> {
    const msg = await this.prisma.prayerRequest.update({
      where: { id },
      data: { status },
    });
    await this.audit.log({ actorId: actor?.id, actorName: actor?.name, action: 'prayer_request.status_update', entity: 'PrayerRequest', entityId: id, meta: { status } });
    return msg;
  }

  async deletePrayer(actor: AuthenticatedActor, id: string): Promise<void> {
    await this.prisma.prayerRequest.delete({ where: { id } });
    await this.audit.log({
      actorId: actor?.id,
      actorName: actor?.name,
      action: 'prayer_request.delete',
      entity: 'PrayerRequest',
      entityId: id,
    });
  }

  async getStats(actor: AuthenticatedActor): Promise<{ data: DashboardStats }> {
    const permissions = actor.role === 'SUPER_ADMIN' 
      ? ['SERMONS_MANAGE', 'EVENTS_MANAGE', 'CONTACT_INBOX', 'PRAYER_INBOX', 'HERO_MANAGE'] 
      : (actor.permissions ?? []);

    const stats: DashboardStats = {};
    const now = new Date();

    if (permissions.includes('SERMONS_MANAGE') || actor.role === 'SUPER_ADMIN') {
      stats.publishedSermons = await this.prisma.sermon.count({ where: { published: true } });
    }

    if (permissions.includes('EVENTS_MANAGE') || actor.role === 'SUPER_ADMIN') {
      stats.upcomingEvents = await this.prisma.event.count({ where: { startsAt: { gte: now }, published: true } });
    }

    if (permissions.includes('CONTACT_INBOX') || actor.role === 'SUPER_ADMIN') {
      stats.unreadContactMessages = await this.prisma.contactMessage.count({ where: { status: 'NEW' } });
    }

    if (permissions.includes('PRAYER_INBOX') || actor.role === 'SUPER_ADMIN') {
      stats.unreadPrayerRequests = await this.prisma.prayerRequest.count({ where: { status: 'NEW' } });
    }

    if (permissions.includes('HERO_MANAGE') || actor.role === 'SUPER_ADMIN') {
      const heroes = await this.prisma.hero.findMany({
        where: {
          published: true,
          OR: [{ startsAt: null }, { startsAt: { lte: now } }],
          AND: [{ OR: [{ endsAt: null }, { endsAt: { gt: now } }] }],
        },
        include: { slides: true },
      });
      heroes.sort((a, b) => {
        const aStart = a.startsAt || a.createdAt;
        const bStart = b.startsAt || b.createdAt;
        if (bStart.getTime() !== aStart.getTime()) return bStart.getTime() - aStart.getTime();
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      });
      const live = heroes[0];
      stats.liveHero = live ? { name: live.name, slides: live.slides.length } : null;
    }

    if (actor.role === 'SUPER_ADMIN') {
      stats.activeAdmins = await this.prisma.adminUser.count({ where: { isActive: true } });
      stats.recentAudit = await this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
    }

    return { data: stats };
  }
}
