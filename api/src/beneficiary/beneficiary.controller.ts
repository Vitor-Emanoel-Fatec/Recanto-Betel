import { 
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Res,
  Param,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { BeneficiaryService } from './beneficiary.service.js';

import type { Response } from "express";
import type { ICreateBeneficiary } from './dto/beneficiary-create.dto.js';
import type { IFindBeneficiary } from './dto/beneficiary-find.dto.js';
import type { IUpdateBeneficiary } from './dto/beneficiary-update.dto.js';

@Controller('beneficiary')
export class BeneficiaryController {
  constructor(private readonly beneficiaryService: BeneficiaryService) {}

  @Post("")
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() data: ICreateBeneficiary, @Res() response: Response): Promise<void> {
    const result = await this.beneficiaryService.create(data);
    response.json(result);
  }
  
  @Post("find")
  @HttpCode(HttpStatus.FOUND)
  async findBeneficiary(@Body() data: IFindBeneficiary, @Res() response: Response): Promise<void> {
    const result = await this.beneficiaryService.findBeneficiary(data);
    response.json(result);
  }
  
  @Put(":id")
  @HttpCode(HttpStatus.OK)
  async updateBeneficiary(@Param("id") id: string, @Body() data: IUpdateBeneficiary, @Res() response: Response): Promise<void> {
    const result = await this.beneficiaryService.updateBeneficiary(id, data);
    response.json(result);
  }
  
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBeneficiary(@Param("id") id: string, @Res() response: Response): Promise<void> {
    const result = await this.beneficiaryService.deleteBeneficiary(id);
    response.json(result);
  }
}
