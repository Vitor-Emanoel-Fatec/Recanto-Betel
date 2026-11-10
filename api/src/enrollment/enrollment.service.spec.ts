import { ForbiddenException } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service.js';
import type { AuthenticatedUser } from '../auth/authenticated-user.js';
import type { PrismaService } from '../database/prisma.service.js';
import type { EnrollmentSubmitDto } from './dto/enrollment-submit.dto.js';

const user: AuthenticatedUser = {
  id: 'user-id',
  email: 'parent@example.test',
  role: 'USER',
};

const submission = {
  parent: {
    name: 'TESTE_PARENT_001',
    cpf: '12345678901',
    contact: '15999999999',
    email: user.email,
    educational_level: 'Ensino médio',
    comertial_address: 'Autônomo',
    salary: 0,
    relation_type: 1,
  },
  beneficiary: {
    name: 'TESTE_BENEFICIARIO_001',
    birthday: '2017-05-14',
    rg: 12345,
    cpf: '10987654321',
    school: 'Escola de teste',
    period: 'Manhã',
    religion: 'Não informado',
    story: 'Registro fictício para teste automatizado',
    address: {
      streetAddress: 'Rua de teste',
      house_number: 1,
      neighborhood: 'Centro',
      housingType: 1,
    },
    incomeAndBenefits: {
      totalIncome: 0,
      perCapitaIncome: 0,
      hasGovernmentBenefit: false,
    },
  },
} satisfies Partial<EnrollmentSubmitDto>;

describe('EnrollmentService', () => {
  const transaction = {
    parent: { findUnique: vi.fn(), create: vi.fn() },
    beneficiary: { create: vi.fn() },
    address: { create: vi.fn() },
    incomeAndBenefits: { create: vi.fn() },
    relatives: { createMany: vi.fn() },
    authorizedEscorts: { createMany: vi.fn() },
    parentBenificiary: { create: vi.fn() },
    anamnese: { create: vi.fn() },
    enrollment: { create: vi.fn(), findUniqueOrThrow: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    enrollmentEvent: { create: vi.fn() },
    user: { update: vi.fn() },
  };
  const prisma = {
    ...transaction,
    $transaction: vi.fn(),
    enrollment: { ...transaction.enrollment, findMany: vi.fn(), findFirst: vi.fn() },
  };
  let service: EnrollmentService;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback: (tx: typeof transaction) => Promise<unknown>) =>
      callback(transaction));
    transaction.parent.findUnique.mockResolvedValue(null);
    transaction.parent.create.mockResolvedValue({ id: 'parent-id' });
    transaction.beneficiary.create.mockResolvedValue({ id: 'beneficiary-id' });
    transaction.enrollment.create.mockResolvedValue({ id: 'enrollment-id' });
    transaction.enrollment.findUniqueOrThrow.mockResolvedValue({
      id: 'enrollment-id',
      status: 'PENDING',
    });
    service = new EnrollmentService(prisma as unknown as PrismaService);
  });

  it('creates a linked Parent, beneficiary, draft anamnese and PENDING enrollment transactionally', async () => {
    await expect(service.submit(user, submission as EnrollmentSubmitDto))
      .resolves.toMatchObject({ status: 'PENDING' });

    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(transaction.parent.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ user_id: user.id, email: user.email }),
    }));
    expect(transaction.beneficiary.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ name: 'TESTE_BENEFICIARIO_001', status: 'PENDING' }),
    }));
    expect(transaction.parentBenificiary.create).toHaveBeenCalledWith({
      data: { parent_id: 'parent-id', beneficiary_id: 'beneficiary-id', relationshipType: 1 },
    });
    expect(transaction.anamnese.create).toHaveBeenCalledWith({
      data: { beneficiary_id: 'beneficiary-id', isComplete: false },
    });
    expect(transaction.enrollment.create).toHaveBeenCalledWith({
      data: { parent_id: 'parent-id', beneficiary_id: 'beneficiary-id', status: 'PENDING' },
    });
    expect(transaction.enrollmentEvent.create).toHaveBeenCalledWith({
      data: {
        enrollment_id: 'enrollment-id',
        actor_id: user.id,
        type: 'SUBMITTED',
      },
    });
    expect(transaction.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { role: 'PARENT' },
    });
  });

  it('rejects attempts to link a Parent profile with a different email', async () => {
    await expect(service.submit(user, {
      ...submission,
      parent: { ...submission.parent, email: 'someone-else@example.test' },
    } as EnrollmentSubmitDto)).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('persists household relatives and authorized escorts with the beneficiary', async () => {
    const input = {
      ...submission,
      beneficiary: {
        ...submission.beneficiary,
        relatives: [{
          name: 'FAMILIAR_TESTE_001',
          birthday: '1980-01-02',
          relation: 4,
          salary: 1200,
        }],
        authorizedEscorts: [{
          name: 'ACOMPANHANTE_TESTE_001',
          relation: 4,
          contact: '15999990000',
        }],
      },
    } as EnrollmentSubmitDto;

    await service.submit(user, input);

    expect(transaction.relatives.createMany).toHaveBeenCalledWith({
      data: [{
        name: 'FAMILIAR_TESTE_001',
        birthday: new Date('1980-01-02'),
        relation: 4,
        salary: 1200,
        beneficiary_id: 'beneficiary-id',
      }],
    });
    expect(transaction.authorizedEscorts.createMany).toHaveBeenCalledWith({
      data: [{
        name: 'ACOMPANHANTE_TESTE_001',
        relation: 4,
        contact: '15999990000',
        beneficiary_id: 'beneficiary-id',
      }],
    });
  });

  it('allows Admin to record a physical enrollment without linking the parent to a user account', async () => {
    const admin: AuthenticatedUser = { ...user, id: 'admin-id', role: 'ADMIN' };

    await expect(service.submit(admin, submission as EnrollmentSubmitDto))
      .resolves.toMatchObject({ status: 'PENDING' });

    expect(transaction.parent.findUnique).toHaveBeenCalledWith({
      where: { cpf: submission.parent.cpf },
    });
    expect(transaction.parent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        user_id: null,
        cpf: submission.parent.cpf,
        email: submission.parent.email,
      }),
    });
    expect(transaction.enrollmentEvent.create).toHaveBeenCalledWith({
      data: {
        enrollment_id: 'enrollment-id',
        actor_id: admin.id,
        type: 'SUBMITTED',
      },
    });
    expect(transaction.user.update).not.toHaveBeenCalled();
    expect(transaction.enrollment.findUniqueOrThrow).toHaveBeenCalledWith(expect.objectContaining({
      include: expect.objectContaining({ parent: expect.any(Object) }),
    }));
  });

  it('reuses an existing parent profile when Admin records another enrollment for the same CPF', async () => {
    transaction.parent.findUnique.mockResolvedValue({ id: 'existing-parent' });
    const admin: AuthenticatedUser = { ...user, id: 'admin-id', role: 'ADMIN' };

    await service.submit(admin, submission as EnrollmentSubmitDto);

    expect(transaction.parent.create).not.toHaveBeenCalled();
    expect(transaction.enrollment.create).toHaveBeenCalledWith({
      data: { parent_id: 'existing-parent', beneficiary_id: 'beneficiary-id', status: 'PENDING' },
    });
  });

  it('scopes Parent enrollment details by the persisted parent ID', async () => {
    prisma.parent.findUnique = vi.fn().mockResolvedValue({ id: 'parent-id' });
    prisma.enrollment.findFirst.mockResolvedValue({ id: 'my-enrollment' });
    await expect(service.findMine({ ...user, role: 'PARENT' }, 'my-enrollment'))
      .resolves.toEqual({ id: 'my-enrollment' });
    expect(prisma.enrollment.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'my-enrollment', parent_id: 'parent-id' },
    }));
  });

  it('records an Admin decision and event without treating acceptance as beneficiary activation', async () => {
    transaction.enrollment.findUnique.mockResolvedValue({ id: 'enrollment-id' });
    transaction.enrollment.findUniqueOrThrow.mockResolvedValue({
      id: 'enrollment-id',
      status: 'ACCEPTED',
    });

    await expect(service.updateStatus(
      { ...user, role: 'ADMIN' },
      'enrollment-id',
      { status: 'ACCEPTED', note: 'Análise concluída' },
    )).resolves.toMatchObject({ status: 'ACCEPTED' });

    expect(transaction.enrollment.update).toHaveBeenCalledWith({
      where: { id: 'enrollment-id' },
      data: { status: 'ACCEPTED', decisionNote: 'Análise concluída' },
    });
    expect(transaction.enrollmentEvent.create).toHaveBeenCalledWith({
      data: {
        enrollment_id: 'enrollment-id',
        actor_id: user.id,
        type: 'ACCEPTED',
        note: 'Análise concluída',
      },
    });
    expect(transaction.beneficiary.create).not.toHaveBeenCalled();
  });

  it('does not allow a Parent to decide enrollment status', async () => {
    await expect(service.updateStatus(
      { ...user, role: 'PARENT' },
      'enrollment-id',
      { status: 'REJECTED' },
    )).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
