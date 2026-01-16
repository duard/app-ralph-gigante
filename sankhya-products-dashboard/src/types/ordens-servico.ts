// Interfaces baseadas nas tabelas reais do Sankhya

export interface OrdemServico {
  nuos: number
  dtabertura?: string
  dataini?: string
  datafin?: string
  previsao?: string
  status: 'F' | 'E' | 'A' | 'R' // Finalizada, Em Execução, Aberta, Reaberta
  tipo?: 'I' | 'E' // Interna, Externa
  manutencao?: 'C' | 'P' | 'O' // Corretiva, Preventiva, Outros
  codveiculo?: number
  codparc?: number
  codusuinc?: number
  km?: number
  horimetro?: number

  // Joins
  parceiro?: {
    codparc: number
    nomeparc: string
    telefone?: string
    email?: string
  }
  veiculo?: {
    codveiculo: number
    placa: string
    marcamodelo?: string
    ad_tipoeqpto?: string
    chassis?: string
    veiculo_km_total?: number
  }
  usuarioInclusao?: {
    codusu: number
    nomeusu: string
  }
  usuarioResponsavel?: {
    codusu: number
    nomeusu: string
  }

  // Campos calculados
  qtdServicos?: number
  qtdServicosFinalizados?: number
  diasManutencao?: number
  situacaoPrazo?: 'NO_PRAZO' | 'ATRASADO' | 'CRITICO'
}

export interface ServicoOS {
  nuos: number
  sequencia: number
  codprod?: number
  qtd?: number
  vlrunit?: number
  vlrtot?: number
  dataini?: string
  datafin?: string
  tempo?: number
  status: 'F' | 'E' | 'A' | 'R'
  observacao?: string

  produto?: {
    codprod: number
    descrprod: string
    referencia?: string
  }
}

export interface ApontamentoOS {
  nuos: number
  id: number
  sequencia: number
  codexec?: number
  dhini?: string
  dhfin?: string
  intervalo?: number

  // Calculados
  minutosTrabalhados?: number
  intervaloMinutos?: number
  minutosLiquidos?: number
  horasFormatadas?: string

  executor?: {
    codusu: number
    nomeusu: string
  }
  servicoDescricao?: string
}

export interface ProdutoOS {
  nuos: number
  sequencia: number
  codprod?: number
  codvol?: string
  qtdneg?: number
  vlrunit?: number
  vlrtot?: number
  observacao?: string

  produto?: {
    codprod: number
    descrprod: string
    referencia?: string
    codvol?: string
    marca?: string
  }
}

export interface OrdemServicoDetalhada extends OrdemServico {
  servicos?: ServicoOS[]
  produtos?: ProdutoOS[]
  apontamentos?: ApontamentoOS[]

  // Estatísticas calculadas
  totalHorasHomem?: number
  totalHorasLiquidas?: number
  totalProdutos?: number
  totalServicos?: number
  totalCusto?: number
  qtdExecutores?: number
}

export interface EstatisticasOS {
  totalOS: number
  finalizadas: number
  emExecucao: number
  abertas: number
  reabertas: number

  // Por tipo de manutenção
  preventivas: number
  corretivas: number
  outras: number

  // Tempos médios
  tempoMedioDias: number
  totalHorasHomem: number

  // Totais
  totalVeiculos: number
  totalExecutores: number
}

export interface OSAtiva {
  nuos: number
  codveiculo?: number
  placa?: string
  veiculo?: string
  status: 'E' | 'A'
  manutencao?: 'C' | 'P' | 'O'
  dataini?: string
  previsao?: string
  diasEmManutencao?: number
  situacao?: 'NO_PRAZO' | 'ATRASADO' | 'CRITICO'
  qtdServicos?: number
  servicosConcluidos?: number
  servicosEmAndamento?: number
  proximoServico?: string
}

export interface ProdutividadeExecutor {
  codexec: number
  nomeExecutor: string
  totalOS: number
  totalApontamentos: number
  totalMinutos: number
  totalHoras: number
  mediaMinutosPorApontamento: number
  eficiencia?: number
}

export interface ProdutoMaisUtilizado {
  codprod: number
  descrprod: string
  referencia?: string
  marca?: string
  descrgrupoprod?: string
  qtdOS: number
  qtdTotal: number
  valorTotal: number
  valorMedio: number
}

// Params e Responses
export interface OrdemServicoFindAllParams {
  status?: 'F' | 'E' | 'A' | 'R'
  manutencao?: 'C' | 'P' | 'O'
  tipo?: 'I' | 'E'
  codveiculo?: number
  dtInicio?: string
  dtFim?: string
  search?: string
  page?: number
  perPage?: number
  sort?: string
}

export interface OrdemServicoListResponse {
  data: OrdemServico[]
  total: number
  page: number
  perPage: number
  lastPage: number
}

// Helpers para labels
export const STATUS_LABELS: Record<string, string> = {
  F: 'Finalizada',
  E: 'Em Execução',
  A: 'Aberta',
  R: 'Reaberta',
}

export const MANUTENCAO_LABELS: Record<string, string> = {
  C: 'Corretiva',
  P: 'Preventiva',
  O: 'Outros',
}

export const TIPO_LABELS: Record<string, string> = {
  I: 'Interna',
  E: 'Externa',
}

export const SITUACAO_LABELS: Record<string, string> = {
  NO_PRAZO: 'No Prazo',
  ATRASADO: 'Atrasado',
  CRITICO: 'Crítico',
}
