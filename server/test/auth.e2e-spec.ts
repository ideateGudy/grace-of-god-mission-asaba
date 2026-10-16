import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import type { AdminUser } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.setGlobalPrefix('api/v1');
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.adminUser.deleteMany({});
    await app.close();
  });

  let testUser: AdminUser;
  let cookie: string;
  let originalCookie: string;

  it('should seed a test user', async () => {
    const passwordHash = await bcrypt.hash('password123', 12);
    testUser = await prisma.adminUser.create({
      data: {
        email: 'test@example.com',
        name: 'Test Admin',
        passwordHash,
        role: 'ADMIN',
        permissions: ['SERMONS_MANAGE'],
        mustChangePassword: true,
        isActive: true,
      },
    });
  });

  it('/api/v1/auth/login (POST) - success', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(201);
    
    expect(res.body.data.email).toBe('test@example.com');
    expect(res.headers['set-cookie']).toBeDefined();
    cookie = res.headers['set-cookie'][0].split(';')[0];
    originalCookie = cookie;
  });

  it('/api/v1/auth/login (POST) - invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' })
      .expect(401);
  });

  it('should block admin routes if mustChangePassword is true', async () => {
    // /api/v1/auth/me is allowed
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', cookie)
      .expect(200);

    // This user has the required permission, so a 403 confirms the forced-password guard.
    await request(app.getHttpServer())
      .get('/api/v1/admin/sermons')
      .set('Cookie', cookie)
      .expect(403);
  });

  it('/api/v1/auth/change-password (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/change-password')
      .set('Cookie', cookie)
      .send({ currentPassword: 'password123', newPassword: 'newsecurepassword123' })
      .expect(201);
    
    expect(res.body.data.mustChangePassword).toBe(false);
    cookie = res.headers['set-cookie'][0].split(';')[0];
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', originalCookie)
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', cookie)
      .expect(200);
  });

  it('old cookie should be invalid after password change (tv bumped)', async () => {
    const userInDb = await prisma.adminUser.findUnique({ where: { id: testUser.id }});
    expect(userInDb?.tokenVersion).toBeGreaterThan(0);
    expect(cookie).not.toBe(originalCookie);
  });

  it('deactivation invalidates session', async () => {
    await prisma.adminUser.update({
      where: { id: testUser.id },
      data: { isActive: false },
    });

    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', cookie)
      .expect(401);
  });

  it('should enforce rate limit on login attempts (429 Too Many Requests)', async () => {
    let gotThrottled = false;
    for (let i = 0; i < 8; i++) {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });
      if (res.status === 429) {
        gotThrottled = true;
        expect(res.body.statusCode).toBe(429);
        break;
      }
    }
    expect(gotThrottled).toBe(true);
  });
});
