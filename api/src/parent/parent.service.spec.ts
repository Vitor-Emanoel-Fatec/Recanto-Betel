import { Test, TestingModule } from '@nestjs/testing';
import { ParentService } from './parent.service.js';
import { PrismaService } from '../database/prisma.service.js';

describe('ParentService', () => {
  let service: ParentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParentService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<ParentService>(ParentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
