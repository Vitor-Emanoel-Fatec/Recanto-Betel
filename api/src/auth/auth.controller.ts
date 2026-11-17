import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import type { AuthenticatedRequest } from './authenticated-user.js';
import { ICreateUser } from '../user/dto/user-create.dto.js';
import { IFindCredentials } from '../user/dto/user-findCredentials.dto.js';
import { TERMS_CONTENT, TERMS_VERSION } from './terms.js';

const COOKIE_NAME = 'recanto_access';
const COOKIE_MAX_AGE = 15 * 60 * 1000;

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('terms')
  terms() {
    return { version: TERMS_VERSION, content: TERMS_CONTENT };
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() data: ICreateUser) {
    return this.authService.signup(data);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() data: IFindCredentials, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.signin(data);
    response.cookie(COOKIE_NAME, result.accessToken, cookieOptions());
    return { id: result.id, email: result.email, role: result.role };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() request: AuthenticatedRequest) {
    return this.authService.getCurrentUser(request.user.id);
  }

  @Post('signout')
  @HttpCode(HttpStatus.NO_CONTENT)
  signout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }
}
