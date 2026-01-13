import { EstoqueLocal } from './estoque-local.interface'

/**
 * Interface ProdutoKPI - KPIs e métricas completas de um produto
 * Baseado no PRD TGFPRO2-IMPLEMENTATION-GUIDE.md
 */
export interface ProdutoKPI {
  // ========== Informações básicas do produto ==========
  produto: {
    codprod: number
    descrprod: string
    marca?: string
    grupo: string
    unidade: string
  }

  // ========== Estoque detalhado por local ==========
  estoque: {
    /** Quantidade total em estoque (soma de todos os locais) */
    totalGeral: number

    /** Estoque detalhado por local */
    porLocal: EstoqueLocal[]

    /** Soma dos estoques mínimos de todos os locais */
    totalMin: number

    /** Soma dos estoques máximos de todos os locais */
    totalMax: number

    /** Status geral do estoque */
    statusGeral: 'NORMAL' | 'BAIXO' | 'CRITICO' | 'EXCESSO'

    /** Distribuição do estoque */
    distribuicao: {
      /** Quantidade de locais com estoque > 0 */
      locaisComEstoque: number

      /** Quantidade de locais com estoque abaixo do mínimo */
      locaisAbaixoMinimo: number

      /** Local com maior quantidade em estoque */
      localMaiorEstoque: {
        codlocal: number
        descrlocal: string
        quantidade: number
      }
    }
  }

  // ========== Informações financeiras ==========
  financeiro: {
    /** Preço unitário da última compra */
    precoUltimaCompra: number

    /** Data da última compra (YYYY-MM-DD) */
    dataUltimaCompra: string

    /** Nome do fornecedor da última compra */
    fornecedorUltimaCompra?: string

    /** Preço médio das últimas N compras */
    precoMedio: number

    /** Preço mínimo e máximo das últimas compras */
    precoMinMax: {
      min: number
      max: number
    }

    /** Preço Médio Móvel (PMM) atual */
    precoMedioMovel: number

    /** Valor total do estoque (quantidade * PMM) */
    valorTotalEstoque: number

    /** Valor do estoque por local (opcional) */
    valorPorLocal?: Array<{
      codlocal: number
      descrlocal: string
      valor: number
    }>

    /** Tendência de preço baseada nas últimas compras */
    tendenciaPreco: 'ALTA' | 'BAIXA' | 'ESTAVEL'
  }

  // ========== Consumo/Movimentação ==========
  consumo: {
    /** Consumo médio mensal (últimos N meses) */
    consumoMedioMensal: number

    /** Consumo detalhado por mês */
    ultimosMeses: Array<{
      mes: string // "YYYY-MM"
      quantidade: number
      valor: number
    }>

    /** Data estimada de esgotamento do estoque */
    previsaoEsgotamento: string | null // "YYYY-MM-DD" ou null se estoque suficiente

    /** Dias de estoque disponível (estoque / consumo médio diário) */
    diasEstoque: number
  }

  // ========== Giro de estoque ==========
  giro: {
    /** Giro de estoque (quantidade de rotações por ano) */
    giroEstoque: number

    /** Tempo médio que o produto fica em estoque (em dias) */
    tempoMedioEstoque: number

    /** Classificação ABC do produto */
    classificacaoABC: 'A' | 'B' | 'C'
  }
}
