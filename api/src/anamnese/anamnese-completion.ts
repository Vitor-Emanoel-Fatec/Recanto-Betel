import type { Anamnese } from '@prisma/client';

export function isAnamneseComplete(data: Partial<Anamnese>): boolean {
  const requiredBooleanFields: (keyof Anamnese)[] = [
    'suffersFromDisease',
    'underMedicalTreatment',
    'usesMedication',
    'hasAllergies',
    'hasHadSurgery',
    'healingProblems',
    'anesthesiaProblems',
    'hemorrhageProblems',
    'rheumaticFever',
    'heartProblems',
    'kidneyProblems',
    'gastricProblems',
    'respiratoryProblems',
    'allergicProblems',
    'jointRheumatismProblems',
    'diabetes',
    'arterialHypertension',
  ];
  const hasRequiredDetails =
    (!data.suffersFromDisease || Boolean(data.diseaseDescription?.trim())) &&
    (!data.usesMedication || Boolean(data.medicationDescription?.trim())) &&
    (!data.hasAllergies || Boolean(data.allergiesDescription?.trim())) &&
    (!data.hasHadSurgery || Boolean(data.surgeriesDescription?.trim()));

  return typeof data.mainComplaintEvolution === 'string' &&
    data.mainComplaintEvolution.trim().length > 0 &&
    typeof data.responsibleSignature === 'string' &&
    data.responsibleSignature.trim().length > 0 &&
    data.declarationAccepted === true &&
    requiredBooleanFields.every((field) => typeof data[field] === 'boolean') &&
    hasRequiredDetails;
}

export function hasAnamneseAnswers(data: Partial<Anamnese> | null): boolean {
  if (!data) return false;
  return Object.entries(data).some(([key, value]) =>
    !['id', 'beneficiary_id', 'createdAt', 'updatedAt', 'isComplete', 'isPregnant'].includes(key) &&
    value !== null &&
    value !== undefined &&
    (typeof value !== 'string' || value.trim() !== ''),
  );
}
