import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  Req,
  Res,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { GivingService } from './giving.service.js';
import { PublicRoute } from '../auth/decorators/public-route.decorator.js';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator.js';
import { initializeGivingSchema, type InitializeGivingDto } from '@ggm/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';

@Controller()
export class GivingController {
  constructor(private readonly givingService: GivingService) {}

  @PublicRoute()
  @Post('giving/initialize')
  async initialize(
    @Req() req: Request,
    @Body(new ZodValidationPipe(initializeGivingSchema)) dto: InitializeGivingDto,
  ) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const origin = (req.headers['origin'] as string) || (req.headers['referer'] as string);
    const data = await this.givingService.initialize(dto, ip, origin);
    return { data };
  }

  @PublicRoute()
  @Get('giving/status/:reference')
  async getStatus(@Param('reference') reference: string) {
    const data = await this.givingService.verifyPayment(reference);
    return { data };
  }

  @PublicRoute()
  @Post('webhooks/paystack')
  async handleWebhook(
    @Req() req: Request,
    @Headers('x-paystack-signature') signature: string,
  ) {
    // req.body or rawBody buffer depending on middleware
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    return this.givingService.handlePaystackWebhook(rawBody, signature);
  }

  @RequirePermissions('GIVING_MANAGE')
  @Get('admin/contributions')
  async listAdmin(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
  ) {
    return this.givingService.listAdminContributions(page, limit, projectId, status);
  }

  @RequirePermissions('GIVING_MANAGE')
  @Get('admin/contributions/export')
  async exportCsv(
    @Res() res: Response,
    @Query('projectId') projectId?: string,
  ) {
    const csvData = await this.givingService.exportContributionsCsv(projectId);
    const filename = `contributions-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csvData);
  }
}
