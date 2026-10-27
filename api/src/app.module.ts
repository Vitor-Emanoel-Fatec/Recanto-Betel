import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { UserModule } from './user/user.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ParentModule } from './parent/parent.module.js';
import { BeneficiaryModule } from './beneficiary/beneficiary.module.js';

@Module({
  imports: [DatabaseModule, UserModule, AuthModule, ParentModule, BeneficiaryModule]
})
export class AppModule {}
