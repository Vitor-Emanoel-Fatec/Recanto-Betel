import { 
  Controller,
  Post,
  Delete,
  HttpCode,
  HttpStatus,
  Body,
  Res,
  Param,
  Put
} from '@nestjs/common';
import { ParentService } from './parent.service.js';

import type { ICreateParent } from './dto/parent-create.dto.js';
import type { IFindParent } from './dto/parent-find.dto.js';
import type { IUpdateParent } from './dto/parent-update.dto.js';
import type { Response } from 'express';

@Controller('parent')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Post("")
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() data: ICreateParent, @Res() response: Response): Promise<void> {
    const result = await this.parentService.create(data);
    response.json(result);
  }

  @Post("find")
  @HttpCode(HttpStatus.FOUND)
  async findParent(@Body() data: IFindParent, @Res() response: Response): Promise<void> {
    const result = await this.parentService.findParent(data);
    response.json(result);
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  async updateParent(@Param("id") id: string, @Body() data: IUpdateParent, @Res() response: Response): Promise<void> {
    const result = await this.parentService.updateParent(id, data);
    response.json(result);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteParent(@Param("id") id: string, @Res() response: Response): Promise<void> {
    const result = await this.parentService.deleteParent(id);
    response.json(result);
  }
}
