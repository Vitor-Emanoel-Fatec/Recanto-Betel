import { ICreateParent } from "../../parent/dto/parent-create.dto.js"
import { ICreateAnamnese } from "../../anamnese/dto/anamnese-create.dto.js"

export interface ICreateBeneficiary {
    health_info_id?: string,
    user_id?: string,

    name: string,
    birthday: Date | string,
    rg: number,
    cpf: number,
    school: string,
    period: string,

    parents: ICreateParent[]
    anamnese: ICreateAnamnese
}