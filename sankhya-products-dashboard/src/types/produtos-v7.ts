// Types para Produtos V7 - Nova tela moderna de produtos

/**
 * Filtros disponíveis para a listagem de produtos
 */
export interface ProdutosV7Filters {
  // Filtros básicos
  search?: string // Busca em descrição, código, referência
  codgrupoprod?: number // Grupo de produto
  codlocal?: number // Local/Depósito
  ativo?: 'S' | 'N' | 'all' // Status do produto
  marca?: string // Marca do produto

  // Filtros toggles
  comEstoque?: boolean // Produtos com estoque > 0
  semEstoque?: boolean // Produtos com estoque = 0
  comControle?: boolean // Produtos controlados
  semControle?: boolean // Produtos não controlados
  comMovimento?: boolean // Produtos com vendas recentes
  semMovimento?: boolean // Produtos sem vendas

  // Paginação
  page: number
  perPage: number

  // Ordenação
  sortBy?: 'codprod' | 'descrprod' | 'estoqueTotal' | 'vlrunit' | 'marca'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Produto com estoque agregado de todos os locais
 */
export interface ProdutoV7 {
  // Identificação
  codprod: number
  descrprod: string
  referencia?: string
  marca?: string
  ativo: 'S' | 'N'

  // Grupo
  codgrupoprod?: number
  descrgrupoprod?: string

  // Estoque (agregado de todos os locais)
  estoqueTotal: number // Soma de estoque de todos locais
  reservadoTotal: number // Soma de reservado de todos locais
  disponivelTotal: number // estoqueTotal - reservadoTotal
  qtdLocais: number // Quantidade de locais onde está

  // Financeiro
  vlrunit?: number // Preço de venda
  custoMedio?: number // Custo médio
  valorEstoque?: number // estoqueTotal * custoMedio

  // Controle
  usacontrole?: 'S' | 'N'
  ncm?: string
  codvol?: string // Unidade (UN, KG, LT, etc)

  // Metadata
  dtinc?: string // Data de inclusão
  codusuinc?: number // Usuário que incluiu
  dtalter?: string // Data última alteração
}

/**
 * Estoque de um produto em um local específico
 */
export interface ProdutoLocal {
  codlocal: number
  descrlocal: string
  estoque: number
  reservado: number
  disponivel: number
  estmin?: number // Estoque mínimo
  estmax?: number // Estoque máximo
  situacao?: 'normal' | 'abaixo_minimo' | 'acima_maximo' | 'negativo'
}

/**
 * Métricas agregadas dos produtos
 */
export interface ProdutosV7Metrics {
  // Contadores
  total: number
  ativos: number
  inativos: number
  comEstoque: number
  semEstoque: number

  // Valores
  valorTotalEstoque: number // Soma de valorEstoque de todos produtos
  valorMedioUnitario: number // Média de vlrunit

  // Estoque
  estoqueTotal: number // Soma de estoqueTotal
  qtdTotalLocais: number // Total de locais com produtos

  // Controle
  comControle: number
  semControle: number

  // Movimento (se implementado)
  comMovimento?: number
  semMovimento?: number
}

/**
 * Response da listagem de produtos
 */
export interface ProdutosV7ListResponse {
  data: ProdutoV7[]
  total: number
  page: number
  perPage: number
  lastPage: number
  metrics?: ProdutosV7Metrics // Métricas podem vir junto
}

/**
 * Response de locais de um produto
 */
export interface ProdutoLocaisResponse {
  codprod: number
  descrprod: string
  locais: ProdutoLocal[]
  totais: {
    estoque: number
    reservado: number
    disponivel: number
    qtdLocais: number
  }
}

/**
 * Grupo de produtos (para select)
 */
export interface GrupoProduto {
  codgrupoprod: number
  descrgrupoprod: string
  ativo?: 'S' | 'N'
  qtdProdutos?: number // Quantidade de produtos neste grupo
}

/**
 * Local/Depósito (para select)
 */
export interface LocalEstoque {
  codlocal: number
  descrlocal: string
  ativo?: 'S' | 'N'
  qtdProdutos?: number // Quantidade de produtos neste local
}

/**
 * Opções do filtro de status
 */
export type StatusFilter = 'S' | 'N' | 'all'

/**
 * Labels para status
 */
export const STATUS_LABELS: Record<StatusFilter, string> = {
  S: 'Ativo',
  N: 'Inativo',
  all: 'Todos',
}

/**
 * Labels para situação de estoque
 */
export const SITUACAO_ESTOQUE_LABELS: Record<string, string> = {
  normal: 'Normal',
  abaixo_minimo: 'Abaixo do Mínimo',
  acima_maximo: 'Acima do Máximo',
  negativo: 'Estoque Negativo',
}

/**
 * Configuração padrão de filtros
 */
export const DEFAULT_FILTERS: ProdutosV7Filters = {
  page: 1,
  perPage: 50,
  ativo: 'all',
  sortBy: 'descrprod',
  sortOrder: 'asc',
}
