import { apiRequest } from './apiClient';

export type BeneficiaryRecordStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface BeneficiaryRecord {
  id: string;
  publicCode: string;
  name: string;
  birthday: string;
  status: BeneficiaryRecordStatus;
  updatedAt: string;
}

export function listMyBeneficiaries() {
  return apiRequest<BeneficiaryRecord[]>('/beneficiary/mine');
}
