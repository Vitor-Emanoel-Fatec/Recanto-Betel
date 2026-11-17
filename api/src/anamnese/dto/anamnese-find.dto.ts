import { IsOptional, IsUUID } from 'class-validator';

export class IFindAnamnese {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsUUID()
  beneficiary_id?: string;
}