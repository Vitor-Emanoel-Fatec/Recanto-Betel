import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import type { AuthenticatedRequest } from '../auth/authenticated-user.js';
import { AnamneseService } from './anamnese.service.js';
import { ICreateAnamnese } from './dto/anamnese-create.dto.js';
import { IFindAnamnese } from './dto/anamnese-find.dto.js';
import { IUpdateAnamnese } from './dto/anamnese-update.dto.js';

@Controller('anamnese')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnamneseController {
  constructor(private readonly anamneseService: AnamneseService) {}

  @Post()
  @Roles('ADMIN', 'PARENT')
  @HttpCode(HttpStatus.CREATED)
  create(@Req() request: AuthenticatedRequest, @Body() data: ICreateAnamnese) {
    return this.anamneseService.create(request.user, data);
  }

  @Post('find')
  @Roles('ADMIN', 'PARENT')
  @HttpCode(HttpStatus.OK)
  find(@Req() request: AuthenticatedRequest, @Body() data: IFindAnamnese) {
    return this.anamneseService.findAnamnese(request.user, data);
  }

  @Put(':id')
  @Roles('ADMIN', 'PARENT')
  @HttpCode(HttpStatus.OK)
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: IUpdateAnamnese,
  ) {
    return this.anamneseService.updateAnamnese(request.user, id, data);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.anamneseService.deleteAnamnese(request.user, id);
  }
}
