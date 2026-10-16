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
import { ProjectsService } from './projects.service.js';
import { PublicRoute } from '../auth/decorators/public-route.decorator.js';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator.js';
import {
  createProjectSchema,
  updateProjectSchema,
  recordOfflineContributionSchema,
  type CreateProjectDto,
  type UpdateProjectDto,
  type RecordOfflineContributionDto,
} from '@ggm/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { AuthenticatedRequest } from '../common/types.js';

@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @PublicRoute()
  @Get('projects')
  async listPublic(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
  ) {
    return this.projectsService.listPublic(page, limit);
  }

  @PublicRoute()
  @Get('projects/:slug')
  async getPublicBySlug(@Param('slug') slug: string) {
    const data = await this.projectsService.getPublicBySlug(slug);
    return { data };
  }

  @PublicRoute()
  @Get('projects/:slug/contributions')
  async getPublicContributions(
    @Param('slug') slug: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.projectsService.getPublicContributions(slug, page, limit);
  }

  @RequirePermissions('PROJECTS_MANAGE')
  @Get('admin/projects')
  async listAdmin(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.projectsService.listAdmin(page, limit);
  }

  @RequirePermissions('PROJECTS_MANAGE')
  @Get('admin/projects/:id')
  async getAdmin(@Param('id') id: string) {
    const data = await this.projectsService.getAdmin(id);
    return { data };
  }

  @RequirePermissions('PROJECTS_MANAGE')
  @Post('admin/projects')
  async create(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createProjectSchema)) dto: CreateProjectDto,
  ) {
    const data = await this.projectsService.create(req.activeUser, dto);
    return { data };
  }

  @RequirePermissions('PROJECTS_MANAGE')
  @Patch('admin/projects/:id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProjectSchema)) dto: UpdateProjectDto,
  ) {
    const data = await this.projectsService.update(req.activeUser, id, dto);
    return { data };
  }

  @RequirePermissions('PROJECTS_MANAGE')
  @Delete('admin/projects/:id')
  async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.projectsService.delete(req.activeUser, id);
  }

  @RequirePermissions('PROJECTS_MANAGE')
  @Post('admin/projects/:id/contributions')
  async recordOfflineContribution(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(recordOfflineContributionSchema)) dto: RecordOfflineContributionDto,
  ) {
    const data = await this.projectsService.recordOfflineContribution(req.activeUser, id, dto);
    return { data };
  }
}
