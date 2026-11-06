import { Module } from '@nestjs/common';
import { BeneficiaryService } from './beneficiary.service.js';
import { BeneficiaryController } from './beneficiary.controller.js';
import { DatabaseModule } from '../database/database.module.js';
import { ParentModule } from '../parent/parent.module.js';
import { AnamneseModule } from '../anamnese/anamnese.module.js';

@Module({
  imports: [DatabaseModule, ParentModule, AnamneseModule],
  controllers: [BeneficiaryController],
  providers: [BeneficiaryService],
})
export class BeneficiaryModule {}
