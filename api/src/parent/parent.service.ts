import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Parent } from "@prisma/client";
import { PrismaService } from '../database/prisma.service.js';
import { ICreateParent } from './dto/parent-create.dto.js';
import { IFindParent } from './dto/parent-find.dto.js';
import { IUpdateParent } from './dto/parent-update.dto.js';

@Injectable()
export class ParentService {
    constructor(private readonly PrismaService: PrismaService){};

    async create(data: ICreateParent): Promise<Parent | undefined> {
        try {
            const parent = await this.PrismaService.parent.create({
                data: {
                    name: data.name,
                    cpf: data.cpf,
                    contact: data.contact,
                    email: data.email,
                    profession: data.profession,
                    educational_level: data.educational_level,
                    comertial_address: data.comertial_address,
                    salary: data.salary,
                    user: data.user_id ? {
                        connect: {id: data.user_id}
                    } : undefined
                }
            });

            return parent;
        } catch(E: any){
            throw new InternalServerErrorException("Erro ao cadastrar responsável");
        }
    }

    async findParent(data: IFindParent): Promise<Parent | null> {
        try {
            const parent = await this.PrismaService.parent.findFirst({where: data});
            return parent;
        } catch(E: any) {
            throw new InternalServerErrorException("Erro ao tentar encontrar usuário");
        }
    }

    async updateParent(id: string, data: IUpdateParent): Promise<void> {
        try {
            await this.PrismaService.parent.update({
                where: {id},
                data
            })
        } catch(E: any) {
            throw new InternalServerErrorException("Erro ao tentar atualizar responsável");
        }
    }

    async deleteParent(id: string): Promise<void> {
        try {
            await this.PrismaService.parent.delete({where: {id}});
        } catch(E: any) {
            throw new InternalServerErrorException("Erro ao tentar deletar responsável");
        }
    }
}
