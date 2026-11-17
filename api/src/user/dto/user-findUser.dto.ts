import { IsEmail, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class IFindUser {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(191)
  email?: string;
}