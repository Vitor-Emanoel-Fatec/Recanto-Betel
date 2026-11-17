export interface IUpdateBeneficiary {
    name?: string,
    birthday?: Date,
    rg?: number,
    cpf?: string,
    school?: string,
    period?: string,
    status?: 'PENDING' | 'APPROVED' | 'REJECTED'
}