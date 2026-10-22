import { Controller, Get, Patch, Post, Body, Req, Param, Query, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SkipThrottle } from '@nestjs/throttler';
import { CountdownService } from './countdown.service.js';
import { PublicRoute } from '../auth/decorators/public-route.decorator.js';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator.js';
import { updateCountdownSchema, type UpdateCountdownDto } from '@ggm/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { AuthenticatedRequest } from '../common/types.js';

@SkipThrottle()
@Controller()
export class CountdownController {
  constructor(private readonly countdownService: CountdownService) {}

  @PublicRoute()
  @Get('countdown')
  async getCountdown() {
    const data = await this.countdownService.getCountdown();
    return { data };
  }

  @RequirePermissions('LIVESTREAM_MANAGE')
  @Patch('admin/countdown')
  async updateCountdown(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(updateCountdownSchema)) dto: UpdateCountdownDto,
  ) {
    const data = await this.countdownService.updateCountdown(req.activeUser, dto);
    return { data };
  }

  @PublicRoute()
  @Post('studio/signal/:room')
  sendStudioSignal(
    @Param('room') room: string,
    @Body() body: { type: string; sender: string; data: any },
  ) {
    return this.countdownService.sendStudioSignal(room, body);
  }

  @PublicRoute()
  @Get('studio/signal/:room')
  getStudioSignals(
    @Param('room') room: string,
    @Query('since') since?: string,
  ) {
    const sinceNum = since ? Number(since) : 0;
    return { data: this.countdownService.getStudioSignals(room, sinceNum) };
  }

  @PublicRoute()
  @Post('studio/frame/:room')
  sendStudioFrame(
    @Param('room') room: string,
    @Body() body: { frame: string; label?: string },
  ) {
    return this.countdownService.sendStudioFrame(room, body?.frame || '', body?.label);
  }

  @PublicRoute()
  @Get('studio/frame/:room')
  getStudioFrame(@Param('room') room: string) {
    return { data: this.countdownService.getStudioFrame(room) };
  }

  @PublicRoute()
  @Sse('studio/stream/:room')
  streamStudio(@Param('room') room: string): Observable<{ data: any }> {
    return new Observable((observer) => {
      // Send immediate latest frame if present
      const current = this.countdownService.getStudioFrame(room);
      if (current) {
        observer.next({ data: { type: 'frame', ...current } });
      }

      const onFrame = (frameObj: any) => {
        observer.next({ data: { type: 'frame', ...frameObj } });
      };

      const onSignal = (signalObj: any) => {
        observer.next({ data: { type: 'signal', ...signalObj } });
      };

      this.countdownService.studioEvents.on(`frame:${room}`, onFrame);
      this.countdownService.studioEvents.on(`signal:${room}`, onSignal);

      return () => {
        this.countdownService.studioEvents.off(`frame:${room}`, onFrame);
        this.countdownService.studioEvents.off(`signal:${room}`, onSignal);
      };
    });
  }

  @PublicRoute()
  @Get('studio/cameras')
  getStudioCameras() {
    return { data: this.countdownService.getStudioCameras() };
  }
}
