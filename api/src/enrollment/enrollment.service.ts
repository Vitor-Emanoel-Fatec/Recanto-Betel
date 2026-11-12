import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EnrollmentEventType, EnrollmentFormKind, Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/authenticated-user.js';
import { TERMS_VERSION } from '../auth/terms.js';
import { hasAnamneseAnswers, isAnamneseComplete } from '../anamnese/anamnese-completion.js';
import { PrismaService } from '../database/prisma.service.js';
import type { EnrollmentDecisionDto } from './dto/enrollment-decision.dto.js';
import type { EnrollmentFormDto } from './dto/enrollment-form.dto.js';
import type { EnrollmentFindDto } from './dto/enrollment-find.dto.js';
import type { EnrollmentSubmitDto } from './dto/enrollment-submit.dto.js';

const enrollmentDetailsInclude = {
  beneficiary: {
    include: {
      address: true,
      incomeAndBenefits: true,
      relativies: true,
      AuthorizedEscorts: true,
      anamnese: true,
      parent: { select: { parent_id: true, relationshipType: true } },
    },
  },
  anamnese: true,
  parent: {
    select: {
      id: true,
      name: true,
      cpf: true,
      email: true,
      contact: true,
      profession: true,
      educational_level: true,
      comertial_address: true,
      salary: true,
    },
  },
  history: {
    orderBy: { createdAt: 'asc' as const },
    select: { id: true, type: true, note: true, createdAt: true },
  },
  forms: true,
};

type EnrollmentWithDetails = Prisma.EnrollmentGetPayload<{
  include: typeof enrollmentDetailsInclude;
}>;

type FormProgress = {
  kind: string;
  title: string;
  required: boolean;
  status: 'PENDING' | 'INCOMPLETE' | 'COMPLETE';
};

function isFilled(value: unknown): boolean {
  return value !== null && value !== undefined && (typeof value !== 'string' || value.trim() !== '');
}

function getFormProgress(enrollment: EnrollmentWithDetails): FormProgress[] {
  const { beneficiary, parent } = enrollment;
  const relationship = beneficiary.parent.find((item) => item.parent_id === enrollment.parent_id);
  const registrationComplete = [
    beneficiary.name,
    beneficiary.birthday,
    beneficiary.rg,
    beneficiary.cpf,
    beneficiary.school,
    beneficiary.period,
    beneficiary.religion,
    parent.name,
    parent.cpf,
    parent.contact,
    parent.email,
    relationship?.relationshipType,
    beneficiary.address?.streetAddress,
    beneficiary.address?.house_number,
    beneficiary.address?.neighborhood,
    beneficiary.address?.housingType,
    beneficiary.incomeAndBenefits?.totalIncome,
    beneficiary.incomeAndBenefits?.perCapitaIncome,
    beneficiary.incomeAndBenefits?.hasGovernmentBenefit,
  ].every(isFilled);
  const anamnese = enrollment.anamnese;
  const hasAnswers = hasAnamneseAnswers(anamnese);
  const formStatus = (kind: 'TERMO' | 'AUTORIZACAO' | 'RELATOS') => {
    const form = enrollment.forms.find((item) => item.kind === kind);
    return !form ? 'PENDING' : form.isComplete ? 'COMPLETE' : 'INCOMPLETE';
  };
  const termsCurrent =
    enrollment.termsAcceptedVersion === TERMS_VERSION && enrollment.termsAcceptedAt !== null;

  return [
    {
      kind: 'matricula',
      title: 'Ficha de matrícula',
      required: true,
      status: registrationComplete ? 'COMPLETE' : 'INCOMPLETE',
    },
    {
      kind: 'termos',
      title: 'Aceitação dos termos',
      required: true,
      status: termsCurrent ? 'COMPLETE' : 'PENDING',
    },
    {
      kind: 'termo',
      title: 'Termo de compromisso',
      required: true,
      status: formStatus('TERMO'),
    },
    {
      kind: 'autorizacao',
      title: 'Autorização de atendimento',
      required: true,
      status: formStatus('AUTORIZACAO'),
    },
    {
      kind: 'anamnese',
      title: 'Ficha de anamnese',
      required: true,
      status: isAnamneseComplete(anamnese ?? {})
        ? 'COMPLETE'
        : hasAnswers
          ? 'INCOMPLETE'
          : 'PENDING',
    },
    {
      kind: 'relatos',
      title: 'Relatos',
      required: true,
      status: formStatus('RELATOS'),
    },
  ];
}

function withFormProgress<T extends EnrollmentWithDetails>(enrollment: T) {
  const formsStatus = getFormProgress(enrollment);
  return {
    ...enrollment,
    formsStatus,
    formsComplete: formsStatus.filter((form) => form.required)
      .every((form) => form.status === 'COMPLETE'),
  };
}

function textValue(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  return typeof value === 'string' ? value.trim() : '';
}

function isChecked(data: Record<string, unknown>, key: string): boolean {
  return data[key] === true || data[key] === 'on' || data[key] === 'true';
}

function isEnrollmentFormComplete(kind: EnrollmentFormKind, data: Record<string, unknown>): boolean {
  if (kind === EnrollmentFormKind.TERMO) {
    if (
      !isChecked(data, 'compromisso1') ||
      !isChecked(data, 'compromisso2') ||
      !['Sim', 'Não'].includes(textValue(data, 'irEmboraSozinho')) ||
      !textValue(data, 'assinatura')
    ) return false;

    return textValue(data, 'irEmboraSozinho') !== 'Não' ||
      Array.from({ length: 7 }, (_, index) => index + 1).some((number) =>
        textValue(data, `pessoa${number}Nome`) &&
        textValue(data, `pessoa${number}Parentesco`) &&
        textValue(data, `pessoa${number}Tel`));
  }

  if (kind === EnrollmentFormKind.AUTORIZACAO) {
    const parentCpf = textValue(data, 'responsavelCpf').replace(/\D/g, '');
    const beneficiaryCpf = textValue(data, 'menorCpf').replace(/\D/g, '');
    return Boolean(
      textValue(data, 'responsavelNome') &&
      /^\d{11}$/.test(parentCpf) &&
      textValue(data, 'menorNome') &&
      /^\d{11}$/.test(beneficiaryCpf) &&
      isChecked(data, 'autorizaOdonto') &&
      textValue(data, 'assinatura'),
    );
  }

  return Boolean(textValue(data, 'relato'));
}

@Injectable()
export class EnrollmentService {
  constructor(private readonly prisma: PrismaService) {}

  private enrollmentWhere(user: AuthenticatedUser, id: string): Prisma.EnrollmentWhereInput {
    if (user.role === 'ADMIN') return { id };
    if (user.role !== 'PARENT') throw new ForbiddenException('Perfil sem acesso à matrícula');
    return { id, parent: { user_id: user.id } };
  }

  async submit(user: AuthenticatedUser, input: EnrollmentSubmitDto) {
    const isAdmin = user.role === 'ADMIN';
    if (!isAdmin && !['USER', 'PARENT'].includes(user.role)) {
      throw new ForbiddenException('Perfil sem permissão para solicitar matrícula');
    }
    if (input.termsAccepted !== true) {
      throw new BadRequestException('É necessário aceitar os termos para concluir a solicitação');
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
            relationshipType: input.parent.relation_type.trim(),
          },
        });
        const enrollment = await transaction.enrollment.create({
          data: {
            parent_id: parent.id,
            beneficiary_id: beneficiary.id,
            status: 'PENDING',
            termsAcceptedVersion: TERMS_VERSION,
            termsAcceptedAt: new Date(),
          },
        });
        await transaction.anamnese.create({
          data: {
            beneficiary_id: beneficiary.id,
            enrollment_id: enrollment.id,
            ...input.beneficiary.anamnese,
            isComplete: false,
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

        const savedEnrollment = await transaction.enrollment.findUniqueOrThrow({
          where: { id: enrollment.id },
          include: enrollmentDetailsInclude,
        });
        return withFormProgress(savedEnrollment);
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

    const enrollments = await this.prisma.enrollment.findMany({
      where: { parent_id: parent.id },
      include: enrollmentDetailsInclude,
      orderBy: { submittedAt: 'desc' },
    });
    return enrollments.map(withFormProgress);
  }

  async findMine(user: AuthenticatedUser, id: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { user_id: user.id },
      select: { id: true },
    });
    if (!parent) throw new NotFoundException('Solicitação não encontrada');

    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id, parent_id: parent.id },
      include: enrollmentDetailsInclude,
    });
    if (!enrollment) throw new NotFoundException('Solicitação não encontrada');
    return withFormProgress(enrollment);
  }

  async listAll(filter: EnrollmentFindDto) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: filter.status ? { status: filter.status } : {},
      include: enrollmentDetailsInclude,
      orderBy: { submittedAt: 'desc' },
    });
    return enrollments.map(withFormProgress);
  }

  async update(user: AuthenticatedUser, id: string, input: EnrollmentSubmitDto) {
    const isAdmin = user.role === 'ADMIN';
    if (!isAdmin && user.role !== 'PARENT') {
      throw new ForbiddenException('Perfil sem permissão para editar matrícula');
    }
    if (input.termsAccepted !== true) {
      throw new BadRequestException('É necessário aceitar os termos para concluir a solicitação');
    }
    if (!isAdmin && input.parent.email.trim().toLowerCase() !== user.email.toLowerCase()) {
      throw new ForbiddenException('O e-mail do responsável deve corresponder à conta autenticada');
    }

    return this.prisma.$transaction(async (transaction) => {
      const current = await transaction.enrollment.findFirst({
        where: this.enrollmentWhere(user, id),
        select: {
          id: true,
          parent_id: true,
          beneficiary_id: true,
          termsAcceptedVersion: true,
          termsAcceptedAt: true,
        },
      });
      if (!current) throw new NotFoundException('Solicitação não encontrada');

      await transaction.parent.update({
        where: { id: current.parent_id },
        data: {
          name: input.parent.name.trim(),
          cpf: input.parent.cpf,
          contact: input.parent.contact.trim(),
          email: isAdmin ? input.parent.email.trim().toLowerCase() : user.email,
          profession: input.parent.profession?.trim() || null,
          educational_level: input.parent.educational_level?.trim() || null,
          comertial_address: input.parent.comertial_address?.trim() || null,
          salary: input.parent.salary ?? null,
        },
      });

      await transaction.beneficiary.update({
        where: { id: current.beneficiary_id },
        data: {
          name: input.beneficiary.name.trim(),
          birthday: new Date(input.beneficiary.birthday),
          rg: input.beneficiary.rg,
          cpf: input.beneficiary.cpf,
          school: input.beneficiary.school.trim(),
          period: input.beneficiary.period.trim(),
          religion: input.beneficiary.religion.trim(),
          story: input.beneficiary.story.trim(),
        },
      });

      const addressData = input.beneficiary.address;
      await transaction.address.upsert({
        where: { beneficiary_id: current.beneficiary_id },
        create: { ...addressData, beneficiary_id: current.beneficiary_id },
        update: addressData,
      });

      const incomeData = input.beneficiary.incomeAndBenefits;
      await transaction.incomeAndBenefits.upsert({
        where: { beneficiary_id: current.beneficiary_id },
        create: { ...incomeData, beneficiary_id: current.beneficiary_id },
        update: incomeData,
      });

      await transaction.parentBenificiary.upsert({
        where: {
          beneficiary_id_parent_id: {
            beneficiary_id: current.beneficiary_id,
            parent_id: current.parent_id,
          },
        },
        create: {
          beneficiary_id: current.beneficiary_id,
          parent_id: current.parent_id,
          relationshipType: input.parent.relation_type.trim(),
        },
        update: { relationshipType: input.parent.relation_type.trim() },
      });

      if (input.beneficiary.relatives) {
        await transaction.relatives.deleteMany({
          where: { beneficiary_id: current.beneficiary_id },
        });
        if (input.beneficiary.relatives.length) {
          await transaction.relatives.createMany({
            data: input.beneficiary.relatives.map((relative) => ({
              ...relative,
              beneficiary_id: current.beneficiary_id,
              birthday: new Date(relative.birthday),
            })),
          });
        }
      }

      await transaction.enrollment.update({
        where: { id },
        data: current.termsAcceptedVersion === TERMS_VERSION
          ? {}
          : { termsAcceptedVersion: TERMS_VERSION, termsAcceptedAt: new Date() },
      });

      const enrollment = await transaction.enrollment.findUniqueOrThrow({
        where: { id },
        include: enrollmentDetailsInclude,
      });
      return withFormProgress(enrollment);
    });
  }

  async saveForm(
    user: AuthenticatedUser,
    id: string,
    requestedKind: string,
    input: EnrollmentFormDto,
  ) {
    const formKinds: Record<string, EnrollmentFormKind> = {
      termo: EnrollmentFormKind.TERMO,
      autorizacao: EnrollmentFormKind.AUTORIZACAO,
      relatos: EnrollmentFormKind.RELATOS,
    };
    const kind = formKinds[requestedKind];
    if (!kind) throw new BadRequestException('Ficha de matrícula não reconhecida');

    const enrollment = await this.prisma.enrollment.findFirst({
      where: this.enrollmentWhere(user, id),
      select: { id: true },
    });
    if (!enrollment) throw new NotFoundException('Solicitação não encontrada');

    const sanitizedData: Record<string, string | boolean> = {};
    for (const [key, value] of Object.entries(input.data)) {
      if (
        key.length > 100 ||
        (typeof value !== 'string' && typeof value !== 'boolean') ||
        (typeof value === 'string' && value.length > 10000)
      ) {
        throw new BadRequestException('Os dados da ficha contêm um valor inválido');
      }
      sanitizedData[key] = value;
    }
    const data: Prisma.InputJsonObject = sanitizedData;

    await this.prisma.enrollmentForm.upsert({
      where: { enrollment_id_kind: { enrollment_id: id, kind } },
      create: {
        enrollment_id: id,
        kind,
        data,
        isComplete: isEnrollmentFormComplete(kind, input.data),
      },
      update: {
        data,
        isComplete: isEnrollmentFormComplete(kind, input.data),
      },
    });

    if (user.role === 'ADMIN') {
      const updated = await this.prisma.enrollment.findUniqueOrThrow({
        where: { id },
        include: enrollmentDetailsInclude,
      });
      return withFormProgress(updated);
    }
    return this.findMine(user, id);
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

      const enrollment = await transaction.enrollment.findUniqueOrThrow({
        where: { id },
        include: enrollmentDetailsInclude,
      });
      return withFormProgress(enrollment);
    });
  }
}
