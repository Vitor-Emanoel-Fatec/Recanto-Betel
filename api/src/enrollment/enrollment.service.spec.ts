import { ForbiddenException } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service.js';
import type { AuthenticatedUser } from '../auth/authenticated-user.js';
import type { PrismaService } from '../database/prisma.service.js';
import type { EnrollmentSubmitDto } from './dto/enrollment-submit.dto.js';
import { TERMS_VERSION } from '../auth/terms.js';

const user: AuthenticatedUser = {
  id: 'user-id',
  email: 'parent@example.test',
  role: 'USER',
};

const submission = {
  termsAccepted: true,
  parent: {
    name: 'TESTE_PARENT_001',
    cpf: '12345678901',
    contact: '15999999999',
    email: user.email,
    educational_level: 'Ensino médio',
    comertial_address: 'Autônomo',
    salary: 0,
    relation_type: 'mãe',
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
  const savedEnrollment = (status = 'PENDING') => ({
    id: 'enrollment-id',
    parent_id: 'parent-id',
    beneficiary_id: 'beneficiary-id',
    status,
    termsAcceptedVersion: TERMS_VERSION,
    termsAcceptedAt: new Date('2026-11-11T12:00:00Z'),
    anamnese: null,
    decisionNote: null,
    submittedAt: new Date('2026-11-11T12:00:00Z'),
    updatedAt: new Date('2026-11-11T12:00:00Z'),
    parent: {
      id: 'parent-id',
      name: submission.parent.name,
      cpf: submission.parent.cpf,
      email: submission.parent.email,
      contact: submission.parent.contact,
      profession: null,
      educational_level: submission.parent.educational_level,
      comertial_address: submission.parent.comertial_address,
      salary: submission.parent.salary,
    },
    beneficiary: {
      id: 'beneficiary-id',
      name: submission.beneficiary.name,
      birthday: new Date(submission.beneficiary.birthday),
      rg: submission.beneficiary.rg,
      cpf: submission.beneficiary.cpf,
      school: submission.beneficiary.school,
      period: submission.beneficiary.period,
      religion: submission.beneficiary.religion,
      story: submission.beneficiary.story,
      status: 'PENDING',
      address: {
        streetAddress: submission.beneficiary.address.streetAddress,
        house_number: submission.beneficiary.address.house_number,
        neighborhood: submission.beneficiary.address.neighborhood,
        housingType: submission.beneficiary.address.housingType,
      },
      incomeAndBenefits: {
        totalIncome: submission.beneficiary.incomeAndBenefits.totalIncome,
        perCapitaIncome: submission.beneficiary.incomeAndBenefits.perCapitaIncome,
        hasGovernmentBenefit: submission.beneficiary.incomeAndBenefits.hasGovernmentBenefit,
      },
      relativies: [],
      AuthorizedEscorts: [],
      anamnese: null,
      parent: [{ parent_id: 'parent-id', relationshipType: submission.parent.relation_type }],
    },
    history: [],
    forms: [],
  });

  const transaction = {
    parent: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    beneficiary: { create: vi.fn(), update: vi.fn() },
    address: { create: vi.fn(), upsert: vi.fn() },
    incomeAndBenefits: { create: vi.fn(), upsert: vi.fn() },
    relatives: { createMany: vi.fn(), deleteMany: vi.fn() },
    authorizedEscorts: { createMany: vi.fn() },
    parentBenificiary: { create: vi.fn(), upsert: vi.fn() },
    anamnese: { create: vi.fn() },
    enrollment: { create: vi.fn(), findUniqueOrThrow: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    enrollmentEvent: { create: vi.fn() },
    user: { update: vi.fn() },
    enrollmentForm: { upsert: vi.fn() },
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
    transaction.enrollment.findUniqueOrThrow.mockResolvedValue(savedEnrollment());
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
      data: { parent_id: 'parent-id', beneficiary_id: 'beneficiary-id', relationshipType: 'mãe' },
    });
    expect(transaction.anamnese.create).toHaveBeenCalledWith({
      data: { beneficiary_id: 'beneficiary-id', enrollment_id: 'enrollment-id', isComplete: false },
    });
    expect(transaction.enrollment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        parent_id: 'parent-id',
        beneficiary_id: 'beneficiary-id',
        status: 'PENDING',
        termsAcceptedVersion: TERMS_VERSION,
        termsAcceptedAt: expect.any(Date),
      }),
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
          relation: 'irmão',
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
        relation: 'irmão',
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
      data: expect.objectContaining({
        parent_id: 'existing-parent',
        beneficiary_id: 'beneficiary-id',
        status: 'PENDING',
        termsAcceptedVersion: TERMS_VERSION,
        termsAcceptedAt: expect.any(Date),
      }),
    });
  });

  it('scopes Parent enrollment details by the persisted parent ID', async () => {
    prisma.parent.findUnique = vi.fn().mockResolvedValue({ id: 'parent-id' });
    prisma.enrollment.findFirst.mockResolvedValue(savedEnrollment());
    await expect(service.findMine({ ...user, role: 'PARENT' }, 'my-enrollment'))
      .resolves.toMatchObject({ id: 'enrollment-id', formsComplete: false });
    expect(prisma.enrollment.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'my-enrollment', parent_id: 'parent-id' },
    }));
  });

  it('updates the linked records of an existing enrollment instead of creating duplicates', async () => {
    transaction.enrollment.findFirst.mockResolvedValue({
      id: 'enrollment-id',
      parent_id: 'parent-id',
      beneficiary_id: 'beneficiary-id',
      termsAcceptedVersion: TERMS_VERSION,
      termsAcceptedAt: new Date('2026-11-11T12:00:00Z'),
    });
    transaction.enrollment.findUniqueOrThrow.mockResolvedValue(savedEnrollment());

    await expect(service.update(
      { ...user, role: 'PARENT' },
      'enrollment-id',
      submission as EnrollmentSubmitDto,
    )).resolves.toMatchObject({ id: 'enrollment-id' });

    expect(transaction.parent.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'parent-id' },
    }));
    expect(transaction.beneficiary.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'beneficiary-id' },
    }));
    expect(transaction.enrollment.update).toHaveBeenCalledWith({
      where: { id: 'enrollment-id' },
      data: {},
    });
    expect(transaction.enrollment.create).not.toHaveBeenCalled();
  });

  it('persists an incomplete form draft and returns the enrollment checklist', async () => {
    prisma.parent.findUnique = vi.fn().mockResolvedValue({ id: 'parent-id' });
    prisma.enrollment.findFirst
      .mockResolvedValueOnce({ id: 'enrollment-id' })
      .mockResolvedValueOnce(savedEnrollment());

    await expect(service.saveForm(
      { ...user, role: 'PARENT' },
      'enrollment-id',
      'relatos',
      { data: { relato: '' } },
    )).resolves.toMatchObject({
      id: 'enrollment-id',
      formsComplete: false,
    });

    expect(prisma.enrollmentForm.upsert).toHaveBeenCalledWith({
      where: { enrollment_id_kind: { enrollment_id: 'enrollment-id', kind: 'RELATOS' } },
      create: {
        enrollment_id: 'enrollment-id',
        kind: 'RELATOS',
        data: { relato: '' },
        isComplete: false,
      },
      update: {
        data: { relato: '' },
        isComplete: false,
      },
    });
  });

  it('records an Admin decision and event without treating acceptance as beneficiary activation', async () => {
    transaction.enrollment.findUnique.mockResolvedValue({ id: 'enrollment-id' });
    transaction.enrollment.findUniqueOrThrow.mockResolvedValue(savedEnrollment('ACCEPTED'));

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
