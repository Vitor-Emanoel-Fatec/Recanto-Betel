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

@Injectable()
export class AnamneseService {
  constructor(private readonly prisma: PrismaService) {}

  private assertComplete(data: ICreateAnamnese | IUpdateAnamnese): void {
    if (!data.isComplete) return;

    const requiredFields: (keyof ICreateAnamnese)[] = [
      'mainComplaintEvolution',
      'suffersFromDisease',
      'underMedicalTreatment',
      'usesMedication',
      'hasAllergies',
      'hasHadSurgery',
      'healingProblems',
      'anesthesiaProblems',
      'hemorrhageProblems',
      'rheumaticFever',
      'heartProblems',
      'kidneyProblems',
      'gastricProblems',
      'respiratoryProblems',
      'allergicProblems',
      'jointRheumatismProblems',
      'diabetes',
      'arterialHypertension',
    ];
    const dataValues = data as Partial<Record<keyof ICreateAnamnese, unknown>>;
    if (requiredFields.some((field) => dataValues[field] === undefined || dataValues[field] === null)) {
      throw new ForbiddenException('Preencha todos os campos obrigatórios antes de concluir a anamnese');
    }
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
    const isComplete = data.isComplete ?? false;
    this.assertComplete({ ...data, isComplete });
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

    return this.prisma.anamnese.create({ data: { ...data, isComplete } });
  }

  async createForBeneficiary(data: ICreateAnamnese) {
    return this.prisma.anamnese.create({ data: { ...data, isComplete: data.isComplete ?? false } });
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
    this.assertComplete({ ...existing, ...data });

    return this.prisma.anamnese.update({
      where: { id: existing.id },
      data,
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
