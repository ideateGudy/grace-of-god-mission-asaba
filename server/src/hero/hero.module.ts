import { Module } from '@nestjs/common';
import { HeroService } from './hero.service.js';
import { HeroController } from './hero.controller.js';

@Module({
  providers: [HeroService],
  controllers: [HeroController],
})
export class HeroModule {}
