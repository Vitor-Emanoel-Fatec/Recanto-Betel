import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AnamneseService } from './anamnese.service.js';
import type { AuthenticatedUser } from '../auth/authenticated-user.js';
import type { PrismaService } from '../database/prisma.service.js';

describe('AnamneseService authorization', () => {
  const prisma = {
    beneficiary: { findFirst: vi.fn() },
    enrollment: { findFirst: vi.fn() },
    anamnese: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
  const parent: AuthenticatedUser = {
    id: 'parent-user-id',
    email: 'parent@example.test',
    role: 'PARENT',
  };
  const admin: AuthenticatedUser = {
    id: 'admin-user-id',
    email: 'admin@example.test',
    role: 'ADMIN',
  };
  let service: AnamneseService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AnamneseService(prisma as unknown as PrismaService);
  });

  it('scopes Parent lookup by the persisted user-parent-beneficiary relationship', async () => {
    prisma.anamnese.findFirst.mockResolvedValue({ id: 'record-id' });

    await expect(service.findAnamnese(parent, { id: 'record-id' }))
      .resolves.toEqual({ id: 'record-id' });
    expect(prisma.anamnese.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'record-id',
        beneficiary: {
          parent: { some: { parent: { user_id: parent.id } } },
        },
      },
    });
  });

  it('blocks Parent access to another family and does not reveal whether the record exists', async () => {
    prisma.anamnese.findFirst.mockResolvedValue(null);

    await expect(service.findAnamnese(parent, { id: 'other-family-record' }))
      .rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.anamnese.findFirst.mock.calls[0][0].where).toMatchObject({
      beneficiary: { parent: { some: { parent: { user_id: parent.id } } } },
    });
  });

  it('checks beneficiary ownership before Parent creates an anamnese', async () => {
    prisma.beneficiary.findFirst.mockResolvedValue(null);
    await expect(service.create(parent, {
      beneficiary_id: 'other-family-beneficiary',
    })).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.anamnese.create).not.toHaveBeenCalled();
    expect(prisma.beneficiary.findFirst.mock.calls[0][0].where).toMatchObject({
      id: 'other-family-beneficiary',
      parent: { some: { parent: { user_id: parent.id } } },
    });
  });

  it('links a new anamnese to an enrollment belonging to the same beneficiary', async () => {
    prisma.beneficiary.findFirst.mockResolvedValue({ id: 'beneficiary-id' });
    prisma.enrollment.findFirst.mockResolvedValue({ id: 'enrollment-id' });
    prisma.anamnese.create.mockResolvedValue({ id: 'record-id', enrollment_id: 'enrollment-id' });

    await expect(service.create(parent, {
      beneficiary_id: 'beneficiary-id',
      enrollment_id: 'enrollment-id',
      habits: 'Teste fictício',
    })).resolves.toMatchObject({ enrollment_id: 'enrollment-id' });

    expect(prisma.enrollment.findFirst).toHaveBeenCalledWith({
      where: { id: 'enrollment-id', beneficiary_id: 'beneficiary-id' },
      select: { id: true },
    });
    expect(prisma.anamnese.create).toHaveBeenCalledWith({
      data: {
        beneficiary_id: 'beneficiary-id',
        enrollment_id: 'enrollment-id',
        habits: 'Teste fictício',
        isComplete: false,
      },
    });
  });

  it('allows Parent updates only after finding the record through their relationship', async () => {
    prisma.anamnese.findFirst.mockResolvedValue({ id: 'owned-record' });
    prisma.anamnese.update.mockResolvedValue({ id: 'owned-record', isComplete: false });

    await expect(service.updateAnamnese(parent, 'owned-record', { habits: 'draft' }))
      .resolves.toMatchObject({ isComplete: false });
    expect(prisma.anamnese.findFirst.mock.calls[0][0].where).toMatchObject({
      id: 'owned-record',
      beneficiary: { parent: { some: { parent: { user_id: parent.id } } } },
    });
    expect(prisma.anamnese.update).toHaveBeenCalledWith({
      where: { id: 'owned-record' },
      data: { habits: 'draft', isComplete: false },
    });
  });

  it('does not allow Parent to delete records', async () => {
    await expect(service.deleteAnamnese(parent, 'owned-record'))
      .rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.anamnese.delete).not.toHaveBeenCalled();
  });

  it('allows Admin to read any record and delete records', async () => {
    prisma.anamnese.findFirst.mockResolvedValue({ id: 'any-record' });
    prisma.anamnese.delete.mockResolvedValue({ id: 'any-record' });

    await expect(service.findAnamnese(admin, { id: 'any-record' }))
      .resolves.toEqual({ id: 'any-record' });
    expect(prisma.anamnese.findFirst).toHaveBeenCalledWith({
      where: { id: 'any-record' },
    });
    await expect(service.deleteAnamnese(admin, 'any-record')).resolves.toBeUndefined();
  });

  it('blocks USER accounts without Parent authorization', async () => {
    const user = { ...parent, role: 'USER' as const };
    await expect(service.findAnamnese(user, { beneficiary_id: 'beneficiary-id' }))
      .rejects.toBeInstanceOf(ForbiddenException);
  });
});
