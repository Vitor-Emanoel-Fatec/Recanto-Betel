import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import type { AuthenticatedRequest } from '../auth/authenticated-user.js';
import { EnrollmentDecisionDto } from './dto/enrollment-decision.dto.js';
import { EnrollmentFindDto } from './dto/enrollment-find.dto.js';
import { EnrollmentFormDto } from './dto/enrollment-form.dto.js';
import { EnrollmentSubmitDto } from './dto/enrollment-submit.dto.js';
import { EnrollmentService } from './enrollment.service.js';

@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @Roles('USER', 'PARENT', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  submit(@Req() request: AuthenticatedRequest, @Body() input: EnrollmentSubmitDto) {
    return this.enrollmentService.submit(request.user, input);
  }

  @Get('mine')
  @Roles('USER', 'PARENT')
  listMine(@Req() request: AuthenticatedRequest) {
    return this.enrollmentService.listMine(request.user);
  }

  @Get('mine/:id')
  @Roles('USER', 'PARENT')
  findMine(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.enrollmentService.findMine(request.user, id);
  }

  @Put(':id')
  @Roles('ADMIN', 'PARENT')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: EnrollmentSubmitDto,
  ) {
    return this.enrollmentService.update(request.user, id, input);
  }

  @Put(':id/forms/:kind')
  @Roles('ADMIN', 'PARENT')
  saveForm(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('kind') kind: string,
    @Body() input: EnrollmentFormDto,
  ) {
    return this.enrollmentService.saveForm(request.user, id, kind, input);
  }

  @Get()
  @Roles('ADMIN')
  listAll(@Query() filter: EnrollmentFindDto) {
    return this.enrollmentService.listAll(filter);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  updateStatus(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: EnrollmentDecisionDto,
  ) {
    return this.enrollmentService.updateStatus(request.user, id, input);
  }
}
