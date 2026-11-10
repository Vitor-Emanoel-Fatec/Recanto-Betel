import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ICreateAnamnese } from '../../anamnese/dto/anamnese-create.dto.js';
import { OmitType, PartialType } from '@nestjs/mapped-types';

class EnrollmentAnamneseDto extends PartialType(
  OmitType(ICreateAnamnese, ['beneficiary_id'] as const),
) {}

class ParentSubmissionDto {
  @IsString() @MinLength(2) @MaxLength(191)
  name!: string;

  @IsString() @Matches(/^\d{11}$/)
  cpf!: string;

  @IsString() @MinLength(8) @MaxLength(191)
  contact!: string;

  @IsEmail() @MaxLength(191)
  email!: string;

  @IsOptional() @IsString() @MaxLength(191)
  profession?: string;

  @IsOptional() @IsString() @MaxLength(191)
  educational_level?: string;

  @IsOptional() @IsString() @MaxLength(191)
  comertial_address?: string;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  salary?: number;

  @IsInt() @Type(() => Number)
  relation_type!: number;
}

class AddressSubmissionDto {
  @IsString() @MinLength(2) @MaxLength(191)
  streetAddress!: string;

  @IsInt() @Min(0) @Type(() => Number)
  house_number!: number;

  @IsString() @MinLength(2) @MaxLength(191)
  neighborhood!: string;

  @IsOptional() @IsString() @MaxLength(191)
  landmark?: string;

  @IsInt() @Type(() => Number)
  housingType!: number;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Type(() => Number)
  housingCost?: number;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Type(() => Number)
  waterCost?: number;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Type(() => Number)
  powerCost?: number;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Type(() => Number)
  foodCost?: number;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Type(() => Number)
  gasCost?: number;
}

class IncomeSubmissionDto {
  @IsOptional() @IsString() @MaxLength(191)
  nis?: string;

  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Type(() => Number)
  totalIncome!: number;

  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Type(() => Number)
  perCapitaIncome!: number;

  @IsBoolean()
  hasGovernmentBenefit!: boolean;

  @IsOptional() @IsString() @MaxLength(191)
  benefitName?: string;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Type(() => Number)
  benefitValue?: number;
}

class BeneficiarySubmissionDto {
  @IsString() @MinLength(2) @MaxLength(191)
  name!: string;

  @IsDateString()
  birthday!: string;

  @IsInt() @Min(0) @Max(2147483647) @Type(() => Number)
  rg!: number;

  @IsString() @Matches(/^\d{11}$/)
  cpf!: string;

  @IsString() @MaxLength(191)
  school!: string;

  @IsString() @MaxLength(191)
  period!: string;

  @IsString() @MaxLength(191)
  religion!: string;

  @IsString() @MaxLength(10000)
  story!: string;

  @ValidateNested() @Type(() => AddressSubmissionDto)
  address!: AddressSubmissionDto;

  @ValidateNested() @Type(() => IncomeSubmissionDto)
  incomeAndBenefits!: IncomeSubmissionDto;

  @IsOptional() @ValidateNested() @Type(() => EnrollmentAnamneseDto)
  anamnese?: EnrollmentAnamneseDto;

  @IsOptional() @ValidateNested({ each: true }) @Type(() => RelativeSubmissionDto)
  relatives?: RelativeSubmissionDto[];

  @IsOptional() @ValidateNested({ each: true }) @Type(() => EscortSubmissionDto)
  authorizedEscorts?: EscortSubmissionDto[];
}

class RelativeSubmissionDto {
  @IsString() @MinLength(2) @MaxLength(191)
  name!: string;

  @IsDateString()
  birthday!: string;

  @IsInt() @Type(() => Number)
  relation!: number;

  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Type(() => Number)
  salary!: number;
}

class EscortSubmissionDto {
  @IsString() @MinLength(2) @MaxLength(191)
  name!: string;

  @IsInt() @Type(() => Number)
  relation!: number;

  @IsString() @MinLength(8) @MaxLength(191)
  contact!: string;
}

export class EnrollmentSubmitDto {
  @ValidateNested() @Type(() => ParentSubmissionDto)
  parent!: ParentSubmissionDto;

  @ValidateNested() @Type(() => BeneficiarySubmissionDto)
  beneficiary!: BeneficiarySubmissionDto;
}
