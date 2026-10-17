import { Module } from '@nestjs/common';
import { CountdownController } from './countdown.controller.js';
import { CountdownService } from './countdown.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [CountdownController],
  providers: [CountdownService],
  exports: [CountdownService],
})
export class CountdownModule {}
