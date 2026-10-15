import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { SermonsService } from './sermons.service.js';
import { PublicRoute } from '../auth/decorators/public-route.decorator.js';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator.js';
import { createSermonSchema } from '@ggm/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';

@Controller()
export class SermonsController {
  constructor(private readonly sermonsService: SermonsService) {}

  @PublicRoute()
  @Get('sermons')
  async listPublic(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('q') q?: string,
    @Query('series') series?: string,
  ) {
    return this.sermonsService.listPublic(page, limit, q, series);
  }

  @PublicRoute()
  @Get('sermons/:slug')
  async getPublicBySlug(@Param('slug') slug: string) {
    const data = await this.sermonsService.getPublicBySlug(slug);
    return { data };
  }

  @RequirePermissions('SERMONS_MANAGE')
  @Get('admin/sermons')
  async listAdmin(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
  ) {
    return this.sermonsService.listAdmin(page, limit);
  }

  @RequirePermissions('SERMONS_MANAGE')
  @Get('admin/sermons/:id')
  async getAdmin(@Param('id') id: string) {
    const data = await this.sermonsService.getAdmin(id);
    return { data };
  }

  @RequirePermissions('SERMONS_MANAGE')
  @Post('admin/sermons')
  async create(@Req() req: any, @Body(new ZodValidationPipe(createSermonSchema)) dto: any) {
    const data = await this.sermonsService.create(req.activeUser, dto);
    return { data };
  }

  @RequirePermissions('SERMONS_MANAGE')
  @Patch('admin/sermons/:id')
  async update(@Req() req: any, @Param('id') id: string, @Body(new ZodValidationPipe(createSermonSchema.partial())) dto: any) {
    const data = await this.sermonsService.update(req.activeUser, id, dto);
    return { data };
  }

  @RequirePermissions('SERMONS_MANAGE')
  @Delete('admin/sermons/:id')
  async delete(@Req() req: any, @Param('id') id: string) {
    await this.sermonsService.delete(req.activeUser, id);
    return { data: null };
  }
}
