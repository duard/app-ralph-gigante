export interface Tgfpar {
  [key: string]: any // Allow all fields for richness
  codparc: number
  nomeparc?: string
  razaosocial?: string
  nomefantasia?: string
  tippessoa?: string
  cliente?: string
  fornecedor?: string
  vendedor?: string
  ativo?: string
  codcid?: number
  codbai?: number
  cep?: string
  telefone?: string
  email?: string
  cgcCpf?: string
  inscricaoestadual?: string
  endereco?: string
  numero?: string
  bairro?: string
  // Relations
  tcicid?: {
    codcid: number
    nomeCid: string
  }
  tsibai?: {
    codbai: number
    nomebai: string
  }
  tsicus?: {
    codcencus: number
    descrcencus: string
  }
  tgpfis?: {
    codregfis: number
    descricao: string
  }
  tsiusu?: {
    codusu: number
    nomeusu: string
  }
}
