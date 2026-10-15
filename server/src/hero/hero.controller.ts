import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { HeroService } from './hero.service.js';
import { PublicRoute } from '../auth/decorators/public-route.decorator.js';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator.js';
import { createHeroSchema, publishHeroSchema, updateHeroSchema, type CreateHeroDto, type PublishHeroDto, type UpdateHeroDto } from '@ggm/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { AuthenticatedRequest } from '../common/types.js';

@Controller()
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  @PublicRoute()
  @Get('hero')
  async getPublicHero() {
    return this.heroService.getPublicHero();
  }

  @RequirePermissions('HERO_MANAGE')
  @Get('admin/hero')
  async listAdmin() {
    return this.heroService.listAdmin();
  }

  @RequirePermissions('HERO_MANAGE')
  @Get('admin/hero/:id')
  async getAdmin(@Param('id') id: string) {
    const data = await this.heroService.getAdmin(id);
    return { data };
  }

  @RequirePermissions('HERO_MANAGE')
  @Post('admin/hero')
  async create(@Req() req: AuthenticatedRequest, @Body(new ZodValidationPipe(createHeroSchema)) dto: CreateHeroDto) {
    const data = await this.heroService.create(req.activeUser, dto);
    return { data };
  }

  @RequirePermissions('HERO_MANAGE')
  @Put('admin/hero/:id')
  async replace(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body(new ZodValidationPipe(updateHeroSchema)) dto: UpdateHeroDto) {
    const data = await this.heroService.replace(req.activeUser, id, dto);
    return { data };
  }

  @RequirePermissions('HERO_MANAGE')
  @Patch('admin/hero/:id/publish')
  async publish(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body(new ZodValidationPipe(publishHeroSchema)) dto: PublishHeroDto) {
    const { published } = dto;
    const data = await this.heroService.publish(req.activeUser, id, published);
    return { data };
  }

  @RequirePermissions('HERO_MANAGE')
  @Post('admin/hero/:id/duplicate')
  async duplicate(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const data = await this.heroService.duplicate(req.activeUser, id);
    return { data };
  }

  @RequirePermissions('HERO_MANAGE')
  @Delete('admin/hero/:id')
  async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.heroService.delete(req.activeUser, id);
    return { data: null };
  }
}
