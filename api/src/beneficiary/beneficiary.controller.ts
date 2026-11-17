import { 
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Res,
  Req,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { BeneficiaryService } from './beneficiary.service.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/authenticated-user.js';

import type { Response } from "express";
import type { ICreateBeneficiary } from './dto/beneficiary-create.dto.js';
import type { IFindBeneficiary } from './dto/beneficiary-find.dto.js';
import type { IUpdateBeneficiary } from './dto/beneficiary-update.dto.js';

@Controller('beneficiary')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class BeneficiaryController {
  constructor(private readonly beneficiaryService: BeneficiaryService) {}

  @Get('mine')
  @Roles('USER', 'PARENT')
  async listMine(@Req() request: AuthenticatedRequest) {
    return this.beneficiaryService.listMine(request.user);
  }

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
  
  @Patch(":id/approve")
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  async approveBeneficiary(@Param("id") id: string, @Res() response: Response): Promise<void> {
    await this.beneficiaryService.approveBeneficiary(id);
    response.json({ message: 'Matrícula aprovada' });
  }

  @Patch(":id/reject")
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  async rejectBeneficiary(@Param("id") id: string, @Res() response: Response): Promise<void> {
    await this.beneficiaryService.rejectBeneficiary(id);
    response.json({ message: 'Matrícula recusada' });
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBeneficiary(@Param("id") id: string, @Res() response: Response): Promise<void> {
    const result = await this.beneficiaryService.deleteBeneficiary(id);
    response.json(result);
  }
}
