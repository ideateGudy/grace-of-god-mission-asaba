import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';

describe('SermonsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminCookie: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.setGlobalPrefix('api/v1');
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.sermon.deleteMany({});
    await prisma.adminUser.deleteMany({});

    const adminHash = await bcrypt.hash('adminpass123', 12);
    await prisma.adminUser.create({
      data: { email: 'admin@test.com', name: 'Admin', passwordHash: adminHash, role: 'ADMIN', permissions: ['SERMONS_MANAGE'], isActive: true, mustChangePassword: false },
    });

    const resAdmin = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'admin@test.com', password: 'adminpass123' });
    adminCookie = resAdmin.headers['set-cookie'][0];
  });

  afterAll(async () => {
    await prisma.sermon.deleteMany({});
    await prisma.adminUser.deleteMany({});
    await app.close();
  });

  it('/api/v1/sermons (GET) public', async () => {
    await prisma.sermon.create({
      data: { slug: 'test-sermon', title: 'Test', preacher: 'John', preachedAt: new Date(), published: true }
    });

    const res = await request(app.getHttpServer())
      .get('/api/v1/sermons')
      .expect(200);
    expect(res.body.data.length).toBe(1);
  });

  it('/api/v1/admin/sermons (POST) admin with permission', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/admin/sermons')
      .set('Cookie', adminCookie)
      .send({ slug: 'new-sermon', title: 'New', preacher: 'Paul', preachedAt: new Date().toISOString(), published: false })
      .expect(201);
    expect(res.body.data.slug).toBe('new-sermon');
  });
});
