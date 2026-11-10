import { 
  Controller,
  Post,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  Body,
  Res,
  Param
} from '@nestjs/common';
import { UserService } from './user.service.js';

import type { Response } from "express";
import type { ICreateUser } from './dto/user-create.dto.js';
import type { IFindUser } from './dto/user-findUser.dto.js';
import type { IUpdateUser } from './dto/user-update.dto.js';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("")
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() data: ICreateUser, @Res() response: Response): Promise<void> {
    const result = await this.userService.create(data);
    response.json(result);
  }

  @Post("find")
  @HttpCode(HttpStatus.FOUND)
  async findParent(@Body() data: IFindUser, @Res() response: Response): Promise<void> {
    const result = await this.userService.findUser(data);
    response.json(result);
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  async updateUser(@Param("id") id: string, @Body() data: IUpdateUser, @Res() response: Response): Promise<void> {
    const result = await this.userService.updateUser(id, data);
    response.json(result);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param("id") id: string, @Res() response: Response): Promise<void> {
    const result = await this.userService.deleteUser(id);
    response.json(result);
  }
}
