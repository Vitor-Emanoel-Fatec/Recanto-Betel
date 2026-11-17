// Dados institucionais e mock para Associação Recanto Betel (50 Anos)

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  badge?: string;
  highlight?: boolean;
}

export interface ServiceItem {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  targetAudience: string;
  schedule: string;
  highlights: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  category: 'Assistência Social' | 'Esporte e Lazer' | 'Educação' | 'Cultura';
  imageUrl: string;
  description: string;
  beneficiaries: string;
  location: string;
  fullStory: string;
  goals: string[];
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'Financeiro' | 'Jurídico' | 'Certificações';
  year: string;
  description: string;
  fileSize: string;
  fileType: string;
  downloadUrl: string;
}

export interface NewsItem {
  id: string;
  title: string;
  category: 'Institucional' | 'Projetos' | 'Parcerias' | 'Eventos';
  date: string;
  imageUrl: string;
  excerpt: string;
  content: string;
  readTime: string;
}

export interface RadioProgram {
  time: string;
  title: string;
  host: string;
  description: string;
}

// 1. Linha do Tempo (50 Anos)
export const TIMELINE_DATA: TimelineEvent[] = [
  {
    year: '1976',
    title: 'Fundação do Recanto Santa Cruz',
    description: 'Em 5 de agosto de 1976, nasce a instituição no Bairro Valinho, em Tatuí/SP, com a missão de acolher crianças e apoiar famílias em situação de vulnerabilidade.',
    badge: 'O Começo',
  },
  {
    year: '2005',
    title: 'Inscrição no CMAS de Tatuí',
    description: 'Reconhecimento institucional oficial pelo Conselho Municipal de Assistência Social de Tatuí, integrando a rede socioassistencial do município.',
    badge: 'Consolidação',
  },
  {
    year: '2012',
    title: 'Registro no CMDCA',
    description: 'Registro no Conselho Municipal dos Direitos da Criança e do Adolescente, ampliando o alcance das ações e fortalecendo a garantia de direitos fundamentais.',
    badge: 'Direitos Garantidos',
  },
  {
    year: '2025–2026',
    title: 'Renovação e Expansão',
    description: 'Renovação de parcerias estratégicas, captação para novos projetos, modernização das oficinas e início do projeto da nova quadra poliesportiva.',
    badge: 'Modernização',
  },
  {
    year: '2026',
    title: '50 Anos de Atuação Socioassistencial',
    description: 'Meio século de vidas transformadas, acolhimento ininterrupto e fortalecimento de vínculos comunitários em Tatuí e região. Um marco histórico de amor e cidadania.',
    badge: 'Jubileu de Ouro',
    highlight: true,
  },
];

// 2. Missão, Visão e Valores
export const INSTITUTIONAL_INFO = {
  mission: 'Ofertar serviços socioassistenciais de proteção social básica a crianças, adolescentes e famílias em situação de vulnerabilidade e risco social, promovendo convivência, desenvolvimento integral e autonomia.',
  vision: 'Consolidar-se como organização de referência na proteção socioassistencial de crianças e adolescentes em Tatuí e região, reconhecida pela excelência, transparência e acolhimento humano.',
  values: [
    'Respeito absoluto à dignidade humana',
    'Defesa intransigente dos direitos de crianças e adolescentes',
    'Equidade e justiça social',
    'Transparência ativa e ética na gestão',
    'Participação comunitária e fortalecimento de vínculos familiares',
  ],
  journeySteps: [
    {
      step: '01',
      title: 'Acolher',
      description: 'Criar espaços seguros, amorosos e inclusivos de convivência diária para crianças e adolescentes.',
      color: '#164B91',
    },
    {
      step: '02',
      title: 'Desenvolver',
      description: 'Estimular potencialidades por meio de educação, cultura, oficinas artísticas, esporte e reflexão.',
      color: '#79B98A',
    },
    {
      step: '03',
      title: 'Fortalecer',
      description: 'Apoiar as famílias com escuta qualificada, orientação socioassistencial e integração com a comunidade.',
      color: '#F4C542',
    },
    {
      step: '04',
      title: 'Transformar',
      description: 'Ampliar horizontes, preparar cidadãos conscientes e abrir novos caminhos para um futuro digno.',
      color: '#093273',
    },
  ],
};

// 3. Nossos Serviços
export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'acompanhamento-pedagogico',
    title: 'Acompanhamento Pedagógico',
    shortDesc: 'Apoio escolar personalizado, incentivo à leitura, reforço de aprendizagem e desenvolvimento do raciocínio lógico em contraturno escolar.',
    fullDesc: 'O Acompanhamento Pedagógico atua diretamente na superação das dificuldades escolares, proporcionando um ambiente propício ao estudo, pesquisa e desenvolvimento do prazer pelo conhecimento. Nossos educadores aplicam metodologias ativas e afetivas que valorizam a curiosidade natural das crianças.',
    iconName: 'BookOpen',
    targetAudience: 'Crianças e adolescentes de 6 a 15 anos matriculados na rede pública',
    schedule: 'Segunda a sexta-feira, em turmas matutinas e vespertinas',
    highlights: ['Reforço em Língua Portuguesa e Matemática', 'Biblioteca comunitária e hora da leitura', 'Jogos educativos e raciocínio lógico'],
  },
  {
    id: 'oficinas-socioculturais',
    title: 'Oficinas Socioculturais',
    shortDesc: 'Expressão artística, música, teatro, artesanato e manifestações culturais que estimulam a criatividade e a sensibilidade.',
    fullDesc: 'As oficinas socioculturais são pontes para o autoconhecimento e a convivência saudável. Crianças e jovens exploram instrumentos musicais, técnicas de pintura, artes cênicas e dança, fortalecendo sua identidade e autoestima.',
    iconName: 'Palette',
    targetAudience: 'Crianças e adolescentes atendidos pelo SCFV',
    schedule: 'Terças e quintas-feiras',
    highlights: ['Iniciação musical e percussão', 'Artes plásticas e reciclagem criativa', 'Apresentações culturais com a comunidade'],
  },
  {
    id: 'praticas-esportivas',
    title: 'Práticas Esportivas e de Lazer',
    shortDesc: 'Futsal, vôlei, recreação motora e dinâmicas cooperativas que ensinam disciplina, cooperação, respeito e vida saudável.',
    fullDesc: 'Mais do que atividade física, o esporte no Recanto Betel é ferramenta pedagógica de inclusão. Por meio de jogos coletivos, os educandos aprendem sobre convivência pacífica, trabalho em equipe e superação de limites.',
    iconName: 'Trophy',
    targetAudience: 'Grupos de 6 a 15 anos divididos por faixa etária',
    schedule: 'Segundas, quartas e sextas-feiras',
    highlights: ['Quadra poliesportiva equipada', 'Jogos cooperativos sem exclusão', 'Educação para saúde e movimento corporal'],
  },
  {
    id: 'saude-integral',
    title: 'Atenção à Saúde Integral',
    shortDesc: 'Segurança alimentar diária com refeições nutritivas, apoio socioemocional, hábitos de higiene e palestras de prevenção.',
    fullDesc: 'Garantimos suporte integral para o desenvolvimento físico e emocional dos educandos. Todos os dias são servidas refeições balanceadas orientadas por nutricionistas, além de rodas de conversa sobre saúde emocional e autocuidado.',
    iconName: 'HeartPulse',
    targetAudience: 'Todos os atendidos e suas famílias',
    schedule: 'Diário e permanente',
    highlights: ['Alimentação saudável e balanceada diária', 'Acompanhamento preventivo e odontológico em parceria', 'Rodas socioemocionais de acolhimento'],
  },
  {
    id: 'apoio-sociofamiliar',
    title: 'Orientação e Apoio Sociofamiliar',
    shortDesc: 'Escuta qualificada de assistentes sociais, visitas domiciliares, mediação de conflitos e encaminhamento à rede pública.',
    fullDesc: 'A família é o esteio do desenvolvimento da criança. Nossa equipe técnica de Serviço Social atua lado a lado com os responsáveis, oferecendo suporte em momentos de vulnerabilidade e facilitando o acesso a benefícios sociais do município.',
    iconName: 'Users',
    targetAudience: 'Pais e responsáveis das crianças atendidas',
    schedule: 'Atendimento contínuo mediante agendamento ou demanda espontânea',
    highlights: ['Plantão social e escuta afetiva', 'Visitas domiciliares de acompanhamento', 'Encaminhamentos aos CRAS, CREAS e rede de saúde'],
  },
  {
    id: 'acoes-comunitarias',
    title: 'Ações Comunitárias e de Convivência',
    shortDesc: 'Encontros de integração barrial, eventos comemorativos, feiras solidárias e espaços de diálogo com os moradores de Tatuí.',
    fullDesc: 'O Recanto Betel é um polo vivo do Bairro Valinho e de toda a cidade de Tatuí. Promovemos celebrações, palestras abertas e iniciativas conjuntas que fortalecem o senso de comunidade e cidadania participativa.',
    iconName: 'Building2',
    targetAudience: 'Moradores da Vila Paulina, Bairro Valinho e Tatuí em geral',
    schedule: 'Eventos mensais e sazonais',
    highlights: ['Festivais comunitários de convivência', 'Ações de conscientização cidadã', 'Abertura para parcerias e lideranças locais'],
  },
];

// 4. Nossos Projetos
export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: 'projeto-samaritano',
    title: 'Projeto Samaritano',
    category: 'Assistência Social',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    description: 'Acolhimento continuado e suporte básico para crianças e famílias em situação de extrema vulnerabilidade social na região do Valinho.',
    beneficiaries: '150+ famílias acompanhadas',
    location: 'Sede Recanto Betel — Tatuí/SP',
    fullStory: 'O Projeto Samaritano é o coração assistencial do Recanto Betel. Através dele, famílias recebem cestas de alimentos frescos, kits de higiene, orientação para acesso a programas sociais e acompanhamento próximo dos assistentes sociais, prevenindo situações de ruptura familiar.',
    goals: [
      'Garantia de segurança alimentar e nutricional mensal',
      'Mediação e acesso a benefícios eventuais da assistência social',
      'Rodas mensais de orientação e fortalecimento de vínculos parentais',
    ],
  },
  {
    id: 'quadra-poliesportiva',
    title: 'Projeto Quadra Poliesportiva',
    category: 'Esporte e Lazer',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    description: 'Espaço moderno multiuso para a prática de futsal, basquete, vôlei e atividades recreativas de integração para as crianças.',
    beneficiaries: '220+ crianças e jovens',
    location: 'Complexo Esportivo Recanto Betel',
    fullStory: 'A nova quadra poliesportiva foi viabilizada por meio de mobilização comunitária e emendas parlamentares em prol do terceiro setor. Oferece piso adequado, redes de proteção, iluminação noturna sustentável e material esportivo completo para treinos semanais.',
    goals: [
      'Desenvolvimento de disciplina, saúde física e espírito esportivo',
      'Treinos formativos em modalidades coletivas semanais',
      'Torneios amistosos de integração com escolas do município',
    ],
  },
  {
    id: 'scfv-fortalecendo-vinculos',
    title: 'SCFV — Convivência e Cidadania',
    category: 'Assistência Social',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    description: 'Serviço de Convivência e Fortalecimento de Vínculos com foco em direitos, cidadania, autonomia e convivência coletiva.',
    beneficiaries: '120 educandos diários',
    location: 'Salas multiuso e pátio pedagógico',
    fullStory: 'Em conformidade com a Tipificação Nacional dos Serviços Socioassistenciais (Resolução CNAS nº 109/2009), o SCFV desenvolve atividades em grupo que estimulam a troca de vivências, a valorização das diferenças e a proteção preventiva de crianças e adolescentes.',
    goals: [
      'Prevenção da ocorrência de situações de vulnerabilidade e risco social',
      'Estímulo à participação social e protagonismo infanto-juvenil',
      'Construção de planos de desenvolvimento individuais e coletivos',
    ],
  },
  {
    id: 'reforco-escolar-futuro',
    title: 'Reforço Escolar do Futuro',
    category: 'Educação',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    description: 'Laboratório de estudos com computadores, biblioteca viva e mediação pedagógica individualizada para alfabetização e letramento.',
    beneficiaries: '180 estudantes apoiados',
    location: 'Biblioteca Viva Recanto Betel',
    fullStory: 'Muitas crianças atendidas enfrentam defasagens no ciclo de alfabetização pós-período pandêmico. O projeto reúne recursos multimídia e acompanhamento atencioso para que nenhuma criança fique para trás em sua jornada escolar.',
    goals: [
      'Elevação dos índices de alfabetização e interpretação de texto',
      'Inclusão digital básica e uso seguro de ferramentas digitais',
      'Articulação estreita com as escolas municipais e estaduais de Tatuí',
    ],
  },
  {
    id: 'oficinas-culturais-tatuianas',
    title: 'Oficinas Culturais Tatuianas',
    category: 'Cultura',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    description: 'Iniciação musical, flauta doce, percussão e artes visuais honrando a vocação de Tatuí como Capital da Música.',
    beneficiaries: '90 participantes ativos',
    location: 'Estúdio Cultural Recanto Betel',
    fullStory: 'Tatuí é mundialmente reconhecida como a Cidade Ternura e Capital da Música pelo prestigiado Conservatório Dramático e Musical. Nosso projeto democratiza esse acesso, levando a sensibilidade musical para crianças que sonham tocar e cantar.',
    goals: [
      'Iniciação instrumental com flauta, teclado e percussão básica',
      'Desenvolvimento do ritmo, concentração e escuta sensível',
      'Apresentações abertas para pais e comunidade nos finais de semestre',
    ],
  },
  {
    id: 'horta-comunitaria-nutrir',
    title: 'Horta Educativa & Sustentabilidade',
    category: 'Educação',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80',
    description: 'Aprendizado prático de cultivo orgânico de hortaliças, respeito à natureza e enriquecimento da merenda institucional.',
    beneficiaries: 'Todas as turmas e famílias',
    location: 'Canteiros Verdes — Espaço Ecológico Betel',
    fullStory: 'As crianças colocam as mãos na terra, aprendem sobre sementes, compostagem e ciclo da água. Os vegetais colhidos vão diretamente para o almoço e café das crianças, ensinando alimentação saudável na prática diária.',
    goals: [
      'Educação ambiental e conscientização sobre preservação ecológica',
      'Fornecimento de verduras e temperos 100% orgânicos para a cozinha',
      'Oficinas de compostagem doméstica com as famílias do bairro',
    ],
  },
];

// 5. Estatísticas de Impacto (50 Anos)
export const IMPACT_STATS = [
  {
    id: 'atendimentos',
    value: 2540400,
    formatted: '2.540.400',
    label: 'Atendimentos realizados',
    sublabel: 'Ações socioassistenciais acumuladas ao longo de meio século',
  },
  {
    id: 'anos',
    value: 50,
    formatted: '50',
    label: 'Anos de atuação',
    sublabel: 'História ininterrupta de dedicação e amor a Tatuí (1976-2026)',
  },
  {
    id: 'faixa-etaria',
    value: 15,
    formatted: '6–15',
    label: 'Faixa etária principal',
    sublabel: 'Crianças e adolescentes em contraturno escolar com acolhimento',
  },
  {
    id: 'fundacao',
    value: 1976,
    formatted: '1.976',
    label: 'Ano de fundação',
    sublabel: 'Fundada em 5 de agosto de 1976 no Bairro Valinho',
  },
];

// 6. Transparência Financeira
export const TRANSPARENCY_FINANCIAL = {
  year: '2025',
  totalRevenue2025: 'R$ 607.856,53',
  publicFunds2026: 'R$ 165.000,00',
  activeLegalInstruments: 3,
  expenseBreakdown: [
    { name: 'Recursos Humanos', percent: 42, color: '#093273', amount: 'R$ 255.299,74' },
    { name: 'Segurança Alimentar', percent: 22, color: '#79B98A', amount: 'R$ 133.728,43' },
    { name: 'Material Socioeducativo', percent: 14, color: '#F4C542', amount: 'R$ 85.099,91' },
    { name: 'Infraestrutura & Manutenção', percent: 12, color: '#164B91', amount: 'R$ 72.942,78' },
    { name: 'Saúde & Higiene', percent: 7, color: '#38A169', amount: 'R$ 42.549,95' },
    { name: 'Administração & Auditoria', percent: 3, color: '#94A3B8', amount: 'R$ 18.235,72' },
  ],
};

// 7. Biblioteca de Documentos Oficiais
export const DOCUMENTS_DATA: DocumentItem[] = [
  {
    id: 'doc-relatorio-2025',
    title: 'Relatório Anual de Atividades Socioassistenciais 2025',
    category: 'Financeiro',
    year: '2025',
    description: 'Demonstrativo consolidado de todos os atendimentos, oficinas, refeições servidas e metas atingidas no ano de 2025.',
    fileSize: '3.4 MB',
    fileType: 'PDF',
    downloadUrl: '#download-relatorio-2025',
  },
  {
    id: 'doc-balanco-2025',
    title: 'Balanço Patrimonial e DRE Consolidada — Exercício 2025',
    category: 'Financeiro',
    year: '2025',
    description: 'Prestação de contas contábil completa aprovada pelo Conselho Fiscal e registrada em cartório público.',
    fileSize: '1.8 MB',
    fileType: 'PDF',
    downloadUrl: '#download-balanco-2025',
  },
  {
    id: 'doc-termo-cmdca-2026',
    title: 'Termo de Colaboração CMDCA Tatuí nº 01/2026',
    category: 'Jurídico',
    year: '2026',
    description: 'Instrumento de parceria formalizado com o Fundo Municipal dos Direitos da Criança e do Adolescente.',
    fileSize: '2.1 MB',
    fileType: 'PDF',
    downloadUrl: '#download-termo-cmdca',
  },
  {
    id: 'doc-cmas-registro',
    title: 'Certificado de Inscrição no CMAS Tatuí — Renovação 2025-2027',
    category: 'Certificações',
    year: '2025',
    description: 'Registro regular no Conselho Municipal de Assistência Social atestando a conformidade dos serviços de Proteção Básica.',
    fileSize: '850 KB',
    fileType: 'PDF',
    downloadUrl: '#download-cmas',
  },
  {
    id: 'doc-plano-trabalho-2026',
    title: 'Plano de Trabalho e Aplicação de Recursos 2026',
    category: 'Jurídico',
    year: '2026',
    description: 'Detalhamento do cronograma de desembolso e indicadores pactuados para o exercício de 2026.',
    fileSize: '1.5 MB',
    fileType: 'PDF',
    downloadUrl: '#download-plano-2026',
  },
  {
    id: 'doc-certidao-negativa',
    title: 'Certidões Negativas de Débitos Federais, Estaduais e Trabalhistas',
    category: 'Certificações',
    year: '2026',
    description: 'Conjunto de CNDs vigentes comprovando a plena regularidade fiscal, trabalhista e previdenciária da associação.',
    fileSize: '920 KB',
    fileType: 'PDF',
    downloadUrl: '#download-cnd',
  },
];

// 8. Notícias Recentes
export const NEWS_DATA: NewsItem[] = [
  {
    id: 'noticia-50-anos',
    title: 'Associação Recanto Betel comemora 50 anos de fundação com homenagens em Tatuí',
    category: 'Institucional',
    date: '15 de Março de 2026',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Fundada em 1976 no Bairro Valinho, a entidade celebra meio século de proteção social com encontro festivo entre educadores, famílias e pioneiros.',
    content: 'Em comemoração ao Jubileu de Ouro de fundação, a Associação Recanto Betel reuniu voluntários, autoridades municipais e dezenas de famílias no Bairro Valinho. Durante o evento, foram relembradas as origens da instituição e homenageados os colaboradores pioneiros que tornaram possível essa história de amor e proteção às crianças de Tatuí.',
    readTime: '4 min de leitura',
  },
  {
    id: 'noticia-quadra-poliesportiva',
    title: 'Obras da nova Quadra Poliesportiva avançam para a fase final de acabamento',
    category: 'Projetos',
    date: '02 de Março de 2026',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Com pintura emborrachada e iluminação em LED, o novo espaço esportivo acolherá mais de 200 jovens em treinos de futsal e vôlei.',
    content: 'O projeto da Quadra Poliesportiva da Associação Recanto Betel atingiu 90% de conclusão. A instalação do piso especial e das traves permitirá o início imediato das novas turmas do projeto de contraturno escolar, promovendo a prática esportiva saudável e a convivência cidadã.',
    readTime: '3 min de leitura',
  },
  {
    id: 'noticia-renovacao-cmdca',
    title: 'Renovação do termo com o CMDCA viabiliza continuidade do SCFV em 2026',
    category: 'Parcerias',
    date: '20 de Fevereiro de 2026',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Parceria formal garante recursos para merenda, materiais pedagógicos e equipe técnica de assistência social ao longo de todo o ano letivo.',
    content: 'Foi assinada a renovação do Termo de Colaboração junto ao Conselho Municipal dos Direitos da Criança e do Adolescente de Tatuí. A pactuação orçamentária assegura o custeio de profissionais especializados e a ampliação das oficinas culturais para o contraturno escolar.',
    readTime: '2 min de leitura',
  },
  {
    id: 'noticia-alunos-destaque',
    title: 'Premiação Rosa de Saron 2026 reconhecerá evolução pedagógica dos educandos',
    category: 'Eventos',
    date: '10 de Fevereiro de 2026',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Programada para julho de 2026, a tradicional cerimônia celebra o esforço individual, frequência e companheirismo das turmas atendidas.',
    content: 'O Recanto Betel anunciou os preparativos da celebração anual "Rosa de Saron — Alunos Destaque 2026". Prevista para o dia 07/07/2026, a cerimônia homenageará crianças e adolescentes que demonstraram grande superação escolar, generosidade com os colegas e assiduidade.',
    readTime: '3 min de leitura',
  },
];

// 9. Web Rádio Betel
export const RADIO_INFO = {
  stationName: 'Web Rádio Recanto Betel',
  slogan: 'Comunicação, cultura e comunidade em sintonia.',
  currentTrack: 'Especial 50 Anos — Vozes e Memórias de Tatuí',
  isLive: true,
  listenerCount: 142,
  programs: [
    {
      time: '06:00',
      title: 'Cultura e Esporte no Ar',
      host: 'Equipe Socioeducativa',
      description: 'Música instrumental brasileira, dicas de saúde, poesia e novidades esportivas de Tatuí.',
    },
    {
      time: '12:00',
      title: 'Sintonize a Beleza de Tatuí',
      host: 'Educadores e Alunos',
      description: 'Entrevistas especiais, histórias dos 50 anos do Recanto Betel e participações das famílias.',
    },
    {
      time: '18:00',
      title: 'Do Estúdio para o Coração da Comunidade',
      host: 'Voz Comunitária',
      description: 'Reflexões sobre cidadania, fortalecimento de vínculos familiares e agenda dos próximos eventos.',
    },
  ],
};

// 10. Informações Institucionais e Contato
export const CONTACT_INFO = {
  name: 'Associação Recanto Betel',
  cnpj: '47.818.778/0001-76',
  pixKey: '47.818.778/0001-76',
  president: 'Patrícia Elaine Vieira Conquista',
  address: {
    street: 'Rua Prefeito Manoel Luiz da Silva Sá',
    number: '438',
    neighborhood: 'Vila Paulina / Valinho',
    city: 'Tatuí',
    state: 'SP',
    zipCode: '18270-010',
    full: 'Rua Prefeito Manoel Luiz da Silva Sá, 438 — Vila Paulina/Valinho, Tatuí/SP — CEP 18270-010',
  },
  phone: '(15) 3251-0000',
  whatsapp: '(15) 99876-5432',
  email: 'contato@recantobetel.org.br',
  hours: 'Segunda a Sexta, das 08:00 às 17:00',
  social: {
    facebook: 'https://www.facebook.com/recantobeteltatui',
    instagram: 'https://instagram.com/recantobeteltatui',
    youtube: 'https://youtube.com/@recantobeteltatui',
  },
  mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3663.228966779435!2d-47.8598!3d-23.3551!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDIxJzE4LjQiUyA0N8KwNTEnMzUuMyJX!5e0!3m2!1spt-BR!2sbr!4v1620000000000!5m2!1spt-BR!2sbr',
};

// 11. Parcerias Institucionais
export const PARTNERS_DATA = [
  {
    name: 'Prefeitura de Tatuí',
    type: 'Poder Executivo Municipal',
    description: 'Apoio institucional e integração com a rede municipal socioassistencial e de educação.',
  },
  {
    name: 'CMAS Tatuí',
    type: 'Conselho Municipal de Assistência Social',
    description: 'Inscrição regular nº 012/2005 para oferta continuada de Proteção Social Básica.',
  },
  {
    name: 'CMDCA Tatuí',
    type: 'Direitos da Criança e do Adolescente',
    description: 'Registro nº 008/2012 e fomento por meio do Fundo Municipal dos Direitos.',
  },
  {
    name: 'Secretaria de Assistência e Desenvolvimento Social',
    type: 'Gestão Pública',
    description: 'Articulação intersetorial com os CRAS e CREAS do município de Tatuí.',
  },
  {
    name: 'Ministério da Cultura / Lei Paulo Gustavo',
    type: 'Fomento Cultural Federal',
    description: 'Incentivo financeiro para realização de oficinas culturais de percussão e artes visuais.',
  },
  {
    name: 'Empresas Amigas do Recanto Betel',
    type: 'Setor Privado e Doadores',
    description: 'Comércio, indústrias da região e pessoas físicas comprometidas com a infância em Tatuí.',
  },
];
