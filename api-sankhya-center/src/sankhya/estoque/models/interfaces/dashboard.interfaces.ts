// Interfaces para dados agregados do dashboard de estoque

export interface EstoqueKpiData {
  total_produtos: number
  total_locais: number
  valor_total_estoque: number
  valor_total_reservado: number
  produtos_ativos: number
  produtos_inativos: number
  cobertura_estoque: number // percentual de produtos com saldo > 0
  rotatividade_media: number // giro médio do estoque
}

export interface EstoqueAnaliseData {
  distribuicao_por_status: {
    normal: number
    baixo: number
    critico: number
    alto: number
    sem_estoque: number
  }
  distribuicao_por_categoria: Array<{
    categoria: string
    quantidade_produtos: number
    valor_total: number
    percentual: number
  }>
  distribuicao_por_local: Array<{
    local: string
    quantidade_produtos: number
    valor_total: number
    percentual: number
  }>
  top_10_produtos_valor: Array<{
    codprod: number
    descrprod: string
    valor_total: number
    quantidade: number
    local_principal: string
  }>
}

export interface EstoqueLocalData {
  local: {
    codlocal: number
    nome: string
    endereco?: string
    responsavel?: string
  }
  metricas: {
    total_produtos: number
    produtos_com_saldo: number
    valor_total: number
    area_ocupada_percentual: number
    capacidade_maxima: number
  }
  produtos_criticos: Array<{
    codprod: number
    descrprod: string
    estoque: number
    estmin: number
    prioridade: 'CRITICA' | 'ALTA' | 'MEDIA'
  }>
  ultimas_movimentacoes: Array<{
    data: Date
    tipo: 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA'
    codprod: number
    descrprod: string
    quantidade: number
    valor_unitario: number
  }>
}

export interface EstoqueCategoriaData {
  categoria: {
    codgrupoprod: number
    descrgrupoprod: string
    tipo: 'ANALITICA' | 'SINTETICA'
  }
  metricas: {
    total_produtos: number
    produtos_com_saldo: number
    valor_total: number
    valor_medio_por_produto: number
    giro_medio: number
  }
  distribuicao_por_status: {
    normal: number
    baixo: number
    alto: number
    sem_estoque: number
  }
  produtos_mais_movimentados: Array<{
    codprod: number
    descrprod: string
    movimentacoes_ultimo_mes: number
    valor_movimentado: number
  }>
  previsao_demanda: {
    crescimento_previsto: number // percentual
    periodo: string // "próximos 30 dias"
    base_calculo: string
  }
}

export interface EstoqueQualidadeData {
  metricas_qualidade: {
    total_lotes: number
    lotes_ativos: number
    lotes_quarentena: number
    lotes_vencidos: number
    produtos_com_lote: number
    conformidade_qualidade: number // percentual
  }
  alertas_qualidade: Array<{
    tipo: 'VENCIMENTO_PROXIMO' | 'VENCIDO' | 'PUREZA_BAIXA' | 'GERMINACAO_BAIXA'
    codprod: number
    descrprod: string
    lote: string
    data_validade?: Date
    dias_para_vencer?: number
    percentual_atual?: number
    percentual_minimo?: number
    severidade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA'
  }>
  distribuicao_por_status_lote: Array<{
    status: string
    quantidade: number
    percentual: number
  }>
  produtos_mais_problemas: Array<{
    codprod: number
    descrprod: string
    total_alertas: number
    tipos_alertas: string[]
  }>
}

export interface EstoqueMovimentacaoData {
  resumo_periodo: {
    periodo: string
    entradas: number
    saidas: number
    transferencias: number
    ajustes: number
    total_movimentacoes: number
  }
  movimentacoes_por_tipo: Array<{
    tipo: string
    quantidade: number
    valor_total: number
    percentual: number
  }>
  movimentacoes_por_dia: Array<{
    data: string
    entradas: number
    saidas: number
    saldo_diario: number
  }>
  produtos_mais_movimentados: Array<{
    codprod: number
    descrprod: string
    total_movimentado: number
    valor_total: number
    ranking: number
  }>
  eficiencia_logistica: {
    tempo_medio_processamento: number // minutos
    taxa_erro_picking: number // percentual
    produtividade_por_hora: number
    utilizacao_capacidade: number // percentual
  }
}

export interface EstoqueRankingData {
  ranking_por_valor: Array<{
    posicao: number
    codprod: number
    descrprod: string
    valor_total: number
    percentual_total: number
    categoria: string
  }>
  ranking_por_quantidade: Array<{
    posicao: number
    codprod: number
    descrprod: string
    quantidade_total: number
    percentual_total: number
    unidade: string
  }>
  ranking_por_giro: Array<{
    posicao: number
    codprod: number
    descrprod: string
    indice_giro: number
    movimentacoes_mes: number
    classificacao: 'LENTO' | 'MEDIO' | 'RAPIDO' | 'MUITO_RAPIDO'
  }>
  ranking_por_rentabilidade: Array<{
    posicao: number
    codprod: number
    descrprod: string
    margem_lucro: number
    roi_mensal: number
    payback_days: number
  }>
  ranking_por_criticidade: Array<{
    posicao: number
    codprod: number
    descrprod: string
    indice_criticidade: number // 0-100
    fatores: {
      ruptura_recente: boolean
      fornecedor_unico: boolean
      alta_demanda: boolean
      prazo_entrega_longo: boolean
      custo_substituicao: 'BAIXO' | 'MEDIO' | 'ALTO'
    }
  }>
}

export interface EstoqueTendenciaData {
  tendencias_gerais: {
    crescimento_estoque_30_dias: number // percentual
    crescimento_estoque_90_dias: number // percentual
    previsao_estoque_30_dias: number
    sazonalidade_identificada: boolean
    periodo_sazonal: string
  }
  tendencias_por_categoria: Array<{
    categoria: string
    tendencia: 'CRESCENDO' | 'DECRESCENDO' | 'ESTAVEL'
    variacao_percentual: number
    confiabilidade_previsao: number // percentual
  }>
  analise_sazonal: {
    pico_demanda: {
      mes: string
      aumento_percentual: number
    }
    baixa_demanda: {
      mes: string
      queda_percentual: number
    }
    padrao_identificado: boolean
  }
  forecast_demanda: Array<{
    periodo: string // "2025-01", "2025-02", etc.
    demanda_prevista: number
    intervalo_confianca: {
      minimo: number
      maximo: number
    }
    base_calculo: string
  }>
}

export interface EstoqueAlertaData {
  alertas_criticos: Array<{
    id_alerta: string
    tipo:
      | 'RUPTURA_IMINENTE'
      | 'ESTOQUE_EXCESSIVO'
      | 'VENCIMENTO_PROXIMO'
      | 'QUALIDADE_COMPROMETIDA'
    severidade: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA'
    codprod: number
    descrprod: string
    local?: string
    lote?: string
    mensagem: string
    acao_recomendada: string
    prazo_acao: Date
    responsavel?: string
  }>
  resumo_alertas: {
    total_alertas: number
    criticos: number
    altos: number
    medios: number
    baixos: number
    por_tipo: Record<string, number>
  }
  alertas_por_local: Array<{
    codlocal: number
    nome_local: string
    total_alertas: number
    alertas_criticos: number
  }>
  alertas_por_categoria: Array<{
    codgrupoprod: number
    descrgrupoprod: string
    total_alertas: number
    alertas_criticos: number
  }>
}

export interface EstoqueValorData {
  resumo_financeiro: {
    valor_total_estoque: number
    valor_total_reservado: number
    valor_disponivel: number
    valor_minimo_recomendado: number
    valor_maximo_recomendado: number
    cobertura_valor: number // percentual
  }
  distribuicao_por_valor: {
    faixa_0_100: number
    faixa_100_1000: number
    faixa_1000_10000: number
    faixa_10000_mais: number
  }
  produtos_mais_valiosos: Array<{
    codprod: number
    descrprod: string
    valor_total: number
    percentual_total: number
    local_principal: string
    categoria: string
  }>
  analise_custo_beneficio: Array<{
    codprod: number
    descrprod: string
    custo_unitario: number
    preco_venda: number
    margem_bruta: number
    roi_anual: number
    payback_meses: number
    classificacao: 'EXCELENTE' | 'BOM' | 'REGULAR' | 'RUIM'
  }>
  comparativo_periodos: {
    periodo_atual: string
    periodo_anterior: string
    crescimento_valor: number
    crescimento_quantidade: number
    produtos_novos: number
    produtos_removidos: number
  }
}

export interface EstoqueDashboardData {
  // Dados consolidados para dashboard principal
  kpi_principal: EstoqueKpiData
  alertas_urgentes: Array<{
    tipo: string
    mensagem: string
    quantidade: number
    severidade: string
  }>
  tendencias_principais: {
    estoque_total: number
    variacao_7_dias: number
    variacao_30_dias: number
    previsao_7_dias: number
  }
  distribuicao_geografica: Array<{
    regiao: string
    valor_total: number
    percentual: number
    status: 'NORMAL' | 'ATENCAO' | 'CRITICO'
  }>
  top_categorias: Array<{
    categoria: string
    valor_total: number
    percentual: number
    tendencia: 'UP' | 'DOWN' | 'STABLE'
  }>
  resumo_operacional: {
    locais_ativos: number
    produtos_ativos: number
    movimentacoes_hoje: number
    eficiencia_picking: number
  }
}
