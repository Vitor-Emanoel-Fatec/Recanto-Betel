import { Test, TestingModule } from '@nestjs/testing';
import { BeneficiaryService } from './beneficiary.service.js';
import { PrismaService } from '../database/prisma.service.js';
import { ParentService } from '../parent/parent.service.js';
import { AnamneseService } from '../anamnese/anamnese.service.js';
import { RelativiesService } from '../relativies/relativies.service.js';
import type { AuthenticatedUser } from '../auth/authenticated-user.js';

describe('BeneficiaryService', () => {
  let service: BeneficiaryService;
  let prisma: {
    parent: { findUnique: ReturnType<typeof vi.fn> };
    beneficiary: { findMany: ReturnType<typeof vi.fn> };
  };

  beforeEach(async () => {
    prisma = {
      parent: { findUnique: vi.fn() },
      beneficiary: { findMany: vi.fn() },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BeneficiaryService,
        { provide: PrismaService, useValue: prisma },
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

  it('lists beneficiary public identifiers through the authenticated parent relationship', async () => {
    const user: AuthenticatedUser = {
      id: 'user-id',
      email: 'parent@example.test',
      role: 'PARENT',
    };
    prisma.parent.findUnique.mockResolvedValue({ id: 'parent-id' });
    prisma.beneficiary.findMany.mockResolvedValue([{
      id: 'beneficiary-id',
      publicCode: 'BEN-2026-1234567890ABCDEF',
      name: 'TESTE_BENEFICIARIO_001',
      birthday: new Date('2017-05-14T00:00:00.000Z'),
      status: 'PENDING',
      updatedAt: new Date('2026-11-11T12:00:00.000Z'),
    }]);
    await expect(service.listMine(user)).resolves.toMatchObject([{
      publicCode: 'BEN-2026-1234567890ABCDEF',
    }]);
    expect(prisma.parent.findUnique).toHaveBeenCalledWith({
      where: { user_id: user.id },
      select: { id: true },
    });
    expect(prisma.beneficiary.findMany).toHaveBeenCalledWith({
      where: { parent: { some: { parent_id: 'parent-id' } } },
      select: {
        id: true,
        publicCode: true,
        name: true,
        birthday: true,
        status: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  });
});
