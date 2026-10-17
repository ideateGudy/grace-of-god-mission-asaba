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
import { TestimoniesService } from './testimonies.service.js';
import { PublicRoute } from '../auth/decorators/public-route.decorator.js';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator.js';
import { Throttle } from '@nestjs/throttler';
import {
  createTestimonySchema,
  updateTestimonySchema,
  type CreateTestimonyDto,
  type UpdateTestimonyDto,
  type TestimonyStatus,
} from '@ggm/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { AuthenticatedRequest } from '../common/types.js';

@Controller()
export class TestimoniesController {
  constructor(private readonly testimoniesService: TestimoniesService) {}

  @PublicRoute()
  @Throttle({ short: { limit: 5, ttl: 60000 }, long: { limit: 20, ttl: 3600000 } })
  @Post('testimonies')
  async create(
    @Body(new ZodValidationPipe(createTestimonySchema)) dto: CreateTestimonyDto,
  ) {
    return this.testimoniesService.createTestimony(dto);
  }

  @PublicRoute()
  @Get('testimonies')
  async listPublic(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
  ) {
    return this.testimoniesService.listPublic(page, limit);
  }

  @RequirePermissions('TESTIMONIES_MANAGE')
  @Get('admin/testimonies')
  async listAdmin(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: TestimonyStatus,
  ) {
    return this.testimoniesService.listAdmin(status, page, limit);
  }

  @RequirePermissions('TESTIMONIES_MANAGE')
  @Patch('admin/testimonies/:id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateTestimonySchema)) dto: UpdateTestimonyDto,
  ) {
    const data = await this.testimoniesService.update(req.activeUser, id, dto);
    return { data };
  }

  @RequirePermissions('TESTIMONIES_MANAGE')
  @Delete('admin/testimonies/:id')
  async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.testimoniesService.delete(req.activeUser, id);
    return { data: null };
  }
}
