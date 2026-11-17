import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { UserModule } from './user/user.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ParentModule } from './parent/parent.module.js';
import { BeneficiaryModule } from './beneficiary/beneficiary.module.js';
import { AnamneseModule } from './anamnese/anamnese.module.js';
import { RelativiesModule } from './relativies/relativies.module.js';
import { EnrollmentModule } from './enrollment/enrollment.module.js';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
    ParentModule,
    BeneficiaryModule,
    AnamneseModule,
    RelativiesModule,
    EnrollmentModule,
  ],
})
export class AppModule {}
