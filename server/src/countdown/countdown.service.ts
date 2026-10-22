import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'node:events';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { ConfigService } from '@nestjs/config';
import { calculateSecondsUntilTarget, calculateSecondsUntilDate } from '@ggm/types';
import type { AuthenticatedActor } from '../common/types.js';
import type { UpdateCountdownDto, PublicCountdownDto } from '@ggm/types';

const DEFAULT_COUNTDOWN: PublicCountdownDto = {
  title: 'SUNDAY CELEBRATION SERVICE',
  subtitle: 'Service Starts In...',
  scriptureRef: 'ISAIAH 60:1',
  scriptureText: 'Arise, shine; for thy light is come, and the glory of the LORD is risen upon thee.',
  mode: 'target-time',
  targetTimeString: '08:00',
  targetDate: '',
  durationSeconds: 1800,
  theme: 'royal-gold',
  soundEnabled: true,
  overtimeEnabled: false,
  showScripture: false,
  showLogo: true,
  stageMode: false,
  isRunning: true,
  remainingSeconds: 1800,
  targetEndTime: null,
  updatedAt: new Date().toISOString(),
};

@Injectable()
export class CountdownService {
  private readonly logger = new Logger(CountdownService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly configService: ConfigService,
  ) {}

  async getCountdown(): Promise<PublicCountdownDto> {
    const settings = await this.prisma.siteSetting.findUnique({
      where: { id: 'default' },
    });

    const raw = settings?.countdown as Partial<PublicCountdownDto> | null;
    if (!raw) {
      const initial = { ...DEFAULT_COUNTDOWN };
      initial.remainingSeconds = calculateSecondsUntilTarget(initial.targetTimeString);
      return initial;
    }

    const mode = raw.mode || DEFAULT_COUNTDOWN.mode;
    const isRunning = raw.isRunning !== undefined ? raw.isRunning : true;
    let remainingSeconds = raw.remainingSeconds ?? DEFAULT_COUNTDOWN.remainingSeconds;
    const targetEndTime = raw.targetEndTime ? Number(raw.targetEndTime) : null;

    if (mode === 'event-date') {
      if (raw.targetDate) {
        remainingSeconds = calculateSecondsUntilDate(raw.targetDate);
      } else {
        remainingSeconds = calculateSecondsUntilTarget(raw.targetTimeString || '08:00');
      }
    } else if (mode === 'target-time') {
      remainingSeconds = calculateSecondsUntilTarget(raw.targetTimeString || '08:00');
    } else if ((mode === 'activity' || mode === 'duration') && isRunning && targetEndTime) {
      remainingSeconds = Math.round((targetEndTime - Date.now()) / 1000);
      if (!raw.overtimeEnabled && remainingSeconds <= 0) {
        remainingSeconds = 0;
      }
    }

    return {
      title: raw.title || DEFAULT_COUNTDOWN.title,
      subtitle: raw.subtitle || DEFAULT_COUNTDOWN.subtitle,
      scriptureRef: raw.scriptureRef || DEFAULT_COUNTDOWN.scriptureRef,
      scriptureText: raw.scriptureText || DEFAULT_COUNTDOWN.scriptureText,
      mode,
      targetTimeString: raw.targetTimeString || DEFAULT_COUNTDOWN.targetTimeString,
      targetDate: raw.targetDate || DEFAULT_COUNTDOWN.targetDate,
      durationSeconds: raw.durationSeconds ?? DEFAULT_COUNTDOWN.durationSeconds,
      theme: raw.theme || DEFAULT_COUNTDOWN.theme,
      soundEnabled: raw.soundEnabled ?? DEFAULT_COUNTDOWN.soundEnabled,
      overtimeEnabled: raw.overtimeEnabled ?? DEFAULT_COUNTDOWN.overtimeEnabled,
      showScripture: raw.showScripture ?? DEFAULT_COUNTDOWN.showScripture,
      showLogo: raw.showLogo ?? DEFAULT_COUNTDOWN.showLogo,
      stageMode: raw.stageMode ?? DEFAULT_COUNTDOWN.stageMode,
      isRunning,
      remainingSeconds,
      targetEndTime,
      updatedAt: raw.updatedAt || settings?.updatedAt?.toISOString() || new Date().toISOString(),
      activeType: raw.activeType,
      previewType: raw.previewType,
      scripture: raw.scripture,
      mediaList: raw.mediaList,
      activeMediaId: raw.activeMediaId,
      overlay: raw.overlay,
      camera: raw.camera,
      isBlackout: raw.isBlackout,
      transitionType: raw.transitionType,
      transitionDurationMs: raw.transitionDurationMs,
    };
  }

  async updateCountdown(actor: AuthenticatedActor, dto: UpdateCountdownDto): Promise<PublicCountdownDto> {
    const current = await this.getCountdown();

    const mode = dto.mode ?? current.mode;
    const isRunning = dto.isRunning !== undefined ? dto.isRunning : current.isRunning;
    const durationSeconds = dto.durationSeconds ?? current.durationSeconds;
    let remainingSeconds = dto.remainingSeconds !== undefined ? dto.remainingSeconds : current.remainingSeconds;

    let targetEndTime: number | null = null;
    if (mode === 'activity' || mode === 'duration') {
      if (isRunning) {
        targetEndTime = Date.now() + Math.max(remainingSeconds, 0) * 1000;
      }
    } else if (mode === 'event-date') {
      const dateToCalc = dto.targetDate ?? current.targetDate;
      if (dateToCalc) {
        remainingSeconds = calculateSecondsUntilDate(dateToCalc);
      } else {
        remainingSeconds = calculateSecondsUntilTarget(dto.targetTimeString ?? current.targetTimeString);
      }
    } else {
      remainingSeconds = calculateSecondsUntilTarget(dto.targetTimeString ?? current.targetTimeString);
    }

    const payloadToSave: PublicCountdownDto = {
      title: dto.title ?? current.title,
      subtitle: dto.subtitle ?? current.subtitle,
      scriptureRef: dto.scriptureRef ?? current.scriptureRef,
      scriptureText: dto.scriptureText ?? current.scriptureText,
      mode,
      targetTimeString: dto.targetTimeString ?? current.targetTimeString,
      targetDate: dto.targetDate ?? current.targetDate ?? '',
      durationSeconds,
      theme: dto.theme ?? current.theme,
      soundEnabled: dto.soundEnabled ?? current.soundEnabled,
      overtimeEnabled: dto.overtimeEnabled ?? current.overtimeEnabled,
      showScripture: dto.showScripture ?? current.showScripture,
      showLogo: dto.showLogo ?? current.showLogo,
      stageMode: dto.stageMode ?? current.stageMode,
      isRunning,
      remainingSeconds,
      targetEndTime,
      updatedAt: new Date().toISOString(),
      activeType: dto.activeType ?? current.activeType,
      previewType: dto.previewType ?? current.previewType,
      scripture: dto.scripture ?? current.scripture,
      mediaList: dto.mediaList ?? current.mediaList,
      activeMediaId: dto.activeMediaId ?? current.activeMediaId,
      overlay: dto.overlay ?? current.overlay,
      camera: dto.camera ?? current.camera,
      isBlackout: dto.isBlackout !== undefined ? dto.isBlackout : current.isBlackout,
      transitionType: dto.transitionType ?? current.transitionType,
      transitionDurationMs: dto.transitionDurationMs ?? current.transitionDurationMs,
    };

    await this.prisma.siteSetting.upsert({
      where: { id: 'default' },
      update: {
        countdown: payloadToSave as any,
      },
      create: {
        id: 'default',
        countdown: payloadToSave as any,
      },
    });

    await this.audit.log({
      actorId: actor?.id,
      actorName: actor?.name,
      action: 'countdown.update',
      entity: 'SiteSetting',
      entityId: 'default',
      meta: {
        title: payloadToSave.title,
        mode: payloadToSave.mode,
        remainingSeconds: payloadToSave.remainingSeconds,
        isRunning: payloadToSave.isRunning,
      },
    });

    this.triggerRevalidate(['countdown']).catch(() => {});

    return payloadToSave;
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

  private readonly studioSignals = new Map<string, Array<{ type: string; sender: string; data: any; timestamp: number }>>();
  private readonly studioFrames = new Map<string, { frame: string; timestamp: number; label?: string }>();
  private readonly studioCameras = new Map<string, { id: string; label: string; lastSeen: number }>();
  public readonly studioEvents = new EventEmitter();

  sendStudioSignal(room: string, message: { type: string; sender: string; data: any }) {
    const list = this.studioSignals.get(room) || [];
    const signalItem = { ...message, timestamp: Date.now() };
    list.push(signalItem);
    if (list.length > 50) list.shift();
    this.studioSignals.set(room, list);
    this.studioEvents.emit(`signal:${room}`, signalItem);
    return { success: true };
  }

  getStudioSignals(room: string, since: number = 0) {
    const list = this.studioSignals.get(room) || [];
    return list.filter((m) => m.timestamp > since);
  }

  sendStudioFrame(room: string, frame: string, label?: string) {
    const now = Date.now();
    const frameObj = { frame, timestamp: now, label };
    this.studioFrames.set(room, frameObj);
    this.studioCameras.set(room, {
      id: room,
      label: label || `Camera (${room})`,
      lastSeen: now,
    });
    this.studioEvents.emit(`frame:${room}`, frameObj);
    return { success: true };
  }

  getStudioFrame(room: string) {
    return this.studioFrames.get(room) || null;
  }

  getStudioCameras() {
    const now = Date.now();
    // Prune cameras inactive for more than 15 seconds
    for (const [id, cam] of this.studioCameras.entries()) {
      if (now - cam.lastSeen > 15000) {
        this.studioCameras.delete(id);
        this.studioFrames.delete(id);
      }
    }
    return Array.from(this.studioCameras.values());
  }
}
