import { Module } from '@nestjs/common';
import { DevotionsService } from './devotions.service.js';
import { DevotionsController } from './devotions.controller.js';

@Module({
  providers: [DevotionsService],
  controllers: [DevotionsController],
  exports: [DevotionsService],
})
export class DevotionsModule {}
