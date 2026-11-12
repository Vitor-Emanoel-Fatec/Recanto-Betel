import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('/api/auth/terms (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/auth/terms')
      .expect(200);

    expect(response.body.version).toMatch(/^sha256-/);
    expect(response.body.content).toContain('Projeto Samaritano');
  });

  it('does not expose a scaffold root route', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(404);
  });

  afterEach(async () => {
    await app.close();
  });
});
