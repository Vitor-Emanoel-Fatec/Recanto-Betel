import { Test, TestingModule } from '@nestjs/testing';
import { BeneficiaryService } from './beneficiary.service.js';
import { PrismaService } from '../database/prisma.service.js';
import { ParentService } from '../parent/parent.service.js';
import { AnamneseService } from '../anamnese/anamnese.service.js';
import { RelativiesService } from '../relativies/relativies.service.js';

describe('BeneficiaryService', () => {
  let service: BeneficiaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BeneficiaryService,
        { provide: PrismaService, useValue: {} },
        { provide: ParentService, useValue: {} },
        { provide: AnamneseService, useValue: {} },
        { provide: RelativiesService, useValue: {} },
      ],
    }).compile();

    service = module.get<BeneficiaryService>(BeneficiaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
