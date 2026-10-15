import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createPostgresAdapter } from './postgres-adapter.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['error', 'warn'],
      adapter: createPostgresAdapter(),
    });
  }

  async onModuleInit() {
    let retries = 1;
    while (retries >= 0) {
      try {
        await this.$connect();
        this.logger.log('Successfully connected to the database.');
        break;
      } catch (error) {
        if (retries === 0) {
          this.logger.error('Failed to connect to the database after retry.', error);
          throw error;
        }
        this.logger.warn(`Failed to connect to the database. Retrying... (${retries} attempts left)`);
        retries--;
        await new Promise((res) => setTimeout(res, 2000));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
