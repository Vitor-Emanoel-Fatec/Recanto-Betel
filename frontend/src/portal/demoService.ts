import { demoParent, newDemoId, type Beneficiary, type Enrollment, type EnrollmentStatus } from './demoData';

export type EnrollmentAction = 'Aprovar' | 'Solicitar informações' | 'Encaminhar para revisão' | 'Recusar' | 'Cancelar';

const actionStatus: Record<EnrollmentAction, EnrollmentStatus> = {
  Aprovar: 'Aprovada',
  'Solicitar informações': 'Aguardando informações',
  'Encaminhar para revisão': 'Em revisão',
  Recusar: 'Recusada',
  Cancelar: 'Cancelada',
};

export function createDemoBeneficiary(fullName: string, birthDate: string, date: string): Beneficiary {
  return {
    id: `ben-demo-${Date.now()}`,
    fullName,
    birthDate,
    status: 'Aguardando matrícula',
    updatedAt: date,
    parentId: demoParent.id,
  };
}

export function createDemoEnrollment(beneficiaryId: string, date: string, requestMessage: string): Enrollment {
  const id = newDemoId();
  return {
    id,
    beneficiaryId,
    parentName: demoParent.name,
    status: 'Enviada',
    requestedAt: date,
    updatedAt: date,
    reviewNotes: '',
    history: [{
      id: `evt-${Date.now()}`,
      date,
      description: requestMessage
        ? `Solicitação enviada pelo responsável. Mensagem: ${requestMessage}`
        : 'Solicitação enviada pelo responsável.',
      author: demoParent.name,
    }],
  };
}

export function applyDemoEnrollmentAction(enrollment: Enrollment, action: EnrollmentAction, reason: string, date: string): Enrollment {
  const description = reason.trim() ? `${action}: ${reason.trim()}` : `${action}.`;
  return {
    ...enrollment,
    status: actionStatus[action],
    updatedAt: date,
    reviewNotes: action === 'Solicitar informações' || action === 'Recusar' ? reason.trim() : enrollment.reviewNotes,
    history: [...enrollment.history, {
      id: `evt-${Date.now()}`,
      date,
      description,
      author: 'Equipe administrativa',
    }],
  };
}
