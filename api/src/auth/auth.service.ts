import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserService } from '../user/user.service.js';
import { ICreateUser } from '../user/dto/user-create.dto.js';
import { IFindCredentials } from '../user/dto/user-findCredentials.dto.js';

@Injectable()
export class AuthService {
    constructor(private readonly UserService: UserService){};

    async signup(data: ICreateUser): Promise<User> {
        const user = await this.UserService.create(data);
        return user;
    }

    async signin(data: IFindCredentials): Promise<User> {
        const user = await this.UserService.findByCredentials(data);
        if(!user){throw new NotFoundException("Verifique as credenciais")};
        
        return user;
    }
}
