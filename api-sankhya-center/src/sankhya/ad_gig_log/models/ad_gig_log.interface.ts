export interface AdGigLog {
  id: number
  acao?: string
  tabela?: string
  codusu?: number
  nomeusu?: string
  camposAlterados?: string
  versaoNova?: string
  versaoAntiga?: string
  dtcreated?: Date
  tsiusu?: {
    codusu: number
    nomeusu: string
    email?: string
  }
}
