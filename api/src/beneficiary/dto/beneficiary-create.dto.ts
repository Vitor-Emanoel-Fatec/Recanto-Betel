export interface ICreateBeneficiary {
    health_info_id?: string,
    name: string,
    birthday: Date | string,
    rg: number,
    cpf: number,
    school: string,
    period: string
}