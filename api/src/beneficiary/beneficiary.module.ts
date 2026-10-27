import { Module } from '@nestjs/common';
import { BeneficiaryService } from './beneficiary.service.js';
import { BeneficiaryController } from './beneficiary.controller.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [BeneficiaryController],
  providers: [BeneficiaryService],
})
export class BeneficiaryModule {}
