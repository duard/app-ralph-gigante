/**
 * Interface para representar uma instância do dicionário de dados (TDDINS)
 * Contém informações sobre as instâncias/telas do sistema Sankhya
 */
export interface Tddins {
  /** Indica se a instância é adicional */
  adicional?: string
  /** Indica se a instância está ativa */
  ativo?: string
  /** Categoria da instância */
  categoria?: string
  /** Definição da instância */
  definicaoinst?: string
  /** Descrição da instância */
  descrinstancia?: string
  /** Descrição da tela */
  descr_tela?: string
  /** Expressão da instância */
  expressao?: string
  /** Filtro da instância */
  filtro?: string
  /** Indica se é biblioteca */
  islib?: string
  /** Nome da instância */
  nomeinstancia?: string
  /** Nome do script chave */
  nomescriptchave?: string
  /** Nome da tabela */
  nometab?: string
  /** Número da instância */
  nuinstancia?: number
  /** Número da instância externa */
  nuinstanciaext?: number
  /** Número da instância pai */
  nuinstanciapai?: number
  /** Indica se é raiz */
  raiz?: string
  /** ID do recurso */
  resourceid?: string
  /** Tipo do formulário */
  tipoform?: string
  /** Descrição da tabela relacionada */
  l0_descrtab?: string
}
