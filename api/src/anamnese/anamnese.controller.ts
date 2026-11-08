import { 
  Controller,
  Body,
  Param,
  Post,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  Res
} from '@nestjs/common';
import { AnamneseService } from './anamnese.service.js';
import type { ICreateAnamnese } from './dto/anamnese-create.dto.js';
import type { Response } from "express";
import type { IFindAnamnese } from './dto/anamnese-find.dto.js';
import type { IUpdateAnamnese } from './dto/anamnese-update.dto.js';

@Controller('anamnese')
export class AnamneseController {
  constructor(private readonly anamneseService: AnamneseService) {}

  @Post("")
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: ICreateAnamnese, @Res() response: Response): Promise<void> {
    const result = await this.anamneseService.create(body);
    response.json(result);
  }

  @Post("find")
  @HttpCode(HttpStatus.FOUND)
  async findBeneficiary(@Body() data: IFindAnamnese, @Res() response: Response): Promise<void> {
    const result = await this.anamneseService.findAnamnese(data);
    response.json(result);
  }
    
  @Put(":id")
  @HttpCode(HttpStatus.OK)
  async updateBeneficiary(@Param("id") id: string, @Body() data: IUpdateAnamnese, @Res() response: Response): Promise<void> {
    const result = await this.anamneseService.updateAnamnese(id, data);
    response.json(result);
  }
  
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBeneficiary(@Param("id") id: string, @Res() response: Response): Promise<void> {
    const result = await this.anamneseService.deleteAnamnese(id);
    response.json(result);
  }
}
