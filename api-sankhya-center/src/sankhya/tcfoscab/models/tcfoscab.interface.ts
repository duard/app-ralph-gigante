// Tabela Real: TCFOSCAB
export interface OrdemServico {
  nuos: number // PK
  dtabertura?: Date
  dataini?: Date // Data início dos trabalhos
  datafin?: Date // Data finalização
  previsao?: Date // Previsão de conclusão
  status: string // F=Finalizada, E=Em Execução, A=Aberta, R=Reaberta
  tipo?: string // I=Interna, E=Externa
  manutencao?: string // C=Corretiva, P=Preventiva, O=Outros, etc
  codveiculo?: number
  codparc?: number
  codusuinc?: number // Usuário que criou
  codusu?: number // Usuário responsável
  codusufinaliza?: number
  codusureabre?: number
  km?: number
  horimetro?: number
  codcencus?: number
  codempnegoc?: number
  codmotorista?: number
  nunota?: number
  codnat?: number
  codproj?: number
  codprod?: number
  codbem?: string
  osmanual?: number
  nuplano?: number
  automatico?: string
  dhalter?: Date

  // Campos customizados
  ad_datafinal?: Date
  ad_nunotasolcompra?: number
  ad_statusgig?: string

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
  }
  usuarioInclusao?: {
    codusu: number
    nomeusu: string
  }
  usuarioResponsavel?: {
    codusu: number
    nomeusu: string
  }
  usuarioFinalizacao?: {
    codusu: number
    nomeusu: string
  }
}

// Tabela Real: TCFSERVOS (Serviços da OS)
export interface ServicoOS {
  nuos: number
  sequencia: number // PK composta
  codprod?: number
  qtd?: number
  vlrunit?: number
  vlrtot?: number
  dataini?: Date
  datafin?: Date
  tempo?: number
  status: string // F=Finalizado, E=Em Execução, A=Aberto, R=Reaberto
  observacao?: string
  nunota?: number
  seqnota?: number
  codparc?: number
  controle?: string
  ad_exibedash?: string

  // Join
  produto?: {
    codprod: number
    descrprod: string
    referencia?: string
  }
}

// Tabela Real: TCFSERVOSATO (Apontamentos de Tempo)
export interface ApontamentoOS {
  nuos: number
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
