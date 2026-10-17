import { Module } from '@nestjs/common';
import { LivestreamService } from './livestream.service.js';
import { LivestreamController } from './livestream.controller.js';

@Module({
  providers: [LivestreamService],
  controllers: [LivestreamController],
  exports: [LivestreamService],
})
export class LivestreamModule {}
