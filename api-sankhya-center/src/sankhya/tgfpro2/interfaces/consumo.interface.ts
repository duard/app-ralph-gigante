/**
 * Interface para movimentação de consumo de produtos
 */
export interface MovimentacaoConsumo {
  nunota: number // Número único da nota
  sequencia?: number // Sequência do item
  nunotaOrig?: number // Nota origem (se vier de TGFVAR)
  sequenciaOrig?: number // Sequência origem
  numnota?: string // Número da nota
  codemp?: number // Código da empresa
  codparc?: number // Código do parceiro
  nomeparc?: string // Nome do parceiro
  dtneg?: string // Data de negociação (YYYY-MM-DD)
  dtmov?: string // Data e hora do movimento
  statusnota?: string // Status da nota (A/L/P)
  statusnotaDescr?: string // Descrição do status
  codtipoper?: number // Código do tipo de operação
  descrtipoper?: string // Descrição do tipo de operação
  atualizaEstoque?: string // Como atualiza estoque (B/E/N/R)
  atualizaEstoqueDescr?: string // Descrição da atualização
  codusuinc?: number // Código do usuário que incluiu
  nomeusu?: string // Nome do usuário
  coddep?: number // Código do departamento
  descrDep?: string // Descrição do departamento
  codprod?: number // Código do produto
  descrprod?: string // Descrição do produto
  qtdneg?: number // Quantidade negociada
  vlrunit?: number // Valor unitário
  vlrtot?: number // Valor total
  codlocal?: number // Código do local
  descrlocal?: string // Descrição do local
}

/**
 * Interface para resumo de consumo por departamento
 */
export interface ConsumoResumoDepartamento {
  coddep?: number
  descrDep?: string
  totalMovimentacoes: number
  quantidadeTotal: number
  valorTotal: number
  primeiraMov?: string // Data da primeira movimentação
  ultimaMov?: string // Data da última movimentação
  produtos: {
    codprod: number
    descrprod?: string
    quantidade: number
    valor: number
    percentual: number
  }[]
}

/**
 * Interface para resumo de consumo por usuário
 */
export interface ConsumoResumoUsuario {
  codusuinc: number
  nomeusu?: string
  totalMovimentacoes: number
  quantidadeTotal: number
  valorTotal: number
  primeiraMov?: string
  ultimaMov?: string
  departamentos: {
    coddep?: number
    descrDep?: string
    quantidade: number
    valor: number
  }[]
}

/**
 * Interface para consumo por produto
 */
export interface ConsumoProduto {
  codprod: number
  descrprod?: string
  referencia?: string
  marca?: string
  totalMovimentacoes: number
  quantidadeTotal: number
  valorMedio: number
  valorTotal: number
  primeiraMov?: string
  ultimaMov?: string
  departamentos: {
    coddep?: number
    descrDep?: string
    quantidade: number
    percentual: number
  }[]
  usuarios: {
    codusuinc: number
    nomeusu?: string
    quantidade: number
    percentual: number
  }[]
}

/**
 * Interface para análise de período
 */
export interface ConsumoAnalise {
  periodo: {
    inicio: string
    fim: string
    dias: number
  }
  totais: {
    movimentacoes: number
    produtos: number
    departamentos: number
    usuarios: number
    quantidadeTotal: number
    valorTotal: number
  }
  topProdutos: {
    codprod: number
    descrprod?: string
    quantidade: number
    valor: number
    percentual: number
  }[]
  topDepartamentos: {
    coddep?: number
    descrDep?: string
    quantidade: number
    valor: number
    percentual: number
  }[]
  topUsuarios: {
    codusuinc: number
    nomeusu?: string
    quantidade: number
    valor: number
    percentual: number
  }[]
  evolucaoDiaria?: {
    data: string
    movimentacoes: number
    quantidade: number
    valor: number
  }[]
}
