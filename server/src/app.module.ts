import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { validate } from './config/env.validation.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuditModule } from './audit/audit.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';
import { ActiveUserGuard } from './auth/guards/active-user.guard.js';
import { MustChangePasswordGuard } from './auth/guards/must-change-password.guard.js';
import { PermissionsGuard } from './auth/guards/permissions.guard.js';

import { SermonsModule } from './sermons/sermons.module.js';
import { EventsModule } from './events/events.module.js';
import { AnnouncementsModule } from './announcements/announcements.module.js';
import { GalleryModule } from './gallery/gallery.module.js';
import { HeroModule } from './hero/hero.module.js';
import { MessagesModule } from './messages/messages.module.js';
import { HealthModule } from './health/health.module.js';
import { UploadsModule } from './uploads/uploads.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { GivingModule } from './giving/giving.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { TestimoniesModule } from './testimonies/testimonies.module.js';
import { DevotionsModule } from './devotions/devotions.module.js';
import { LivestreamModule } from './livestream/livestream.module.js';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logger = new Logger('Throttler');
        const redisUrl = config.get<string>('REDIS_URL')?.trim();
        let storage;

        if (redisUrl) {
          try {
            const redis = new (Redis as any)(redisUrl, {
              maxRetriesPerRequest: 3,
              enableReadyCheck: false,
              retryStrategy(times: number) {
                if (times > 3) return null;
                return Math.min(times * 200, 1000);
              },
            });
            redis.on('error', (err: Error) => {
              logger.warn(`Redis connection error in rate limiter: ${err.message}`);
            });
            storage = new ThrottlerStorageRedisService(redis);
            logger.log('Distributed rate limiting enabled via Redis.');
          } catch (err: any) {
            logger.warn(`Failed to initialize Redis storage: ${err.message}. Falling back to in-memory.`);
          }
        }

        return {
          throttlers: [
            {
              name: 'default',
              ttl: 60000,
              limit: config.get<number>('THROTTLE_LIMIT') ?? 2000,
            },
            { name: 'short', ttl: 60000, limit: 20 },
            { name: 'long', ttl: 3600000, limit: 100 },
          ],
          storage,
        };
      },
    }),
    PrismaModule,
    AuditModule,
    AuthModule,
    UsersModule,
    SermonsModule,
    EventsModule,
    AnnouncementsModule,
    GalleryModule,
    HeroModule,
    MessagesModule,
    HealthModule,
    UploadsModule,
    ProjectsModule,
    GivingModule,
    SettingsModule,
    NotificationsModule,
    TestimoniesModule,
    DevotionsModule,
    LivestreamModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ActiveUserGuard,
    },
    {
      provide: APP_GUARD,
      useClass: MustChangePasswordGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
