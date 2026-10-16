import { Controller, Post, Body, Req } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { UploadsService } from './uploads.service.js';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator.js';
import type { AuthenticatedRequest } from '../common/types.js';

@SkipThrottle()
@Controller('admin/uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @RequirePermissions('GALLERY_MANAGE', 'SERMONS_MANAGE', 'EVENTS_MANAGE', 'ANNOUNCEMENTS_MANAGE', 'HERO_MANAGE')
  @Post('signature')
  async getSignature(
    @Req() _req: AuthenticatedRequest,
    @Body() body?: { scope?: string; publicId?: string },
  ) {
    const data = await this.uploadsService.getSignature(body?.scope, body?.publicId);
    return { data };
  }
}
