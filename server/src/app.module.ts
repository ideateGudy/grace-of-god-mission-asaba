import { Module } from '@nestjs/common';
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
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'default',
          ttl: 60000,
          limit: config.get<number>('THROTTLE_LIMIT') ?? 2000,
        },
        { name: 'short', ttl: 60000, limit: 20 },
        { name: 'long', ttl: 3600000, limit: 100 },
      ],
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
