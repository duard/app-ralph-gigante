export interface Tfpfun {
  [key: string]: any
  codfunc: number
  nomefunc?: string
  dtadm?: string
  dtdem?: string
  situacao?: string
  codcargo?: number
  coddep?: number
  codparc?: number
  codcargahor?: number
  codusu?: number
  // Calculated fields
  idade?: number
  diasNaEmpresa?: number
  cpfFormatado?: string
  situacaoLegivel?: string
  // Relations
  tfpcar?: {
    codcargo: number
    descrcargo: string
  }
  tfpdep?: {
    coddep: number
    descrdep: string
  }
  tsiusu?: {
    codusu: number
    nomeusu: string
    email?: string
    foto?: string
    ad_telefonecorp?: string
  }
  tgflar?: {
    codparc: number
    nomeparc: string
  }
  usuarioParceiro?: {
    codparc: number
    nomeparc: string
  }
  tfpcgh?: {
    codcargahor: number
    descrcargahor: string
  }
  tsicus?: {
    codcencus: number
    descrcencus: string
  }
  empresa?: {
    codemp: number
    nomefantasia: string
    cnpjFormatado: string
  }
  // Personal Data
  mae?: string
  pai?: string
  orgexpidentidade?: string
  pis?: string
  ctps?: {
    numero: string
    serie: string
    uf: string
  }
  escolaridade?: string
  estadoCivil?: string
  sexo?: string
  nacionalidade?: string
  naturalidade?: string
  // Contact & Address
  nomelogradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cep?: string
  codcid?: number
  nomecidade?: string
  uf?: string
  telefone?: string
  celular?: string
  email?: string

  // Manager
  gestor?: {
    nome: string
    codfunc: number
    cargo: string
    email: string
  }
}
