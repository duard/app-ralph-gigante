/**
 * Interface para indicadores de estoque
 */
export interface EstoqueIndicadores {
  // Produto
  codprod: number
  descrprod: string
  referencia?: string

  // Estoque atual
  quantidadeEstoque: number
  valorUnitario: number
  valorTotalEstoque: number

  // Movimentação
  quantidadeEntrada?: number
  quantidadeSaida?: number
  dataUltimaEntrada?: Date
  dataUltimaSaida?: Date

  // Giro de estoque
  diasEmEstoque?: number
  giroEstoque?: number // Quantas vezes o estoque gira por período

  // Alertas
  estoqueMinimo?: number
  estoqueMaximo?: number
  abaixoMinimo?: boolean
  acimaMaximo?: boolean

  // Controle de qualidade
  temContestacao?: boolean
  tituloContestacao?: string

  // Status
  produtoAtivo: boolean
  dataUltimaAlteracao: Date
}
