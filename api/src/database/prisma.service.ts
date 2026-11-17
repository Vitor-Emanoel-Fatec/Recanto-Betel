import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const DEFAULT_DATABASE_URL = 'mysql://root:@localhost:3306/betel';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const databaseUrl = new URL(process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL);
    if (databaseUrl.protocol !== 'mysql:' || !databaseUrl.pathname.slice(1)) {
      throw new Error('DATABASE_URL deve apontar para um banco de dados MySQL válido.');
    }

    const adapter = new PrismaMariaDb({
      host: databaseUrl.hostname,
      user: decodeURIComponent(databaseUrl.username),
      password: decodeURIComponent(databaseUrl.password),
      database: decodeURIComponent(databaseUrl.pathname.slice(1)),
      port: databaseUrl.port ? Number(databaseUrl.port) : 3306,
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
