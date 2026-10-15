import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { EventsService } from './events.service.js';
import { PublicRoute } from '../auth/decorators/public-route.decorator.js';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator.js';
import { createEventSchema, type CreateEventDto, type UpdateEventDto } from '@ggm/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { AuthenticatedRequest } from '../common/types.js';

@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @PublicRoute()
  @Get('events')
  async listPublic(
    @Query('scope') scope: 'upcoming' | 'past' = 'upcoming',
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
  ) {
    return this.eventsService.listPublic(scope, page, limit);
  }

  @PublicRoute()
  @Get('events/:slug')
  async getPublicBySlug(@Param('slug') slug: string) {
    const data = await this.eventsService.getPublicBySlug(slug);
    return { data };
  }

  @RequirePermissions('EVENTS_MANAGE')
  @Get('admin/events')
  async listAdmin(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
  ) {
    return this.eventsService.listAdmin(page, limit);
  }

  @RequirePermissions('EVENTS_MANAGE')
  @Get('admin/events/:id')
  async getAdmin(@Param('id') id: string) {
    const data = await this.eventsService.getAdmin(id);
    return { data };
  }

  @RequirePermissions('EVENTS_MANAGE')
  @Post('admin/events')
  async create(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createEventSchema)) dto: CreateEventDto,
  ) {
    const data = await this.eventsService.create(req.activeUser, dto);
    return { data };
  }

  @RequirePermissions('EVENTS_MANAGE')
  @Patch('admin/events/:id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(createEventSchema.partial())) dto: UpdateEventDto,
  ) {
    const data = await this.eventsService.update(req.activeUser, id, dto);
    return { data };
  }

  @RequirePermissions('EVENTS_MANAGE')
  @Delete('admin/events/:id')
  async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.eventsService.delete(req.activeUser, id);
    return { data: null };
  }
}
