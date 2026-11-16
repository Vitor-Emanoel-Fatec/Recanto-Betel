import { apiRequest } from './apiClient';

export type EnrollmentStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type FormProgressStatus = 'PENDING' | 'INCOMPLETE' | 'COMPLETE';

export interface EnrollmentFormProgress {
  kind: string;
  title: string;
  required: boolean;
  status: FormProgressStatus;
}

export interface EnrollmentRecord {
  id: string;
  publicCode: string;
  status: EnrollmentStatus;
  submittedAt: string;
  updatedAt: string;
  decisionNote: string | null;
  termsAcceptedVersion: string | null;
  termsAcceptedAt: string | null;
  anamnese?: Record<string, unknown> | null;
  beneficiary: {
    id: string;
    publicCode: string;
    name: string;
    birthday: string;
    status: string;
    cpf?: string;
    rg?: number;
    school?: string;
    period?: string;
    religion?: string;
    story?: string;
    address?: Record<string, unknown> | null;
    incomeAndBenefits?: Record<string, unknown> | null;
    relativies?: Array<Record<string, unknown>>;
    AuthorizedEscorts?: Array<Record<string, unknown>>;
    anamnese?: Record<string, unknown> | null;
    parent?: Array<{ parent_id: string; relationshipType: string }>;
  };
  parent?: {
    id: string;
    publicCode: string;
    name: string;
    cpf: string;
    email: string;
    contact: string;
    profession?: string | null;
    educational_level?: string | null;
    comertial_address?: string | null;
    salary?: string | number | null;
  };
  forms: Array<{
    id: string;
    kind: 'TERMO' | 'AUTORIZACAO' | 'RELATOS';
    data: Record<string, string | boolean>;
    isComplete: boolean;
    updatedAt: string;
  }>;
  formsStatus: EnrollmentFormProgress[];
  formsComplete: boolean;
  history: Array<{
    id: string;
    type: string;
    note: string | null;
    createdAt: string;
  }>;
}

export interface EnrollmentSubmission {
  termsAccepted: true;
  parent: {
    name: string;
    cpf: string;
    contact: string;
    email: string;
    profession?: string;
    educational_level?: string;
    comertial_address?: string;
    salary?: number;
    relation_type: string;
  };
  beneficiary: {
    name: string;
    birthday: string;
    rg: number;
    cpf: string;
    school: string;
    period: string;
    religion: string;
    story: string;
    address: {
      streetAddress: string;
      house_number: number;
      neighborhood: string;
      landmark?: string;
      housingType: number;
      housingCost?: number;
      waterCost?: number;
      powerCost?: number;
      foodCost?: number;
      gasCost?: number;
    };
    incomeAndBenefits: {
      nis?: string;
      totalIncome: number;
      perCapitaIncome: number;
      hasGovernmentBenefit: boolean;
      benefitName?: string;
      benefitValue?: number;
    };
    relatives?: Array<{
      name: string;
      birthday: string;
      relation: string;
      salary: number;
    }>;
    authorizedEscorts?: Array<{
      name: string;
      relation: number;
      contact: string;
    }>;
  };
}

export function listMyEnrollments() {
  return apiRequest<EnrollmentRecord[]>('/enrollments/mine');
}

export function listEnrollments(status?: EnrollmentStatus | '') {
  const query = status ? `?status=${status}` : '';
  return apiRequest<EnrollmentRecord[]>(`/enrollments${query}`);
}

export function submitEnrollment(input: EnrollmentSubmission) {
  return apiRequest<EnrollmentRecord>('/enrollments', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateEnrollment(id: string, input: EnrollmentSubmission) {
  return apiRequest<EnrollmentRecord>(`/enrollments/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function saveEnrollmentForm(
  enrollmentId: string,
  kind: 'termo' | 'autorizacao' | 'relatos',
  data: Record<string, string | boolean>,
) {
  return apiRequest<EnrollmentRecord>(`/enrollments/${encodeURIComponent(enrollmentId)}/forms/${kind}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

export function getMyEnrollment(id: string) {
  return apiRequest<EnrollmentRecord>(`/enrollments/mine/${encodeURIComponent(id)}`);
}

export function createAnamnese(data: Record<string, unknown>) {
  return apiRequest<Record<string, unknown>>('/anamnese', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function decideEnrollment(id: string, status: EnrollmentStatus, note: string) {
  return apiRequest<EnrollmentRecord>(`/enrollments/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note }),
  });
}

export function updateAnamnese(id: string, data: Record<string, unknown>) {
  return apiRequest<Record<string, unknown>>(`/anamnese/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
