import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  Activity, ArrowLeft, ArrowRight, Bell, Check, ChevronDown, ClipboardList, Clock3,
  FilePlus2, Filter, Heart, LayoutDashboard, Menu, Plus, Search, Users, X,
} from 'lucide-react';
import styles from './PortalApp.module.scss';
import {
  demoBeneficiaries, demoEnrollments, demoParent, enrollmentStatuses,
  type Beneficiary, type Enrollment, type EnrollmentStatus,
} from './demoData';
import { applyDemoEnrollmentAction, createDemoBeneficiary, createDemoEnrollment, type EnrollmentAction } from './demoService';

type Area = 'portal' | 'admin';
type PageKey = 'home' | 'beneficiaries' | 'beneficiary-detail' | 'beneficiary-new' | 'enrollments' | 'enrollment-new' | 'enrollment-detail' | 'tracking' | 'responsibles' | 'reports';
type Action = EnrollmentAction;
const PAGE_LABELS: Record<PageKey, string> = {
  home: 'Visão geral', beneficiaries: 'Beneficiários', 'beneficiary-detail': 'Detalhes do beneficiário', 'beneficiary-new': 'Novo beneficiário',
  enrollments: 'Matrículas', 'enrollment-new': 'Nova solicitação',
  'enrollment-detail': 'Acompanhamento', tracking: 'Acompanhamento institucional', responsibles: 'Responsáveis', reports: 'Relatórios',
};
function routeInfo(path: string): { area: Area; page: PageKey; id?: string } {
  const area: Area = path.startsWith('/admin') ? 'admin' : 'portal';
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 1) return { area, page: 'home' };
  if (segments[1] === 'beneficiarios' && segments[2] === 'novo') return { area, page: 'beneficiary-new' };
  if (segments[1] === 'beneficiarios' && segments[2]) return { area, page: 'beneficiary-detail', id: segments[2] };
  if (segments[1] === 'beneficiarios') return { area, page: 'beneficiaries' };
  if (segments[1] === 'matriculas' && segments[2] === 'nova') return { area, page: 'enrollment-new' };
  if (segments[1] === 'matriculas' && segments[2]) return { area, page: 'enrollment-detail', id: segments[2] };
  if (segments[1] === 'matriculas') return { area, page: 'enrollments' };
  if (segments[1] === 'acompanhamento') return { area, page: 'tracking' };
  if (segments[1] === 'responsaveis') return { area, page: 'responsibles' };
  if (segments[1] === 'relatorios') return { area, page: 'reports' };
  return { area, page: 'home' };
}

const formatDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR');
const actionsFor = (status: EnrollmentStatus): Action[] =>
  ['Aprovada', 'Recusada', 'Cancelada'].includes(status)
    ? []
    : ['Aprovar', 'Solicitar informações', 'Encaminhar para revisão', 'Recusar', 'Cancelar'];

export function PortalApp() {
  const [path, setPath] = useState(window.location.pathname);
  const [beneficiaries, setBeneficiaries] = useState(demoBeneficiaries);
  const [enrollments, setEnrollments] = useState(demoEnrollments);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [sortNewest, setSortNewest] = useState(true);
  const [page, setPage] = useState(1);
  const [pendingAction, setPendingAction] = useState<{ enrollmentId: string; action: Action } | null>(null);
  const [reason, setReason] = useState('');
  const [newEnrollmentId, setNewEnrollmentId] = useState('');
  const current = routeInfo(path);
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
          { key: 'tracking', label: 'Acompanhamento', href: '/portal/acompanhamento', icon: Activity },
        ];

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
  };
  const link = (to: string, label: string, className?: string) => (
    <a className={className} href={to} onClick={(event) => { event.preventDefault(); navigate(to); }}>{label}</a>
  );
  const relatedBeneficiary = (id: string) => beneficiaries.find((item) => item.id === id);
  const currentEnrollment = current.id ? enrollments.find((item) =>
    item.id === current.id && (current.area === 'admin' || item.parentName === demoParent.name),
  ) : undefined;
  const currentBeneficiary = current.id ? beneficiaries.find((item) =>
    item.id === current.id && (current.area === 'admin' || item.parentId === demoParent.id),
  ) : undefined;
  const visibleEnrollments = current.area === 'admin'
    ? enrollments
    : enrollments.filter((item) => item.parentName === demoParent.name);
  const filtered = useMemo(() => visibleEnrollments
    .filter((item) => {
      const beneficiary = relatedBeneficiary(item.beneficiaryId);
      const matchesQuery = `${item.id} ${item.parentName} ${beneficiary?.fullName ?? ''}`.toLowerCase().includes(query.toLowerCase());
      return matchesQuery && (statusFilter === 'Todas' || item.status === statusFilter);
    })
    .sort((a, b) => sortNewest ? b.requestedAt.localeCompare(a.requestedAt) : a.requestedAt.localeCompare(b.requestedAt)),
  [visibleEnrollments, beneficiaries, query, statusFilter, sortNewest]);
  const pagedEnrollments = filtered.slice((page - 1) * 5, page * 5);
  const showToast = (message: string) => setToast(message);

  const submitBeneficiary = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get('fullName')).trim();
    const birthDate = String(formData.get('birthDate'));
    const beneficiary = createDemoBeneficiary(fullName, birthDate, new Date().toISOString().slice(0, 10));
    setBeneficiaries((previous) => [beneficiary, ...previous]);
    showToast('Beneficiário cadastrado nesta demonstração.');
    navigate('/portal/beneficiarios');
  };

  const submitEnrollment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const beneficiaryId = String(formData.get('beneficiaryId'));
    const date = new Date().toISOString().slice(0, 10);
    const requestMessage = String(formData.get('message') ?? '').trim();
    const enrollment = createDemoEnrollment(beneficiaryId, date, requestMessage);
    setEnrollments((previous) => [enrollment, ...previous]);
    setNewEnrollmentId(enrollment.id);
    navigate(`/portal/matriculas/${enrollment.id}`);
    showToast('Solicitação demonstrativa enviada.');
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    const { enrollmentId, action } = pendingAction;
    const date = new Date().toISOString().slice(0, 10);
    const changed = enrollments.find((item) => item.id === enrollmentId);
    if (!changed) return;
    const updatedEnrollment = applyDemoEnrollmentAction(changed, action, reason, date);
    setEnrollments((previous) => previous.map((item) => item.id === enrollmentId ? updatedEnrollment : item));
    setPendingAction(null);
    setReason('');
    showToast(`Status atualizado para “${updatedEnrollment.status}”. Alteração apenas demonstrativa.`);
  };

  return (
    <div className={styles.app}>
      <a className={styles.skipLink} href="#portal-content">Pular para o conteúdo</a>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <a className={styles.brand} href="/" aria-label="Recanto Betel — página inicial">
            <span className={styles.brandMark}><Heart size={20} fill="currentColor" /></span>
            <span><small>ASSOCIAÇÃO</small><strong>Recanto Betel</strong></span>
          </a>
          <div className={styles.headerRight}>
            <span className={styles.demoBadge}>DEMONSTRAÇÃO · SEM AUTENTICAÇÃO</span>
            <details className={styles.profileMenu}>
              <summary className={styles.userButton}>
                <span className={styles.avatar}>{current.area === 'portal' ? 'MO' : 'AD'}</span>
                <span>{current.area === 'portal' ? demoParent.name : 'Equipe administrativa'}</span>
                <ChevronDown size={16} aria-hidden="true" />
              </summary>
              <div className={styles.profileDropdown}><strong>Perfil demonstrativo</strong><p>Não há autenticação nem validação de permissões neste ambiente.</p></div>
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
                (item.key === 'beneficiaries' && current.page === 'beneficiary-detail');
              return <a key={item.href + item.label} className={`${styles.navLink} ${active ? styles.navActive : ''}`} href={item.href} onClick={(event) => { event.preventDefault(); navigate(item.href); }}><Icon size={17} />{item.label}</a>;
            })}
          </nav>
          <div className={styles.areaSwitch} aria-label="Alternar ambiente de demonstração">
            {link('/portal', 'Parent', current.area === 'portal' ? styles.areaActive : '')}
            {link('/admin', 'Admin', current.area === 'admin' ? styles.areaActive : '')}
          </div>
        </div>
      </header>

      <main id="portal-content" className={styles.main}>
        <div className={styles.breadcrumb}><span>Recanto Betel</span><span aria-hidden="true">/</span><span>{current.area === 'admin' ? 'Admin' : 'Parent'}</span><span aria-hidden="true">/</span><strong>{current.page === 'tracking' && current.area === 'portal' ? 'Acompanhamento' : PAGE_LABELS[current.page]}</strong></div>
        <div className={styles.demoNotice}><Bell size={16} /><span><strong>Ambiente de demonstração.</strong> Os dados são fictícios e alterações não persistem após recarregar. Não há validação de identidade ou permissões.</span></div>

        {current.page === 'home' && <Dashboard area={current.area} beneficiaries={beneficiaries} enrollments={enrollments} navigate={navigate} link={link} relatedBeneficiary={relatedBeneficiary} />}
        {current.page === 'beneficiaries' && <BeneficiaryList area={current.area} beneficiaries={current.area === 'portal' ? beneficiaries.filter((item) => item.parentId === demoParent.id) : beneficiaries} enrollments={enrollments} link={link} navigate={navigate} />}
        {current.page === 'beneficiary-detail' && <BeneficiaryDetail beneficiary={currentBeneficiary} enrollments={enrollments} area={current.area} navigate={navigate} />}
        {current.page === 'beneficiary-new' && <BeneficiaryForm onSubmit={submitBeneficiary} onCancel={() => navigate('/portal/beneficiarios')} />}
        {current.page === 'enrollments' && <EnrollmentList area={current.area} enrollments={pagedEnrollments} filteredCount={filtered.length} page={page} maxPage={Math.max(1, Math.ceil(filtered.length / 5))} query={query} statusFilter={statusFilter} setQuery={setQuery} setStatusFilter={setStatusFilter} setSortNewest={setSortNewest} sortNewest={sortNewest} setPage={setPage} link={link} relatedBeneficiary={relatedBeneficiary} onAction={(enrollmentId, action) => { setReason(''); setPendingAction({ enrollmentId, action }); }} />}
        {current.page === 'enrollment-new' && <EnrollmentForm beneficiaries={beneficiaries.filter((item) => item.parentId === demoParent.id)} onSubmit={submitEnrollment} onCancel={() => navigate('/portal/matriculas')} />}
        {current.page === 'enrollment-detail' && <EnrollmentDetail enrollment={currentEnrollment} beneficiary={currentEnrollment ? relatedBeneficiary(currentEnrollment.beneficiaryId) : undefined} area={current.area} newEnrollment={currentEnrollment?.id === newEnrollmentId} onAction={(enrollmentId, action) => { setReason(''); setPendingAction({ enrollmentId, action }); }} link={link} />}
        {current.page === 'tracking' && <TrackingPage area={current.area} beneficiaries={beneficiaries} enrollments={visibleEnrollments} navigate={navigate} />}
        {current.page === 'responsibles' && <Responsibles beneficiaries={beneficiaries} enrollments={enrollments} />}
        {current.page === 'reports' && <Reports enrollments={enrollments} beneficiaries={beneficiaries} />}
      </main>
      <footer className={styles.footer}><span>Recanto Betel · Portal demonstrativo</span>{link('/', 'Voltar ao site institucional')}</footer>
      {toast && <div className={styles.toast} role="status"><Check size={18} />{toast}</div>}
      {pendingAction && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingAction(null); }}>
        <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <button type="button" className={styles.modalClose} aria-label="Fechar confirmação" onClick={() => setPendingAction(null)}><X size={20} /></button>
          <span className={styles.modalIcon}><ClipboardList size={23} /></span>
          <h2 id="confirm-title">Confirmar: {pendingAction.action}</h2>
          <p>Esta ação alterará o status demonstrativo da solicitação <strong>{pendingAction.enrollmentId}</strong>. Aprovação não significa ingresso institucional.</p>
          {(['Solicitar informações', 'Recusar'].includes(pendingAction.action)) && <label className={styles.field}>Justificativa ou orientação<textarea value={reason} onChange={(event) => setReason(event.target.value)} required rows={3} placeholder="Descreva o motivo para o responsável." /></label>}
          <div className={styles.modalActions}><button type="button" className={styles.buttonSecondary} onClick={() => setPendingAction(null)}>Cancelar</button><button type="button" className={styles.buttonPrimary} disabled={(['Solicitar informações', 'Recusar'].includes(pendingAction.action) && !reason.trim())} onClick={confirmAction}>Confirmar ação</button></div>
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
  const list = isAdmin ? enrollments : enrollments.filter((item) => item.parentName === demoParent.name);
  const activeCount = beneficiaries.filter((item) => item.status === 'Ativo').length;
  const pendingCount = list.filter((item) => ['Enviada', 'Em análise', 'Aguardando informações', 'Em revisão'].includes(item.status)).length;
  return <>
    <PageTitle eyebrow={isAdmin ? 'Área administrativa · demonstração' : 'Área do responsável · demonstração'} title={isAdmin ? 'Visão geral administrativa' : `Olá, ${demoParent.name.split(' ')[0]}!`} description={isAdmin ? 'Resumo demonstrativo das solicitações e dos vínculos institucionais.' : 'Acompanhe seus beneficiários e solicitações em um só lugar.'} actions={!isAdmin && <button className={styles.buttonPrimary} onClick={() => navigate('/portal/beneficiarios/novo')}><Plus size={17} /> Cadastrar beneficiário</button>} />
    <div className={styles.statsGrid}>
      {(isAdmin ? [
        { label: 'Beneficiários', value: beneficiaries.length, detail: 'registros demonstrativos', icon: Users },
        { label: 'Ativos', value: activeCount, detail: 'vínculos institucionais', icon: Heart },
        { label: 'Aguardando análise', value: pendingCount, detail: 'solicitações em aberto', icon: Clock3 },
        { label: 'Aprovadas', value: list.filter((item) => item.status === 'Aprovada').length, detail: 'não significa ingresso', icon: Check },
      ] : [
        { label: 'Beneficiários vinculados', value: beneficiaries.filter((item) => item.parentId === demoParent.id).length, detail: 'cadastros demonstrativos', icon: Users },
        { label: 'Em andamento', value: pendingCount, detail: 'solicitações de matrícula', icon: Clock3 },
        { label: 'Pendências', value: list.filter((item) => item.status === 'Aguardando informações').length, detail: 'precisam de atenção', icon: Bell },
        { label: 'Ativos', value: beneficiaries.filter((item) => item.parentId === demoParent.id && item.status === 'Ativo').length, detail: 'após ingresso institucional', icon: Heart },
      ]).map((stat) => { const Icon = stat.icon; return <article className={styles.statCard} key={stat.label}><span className={styles.statIcon}><Icon size={19} /></span><span className={styles.statLabel}>{stat.label}</span><strong>{stat.value}</strong><small>{stat.detail}</small></article>; })}
    </div>
    <div className={styles.contentGrid}>
      <section className={styles.panel}>
        <div className={styles.panelHeading}><div><h2>{isAdmin ? 'Solicitações recentes' : 'Atualizações recentes'}</h2><p>Movimentações deste ambiente de demonstração</p></div>{link(isAdmin ? '/admin/matriculas' : '/portal/matriculas', 'Ver todas', styles.textLink)}</div>
        <div className={styles.activityList}>{list.slice(0, 4).map((item) => <a className={styles.activityItem} href={`${isAdmin ? '/admin' : '/portal'}/matriculas/${item.id}`} key={item.id} onClick={(event) => { event.preventDefault(); navigate(`${isAdmin ? '/admin' : '/portal'}/matriculas/${item.id}`); }}><span className={styles.activityIcon}><ClipboardList size={17} /></span><span className={styles.activityText}><strong>{relatedBeneficiary(item.beneficiaryId)?.fullName ?? 'Beneficiário'}</strong><small>{item.id} · atualizado em {formatDate(item.updatedAt)}</small></span><StatusBadge status={item.status} /><ArrowRight size={16} className={styles.rowArrow} /></a>)}</div>
      </section>
      <aside className={styles.panel}>
        <div className={styles.panelHeading}><div><h2>{isAdmin ? 'Atalhos administrativos' : 'Ações rápidas'}</h2><p>Acesse os fluxos principais</p></div></div>
        <div className={styles.quickLinks}>
          {isAdmin ? <><QuickLink title="Analisar matrículas" description="Consulte e atualize solicitações" icon={<ClipboardList size={18} />} onClick={() => navigate('/admin/matriculas')} /><QuickLink title="Consultar beneficiários" description="Veja registros ativos e históricos" icon={<Users size={18} />} onClick={() => navigate('/admin/beneficiarios')} /></>
            : <><QuickLink title="Cadastrar beneficiário" description="O cadastro não cria uma matrícula" icon={<Plus size={18} />} onClick={() => navigate('/portal/beneficiarios/novo')} /><QuickLink title="Solicitar matrícula" description="Para um beneficiário já cadastrado" icon={<FilePlus2 size={18} />} onClick={() => navigate('/portal/matriculas/nova')} /></>}
        </div>
        {isAdmin && <p className={styles.helperNote}>Todos os números e registros exibidos são fictícios. A aprovação não representa ingresso na instituição.</p>}
      </aside>
    </div>
  </>;
}

function QuickLink({ title, description, icon, onClick }: { title: string; description: string; icon: ReactNode; onClick: () => void }) {
  return <button className={styles.quickLink} type="button" onClick={onClick}><span>{icon}</span><span><strong>{title}</strong><small>{description}</small></span><ArrowRight size={16} /></button>;
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === 'Aprovada' || status === 'Ativo' ? 'positive' : status === 'Recusada' || status === 'Desligado' || status === 'Cancelada' ? 'negative' : status === 'Aguardando informações' || status === 'Lista de espera' ? 'warning' : 'neutral';
  return <span className={`${styles.badge} ${styles[`badge_${tone}`]}`}><span aria-hidden="true" />{status}</span>;
}

function BeneficiaryList({ area, beneficiaries, enrollments, link, navigate }: { area: Area; beneficiaries: Beneficiary[]; enrollments: Enrollment[]; link: (to: string, label: string, className?: string) => ReactNode; navigate: (to: string) => void }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Todas');
  const filtered = beneficiaries.filter((item) =>
    `${item.fullName} ${item.id}`.toLowerCase().includes(search.toLowerCase()) &&
    (status === 'Todas' || item.status === status),
  );
  return <>
    <PageTitle eyebrow={area === 'admin' ? 'Administração' : 'Área do responsável'} title="Beneficiários" description={area === 'admin' ? 'Consulte os registros demonstrativos, incluindo históricos.' : 'Beneficiários vinculados ao seu cadastro demonstrativo.'} actions={area === 'portal' && link('/portal/beneficiarios/novo', 'Cadastrar beneficiário', styles.buttonPrimary)} />
    <section className={styles.panel}>
      <div className={styles.toolbar}><label className={styles.searchBox}><Search size={18} /><span className={styles.visuallyHidden}>Pesquisar beneficiário</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome" /></label><label className={styles.filterBox}><Filter size={17} /><span className={styles.visuallyHidden}>Filtrar situação cadastral</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>Todas</option><option>Ativo</option><option>Aguardando matrícula</option><option>Desligado</option></select></label><span className={styles.resultCount}>{filtered.length} registros</span></div>
      {filtered.length ? <div className={styles.tableWrap}><table><thead><tr><th>Nome</th><th>Situação cadastral</th><th>Matrícula</th><th>Atualizado em</th><th><span className={styles.visuallyHidden}>Ação</span></th></tr></thead><tbody>{filtered.map((item) => {
        const enrollment = enrollments.find((entry) => entry.beneficiaryId === item.id);
        const base = area === 'admin' ? '/admin' : '/portal';
        return <tr key={item.id}><td><strong>{item.fullName}</strong><small>{item.id}</small></td><td><StatusBadge status={item.status} /></td><td>{enrollment ? <StatusBadge status={enrollment.status} /> : <span className={styles.muted}>Sem solicitação</span>}</td><td>{formatDate(item.updatedAt)}</td><td><a className={styles.smallAction} href={`${base}/beneficiarios/${item.id}`} onClick={(event) => { event.preventDefault(); navigate(`${base}/beneficiarios/${item.id}`); }}>Ver detalhes</a></td></tr>;
      })}</tbody></table></div> : <EmptyState title="Nenhum beneficiário encontrado" description="Tente outro termo de busca." />}
    </section>
  </>;
}

function BeneficiaryDetail({ beneficiary, enrollments, area, navigate }: { beneficiary?: Beneficiary; enrollments: Enrollment[]; area: Area; navigate: (to: string) => void }) {
  if (!beneficiary) return <EmptyState title="Beneficiário não encontrado" description="Este registro não está disponível nesta demonstração." action={<button className={styles.buttonSecondary} onClick={() => navigate(`/${area}/beneficiarios`)}>Voltar para beneficiários</button>} />;
  const related = enrollments.filter((item) => item.beneficiaryId === beneficiary.id);
  return <>
    <PageTitle eyebrow={area === 'admin' ? 'Administração' : 'Área do responsável'} title={beneficiary.fullName} description={`Registro ${beneficiary.id} · atualizado em ${formatDate(beneficiary.updatedAt)}`} actions={area === 'portal' && <button className={styles.buttonPrimary} onClick={() => navigate('/portal/matriculas/nova')}><FilePlus2 size={17} /> Solicitar matrícula</button>} />
    <div className={styles.contentGrid}>
      <section className={styles.panel}><div className={styles.panelHeading}><div><h2>Dados gerais</h2><p>Dados ilustrativos do beneficiário</p></div><StatusBadge status={beneficiary.status} /></div><dl className={styles.detailList}><div><dt>Nome completo</dt><dd>{beneficiary.fullName}</dd></div><div><dt>Data de nascimento</dt><dd>{formatDate(beneficiary.birthDate)}</dd></div><div><dt>Situação cadastral</dt><dd>{beneficiary.status}</dd></div><div><dt>Atualização cadastral</dt><dd>{formatDate(beneficiary.updatedAt)}</dd></div><div><dt>Responsável vinculado</dt><dd>{beneficiary.parentId === demoParent.id ? demoParent.name : 'Responsável demonstrativo'}</dd></div></dl></section>
      <section className={styles.panel}><div className={styles.panelHeading}><div><h2>Matrículas relacionadas</h2><p>Histórico separado da situação institucional</p></div></div>{related.length ? <div className={styles.activityList}>{related.map((item) => <button className={styles.activityItem} key={item.id} onClick={() => navigate(`/${area}/matriculas/${item.id}`)}><span className={styles.activityIcon}><ClipboardList size={17} /></span><span className={styles.activityText}><strong>{item.id}</strong><small>Solicitada em {formatDate(item.requestedAt)}</small></span><StatusBadge status={item.status} /><ArrowRight size={16} className={styles.rowArrow} /></button>)}</div> : <p className={styles.helperNote}>Nenhuma solicitação de matrícula vinculada.</p>}</section>
    </div>
  </>;
}

function BeneficiaryForm({ onSubmit, onCancel }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return <>
    <PageTitle eyebrow="Área do responsável" title="Cadastrar beneficiário" description="O cadastro é independente de uma solicitação de matrícula." />
    <form className={styles.panelForm} onSubmit={onSubmit}>
      <div className={styles.formSection}><h2>Dados pessoais</h2><p>Preencha apenas as informações demonstrativas solicitadas.</p><div className={styles.formGrid}>
        <label className={`${styles.field} ${styles.fieldWide}`}>Nome completo<input name="fullName" autoComplete="name" required maxLength={120} placeholder="Nome da criança ou adolescente" /></label>
        <label className={styles.field}>Data de nascimento<input name="birthDate" type="date" required max={new Date().toISOString().slice(0, 10)} /></label>
        <label className={styles.field}>Documento de identificação <span className={styles.optional}>(opcional nesta demonstração)</span><input name="document" maxLength={30} placeholder="Não informe dados reais" /></label>
      </div></div>
      <div className={styles.formSection}><h2>Responsável</h2><p>Vínculo demonstrativo com o responsável conectado.</p><div className={styles.formGrid}><label className={styles.field}>Nome<input value={demoParent.name} readOnly /></label><label className={styles.field}>E-mail<input value={demoParent.email} readOnly /></label></div></div>
      <div className={styles.formFooter}><button type="button" className={styles.buttonSecondary} onClick={onCancel}>Cancelar</button><button type="submit" className={styles.buttonPrimary}><Check size={17} /> Salvar cadastro demonstrativo</button></div>
    </form>
  </>;
}

function EnrollmentForm({ beneficiaries, onSubmit, onCancel }: { beneficiaries: Beneficiary[]; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return <>
    <PageTitle eyebrow="Área do responsável" title="Solicitar matrícula" description="Escolha um beneficiário cadastrado e revise os dados antes de enviar." />
    {beneficiaries.length ? <form className={styles.panelForm} onSubmit={onSubmit}>
      <div className={styles.formSection}><h2>Beneficiário</h2><p>A solicitação será encaminhada para análise, sem aprovação automática.</p><label className={styles.field}>Selecione o beneficiário<select name="beneficiaryId" required defaultValue=""><option value="" disabled>Escolha uma opção</option>{beneficiaries.map((item) => <option value={item.id} key={item.id}>{item.fullName}</option>)}</select></label></div>
      <div className={styles.formSection}><h2>Informações da solicitação</h2><label className={styles.field}>Mensagem para a equipe <span className={styles.optional}>(opcional)</span><textarea name="message" rows={4} maxLength={500} placeholder="Compartilhe informações relevantes para a solicitação." /></label><p className={styles.helperNote}>Este ambiente não envia dados a um serviço nem armazena as alterações após recarregar.</p></div>
      <div className={styles.formFooter}><button type="button" className={styles.buttonSecondary} onClick={onCancel}>Cancelar</button><button type="submit" className={styles.buttonPrimary}><FilePlus2 size={17} /> Confirmar solicitação</button></div>
    </form> : <EmptyState title="Cadastre um beneficiário primeiro" description="A solicitação de matrícula requer um beneficiário já cadastrado." action={<a className={styles.buttonPrimary} href="/portal/beneficiarios/novo" onClick={(event) => { event.preventDefault(); window.history.pushState({}, '', '/portal/beneficiarios/novo'); window.dispatchEvent(new PopStateEvent('popstate')); }}>Cadastrar beneficiário</a>} />}
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
    <PageTitle eyebrow={isAdmin ? 'Administração' : 'Área do responsável'} title="Matrículas" description={isAdmin ? 'Pesquise, filtre e acompanhe solicitações demonstrativas.' : 'Acompanhe o status e as atualizações das suas solicitações.'} actions={!isAdmin && link('/portal/matriculas/nova', 'Nova solicitação', styles.buttonPrimary)} />
    <section className={styles.panel}>
      <div className={styles.toolbar}><label className={styles.searchBox}><Search size={18} /><span className={styles.visuallyHidden}>Pesquisar</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar por pessoa ou identificador" /></label><label className={styles.filterBox}><Filter size={17} /><span className={styles.visuallyHidden}>Filtrar por status</span><select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}><option>Todas</option>{enrollmentStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><button className={styles.sortButton} onClick={() => setSortNewest(!sortNewest)} type="button">Data {sortNewest ? '↓' : '↑'}</button><span className={styles.resultCount}>{filteredCount} solicitações</span></div>
      {enrollments.length ? <div className={styles.tableWrap}><table><thead><tr><th>Identificador</th><th>Beneficiário</th><th>Responsável</th><th>Solicitada em</th><th>Status</th><th>Atualizada em</th><th>Ações</th></tr></thead><tbody>{enrollments.map((item) => <tr key={item.id}><td><strong>{item.id}</strong></td><td>{relatedBeneficiary(item.beneficiaryId)?.fullName ?? '—'}</td><td>{item.parentName}</td><td>{formatDate(item.requestedAt)}</td><td><StatusBadge status={item.status} /></td><td>{formatDate(item.updatedAt)}</td><td><div className={styles.rowActions}>{link(`${isAdmin ? '/admin' : '/portal'}/matriculas/${item.id}`, 'Detalhes', styles.smallAction)}{isAdmin && <select className={styles.actionSelect} aria-label={`Ação para ${item.id}`} defaultValue="" disabled={actionsFor(item.status).length === 0} onChange={(event) => { if (event.target.value) onAction(item.id, event.target.value as Action); event.target.value = ''; }}><option value="" disabled>Ação</option>{actionsFor(item.status).map((action) => <option key={action}>{action}</option>)}</select>}</div></td></tr>)}</tbody></table></div> : <EmptyState title="Nenhuma solicitação encontrada" description={filteredCount ? 'Ajuste os filtros para ver outros resultados.' : 'Quando houver solicitações, elas aparecerão nesta lista.'} />}
      {filteredCount > 0 && <div className={styles.pagination}><span>Mostrando {Math.min((page - 1) * 5 + 1, filteredCount)}–{Math.min(page * 5, filteredCount)} de {filteredCount}</span><div><button type="button" aria-label="Página anterior" disabled={page <= 1} onClick={() => setPage(page - 1)}><ArrowLeft size={16} /></button><span>Página {page} de {maxPage}</span><button type="button" aria-label="Próxima página" disabled={page >= maxPage} onClick={() => setPage(page + 1)}><ArrowRight size={16} /></button></div></div>}
    </section>
  </>;
}

function EnrollmentDetail({ enrollment, beneficiary, area, newEnrollment, onAction, link }: { enrollment?: Enrollment; beneficiary?: Beneficiary; area: Area; newEnrollment: boolean; onAction: (id: string, action: Action) => void; link: (to: string, label: string, className?: string) => ReactNode }) {
  if (!enrollment) return <EmptyState title="Solicitação não encontrada" description="O identificador não corresponde a um registro desta demonstração." action={link(area === 'admin' ? '/admin/matriculas' : '/portal/matriculas', 'Voltar para matrículas', styles.buttonSecondary)} />;
  return <>
    <PageTitle eyebrow={area === 'admin' ? 'Análise administrativa' : 'Acompanhamento do responsável'} title={enrollment.id} description={`Solicitada em ${formatDate(enrollment.requestedAt)} · Beneficiário: ${beneficiary?.fullName ?? '—'}`} actions={area === 'admin' && actionsFor(enrollment.status).length > 0 && <div className={styles.actionGroup}>{actionsFor(enrollment.status).map((action) => <button key={action} className={action === 'Recusar' || action === 'Cancelar' ? styles.buttonDanger : styles.buttonSecondary} onClick={() => onAction(enrollment.id, action)}>{action}</button>)}</div>} />
    {newEnrollment && <div className={styles.successBanner}><Check size={18} /><span><strong>Solicitação registrada na demonstração.</strong> O identificador é {enrollment.id}; a solicitação ainda está “{enrollment.status}”.</span></div>}
    <div className={styles.contentGrid}>
      <section className={styles.panel}><div className={styles.panelHeading}><div><h2>Status e informações</h2><p>O status de aprovação não representa ingresso institucional.</p></div><StatusBadge status={enrollment.status} /></div><dl className={styles.detailList}><div><dt>Beneficiário</dt><dd>{beneficiary?.fullName ?? '—'}</dd></div><div><dt>Responsável</dt><dd>{enrollment.parentName}</dd></div><div><dt>Data da solicitação</dt><dd>{formatDate(enrollment.requestedAt)}</dd></div><div><dt>Última atualização</dt><dd>{formatDate(enrollment.updatedAt)}</dd></div>{enrollment.reviewNotes && <div><dt>Pendência / observação</dt><dd>{enrollment.reviewNotes}</dd></div>}</dl></section>
      <section className={styles.panel}><div className={styles.panelHeading}><div><h2>Histórico da solicitação</h2><p>Eventos da matrícula demonstrativa</p></div></div><ol className={styles.timeline}>{enrollment.history.map((event) => <li key={event.id}><span className={styles.timelineDot} /><div><time>{formatDate(event.date)}</time><p>{event.description}</p><small>{event.author}</small></div></li>)}</ol></section>
    </div>
  </>;
}

function TrackingPage({ area, beneficiaries, enrollments, navigate }: { area: Area; beneficiaries: Beneficiary[]; enrollments: Enrollment[]; navigate: (to: string) => void }) {
  const isAdmin = area === 'admin';
  const records = isAdmin ? beneficiaries : beneficiaries.filter((item) => item.parentId === demoParent.id);
  return <>
    <PageTitle eyebrow={isAdmin ? 'Administração' : 'Área do responsável'} title={isAdmin ? 'Acompanhamento institucional' : 'Acompanhamento'} description={isAdmin ? 'Consulte a situação institucional separadamente da aprovação de matrícula.' : 'Veja o histórico cronológico das solicitações e suas atualizações.'} />
    {isAdmin && <div className={styles.demoNotice}><Activity size={16} /><span>O status “Ativo” é um dado de demonstração separado da matrícula. Esta interface não registra ingresso, desligamento nem critérios institucionais reais.</span></div>}
    {isAdmin ? <section className={styles.panel}><div className={styles.tableWrap}><table><thead><tr><th>Beneficiário</th><th>Situação institucional</th><th>Status da matrícula</th><th>Última atualização</th><th><span className={styles.visuallyHidden}>Ação</span></th></tr></thead><tbody>{records.map((beneficiary) => {
      const enrollment = enrollments.filter((item) => item.beneficiaryId === beneficiary.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
      return <tr key={beneficiary.id}><td><strong>{beneficiary.fullName}</strong><small>{beneficiary.id}</small></td><td><StatusBadge status={beneficiary.status} /></td><td>{enrollment ? <StatusBadge status={enrollment.status} /> : <span className={styles.muted}>Sem solicitação</span>}</td><td>{formatDate(beneficiary.updatedAt)}</td><td><button className={styles.smallAction} type="button" onClick={() => navigate(`/admin/beneficiarios/${beneficiary.id}`)}>Ver histórico</button></td></tr>;
    })}</tbody></table></div></section>
      : records.length ? <div className={styles.trackingGrid}>{enrollments.map((enrollment) => {
        const beneficiary = records.find((item) => item.id === enrollment.beneficiaryId);
        if (!beneficiary) return null;
        const latestEvent = enrollment.history[enrollment.history.length - 1];
        return <article className={styles.panel} key={enrollment.id}><div className={styles.panelHeading}><div><h2>{beneficiary.fullName}</h2><p>{enrollment.id} · atualização em {formatDate(enrollment.updatedAt)}</p></div><StatusBadge status={enrollment.status} /></div><p className={styles.trackingUpdate}>{latestEvent?.description ?? 'Nenhuma atualização registrada.'}</p><small className={styles.muted}>Matrícula aprovada não equivale a ingresso institucional.</small><button className={styles.smallAction} type="button" onClick={() => navigate(`/portal/matriculas/${enrollment.id}`)}>Consultar histórico completo</button></article>;
      })}</div> : <EmptyState title="Nenhuma atualização disponível" description="As atualizações aparecerão aqui após o envio de uma solicitação." />}
  </>;
}

function Responsibles({ beneficiaries, enrollments }: { beneficiaries: Beneficiary[]; enrollments: Enrollment[] }) {
  const parents = [demoParent, { id: 'resp-002', name: 'Rogério Ferreira', email: 'rogerio.demo@email.com', phone: '(15) 99900-0002' }, { id: 'resp-003', name: 'Carla Santos', email: 'carla.demo@email.com', phone: '(15) 99900-0003' }, { id: 'resp-004', name: 'Fernanda Costa', email: 'fernanda.demo@email.com', phone: '(15) 99900-0004' }];
  const [search, setSearch] = useState('');
  const filtered = parents.filter((parent) => `${parent.name} ${parent.email}`.toLowerCase().includes(search.toLowerCase()));
  return <>
    <PageTitle eyebrow="Administração" title="Responsáveis" description="Consulte os contatos e os vínculos demonstrativos." />
    <section className={styles.panel}><div className={styles.toolbar}><label className={styles.searchBox}><Search size={18} /><span className={styles.visuallyHidden}>Pesquisar responsável</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar responsável" /></label><span className={styles.resultCount}>{filtered.length} responsáveis</span></div>
      <div className={styles.tableWrap}><table><thead><tr><th>Responsável</th><th>Contato</th><th>Situação</th><th>Beneficiários vinculados</th><th>Matrículas</th></tr></thead><tbody>{filtered.map((parent) => <tr key={parent.id}><td><strong>{parent.name}</strong><small>{parent.id}</small></td><td>{parent.email}<small>{parent.phone}</small></td><td><StatusBadge status="Ativo" /></td><td>{beneficiaries.filter((item) => item.parentId === parent.id).length}</td><td>{enrollments.filter((item) => item.parentName === parent.name).length}</td></tr>)}</tbody></table></div>
    </section>
  </>;
}

function Reports({ enrollments, beneficiaries }: { enrollments: Enrollment[]; beneficiaries: Beneficiary[] }) {
  const active = beneficiaries.filter((item) => item.status === 'Ativo').length;
  const discharged = beneficiaries.filter((item) => item.status === 'Desligado').length;
  const averageUpdateDays = enrollments.length
    ? Math.round(enrollments.reduce((sum, item) => {
      const elapsed = (Date.parse(item.updatedAt) - Date.parse(item.requestedAt)) / 86_400_000;
      return sum + Math.max(0, elapsed);
    }, 0) / enrollments.length)
    : 0;
  const statuses = enrollmentStatuses.map((status) => ({ status, count: enrollments.filter((item) => item.status === status).length })).filter((item) => item.count > 0);
  return <>
    <PageTitle eyebrow="Administração" title="Relatórios demonstrativos" description="Resumo ilustrativo com dados fictícios; não representa indicadores institucionais reais." />
    <div className={styles.statsGrid}><article className={styles.statCard}><span className={styles.statIcon}><Users size={19} /></span><span className={styles.statLabel}>Beneficiários ativos</span><strong>{active}</strong><small>registros de demonstração</small></article><article className={styles.statCard}><span className={styles.statIcon}><Users size={19} /></span><span className={styles.statLabel}>Desligados</span><strong>{discharged}</strong><small>históricos preservados</small></article><article className={styles.statCard}><span className={styles.statIcon}><ClipboardList size={19} /></span><span className={styles.statLabel}>Solicitações totais</span><strong>{enrollments.length}</strong><small>todos os status</small></article><article className={styles.statCard}><span className={styles.statIcon}><Clock3 size={19} /></span><span className={styles.statLabel}>Dias até atualização</span><strong>{averageUpdateDays}</strong><small>média fictícia desde a solicitação</small></article></div>
    <section className={styles.panel}><div className={styles.panelHeading}><div><h2>Matrículas por status</h2><p>Distribuição dos registros de demonstração</p></div></div><div className={styles.reportBars}>{statuses.map((item) => <div className={styles.reportRow} key={item.status}><span>{item.status}</span><span className={styles.barTrack}><span style={{ width: `${Math.max(5, (item.count / Math.max(enrollments.length, 1)) * 100)}%` }} /></span><strong>{item.count}</strong></div>)}</div></section>
    <section className={`${styles.panel} ${styles.reportIngress}`}><div className={styles.panelHeading}><div><h2>Ingressos por período</h2><p>Histórico institucional separado do status de matrícula</p></div></div><p>Nenhum evento de ingresso foi incluído nos dados demonstrativos; aprovação não foi contabilizada como ingresso.</p></section>
  </>;
}

function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className={styles.emptyState}><span><ClipboardList size={24} /></span><h2>{title}</h2><p>{description}</p>{action}</div>;
}
