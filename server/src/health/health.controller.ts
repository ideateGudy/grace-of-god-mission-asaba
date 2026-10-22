import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service.js';
import { PublicRoute } from '../auth/decorators/public-route.decorator.js';

@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @PublicRoute()
  @Get()
  async check() {
    let dbStatus = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (err: any) {
      dbStatus = `error: ${err?.message || 'db unreachable'}`;
    }
    return { status: 'ok', database: dbStatus, timestamp: new Date().toISOString() };
  }
}
