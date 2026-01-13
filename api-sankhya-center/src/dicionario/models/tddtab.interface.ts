/**
 * Interface para representar uma tabela do dicionário de dados (TDDTAB)
 * Contém informações sobre as tabelas do sistema Sankhya
 */
export interface Tddtab {
  /** Indica se a tabela é adicional */
  adicional?: string
  /** Descrição da tabela */
  descrtab?: string
  /** Nome da tabela */
  nometab?: string
  /** Número do campo de numeração */
  nucamponumeracao?: number
  /** Tipo de numeração */
  tiponumeracao?: string
}
