import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let superAdminCookie: string;
  let adminCookie: string;
  let superAdminId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.setGlobalPrefix('api/v1');
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.adminUser.deleteMany({});

    // Create Super Admin
    const superHash = await bcrypt.hash('superpass123', 12);
    const superAdmin = await prisma.adminUser.create({
      data: { email: 'super@test.com', name: 'Super', passwordHash: superHash, role: 'SUPER_ADMIN', isActive: true, mustChangePassword: false },
    });
    superAdminId = superAdmin.id;

    // Create Admin
    const adminHash = await bcrypt.hash('adminpass123', 12);
    await prisma.adminUser.create({
      data: { email: 'admin@test.com', name: 'Admin', passwordHash: adminHash, role: 'ADMIN', isActive: true, mustChangePassword: false },
    });

    const resSuper = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'super@test.com', password: 'superpass123' });
    superAdminCookie = resSuper.headers['set-cookie'][0];

    const resAdmin = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'admin@test.com', password: 'adminpass123' });
    adminCookie = resAdmin.headers['set-cookie'][0];
  });

  afterAll(async () => {
    await prisma.adminUser.deleteMany({});
    await app.close();
  });

  it('ADMIN should get 403 on /admin/users', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/admin/users')
      .set('Cookie', adminCookie)
      .expect(403);
  });

  it('SUPER_ADMIN should get 200 on /admin/users', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/users')
      .set('Cookie', superAdminCookie)
      .expect(200);
    expect(res.body.data.length).toBe(2);
  });

  it('SUPER_ADMIN creates a least-privilege admin and receives the temporary password once', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/admin/users')
      .set('Cookie', superAdminCookie)
      .send({ name: 'Sermon Editor', email: 'sermon-editor@test.com', permissions: ['SERMONS_MANAGE'] })
      .expect(201);

    expect(response.body.data.user).toMatchObject({
      email: 'sermon-editor@test.com',
      role: 'ADMIN',
      permissions: ['SERMONS_MANAGE'],
      isActive: true,
      mustChangePassword: true,
    });
    expect(response.body.data.temporaryPassword).toEqual(expect.any(String));
    expect(response.body.data.temporaryPassword.length).toBeGreaterThanOrEqual(20);

    const savedUser = await prisma.adminUser.findUnique({ where: { email: 'sermon-editor@test.com' } });
    expect(savedUser?.passwordHash).toBeTruthy();
    await expect(bcrypt.compare(response.body.data.temporaryPassword, savedUser!.passwordHash)).resolves.toBe(true);

    const listed = await request(app.getHttpServer())
      .get('/api/v1/admin/users')
      .set('Cookie', superAdminCookie)
      .expect(200);
    const listedUser = listed.body.data.find((user: { email: string }) => user.email === 'sermon-editor@test.com');
    expect(listedUser).toBeDefined();
    expect(listedUser).not.toHaveProperty('passwordHash');
    expect(listedUser).not.toHaveProperty('temporaryPassword');
  });

  it('protects the super-admin account from edits, deletion, and password reset', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/users/${superAdminId}`)
      .set('Cookie', superAdminCookie)
      .send({ isActive: false })
      .expect(403);

    await request(app.getHttpServer())
      .delete(`/api/v1/admin/users/${superAdminId}`)
      .set('Cookie', superAdminCookie)
      .expect(403);

    await request(app.getHttpServer())
      .post(`/api/v1/admin/users/${superAdminId}/reset-password`)
      .set('Cookie', superAdminCookie)
      .expect(403);
  });

  it('enforces the single-super-admin constraint in the database', async () => {
    const secondPasswordHash = await bcrypt.hash('another-super-password', 12);
    await expect(prisma.adminUser.create({
      data: {
        email: 'second-super@test.com',
        name: 'Second Super Admin',
        passwordHash: secondPasswordHash,
        role: 'SUPER_ADMIN',
        isActive: true,
        mustChangePassword: false,
      },
    })).rejects.toThrow();
  });

  it('resetting an admin password invalidates that admin’s active session', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/admin/users/${(await prisma.adminUser.findUniqueOrThrow({ where: { email: 'admin@test.com' } })).id}/reset-password`)
      .set('Cookie', superAdminCookie)
      .expect(201);

    expect(response.body.data.temporaryPassword).toEqual(expect.any(String));
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', adminCookie)
      .expect(401);

    const resetUser = await prisma.adminUser.findUniqueOrThrow({ where: { email: 'admin@test.com' } });
    expect(resetUser.mustChangePassword).toBe(true);
    await expect(bcrypt.compare(response.body.data.temporaryPassword, resetUser.passwordHash)).resolves.toBe(true);
  });
});
