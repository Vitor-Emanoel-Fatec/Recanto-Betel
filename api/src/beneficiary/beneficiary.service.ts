import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Beneficiary } from "@prisma/client";
import { PrismaService } from '../database/prisma.service.js';
import { ParentService } from '../parent/parent.service.js';

import { ICreateBeneficiary } from './dto/beneficiary-create.dto.js';
import { IFindBeneficiary } from './dto/beneficiary-find.dto.js';
import { IUpdateBeneficiary } from './dto/beneficiary-update.dto.js';
import { AnamneseService } from '../anamnese/anamnese.service.js';
import { RelativiesService } from '../relativies/relativies.service.js';

@Injectable()
export class BeneficiaryService {
    constructor(
        private readonly PrismaService: PrismaService, 
        private readonly ParentService: ParentService,
        private readonly AnamneseService: AnamneseService,
        private readonly RelativiesService: RelativiesService
    ){};

    async create(data: ICreateBeneficiary): Promise<Beneficiary | undefined> {
        try {
            const date = new Date(data.birthday).toISOString();
            const beneficiary = await this.PrismaService.beneficiary.create({
                data: {
                    name: data.name,
                    birthday: date,
                    rg: data.rg,
                    cpf: data.cpf,
                    school: data.school,
                    period: data.period,
                    religion: data.religion,
                    story: data.story,
                    status: 'PENDING'
                }
            });

            const address_data = data.address
            const address = await this.PrismaService.address.create({
                data: {
                    beneficiary_id: beneficiary.id,
                    streetAddress: address_data.streetAddress,
                    house_number: address_data.housing_number,
                    neighborhood: address_data.neighborhood,
                    landmark: address_data.landmark,
                    housingType: address_data.housingType,
                    housingCost: address_data.housingCost,
                    waterCost: address_data.waterCost,
                    powerCost: address_data.powerCost,
                    foodCost: address_data.foodCost,
                    gasCost: address_data.gasCost
                }
            })

            const incomeAndBenefits_data = data.incomeAndBenefits
            const incomeAndBenefits = await this.PrismaService.incomeAndBenefits.create({
                data: {
                    beneficiary_id: beneficiary.id,
                    nis: incomeAndBenefits_data.nis,
                    totalIncome: incomeAndBenefits_data.totalIncome,
                    perCapitaIncome: incomeAndBenefits_data.perCapitaIncome,
                    hasGovernmentBenefit: incomeAndBenefits_data.hasGovernmentBenefit,
                    benefitName: incomeAndBenefits_data.benefitName,
                    benefitValue: incomeAndBenefits_data.benefitValue
                }
            })
            
            const anamnese_form = await this.AnamneseService.createForBeneficiary({
                ...data.anamnese,
                beneficiary_id: beneficiary.id
            });

            const parents_promise = data.parents.map(async (parent_data) => {
                const parent = await this.ParentService.create(parent_data);
                const relationship = await this.PrismaService.parentBenificiary.create({
                    data: {
                        beneficiary_id: beneficiary.id,
                        parent_id: parent!.id,
                        relationshipType: parent_data.relation_type
                    }
                })
            });

            const relativies_promise = data.relativies!.map(async (relativies_data) => {
                const data = {...relativies_data, beneficiary_id: beneficiary.id};
                const relativies = await this.RelativiesService.create(data);
            });

            const authorizedEscorts_promise = data.authorizedEscorts!.map(async (authorizedEscorts_data) => {
                const data = {...authorizedEscorts_data, beneficiary_id: beneficiary.id};
                const authorizedEscorts = await this.PrismaService.authorizedEscorts.create({data});
            });

            return beneficiary;
        } catch(E: any){
            console.log(E.message);
            throw new InternalServerErrorException("Erro ao cadastrar beneficiário");
        }
    }

    async findBeneficiary(data: IFindBeneficiary): Promise<Beneficiary | null> {
        try {
            const parent = await this.PrismaService.beneficiary.findFirst({where: data});
            return parent;
        } catch(E: any) {
            throw new InternalServerErrorException("Erro ao tentar encontrar beneficiário");
        }
    }

    async updateBeneficiary(id: string, data: IUpdateBeneficiary): Promise<void> {
        try {
            await this.PrismaService.beneficiary.update({
                where: {id},
                data
            })
        } catch(E: any) {
            throw new InternalServerErrorException("Erro ao tentar atualizar beneficiário");
        }
    }

    async approveBeneficiary(id: string): Promise<void> {
        try {
            const beneficiary = await this.PrismaService.beneficiary.findUnique({
                where: { id }
            });

            if (!beneficiary) {
                throw new NotFoundException("Beneficiário não encontrado");
            }

            await this.PrismaService.beneficiary.update({
                where: { id },
                data: { status: 'APPROVED' }
            });
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException("Erro ao tentar aprovar beneficiário");
        }
    }

    async rejectBeneficiary(id: string): Promise<void> {
        try {
            const beneficiary = await this.PrismaService.beneficiary.findUnique({
                where: { id }
            });

            if (!beneficiary) {
                throw new NotFoundException("Beneficiário não encontrado");
            }

            await this.PrismaService.beneficiary.update({
                where: { id },
                data: { status: 'REJECTED' }
            });
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException("Erro ao tentar recusar beneficiário");
        }
    }

    async deleteBeneficiary(id: string): Promise<void> {
        try {
            await this.PrismaService.beneficiary.delete({where: {id}});
        } catch(E: any) {
            throw new InternalServerErrorException("Erro ao tentar deletar beneficiário");
        }
    }
}
