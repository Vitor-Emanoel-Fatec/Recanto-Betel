import { apiRequest } from './apiClient';

export type EnrollmentStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface EnrollmentRecord {
  id: string;
  status: EnrollmentStatus;
  submittedAt: string;
  updatedAt: string;
  decisionNote: string | null;
  beneficiary: {
    id: string;
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
  };
  parent?: {
    id: string;
    name: string;
    email: string;
    contact: string;
  };
  history: Array<{
    id: string;
    type: string;
    note: string | null;
    createdAt: string;
  }>;
}

export interface EnrollmentSubmission {
  parent: {
    name: string;
    cpf: string;
    contact: string;
    email: string;
    profession?: string;
    educational_level?: string;
    comertial_address?: string;
    salary?: number;
    relation_type: number;
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
      relation: number;
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

export function decideEnrollment(id: string, status: EnrollmentStatus, note: string) {
  return apiRequest<EnrollmentRecord>(`/enrollments/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note }),
  });
}

export function findAnamnese(beneficiaryId: string) {
  return apiRequest<Record<string, unknown>>('/anamnese/find', {
    method: 'POST',
    body: JSON.stringify({ beneficiary_id: beneficiaryId }),
  });
}

export function updateAnamnese(id: string, data: Record<string, unknown>) {
  return apiRequest<Record<string, unknown>>(`/anamnese/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
