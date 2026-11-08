import { ICreateParent } from "../../parent/dto/parent-create.dto.js"
import { ICreateAnamnese } from "../../anamnese/dto/anamnese-create.dto.js"
import { ICreateRelativies } from "../../relativies/dto/relativies-create.dto.js"

interface Address {
  streetAddress: string,
  housing_number: number,
  neighborhood: string,
  landmark?: string,
  housingType: number,
  housingCost?: number,
  waterCost: number,
  powerCost: number,
  foodCost: number,
  gasCost: number
}

interface IncomeAndBenefits {
  id: string;
  nis: string | null;
  totalIncome: number;
  perCapitaIncome: number;
  hasGovernmentBenefit: boolean;
  benefitName: string | null;
  benefitValue: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthorizedEscorts {
  name: string,
  relation: number,
  contact: string
}

export interface ICreateBeneficiary {
    health_info_id?: string,
    user_id?: string,

    name: string,
    birthday: Date | string,
    rg: number,
    cpf: number,
    school: string,
    period: string,
    religion: string,

    incomeAndBenefits: IncomeAndBenefits,
    address: Address,
    parents: ICreateParent[],
    relativies?: ICreateRelativies[],
    authorizedEscorts?: AuthorizedEscorts[],
    anamnese: ICreateAnamnese
}