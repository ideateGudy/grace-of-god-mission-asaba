import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service.js';
import { PublicRoute } from '../auth/decorators/public-route.decorator.js';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator.js';
import { createAnnouncementSchema } from '@ggm/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';

@Controller()
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @PublicRoute()
  @Get('announcements')
  async listPublic() {
    return this.announcementsService.listPublic();
  }

  @RequirePermissions('ANNOUNCEMENTS_MANAGE')
  @Get('admin/announcements')
  async listAdmin(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
  ) {
    return this.announcementsService.listAdmin(page, limit);
  }

  @RequirePermissions('ANNOUNCEMENTS_MANAGE')
  @Get('admin/announcements/:id')
  async getAdmin(@Param('id') id: string) {
    const data = await this.announcementsService.getAdmin(id);
    return { data };
  }

  @RequirePermissions('ANNOUNCEMENTS_MANAGE')
  @Post('admin/announcements')
  async create(@Req() req: any, @Body(new ZodValidationPipe(createAnnouncementSchema)) dto: any) {
    const data = await this.announcementsService.create(req.activeUser, dto);
    return { data };
  }

  @RequirePermissions('ANNOUNCEMENTS_MANAGE')
  @Patch('admin/announcements/:id')
  async update(@Req() req: any, @Param('id') id: string, @Body(new ZodValidationPipe(createAnnouncementSchema.partial())) dto: any) {
    const data = await this.announcementsService.update(req.activeUser, id, dto);
    return { data };
  }

  @RequirePermissions('ANNOUNCEMENTS_MANAGE')
  @Delete('admin/announcements/:id')
  async delete(@Req() req: any, @Param('id') id: string) {
    await this.announcementsService.delete(req.activeUser, id);
    return { data: null };
  }
}
