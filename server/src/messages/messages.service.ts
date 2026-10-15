import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { MessageStatus } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async createContact(dto: any) {
    if (dto.honeypot) {
      return { success: true };
    }
    await this.prisma.contactMessage.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        message: dto.message,
      },
    });
    return { success: true };
  }

  async createPrayer(dto: any) {
    if (dto.honeypot) {
      return { success: true };
    }
    await this.prisma.prayerRequest.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        request: dto.request,
      },
    });
    return { success: true };
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

  async updateContactStatus(actor: any, id: string, status: MessageStatus) {
    const msg = await this.prisma.contactMessage.update({
      where: { id },
      data: { status },
    });
    await this.audit.log({ actorId: actor?.id, actorName: actor?.name, action: 'contact.status_update', entity: 'ContactMessage', entityId: id, meta: { status } });
    return msg;
  }

  async deleteContact(actor: any, id: string) {
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

  async updatePrayerStatus(actor: any, id: string, status: MessageStatus) {
    const msg = await this.prisma.prayerRequest.update({
      where: { id },
      data: { status },
    });
    await this.audit.log({ actorId: actor?.id, actorName: actor?.name, action: 'prayer_request.status_update', entity: 'PrayerRequest', entityId: id, meta: { status } });
    return msg;
  }

  async deletePrayer(actor: any, id: string) {
    await this.prisma.prayerRequest.delete({ where: { id } });
    await this.audit.log({
      actorId: actor?.id,
      actorName: actor?.name,
      action: 'prayer_request.delete',
      entity: 'PrayerRequest',
      entityId: id,
    });
  }

  async getStats(actor: any) {
    const permissions = actor.role === 'SUPER_ADMIN' 
      ? ['SERMONS_MANAGE', 'EVENTS_MANAGE', 'CONTACT_INBOX', 'PRAYER_INBOX', 'HERO_MANAGE'] 
      : actor.permissions;

    const stats: any = {};
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
