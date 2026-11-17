import { Test, TestingModule } from '@nestjs/testing';
import { RelativiesService } from './relativies.service.js';
import { PrismaService } from '../database/prisma.service.js';

describe('RelativiesService', () => {
  let service: RelativiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RelativiesService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<RelativiesService>(RelativiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
