import { config } from 'dotenv';
import { Global, Module } from '@nestjs/common';
import { fileURLToPath } from 'node:url';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UserModule } from '../user/user.module.js';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { DatabaseModule } from '../database/database.module.js';

config({
  path: [
    fileURLToPath(new URL('../../.env', import.meta.url)),
    fileURLToPath(new URL('../../prisma/.env', import.meta.url)),
  ],
  override: false,
  quiet: true,
});

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }
  return secret;
}

@Global()
@Module({
  imports: [
    UserModule,
    DatabaseModule,
    JwtModule.register({
      secret: jwtSecret(),
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtModule, JwtAuthGuard],
})
export class AuthModule {}
