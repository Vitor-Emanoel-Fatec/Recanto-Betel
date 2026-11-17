import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../database/prisma.service.js';

import { ICreateUser } from './dto/user-create.dto.js';
import { IFindUser } from "./dto/user-findUser.dto.js";
import { IUpdateUser } from './dto/user-update.dto.js';
import { TERMS_VERSION } from '../auth/terms.js';

export interface PublicUser {
    id: string;
    email: string;
    role: string;
}

const publicUserSelect = { id: true, email: true, role: true } as const;

function isArgon2Hash(password: string): boolean {
    return password.startsWith('$argon2id$') || password.startsWith('$argon2i$') || password.startsWith('$argon2d$');
}

function compareLegacyPassword(candidate: string, stored: string): boolean {
    const candidateBuffer = Buffer.from(candidate);
    const storedBuffer = Buffer.from(stored);
    return candidateBuffer.length === storedBuffer.length && timingSafeEqual(candidateBuffer, storedBuffer);
}

@Injectable()
export class UserService {
    constructor(private readonly PrismaService: PrismaService){};

    async create(data: ICreateUser, forceUserRole = false): Promise<PublicUser> {
        try{
            const user = await this.PrismaService.user.create({
                data: {
                    email: data.email,
                    password: await argon2.hash(data.password, { type: argon2.argon2id }),
                    role: forceUserRole ? 'USER' : data.role ?? 'USER',
                    ...(forceUserRole && data.termsAccepted === true
                        ? { termsAcceptedVersion: TERMS_VERSION, termsAcceptedAt: new Date() }
                        : {}),
                },
                select: publicUserSelect,
            });
            return user;
        } catch (error) {
            if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
                throw new ConflictException('Já existe um usuário com este e-mail');
            }
            throw new InternalServerErrorException("Erro ao cadastrar usuário");
        }
    }

    async findUser(where: IFindUser): Promise<PublicUser | null> {
        try {
            const user = await this.PrismaService.user.findFirst({ where, select: publicUserSelect });
            return user;
        } catch {
            throw new InternalServerErrorException("Erro ao tentar encontrar usuário");
        }
    }

    async findById(id: string): Promise<PublicUser | null> {
        return this.PrismaService.user.findUnique({ where: { id }, select: publicUserSelect });
    }

    async verifyCredentials(email: string, candidate: string): Promise<PublicUser | null> {
        try {
            const user = await this.PrismaService.user.findUnique({ where: { email } });
            if (!user) return null;

            const hashed = isArgon2Hash(user.password);
            let valid = false;
            if (hashed) {
                try {
                    valid = await argon2.verify(user.password, candidate);
                } catch {
                    valid = false;
                }
            } else {
                valid = compareLegacyPassword(candidate, user.password);
                if (valid) {
                    const replacement = await argon2.hash(candidate, { type: argon2.argon2id });
                    await this.PrismaService.user.updateMany({
                        where: { id: user.id, password: user.password },
                        data: { password: replacement },
                    });
                }
            }

            return valid
                ? { id: user.id, email: user.email, role: user.role }
                : null;
        } catch {
            throw new InternalServerErrorException("Erro ao tentar encontrar usuário");
        }
    }

    async updateUser(id: string, data: IUpdateUser): Promise<PublicUser> {
        try {
            const updateData = {
                ...data,
                ...(data.password ? {
                    password: await argon2.hash(data.password, { type: argon2.argon2id }),
                } : {}),
            };
            const user = await this.PrismaService.user.update({
                where: { id },
                data: updateData,
                select: publicUserSelect,
            });
            return user;
        } catch (error) {
            if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
                throw new NotFoundException('Usuário não encontrado');
            }
            throw new InternalServerErrorException("Erro ao tentar atualizar responsável");
        }
    }

    async deleteUser(id: string): Promise<void> {
        try {
            await this.PrismaService.user.delete({where: {id}});
        } catch {
            throw new InternalServerErrorException("Erro ao tentar deletar responsável");
        }
    }
}
