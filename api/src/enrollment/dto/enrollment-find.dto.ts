import { IsIn, IsOptional } from 'class-validator';

export class EnrollmentFindDto {
  @IsOptional()
  @IsIn(['PENDING', 'ACCEPTED', 'REJECTED'])
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}
