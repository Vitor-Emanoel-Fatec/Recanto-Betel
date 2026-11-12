import { IsObject } from 'class-validator';

export class EnrollmentFormDto {
  @IsObject()
  data!: Record<string, unknown>;
}
