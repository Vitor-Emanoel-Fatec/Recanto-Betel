import { useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { ArrowRight, Check, ClipboardList, FileText, HeartPulse, ShieldCheck, Stethoscope } from 'lucide-react';
import styles from './PortalApp.module.scss';
import { demoParent, type Beneficiary, type FichaKind, type FichaSubmission } from './demoData';

export const FICHAS: { kind: FichaKind; title: string; description: string; icon: typeof FileText }[] = [
  { kind: 'matricula', title: 'Ficha de matrícula', description: 'Dados da criança, responsáveis, composição familiar e endereço.', icon: FileText },
  { kind: 'termo', title: 'Termo de compromisso', description: 'Compromissos do responsável e pessoas autorizadas a buscar a criança.', icon: ShieldCheck },
  { kind: 'autorizacao', title: 'Autorização de atendimento', description: 'Autorização para avaliação e procedimentos odontológicos no Recanto Betel.', icon: Stethoscope },
  { kind: 'anamnese', title: 'Ficha de anamnese', description: 'Questionário de saúde e histórico médico da criança.', icon: HeartPulse },
  { kind: 'relatos', title: 'Relatos', description: 'Registro de observações e relatos sobre o beneficiário.', icon: ClipboardList },
];

export const isFichaKind = (value?: string): value is FichaKind => FICHAS.some((item) => item.kind === value);

const todayIso = () => new Date().toISOString().slice(0, 10);
const formatDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR');

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

function TextArea({ label, name, rows = 3, optional, maxLength = 1000 }: { label: string; name: string; rows?: number; optional?: boolean; maxLength?: number }) {
  return (
    <label className={`${styles.field} ${styles.fieldWide}`}>
      <span>
        {label}
        {optional && <span className={styles.optional}> (opcional)</span>}
      </span>
      <textarea name={name} rows={rows} maxLength={maxLength} />
    </label>
  );
}

function YesNo({ name, label, detailLabel = 'Qual?', withDetail = false, required = true }: {
  name: string; label: string; detailLabel?: string; withDetail?: boolean; required?: boolean;
}) {
  const [value, setValue] = useState('');
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
          <input name={`${name}Detalhe`} required maxLength={200} />
        </label>
      )}
    </fieldset>
  );
}

function Consent({ name, children }: { name: string; children: ReactNode }) {
  return (
    <label className={`${styles.consent} ${styles.fieldWide}`}>
      <input type="checkbox" name={name} required />
      <span>{children}</span>
    </label>
  );
}

function SignatureSection() {
  return (
    <div className={styles.formSection}>
      <h2>Local, data e assinatura</h2>
      <p>Ao digitar seu nome você confirma que as informações são verdadeiras. Nesta demonstração, isso não tem validade jurídica.</p>
      <div className={styles.formGrid}>
        <label className={styles.field}>Local<input name="local" value="Tatuí" readOnly /></label>
        <label className={styles.field}>Data<input name="data" type="date" value={todayIso()} readOnly /></label>
        <Text label="Nome do responsável legal (assinatura)" name="assinatura" wide required defaultValue={demoParent.name} autoComplete="name" />
      </div>
    </div>
  );
}

function FichaShell({ title, description, beneficiaries, onSubmit, onCancel, children }: {
  title: string;
  description: string;
  beneficiaries: Beneficiary[];
  onSubmit: (beneficiaryId: string, data: FormData) => void;
  onCancel: () => void;
  children: (beneficiary?: Beneficiary) => ReactNode;
}) {
  const [beneficiaryId, setBeneficiaryId] = useState('');
  const beneficiary = beneficiaries.find((item) => item.id === beneficiaryId);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(beneficiaryId, new FormData(event.currentTarget));
  };

  if (!beneficiaries.length) {
    return (
      <>
        <FormPageTitle title={title} description={description} />
        <section className={styles.panel}>
          <p className={styles.helperNote}>Cadastre um beneficiário primeiro para preencher esta ficha.</p>
        </section>
      </>
    );
  }

  return (
    <>
      <FormPageTitle title={title} description={description} />
      <form className={styles.panelForm} onSubmit={handleSubmit}>
        <div className={styles.formSection}>
          <h2>Beneficiário</h2>
          <p>Escolha a criança a que esta ficha se refere.</p>
          <label className={styles.field}>
            Selecione o beneficiário
            <select value={beneficiaryId} onChange={(event) => setBeneficiaryId(event.target.value)} required>
              <option value="" disabled>Escolha uma opção</option>
              {beneficiaries.map((item) => <option value={item.id} key={item.id}>{item.fullName}</option>)}
            </select>
          </label>
        </div>

        <div key={beneficiaryId || 'none'}>{children(beneficiary)}</div>

        <div className={styles.formFooter}>
          <button type="button" className={styles.buttonSecondary} onClick={onCancel}>Cancelar</button>
          <button type="submit" className={styles.buttonPrimary}><Check size={17} /> Enviar ficha demonstrativa</button>
        </div>
      </form>
    </>
  );
}

interface FormProps {
  beneficiaries: Beneficiary[];
  onSubmit: (kind: FichaKind, beneficiaryId: string, data: FormData) => void;
  onCancel: () => void;
}

function ParentBlock({ prefix, title }: { prefix: 'pai' | 'mae'; title: string }) {
  return (
    <div className={styles.formSection}>
      <h2>{title}</h2>
      <p>Preencha se houver este responsável.</p>
      <div className={styles.formGrid}>
        <Text label="Nome" name={`${prefix}Nome`} wide />
        <Text label="Telefone" name={`${prefix}Tel`} type="tel" autoComplete="tel" />
        <Text label="Profissão" name={`${prefix}Profissao`} />
        <Text label="Grau de escolaridade" name={`${prefix}Escolaridade`} />
        <Text label="Salário (R$)" name={`${prefix}Salario`} inputMode="decimal" />
        <Text label="Endereço comercial" name={`${prefix}EnderecoComercial`} wide />
      </div>
    </div>
  );
}

function MatriculaForm({ beneficiaries, onSubmit, onCancel }: FormProps) {
  return (
    <FichaShell
      title="Ficha de matrícula"
      description="Preenchida pelo pai ou responsável. Revise os dados antes de enviar."
      beneficiaries={beneficiaries}
      onCancel={onCancel}
      onSubmit={(id, data) => onSubmit('matricula', id, data)}
    >
      {(beneficiary) => (
        <>
          <div className={styles.formSection}>
            <h2>Criança</h2>
            <p>Dados pessoais, escolares e de saúde.</p>
            <div className={styles.formGrid}>
              <label className={`${styles.field} ${styles.fieldWide}`}>
                Foto da criança
                <input name="foto" type="file" accept="image/*" />
              </label>
              <Text label="Nome" name="nome" wide required defaultValue={beneficiary?.fullName} />
              <Text label="Data de nascimento" name="nascimento" type="date" required defaultValue={beneficiary?.birthDate} max={todayIso()} />
              <Text label="RG" name="rg" />
              <Text label="CPF" name="cpf" inputMode="numeric" maxLength={14} placeholder="000.000.000-00" />
              <Text label="Estuda na escola" name="escola" />
              <Text label="Período" name="periodo" placeholder="Manhã, tarde…" />
              <Text label="Série" name="serie" />
              <YesNo name="problemaSaude" label="Tem algum problema de saúde?" withDetail />
              <YesNo name="tratamentoMedico" label="Faz algum tratamento médico?" withDetail />
              <YesNo name="alergia" label="Tem alergia?" withDetail />
              <Text label="Que doenças ele(a) já teve?" name="doencasAnteriores" wide />
            </div>
          </div>

          <ParentBlock prefix="pai" title="Responsável — Pai" />
          <ParentBlock prefix="mae" title="Responsável — Mãe" />

          <div className={styles.formSection}>
            <h2>Renda e benefícios</h2>
            <p>Informações usadas apenas para o estudo socioeconômico.</p>
            <div className={styles.formGrid}>
              <Text label="NIS" name="nis" inputMode="numeric" />
              <Text label="Renda total (R$)" name="rendaTotal" inputMode="decimal" />
              <Text label="Renda per capita (R$)" name="rendaPerCapita" inputMode="decimal" />
              <YesNo name="beneficioGoverno" label="Recebe algum benefício do governo?" withDetail detailLabel="Qual?" />
              <Text label="Valor do benefício (R$)" name="beneficioValor" inputMode="decimal" />
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Religião e composição familiar</h2>
            <p>Liste as pessoas que moram com a criança (até 4).</p>
            <div className={styles.formGrid}>
              <Text label="Religião" name="religiao" wide />
            </div>
            {[1, 2, 3, 4].map((n) => (
              <fieldset key={n} className={styles.repeatRow}>
                <legend>Familiar {n}</legend>
                <Text label="Nome" name={`familiar${n}Nome`} />
                <Text label="Nascimento" name={`familiar${n}Nascimento`} type="date" max={todayIso()} />
                <Text label="Parentesco" name={`familiar${n}Parentesco`} />
                <Text label="Renda (R$)" name={`familiar${n}Renda`} inputMode="decimal" />
              </fieldset>
            ))}
          </div>

          <div className={styles.formSection}>
            <h2>Endereço</h2>
            <p>Moradia e despesas mensais da família.</p>
            <div className={styles.formGrid}>
              <Text label="Endereço residencial" name="endereco" wide required />
              <Text label="Número" name="numero" required />
              <Text label="Bairro" name="bairro" required />
              <Text label="Ponto de referência" name="referencia" wide />
              <label className={styles.field}>
                Moradia
                <select name="moradia" required defaultValue="">
                  <option value="" disabled>Escolha uma opção</option>
                  <option>Própria</option>
                  <option>Cedida</option>
                  <option>Alugada</option>
                </select>
              </label>
              <Text label="Valor do aluguel (R$)" name="aluguel" inputMode="decimal" />
              <Text label="Água (R$)" name="despesaAgua" inputMode="decimal" />
              <Text label="Energia (R$)" name="despesaEnergia" inputMode="decimal" />
              <Text label="Alimentação (R$)" name="despesaAlimentacao" inputMode="decimal" />
              <Text label="Gás (R$)" name="despesaGas" inputMode="decimal" />
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Autorização de frequência</h2>
            <div className={styles.formGrid}>
              <Consent name="autorizaFrequencia">
                Autorizo meu filho(a) a frequentar de segunda a sexta-feira, das 13h às 17h, o Projeto Samaritano, pelo prazo de 1 mês de
                adaptação, bem como participar de todas as atividades do Plano anual, passeios e atividades fora da Associação Recanto Betel,
                acompanhados(as) pela educadora, funcionários e voluntários.
              </Consent>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Matrículas e rematrículas</h2>
            <p>Registro da matrícula. Rematrículas futuras serão adicionadas pela equipe.</p>
            <div className={styles.formGrid}>
              <label className={styles.field}>Data<input name="dataMatricula" type="date" value={todayIso()} readOnly /></label>
              <Text label="Responsável (assinatura)" name="assinatura" required defaultValue={demoParent.name} autoComplete="name" />
            </div>
          </div>
        </>
      )}
    </FichaShell>
  );
}

function TermoForm({ beneficiaries, onSubmit, onCancel }: FormProps) {
  const [sozinho, setSozinho] = useState('');
  return (
    <FichaShell
      title="Termo de compromisso"
      description="Compromissos a serem cumpridos pelo responsável."
      beneficiaries={beneficiaries}
      onCancel={onCancel}
      onSubmit={(id, data) => onSubmit('termo', id, data)}
    >
      {() => (
        <>
          <div className={styles.formSection}>
            <h2>Compromissos</h2>
            <p>Leia e marque cada item para concordar.</p>
            <div className={styles.formGrid}>
              <Consent name="compromisso1">1º Devo respeitar e cumprir todas as normas do Regulamento do Projeto Samaritano e incentivar meus filhos a cumpri-las também.</Consent>
              <Consent name="compromisso2">2º Estou ciente de que é importante participar de todas as convocações.</Consent>
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
                  <Text label="Nome" name={`pessoa${n}Nome`} required={n === 1} optional={n !== 1} />
                  <Text label="Parentesco" name={`pessoa${n}Parentesco`} required={n === 1} optional={n !== 1} />
                  <Text label="Telefone" name={`pessoa${n}Tel`} type="tel" required={n === 1} optional={n !== 1} />
                </fieldset>
              ))}
            </div>
          )}

          <SignatureSection />
        </>
      )}
    </FichaShell>
  );
}

function AutorizacaoForm({ beneficiaries, onSubmit, onCancel }: FormProps) {
  return (
    <FichaShell
      title="Autorização de atendimento"
      description="Autorização para avaliação e procedimentos odontológicos."
      beneficiaries={beneficiaries}
      onCancel={onCancel}
      onSubmit={(id, data) => onSubmit('autorizacao', id, data)}
    >
      {(beneficiary) => (
        <>
          <div className={styles.formSection}>
            <h2>Responsável</h2>
            <div className={styles.formGrid}>
              <Text label="Nome do responsável" name="responsavelNome" required defaultValue={demoParent.name} autoComplete="name" />
              <Text label="CPF do responsável" name="responsavelCpf" required inputMode="numeric" maxLength={14} placeholder="000.000.000-00" />
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Menor</h2>
            <div className={styles.formGrid}>
              <Text label="Nome do menor" name="menorNome" required defaultValue={beneficiary?.fullName} />
              <Text label="CPF do menor" name="menorCpf" required inputMode="numeric" maxLength={14} placeholder="000.000.000-00" />
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Autorização</h2>
            <div className={styles.formGrid}>
              <Consent name="autorizaOdonto">
                Autorizo o(a) menor acima a passar por avaliação e procedimentos odontológicos que sejam julgados necessários pela
                Dra. Gisele Barreto (CROSP 121197), a qual realizará os mesmos no recinto Recanto Betel.
              </Consent>
            </div>
          </div>

          <SignatureSection />
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

function AnamneseForm({ beneficiaries, onSubmit, onCancel }: FormProps) {
  return (
    <FichaShell
      title="Ficha de anamnese"
      description="Questionário de saúde. Responda com atenção: as informações ajudam no cuidado da criança."
      beneficiaries={beneficiaries}
      onCancel={onCancel}
      onSubmit={(id, data) => onSubmit('anamnese', id, data)}
    >
      {() => (
        <>
          <div className={styles.formSection}>
            <h2>Queixa principal</h2>
            <div className={styles.formGrid}>
              <TextArea label="Queixa principal e evolução da doença atual" name="queixaPrincipal" optional />
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Questionário de saúde</h2>
            <p>Responda Sim ou Não. Quando for Sim, informe qual.</p>
            <div className={styles.formGrid}>
              <YesNo name="doenca" label="Sofre de alguma doença?" withDetail />
              <YesNo name="tratamento" label="Está em tratamento médico atualmente?" />
              <YesNo name="gravidez" label="Gravidez (se aplicável)" required={false} />
              <YesNo name="medicacao" label="Está fazendo uso de alguma medicação?" withDetail />
              <Text label="Nome do médico assistente e telefone" name="medico" wide optional />
              <YesNo name="alergia" label="Teve alergia?" withDetail detailLabel="Quais?" />
              <YesNo name="operado" label="Já foi operado?" withDetail detailLabel="Quais?" />
              <YesNo name="cicatrizacao" label="Teve problemas com a cicatrização?" />
              <YesNo name="anestesia" label="Teve problemas com anestesia?" />
              <YesNo name="hemorragia" label="Teve problemas de hemorragia?" />
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Sofre de algumas das seguintes doenças?</h2>
            <div className={styles.formGrid}>
              {DOENCAS.map(([name, label]) => <YesNo key={name} name={`doencas_${name}`} label={label} />)}
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Outras informações</h2>
            <div className={styles.formGrid}>
              <Text label="Hábitos" name="habitos" wide optional />
              <TextArea label="Antecedentes familiares" name="antecedentesFamiliares" optional />
              <TextArea label="Outras informações" name="outrasInformacoes" optional />
              <Consent name="declaracao">Declaro que as informações acima prestadas são totalmente verdadeiras.</Consent>
            </div>
          </div>

          <SignatureSection />
        </>
      )}
    </FichaShell>
  );
}

function RelatosForm({ beneficiaries, onSubmit, onCancel }: FormProps) {
  return (
    <FichaShell
      title="Relatos"
      description="Registre observações ou relatos sobre o beneficiário."
      beneficiaries={beneficiaries}
      onCancel={onCancel}
      onSubmit={(id, data) => onSubmit('relatos', id, data)}
    >
      {() => (
        <div className={styles.formSection}>
          <h2>Novo relato</h2>
          <p>Descreva o que considerar importante para a equipe.</p>
          <div className={styles.formGrid}>
            <label className={styles.field}>Data<input name="data" type="date" value={todayIso()} readOnly /></label>
            <label className={`${styles.field} ${styles.fieldWide}`}>
              Relato
              <textarea name="relato" rows={10} maxLength={2000} required placeholder="Escreva aqui o relato." />
            </label>
          </div>
        </div>
      )}
    </FichaShell>
  );
}

export function FichasHub({ submissions, beneficiaries, navigate }: {
  submissions: FichaSubmission[];
  beneficiaries: Beneficiary[];
  navigate: (to: string) => void;
}) {
  return (
    <>
      <FormPageTitle title="Fichas" description="Preencha as fichas do Recanto Betel online, sem precisar imprimir." />
      <div className={styles.contentGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeading}><div><h2>Fichas disponíveis</h2><p>Escolha qual ficha deseja preencher</p></div></div>
          <div className={styles.activityList}>
            {FICHAS.map(({ kind, title, description, icon: Icon }) => (
              <button key={kind} type="button" className={styles.activityItem} onClick={() => navigate(`/portal/fichas/${kind}`)}>
                <span className={styles.activityIcon}><Icon size={17} /></span>
                <span className={styles.activityText}><strong>{title}</strong><small>{description}</small></span>
                <ArrowRight size={16} className={styles.rowArrow} />
              </button>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeading}><div><h2>Enviadas nesta sessão</h2><p>Não persistem após recarregar</p></div></div>
          {submissions.length ? (
            <div className={styles.activityList}>
              {submissions.map((item) => {
                const meta = FICHAS.find((ficha) => ficha.kind === item.kind);
                const beneficiary = beneficiaries.find((entry) => entry.id === item.beneficiaryId);
                return (
                  <div key={item.id} className={styles.activityItem}>
                    <span className={styles.activityIcon}><Check size={17} /></span>
                    <span className={styles.activityText}>
                      <strong>{meta?.title}</strong>
                      <small>{beneficiary?.fullName} · enviada em {formatDate(item.submittedAt)} · {item.id}</small>
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={styles.helperNote}>Nenhuma ficha enviada ainda.</p>
          )}
        </section>
      </div>
    </>
  );
}

export function FichaPage({ kind, beneficiaries, onSubmit, navigate }: {
  kind?: string;
  beneficiaries: Beneficiary[];
  onSubmit: (kind: FichaKind, beneficiaryId: string, data: FormData) => void;
  navigate: (to: string) => void;
}) {
  const props: FormProps = { beneficiaries, onSubmit, onCancel: () => navigate('/portal/fichas') };
  switch (kind) {
    case 'matricula': return <MatriculaForm {...props} />;
    case 'termo': return <TermoForm {...props} />;
    case 'autorizacao': return <AutorizacaoForm {...props} />;
    case 'anamnese': return <AnamneseForm {...props} />;
    case 'relatos': return <RelatosForm {...props} />;
    default:
      return (
        <section className={styles.panel}>
          <p className={styles.helperNote}>Ficha não encontrada.</p>
          <button className={styles.buttonSecondary} type="button" onClick={() => navigate('/portal/fichas')}>Voltar para fichas</button>
        </section>
      );
  }
}
