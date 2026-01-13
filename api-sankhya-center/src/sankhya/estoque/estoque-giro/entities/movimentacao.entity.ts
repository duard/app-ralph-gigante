export class MovimentacaoSubgrupoEntity {
  codigo: number
  descricao: string
  entradas: number
  saidas: number
  saldo: number
  qtdMovimentacoesEntrada: number
  qtdMovimentacoesSaida: number
  giro: number
  classificacao: string

  constructor(partial: Partial<MovimentacaoSubgrupoEntity>) {
    Object.assign(this, partial)
  }
}

export class MovimentacoesEntity {
  codigoGrupo: number
  descricaoGrupo: string
  periodo: string
  dataInicio: Date
  dataFim: Date
  totalEntradas: number
  totalSaidas: number
  saldoGeral: number
  porSubgrupo: MovimentacaoSubgrupoEntity[]

  constructor(partial: Partial<MovimentacoesEntity>) {
    Object.assign(this, partial)
    this.porSubgrupo = partial.porSubgrupo || []
  }
}
