export interface ICreateBeneficiary {
    health_info_id?: string,
    user_id?: string,

    name: string,
    birthday: Date | string,
    rg: number,
    cpf: number,
    school: string,
    period: string,

    parent_name: string,
    parent_cpf: number,
    relation_type: number,
    contact: string,
    email: string,
    profession?: string,
    educational_level: string,
    comertial_address: string,
    salary: number
}