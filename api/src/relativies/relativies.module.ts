import { Module } from '@nestjs/common';
import { RelativiesService } from './relativies.service.js';
import { RelativiesController } from './relativies.controller.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [RelativiesController],
  providers: [RelativiesService],
  exports: [RelativiesService]
})
export class RelativiesModule {}
