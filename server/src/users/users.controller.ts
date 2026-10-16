import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, Res, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from './users.service.js';
import { SuperAdminOnly } from '../auth/decorators/super-admin-only.decorator.js';
import { createAdminUserSchema, updateAdminUserSchema, type CreateAdminUserDto, type UpdateAdminUserDto } from '@ggm/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { AuthenticatedRequest } from '../common/types.js';

@Controller('admin')
@SuperAdminOnly()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users')
  async listUsers() {
    const data = await this.usersService.listUsers();
    return { data };
  }

  @Post('users')
  async createUser(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createAdminUserSchema)) dto: CreateAdminUserDto,
  ) {
    const data = await this.usersService.createUser(req.activeUser, dto);
    return { data };
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    const data = await this.usersService.getUser(id);
    return { data };
  }

  @Patch('users/:id')
  async updateUser(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateAdminUserSchema)) dto: UpdateAdminUserDto,
  ) {
    const data = await this.usersService.updateUser(req.activeUser, id, dto);
    return { data };
  }

  @Delete('users/:id')
  async deleteUser(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.usersService.deleteUser(req.activeUser, id);
    return { data: null };
  }

  @Post('users/:id/reset-password')
  async resetPassword(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const data = await this.usersService.resetPassword(req.activeUser, id);
    return { data };
  }

  @Get('audit/export')
  async exportAuditCsv(
    @Res() res: Response,
    @Query('actorId') actorId?: string,
    @Query('entity') entity?: string,
  ) {
    const csvData = await this.usersService.exportAuditCsv(actorId, entity);
    const filename = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csvData);
  }

  @Get('audit')
  async listAudit(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('actorId') actorId?: string,
    @Query('entity') entity?: string,
  ) {
    return this.usersService.listAudit(page, limit, actorId, entity);
  }
}
