import { 
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Res
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { ICreateUser } from '../user/dto/user-create.dto.js';
import type { Response } from 'express';
import type { IFindCredentials } from '../user/dto/user-findCredentials.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService){};

  @Post("signup")
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() data: ICreateUser, @Res() response: Response): Promise<void>{
    const result = await this.authService.signup(data);
    response.json(result);
  }

  @Post("signin")
  @HttpCode(HttpStatus.OK)
  async signin(@Body() data: IFindCredentials, @Res() response: Response): Promise<void>{
    const result = await this.authService.signin(data);
    response.json(result);
  }
}
