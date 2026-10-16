import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, ParseIntPipe, DefaultValuePipe, ParseEnumPipe } from '@nestjs/common';
import { MessagesService } from './messages.service.js';
import { PublicRoute } from '../auth/decorators/public-route.decorator.js';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator.js';
import { SuperAdminOnly } from '../auth/decorators/super-admin-only.decorator.js';
import { MessageStatus } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';
import { createContactSchema, createPrayerSchema, type CreateContactDto, type CreatePrayerDto } from '@ggm/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { AuthenticatedRequest } from '../common/types.js';

@Controller()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @PublicRoute()
  @Throttle({ short: { limit: 5, ttl: 60000 }, long: { limit: 30, ttl: 3600000 } })
  @Post('contact')
  async createContact(
    @Body(new ZodValidationPipe(createContactSchema)) dto: CreateContactDto,
  ) {
    return this.messagesService.createContact(dto);
  }

  @PublicRoute()
  @Throttle({ short: { limit: 5, ttl: 60000 }, long: { limit: 30, ttl: 3600000 } })
  @Post('prayer-requests')
  async createPrayer(
    @Body(new ZodValidationPipe(createPrayerSchema)) dto: CreatePrayerDto,
  ) {
    return this.messagesService.createPrayer(dto);
  }

  @RequirePermissions('CONTACT_INBOX')
  @Get('admin/contact')
  async listContact(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('status') status?: MessageStatus,
  ) {
    return this.messagesService.listContact(status, page, limit);
  }

  @RequirePermissions('CONTACT_INBOX')
  @Patch('admin/contact/:id')
  async updateContactStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body('status', new ParseEnumPipe(MessageStatus)) status: MessageStatus,
  ) {
    const data = await this.messagesService.updateContactStatus(req.activeUser, id, status);
    return { data };
  }

  @SuperAdminOnly()
  @Delete('admin/contact/:id')
  async deleteContact(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.messagesService.deleteContact(req.activeUser, id);
    return { data: null };
  }

  @RequirePermissions('PRAYER_INBOX')
  @Get('admin/prayer-requests')
  async listPrayer(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('status') status?: MessageStatus,
  ) {
    return this.messagesService.listPrayer(status, page, limit);
  }

  @RequirePermissions('PRAYER_INBOX')
  @Patch('admin/prayer-requests/:id')
  async updatePrayerStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body('status', new ParseEnumPipe(MessageStatus)) status: MessageStatus,
  ) {
    const data = await this.messagesService.updatePrayerStatus(req.activeUser, id, status);
    return { data };
  }

  @SuperAdminOnly()
  @Delete('admin/prayer-requests/:id')
  async deletePrayer(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.messagesService.deletePrayer(req.activeUser, id);
    return { data: null };
  }

  @RequirePermissions()
  @Get('admin/stats')
  async getStats(@Req() req: AuthenticatedRequest) {
    return this.messagesService.getStats(req.activeUser);
  }
}
