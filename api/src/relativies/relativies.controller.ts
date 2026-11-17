import { 
  Controller,
  Post,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  Body,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RelativiesService } from './relativies.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';

import type { Response } from "express";
import type { ICreateRelativies } from './dto/relativies-create.dto.js';
import type { IFindRelativies } from './dto/relativies-find.dto.js';
import type { IUpdateRelativies } from './dto/relativies-update.dto.js';

@Controller('relativies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class RelativiesController {
  constructor(private readonly relativiesService: RelativiesService){};

  @Post("")
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() data: ICreateRelativies, @Res() response: Response): Promise<void> {
    const result = await this.relativiesService.create(data);
    response.json(result);
  }

  @Post("find")
  @HttpCode(HttpStatus.FOUND)
  async findRelativies(@Body() data: IFindRelativies, @Res() response: Response): Promise<void> {
    const result = await this.relativiesService.findRelativies(data);
    response.json(result);
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  async updateRelativies(@Param("id") id: string, @Body() data: IUpdateRelativies, @Res() response: Response): Promise<void> {
    const result = await this.relativiesService.updateRelativies(id, data);
    response.json(result);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRelativies(@Param("id") id: string, @Res() response: Response): Promise<void> {
    const result = await this.relativiesService.deleteRelativies(id);
    response.json(result);
  }
}
