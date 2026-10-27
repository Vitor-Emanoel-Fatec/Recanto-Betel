import { Module } from '@nestjs/common';
import { ParentService } from './parent.service.js';
import { ParentController } from './parent.controller.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [ParentController],
  providers: [ParentService],
})
export class ParentModule {}
