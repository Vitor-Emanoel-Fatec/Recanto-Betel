import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service.js';
import type { ICreateUser } from '../user/dto/user-create.dto.js';
import type { IFindCredentials } from '../user/dto/user-findCredentials.dto.js';

const ACCESS_TOKEN_TTL = '15m';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(data: ICreateUser) {
    if (data.termsAccepted !== true) {
      throw new BadRequestException('É necessário aceitar os termos para criar uma conta');
    }
    return this.userService.create(data, true);
  }

  async signin(data: IFindCredentials) {
    const user = await this.userService.verifyCredentials(data.email, data.password);
    if (!user) throw new UnauthorizedException('E-mail ou senha inválidos');

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    }, { expiresIn: ACCESS_TOKEN_TTL });

    return { ...user, accessToken };
  }

  async getCurrentUser(id: string) {
    const user = await this.userService.findById(id);
    if (!user) throw new UnauthorizedException('Usuário não encontrado');
    return user;
  }
}
