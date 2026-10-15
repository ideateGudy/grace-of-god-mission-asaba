import { Controller, Post, Body, Req } from '@nestjs/common';
import { UploadsService } from './uploads.service.js';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator.js';

@Controller('admin/uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @RequirePermissions('GALLERY_MANAGE', 'SERMONS_MANAGE', 'EVENTS_MANAGE', 'ANNOUNCEMENTS_MANAGE', 'HERO_MANAGE')
  @Post('signature')
  async getSignature(
    @Req() _req: any,
    @Body() body?: { scope?: string; publicId?: string },
  ) {
    const data = await this.uploadsService.getSignature(body?.scope, body?.publicId);
    return { data };
  }
}
