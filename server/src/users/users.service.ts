import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AdminRole, Permission } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private generatePassword(): string {
    return crypto.randomBytes(16).toString('base64').slice(0, 20); // 20+ chars
  }

  async listUsers() {
    const users = await this.prisma.adminUser.findMany({
      orderBy: [
        { role: 'asc' },
        { name: 'asc' },
      ],
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        isActive: true,
        mustChangePassword: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    return users.map(user => ({
      ...user,
      status: !user.isActive 
        ? 'Deactivated' 
        : user.mustChangePassword 
          ? 'Must change password' 
          : 'Active',
    }));
  }

  async getUser(id: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        isActive: true,
        mustChangePassword: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createUser(actor: any, dto: { name: string; email: string; permissions: Permission[] }) {
    const tempPassword = this.generatePassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const user = await this.prisma.adminUser.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        role: AdminRole.ADMIN,
        permissions: dto.permissions,
        mustChangePassword: true,
        isActive: true,
        createdById: actor.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        isActive: true,
        mustChangePassword: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    await this.audit.log({
      actorId: actor.id,
      actorName: actor.name,
      action: 'user.create',
      entity: 'AdminUser',
      entityId: user.id,
    });

    return { user, temporaryPassword: tempPassword };
  }

  async updateUser(actor: any, id: string, dto: { name?: string; permissions?: Permission[]; isActive?: boolean }) {
    const targetUser = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!targetUser) throw new NotFoundException('User not found');

    if (targetUser.role === AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot edit the super-admin user');
    }

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.permissions !== undefined) data.permissions = dto.permissions;
    
    let bumpedVersion = false;
    if (dto.isActive !== undefined && targetUser.isActive !== dto.isActive) {
      data.isActive = dto.isActive;
      if (!dto.isActive) {
        data.tokenVersion = targetUser.tokenVersion + 1;
        bumpedVersion = true;
      }
    }

    const updated = await this.prisma.adminUser.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        isActive: true,
        mustChangePassword: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    await this.audit.log({
      actorId: actor.id,
      actorName: actor.name,
      action: 'user.update',
      entity: 'AdminUser',
      entityId: id,
      meta: { fields: Object.keys(dto), deactivated: bumpedVersion },
    });

    return updated;
  }

  async deleteUser(actor: any, id: string) {
    const targetUser = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!targetUser) throw new NotFoundException('User not found');

    if (targetUser.role === AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot delete the super-admin user');
    }

    await this.prisma.adminUser.delete({ where: { id } });

    await this.audit.log({
      actorId: actor.id,
      actorName: actor.name,
      action: 'user.delete',
      entity: 'AdminUser',
      entityId: id,
      meta: { email: targetUser.email, name: targetUser.name },
    });
  }

  async resetPassword(actor: any, id: string) {
    const targetUser = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!targetUser) throw new NotFoundException('User not found');

    if (targetUser.role === AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot reset the super-admin via this endpoint');
    }

    const tempPassword = this.generatePassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    await this.prisma.adminUser.update({
      where: { id },
      data: {
        passwordHash,
        tokenVersion: targetUser.tokenVersion + 1,
        mustChangePassword: true,
      },
    });

    await this.audit.log({
      actorId: actor.id,
      actorName: actor.name,
      action: 'user.reset_password',
      entity: 'AdminUser',
      entityId: id,
    });

    return { temporaryPassword: tempPassword };
  }

  async listAudit(page: number = 1, limit: number = 12, actorId?: string, entity?: string) {
    const where: any = {};
    if (actorId) where.actorId = actorId;
    if (entity) where.entity = entity;

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total },
    };
  }
}
