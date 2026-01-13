export interface Tfpdep {
  coddep: number
  descrdep: string
  codend?: number
  numend?: string
  complemento?: string
  codcencus: number
  codregfis?: number
  coddeppai: number
  grau: number
  analitico: string
  ativo: string
  codparc: number
  tipponto: string
  diaapuraponto: number
  tiplotacao: number
  tpinscprop?: number
  nrinscprop?: string
  usadoesocial: string
  nrinscontrat?: string
  tpinscontrat?: number
  codproj?: number
  dhalter: Date
  descrcencus?: string
  descrregfis?: string
  nomeparc?: string
  endereco?: string
  // Relations
  tsicus?: {
    codcencus: number
    descrcencus: string
  }
  tgpfis?: {
    codregfis: number
    descricao: string
  }
  tgfpar?: {
    codparc: number
    nomeparc: string
  }
  tsiend?: {
    codend: number
    nomeend: string
  }
  // Count of related employees
  funcionariosCount: number
}
