import { BadRequestException } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

const fieldLabels: Record<string, string> = {
  accepted: 'Aceite dos termos',
  allergicProblems: 'Problemas alérgicos',
  allergiesDescription: 'Descrição das alergias',
  anamnese: 'Anamnese',
  anesthesiaProblems: 'Problemas com anestesia',
  arterialHypertension: 'Hipertensão arterial',
  authorizedEscorts: 'Acompanhantes autorizados',
  beneficiary_id: 'Beneficiário relacionado',
  benefitName: 'Nome do benefício',
  benefitValue: 'Valor do benefício',
  birthday: 'Data de nascimento',
  cpf: 'CPF',
  contact: 'Telefone para contato',
  declarationAccepted: 'Declaração',
  diabetes: 'Diabetes',
  diseaseDescription: 'Descrição da doença',
  educational_level: 'Escolaridade',
  email: 'E-mail',
  enrollment_id: 'Matrícula relacionada',
  familyHistory: 'Antecedentes familiares',
  foodCost: 'Gasto com alimentação',
  gasCost: 'Gasto com gás',
  attendingPhysicianName: 'Nome do médico assistente',
  attendingPhysicianPhone: 'Telefone do médico assistente',
  hasAllergies: 'Presença de alergias',
  hasGovernmentBenefit: 'Recebe benefício governamental',
  hasHadSurgery: 'Histórico de cirurgias',
  heartProblems: 'Problemas cardíacos',
  healingProblems: 'Problemas de cicatrização',
  hemorrhageProblems: 'Problemas com hemorragia',
  house_number: 'Número do endereço',
  housingCost: 'Gasto com moradia',
  housingType: 'Tipo de moradia',
  incomeAndBenefits: 'Renda e benefícios',
  isPregnant: 'Gravidez',
  kidneyProblems: 'Problemas renais',
  mainComplaintEvolution: 'Queixa principal e evolução',
  medicationDescription: 'Descrição da medicação',
  name: 'Nome',
  neighborhood: 'Bairro',
  nis: 'Número do NIS',
  otherInformation: 'Outras informações',
  parent: 'Responsável',
  perCapitaIncome: 'Renda per capita',
  period: 'Período',
  powerCost: 'Gasto com energia elétrica',
  profession: 'Profissão',
  relation: 'Parentesco',
  relation_type: 'Relacionamento com o beneficiário',
  relatives: 'Composição familiar',
  religion: 'Religião',
  responsibleSignature: 'Assinatura do responsável',
  salary: 'Renda mensal',
  school: 'Escola',
  streetAddress: 'Logradouro',
  story: 'Histórico do beneficiário',
  termsAccepted: 'Aceite dos termos',
  totalIncome: 'Renda total',
  underMedicalTreatment: 'Tratamento médico atual',
  usesMedication: 'Uso de medicação',
  waterCost: 'Gasto com água',
  landmark: 'Ponto de referência',
  rheumaticFever: 'Febre reumática',
  gastricProblems: 'Problemas gástricos',
  respiratoryProblems: 'Problemas respiratórios',
  jointRheumatismProblems: 'Problemas articulares ou reumatismo',
  surgeriesDescription: 'Descrição das cirurgias',
  rg: 'RG',
  isComplete: 'Conclusão da ficha',
  address: 'Endereço',
  beneficiary: 'Beneficiário',
  enrollment: 'Matrícula',
  status: 'Situação',
  id: 'Registro relacionado',
};

function labelFor(path: string): string {
  const parts = path.split('.');
  const property = parts.at(-1) ?? '';
  const group = parts.at(-2) ?? '';
  const index = /^\d+$/.test(group) ? Number(group) + 1 : undefined;
  const parentGroup = index === undefined ? group : parts.at(-3);
  const prefix = index === undefined
    ? ''
    : parentGroup === 'relatives'
      ? `Familiar ${index} - `
      : parentGroup === 'authorizedEscorts'
        ? `Acompanhante autorizado ${index} - `
        : '';

  if (property === 'name' && parts.includes('parent')) return `${prefix}Nome do responsável`.trim();
  if (property === 'name' && parts.includes('beneficiary')) return `${prefix}Nome do beneficiário`.trim();
  if (property === 'name' && parentGroup === 'relatives') return `${prefix}Nome`.trim();
  if (property === 'name' && parentGroup === 'authorizedEscorts') return `${prefix}Nome`.trim();
  if (property === 'address') return 'Endereço';
  if (property === 'authorizedEscorts') return 'Acompanhantes autorizados';
  if (property === 'id' || property.endsWith('_id')) return 'registro relacionado';

  const fieldLabel = fieldLabels[property];
  if (!fieldLabel) return 'este campo';
  if (prefix) return `${prefix}${fieldLabel.toLocaleLowerCase('pt-BR')}`;
  return fieldLabel;
}

function messageFor(path: string, constraint: string, value: string): string {
  const label = labelFor(path);
  const fieldLabel = label === 'este campo' ? 'O campo informado' : `O campo ${label}`;
  const parameter = value.match(/\b(?:equal to|less than|greater than)\s+(-?\d+(?:\.\d+)?)/i)?.[1]
    ?? value.match(/\b(-?\d+(?:\.\d+)?)\s+characters?\b/i)?.[1];
  switch (constraint) {
    case 'isDefined':
    case 'isNotEmpty':
      return label === 'este campo'
        ? 'Preencha os campos obrigatórios do formulário.'
        : `O campo ${label} é obrigatório.`;
    case 'isEmail':
      return 'Informe um e-mail válido.';
    case 'isDateString':
      return `Informe uma data válida para ${label}.`;
    case 'minLength':
      return parameter
        ? `${fieldLabel} deve possuir pelo menos ${parameter} caracteres.`
        : `${fieldLabel} deve possuir mais caracteres.`;
    case 'maxLength':
      return parameter
        ? `${fieldLabel} deve possuir no máximo ${parameter} caracteres.`
        : `${fieldLabel} excedeu o limite de caracteres.`;
    case 'min':
      return parameter
        ? `${fieldLabel} deve ser igual ou maior que ${parameter}.`
        : label === 'este campo' ? 'O valor informado está abaixo do permitido.' : `O valor de ${label} está abaixo do permitido.`;
    case 'max':
      return parameter
        ? `${fieldLabel} deve ser igual ou menor que ${parameter}.`
        : label === 'este campo' ? 'O valor informado ultrapassou o limite permitido.' : `O valor de ${label} ultrapassou o limite permitido.`;
    case 'isBoolean':
      return `Informe uma opção válida para ${label}.`;
    case 'isInt':
    case 'isNumber':
      return `Informe um valor numérico válido para ${label}.`;
    case 'isString':
      return `Informe um texto válido para ${label}.`;
    case 'isUUID':
      return 'O registro relacionado não foi reconhecido.';
    case 'matches':
      return `Informe um valor válido para ${label}.`;
    case 'equals':
      return 'É necessário aceitar os termos para continuar.';
    case 'isArray':
      return `Informe os itens de ${label} corretamente.`;
    case 'whitelistValidation':
      return 'O formulário contém informações não reconhecidas. Atualize a página e tente novamente.';
    default:
      return label === 'este campo'
        ? 'Revise os dados informados e tente novamente.'
        : `Revise o campo ${label} e tente novamente.`;
  }
}

function collectErrors(
  errors: ValidationError[],
  parentPath = '',
): Array<{ field: string; message: string }> {
  return errors.flatMap((error) => {
    const path = parentPath ? `${parentPath}.${error.property}` : error.property;
    const ownErrors = Object.entries(error.constraints ?? {}).map(([constraint, value]) => ({
      field: path,
      message: messageFor(path, constraint, value),
    }));
    return [...ownErrors, ...collectErrors(error.children ?? [], path)];
  });
}

export function createValidationException(errors: ValidationError[]): BadRequestException {
  const validationErrors = collectErrors(errors);
  return new BadRequestException({
    statusCode: 400,
    error: 'Bad Request',
    message: validationErrors.length
      ? validationErrors.map(({ message }) => message)
      : ['Revise os dados informados e tente novamente.'],
    fields: validationErrors.map(({ field }) => field),
  });
}
