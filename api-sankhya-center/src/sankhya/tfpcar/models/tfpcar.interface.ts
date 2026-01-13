export interface Tfpcar {
  codcargo: number
  descrcargo: string
  dtalter: Date
  codusu?: number
  codcbo?: number
  responsabilidades?: string
  obs?: string
  ativo: string
  codgrupocargo: number
  codcarreira?: number
  contagemtempo: string
  tecnicocientifico?: string
  codescala?: number
  origativ: number
  codnivelini?: number
  codnivelfim?: number
  dedicacaoexc: string
  aposentaesp: string
  possuinivel: string
  acumcargo?: number
  contagemesp?: number
  nrlei?: string
  dtlei?: Date
  sitcargo?: number
  usadoesocial: string
  tempoaso?: number
  adExigecn?: string
  adSalbase?: number
  adCodemp?: number
  // Relations
  tfpcbo?: {
    codcbo: number
    descrcbo: string
  }
  tfpcrr?: {
    codcarreira: number
    descrcarreira: string
  }
  tfpgca: {
    codgrupocargo: number
    descrgrupocargo: string
  }
  tgpesc?: {
    codescala: number
    descrescala: string
  }
  tfpnivIni?: {
    codnivelini: number
    descrnivelini: string
  }
  tfpnivFim?: {
    codnivelfim: number
    descrnivelfim: string
  }
  tsiusu?: {
    codusu: number
    nomeusu: string
  }
  // Count of related employees
  funcionariosCount: number
}
