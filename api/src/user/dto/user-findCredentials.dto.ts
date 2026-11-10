import { IsEmail, IsString, MaxLength } from 'class-validator';

export class IFindCredentials {
  @IsEmail()
  @MaxLength(191)
  email!: string;

  @IsString()
  @MaxLength(128)
  password!: string;
}