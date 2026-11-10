import { IsEmail, IsIn, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class ICreateUser {
  @IsEmail()
  @MaxLength(191)
  email!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsIn(['USER', 'PARENT', 'ADMIN'])
  role?: string;
}