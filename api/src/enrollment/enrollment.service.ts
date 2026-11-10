import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EnrollmentEventType, Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/authenticated-user.js';
import { PrismaService } from '../database/prisma.service.js';
import type { EnrollmentDecisionDto } from './dto/enrollment-decision.dto.js';
import type { EnrollmentFindDto } from './dto/enrollment-find.dto.js';
import type { EnrollmentSubmitDto } from './dto/enrollment-submit.dto.js';

const publicEnrollmentInclude = {
  beneficiary: {
    select: { id: true, name: true, birthday: true, status: true },
  },
  history: {
    orderBy: { createdAt: 'asc' as const },
    select: { id: true, type: true, note: true, createdAt: true },
  },
};

const adminEnrollmentInclude = {
  beneficiary: {
    include: {
      address: true,
      incomeAndBenefits: true,
      relativies: true,
      AuthorizedEscorts: true,
      anamnese: true,
    },
  },
  parent: {
    select: { id: true, name: true, email: true, contact: true },
  },
  history: {
    orderBy: { createdAt: 'asc' as const },
    select: { id: true, type: true, note: true, createdAt: true, actor_id: true },
  },
};

@Injectable()
export class EnrollmentService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(user: AuthenticatedUser, input: EnrollmentSubmitDto) {
    const isAdmin = user.role === 'ADMIN';
    if (!isAdmin && !['USER', 'PARENT'].includes(user.role)) {
      throw new ForbiddenException('Perfil sem permissão para solicitar matrícula');
    }

    if (!isAdmin && input.parent.email.trim().toLowerCase() !== user.email.toLowerCase()) {
      throw new ForbiddenException('O e-mail do responsável deve corresponder à conta autenticada');
    }

    try {
      return await this.prisma.$transaction(async (transaction) => {
        const parent = isAdmin
          ? await transaction.parent.findUnique({ where: { cpf: input.parent.cpf } })
            ?? await transaction.parent.create({
              data: {
                user_id: null,
                name: input.parent.name.trim(),
                cpf: input.parent.cpf,
                contact: input.parent.contact.trim(),
                email: input.parent.email.trim().toLowerCase(),
                profession: input.parent.profession?.trim() || null,
                educational_level: input.parent.educational_level?.trim() || null,
                comertial_address: input.parent.comertial_address?.trim() || null,
                salary: input.parent.salary ?? null,
              },
            })
          : await transaction.parent.findUnique({ where: { user_id: user.id } })
            ?? await transaction.parent.create({
              data: {
                user_id: user.id,
                name: input.parent.name.trim(),
                cpf: input.parent.cpf,
                contact: input.parent.contact.trim(),
                email: user.email,
                profession: input.parent.profession?.trim() || null,
                educational_level: input.parent.educational_level?.trim() || null,
                comertial_address: input.parent.comertial_address?.trim() || null,
                salary: input.parent.salary ?? null,
              },
            });

        const beneficiary = await transaction.beneficiary.create({
          data: {
            name: input.beneficiary.name.trim(),
            birthday: new Date(input.beneficiary.birthday),
            rg: input.beneficiary.rg,
            cpf: input.beneficiary.cpf,
            school: input.beneficiary.school.trim(),
            period: input.beneficiary.period.trim(),
            religion: input.beneficiary.religion.trim(),
            story: input.beneficiary.story.trim(),
            status: 'PENDING',
          },
        });

        await transaction.address.create({
          data: {
            beneficiary_id: beneficiary.id,
            ...input.beneficiary.address,
          },
        });
        await transaction.incomeAndBenefits.create({
          data: {
            beneficiary_id: beneficiary.id,
            nis: input.beneficiary.incomeAndBenefits.nis ?? null,
            totalIncome: input.beneficiary.incomeAndBenefits.totalIncome,
            perCapitaIncome: input.beneficiary.incomeAndBenefits.perCapitaIncome,
            hasGovernmentBenefit: input.beneficiary.incomeAndBenefits.hasGovernmentBenefit,
            benefitName: input.beneficiary.incomeAndBenefits.benefitName ?? null,
            benefitValue: input.beneficiary.incomeAndBenefits.benefitValue ?? null,
          },
        });
        if (input.beneficiary.relatives?.length) {
          await transaction.relatives.createMany({
            data: input.beneficiary.relatives.map((relative) => ({
              ...relative,
              beneficiary_id: beneficiary.id,
              birthday: new Date(relative.birthday),
            })),
          });
        }
        if (input.beneficiary.authorizedEscorts?.length) {
          await transaction.authorizedEscorts.createMany({
            data: input.beneficiary.authorizedEscorts.map((escort) => ({
              ...escort,
              beneficiary_id: beneficiary.id,
            })),
          });
        }
        await transaction.parentBenificiary.create({
          data: {
            parent_id: parent.id,
            beneficiary_id: beneficiary.id,
            relationshipType: input.parent.relation_type,
          },
        });
        await transaction.anamnese.create({
          data: {
            beneficiary_id: beneficiary.id,
            ...input.beneficiary.anamnese,
            isComplete: false,
          },
        });

        const enrollment = await transaction.enrollment.create({
          data: {
            parent_id: parent.id,
            beneficiary_id: beneficiary.id,
            status: 'PENDING',
          },
        });
        await transaction.enrollmentEvent.create({
          data: {
            enrollment_id: enrollment.id,
            actor_id: user.id,
            type: EnrollmentEventType.SUBMITTED,
          },
        });

        if (!isAdmin) {
          await transaction.user.update({
            where: { id: user.id },
            data: { role: 'PARENT' },
          });
        }

        return transaction.enrollment.findUniqueOrThrow({
          where: { id: enrollment.id },
          include: isAdmin ? adminEnrollmentInclude : publicEnrollmentInclude,
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = error.meta?.target;
        const fields = Array.isArray(target) ? target.join(' ') : String(target ?? '');
        if (fields.toLowerCase().includes('cpf')) {
          throw new ConflictException('O CPF informado já está cadastrado');
        }
        if (fields.toLowerCase().includes('email')) {
          throw new ConflictException('Já existe um perfil vinculado a esse e-mail');
        }
        throw new ConflictException('Já existe um registro com esses dados');
      }
      throw error;
    }
  }

  async listMine(user: AuthenticatedUser) {
    const parent = await this.prisma.parent.findUnique({
      where: { user_id: user.id },
      select: { id: true },
    });
    if (!parent) return [];

    return this.prisma.enrollment.findMany({
      where: { parent_id: parent.id },
      include: publicEnrollmentInclude,
      orderBy: { submittedAt: 'desc' },
    });
  }

  async findMine(user: AuthenticatedUser, id: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { user_id: user.id },
      select: { id: true },
    });
    if (!parent) throw new NotFoundException('Solicitação não encontrada');

    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id, parent_id: parent.id },
      include: publicEnrollmentInclude,
    });
    if (!enrollment) throw new NotFoundException('Solicitação não encontrada');
    return enrollment;
  }

  async listAll(filter: EnrollmentFindDto) {
    return this.prisma.enrollment.findMany({
      where: filter.status ? { status: filter.status } : {},
      include: adminEnrollmentInclude,
      orderBy: { submittedAt: 'desc' },
    });
  }

  async updateStatus(user: AuthenticatedUser, id: string, input: EnrollmentDecisionDto) {
    if (user.role !== 'ADMIN') throw new ForbiddenException('Somente Admin pode decidir matrículas');

    return this.prisma.$transaction(async (transaction) => {
      const current = await transaction.enrollment.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!current) throw new NotFoundException('Solicitação não encontrada');

      await transaction.enrollment.update({
        where: { id },
        data: {
          status: input.status,
          decisionNote: input.note?.trim() || null,
        },
      });
      await transaction.enrollmentEvent.create({
        data: {
          enrollment_id: id,
          actor_id: user.id,
          type: input.status === 'PENDING'
            ? EnrollmentEventType.RETURNED_TO_PENDING
            : input.status,
          note: input.note?.trim() || null,
        },
      });

      return transaction.enrollment.findUniqueOrThrow({
        where: { id },
        include: adminEnrollmentInclude,
      });
    });
  }
}
