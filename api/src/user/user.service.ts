import { 
    Injectable,
    InternalServerErrorException
} from '@nestjs/common';
import { User } from "@prisma/client";
import { PrismaService } from '../database/prisma.service.js';

import { ICreateUser } from './dto/user-create.dto.js';
import { IFindUser } from "./dto/user-findUser.dto.js";
import { IFindCredentials } from "./dto/user-findCredentials.dto.js";
import { IUpdateUser } from './dto/user-update.dto.js';

@Injectable()
export class UserService {
    constructor(private readonly PrismaService: PrismaService){};

    async create(data: ICreateUser): Promise<User>{
        try{
            const user = await this.PrismaService.user.create({
                data: {
                    email: data.email,
                    password: data.password,
                    role: data.role ?? "USER"
                }
            });
            return user;
        } catch(E: any){
            throw new InternalServerErrorException("Erro ao cadastrar usuário");
        }
    }

    async findUser(where: IFindUser): Promise<User | null> {
        try {
            const user = await this.PrismaService.user.findFirst({where});
            return user;
        } catch(E: any) {
            throw new InternalServerErrorException("Erro ao tentar encontrar usuário");
        }
    }

    async findByCredentials(where: IFindCredentials): Promise<User | null> {
        try {
            const user = await this.PrismaService.user.findFirst({where});
            return user;
        } catch(E: any) {
            throw new InternalServerErrorException("Erro ao tentar encontrar usuário");
        }
    }

    async updateUser(id: string, data: IUpdateUser): Promise<void> {
        try {
            await this.PrismaService.user.update({
                where: {id},
                data
            })
        } catch(E: any) {
            throw new InternalServerErrorException("Erro ao tentar atualizar responsável");
        }
    }

    async deleteUser(id: string): Promise<void> {
        try {
            await this.PrismaService.user.delete({where: {id}});
        } catch(E: any) {
            throw new InternalServerErrorException("Erro ao tentar deletar responsável");
        }
    }
}
