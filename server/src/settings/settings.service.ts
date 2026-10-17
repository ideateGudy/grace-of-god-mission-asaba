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
          googleMapsUrl: 'https://www.google.com/maps/place/Grace+of+God+Mission+Asaba+Hq/@6.1763103,6.7464769,17.38z/data=!4m6!3m5!1s0x1043ed616ce913ef:0x5cda51b288ccb076!8m2!3d6.1764146!4d6.748862!16s%2Fg%2F11tf999ctn?entry=ttu',
          facebookUrl: 'https://www.facebook.com/profile.php?id=61594831403921',
          tiktokUrl: 'https://www.tiktok.com/@graceofgodmissionasaba?_r=1&_t=ZS-9AcSfnQD7yO',
          leadership: [],
        },
      });
    }

    return {
      ...settings,
      leadership: Array.isArray(settings.leadership) ? settings.leadership : [],
    };
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
        tiktokUrl: dto.tiktokUrl || null,
        youtubeUrl: dto.youtubeUrl || null,
        instagramUrl: dto.instagramUrl || null,
        leadership: dto.leadership ? (dto.leadership as any) : [],
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
        tiktokUrl: dto.tiktokUrl || null,
        youtubeUrl: dto.youtubeUrl || null,
        instagramUrl: dto.instagramUrl || null,
        leadership: dto.leadership ? (dto.leadership as any) : [],
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
    this.triggerRevalidate(['settings', 'home', 'visit', 'give', 'about']).catch((err) => {
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
