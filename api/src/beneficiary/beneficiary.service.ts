import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Beneficiary } from "@prisma/client";
import { PrismaService } from '../database/prisma.service.js';

import { ICreateBeneficiary } from './dto/beneficiary-create.dto.js';
import { IFindBeneficiary } from './dto/beneficiary-find.dto.js';
import { IUpdateBeneficiary } from './dto/beneficiary-update.dto.js';

@Injectable()
export class BeneficiaryService {
    constructor(private readonly PrismaService: PrismaService){};

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
