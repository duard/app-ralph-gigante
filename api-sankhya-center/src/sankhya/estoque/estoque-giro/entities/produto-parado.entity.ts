export class SubgrupoParadoEntity {
  codigo: number
  descricao: string
  totalParados: number
  comEstoque: number
  semEstoque: number

  constructor(partial: Partial<SubgrupoParadoEntity>) {
    Object.assign(this, partial)
  }
}

export class ProdutoParadoEntity {
  codigo: number
  descricao: string
  codigoSubgrupo: number
  descricaoSubgrupo: string
  marca?: string
  estoque: number | null
  totalEntrada: number
  totalSaida: number
  dataUltimaMovimentacao?: Date
  sugestao?: string

  constructor(partial: Partial<ProdutoParadoEntity>) {
    Object.assign(this, partial)
  }
}

export class ProdutosParadosEntity {
  codigoGrupo: number
  descricaoGrupo: string
  totalProdutosParados: number
  comEstoque: number
  semEstoque: number
  percentualParado: number
  porSubgrupo: SubgrupoParadoEntity[]
  produtos: ProdutoParadoEntity[]

  constructor(partial: Partial<ProdutosParadosEntity>) {
    Object.assign(this, partial)
    this.porSubgrupo = partial.porSubgrupo || []
    this.produtos = partial.produtos || []
  }
}
