/**
 * Interface para representar um campo do dicionário de dados (TDDCAM)
 * Contém informações sobre os campos das tabelas do sistema Sankhya
 */
export interface Tddcam {
  /** Indica se o campo é adicional */
  adicional?: string
  /** Tipo de apresentação do campo */
  apresentacao?: string
  /** Indica se o campo é calculado */
  calculado?: string
  /** Descrição do campo */
  descrcampo?: string
  /** Expressão para cálculo do campo */
  expressao?: string
  /** Máscara de formatação do campo */
  mascara?: string
  /** Nome do campo */
  nomecampo?: string
  /** Nome da tabela */
  nometab?: string
  /** Número sequencial do campo */
  nucampo?: number
  /** Ordem de exibição do campo */
  ordem?: number
  /** Indica se permite valor padrão */
  permitepadrao?: string
  /** Indica se permite pesquisa */
  permitepesquisa?: string
  /** Indica se é campo do sistema */
  sistema?: string
  /** Tamanho do campo */
  tamanho?: number
  /** Tipo do campo */
  tipcampo?: string
  /** Tipo de apresentação */
  tipoapresentacao?: string
  /** Indica se é visível no grid de pesquisa */
  visivelgridpesquisa?: string
}
