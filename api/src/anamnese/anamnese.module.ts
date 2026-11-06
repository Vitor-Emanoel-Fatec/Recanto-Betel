import { Module } from '@nestjs/common';
import { AnamneseService } from './anamnese.service.js';
import { AnamneseController } from './anamnese.controller.js';

import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [AnamneseController],
  providers: [AnamneseService],
  exports: [AnamneseService]
})
export class AnamneseModule {}
