import {
  ForbiddenException,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service.js';
import type { AuthenticatedUser } from '../auth/authenticated-user.js';
import type { ICreateAnamnese } from './dto/anamnese-create.dto.js';
import type { IFindAnamnese } from './dto/anamnese-find.dto.js';
import type { IUpdateAnamnese } from './dto/anamnese-update.dto.js';
import { isAnamneseComplete } from './anamnese-completion.js';

@Injectable()
export class AnamneseService {
  constructor(private readonly prisma: PrismaService) {}

  private isComplete(data: ICreateAnamnese | IUpdateAnamnese): boolean {
    return isAnamneseComplete(data);
  }

  private ownershipWhere(user: AuthenticatedUser): Prisma.AnamneseWhereInput {
    if (user.role === 'ADMIN') return {};
    if (user.role !== 'PARENT') throw new ForbiddenException('Perfil sem acesso à anamnese');

    return {
      beneficiary: {
        parent: {
          some: {
            parent: { user_id: user.id },
          },
        },
      },
    };
  }

  async create(user: AuthenticatedUser, data: ICreateAnamnese) {
    const beneficiary = await this.prisma.beneficiary.findFirst({
      where: {
        id: data.beneficiary_id,
        ...(user.role === 'ADMIN' ? {} : {
          parent: { some: { parent: { user_id: user.id } } },
        }),
      },
      select: { id: true },
    });
    if (!beneficiary) throw new NotFoundException('Beneficiário não encontrado');
    if (data.enrollment_id) {
      const enrollment = await this.prisma.enrollment.findFirst({
        where: { id: data.enrollment_id, beneficiary_id: beneficiary.id },
        select: { id: true },
      });
      if (!enrollment) throw new NotFoundException('Matrícula não encontrada para este beneficiário');
    }

    const answers = { ...data };
    delete answers.isComplete;
    return this.prisma.anamnese.create({
      data: { ...answers, isComplete: this.isComplete(answers) },
    });
  }

  async createForBeneficiary(data: ICreateAnamnese) {
    const answers = { ...data };
    delete answers.isComplete;
    return this.prisma.anamnese.create({
      data: { ...answers, isComplete: this.isComplete(answers) },
    });
  }

  async findAnamnese(user: AuthenticatedUser, filter: IFindAnamnese) {
    if (!filter.id && !filter.beneficiary_id) {
      throw new BadRequestException('Informe o identificador da anamnese ou do beneficiário');
    }

    const anamnese = await this.prisma.anamnese.findFirst({
      where: {
        ...filter,
        ...this.ownershipWhere(user),
      },
    });
    if (!anamnese) throw new NotFoundException('Anamnese não encontrada');
    return anamnese;
  }

  async updateAnamnese(user: AuthenticatedUser, id: string, data: IUpdateAnamnese) {
    const where: Prisma.AnamneseWhereInput = {
      id,
      ...this.ownershipWhere(user),
    };
    const existing = await this.prisma.anamnese.findFirst({
      where,
      select: {
        id: true,
        isComplete: true,
        mainComplaintEvolution: true,
        suffersFromDisease: true,
        underMedicalTreatment: true,
        usesMedication: true,
        hasAllergies: true,
        hasHadSurgery: true,
        healingProblems: true,
        anesthesiaProblems: true,
        hemorrhageProblems: true,
        rheumaticFever: true,
        heartProblems: true,
        kidneyProblems: true,
        gastricProblems: true,
        respiratoryProblems: true,
        allergicProblems: true,
        jointRheumatismProblems: true,
        diabetes: true,
        arterialHypertension: true,
      },
    });
    if (!existing) throw new NotFoundException('Anamnese não encontrada');
    const answers = { ...data };
    delete answers.isComplete;
    const isComplete = this.isComplete({ ...existing, ...answers });

    return this.prisma.anamnese.update({
      where: { id: existing.id },
      data: { ...answers, isComplete },
    });
  }

  async deleteAnamnese(user: AuthenticatedUser, id: string): Promise<void> {
    if (user.role !== 'ADMIN') throw new ForbiddenException('Somente Admin pode excluir anamneses');

    try {
      await this.prisma.anamnese.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Anamnese não encontrada');
      }
      throw error;
    }
  }
}
