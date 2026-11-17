import { createHash } from 'node:crypto';

export const TERMS_CONTENT = [
  'Devo respeitar e cumprir as normas do Projeto Samaritano e incentivar meus filhos a cumpri-las.',
  'Estou ciente da importância de participar das convocações realizadas pela equipe.',
  'Autorizo o uso dos dados fornecidos para cadastro, análise e acompanhamento da solicitação.',
  'A aceitação da matrícula não representa ingresso institucional.',
].join(' ');

export const TERMS_VERSION = `sha256-${createHash('sha256').update(TERMS_CONTENT).digest('hex').slice(0, 16)}`;
