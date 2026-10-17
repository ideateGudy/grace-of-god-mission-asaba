import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { ConfigService } from '@nestjs/config';
import type { AuthenticatedActor } from '../common/types.js';
import type { UpdateLivestreamDto, LivestreamStatusDto } from '@ggm/types';

@Injectable()
export class LivestreamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly configService: ConfigService,
  ) {}

  async getStatus(): Promise<LivestreamStatusDto> {
    const settings = await this.prisma.siteSetting.findUnique({
      where: { id: 'default' },
    });

    return {
      isLive: settings?.isLive ?? false,
      liveTitle: settings?.liveTitle ?? null,
      liveServiceType: settings?.liveServiceType ?? null,
      liveVideoUrl: settings?.liveVideoUrl ?? null,
      liveNotes: settings?.liveNotes ?? null,
      updatedAt: settings?.updatedAt ? settings.updatedAt.toISOString() : new Date().toISOString(),
    };
  }

  async updateStatus(actor: AuthenticatedActor, dto: UpdateLivestreamDto): Promise<LivestreamStatusDto> {
    const updated = await this.prisma.siteSetting.upsert({
      where: { id: 'default' },
      update: {
        isLive: dto.isLive,
        liveTitle: dto.liveTitle || null,
        liveServiceType: dto.liveServiceType || null,
        liveVideoUrl: dto.liveVideoUrl || null,
        liveNotes: dto.liveNotes || null,
      },
      create: {
        id: 'default',
        isLive: dto.isLive,
        liveTitle: dto.liveTitle || null,
        liveServiceType: dto.liveServiceType || null,
        liveVideoUrl: dto.liveVideoUrl || null,
        liveNotes: dto.liveNotes || null,
      },
    });

    await this.audit.log({
      actorId: actor?.id,
      actorName: actor?.name,
      action: 'livestream.update',
      entity: 'SiteSetting',
      entityId: 'default',
      meta: { isLive: dto.isLive, liveTitle: dto.liveTitle },
    });

    this.triggerRevalidate(['livestream', 'settings', 'home']).catch(() => {});

    return {
      isLive: updated.isLive,
      liveTitle: updated.liveTitle,
      liveServiceType: updated.liveServiceType,
      liveVideoUrl: updated.liveVideoUrl,
      liveNotes: updated.liveNotes,
      updatedAt: updated.updatedAt.toISOString(),
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
