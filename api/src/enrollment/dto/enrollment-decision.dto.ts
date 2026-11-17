import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class EnrollmentDecisionDto {
  @IsIn(['PENDING', 'ACCEPTED', 'REJECTED'])
  status!: 'PENDING' | 'ACCEPTED' | 'REJECTED';

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  note?: string;
}
