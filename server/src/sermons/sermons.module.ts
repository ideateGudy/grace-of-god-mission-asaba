import { Module } from '@nestjs/common';
import { SermonsService } from './sermons.service.js';
import { SermonsController } from './sermons.controller.js';

@Module({
  providers: [SermonsService],
  controllers: [SermonsController],
})
export class SermonsModule {}
