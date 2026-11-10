import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Relatives, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service.js';
import { ICreateRelativies } from './dto/relativies-create.dto.js';
import { IFindRelativies } from './dto/relativies-find.dto.js';
import { IUpdateRelativies } from './dto/relativies-update.dto.js';

@Injectable()
export class RelativiesService {
    constructor(private readonly PrismaService: PrismaService){};
    
    async create(data: ICreateRelativies): Promise<Relatives | undefined> {
            try {
                const birthday = new Date(data.birthday).toISOString();
                const relatives = await this.PrismaService.relatives.create({data: {
                    ...data,
                    birthday
                }});
    
                return relatives;
            } catch(E: any){
                console.log(E.message);
                throw new InternalServerErrorException("Erro ao cadastrar familiar");
            }
        }
    
        async findRelativies(data: IFindRelativies): Promise<Relatives | null> {
            try {
                const relatives = await this.PrismaService.relatives.findFirst({where: data});
                return relatives;
            } catch(E: any) {
                throw new InternalServerErrorException("Erro ao tentar encontrar familiar");
            }
        }
    
        async updateRelativies(id: string, data: IUpdateRelativies): Promise<void> {
            try {
                await this.PrismaService.relatives.update({
                    where: {id},
                    data
                })
            } catch(E: any) {
                throw new InternalServerErrorException("Erro ao tentar atualizar familiar");
            }
        }
    
        async deleteRelativies(id: string): Promise<void> {
            try {
                await this.PrismaService.relatives.delete({where: {id}});
            } catch(E: any) {
                throw new InternalServerErrorException("Erro ao tentar deletar familiar");
            }
        }
}
