// Tabela Real: TCFOSE (ordens de serviço)
export interface OrdemServico {
  numose: number // PK - Número da OS
  dtabertura?: Date // Data de abertura
  dtpreventrega?: Date // Previsão de entrega
  dtencerramento?: Date // Data de encerramento
  dtinclusao?: Date // Data de inclusão no sistema
  status: string // Status da OS (A=Aberta, E=Em Execução, C=Concluída, etc)
  tipo?: string // Tipo de OS
  codparc?: number // Código do parceiro/cliente
  codequip?: number // Código do equipamento
  codtec?: number // Código do técnico responsável
  codusu?: number // Código do usuário que incluiu
  prioridade?: number // Prioridade (1-5)
  defeito?: string // Descrição do defeito
  solucao?: string // Descrição da solução
  observacao?: string // Observações gerais
  vlrtotal?: number // Valor total da OS

  // Joins
  parceiro?: {
    codparc: number
    nomeparc: string
    telefone?: string
    email?: string
  }
  tecnico?: {
    codusu: number
    nomeusu: string
  }
  usuario?: {
    codusu: number
    nomeusu: string
  }
  equipamento?: {
    codequip: number
    descricao: string
    modelo?: string
    numserie?: string
  }
}

// Tabela Real: TCFITE (Itens da OS - produtos/serviços)
export interface ItemOrdemServico {
  numose: number // FK para OS
  sequencia: number // PK composta
  codprod?: number // Código do produto/serviço
  qtdneg?: number // Quantidade
  vlrunit?: number // Valor unitário
  vlrtotal?: number // Valor total
  tipo?: string // Tipo do item (P=Produto, S=Serviço, etc)
  observacao?: string // Observações

  // Join
  produto?: {
    codprod: number
    descrprod: string
    referencia?: string
    codvol?: string
  }
}

// Tabela Real: TCFSERVOS (Serviços da OS) - mantido para compatibilidade
export interface ServicoOS extends ItemOrdemServico {}

// Tabela Real: TCFMOV (Movimentações/Histórico da OS)
export interface MovimentacaoOS {
  nummov: number // PK - Número da movimentação
  numose: number // FK - Número da OS
  dtmov: Date // Data da movimentação
  codusumov?: number // Código do usuário que fez a movimentação
  statusant?: string // Status anterior
  statusnovo?: string // Status novo
  observacao?: string // Observações da movimentação

  // Join
  usuario?: {
    codusu: number
    nomeusu: string
  }
}

// Tabela Real: TCFSERVOSATO (Apontamentos de Tempo) - mantido para referência
export interface ApontamentoOS {
  numose: number
  id: number // PK
  sequencia: number
  codexec?: number // Executor/Colaborador
  dhini?: Date // Data/Hora Início
  dhfin?: Date // Data/Hora Fim
  intervalo?: number // Minutos ou HHMM
  status?: string
  dhapont?: Date
  ad_descr?: string // Descrição customizada

  // Calculados
  minutosTrabalhados?: number
  minutosLiquidos?: number
  horasFormatadas?: string
  horaHomem?: string

  // Join
  executor?: {
    codusu: number
    nomeusu: string
  }
}

// Tabela Real: TCFPRODOS (Produtos/Peças da OS)
export interface ProdutoOS {
  nuos: number
  sequencia: number
  codprod?: number
  codvol?: string
  codlocal?: number
  controle?: string
  qtdneg?: number
  vlrunit?: number
  vlrtot?: number
  observacao?: string
  nunota?: number
  seqnota?: number
  codparc?: number

  // Campos customizados
  ad_codgrupoprod?: number
  ad_nunotasol?: number
  ad_nunotareq?: number
  ad_codusu?: number
  ad_dtenvio?: Date
  ad_dtiniciogarant?: Date
  ad_dtifimgarant?: Date
  ad_dtretorno?: Date

  // Join
  produto?: {
    codprod: number
    descrprod: string
    referencia?: string
    codvol?: string
  }
}

// Interface completa com todos os dados
export interface OrdemServicoDetalhada extends OrdemServico {
  itens?: ItemOrdemServico[] // Itens da OS (produtos/serviços)
  movimentacoes?: MovimentacaoOS[] // Histórico de movimentações
  servicos?: ServicoOS[] // Mantido para compatibilidade
  produtos?: ProdutoOS[] // Mantido para compatibilidade
  apontamentos?: ApontamentoOS[]

  // Estatísticas calculadas
  totalHorasHomem?: number
  totalHorasLiquidas?: number
  totalProdutos?: number
  totalServicos?: number
  totalCusto?: number
  qtdExecutores?: number
}

// Para relatórios e estatísticas
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

// Para produtividade
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
