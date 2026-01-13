/**
 * Interface para representar o estoque de um produto em um local específico
 * Baseado na tabela TGFEST do Sankhya
 */
export interface EstoqueLocal {
  /** Código do local de estoque */
  codlocal: number

  /** Descrição do local de estoque */
  descrlocal: string

  /** Nome do local pai na hierarquia (opcional) */
  localpai?: string

  /** Controle de lote/série (pode ser null ou string vazia) */
  controle: string | null

  /** Quantidade em estoque no local */
  quantidade: number

  /** Estoque mínimo configurado */
  estmin: number

  /** Estoque máximo configurado */
  estmax: number

  /** Status do estoque neste local */
  statusLocal: 'NORMAL' | 'BAIXO' | 'CRITICO' | 'EXCESSO'

  /** Percentual de ocupação em relação ao estoque máximo */
  percOcupacao: number
}
