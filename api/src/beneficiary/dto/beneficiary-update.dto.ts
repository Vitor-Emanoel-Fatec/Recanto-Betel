export interface IUpdateBeneficiary {
    name?: string,
    birthday?: Date,
    rg?: number,
    cpf?: number,
    school?: string,
    period?: string,
    status?: 'PENDING' | 'APPROVED' | 'REJECTED'
}