export class KardexEntity {
  codigo: number
  descricao: string
  codigoSubgrupo: number
  descricaoSubgrupo: string
  estoqueAtual: number
  estoqueMinimo?: number
  estoqueMaximo?: number
  totalEntradas: number
  totalSaidas: number
  saldoPeriodo: number
  giro: number
  classificacao: string

  constructor(partial: Partial<KardexEntity>) {
    Object.assign(this, partial)
  }
}

export class AlertaEstoqueEntity {
  tipo: 'CRITICO' | 'BAIXO' | 'ALTO' | 'NEGATIVO'
  codigoProduto: number
  descricaoProduto: string
  codigoSubgrupo: number
  descricaoSubgrupo: string
  valorAtual: number
  valorReferencia: number
  mensagem: string
  acaoSugerida?: string

  constructor(partial: Partial<AlertaEstoqueEntity>) {
    Object.assign(this, partial)
  }
}

export class DashboardSummaryEntity {
  totalProdutos: number
  totalEstoque: number
  valorEstoque: number
  produtosParados: number
  percentualParado: number
  produtosCriticos: number
  produtosBaixoEstoque: number
  produtosEquilibrados: number
  giroMedio: number
  classificacaoGeral: 'EXCELENTE' | 'BOM' | 'REGULAR' | 'RUIM'

  constructor(partial: Partial<DashboardSummaryEntity>) {
    Object.assign(this, partial)
  }
}
