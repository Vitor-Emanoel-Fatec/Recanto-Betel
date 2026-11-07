export type BeneficiaryStatus = 'Ativo' | 'Aguardando matrícula' | 'Desligado';
export type EnrollmentStatus =
  | 'Enviada'
  | 'Em análise'
  | 'Aguardando informações'
  | 'Em revisão'
  | 'Aprovada'
  | 'Recusada'
  | 'Cancelada'
  | 'Lista de espera';

export interface Beneficiary {
  id: string;
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
  beneficiaryId: string;
  parentName: string;
  status: EnrollmentStatus;
  requestedAt: string;
  updatedAt: string;
  reviewNotes: string;
  history: EnrollmentEvent[];
}

export const demoParent = {
  id: 'resp-001',
  name: 'Mariana Oliveira',
  email: 'mariana.exemplo@email.com',
  phone: '(15) 99999-1234',
};

export const demoBeneficiaries: Beneficiary[] = [
  { id: 'ben-001', fullName: 'Ana Oliveira', birthDate: '2017-05-14', status: 'Aguardando matrícula', updatedAt: '2026-10-25', parentId: demoParent.id },
  { id: 'ben-002', fullName: 'Pedro Oliveira', birthDate: '2014-11-02', status: 'Ativo', updatedAt: '2026-10-20', parentId: demoParent.id },
  { id: 'ben-003', fullName: 'Lucas Ferreira', birthDate: '2015-08-21', status: 'Ativo', updatedAt: '2026-10-18', parentId: 'resp-002' },
  { id: 'ben-004', fullName: 'Beatriz Santos', birthDate: '2016-03-09', status: 'Desligado', updatedAt: '2026-09-30', parentId: 'resp-003' },
  { id: 'ben-005', fullName: 'Rafael Costa', birthDate: '2013-12-17', status: 'Aguardando matrícula', updatedAt: '2026-10-22', parentId: 'resp-004' },
];

export const demoEnrollments: Enrollment[] = [
  {
    id: 'MAT-2026-0042', beneficiaryId: 'ben-001', parentName: demoParent.name, status: 'Em análise',
    requestedAt: '2026-10-22', updatedAt: '2026-10-25', reviewNotes: '',
    history: [
      { id: 'evt-1', date: '2026-10-22', description: 'Solicitação enviada pelo responsável.', author: 'Mariana Oliveira' },
      { id: 'evt-2', date: '2026-10-25', description: 'Solicitação encaminhada para análise.', author: 'Equipe administrativa' },
    ],
  },
  {
    id: 'MAT-2026-0038', beneficiaryId: 'ben-002', parentName: demoParent.name, status: 'Aguardando informações',
    requestedAt: '2026-10-14', updatedAt: '2026-10-21', reviewNotes: 'Precisamos confirmar os dados de contato.',
    history: [
      { id: 'evt-3', date: '2026-10-14', description: 'Solicitação enviada pelo responsável.', author: 'Mariana Oliveira' },
      { id: 'evt-4', date: '2026-10-21', description: 'Solicitadas informações adicionais: confirmar os dados de contato.', author: 'Equipe administrativa' },
    ],
  },
  {
    id: 'MAT-2026-0031', beneficiaryId: 'ben-003', parentName: 'Rogério Ferreira', status: 'Aprovada',
    requestedAt: '2026-10-05', updatedAt: '2026-10-15', reviewNotes: '',
    history: [
      { id: 'evt-5', date: '2026-10-05', description: 'Solicitação enviada pelo responsável.', author: 'Rogério Ferreira' },
      { id: 'evt-6', date: '2026-10-15', description: 'Solicitação aprovada. O ingresso institucional é uma etapa separada.', author: 'Equipe administrativa' },
    ],
  },
  {
    id: 'MAT-2026-0024', beneficiaryId: 'ben-004', parentName: 'Carla Santos', status: 'Recusada',
    requestedAt: '2026-09-28', updatedAt: '2026-10-10', reviewNotes: 'Registro demonstrativo de decisão administrativa.',
    history: [
      { id: 'evt-7', date: '2026-09-28', description: 'Solicitação enviada pelo responsável.', author: 'Carla Santos' },
      { id: 'evt-8', date: '2026-10-10', description: 'Solicitação recusada: registro demonstrativo de decisão administrativa.', author: 'Equipe administrativa' },
    ],
  },
  {
    id: 'MAT-2026-0019', beneficiaryId: 'ben-005', parentName: 'Fernanda Costa', status: 'Em revisão',
    requestedAt: '2026-09-18', updatedAt: '2026-10-08', reviewNotes: '',
    history: [
      { id: 'evt-9', date: '2026-09-18', description: 'Solicitação enviada pelo responsável.', author: 'Fernanda Costa' },
      { id: 'evt-10', date: '2026-10-08', description: 'Solicitação encaminhada para revisão.', author: 'Equipe administrativa' },
    ],
  },
];

export const enrollmentStatuses: EnrollmentStatus[] = [
  'Enviada', 'Em análise', 'Aguardando informações', 'Em revisão',
  'Aprovada', 'Recusada', 'Cancelada', 'Lista de espera',
];

export const newDemoId = () => `MAT-DEMO-${Date.now().toString().slice(-6)}`;
