import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UserService } from './user.service.js';
import { ICreateUser } from './dto/user-create.dto.js';
import { IFindUser } from './dto/user-findUser.dto.js';
import { IUpdateUser } from './dto/user-update.dto.js';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: ICreateUser) {
    return this.userService.create(data);
  }

  @Post('find')
  @HttpCode(HttpStatus.OK)
  find(@Body() data: IFindUser) {
    if (!data.id && !data.email) {
      throw new BadRequestException('Informe id ou e-mail para localizar o usuário');
    }
    return this.userService.findUser(data);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() data: IUpdateUser) {
    return this.userService.updateUser(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.userService.deleteUser(id);
  }
}
