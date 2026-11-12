import { useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { ArrowRight, Check, ClipboardList, FileText, HeartPulse, ShieldCheck, Stethoscope } from 'lucide-react';
import styles from './PortalApp.module.scss';
import { type FichaKind } from './portalData';
import type { EnrollmentRecord } from '../services/enrollmentService';

export const FICHAS: { kind: FichaKind; title: string; description: string; icon: typeof FileText }[] = [
  { kind: 'matricula', title: 'Ficha de matrícula', description: 'Dados da criança, responsáveis, composição familiar e endereço.', icon: FileText },
  { kind: 'termo', title: 'Termo de compromisso', description: 'Compromissos do responsável e pessoas autorizadas a buscar a criança.', icon: ShieldCheck },
  { kind: 'autorizacao', title: 'Autorização de atendimento', description: 'Autorização para avaliação e procedimentos odontológicos no Recanto Betel.', icon: Stethoscope },
  { kind: 'anamnese', title: 'Ficha de anamnese', description: 'Questionário de saúde e histórico médico da criança.', icon: HeartPulse },
  { kind: 'relatos', title: 'Relatos', description: 'Registro de observações e relatos sobre o beneficiário.', icon: ClipboardList },
];

export const isFichaKind = (value?: string): value is FichaKind => FICHAS.some((item) => item.kind === value);

const todayIso = () => new Date().toISOString().slice(0, 10);
const formText = (data: Record<string, unknown>, key: string) =>
  typeof data[key] === 'string' ? data[key] as string : '';
const formChoice = (data: Record<string, unknown>, key: string) => {
  const value = data[key];
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  return typeof value === 'string' ? value : '';
};
const formChecked = (data: Record<string, unknown>, key: string) =>
  data[key] === true || data[key] === 'on' || data[key] === 'true';

function FormPageTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className={styles.pageTitle}>
      <div>
        <span className={styles.eyebrow}>Área do responsável</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
}

type TextProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'className'> & {
  label: string;
  name: string;
  wide?: boolean;
  optional?: boolean;
};

function Text({ label, name, wide, optional, ...rest }: TextProps) {
  return (
    <label className={`${styles.field} ${wide ? styles.fieldWide : ''}`}>
      <span>
        {label}
        {optional && <span className={styles.optional}> (opcional)</span>}
      </span>
      <input name={name} maxLength={120} {...rest} />
    </label>
  );
}

function TextArea({ label, name, rows = 3, optional, maxLength = 1000, defaultValue }: { label: string; name: string; rows?: number; optional?: boolean; maxLength?: number; defaultValue?: string }) {
  return (
    <label className={`${styles.field} ${styles.fieldWide}`}>
      <span>
        {label}
        {optional && <span className={styles.optional}> (opcional)</span>}
      </span>
      <textarea name={name} rows={rows} maxLength={maxLength} defaultValue={defaultValue} />
    </label>
  );
}

function YesNo({ name, label, detailLabel = 'Qual?', withDetail = false, required = true, defaultValue = '', detailValue }: {
  name: string; label: string; detailLabel?: string; withDetail?: boolean; required?: boolean;
  defaultValue?: string; detailValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <fieldset className={`${styles.questionRow} ${styles.fieldWide}`}>
      <legend>{label}</legend>
      <div className={styles.radioGroup}>
        {['Sim', 'Não'].map((option) => (
          <label key={option} className={styles.radioOption}>
            <input type="radio" name={name} value={option} required={required} checked={value === option} onChange={() => setValue(option)} />
            {option}
          </label>
        ))}
      </div>
      {withDetail && value === 'Sim' && (
        <label className={styles.field}>
          {detailLabel}
          <input name={`${name}Detalhe`} required maxLength={200} defaultValue={detailValue} />
        </label>
      )}
    </fieldset>
  );
}

function Consent({ name, children, defaultChecked = false }: { name: string; children: ReactNode; defaultChecked?: boolean }) {
  return (
    <label className={`${styles.consent} ${styles.fieldWide}`}>
      <input type="checkbox" name={name} required defaultChecked={defaultChecked} />
      <span>{children}</span>
    </label>
  );
}

function SignatureSection({ parentName, savedData }: { parentName: string; savedData: Record<string, unknown> }) {
  return (
    <div className={styles.formSection}>
      <h2>Local, data e assinatura</h2>
      <p>Revise as informações antes de preencher a assinatura.</p>
      <div className={styles.formGrid}>
        <Text label="Nome do responsável legal (assinatura)" name="assinatura" wide required autoComplete="name" defaultValue={String(savedData.assinatura ?? parentName)} />
      </div>
    </div>
  );
}

function FichaShell({ title, description, enrollment, onSubmit, onCancel, children }: {
  title: string;
  description: string;
  enrollment: EnrollmentRecord;
  onSubmit: (enrollmentId: string, data: FormData, saveDraft: boolean) => void;
  onCancel: () => void;
  children: (record: EnrollmentRecord) => ReactNode;
}) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const saveDraft = submitter instanceof HTMLButtonElement && submitter.name === 'saveDraft';
    onSubmit(enrollment.id, new FormData(event.currentTarget), saveDraft);
  };

  return (
    <>
      <FormPageTitle title={title} description={description} />
      <form className={styles.panelForm} onSubmit={handleSubmit}>
        <div className={styles.formSection}>
          <h2>Beneficiário</h2>
          <p>Esta ficha será vinculada à matrícula selecionada.</p>
          <strong>{enrollment.beneficiary.name}</strong>
        </div>

        <div>{children(enrollment)}</div>

        <div className={styles.formFooter}>
          <button type="button" className={styles.buttonSecondary} onClick={onCancel}>Cancelar</button>
          <button type="submit" name="saveDraft" value="true" formNoValidate className={styles.buttonSecondary}>Salvar parcialmente</button>
          <button type="submit" className={styles.buttonPrimary}><Check size={17} /> Salvar ficha</button>
        </div>
      </form>
    </>
  );
}

interface FormProps {
  enrollment: EnrollmentRecord;
  savedData: Record<string, unknown>;
  onSubmit: (kind: FichaKind, enrollmentId: string, data: FormData, saveDraft: boolean) => void;
  onCancel: () => void;
}

function TermoForm({ enrollment, savedData, onSubmit, onCancel }: FormProps) {
  const [sozinho, setSozinho] = useState(formText(savedData, 'irEmboraSozinho'));
  return (
    <FichaShell
      title="Termo de compromisso"
      description="Compromissos a serem cumpridos pelo responsável."
      enrollment={enrollment}
      onCancel={onCancel}
      onSubmit={(id, data, saveDraft) => onSubmit('termo', id, data, saveDraft)}
    >
      {(record) => (
        <>
          <div className={styles.formSection}>
            <h2>Compromissos</h2>
            <p>Leia e marque cada item para concordar.</p>
            <div className={styles.formGrid}>
              <Consent name="compromisso1" defaultChecked={formChecked(savedData, 'compromisso1')}>1º Devo respeitar e cumprir todas as normas do Regulamento do Projeto Samaritano e incentivar meus filhos a cumpri-las também.</Consent>
              <Consent name="compromisso2" defaultChecked={formChecked(savedData, 'compromisso2')}>2º Estou ciente de que é importante participar de todas as convocações.</Consent>
              <fieldset className={`${styles.questionRow} ${styles.fieldWide}`}>
                <legend>3º Autorizo meu filho(a) a ir embora sozinho(a)?</legend>
                <div className={styles.radioGroup}>
                  {['Sim', 'Não'].map((option) => (
                    <label key={option} className={styles.radioOption}>
                      <input type="radio" name="irEmboraSozinho" value={option} required checked={sozinho === option} onChange={() => setSozinho(option)} />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>

          {sozinho === 'Não' && (
            <div className={styles.formSection}>
              <h2>Somente com</h2>
              <p>Pessoas autorizadas a buscar a criança (até 7). Informe ao menos uma.</p>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <fieldset key={n} className={styles.repeatRow3}>
                  <legend>Pessoa {n}</legend>
                  <Text label="Nome" name={`pessoa${n}Nome`} required={n === 1} optional={n !== 1} defaultValue={formText(savedData, `pessoa${n}Nome`)} />
                  <Text label="Parentesco" name={`pessoa${n}Parentesco`} required={n === 1} optional={n !== 1} defaultValue={formText(savedData, `pessoa${n}Parentesco`)} />
                  <Text label="Telefone" name={`pessoa${n}Tel`} type="tel" required={n === 1} optional={n !== 1} defaultValue={formText(savedData, `pessoa${n}Tel`)} />
                </fieldset>
              ))}
            </div>
          )}

          <SignatureSection parentName={record.parent?.name ?? ''} savedData={savedData} />
        </>
      )}
    </FichaShell>
  );
}

function AutorizacaoForm({ enrollment, savedData, onSubmit, onCancel }: FormProps) {
  return (
    <FichaShell
      title="Autorização de atendimento"
      description="Autorização para avaliação e procedimentos odontológicos."
      enrollment={enrollment}
      onCancel={onCancel}
      onSubmit={(id, data, saveDraft) => onSubmit('autorizacao', id, data, saveDraft)}
    >
      {(record) => (
        <>
          <div className={styles.formSection}>
            <h2>Responsável</h2>
            <div className={styles.formGrid}>
              <Text label="Nome do responsável" name="responsavelNome" required autoComplete="name" defaultValue={formText(savedData, 'responsavelNome') || record.parent?.name} />
              <Text label="CPF do responsável" name="responsavelCpf" required inputMode="numeric" maxLength={14} placeholder="000.000.000-00" defaultValue={formText(savedData, 'responsavelCpf') || record.parent?.cpf} />
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Menor</h2>
            <div className={styles.formGrid}>
              <Text label="Nome do menor" name="menorNome" required defaultValue={formText(savedData, 'menorNome') || record.beneficiary.name} />
              <Text label="CPF do menor" name="menorCpf" required inputMode="numeric" maxLength={14} placeholder="000.000.000-00" defaultValue={formText(savedData, 'menorCpf') || record.beneficiary.cpf} />
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Autorização</h2>
            <div className={styles.formGrid}>
              <Consent name="autorizaOdonto" defaultChecked={formChecked(savedData, 'autorizaOdonto')}>
                Autorizo o(a) menor acima a passar por avaliação e procedimentos odontológicos que sejam julgados necessários pela
                Dra. Gisele Barreto (CROSP 121197), a qual realizará os mesmos no recinto Recanto Betel.
              </Consent>
            </div>
          </div>

          <SignatureSection parentName={record.parent?.name ?? ''} savedData={savedData} />
        </>
      )}
    </FichaShell>
  );
}

const DOENCAS: [string, string][] = [
  ['febreReumatica', 'Febre reumática'],
  ['cardiacos', 'Problemas cardíacos'],
  ['renais', 'Problemas renais'],
  ['gastricos', 'Problemas gástricos'],
  ['respiratorios', 'Problemas respiratórios'],
  ['alergicos', 'Problemas alérgicos'],
  ['articulares', 'Problemas articulares ou reumatismo'],
  ['diabetes', 'Diabetes'],
  ['hipertensao', 'Hipertensão arterial'],
];

function AnamneseForm({ enrollment, savedData, onSubmit, onCancel }: FormProps) {
  return (
    <FichaShell
      title="Ficha de anamnese"
      description="Questionário de saúde. Responda com atenção: as informações ajudam no cuidado da criança."
      enrollment={enrollment}
      onCancel={onCancel}
      onSubmit={(id, data, saveDraft) => onSubmit('anamnese', id, data, saveDraft)}
    >
      {(record) => (
        <>
          <div className={styles.formSection}>
            <h2>Queixa principal</h2>
            <div className={styles.formGrid}>
              <TextArea label="Queixa principal e evolução da doença atual" name="queixaPrincipal" optional defaultValue={formText(savedData, 'queixaPrincipal')} />
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Questionário de saúde</h2>
            <p>Responda Sim ou Não. Quando for Sim, informe qual.</p>
            <div className={styles.formGrid}>
              <YesNo name="doenca" label="Sofre de alguma doença?" withDetail defaultValue={formChoice(savedData, 'doenca')} detailValue={formText(savedData, 'doencaDetalhe')} />
              <YesNo name="tratamento" label="Está em tratamento médico atualmente?" defaultValue={formChoice(savedData, 'tratamento')} />
              <YesNo name="gravidez" label="Gravidez (se aplicável)" required={false} defaultValue={formChoice(savedData, 'gravidez')} />
              <YesNo name="medicacao" label="Está fazendo uso de alguma medicação?" withDetail defaultValue={formChoice(savedData, 'medicacao')} detailValue={formText(savedData, 'medicacaoDetalhe')} />
              <Text label="Nome do médico assistente" name="medicoNome" optional defaultValue={formText(savedData, 'medicoNome')} />
              <Text label="Telefone do médico assistente" name="medicoTelefone" type="tel" optional defaultValue={formText(savedData, 'medicoTelefone')} />
              <YesNo name="alergia" label="Teve alergia?" withDetail detailLabel="Quais?" defaultValue={formChoice(savedData, 'alergia')} detailValue={formText(savedData, 'alergiaDetalhe')} />
              <YesNo name="operado" label="Já foi operado?" withDetail detailLabel="Quais?" defaultValue={formChoice(savedData, 'operado')} detailValue={formText(savedData, 'operadoDetalhe')} />
              <YesNo name="cicatrizacao" label="Teve problemas com a cicatrização?" defaultValue={formChoice(savedData, 'cicatrizacao')} />
              <YesNo name="anestesia" label="Teve problemas com anestesia?" defaultValue={formChoice(savedData, 'anestesia')} />
              <YesNo name="hemorragia" label="Teve problemas de hemorragia?" defaultValue={formChoice(savedData, 'hemorragia')} />
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Sofre de algumas das seguintes doenças?</h2>
            <div className={styles.formGrid}>
              {DOENCAS.map(([name, label]) => <YesNo key={name} name={`doencas_${name}`} label={label} defaultValue={formChoice(savedData, `doencas_${name}`)} />)}
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Outras informações</h2>
            <div className={styles.formGrid}>
              <Text label="Hábitos" name="habitos" wide optional defaultValue={formText(savedData, 'habitos')} />
              <TextArea label="Antecedentes familiares" name="antecedentesFamiliares" optional defaultValue={formText(savedData, 'antecedentesFamiliares')} />
              <TextArea label="Outras informações" name="outrasInformacoes" optional defaultValue={formText(savedData, 'outrasInformacoes')} />
              <Consent name="declaracao" defaultChecked={formChecked(savedData, 'declaracao')}>Declaro que as informações acima prestadas são totalmente verdadeiras.</Consent>
            </div>
          </div>

          <SignatureSection parentName={record.parent?.name ?? ''} savedData={savedData} />
        </>
      )}
    </FichaShell>
  );
}

function RelatosForm({ enrollment, savedData, onSubmit, onCancel }: FormProps) {
  return (
    <FichaShell
      title="Relatos"
      description="Registre observações ou relatos sobre o beneficiário."
      enrollment={enrollment}
      onCancel={onCancel}
      onSubmit={(id, data, saveDraft) => onSubmit('relatos', id, data, saveDraft)}
    >
      {() => (
        <div className={styles.formSection}>
          <h2>Novo relato</h2>
          <p>Descreva o que considerar importante para a equipe.</p>
          <div className={styles.formGrid}>
            <label className={styles.field}>Data<input name="data" type="date" value={todayIso()} readOnly /></label>
            <label className={`${styles.field} ${styles.fieldWide}`}>
              Relato
              <textarea name="relato" rows={10} maxLength={2000} required defaultValue={formText(savedData, 'relato')} placeholder="Escreva aqui o relato." />
            </label>
          </div>
        </div>
      )}
    </FichaShell>
  );
}

export function FichasHub({ enrollments, navigate }: {
  enrollments: EnrollmentRecord[];
  navigate: (to: string) => void;
}) {
  return (
    <>
      <FormPageTitle title="Fichas" description="Acompanhe e continue o preenchimento das fichas vinculadas a cada matrícula." />
      {enrollments.length ? enrollments.map((enrollment) => (
        <section className={styles.panel} key={enrollment.id}>
          <div className={styles.panelHeading}>
            <div><h2>{enrollment.beneficiary.name}</h2><p>Matrícula {enrollment.id}</p></div>
            <span className={styles.badge}>{enrollment.formsComplete ? 'Fichas completas' : 'Fichas pendentes'}</span>
          </div>
          <div className={styles.activityList}>
            {FICHAS.map(({ kind, title, description, icon: Icon }) => {
              const status = enrollment.formsStatus.find((item) => item.kind === kind);
              const href = kind === 'matricula'
                ? `/portal/matriculas/${enrollment.id}/editar`
                : `/portal/matriculas/${enrollment.id}/fichas/${kind}`;
              return (
                <button key={kind} type="button" className={styles.activityItem} onClick={() => navigate(href)}>
                  <span className={styles.activityIcon}><Icon size={17} /></span>
                  <span className={styles.activityText}><strong>{title}</strong><small>{description}</small></span>
                  <span className={styles.formStatus}>{statusLabel(status?.status ?? 'PENDING')}{status?.required ? ' · obrigatória' : ' · opcional'}</span>
                  <ArrowRight size={16} className={styles.rowArrow} />
                </button>
              );
            })}
          </div>
        </section>
      )) : (
        <section className={styles.panel}>
          <p className={styles.helperNote}>Inicie uma matrícula para acessar e preencher as fichas relacionadas.</p>
        </section>
      )}
    </>
  );
}

function statusLabel(status: string): string {
  if (status === 'COMPLETE') return 'Preenchida';
  if (status === 'INCOMPLETE') return 'Incompleta';
  return 'Pendente';
}

function anamneseData(record: EnrollmentRecord): Record<string, unknown> {
  const data = record.anamnese;
  if (!data) return {};
  const result: Record<string, unknown> = {
    queixaPrincipal: data.mainComplaintEvolution,
    doencaDetalhe: data.diseaseDescription,
    medicacaoDetalhe: data.medicationDescription,
    medicoNome: data.attendingPhysicianName,
    medicoTelefone: data.attendingPhysicianPhone,
    alergiaDetalhe: data.allergiesDescription,
    operadoDetalhe: data.surgeriesDescription,
    habitos: data.habits,
    antecedentesFamiliares: data.familyHistory,
    outrasInformacoes: data.otherInformation,
    declaracao: data.declarationAccepted,
    assinatura: data.responsibleSignature,
  };
  const fields: Record<string, string> = {
    doenca: 'suffersFromDisease',
    tratamento: 'underMedicalTreatment',
    gravidez: 'isPregnant',
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
  for (const [formKey, apiKey] of Object.entries(fields)) {
    const value = data[apiKey];
    if (typeof value === 'boolean') result[formKey] = value;
  }
  return result;
}

export function FichaPage({ kind, enrollment, onSubmit, navigate }: {
  kind?: string;
  enrollment?: EnrollmentRecord;
  onSubmit: (kind: FichaKind, enrollmentId: string, data: FormData, saveDraft: boolean) => void;
  navigate: (to: string) => void;
}) {
  if (!enrollment) {
    return <section className={styles.panel}><p className={styles.helperNote}>A matrícula não está disponível para sua conta.</p><button className={styles.buttonSecondary} type="button" onClick={() => navigate('/portal/matriculas')}>Voltar para matrículas</button></section>;
  }
  const savedFormKind = kind === 'termo' ? 'TERMO' : kind === 'autorizacao' ? 'AUTORIZACAO' : 'RELATOS';
  const savedData = kind === 'anamnese'
    ? anamneseData(enrollment)
    : enrollment.forms.find((form) => form.kind === savedFormKind)?.data ?? {};
  const props: FormProps = {
    enrollment,
    savedData,
    onSubmit,
    onCancel: () => navigate(`/portal/matriculas/${enrollment.id}`),
  };
  switch (kind) {
    case 'termo': return <TermoForm {...props} />;
    case 'autorizacao': return <AutorizacaoForm {...props} />;
    case 'anamnese': return <AnamneseForm {...props} />;
    case 'relatos': return <RelatosForm {...props} />;
    default:
      return (
        <section className={styles.panel}>
          <p className={styles.helperNote}>Ficha não encontrada para esta matrícula.</p>
          <button className={styles.buttonSecondary} type="button" onClick={() => navigate(`/portal/matriculas/${enrollment.id}`)}>Voltar para a matrícula</button>
        </section>
      );
  }
}
