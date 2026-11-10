import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Anamnese } from '@prisma/client';
import { PrismaService } from '../database/prisma.service.js';

import { ICreateAnamnese } from './dto/anamnese-create.dto.js';
import { IFindAnamnese } from './dto/anamnese-find.dto.js';
import { IUpdateAnamnese } from './dto/anamnese-update.dto.js';

@Injectable()
export class AnamneseService {
    constructor(private readonly PrismaService: PrismaService){};

    async create(data: ICreateAnamnese): Promise<Anamnese> {
        try {
            const form = await this.PrismaService.anamnese.create({data});
            return form;
        } catch(E: any) {
            throw new InternalServerErrorException("Erro ao cadastrar ficha de anamnese");
        }
    }

    async findAnamnese(data: IFindAnamnese): Promise<Anamnese | null> {
        try {
            const form = await this.PrismaService.anamnese.findFirst({where: data});
            return form;
        } catch(E: any) {
            throw new InternalServerErrorException("Erro ao tentar encontrar ficha de anamnese");
        }
    }

    async updateAnamnese(id: string, data: IUpdateAnamnese): Promise<void> {
        try {
            await this.PrismaService.anamnese.update({
                where: {id},
                data
            })
        } catch(E: any) {
            throw new InternalServerErrorException("Erro ao tentar atualizar ficha de anamnese");
        }
    }

    async deleteAnamnese(id: string): Promise<void> {
        try {
            await this.PrismaService.anamnese.delete({where: {id}});
        } catch(E: any) {
            throw new InternalServerErrorException("Erro ao tentar deletar ficha de anamnese");
        }
    }
}
