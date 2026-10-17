import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { DevotionsService } from './devotions.service.js';
import { PublicRoute } from '../auth/decorators/public-route.decorator.js';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator.js';
import {
  createDevotionSchema,
  updateDevotionSchema,
  type CreateDevotionDto,
  type UpdateDevotionDto,
} from '@ggm/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { AuthenticatedRequest } from '../common/types.js';

@Controller()
export class DevotionsController {
  constructor(private readonly devotionsService: DevotionsService) {}

  @PublicRoute()
  @Get('devotions/today')
  async getToday() {
    const data = await this.devotionsService.getTodayDevotion();
    return { data };
  }

  @PublicRoute()
  @Get('devotions')
  async listPublic(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.devotionsService.listPublic(page, limit);
  }

  @PublicRoute()
  @Get('devotions/:id')
  async getById(@Param('id') id: string) {
    const data = await this.devotionsService.getById(id);
    return { data };
  }

  @RequirePermissions('DEVOTIONS_MANAGE')
  @Get('admin/devotions')
  async listAdmin(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.devotionsService.listAdmin(page, limit);
  }

  @RequirePermissions('DEVOTIONS_MANAGE')
  @Post('admin/devotions')
  async create(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createDevotionSchema)) dto: CreateDevotionDto,
  ) {
    const data = await this.devotionsService.create(req.activeUser, dto);
    return { data };
  }

  @RequirePermissions('DEVOTIONS_MANAGE')
  @Patch('admin/devotions/:id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateDevotionSchema)) dto: UpdateDevotionDto,
  ) {
    const data = await this.devotionsService.update(req.activeUser, id, dto);
    return { data };
  }

  @RequirePermissions('DEVOTIONS_MANAGE')
  @Delete('admin/devotions/:id')
  async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.devotionsService.delete(req.activeUser, id);
    return { data: null };
  }
}
