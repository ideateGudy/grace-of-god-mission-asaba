import { Controller, Get, Patch, Body, Req } from '@nestjs/common';
import { SettingsService } from './settings.service.js';
import { PublicRoute } from '../auth/decorators/public-route.decorator.js';
import { SuperAdminOnly } from '../auth/decorators/super-admin-only.decorator.js';
import { updateSiteSettingsSchema, type UpdateSiteSettingsDto } from '@ggm/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { AuthenticatedRequest } from '../common/types.js';

@Controller()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @PublicRoute()
  @Get('settings')
  async getSettings() {
    const data = await this.settingsService.getSettings();
    return { data };
  }

  @SuperAdminOnly()
  @Patch('admin/settings')
  async updateSettings(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(updateSiteSettingsSchema)) dto: UpdateSiteSettingsDto,
  ) {
    const data = await this.settingsService.updateSettings(req.activeUser, dto);
    return { data };
  }
}
