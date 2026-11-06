import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Beneficiary } from "@prisma/client";
import { PrismaService } from '../database/prisma.service.js';
import { ParentService } from '../parent/parent.service.js';

import { ICreateBeneficiary } from './dto/beneficiary-create.dto.js';
import { IFindBeneficiary } from './dto/beneficiary-find.dto.js';
import { IUpdateBeneficiary } from './dto/beneficiary-update.dto.js';
import { AnamneseService } from '../anamnese/anamnese.service.js';

@Injectable()
export class BeneficiaryService {
    constructor(
        private readonly PrismaService: PrismaService, 
        private readonly ParentService: ParentService,
        private readonly AnamneseService: AnamneseService
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
                    health_info: data.health_info_id ? {
                        connect: {id: data.health_info_id}
                    } : undefined
                }
            });

            const anamnese_form = await this.AnamneseService.create({
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

    async deleteBeneficiary(id: string): Promise<void> {
        try {
            await this.PrismaService.beneficiary.delete({where: {id}});
        } catch(E: any) {
            throw new InternalServerErrorException("Erro ao tentar deletar beneficiário");
        }
    }
}
