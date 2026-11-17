import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ICreateAnamnese {
  @IsUUID()
  beneficiary_id!: string;

  @IsOptional() @IsUUID()
  enrollment_id?: string;

  @IsOptional() @IsString() @MaxLength(10000) mainComplaintEvolution?: string | null;
  @IsOptional() @IsBoolean() suffersFromDisease?: boolean | null;
  @IsOptional() @IsString() @MaxLength(10000) diseaseDescription?: string | null;
  @IsOptional() @IsBoolean() underMedicalTreatment?: boolean | null;
  @IsOptional() @IsBoolean() isPregnant?: boolean | null;
  @IsOptional() @IsBoolean() usesMedication?: boolean | null;
  @IsOptional() @IsString() @MaxLength(10000) medicationDescription?: string | null;
  @IsOptional() @IsString() @MaxLength(500) attendingPhysicianName?: string | null;
  @IsOptional() @IsString() @MaxLength(100) attendingPhysicianPhone?: string | null;
  @IsOptional() @IsBoolean() hasAllergies?: boolean | null;
  @IsOptional() @IsString() @MaxLength(10000) allergiesDescription?: string | null;
  @IsOptional() @IsBoolean() hasHadSurgery?: boolean | null;
  @IsOptional() @IsString() @MaxLength(10000) surgeriesDescription?: string | null;
  @IsOptional() @IsBoolean() healingProblems?: boolean | null;
  @IsOptional() @IsBoolean() anesthesiaProblems?: boolean | null;
  @IsOptional() @IsBoolean() hemorrhageProblems?: boolean | null;
  @IsOptional() @IsBoolean() rheumaticFever?: boolean | null;
  @IsOptional() @IsBoolean() heartProblems?: boolean | null;
  @IsOptional() @IsBoolean() kidneyProblems?: boolean | null;
  @IsOptional() @IsBoolean() gastricProblems?: boolean | null;
  @IsOptional() @IsBoolean() respiratoryProblems?: boolean | null;
  @IsOptional() @IsBoolean() allergicProblems?: boolean | null;
  @IsOptional() @IsBoolean() jointRheumatismProblems?: boolean | null;
  @IsOptional() @IsBoolean() diabetes?: boolean | null;
  @IsOptional() @IsBoolean() arterialHypertension?: boolean | null;
  @IsOptional() @IsString() @MaxLength(10000) habits?: string | null;
  @IsOptional() @IsString() @MaxLength(10000) familyHistory?: string | null;
  @IsOptional() @IsString() @MaxLength(10000) otherInformation?: string | null;
  @IsOptional() @IsBoolean() declarationAccepted?: boolean | null;
  @IsOptional() @IsString() @MaxLength(191) responsibleSignature?: string | null;
  @IsOptional() @IsBoolean() isComplete?: boolean;
}
