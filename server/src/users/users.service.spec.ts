import { ForbiddenException } from '@nestjs/common';
import { AdminRole, Permission } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  const adminUser = {
    findUnique: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  };
  const audit = { log: vi.fn().mockResolvedValue(undefined) };
  const service = new UsersService({ adminUser } as never, audit as never);
  const actor = { id: 'actor-1', name: 'Owner' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a regular admin with only the selected permissions and a forced password change', async () => {
    const permissions = [Permission.SERMONS_MANAGE];
    adminUser.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: 'admin-1',
      email: data.email,
      name: data.name,
      role: data.role,
      permissions: data.permissions,
      isActive: data.isActive,
      mustChangePassword: data.mustChangePassword,
    }));

    const result = await service.createUser(actor, {
      name: 'New Admin', email: 'New.Admin@Example.test', permissions,
    });

    expect(adminUser.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        email: 'new.admin@example.test',
        role: AdminRole.ADMIN,
        permissions,
        mustChangePassword: true,
        isActive: true,
        createdById: actor.id,
      }),
      select: expect.not.objectContaining({ passwordHash: true }),
    }));
    expect(result.temporaryPassword).toHaveLength(20);
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'user.create', entityId: 'admin-1' }));
  });

  it('blocks changes to a super-admin account', async () => {
    adminUser.findUnique.mockResolvedValue({ id: 'root', role: AdminRole.SUPER_ADMIN });

    await expect(service.updateUser(actor, 'root', { name: 'Changed' }))
      .rejects.toBeInstanceOf(ForbiddenException);
    expect(adminUser.update).not.toHaveBeenCalled();
  });

  it('increments tokenVersion when deactivating an admin to invalidate existing sessions', async () => {
    adminUser.findUnique.mockResolvedValue({
      id: 'admin-1', role: AdminRole.ADMIN, isActive: true, tokenVersion: 4,
    });
    adminUser.update.mockResolvedValue({ id: 'admin-1', isActive: false });

    await service.updateUser(actor, 'admin-1', { isActive: false });

    expect(adminUser.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'admin-1' },
      data: { isActive: false, tokenVersion: 5 },
    }));
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({
      action: 'user.update', meta: { fields: ['isActive'], deactivated: true },
    }));
  });

  it('updates permissions for an existing admin without bumping tokenVersion', async () => {
    adminUser.findUnique.mockResolvedValue({
      id: 'admin-1', role: AdminRole.ADMIN, isActive: true, tokenVersion: 4, permissions: [Permission.SERMONS_MANAGE],
    });
    adminUser.update.mockResolvedValue({ id: 'admin-1', permissions: [Permission.SERMONS_MANAGE, Permission.GALLERY_MANAGE] });

    await service.updateUser(actor, 'admin-1', { permissions: [Permission.SERMONS_MANAGE, Permission.GALLERY_MANAGE] });

    expect(adminUser.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'admin-1' },
      data: { permissions: [Permission.SERMONS_MANAGE, Permission.GALLERY_MANAGE] },
    }));
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({
      action: 'user.update', meta: { fields: ['permissions'], deactivated: false },
    }));
  });
});

