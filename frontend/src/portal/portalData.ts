export type BeneficiaryStatus = 'Em análise' | 'Aprovada' | 'Recusada';
export type EnrollmentStatus = BeneficiaryStatus;

export interface Beneficiary {
  id: string;
  publicCode: string;
  fullName: string;
  birthDate: string;
  status: BeneficiaryStatus;
  updatedAt: string;
  parentId: string;
}

export type FichaKind = 'matricula' | 'termo' | 'autorizacao' | 'anamnese' | 'relatos';

export interface FichaSubmission {
  id: string;
  kind: FichaKind;
  beneficiaryId: string;
  submittedAt: string;
  data: Record<string, string>;
}

export interface EnrollmentEvent {
  id: string;
  date: string;
  description: string;
  author: string;
}

export interface Enrollment {
  id: string;
  publicCode: string;
  beneficiaryId: string;
  parentName: string;
  status: EnrollmentStatus;
  requestedAt: string;
  updatedAt: string;
  reviewNotes: string;
  history: EnrollmentEvent[];
}

export const enrollmentStatuses: EnrollmentStatus[] = ['Em análise', 'Aprovada', 'Recusada'];
