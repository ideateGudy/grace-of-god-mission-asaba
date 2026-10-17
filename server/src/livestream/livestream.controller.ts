import { Controller, Get, Patch, Body, Req } from '@nestjs/common';
import { LivestreamService } from './livestream.service.js';
import { PublicRoute } from '../auth/decorators/public-route.decorator.js';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator.js';
import { updateLivestreamSchema, type UpdateLivestreamDto } from '@ggm/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { AuthenticatedRequest } from '../common/types.js';

@Controller()
export class LivestreamController {
  constructor(private readonly livestreamService: LivestreamService) {}

  @PublicRoute()
  @Get('livestream')
  async getStatus() {
    const data = await this.livestreamService.getStatus();
    return { data };
  }

  @RequirePermissions('LIVESTREAM_MANAGE')
  @Patch('admin/livestream')
  async updateStatus(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(updateLivestreamSchema)) dto: UpdateLivestreamDto,
  ) {
    const data = await this.livestreamService.updateStatus(req.activeUser, dto);
    return { data };
  }
}
