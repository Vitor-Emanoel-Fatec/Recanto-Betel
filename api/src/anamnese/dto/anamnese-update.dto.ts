import { PartialType, OmitType } from '@nestjs/mapped-types';
import { ICreateAnamnese } from './anamnese-create.dto.js';

export class IUpdateAnamnese extends PartialType(
  OmitType(ICreateAnamnese, ['beneficiary_id'] as const),
) {}
