import { Module } from '@nestjs/common';
import { TestimoniesService } from './testimonies.service.js';
import { TestimoniesController } from './testimonies.controller.js';

@Module({
  providers: [TestimoniesService],
  controllers: [TestimoniesController],
  exports: [TestimoniesService],
})
export class TestimoniesModule {}
