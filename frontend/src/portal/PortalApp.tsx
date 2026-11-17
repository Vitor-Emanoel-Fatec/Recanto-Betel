import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  Activity, ArrowLeft, ArrowRight, Bell, Check, ChevronDown, ClipboardList, Clock3,
  FilePlus2, FileText, Filter, Heart, LayoutDashboard, Menu, Plus, Search, Users, X,
} from 'lucide-react';
import styles from './PortalApp.module.scss';
import {
  type Beneficiary, type Enrollment, type EnrollmentEvent, type EnrollmentStatus, type FichaKind,
} from './portalData';
import { FICHAS, FichaPage, FichasHub, isFichaKind } from './PortalForms';
import { useAuth } from '../services/AuthContext';
import { getRegistrationTerms, type RegistrationTerms } from '../services/authService';
import { listMyBeneficiaries, type BeneficiaryRecord } from '../services/beneficiaryService';
import { ApiError } from '../services/apiClient';
import logoRecanto from '../assets/Logo-Recanto.svg';
import {
  createAnamnese,
  decideEnrollment,
  getMyEnrollment,
  listEnrollments,
  listMyEnrollments,
  saveEnrollmentForm,
  submitEnrollment as submitEnrollmentRequest,
  updateAnamnese,
  updateEnrollment,
  type EnrollmentRecord,
  type EnrollmentSubmission,
  type EnrollmentStatus as ApiEnrollmentStatus,
} from '../services/enrollmentService';

type Area = 'portal' | 'admin';
type PageKey = 'home' | 'beneficiaries' | 'beneficiary-detail' | 'beneficiary-new' | 'enrollments' | 'enrollment-new' | 'enrollment-edit' | 'enrollment-detail' | 'tracking' | 'responsibles' | 'reports' | 'forms' | 'form';
type Action = 'Aprovar' | 'Recusar' | 'Encaminhar para revisão';
type PortalEnrollment = Enrollment & { parentId: string; parentPublicCode: string; parentEmail: string; parentContact: string };
const enrollmentStatuses: EnrollmentStatus[] = ['Em análise', 'Aprovada', 'Recusada'];
const apiFieldInputNames: Record<string, string> = {
  'parent.name': 'parentName',
  'parent.cpf': 'parentCpf',
  'parent.contact': 'parentContact',
  'parent.email': 'parentEmail',
  'parent.profession': 'parentProfession',
  'parent.educational_level': 'parentEducation',
  'parent.comertial_address': 'parentWorkAddress',
  'parent.salary': 'parentSalary',
  'parent.relation_type': 'parentRelation',
  'beneficiary.name': 'beneficiaryName',
  'beneficiary.birthday': 'birthday',
  'beneficiary.address.house_number': 'houseNumber',
  'beneficiary.anamnese.mainComplaintEvolution': 'queixaPrincipal',
  'beneficiary.anamnese.suffersFromDisease': 'doenca',
  'beneficiary.anamnese.underMedicalTreatment': 'tratamento',
  'beneficiary.anamnese.isPregnant': 'gravidez',
  'beneficiary.anamnese.usesMedication': 'medicacao',
  'beneficiary.anamnese.diseaseDescription': 'doencaDetalhe',
  'beneficiary.anamnese.medicationDescription': 'medicacaoDetalhe',
  'beneficiary.anamnese.attendingPhysicianName': 'medicoNome',
  'beneficiary.anamnese.attendingPhysicianPhone': 'medicoTelefone',
  'beneficiary.anamnese.hasAllergies': 'alergia',
  'beneficiary.anamnese.allergiesDescription': 'alergiaDetalhe',
  'beneficiary.anamnese.hasHadSurgery': 'operado',
  'beneficiary.anamnese.surgeriesDescription': 'operadoDetalhe',
  'beneficiary.anamnese.healingProblems': 'cicatrizacao',
  'beneficiary.anamnese.anesthesiaProblems': 'anestesia',
  'beneficiary.anamnese.hemorrhageProblems': 'hemorragia',
  'beneficiary.anamnese.rheumaticFever': 'doencas_febreReumatica',
  'beneficiary.anamnese.heartProblems': 'doencas_cardiacos',
  'beneficiary.anamnese.kidneyProblems': 'doencas_renais',
  'beneficiary.anamnese.gastricProblems': 'doencas_gastricos',
  'beneficiary.anamnese.respiratoryProblems': 'doencas_respiratorios',
  'beneficiary.anamnese.allergicProblems': 'doencas_alergicos',
  'beneficiary.anamnese.jointRheumatismProblems': 'doencas_articulares',
  'beneficiary.anamnese.diabetes': 'doencas_diabetes',
  'beneficiary.anamnese.arterialHypertension': 'doencas_hipertensao',
  'beneficiary.anamnese.habits': 'habitos',
  'beneficiary.anamnese.familyHistory': 'antecedentesFamiliares',
  'beneficiary.anamnese.otherInformation': 'outrasInformacoes',
  'beneficiary.anamnese.declarationAccepted': 'declaracao',
  'beneficiary.anamnese.responsibleSignature': 'assinatura',
};
const PAGE_LABELS: Record<PageKey, string> = {
  home: 'Visão geral', beneficiaries: 'Beneficiários', 'beneficiary-detail': 'Detalhes do beneficiário', 'beneficiary-new': 'Novo beneficiário',
  enrollments: 'Matrículas', 'enrollment-new': 'Nova solicitação', 'enrollment-edit': 'Editar matrícula',
  'enrollment-detail': 'Acompanhamento', tracking: 'Acompanhamento institucional', responsibles: 'Responsáveis', reports: 'Relatórios',
  forms: 'Fichas', form: 'Preencher ficha',
};

function inputNameForValidationField(field: string): string {
  const exactName = apiFieldInputNames[field]
    ?? apiFieldInputNames[`beneficiary.${field}`]
    ?? apiFieldInputNames[`beneficiary.anamnese.${field}`];
  if (exactName) return exactName;
  const relative = field.match(/(?:^|\.)relatives\.(\d+)\.(name|birthday|relation|salary)$/);
  if (relative) {
    const suffix = { name: 'Name', birthday: 'Birthday', relation: 'Relation', salary: 'Salary' }[relative[2]];
    return `relative${suffix}${relative[1]}`;
  }
  return field.split('.').at(-1) ?? field;
}

function focusValidationField(field: string): void {
  const name = inputNameForValidationField(field);
  const control = Array.from(document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    'input[name], select[name], textarea[name]',
  )).find((element) => element.name === name && !element.disabled && element.getClientRects().length > 0);
  if (!control) return;
  control.setAttribute('aria-invalid', 'true');
  control.scrollIntoView({ behavior: 'smooth', block: 'center' });
  control.focus({ preventScroll: true });
}

function routeInfo(path: string): { area: Area; page: PageKey; id?: string; formKind?: string } {
  const area: Area = path.startsWith('/admin') ? 'admin' : 'portal';
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 1) return { area, page: 'home' };
  if (segments[1] === 'beneficiarios' && segments[2] === 'novo') return { area, page: 'beneficiary-new' };
  if (segments[1] === 'beneficiarios' && segments[2]) return { area, page: 'beneficiary-detail', id: segments[2] };
  if (segments[1] === 'beneficiarios') return { area, page: 'beneficiaries' };
  if (segments[1] === 'matriculas' && segments[2] === 'nova') return { area, page: 'enrollment-new' };
  if (segments[1] === 'matriculas' && segments[2] && segments[3] === 'editar') return { area, page: 'enrollment-edit', id: segments[2] };
  if (segments[1] === 'matriculas' && segments[2] && segments[3] === 'fichas' && segments[4]) {
    return { area, page: 'form', id: segments[2], formKind: segments[4] };
  }
  if (segments[1] === 'matriculas' && segments[2]) return { area, page: 'enrollment-detail', id: segments[2] };
  if (segments[1] === 'matriculas') return { area, page: 'enrollments' };
  if (segments[1] === 'acompanhamento') return { area, page: 'tracking' };
  if (segments[1] === 'responsaveis') return { area, page: 'responsibles' };
  if (segments[1] === 'relatorios') return { area, page: 'reports' };
  if (segments[1] === 'fichas' && segments[2]) return { area, page: 'form', formKind: segments[2] };
  if (segments[1] === 'fichas') return { area, page: 'forms' };
  return { area, page: 'home' };
}

const formatDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR');
const actionsFor = (status: EnrollmentStatus): Action[] => status === 'Em análise'
  ? ['Aprovar', 'Recusar']
  : ['Encaminhar para revisão'];

const apiStatus = (status: ApiEnrollmentStatus): EnrollmentStatus => ({
  PENDING: 'Em análise',
  ACCEPTED: 'Aprovada',
  REJECTED: 'Recusada',
} satisfies Record<ApiEnrollmentStatus, EnrollmentStatus>)[status];

function toPortalEnrollment(
  record: EnrollmentRecord,
  fallbackParent: { id: string; email: string },
  parentIdOverride?: string,
): PortalEnrollment {
  const parentName = record.parent?.name ?? fallbackParent.email;
  const history: EnrollmentEvent[] = record.history.map((event) => ({
    id: event.id,
    date: event.createdAt.slice(0, 10),
    description: `${({
      SUBMITTED: 'Matrícula registrada',
      ACCEPTED: 'Solicitação aceita pela equipe',
      REJECTED: 'Solicitação recusada pela equipe',
      RETURNED_TO_PENDING: 'Solicitação retornou para análise',
    } as Record<string, string>)[event.type] ?? 'Atualização registrada'}${event.note ? `: ${event.note}` : '.'}`,
    author: event.type === 'SUBMITTED' ? 'Registro inicial' : 'Equipe administrativa',
  }));
  return {
    id: record.id,
    publicCode: record.publicCode,
    beneficiaryId: record.beneficiary.id,
    parentName,
    parentId: parentIdOverride ?? record.parent?.id ?? fallbackParent.id,
    parentPublicCode: record.parent?.publicCode ?? '',
    parentEmail: record.parent?.email ?? fallbackParent.email,
    parentContact: record.parent?.contact ?? '',
    status: apiStatus(record.status),
    requestedAt: record.submittedAt.slice(0, 10),
    updatedAt: record.updatedAt.slice(0, 10),
    reviewNotes: record.decisionNote ?? '',
    history,
  };
}

function toPortalBeneficiary(record: EnrollmentRecord, parentId: string): Beneficiary {
  return {
    id: record.beneficiary.id,
    publicCode: record.beneficiary.publicCode,
    fullName: record.beneficiary.name,
    birthDate: record.beneficiary.birthday.slice(0, 10),
    status: apiBeneficiaryStatus(record.beneficiary.status),
    updatedAt: record.beneficiary.updatedAt.slice(0, 10),
    parentId,
  };
}

function apiBeneficiaryStatus(status: BeneficiaryRecord['status']): Beneficiary['status'] {
  return ({
    PENDING: 'Em análise',
    APPROVED: 'Aprovada',
    REJECTED: 'Recusada',
  } satisfies Record<BeneficiaryRecord['status'], Beneficiary['status']>)[status];
}

function toPortalBeneficiaryRecord(record: BeneficiaryRecord, parentId: string): Beneficiary {
  return {
    id: record.id,
    publicCode: record.publicCode,
    fullName: record.name,
    birthDate: record.birthday.slice(0, 10),
    status: apiBeneficiaryStatus(record.status),
    updatedAt: record.updatedAt.slice(0, 10),
    parentId,
  };
}

export function PortalApp() {
  const { user, isLoading: isAuthLoading, error: authError, refresh, signOut } = useAuth();
  const [path, setPath] = useState(window.location.pathname);
  const [apiRecords, setApiRecords] = useState<EnrollmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [enrollments, setEnrollments] = useState<PortalEnrollment[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [sortNewest, setSortNewest] = useState(true);
  const [page, setPage] = useState(1);
  const [pendingAction, setPendingAction] = useState<{ enrollmentId: string; action: Action } | null>(null);
  const [reason, setReason] = useState('');
  const [newEnrollmentId, setNewEnrollmentId] = useState('');
  const [validationIssues, setValidationIssues] = useState<Array<{ field: string; message: string }>>([]);
  const current = routeInfo(path);
  const isAdmin = current.area === 'admin';
  const fallbackParent = { id: user?.id ?? '', email: user?.email ?? '' };
  const visibleNav: { key: PageKey; label: string; href: string; icon: typeof LayoutDashboard }[] =
    current.area === 'admin'
      ? [
          { key: 'home', label: 'Visão geral', href: '/admin', icon: LayoutDashboard },
          { key: 'enrollments', label: 'Matrículas', href: '/admin/matriculas', icon: ClipboardList },
          { key: 'beneficiaries', label: 'Beneficiários', href: '/admin/beneficiarios', icon: Users },
          { key: 'responsibles', label: 'Responsáveis', href: '/admin/responsaveis', icon: Heart },
          { key: 'tracking', label: 'Acompanhamento', href: '/admin/acompanhamento', icon: Activity },
          { key: 'reports', label: 'Relatórios', href: '/admin/relatorios', icon: Activity },
        ]
      : [
          { key: 'home', label: 'Visão geral', href: '/portal', icon: LayoutDashboard },
          { key: 'beneficiaries', label: 'Beneficiários', href: '/portal/beneficiarios', icon: Users },
          { key: 'enrollments', label: 'Matrículas', href: '/portal/matriculas', icon: ClipboardList },
          { key: 'forms', label: 'Fichas', href: '/portal/fichas', icon: FileText },
          { key: 'tracking', label: 'Acompanhamento', href: '/portal/acompanhamento', icon: Activity },
        ];

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!user || isAuthLoading) return;
    if ((isAdmin && user.role !== 'ADMIN') || (!isAdmin && user.role === 'ADMIN')) {
      setLoadError('Esta conta não tem permissão para acessar esta área.');
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    setLoadError('');
    const request = isAdmin
      ? listEnrollments().then((records) => ({ records, ownBeneficiaries: null }))
      : Promise.all([listMyEnrollments(), listMyBeneficiaries()])
        .then(([records, ownBeneficiaries]) => ({ records, ownBeneficiaries }));
    request
      .then(({ records, ownBeneficiaries }) => {
        if (!active) return;
        setApiRecords(records);
        const mappedEnrollments = records.map((record) => toPortalEnrollment(
          record,
          fallbackParent,
          isAdmin ? undefined : fallbackParent.id,
        ));
        setEnrollments(mappedEnrollments);
        const mappedBeneficiaries = new Map<string, Beneficiary>();
        records.forEach((record, index) => {
          const mapped = toPortalBeneficiary(
            record,
            mappedEnrollments[index]?.parentId ?? fallbackParent.id,
          );
          mappedBeneficiaries.set(mapped.id, mapped);
        });
        ownBeneficiaries?.forEach((record) => {
          const mapped = toPortalBeneficiaryRecord(record, fallbackParent.id);
          mappedBeneficiaries.set(mapped.id, mapped);
        });
        setBeneficiaries([...mappedBeneficiaries.values()]);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar os dados do portal.');
        setApiRecords([]);
        setEnrollments([]);
        setBeneficiaries([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, [fallbackParent.email, fallbackParent.id, isAdmin, isAuthLoading, user]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const navigate = (to: string) => {
    if (to === '/') {
      window.location.assign(to);
      return;
    }
    window.history.pushState({}, '', to);
    setPath(to);
    setMobileOpen(false);
    setQuery('');
    setPage(1);
    setValidationIssues([]);
  };
  const link = (to: string, label: string, className?: string) => (
    <a className={className} href={to} onClick={(event) => { event.preventDefault(); navigate(to); }}>{label}</a>
  );
  const relatedBeneficiary = (id: string) => beneficiaries.find((item) => item.id === id);
  const currentEnrollment = current.id ? enrollments.find((item) =>
    item.id === current.id,
  ) : undefined;
  const currentRecord = current.id ? apiRecords.find((record) => record.id === current.id) : undefined;
  const currentBeneficiary = current.id ? beneficiaries.find((item) =>
    item.id === current.id && (isAdmin || item.parentId === user?.id),
  ) : undefined;
  const visibleEnrollments = enrollments;
  const filtered = useMemo(() => visibleEnrollments
    .filter((item) => {
      const beneficiary = relatedBeneficiary(item.beneficiaryId);
      const matchesQuery = `${item.publicCode} ${item.parentName} ${beneficiary?.fullName ?? ''}`.toLowerCase().includes(query.toLowerCase());
      return matchesQuery && (statusFilter === 'Todas' || item.status === statusFilter);
    })
    .sort((a, b) => sortNewest ? b.requestedAt.localeCompare(a.requestedAt) : a.requestedAt.localeCompare(b.requestedAt)),
  [visibleEnrollments, beneficiaries, query, statusFilter, sortNewest]);
  const pagedEnrollments = filtered.slice((page - 1) * 5, page * 5);
  const showToast = (message: string) => setToast(message);
  const reportFormError = (error: unknown, fallback: string) => {
    if (error instanceof ApiError && error.validationIssues.length > 0) {
      setValidationIssues(error.validationIssues);
      focusValidationField(error.validationIssues[0].field);
      return;
    }
    showToast(error instanceof Error ? error.message : fallback);
  };
  const clearFieldValidation = (event: FormEvent<HTMLElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;
    target.removeAttribute('aria-invalid');
    setValidationIssues((issues) => issues.filter(
      (issue) => inputNameForValidationField(issue.field) !== target.name,
    ));
  };

  const replaceEnrollmentRecord = (record: EnrollmentRecord) => {
    setApiRecords((previous) => previous.some((item) => item.id === record.id)
      ? previous.map((item) => item.id === record.id ? record : item)
      : [record, ...previous]);
    const mapped = toPortalEnrollment(
      record,
      fallbackParent,
      isAdmin ? undefined : fallbackParent.id,
    );
    setEnrollments((previous) => previous.some((item) => item.id === mapped.id)
      ? previous.map((item) => item.id === mapped.id ? mapped : item)
      : [mapped, ...previous]);
    const beneficiary = toPortalBeneficiary(record, mapped.parentId);
    setBeneficiaries((previous) => previous.some((item) => item.id === beneficiary.id)
      ? previous.map((item) => item.id === beneficiary.id ? beneficiary : item)
      : [beneficiary, ...previous]);
  };

  const submitFicha = async (
    kind: FichaKind,
    enrollmentId: string,
    formData: FormData,
    saveDraft: boolean,
  ) => {
    const text = (name: string) => String(formData.get(name) ?? '').trim();
    const yesNo = (name: string) => {
      const value = text(name);
      return value === 'Sim' ? true : value === 'Não' ? false : undefined;
    };
    const fieldMap: Record<string, string> = {
      doenca: 'suffersFromDisease',
      tratamento: 'underMedicalTreatment',
      medicacao: 'usesMedication',
      alergia: 'hasAllergies',
      operado: 'hasHadSurgery',
      cicatrizacao: 'healingProblems',
      anestesia: 'anesthesiaProblems',
      hemorragia: 'hemorrhageProblems',
      'doencas_febreReumatica': 'rheumaticFever',
      'doencas_cardiacos': 'heartProblems',
      'doencas_renais': 'kidneyProblems',
      'doencas_gastricos': 'gastricProblems',
      'doencas_respiratorios': 'respiratoryProblems',
      'doencas_alergicos': 'allergicProblems',
      'doencas_articulares': 'jointRheumatismProblems',
      'doencas_diabetes': 'diabetes',
      'doencas_hipertensao': 'arterialHypertension',
    };

    try {
      let updated: EnrollmentRecord;
      if (kind === 'anamnese') {
        const payload: Record<string, unknown> = {
          mainComplaintEvolution: text('queixaPrincipal'),
          diseaseDescription: text('doencaDetalhe'),
          medicationDescription: text('medicacaoDetalhe'),
          attendingPhysicianName: text('medicoNome'),
          attendingPhysicianPhone: text('medicoTelefone'),
          allergiesDescription: text('alergiaDetalhe'),
          surgeriesDescription: text('operadoDetalhe'),
          habits: text('habitos'),
          familyHistory: text('antecedentesFamiliares'),
          otherInformation: text('outrasInformacoes'),
          responsibleSignature: text('assinatura'),
          declarationAccepted: formData.has('declaracao'),
        };
        const optionalPregnancy = yesNo('gravidez');
        if (optionalPregnancy !== undefined) payload.isPregnant = optionalPregnancy;
        for (const [formName, apiName] of Object.entries(fieldMap)) {
          const value = yesNo(formName);
          if (value !== undefined) payload[apiName] = value;
        }

        const record = apiRecords.find((item) => item.id === enrollmentId);
        const anamneseId = record?.anamnese?.id;
        if (typeof anamneseId === 'string') {
          await updateAnamnese(anamneseId, payload);
        } else if (record) {
          await createAnamnese({
            beneficiary_id: record.beneficiary.id,
            enrollment_id: enrollmentId,
            ...payload,
          });
        } else {
          throw new Error('A matrícula não está carregada. Atualize a página e tente novamente.');
        }
        updated = await getMyEnrollment(enrollmentId);
      } else if (kind === 'termo' || kind === 'autorizacao' || kind === 'relatos') {
        const data: Record<string, string | boolean> = {};
        for (const [key, value] of formData.entries()) {
          if (typeof value === 'string') data[key] = value;
        }
        updated = await saveEnrollmentForm(enrollmentId, kind, data);
      } else {
        throw new Error('A ficha de matrícula deve ser editada pela solicitação correspondente.');
      }

      replaceEnrollmentRecord(updated);
      showToast(saveDraft ? 'Rascunho salvo. Você poderá continuar depois.' : 'Ficha salva com sucesso.');
      navigate(`/portal/matriculas/${enrollmentId}`);
    } catch (error) {
      reportFormError(error, 'Não foi possível salvar a ficha.');
    }
  };

  const submitEnrollment = async (event: FormEvent<HTMLFormElement>, enrollmentId?: string) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const value = (name: string) => String(formData.get(name) ?? '').trim();
    const numberLabels: Record<string, string> = {
      rg: 'RG',
      parentSalary: 'renda mensal do responsável',
      houseNumber: 'número do endereço',
      housingType: 'tipo de moradia',
      housingCost: 'custo de moradia',
      waterCost: 'gasto com água',
      powerCost: 'gasto com energia elétrica',
      foodCost: 'gasto com alimentação',
      gasCost: 'gasto com gás',
      totalIncome: 'renda familiar total',
      perCapitaIncome: 'renda per capita',
      benefitValue: 'valor do benefício',
    };
    const number = (name: string, optional = false) => {
      const raw = value(name);
      if (!raw && optional) return undefined;
      const parsed = Number(raw.replace(',', '.'));
      if (!Number.isFinite(parsed)) {
        const relative = name.match(/^relativeSalary(\d+)$/);
        const label = relative
          ? `renda do Familiar ${Number(relative[1]) + 1}`
          : numberLabels[name] ?? 'valor informado';
        throw new Error(`Informe um valor válido para ${label}.`);
      }
      return parsed;
    };
    try {
      const digits = (name: string) => value(name).replace(/\D/g, '');
      const relatives: NonNullable<EnrollmentSubmission['beneficiary']['relatives']> = [];
      const relativeCount = number('relativeCount') ?? 1;
      for (let index = 0; index < relativeCount; index += 1) {
        const name = value(`relativeName${index}`);
        const birthday = value(`relativeBirthday${index}`);
        const relation = value(`relativeRelation${index}`);
        const salary = value(`relativeSalary${index}`);
        if (![name, birthday, relation, salary].some(Boolean)) continue;
        if (![name, birthday, relation, salary].every(Boolean)) {
          throw new Error(`Preencha todos os dados do familiar ${index + 1} ou remova a linha.`);
        }
        relatives.push({
          name,
          birthday,
          relation,
          salary: number(`relativeSalary${index}`) ?? 0,
        });
      }
      if (!formData.has('termsAccepted')) {
        throw new Error('Aceite os termos para concluir o cadastro da matrícula.');
      }
      const payload: EnrollmentSubmission = {
        termsAccepted: true,
        parent: {
          name: value('parentName'),
          cpf: digits('parentCpf'),
          contact: value('parentContact'),
          email: isAdmin ? value('parentEmail') : user?.email ?? '',
          profession: value('parentProfession') || undefined,
          educational_level: value('parentEducation') || undefined,
          comertial_address: value('parentWorkAddress') || undefined,
          salary: number('parentSalary', true),
          relation_type: value('parentRelation'),
        },
        beneficiary: {
          name: value('beneficiaryName'),
          birthday: value('birthday'),
          rg: number('rg') ?? 0,
          cpf: digits('cpf'),
          school: value('school'),
          period: value('period'),
          religion: value('religion'),
          story: value('story'),
          address: {
            streetAddress: value('streetAddress'),
            house_number: number('houseNumber') ?? 0,
            neighborhood: value('neighborhood'),
            landmark: value('landmark') || undefined,
            housingType: number('housingType') ?? 0,
            housingCost: number('housingCost', true),
            waterCost: number('waterCost', true),
            powerCost: number('powerCost', true),
            foodCost: number('foodCost', true),
            gasCost: number('gasCost', true),
          },
          incomeAndBenefits: {
            nis: value('nis') || undefined,
            totalIncome: number('totalIncome') ?? 0,
            perCapitaIncome: number('perCapitaIncome') ?? 0,
            hasGovernmentBenefit: value('hasGovernmentBenefit') === 'true',
            benefitName: value('benefitName') || undefined,
            benefitValue: number('benefitValue', true),
          },
          relatives,
        },
      };
      const record = enrollmentId
        ? await updateEnrollment(enrollmentId, payload)
        : await submitEnrollmentRequest(payload);
      replaceEnrollmentRecord(record);
      if (!enrollmentId) setNewEnrollmentId(record.id);
      if (!isAdmin && !enrollmentId) await refresh();
      navigate(`${isAdmin ? '/admin' : '/portal'}/matriculas/${record.id}`);
      showToast(enrollmentId ? 'Matrícula atualizada.' : isAdmin ? 'Matrícula registrada para análise.' : 'Solicitação enviada para análise.');
    } catch (error) {
      reportFormError(error, 'Não foi possível enviar a solicitação.');
    }
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    const { enrollmentId, action } = pendingAction;
    const status = action === 'Aprovar'
      ? 'ACCEPTED'
      : action === 'Recusar'
        ? 'REJECTED'
        : 'PENDING';
    try {
      const updatedRecord = await decideEnrollment(enrollmentId, status, reason);
      const updatedEnrollment = toPortalEnrollment(updatedRecord, fallbackParent);
      setApiRecords((previous) => previous.map((record) => record.id === enrollmentId ? updatedRecord : record));
      setEnrollments((previous) => previous.map((item) => item.id === enrollmentId ? updatedEnrollment : item));
      setPendingAction(null);
      setReason('');
      showToast(`Status atualizado para “${updatedEnrollment.status}”.`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Não foi possível atualizar o status.');
    }
  };

  if (isAuthLoading) {
    return <div className={styles.app}><main className={styles.main}>Verificando sua sessão…</main></div>;
  }
  if (!user) {
    return (
      <div className={styles.app}>
        <main className={styles.main}>
          <section className={styles.panel}>
            <h1>Acesso à área restrita</h1>
            <p className={styles.helperNote}>{authError ?? 'Entre com sua conta para acessar o portal.'}</p>
            <a className={styles.buttonPrimary} href="/">Voltar ao site e entrar</a>
          </section>
        </main>
      </div>
    );
  }
  if ((isAdmin && user.role !== 'ADMIN') || (!isAdmin && user.role === 'ADMIN')) {
    return (
      <div className={styles.app}>
        <main className={styles.main}>
          <section className={styles.panel}>
            <h1>Acesso não autorizado</h1>
            <p className={styles.helperNote}>Esta conta não tem permissão para acessar esta área.</p>
            <a className={styles.buttonPrimary} href={user.role === 'ADMIN' ? '/admin' : '/portal'}>Ir para a sua área</a>
          </section>
        </main>
      </div>
    );
  }

  const basePath = isAdmin ? '/admin' : '/portal';
  const category = current.page === 'enrollment-detail' || current.page === 'enrollment-edit' || current.page === 'enrollment-new' || current.formKind
    ? 'Matrículas'
    : current.page === 'beneficiary-detail' || current.page === 'beneficiary-new'
      ? 'Beneficiários'
      : current.page === 'forms' || current.page === 'form'
        ? 'Fichas'
        : '';
  const categoryPath = category === 'Matrículas'
    ? `${basePath}/matriculas`
    : category === 'Beneficiários'
      ? `${basePath}/beneficiarios`
      : `${basePath}/fichas`;
  const currentLabel = current.formKind
    ? FICHAS.find((item) => item.kind === current.formKind)?.title ?? 'Ficha'
    : current.page === 'tracking' && !isAdmin
      ? 'Acompanhamento'
      : PAGE_LABELS[current.page];
  const breadcrumbItems: Array<{ label: string; to?: string }> = [
    { label: 'Recanto Betel', to: '/' },
    { label: isAdmin ? 'Admin' : 'Responsável', to: basePath },
  ];
  if (category) breadcrumbItems.push({ label: category, to: categoryPath });
  if (current.id && ['enrollment-detail', 'enrollment-edit', 'form'].includes(current.page)) {
    breadcrumbItems.push({
      label: currentRecord?.beneficiary.name ?? 'Matrícula',
      to: `${basePath}/matriculas/${current.id}`,
    });
  }
  breadcrumbItems.push({ label: currentLabel });

  return (
    <div className={styles.app}>
      <a className={styles.skipLink} href="#portal-content">Pular para o conteúdo</a>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <a className={styles.brand} href="/" aria-label="Recanto Betel — página inicial">
            <img className={styles.brandMark} src={logoRecanto} alt="" aria-hidden="true" />
            <span><small>ASSOCIAÇÃO</small><strong>Recanto Betel</strong></span>
          </a>
          <div className={styles.headerRight}>
            <span className={styles.demoBadge}>{isAdmin ? 'ÁREA ADMINISTRATIVA' : 'ÁREA DO RESPONSÁVEL'}</span>
            <details className={styles.profileMenu}>
              <summary className={styles.userButton}>
                <span className={styles.avatar}>{user.email.slice(0, 2).toUpperCase()}</span>
                <span>{user.email}</span>
                <ChevronDown size={16} aria-hidden="true" />
              </summary>
              <div className={styles.profileDropdown}>
                <strong>{user.email}</strong>
                <p>Perfil: {user.role === 'ADMIN' ? 'Administrador' : 'Responsável'}</p>
                <button className={styles.smallAction} type="button" onClick={() => {
                  void signOut().then(() => window.location.assign('/')).catch((error: unknown) => showToast(error instanceof Error ? error.message : 'Não foi possível encerrar a sessão.'));
                }}>Sair</button>
              </div>
            </details>
            <button type="button" className={styles.mobileToggle} aria-label={mobileOpen ? 'Fechar navegação' : 'Abrir navegação'} aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)}>
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
        <div className={`${styles.navRow} ${mobileOpen ? styles.navRowOpen : ''}`}>
          <nav className={styles.nav} aria-label={`Navegação ${current.area === 'admin' ? 'administrativa' : 'do responsável'}`}>
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const active = current.page === item.key ||
                (item.key === 'enrollments' && current.page === 'enrollment-detail') ||
                (item.key === 'beneficiaries' && current.page === 'beneficiary-detail') ||
                (item.key === 'forms' && current.page === 'form');
              return <a key={item.href + item.label} className={`${styles.navLink} ${active ? styles.navActive : ''}`} href={item.href} onClick={(event) => { event.preventDefault(); navigate(item.href); }}><Icon size={17} />{item.label}</a>;
            })}
          </nav>
          {isAdmin && <div className={styles.areaSwitch} aria-label="Área administrativa">
            {link('/admin', 'Admin', styles.areaActive)}
          </div>}
        </div>
      </header>

      <main id="portal-content" className={styles.main} onInputCapture={clearFieldValidation} onChangeCapture={clearFieldValidation}>
        <nav className={styles.breadcrumb} aria-label="Navegação estrutural">
          {breadcrumbItems.map((item, index) => (
            <span className={styles.breadcrumbItem} key={`${item.label}-${index}`}>
              {index > 0 && <span aria-hidden="true">/</span>}
              {item.to && index !== breadcrumbItems.length - 1
                ? link(item.to, item.label)
                : <strong aria-current="page">{item.label}</strong>}
            </span>
          ))}
        </nav>
        {validationIssues.length > 0 && <section className={styles.validationSummary} role="alert" aria-labelledby="validation-summary-title">
          <strong id="validation-summary-title">Revise os campos indicados antes de continuar:</strong>
          <ul>{validationIssues.map((issue, index) => (
            <li key={`${issue.field}-${index}`}>
              <button type="button" onClick={() => focusValidationField(issue.field)}>{issue.message}</button>
            </li>
          ))}</ul>
        </section>}
        {loadError
          ? <div className={styles.demoNotice} role="alert"><Bell size={16} /><span>{loadError}</span><button type="button" className={styles.smallAction} onClick={() => window.location.reload()}>Tentar novamente</button></div>
          : isLoading
            ? <div className={styles.demoNotice} role="status"><Bell size={16} /><span>Carregando dados atualizados…</span></div>
            : <div className={styles.demoNotice}><Bell size={16} /><span>As solicitações de matrícula não confirmam ingresso institucional. Seu histórico é atualizado junto à sua conta.</span></div>}

        {current.page === 'home' && <Dashboard area={current.area} beneficiaries={beneficiaries} enrollments={enrollments} navigate={navigate} link={link} relatedBeneficiary={relatedBeneficiary} />}
        {current.page === 'beneficiaries' && <BeneficiaryList area={current.area} beneficiaries={current.area === 'portal' ? beneficiaries.filter((item) => item.parentId === user.id) : beneficiaries} enrollments={enrollments} link={link} navigate={navigate} />}
        {current.page === 'beneficiary-detail' && <BeneficiaryDetail beneficiary={currentBeneficiary} enrollments={enrollments} area={current.area} navigate={navigate} />}
        {current.page === 'beneficiary-new' && <BeneficiaryForm onCancel={() => navigate('/portal/beneficiarios')} navigate={navigate} />}
        {current.page === 'enrollments' && <EnrollmentList area={current.area} enrollments={pagedEnrollments} filteredCount={filtered.length} page={page} maxPage={Math.max(1, Math.ceil(filtered.length / 5))} query={query} statusFilter={statusFilter} setQuery={setQuery} setStatusFilter={setStatusFilter} setSortNewest={setSortNewest} sortNewest={sortNewest} setPage={setPage} link={link} relatedBeneficiary={relatedBeneficiary} onAction={(enrollmentId, action) => { setReason(''); setPendingAction({ enrollmentId, action }); }} />}
        {current.page === 'enrollment-new' && <EnrollmentForm area={current.area} onSubmit={(event) => void submitEnrollment(event)} onCancel={() => navigate(`${basePath}/matriculas`)} />}
        {current.page === 'enrollment-edit' && !isLoading && !loadError && <EnrollmentForm area={current.area} record={currentRecord} onSubmit={(event) => void submitEnrollment(event, current.id)} onCancel={() => navigate(`${basePath}/matriculas/${current.id}`)} />}
        {current.page === 'enrollment-detail' && <EnrollmentDetail enrollment={currentEnrollment} beneficiary={currentEnrollment ? relatedBeneficiary(currentEnrollment.beneficiaryId) : undefined} area={current.area} newEnrollment={currentEnrollment?.id === newEnrollmentId} record={apiRecords.find((record) => record.id === currentEnrollment?.id)} onAction={(enrollmentId, action) => { setReason(''); setPendingAction({ enrollmentId, action }); }} link={link} />}
        {current.page === 'tracking' && <TrackingPage area={current.area} beneficiaries={beneficiaries} enrollments={visibleEnrollments} navigate={navigate} />}
        {current.area === 'portal' && current.page === 'forms' && <FichasHub enrollments={apiRecords} navigate={navigate} />}
        {current.area === 'portal' && current.page === 'form' && <FichaPage kind={isFichaKind(current.formKind) ? current.formKind : undefined} enrollment={currentRecord} onSubmit={submitFicha} navigate={navigate} />}
        {current.page === 'responsibles' && <Responsibles beneficiaries={beneficiaries} enrollments={enrollments} />}
        {current.page === 'reports' && <Reports enrollments={enrollments} />}
      </main>
      <footer className={styles.footer}><span>Recanto Betel · Área protegida</span>{link('/', 'Voltar ao site institucional')}</footer>
      {toast && <div className={styles.toast} role="status"><Check size={18} />{toast}</div>}
      {pendingAction && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingAction(null); }}>
        <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <button type="button" className={styles.modalClose} aria-label="Fechar confirmação" onClick={() => setPendingAction(null)}><X size={20} /></button>
          <span className={styles.modalIcon}><ClipboardList size={23} /></span>
          <h2 id="confirm-title">Confirmar: {pendingAction.action}</h2>
          <p>Esta ação atualizará o status da solicitação <strong>{enrollments.find((item) => item.id === pendingAction.enrollmentId)?.publicCode ?? 'selecionada'}</strong>. Aprovação não significa ingresso institucional.</p>
          {pendingAction.action === 'Recusar' && <label className={styles.field}>Justificativa<textarea value={reason} onChange={(event) => setReason(event.target.value)} required rows={3} placeholder="Descreva o motivo da recusa." /></label>}
          <div className={styles.modalActions}><button type="button" className={styles.buttonSecondary} onClick={() => setPendingAction(null)}>Cancelar</button><button type="button" className={styles.buttonPrimary} disabled={pendingAction.action === 'Recusar' && !reason.trim()} onClick={() => void confirmAction()}>Confirmar ação</button></div>
        </section>
      </div>}
    </div>
  );
}

function PageTitle({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return <div className={styles.pageTitle}><div><span className={styles.eyebrow}>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{actions && <div className={styles.titleActions}>{actions}</div>}</div>;
}

function Dashboard({ area, beneficiaries, enrollments, navigate, link, relatedBeneficiary }: { area: Area; beneficiaries: Beneficiary[]; enrollments: Enrollment[]; navigate: (to: string) => void; link: (to: string, label: string, className?: string) => ReactNode; relatedBeneficiary: (id: string) => Beneficiary | undefined }) {
  const isAdmin = area === 'admin';
  const list = enrollments;
  const pendingCount = list.filter((item) => item.status === 'Em análise').length;
  return <>
    <PageTitle eyebrow={isAdmin ? 'Área administrativa' : 'Área do responsável'} title={isAdmin ? 'Visão geral administrativa' : 'Visão geral'} description={isAdmin ? 'Resumo das solicitações de matrícula recebidas.' : 'Acompanhe seus beneficiários e solicitações em um só lugar.'} actions={!isAdmin && <button className={styles.buttonPrimary} onClick={() => navigate('/portal/beneficiarios/novo')}><Plus size={17} /> Cadastrar beneficiário</button>} />
    <div className={styles.statsGrid}>
      {(isAdmin ? [
        { label: 'Beneficiários', value: beneficiaries.length, detail: 'associados às solicitações', icon: Users },
        { label: 'Aprovadas', value: list.filter((item) => item.status === 'Aprovada').length, detail: 'solicitações aceitas', icon: Heart },
        { label: 'Aguardando análise', value: pendingCount, detail: 'solicitações em aberto', icon: Clock3 },
        { label: 'Recusadas', value: list.filter((item) => item.status === 'Recusada').length, detail: 'decisões registradas', icon: Check },
      ] : [
        { label: 'Beneficiários vinculados', value: beneficiaries.length, detail: 'cadastros associados à conta', icon: Users },
        { label: 'Em andamento', value: pendingCount, detail: 'solicitações de matrícula', icon: Clock3 },
        { label: 'Pendências', value: pendingCount, detail: 'solicitações em análise', icon: Bell },
        { label: 'Aprovadas', value: list.filter((item) => item.status === 'Aprovada').length, detail: 'solicitações aceitas', icon: Heart },
      ]).map((stat) => { const Icon = stat.icon; return <article className={styles.statCard} key={stat.label}><span className={styles.statIcon}><Icon size={19} /></span><span className={styles.statLabel}>{stat.label}</span><strong>{stat.value}</strong><small>{stat.detail}</small></article>; })}
    </div>
    <div className={styles.contentGrid}>
      <section className={styles.panel}>
        <div className={styles.panelHeading}><div><h2>{isAdmin ? 'Solicitações recentes' : 'Atualizações recentes'}</h2><p>Movimentações recentes</p></div>{link(isAdmin ? '/admin/matriculas' : '/portal/matriculas', 'Ver todas', styles.textLink)}</div>
        <div className={styles.activityList}>{list.slice(0, 4).map((item) => <a className={styles.activityItem} href={`${isAdmin ? '/admin' : '/portal'}/matriculas/${item.id}`} key={item.id} onClick={(event) => { event.preventDefault(); navigate(`${isAdmin ? '/admin' : '/portal'}/matriculas/${item.id}`); }}><span className={styles.activityIcon}><ClipboardList size={17} /></span><span className={styles.activityText}><strong>{relatedBeneficiary(item.beneficiaryId)?.fullName ?? 'Beneficiário'}</strong><small>{item.publicCode} · atualizado em {formatDate(item.updatedAt)}</small></span><StatusBadge status={item.status} /><ArrowRight size={16} className={styles.rowArrow} /></a>)}</div>
      </section>
      <aside className={styles.panel}>
        <div className={styles.panelHeading}><div><h2>{isAdmin ? 'Atalhos administrativos' : 'Ações rápidas'}</h2><p>Acesse os fluxos principais</p></div></div>
        <div className={styles.quickLinks}>
          {isAdmin ? <><QuickLink title="Analisar matrículas" description="Consulte e atualize solicitações" icon={<ClipboardList size={18} />} onClick={() => navigate('/admin/matriculas')} /><QuickLink title="Registrar matrícula" description="Digitalize um formulário físico ou registre uma nova solicitação" icon={<FilePlus2 size={18} />} onClick={() => navigate('/admin/matriculas/nova')} /><QuickLink title="Consultar beneficiários" description="Veja os dados associados às solicitações" icon={<Users size={18} />} onClick={() => navigate('/admin/beneficiarios')} /></>
            : <><QuickLink title="Cadastrar beneficiário" description="Informe dados da criança e da família" icon={<Plus size={18} />} onClick={() => navigate('/portal/beneficiarios/novo')} /><QuickLink title="Solicitar matrícula" description="Enviar uma nova solicitação" icon={<FilePlus2 size={18} />} onClick={() => navigate('/portal/matriculas/nova')} /></>}
        </div>
        {isAdmin && <p className={styles.helperNote}>A aprovação da solicitação não representa ingresso institucional.</p>}
      </aside>
    </div>
  </>;
}

function QuickLink({ title, description, icon, onClick }: { title: string; description: string; icon: ReactNode; onClick: () => void }) {
  return <button className={styles.quickLink} type="button" onClick={onClick}><span>{icon}</span><span><strong>{title}</strong><small>{description}</small></span><ArrowRight size={16} /></button>;
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === 'Aprovada' ? 'positive' : status === 'Recusada' ? 'negative' : status === 'Em análise' ? 'warning' : 'neutral';
  return <span className={`${styles.badge} ${styles[`badge_${tone}`]}`}><span aria-hidden="true" />{status}</span>;
}

function BeneficiaryList({ area, beneficiaries, enrollments, link, navigate }: { area: Area; beneficiaries: Beneficiary[]; enrollments: Enrollment[]; link: (to: string, label: string, className?: string) => ReactNode; navigate: (to: string) => void }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Todas');
  const filtered = beneficiaries.filter((item) =>
    `${item.fullName} ${item.publicCode}`.toLowerCase().includes(search.toLowerCase()) &&
    (status === 'Todas' || item.status === status),
  );
  return <>
    <PageTitle eyebrow={area === 'admin' ? 'Administração' : 'Área do responsável'} title="Beneficiários" description={area === 'admin' ? 'Consulte os beneficiários vinculados às solicitações recebidas.' : 'Beneficiários vinculados à sua conta.'} actions={area === 'portal' && link('/portal/beneficiarios/novo', 'Cadastrar beneficiário', styles.buttonPrimary)} />
    <section className={styles.panel}>
      <div className={styles.toolbar}><label className={styles.searchBox}><Search size={18} /><span className={styles.visuallyHidden}>Pesquisar beneficiário</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome" /></label><label className={styles.filterBox}><Filter size={17} /><span className={styles.visuallyHidden}>Filtrar status da matrícula</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>Todas</option>{enrollmentStatuses.map((value) => <option key={value}>{value}</option>)}</select></label><span className={styles.resultCount}>{filtered.length} registros</span></div>
      {filtered.length ? <div className={styles.tableWrap}><table><thead><tr><th>Nome</th><th>Situação cadastral</th><th>Matrícula</th><th>Atualizado em</th><th><span className={styles.visuallyHidden}>Ação</span></th></tr></thead><tbody>{filtered.map((item) => {
        const enrollment = enrollments.find((entry) => entry.beneficiaryId === item.id);
        const base = area === 'admin' ? '/admin' : '/portal';
        return <tr key={item.id}><td><strong>{item.fullName}</strong><small>{item.publicCode}</small></td><td><StatusBadge status={item.status} /></td><td>{enrollment ? <StatusBadge status={enrollment.status} /> : <span className={styles.muted}>Sem solicitação</span>}</td><td>{formatDate(item.updatedAt)}</td><td><a className={styles.smallAction} href={`${base}/beneficiarios/${item.id}`} onClick={(event) => { event.preventDefault(); navigate(`${base}/beneficiarios/${item.id}`); }}>Ver detalhes</a></td></tr>;
      })}</tbody></table></div> : <EmptyState title="Nenhum beneficiário encontrado" description="Tente outro termo de busca." />}
    </section>
  </>;
}

function BeneficiaryDetail({ beneficiary, enrollments, area, navigate }: { beneficiary?: Beneficiary; enrollments: Enrollment[]; area: Area; navigate: (to: string) => void }) {
  if (!beneficiary) return <EmptyState title="Beneficiário não encontrado" description="Este registro não está disponível para sua conta." action={<button className={styles.buttonSecondary} onClick={() => navigate(`/${area}/beneficiarios`)}>Voltar para beneficiários</button>} />;
  const related = enrollments.filter((item) => item.beneficiaryId === beneficiary.id);
  return <>
    <PageTitle eyebrow={area === 'admin' ? 'Administração' : 'Área do responsável'} title={beneficiary.fullName} description={`${beneficiary.publicCode} · atualizado em ${formatDate(beneficiary.updatedAt)}`} actions={area === 'portal' && <button className={styles.buttonPrimary} onClick={() => navigate('/portal/matriculas/nova')}><FilePlus2 size={17} /> Solicitar matrícula</button>} />
    <div className={styles.contentGrid}>
      <section className={styles.panel}><div className={styles.panelHeading}><div><h2>Dados gerais</h2><p>Informações da solicitação vinculada</p></div><StatusBadge status={beneficiary.status} /></div><dl className={styles.detailList}><div><dt>Nome completo</dt><dd>{beneficiary.fullName}</dd></div><div><dt>Data de nascimento</dt><dd>{formatDate(beneficiary.birthDate)}</dd></div><div><dt>Situação cadastral</dt><dd>{beneficiary.status}</dd></div><div><dt>Atualização cadastral</dt><dd>{formatDate(beneficiary.updatedAt)}</dd></div><div><dt>Responsável vinculado</dt><dd>{related[0]?.parentName ?? '—'}</dd></div></dl></section>
      <section className={styles.panel}><div className={styles.panelHeading}><div><h2>Matrículas relacionadas</h2><p>Histórico separado da situação institucional</p></div></div>{related.length ? <div className={styles.activityList}>{related.map((item) => <button className={styles.activityItem} key={item.id} onClick={() => navigate(`/${area}/matriculas/${item.id}`)}><span className={styles.activityIcon}><ClipboardList size={17} /></span><span className={styles.activityText}><strong>{item.publicCode}</strong><small>Solicitada em {formatDate(item.requestedAt)}</small></span><StatusBadge status={item.status} /><ArrowRight size={16} className={styles.rowArrow} /></button>)}</div> : <p className={styles.helperNote}>Nenhuma solicitação de matrícula vinculada.</p>}</section>
    </div>
  </>;
}

function BeneficiaryForm({ onCancel, navigate }: { onCancel: () => void; navigate: (to: string) => void }) {
  return <>
    <PageTitle eyebrow="Área do responsável" title="Cadastrar beneficiário" description="O cadastro da criança é realizado junto com a solicitação de matrícula." />
    <section className={styles.panel}>
      <p>Preencha os dados completos da criança, do responsável e da família na solicitação. Assim, as informações ficam vinculadas e podem ser analisadas pela equipe.</p>
      <div className={styles.formFooter}>
        <button type="button" className={styles.buttonSecondary} onClick={onCancel}>Cancelar</button>
        <button type="button" className={styles.buttonPrimary} onClick={() => navigate('/portal/matriculas/nova')}><FilePlus2 size={17} /> Iniciar solicitação</button>
      </div>
    </section>
  </>;
}

function EnrollmentForm({ area, record, onSubmit, onCancel }: {
  area: Area;
  record?: EnrollmentRecord;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  const isAdmin = area === 'admin';
  const [terms, setTerms] = useState<RegistrationTerms | null>(null);
  const [termsError, setTermsError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [familyCount, setFamilyCount] = useState(Math.max(1, record?.beneficiary.relativies?.length ?? 0));
  const beneficiary = record?.beneficiary;
  const parent = record?.parent;
  const address = beneficiary?.address;
  const income = beneficiary?.incomeAndBenefits;
  const relation = beneficiary?.parent?.find((item) => item.parent_id === parent?.id)?.relationshipType ?? '';
  const value = (source: Record<string, unknown> | null | undefined, key: string): string => {
    const item = source?.[key];
    return typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
      ? String(item)
      : '';
  };

  useEffect(() => {
    setFamilyCount(Math.max(1, record?.beneficiary.relativies?.length ?? 0));
  }, [record?.id, record?.beneficiary.relativies?.length]);

  useEffect(() => {
    let active = true;
    getRegistrationTerms()
      .then((result) => {
        if (active) {
          setTerms(result);
          setTermsAccepted(Boolean(
            record &&
            record.termsAcceptedVersion === result.version &&
            record.termsAcceptedAt,
          ));
        }
      })
      .catch((error: unknown) => {
        if (active) setTermsError(error instanceof Error ? error.message : 'Não foi possível carregar os termos.');
      });
    return () => { active = false; };
  }, [record]);

  if (record === undefined && window.location.pathname.includes('/editar')) {
    return <EmptyState title="Matrícula não encontrada" description="Não foi possível carregar os dados para edição." action={<button className={styles.buttonSecondary} type="button" onClick={onCancel}>Voltar</button>} />;
  }

  return <>
    <PageTitle eyebrow={isAdmin ? 'Administração' : 'Área do responsável'} title={record ? 'Editar matrícula' : isAdmin ? 'Registrar matrícula' : 'Solicitar matrícula'} description={record ? 'Os dados persistidos estão carregados. Salve para atualizar os mesmos registros vinculados.' : isAdmin ? 'Registre os dados de uma matrícula, inclusive de formulários recebidos fisicamente.' : 'Preencha os dados cadastrais para iniciar a solicitação.'} />
    <form className={styles.panelForm} onSubmit={onSubmit}>
      <div className={styles.formSection}>
        <h2>Criança</h2>
        <p>Dados cadastrais e escolares do beneficiário. Informações médicas são preenchidas exclusivamente na anamnese.</p>
        <div className={styles.formGrid}>
          <label className={`${styles.field} ${styles.fieldWide}`}>Nome completo<input name="beneficiaryName" required maxLength={191} autoComplete="name" defaultValue={beneficiary?.name} /></label>
          <label className={styles.field}>Data de nascimento<input name="birthday" type="date" required max={new Date().toISOString().slice(0, 10)} defaultValue={beneficiary?.birthday.slice(0, 10)} /></label>
          <label className={styles.field}>RG (somente números)<input name="rg" type="number" min="0" max="2147483647" required defaultValue={beneficiary?.rg} /></label>
          <label className={styles.field}>CPF (11 dígitos)<input name="cpf" inputMode="numeric" minLength={11} maxLength={11} pattern="[0-9]{11}" required defaultValue={beneficiary?.cpf} /></label>
          <label className={styles.field}>Escola<input name="school" required maxLength={191} defaultValue={beneficiary?.school} /></label>
          <label className={styles.field}>Período<input name="period" required maxLength={191} defaultValue={beneficiary?.period} /></label>
          <label className={styles.field}>Religião<input name="religion" required maxLength={191} defaultValue={beneficiary?.religion} /></label>
          <label className={`${styles.field} ${styles.fieldWide}`}>Histórico / informações cadastrais<textarea name="story" rows={3} maxLength={10000} defaultValue={beneficiary?.story} /></label>
        </div>
      </div>
      <div className={styles.formSection}>
        <h2>Responsável legal</h2>
        <p>{isAdmin ? 'Informe os dados do responsável conforme o formulário recebido. Não é necessário que ele tenha uma conta no portal.' : 'O e-mail será associado à conta autenticada.'}</p>
        <div className={styles.formGrid}>
          <label className={styles.field}>Nome completo<input name="parentName" required minLength={2} maxLength={191} autoComplete="name" defaultValue={parent?.name} /></label>
          <label className={styles.field}>CPF (11 dígitos)<input name="parentCpf" inputMode="numeric" minLength={11} maxLength={11} pattern="[0-9]{11}" required defaultValue={parent?.cpf} /></label>
          <label className={styles.field}>Telefone<input name="parentContact" type="tel" required minLength={8} maxLength={191} autoComplete="tel" defaultValue={parent?.contact} /></label>
          {isAdmin && <label className={styles.field}>E-mail do responsável<input name="parentEmail" type="email" required maxLength={191} autoComplete="email" defaultValue={parent?.email} /></label>}
          <label className={styles.field}>Vínculo com a criança<input name="parentRelation" required minLength={2} maxLength={191} defaultValue={relation} placeholder="Ex.: mãe, avó, tutor legal" /></label>
          <label className={styles.field}>Profissão<input name="parentProfession" maxLength={191} defaultValue={value(parent ?? null, 'profession')} /></label>
          <label className={styles.field}>Escolaridade<input name="parentEducation" maxLength={191} defaultValue={value(parent ?? null, 'educational_level')} /></label>
          <label className={styles.field}>Renda mensal (R$)<input name="parentSalary" type="number" min="0" step="0.01" defaultValue={value(parent ?? null, 'salary')} /></label>
          <label className={styles.field}>Endereço comercial<input name="parentWorkAddress" maxLength={191} defaultValue={value(parent ?? null, 'comertial_address')} /></label>
        </div>
      </div>
      <div className={styles.formSection}>
        <h2>Endereço familiar</h2>
        <div className={styles.formGrid}>
          <label className={`${styles.field} ${styles.fieldWide}`}>Rua / logradouro<input name="streetAddress" required minLength={2} maxLength={191} autoComplete="street-address" defaultValue={value(address ?? null, 'streetAddress')} /></label>
          <label className={styles.field}>Número<input name="houseNumber" type="number" min="0" required defaultValue={value(address ?? null, 'house_number')} /></label>
          <label className={styles.field}>Bairro<input name="neighborhood" required minLength={2} maxLength={191} defaultValue={value(address ?? null, 'neighborhood')} /></label>
          <label className={styles.field}>Ponto de referência<input name="landmark" maxLength={191} defaultValue={value(address ?? null, 'landmark')} /></label>
          <label className={styles.field}>Moradia<select name="housingType" required defaultValue={value(address ?? null, 'housingType')}><option value="" disabled>Selecione</option><option value="1">Própria</option><option value="2">Cedida</option><option value="3">Alugada</option></select></label>
          <label className={styles.field}>Custo de moradia / aluguel (R$)<input name="housingCost" type="number" min="0" step="0.01" defaultValue={value(address ?? null, 'housingCost')} /></label>
          <label className={styles.field}>Água (R$)<input name="waterCost" type="number" min="0" step="0.01" defaultValue={value(address ?? null, 'waterCost')} /></label>
          <label className={styles.field}>Energia (R$)<input name="powerCost" type="number" min="0" step="0.01" defaultValue={value(address ?? null, 'powerCost')} /></label>
          <label className={styles.field}>Alimentação (R$)<input name="foodCost" type="number" min="0" step="0.01" defaultValue={value(address ?? null, 'foodCost')} /></label>
          <label className={styles.field}>Gás (R$)<input name="gasCost" type="number" min="0" step="0.01" defaultValue={value(address ?? null, 'gasCost')} /></label>
        </div>
      </div>
      <div className={styles.formSection}>
        <h2>Renda e benefícios</h2>
        <div className={styles.formGrid}>
          <label className={styles.field}>NIS<input name="nis" maxLength={191} defaultValue={value(income ?? null, 'nis')} /></label>
          <label className={styles.field}>Renda familiar total (R$)<input name="totalIncome" type="number" min="0" step="0.01" required defaultValue={value(income ?? null, 'totalIncome')} /></label>
          <label className={styles.field}>Renda per capita (R$)<input name="perCapitaIncome" type="number" min="0" step="0.01" required defaultValue={value(income ?? null, 'perCapitaIncome')} /></label>
          <label className={styles.field}>Recebe benefício?<select name="hasGovernmentBenefit" required defaultValue={value(income ?? null, 'hasGovernmentBenefit')}><option value="" disabled>Selecione</option><option value="true">Sim</option><option value="false">Não</option></select></label>
          <label className={styles.field}>Benefício informado<input name="benefitName" maxLength={191} defaultValue={value(income ?? null, 'benefitName')} /></label>
          <label className={styles.field}>Valor mensal (R$)<input name="benefitValue" type="number" min="0" step="0.01" defaultValue={value(income ?? null, 'benefitValue')} /></label>
        </div>
      </div>
      <div className={styles.formSection}>
        <h2>Composição familiar</h2>
        <p>Adicione somente quem mora com o beneficiário. Deixe a linha vazia se não houver outros membros.</p>
        <input type="hidden" name="relativeCount" value={familyCount} />
        {Array.from({ length: familyCount }, (_, index) => {
          const member = beneficiary?.relativies?.[index];
          return <fieldset key={index} className={styles.repeatRow}>
            <legend>Familiar {index + 1}</legend>
            <label className={styles.field}>Nome<input name={`relativeName${index}`} maxLength={191} defaultValue={value(member ?? null, 'name')} /></label>
            <label className={styles.field}>Nascimento<input name={`relativeBirthday${index}`} type="date" max={new Date().toISOString().slice(0, 10)} defaultValue={value(member ?? null, 'birthday').slice(0, 10)} /></label>
            <label className={styles.field}>Parentesco<input name={`relativeRelation${index}`} maxLength={191} defaultValue={value(member ?? null, 'relation')} /></label>
            <label className={styles.field}>Renda (R$)<input name={`relativeSalary${index}`} type="number" min="0" step="0.01" defaultValue={value(member ?? null, 'salary')} /></label>
          </fieldset>;
        })}
        <div className={styles.actionGroup}>
          <button type="button" className={styles.buttonSecondary} onClick={() => setFamilyCount((count) => count + 1)}>Adicionar familiar</button>
          {familyCount > 1 && <button type="button" className={styles.buttonSecondary} onClick={() => setFamilyCount((count) => Math.max(1, count - 1))}>Remover última linha</button>}
        </div>
      </div>
      <div className={styles.formSection}>
        <h2>Termos</h2>
        {termsError && <p className={styles.errorText} role="alert">{termsError}</p>}
        {terms
          ? <div className={styles.termsText}><p>{terms.content}</p><small>Versão {terms.version}</small></div>
          : <p role="status">Carregando os termos…</p>}
        <label className={styles.consent}>
          <input type="checkbox" name="termsAccepted" required checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
          <span>Li e aceito os termos aplicáveis a esta solicitação.</span>
        </label>
        <p>A aprovação da solicitação não confirma ingresso institucional.</p>
      </div>
      <div className={styles.formFooter}>
        <button type="button" className={styles.buttonSecondary} onClick={onCancel}>Cancelar</button>
        <button type="submit" className={styles.buttonPrimary} disabled={!terms || Boolean(termsError)}><FilePlus2 size={17} /> {record ? 'Salvar alterações' : isAdmin ? 'Registrar matrícula' : 'Enviar solicitação'}</button>
      </div>
    </form>
  </>;
}

function EnrollmentList({ area, enrollments, filteredCount, page, maxPage, query, statusFilter, setQuery, setStatusFilter, setSortNewest, sortNewest, setPage, link, relatedBeneficiary, onAction }: {
  area: Area; enrollments: Enrollment[]; filteredCount: number; page: number; maxPage: number; query: string; statusFilter: string;
  setQuery: (value: string) => void; setStatusFilter: (value: string) => void; setSortNewest: (value: boolean) => void; sortNewest: boolean;
  setPage: (value: number) => void; link: (to: string, label: string, className?: string) => ReactNode;
  relatedBeneficiary: (id: string) => Beneficiary | undefined; onAction: (id: string, action: Action) => void;
}) {
  const isAdmin = area === 'admin';
  return <>
    <PageTitle eyebrow={isAdmin ? 'Administração' : 'Área do responsável'} title="Matrículas" description={isAdmin ? 'Pesquise, filtre e acompanhe as solicitações recebidas.' : 'Acompanhe o status e as atualizações das suas solicitações.'} actions={link(`${isAdmin ? '/admin' : '/portal'}/matriculas/nova`, isAdmin ? 'Registrar matrícula' : 'Nova solicitação', styles.buttonPrimary)} />
    <section className={styles.panel}>
      <div className={styles.toolbar}><label className={styles.searchBox}><Search size={18} /><span className={styles.visuallyHidden}>Pesquisar</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar por pessoa ou identificador" /></label><label className={styles.filterBox}><Filter size={17} /><span className={styles.visuallyHidden}>Filtrar por status</span><select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}><option>Todas</option>{enrollmentStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><button className={styles.sortButton} onClick={() => setSortNewest(!sortNewest)} type="button">Data {sortNewest ? '↓' : '↑'}</button><span className={styles.resultCount}>{filteredCount} solicitações</span></div>
      {enrollments.length ? <div className={styles.tableWrap}><table><thead><tr><th>Identificador</th><th>Beneficiário</th><th>Responsável</th><th>Solicitada em</th><th>Status</th><th>Atualizada em</th><th>Ações</th></tr></thead><tbody>{enrollments.map((item) => <tr key={item.id}><td><strong>{item.publicCode}</strong></td><td>{relatedBeneficiary(item.beneficiaryId)?.fullName ?? '—'}</td><td>{item.parentName}</td><td>{formatDate(item.requestedAt)}</td><td><StatusBadge status={item.status} /></td><td>{formatDate(item.updatedAt)}</td><td><div className={styles.rowActions}>{link(`${isAdmin ? '/admin' : '/portal'}/matriculas/${item.id}`, 'Detalhes', styles.smallAction)}{isAdmin && <select className={styles.actionSelect} aria-label={`Ação para ${item.publicCode}`} defaultValue="" disabled={actionsFor(item.status).length === 0} onChange={(event) => { if (event.target.value) onAction(item.id, event.target.value as Action); event.target.value = ''; }}><option value="" disabled>Ação</option>{actionsFor(item.status).map((action) => <option key={action}>{action}</option>)}</select>}</div></td></tr>)}</tbody></table></div> : <EmptyState title="Nenhuma solicitação encontrada" description={filteredCount ? 'Ajuste os filtros para ver outros resultados.' : 'Quando houver solicitações, elas aparecerão nesta lista.'} />}
      {filteredCount > 0 && <div className={styles.pagination}><span>Mostrando {Math.min((page - 1) * 5 + 1, filteredCount)}–{Math.min(page * 5, filteredCount)} de {filteredCount}</span><div><button type="button" aria-label="Página anterior" disabled={page <= 1} onClick={() => setPage(page - 1)}><ArrowLeft size={16} /></button><span>Página {page} de {maxPage}</span><button type="button" aria-label="Próxima página" disabled={page >= maxPage} onClick={() => setPage(page + 1)}><ArrowRight size={16} /></button></div></div>}
    </section>
  </>;
}

function EnrollmentDetail({ enrollment, beneficiary, area, newEnrollment, record, onAction, link }: { enrollment?: Enrollment; beneficiary?: Beneficiary; area: Area; newEnrollment: boolean; record?: EnrollmentRecord; onAction: (id: string, action: Action) => void; link: (to: string, label: string, className?: string) => ReactNode }) {
  const [expandedForm, setExpandedForm] = useState<{ enrollmentId: string; kind: string } | null>(null);
  if (!enrollment) return <EmptyState title="Solicitação não encontrada" description="O identificador não corresponde a uma solicitação disponível para sua conta." action={link(area === 'admin' ? '/admin/matriculas' : '/portal/matriculas', 'Voltar para matrículas', styles.buttonSecondary)} />;
  return <>
    <PageTitle eyebrow={area === 'admin' ? 'Análise administrativa' : 'Acompanhamento do responsável'} title={enrollment.publicCode} description={`Solicitada em ${formatDate(enrollment.requestedAt)} · Beneficiário: ${beneficiary?.fullName ?? '—'}`} actions={<div className={styles.actionGroup}>{area === 'portal' && link('/portal/fichas', 'Continuar fichas', styles.buttonSecondary)}{link(`/${area}/matriculas/${enrollment.id}/editar`, 'Editar matrícula', styles.buttonSecondary)}{area === 'admin' && actionsFor(enrollment.status).map((action) => <button key={action} className={action === 'Recusar' ? styles.buttonDanger : styles.buttonSecondary} onClick={() => onAction(enrollment.id, action)}>{action}</button>)}</div>} />
    {newEnrollment && <div className={styles.successBanner}><Check size={18} /><span><strong>Solicitação registrada.</strong> O identificador é {enrollment.publicCode}; a solicitação está “{enrollment.status}”.</span></div>}
    <div className={styles.contentGrid}>
      <section className={styles.panel}><div className={styles.panelHeading}><div><h2>Status e informações</h2><p>A aprovação não representa ingresso institucional.</p></div><StatusBadge status={enrollment.status} /></div><dl className={styles.detailList}><div><dt>Beneficiário</dt><dd>{beneficiary?.fullName ?? '—'}</dd></div><div><dt>Responsável</dt><dd>{enrollment.parentName}</dd></div><div><dt>Data da solicitação</dt><dd>{formatDate(enrollment.requestedAt)}</dd></div><div><dt>Última atualização</dt><dd>{formatDate(enrollment.updatedAt)}</dd></div>{record?.beneficiary.school && <div><dt>Escola</dt><dd>{record.beneficiary.school}</dd></div>}{record?.beneficiary.period && <div><dt>Período</dt><dd>{record.beneficiary.period}</dd></div>}{record?.beneficiary.religion && <div><dt>Religião</dt><dd>{record.beneficiary.religion}</dd></div>}{enrollment.reviewNotes && <div><dt>Observação</dt><dd>{enrollment.reviewNotes}</dd></div>}</dl></section>
      <section className={styles.panel}><div className={styles.panelHeading}><div><h2>Histórico da solicitação</h2><p>Movimentações recentes</p></div></div><ol className={styles.timeline}>{enrollment.history.map((event) => <li key={event.id}><span className={styles.timelineDot} /><div><time>{formatDate(event.date)}</time><p>{event.description}</p><small>{event.author}</small></div></li>)}</ol></section>
    </div>
    <section className={styles.panel}>
      <div className={styles.panelHeading}><div><h2>Preenchimento das fichas</h2><p>Estado calculado a partir dos dados persistidos</p></div><StatusBadge status={record?.formsComplete ? 'Fichas completas' : 'Fichas pendentes'} /></div>
      <div className={styles.activityList}>
        {record?.formsStatus.map((form) => {
          const isExpanded = expandedForm?.enrollmentId === enrollment.id && expandedForm.kind === form.kind;
          const content = <>
            <span className={styles.activityIcon}>{form.status === 'COMPLETE' ? <Check size={17} /> : <Clock3 size={17} />}</span>
            <span className={styles.activityText}><strong>{form.title}</strong><small>{form.required ? 'Obrigatória' : 'Opcional'}</small></span>
            <FormStatusBadge status={form.status} />
          </>;
          return area === 'admin'
            ? <button
                className={`${styles.activityItem} ${styles.formProgressButton}`}
                key={form.kind}
                type="button"
                aria-expanded={isExpanded}
                aria-controls={isExpanded ? `registered-form-${enrollment.id}-${form.kind}` : undefined}
                onClick={() => setExpandedForm(isExpanded ? null : { enrollmentId: enrollment.id, kind: form.kind })}
              >
                {content}
                <ChevronDown className={`${styles.formProgressChevron} ${isExpanded ? styles.formProgressChevronOpen : ''}`} size={17} aria-hidden="true" />
              </button>
            : <div className={styles.activityItem} key={form.kind}>{content}</div>;
        })}
      </div>
      {area === 'admin' && record && expandedForm?.enrollmentId === enrollment.id && (
        <AdminRecordDetails
          record={record}
          kind={expandedForm.kind}
          id={`registered-form-${enrollment.id}-${expandedForm.kind}`}
        />
      )}
    </section>
  </>;
}

const beneficiaryLabels: Record<string, string> = {
  publicCode: 'Código do beneficiário',
  name: 'Nome completo',
  birthday: 'Data de nascimento',
  rg: 'RG',
  cpf: 'CPF',
  school: 'Escola',
  period: 'Período',
  religion: 'Religião',
  story: 'Histórico cadastral',
  status: 'Situação cadastral',
};
const parentLabels: Record<string, string> = {
  publicCode: 'Código do responsável',
  name: 'Nome do responsável',
  cpf: 'CPF',
  email: 'E-mail',
  contact: 'Telefone',
  profession: 'Profissão',
  educational_level: 'Escolaridade',
  comertial_address: 'Endereço comercial',
  salary: 'Renda mensal',
};
const anamneseLabels: Record<string, string> = {
  mainComplaintEvolution: 'Queixa principal e evolução',
  suffersFromDisease: 'Possui alguma doença',
  diseaseDescription: 'Descrição da doença',
  underMedicalTreatment: 'Está em tratamento médico',
  isPregnant: 'Gravidez',
  usesMedication: 'Faz uso de medicação',
  medicationDescription: 'Descrição da medicação',
  attendingPhysicianName: 'Nome do médico assistente',
  attendingPhysicianPhone: 'Telefone do médico assistente',
  hasAllergies: 'Possui alergias',
  allergiesDescription: 'Descrição das alergias',
  hasHadSurgery: 'Já passou por cirurgia',
  surgeriesDescription: 'Descrição das cirurgias',
  healingProblems: 'Problemas de cicatrização',
  anesthesiaProblems: 'Problemas com anestesia',
  hemorrhageProblems: 'Problemas de hemorragia',
  rheumaticFever: 'Febre reumática',
  heartProblems: 'Problemas cardíacos',
  kidneyProblems: 'Problemas renais',
  gastricProblems: 'Problemas gástricos',
  respiratoryProblems: 'Problemas respiratórios',
  allergicProblems: 'Problemas alérgicos',
  jointRheumatismProblems: 'Problemas articulares ou reumatismo',
  diabetes: 'Diabetes',
  arterialHypertension: 'Hipertensão arterial',
  habits: 'Hábitos',
  familyHistory: 'Antecedentes familiares',
  otherInformation: 'Outras informações',
  declarationAccepted: 'Declaração confirmada',
  responsibleSignature: 'Assinatura do responsável',
};
const addressLabels: Record<string, string> = {
  streetAddress: 'Logradouro',
  house_number: 'Número',
  neighborhood: 'Bairro',
  landmark: 'Ponto de referência',
  housingType: 'Tipo de moradia',
  housingCost: 'Custo de moradia',
  waterCost: 'Gasto com água',
  powerCost: 'Gasto com energia elétrica',
  foodCost: 'Gasto com alimentação',
  gasCost: 'Gasto com gás',
};
const incomeLabels: Record<string, string> = {
  nis: 'NIS',
  totalIncome: 'Renda familiar total',
  perCapitaIncome: 'Renda per capita',
  hasGovernmentBenefit: 'Recebe benefício governamental',
  benefitName: 'Nome do benefício',
  benefitValue: 'Valor do benefício',
};
const enrollmentFormLabels: Record<string, Record<string, string>> = {
  TERMO: {
    compromisso1: 'Compromisso 1',
    compromisso2: 'Compromisso 2',
    irEmboraSozinho: 'Autorização para ir embora sozinho',
    assinatura: 'Assinatura do responsável',
  },
  AUTORIZACAO: {
    responsavelNome: 'Nome do responsável',
    responsavelCpf: 'CPF do responsável',
    menorNome: 'Nome do beneficiário',
    menorCpf: 'CPF do beneficiário',
    autorizaOdonto: 'Autorização para atendimento odontológico',
    assinatura: 'Assinatura do responsável',
  },
  RELATOS: {
    data: 'Data do relato',
    relato: 'Relato',
  },
};

function displayValue(value: unknown, key?: string): string {
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (value === null || value === undefined || value === '') return 'Não informado';
  if (key === 'housingType' && typeof value === 'number' && [1, 2, 3].includes(value)) {
    return ({ 1: 'Própria', 2: 'Cedida', 3: 'Alugada' } as Record<number, string>)[value] ?? String(value);
  }
  return String(value);
}

function DetailRows({ data, labels }: { data: object; labels: Record<string, string> }) {
  const values = Object.fromEntries(Object.entries(data));
  const rows = Object.entries(labels).filter(([key]) => key in values);
  return rows.length
    ? <dl className={styles.detailList}>{rows.map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{displayValue(values[key], key)}</dd></div>)}</dl>
    : <p className={styles.helperNote}>Nenhuma informação registrada nesta ficha.</p>;
}

function EnrollmentFormDetails({ form }: { form: EnrollmentRecord['forms'][number] }) {
  const labels = enrollmentFormLabels[form.kind] ?? {};
  const entries = Object.entries(form.data).flatMap(([key, value]) => {
    const knownLabel = labels[key];
    const personField = key.match(/^pessoa(\d+)(Nome|Parentesco|Tel)$/);
    if (knownLabel) return [[knownLabel, value] as const];
    if (!personField) return [];
    const suffix: Record<string, string> = { Nome: 'Nome', Parentesco: 'Parentesco', Tel: 'Telefone' };
    return [[`Pessoa autorizada ${personField[1]} - ${suffix[personField[2]]}`, value] as const];
  });
  return entries.length
    ? <dl className={styles.detailList}>{entries.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{displayValue(value)}</dd></div>)}</dl>
    : <p className={styles.helperNote}>Nenhum conteúdo registrado nesta ficha.</p>;
}

function AdminRecordDetails({ record, kind, id }: { record: EnrollmentRecord; kind: string; id: string }) {
  const beneficiary = record.beneficiary;
  const relationship = beneficiary.parent?.find((item) => item.parent_id === record.parent?.id)?.relationshipType;
  const formProgress = new Map(record.formsStatus.map((form) => [form.kind, form]));
  const household = beneficiary.relativies ?? [];
  const escorts = beneficiary.AuthorizedEscorts ?? [];
  const anamneseUpdatedAt = record.anamnese?.updatedAt;
  const title = record.formsStatus.find((form) => form.kind === kind)?.title ?? 'Ficha';

  return <section className={styles.adminRecordDetails} id={id} role="region" aria-label={`Dados: ${title}`}>
    <h3>{title}</h3>
    {kind === 'matricula' && <>
      <h3>Beneficiário</h3>
      <DetailRows data={beneficiary} labels={beneficiaryLabels} />
      {beneficiary.address && <><h3>Endereço familiar</h3><DetailRows data={beneficiary.address} labels={addressLabels} /></>}
      {beneficiary.incomeAndBenefits && <><h3>Renda e benefícios</h3><DetailRows data={beneficiary.incomeAndBenefits} labels={incomeLabels} /></>}
      <h3>Responsável</h3>
      {record.parent && <DetailRows data={record.parent} labels={parentLabels} />}
      <p className={styles.helperNote}>Vínculo com o beneficiário: {relationship || 'Não informado'}</p>
      <h3>Composição familiar</h3>
      {household.length ? household.map((member, index) => <article className={styles.panel} key={`${String(member.name)}-${index}`}>
        <h4>Familiar {index + 1}</h4>
        <DetailRows data={member} labels={{ name: 'Nome', birthday: 'Data de nascimento', relation: 'Parentesco', salary: 'Renda mensal' }} />
      </article>) : <p className={styles.helperNote}>Nenhum outro familiar informado.</p>}
      {escorts.length > 0 && <>
        <h3>Pessoas autorizadas</h3>
        {escorts.map((escort, index) => <article className={styles.panel} key={`${String(escort.name)}-${index}`}>
          <h4>Pessoa autorizada {index + 1}</h4>
          <DetailRows data={escort} labels={{ name: 'Nome', relation: 'Vínculo', contact: 'Telefone' }} />
        </article>)}
      </>}
    </>}
    {kind === 'anamnese' && <>
      <FormStatusBadge status={formProgress.get('anamnese')?.status ?? 'PENDING'} />
      <DetailRows data={record.anamnese ?? {}} labels={anamneseLabels} />
      {typeof anamneseUpdatedAt === 'string' && <p className={styles.helperNote}>Atualizada em {new Date(anamneseUpdatedAt).toLocaleString('pt-BR')}</p>}
    </>}
    {kind === 'termos' && <>
      <p>{record.termsAcceptedAt ? 'Aceito' : 'Pendente'}</p>
      {record.termsAcceptedAt && <p className={styles.helperNote}>Aceito em {new Date(record.termsAcceptedAt).toLocaleString('pt-BR')}</p>}
      {record.termsAcceptedVersion && <p className={styles.helperNote}>Versão aceita: {record.termsAcceptedVersion}</p>}
    </>}
    {['termo', 'autorizacao', 'relatos'].includes(kind) && (() => {
      const form = record.forms.find((item) => item.kind === kind.toUpperCase());
      const status = formProgress.get(kind)?.status ?? 'PENDING';
      return <>
        <FormStatusBadge status={status} />
        {form
          ? <><EnrollmentFormDetails form={form} /><p className={styles.helperNote}>Atualizada em {new Date(form.updatedAt).toLocaleString('pt-BR')}</p></>
          : <p className={styles.helperNote}>Esta ficha ainda não foi preenchida.</p>}
      </>;
    })()}
  </section>;
}

function FormStatusBadge({ status }: { status: string }) {
  const label = status === 'COMPLETE' ? 'Preenchida' : status === 'INCOMPLETE' ? 'Incompleta' : 'Pendente';
  const tone = status === 'COMPLETE' ? 'positive' : status === 'INCOMPLETE' ? 'warning' : 'neutral';
  return <span className={`${styles.badge} ${styles[`badge_${tone}`]}`}><span aria-hidden="true" />{label}</span>;
}

function TrackingPage({ area, beneficiaries, enrollments, navigate }: { area: Area; beneficiaries: Beneficiary[]; enrollments: Enrollment[]; navigate: (to: string) => void }) {
  const isAdmin = area === 'admin';
  const records = beneficiaries;
  return <>
    <PageTitle eyebrow={isAdmin ? 'Administração' : 'Área do responsável'} title={isAdmin ? 'Acompanhamento de matrículas' : 'Acompanhamento'} description={isAdmin ? 'Consulte os status e o histórico das solicitações.' : 'Veja o histórico cronológico das solicitações e suas atualizações.'} />
    {isAdmin ? <section className={styles.panel}><div className={styles.tableWrap}><table><thead><tr><th>Beneficiário</th><th>Status da matrícula</th><th>Última atualização</th><th><span className={styles.visuallyHidden}>Ação</span></th></tr></thead><tbody>{records.map((beneficiary) => {
      const enrollment = enrollments.filter((item) => item.beneficiaryId === beneficiary.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
      return <tr key={beneficiary.id}><td><strong>{beneficiary.fullName}</strong><small>{beneficiary.publicCode}</small></td><td>{enrollment ? <StatusBadge status={enrollment.status} /> : <span className={styles.muted}>Sem solicitação</span>}</td><td>{formatDate(beneficiary.updatedAt)}</td><td><button className={styles.smallAction} type="button" onClick={() => navigate(`/admin/beneficiarios/${beneficiary.id}`)}>Ver histórico</button></td></tr>;
    })}</tbody></table></div></section>
      : records.length ? <div className={styles.trackingGrid}>{enrollments.map((enrollment) => {
        const beneficiary = records.find((item) => item.id === enrollment.beneficiaryId);
        if (!beneficiary) return null;
        const latestEvent = enrollment.history[enrollment.history.length - 1];
        return <article className={styles.panel} key={enrollment.id}><div className={styles.panelHeading}><div><h2>{beneficiary.fullName}</h2><p>{enrollment.publicCode} · atualização em {formatDate(enrollment.updatedAt)}</p></div><StatusBadge status={enrollment.status} /></div><p className={styles.trackingUpdate}>{latestEvent?.description ?? 'Nenhuma atualização registrada.'}</p><small className={styles.muted}>Matrícula aprovada não equivale a ingresso institucional.</small><button className={styles.smallAction} type="button" onClick={() => navigate(`/portal/matriculas/${enrollment.id}`)}>Consultar histórico completo</button></article>;
      })}</div> : <EmptyState title="Nenhuma atualização disponível" description="As atualizações aparecerão aqui após o envio de uma solicitação." />}
  </>;
}

function Responsibles({ beneficiaries, enrollments }: { beneficiaries: Beneficiary[]; enrollments: PortalEnrollment[] }) {
  const parentsById = new Map(enrollments.map((enrollment) => [enrollment.parentId, {
    id: enrollment.parentId,
    name: enrollment.parentName,
    email: enrollment.parentEmail,
    contact: enrollment.parentContact,
  }]));
  const parents = [...parentsById.values()];
  const [search, setSearch] = useState('');
  const filtered = parents.filter((parent) => `${parent.name} ${parent.email}`.toLowerCase().includes(search.toLowerCase()));
  return <>
    <PageTitle eyebrow="Administração" title="Responsáveis" description="Consulte os contatos vinculados às solicitações recebidas." />
    <section className={styles.panel}><div className={styles.toolbar}><label className={styles.searchBox}><Search size={18} /><span className={styles.visuallyHidden}>Pesquisar responsável</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar responsável" /></label><span className={styles.resultCount}>{filtered.length} responsáveis</span></div>
      {filtered.length ? <div className={styles.tableWrap}><table><thead><tr><th>Responsável</th><th>Contato</th><th>Beneficiários vinculados</th><th>Matrículas</th></tr></thead><tbody>{filtered.map((parent) => <tr key={parent.id}><td><strong>{parent.name}</strong><small>{enrollments.find((item) => item.parentId === parent.id)?.parentPublicCode ?? '—'}</small></td><td>{parent.email}<small>{parent.contact}</small></td><td>{beneficiaries.filter((item) => item.parentId === parent.id).length}</td><td>{enrollments.filter((item) => item.parentId === parent.id).length}</td></tr>)}</tbody></table></div> : <EmptyState title="Nenhum responsável encontrado" description="Os responsáveis aparecem aqui quando há solicitações disponíveis." />}
    </section>
  </>;
}

function Reports({ enrollments }: { enrollments: Enrollment[] }) {
  const accepted = enrollments.filter((item) => item.status === 'Aprovada').length;
  const rejected = enrollments.filter((item) => item.status === 'Recusada').length;
  const averageUpdateDays = enrollments.length
    ? Math.round(enrollments.reduce((sum, item) => {
      const elapsed = (Date.parse(item.updatedAt) - Date.parse(item.requestedAt)) / 86_400_000;
      return sum + Math.max(0, elapsed);
    }, 0) / enrollments.length)
    : 0;
  const statuses = enrollmentStatuses.map((status) => ({ status, count: enrollments.filter((item) => item.status === status).length })).filter((item) => item.count > 0);
  return <>
    <PageTitle eyebrow="Administração" title="Relatórios" description="Indicadores calculados com base nas solicitações." />
    <div className={styles.statsGrid}><article className={styles.statCard}><span className={styles.statIcon}><Check size={19} /></span><span className={styles.statLabel}>Solicitações aprovadas</span><strong>{accepted}</strong><small>status atual</small></article><article className={styles.statCard}><span className={styles.statIcon}><X size={19} /></span><span className={styles.statLabel}>Solicitações recusadas</span><strong>{rejected}</strong><small>status atual</small></article><article className={styles.statCard}><span className={styles.statIcon}><ClipboardList size={19} /></span><span className={styles.statLabel}>Solicitações totais</span><strong>{enrollments.length}</strong><small>todos os status</small></article><article className={styles.statCard}><span className={styles.statIcon}><Clock3 size={19} /></span><span className={styles.statLabel}>Dias até atualização</span><strong>{averageUpdateDays}</strong><small>média entre envio e atualização</small></article></div>
    <section className={styles.panel}><div className={styles.panelHeading}><div><h2>Matrículas por status</h2><p>Distribuição dos registros atuais</p></div></div>{statuses.length ? <div className={styles.reportBars}>{statuses.map((item) => <div className={styles.reportRow} key={item.status}><span>{item.status}</span><span className={styles.barTrack}><span style={{ width: `${Math.max(5, (item.count / Math.max(enrollments.length, 1)) * 100)}%` }} /></span><strong>{item.count}</strong></div>)}</div> : <p className={styles.helperNote}>Nenhuma solicitação disponível para gerar o relatório.</p>}</section>
    <section className={`${styles.panel} ${styles.reportIngress}`}><div className={styles.panelHeading}><div><h2>Ingressos por período</h2><p>Não há dados de ingresso institucional disponíveis.</p></div></div><p>O status da matrícula não permite inferir ingresso na instituição.</p></section>
  </>;
}

function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className={styles.emptyState}><span><ClipboardList size={24} /></span><h2>{title}</h2><p>{description}</p>{action}</div>;
}
