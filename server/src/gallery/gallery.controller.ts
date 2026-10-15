import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { GalleryService } from './gallery.service.js';
import { PublicRoute } from '../auth/decorators/public-route.decorator.js';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator.js';
import {
  createGalleryImageSchema,
  reorderGallerySchema,
  type CreateGalleryImageDto,
  type UpdateGalleryImageDto,
  type ReorderGalleryDto,
} from '@ggm/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { AuthenticatedRequest } from '../common/types.js';

@Controller()
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @PublicRoute()
  @Get('gallery')
  async listPublic(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('album') album?: string,
  ) {
    return this.galleryService.listPublic(page, limit, album);
  }

  @RequirePermissions('GALLERY_MANAGE')
  @Get('admin/gallery')
  async listAdmin(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
  ) {
    return this.galleryService.listAdmin(page, limit);
  }

  @RequirePermissions('GALLERY_MANAGE')
  @Post('admin/gallery/reorder')
  async reorder(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(reorderGallerySchema)) dto: ReorderGalleryDto,
  ) {
    const data = await this.galleryService.reorder(req.activeUser, dto.ids);
    return { data };
  }

  @RequirePermissions('GALLERY_MANAGE')
  @Get('admin/gallery/:id')
  async getAdmin(@Param('id') id: string) {
    const data = await this.galleryService.getAdmin(id);
    return { data };
  }

  @RequirePermissions('GALLERY_MANAGE')
  @Post('admin/gallery')
  async create(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createGalleryImageSchema)) dto: CreateGalleryImageDto,
  ) {
    const data = await this.galleryService.create(req.activeUser, dto);
    return { data };
  }

  @RequirePermissions('GALLERY_MANAGE')
  @Patch('admin/gallery/:id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(createGalleryImageSchema.partial())) dto: UpdateGalleryImageDto,
  ) {
    const data = await this.galleryService.update(req.activeUser, id, dto);
    return { data };
  }

  @RequirePermissions('GALLERY_MANAGE')
  @Delete('admin/gallery/:id')
  async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.galleryService.delete(req.activeUser, id);
    return { data: null };
  }
}
