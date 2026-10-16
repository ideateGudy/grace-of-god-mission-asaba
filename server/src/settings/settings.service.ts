import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { ConfigService } from '@nestjs/config';
import type { AuthenticatedActor } from '../common/types.js';
import type { UpdateSiteSettingsDto } from '@ggm/types';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly configService: ConfigService,
  ) {}

  async getSettings() {
    let settings = await this.prisma.siteSetting.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await this.prisma.siteSetting.create({
        data: {
          id: 'default',
          churchName: 'Grace of God Mission Asaba',
          phone: '+234 803 000 0000',
          email: 'info@ggmasaba.org',
          address: 'No. 33 Arthur Richard Street, Akwuebulu (Cable Point), Asaba, Delta State',
          whatsapp: '+2348030000000',
          bankName: 'Zenith Bank',
          accountName: 'Grace of God Mission Asaba',
          accountNumber: '1010101010',
          googleMapsUrl: 'https://maps.google.com',
          facebookUrl: 'https://www.facebook.com/people/Grace-of-God-mission-Asaba-Division/61594831403921/',
        },
      });
    }

    return settings;
  }

  async updateSettings(actor: AuthenticatedActor, dto: UpdateSiteSettingsDto) {
    const updated = await this.prisma.siteSetting.upsert({
      where: { id: 'default' },
      update: {
        churchName: dto.churchName,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        whatsapp: dto.whatsapp,
        bankName: dto.bankName,
        accountName: dto.accountName,
        accountNumber: dto.accountNumber,
        googleMapsUrl: dto.googleMapsUrl || null,
        facebookUrl: dto.facebookUrl || null,
        youtubeUrl: dto.youtubeUrl || null,
        instagramUrl: dto.instagramUrl || null,
      },
      create: {
        id: 'default',
        churchName: dto.churchName,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        whatsapp: dto.whatsapp,
        bankName: dto.bankName,
        accountName: dto.accountName,
        accountNumber: dto.accountNumber,
        googleMapsUrl: dto.googleMapsUrl || null,
        facebookUrl: dto.facebookUrl || null,
        youtubeUrl: dto.youtubeUrl || null,
        instagramUrl: dto.instagramUrl || null,
      },
    });

    await this.audit.log({
      actorId: actor?.id,
      actorName: actor?.name,
      action: 'settings.update',
      entity: 'SiteSetting',
      entityId: 'default',
      meta: { fields: Object.keys(dto) },
    });

    // On-demand Next.js ISR revalidation for site settings
    this.triggerRevalidate(['settings', 'home', 'visit', 'give']).catch((err) => {
      this.logger.warn(`Failed to revalidate site pages after settings update: ${err?.message}`);
    });

    return updated;
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
