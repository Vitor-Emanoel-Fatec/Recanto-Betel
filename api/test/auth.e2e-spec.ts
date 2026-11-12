import { randomBytes } from 'node:crypto';
import { ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { PrismaService } from '../src/database/prisma.service.js';

describe('Authentication HTTP flow (e2e)', () => {
  let app: INestApplication<App>;
  let storedUser: { id: string; email: string; password: string; role: string } | null = null;

  beforeAll(async () => {
    process.env.JWT_SECRET = randomBytes(32).toString('hex');
    const { AppModule } = await import('../src/app.module.js');

    const prisma = {
      user: {
        create: vi.fn(async ({ data }: { data: Omit<NonNullable<typeof storedUser>, 'id'> }) => {
          storedUser = { id: 'auth-e2e-user', ...data };
          return { id: storedUser.id, email: storedUser.email, role: storedUser.role };
        }),
        findUnique: vi.fn(async ({
          where,
          select,
        }: {
          where: { id?: string; email?: string };
          select?: { id?: boolean; email?: boolean; role?: boolean };
        }) => {
          if (!storedUser) return null;
          if (where.id && where.id !== storedUser.id) return null;
          if (where.email && where.email !== storedUser.email) return null;
          if (select) {
            return {
              ...(select.id ? { id: storedUser.id } : {}),
              ...(select.email ? { email: storedUser.email } : {}),
              ...(select.role ? { role: storedUser.role } : {}),
            };
          }
          return storedUser;
        }),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).overrideProvider(PrismaService).useValue(prisma).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();
  });

  beforeEach(() => {
    storedUser = null;
  });

  afterAll(async () => {
    await app?.close();
  });

  it('starts the API and supports signup followed by cookie-based login', async () => {
    const email = 'auth-flow@example.test';
    const password = 'a sufficiently long test password';

    await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email, password, role: 'ADMIN', termsAccepted: true })
      .expect(201)
      .expect({ id: 'auth-e2e-user', email, role: 'USER' });

    const login = await request(app.getHttpServer())
      .post('/api/auth/signin')
      .send({ email, password })
      .expect(200)
      .expect({ id: 'auth-e2e-user', email, role: 'USER' });

    const cookie = login.headers['set-cookie'] as string[];
    expect(cookie[0]).toContain('recanto_access=');
    expect(cookie[0].toLowerCase()).toContain('httponly');
    expect(login.body).not.toHaveProperty('accessToken');
    expect(login.body).not.toHaveProperty('password');

    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', cookie[0].split(';')[0])
      .expect(200)
      .expect({ id: 'auth-e2e-user', email, role: 'USER' });
  });
});
