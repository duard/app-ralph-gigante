/**
 * Utilitário para tipos de movimento do Sankhya
 * Mapeamento dos códigos TIPMOV da tabela TGFCAB
 */

export const SANKHYA_TIPMOV = {
  // Comercial - Vendas (CAC)
  V: { codigo: 'V', descricao: 'Nota Fiscal', classe: 'br.com.sankhya.com.cac.Notas', categoria: 'VENDA' },
  P: { codigo: 'P', descricao: 'Pedido de Venda', classe: 'br.com.sankhya.com.cac.Pedidos', categoria: 'VENDA' },
  D: { codigo: 'D', descricao: 'Devolução de Venda', classe: 'br.com.sankhya.com.cac.Devolucoes', categoria: 'DEVOLUCAO' },
  A: { codigo: 'A', descricao: 'Conhecimento Transporte', classe: 'br.com.sankhya.com.cac.ConhecimentoTransporte', categoria: 'TRANSPORTE' },

  // Comercial - Compras/Faturamento (CAF)
  O: { codigo: 'O', descricao: 'Pedido de Compra', classe: 'br.com.sankhya.com.caf.Pedidos', categoria: 'COMPRA' },
  C: { codigo: 'C', descricao: 'Nota de Compra', classe: 'br.com.sankhya.com.caf.Notas', categoria: 'COMPRA' },
  E: { codigo: 'E', descricao: 'Devolução de Compra', classe: 'br.com.sankhya.com.caf.Devolucoes', categoria: 'DEVOLUCAO' },
  H: { codigo: 'H', descricao: 'CT-e de Compra', classe: 'br.com.sankhya.com.caf.ConhecimentoTransporte', categoria: 'TRANSPORTE' },

  // Controle de Almoxarifado/Inventário (CAI)
  T: { codigo: 'T', descricao: 'Transferência', classe: 'br.com.sankhya.com.cai.Transferencia', categoria: 'TRANSFERENCIA' },
  J: { codigo: 'J', descricao: 'Pedido de Requisição', classe: 'br.com.sankhya.com.cai.PedidosRequisicao', categoria: 'REQUISICAO' },
  Q: { codigo: 'Q', descricao: 'Requisição Interna', classe: 'br.com.sankhya.com.cai.Requisicao', categoria: 'REQUISICAO' },
  L: { codigo: 'L', descricao: 'Devolução de Requisição', classe: 'br.com.sankhya.com.cai.DevolucaoRequisicao', categoria: 'DEVOLUCAO' },

  // Produção (PROD)
  F: { codigo: 'F', descricao: 'Nota de Produção', classe: 'br.com.sankhya.prod.cac.NotaDeProducao', categoria: 'PRODUCAO' },
} as const

export type TipMov = keyof typeof SANKHYA_TIPMOV
export type CategoriaMov = 'VENDA' | 'COMPRA' | 'DEVOLUCAO' | 'TRANSPORTE' | 'TRANSFERENCIA' | 'REQUISICAO' | 'PRODUCAO'

/**
 * Retorna a descrição do tipo de movimento
 */
export function getDescricaoTipMov(tipmov: string): string {
  const tipo = SANKHYA_TIPMOV[tipmov as TipMov]
  return tipo?.descricao || `Tipo ${tipmov}`
}

/**
 * Retorna a categoria do tipo de movimento
 */
export function getCategoriaTipMov(tipmov: string): CategoriaMov | null {
  const tipo = SANKHYA_TIPMOV[tipmov as TipMov]
  return tipo?.categoria || null
}

/**
 * Retorna a classe Java do tipo de movimento
 */
export function getClasseTipMov(tipmov: string): string | null {
  const tipo = SANKHYA_TIPMOV[tipmov as TipMov]
  return tipo?.classe || null
}

/**
 * Verifica se o tipo de movimento é entrada de estoque
 */
export function isEntradaEstoque(tipmov: string): boolean {
  const entradas = ['C', 'O', 'L'] // Compra, Pedido de compra, Devolução de requisição
  return entradas.includes(tipmov)
}

/**
 * Verifica se o tipo de movimento é saída de estoque
 */
export function isSaidaEstoque(tipmov: string): boolean {
  const saidas = ['V', 'P', 'D', 'Q', 'J'] // Venda, Pedido, Devolução de venda, Requisição
  return saidas.includes(tipmov)
}

/**
 * Verifica se o tipo de movimento é transferência
 */
export function isTransferencia(tipmov: string): boolean {
  return tipmov === 'T'
}

/**
 * Verifica se o tipo de movimento é requisição interna (consumo)
 */
export function isRequisicaoInterna(tipmov: string): boolean {
  const requisicoes = ['Q', 'J'] // Requisição, Pedido de requisição
  return requisicoes.includes(tipmov)
}

/**
 * Retorna todos os tipos de uma categoria
 */
export function getTiposPorCategoria(categoria: CategoriaMov): typeof SANKHYA_TIPMOV[TipMov][] {
  return Object.values(SANKHYA_TIPMOV).filter((t) => t.categoria === categoria)
}

/**
 * Retorna mapa simplificado de código -> descrição
 */
export function getMapaTiposMovimento(): Record<string, string> {
  const mapa: Record<string, string> = {}
  for (const [codigo, info] of Object.entries(SANKHYA_TIPMOV)) {
    mapa[codigo] = info.descricao
  }
  return mapa
}
