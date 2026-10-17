import { Controller, Get, Patch, Body, Req } from '@nestjs/common';
import { CountdownService } from './countdown.service.js';
import { PublicRoute } from '../auth/decorators/public-route.decorator.js';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator.js';
import { updateCountdownSchema, type UpdateCountdownDto } from '@ggm/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { AuthenticatedRequest } from '../common/types.js';

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
}
