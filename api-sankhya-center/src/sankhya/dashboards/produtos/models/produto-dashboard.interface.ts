/**
 * Interface para informações de produto no dashboard
 */
export interface ProdutoDashboard {
  codprod: number
  descrprod: string
  referencia?: string
  ativo: string
  codgrupoprod: number
  descrgrupoprod?: string
  // Campos calculados
  quantidadeEstoque?: number
  valorUnitario?: number
  valorTotalEstoque?: number
  dataUltimaAlteracao: Date
  // Campos para análise
  quantidadeVendida?: number
  valorVendido?: number
  margemLucro?: number
  // Indicadores
  estoqueBaixo?: boolean
  produtoAtivo?: boolean
}
