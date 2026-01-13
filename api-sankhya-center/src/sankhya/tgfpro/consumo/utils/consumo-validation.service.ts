import { Injectable, Logger } from '@nestjs/common'
import { BadRequestException, NotFoundException } from '@nestjs/common'

export interface ValidationResult {
  isValid: boolean
  warnings: string[]
  errors: string[]
  suggestions: string[]
}

export interface ConsumoValidationOptions {
  maxDiasPeriodo?: number
  minDiasPeriodo?: number
  maxMovimentacoes?: number
  validarSaldoNegativo?: boolean
  validarDataFutura?: boolean
}

@Injectable()
export class ConsumoValidationService {
  private readonly logger = new Logger(ConsumoValidationService.name)

  async validarConsultaConsumo(
    codprod: number,
    dataInicio: string,
    dataFim: string,
    options: ConsumoValidationOptions = {},
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      warnings: [],
      errors: [],
      suggestions: [],
    }

    await this.validarProduto(codprod, result)
    await this.validarPeriodo(dataInicio, dataFim, options, result)

    return result
  }

  async validarDadosConsumo(
    consumoData: any,
    options: ConsumoValidationOptions = {},
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      warnings: [],
      errors: [],
      suggestions: [],
    }

    await this.validarMovimentacoes(consumoData, options, result)
    await this.validarSaldos(consumoData, result)
    await this.validarMetricas(consumoData, result)
    await this.validarConsistencia(consumoData, result)

    return result
  }

  private async validarProduto(
    codprod: number,
    result: ValidationResult,
  ): Promise<void> {
    if (!codprod || codprod <= 0) {
      result.errors.push('Código do produto deve ser um número positivo')
      result.isValid = false
      return
    }

    if (codprod > 999999) {
      result.warnings.push(
        'Código de produto muito alto, verificar se está correto',
      )
    }

    const codigosProblema = [0, -1, 999999]
    if (codigosProblema.includes(codprod)) {
      result.errors.push(`Código de produto ${codprod} é inválido ou reservado`)
      result.isValid = false
    }
  }

  private async validarPeriodo(
    dataInicio: string,
    dataFim: string,
    options: ConsumoValidationOptions,
    result: ValidationResult,
  ): Promise<void> {
    const maxDias = options.maxDiasPeriodo || 365
    const minDias = options.minDiasPeriodo || 1

    const inicioRegex = /^\d{4}-\d{2}-\d{2}$/
    const fimRegex = /^\d{4}-\d{2}-\d{2}$/

    if (!inicioRegex.test(dataInicio)) {
      result.errors.push('Data início deve estar no formato YYYY-MM-DD')
      result.isValid = false
    }

    if (!fimRegex.test(dataFim)) {
      result.errors.push('Data fim deve estar no formato YYYY-MM-DD')
      result.isValid = false
    }

    if (!result.isValid) return

    const inicio = new Date(dataInicio)
    const fim = new Date(dataFim)

    if (isNaN(inicio.getTime())) {
      result.errors.push('Data início é inválida')
      result.isValid = false
    }

    if (isNaN(fim.getTime())) {
      result.errors.push('Data fim é inválida')
      result.isValid = false
    }

    if (!result.isValid) return

    if (fim < inicio) {
      result.errors.push('Data fim deve ser maior ou igual à data início')
      result.isValid = false
      return
    }

    const diffTime = Math.abs(fim.getTime() - inicio.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < minDias) {
      result.errors.push(`Período mínimo é de ${minDias} dia(s)`)
      result.isValid = false
    }

    if (diffDays > maxDias) {
      result.errors.push(`Período máximo permitido é de ${maxDias} dias`)
      result.isValid = false
    }

    if (options.validarDataFutura) {
      const hoje = new Date()
      if (fim > hoje) {
        result.warnings.push(
          'Data fim está no futuro - pode não haver dados completos',
        )
      }
    }

    if (diffDays > 180) {
      result.suggestions.push(
        'Período muito longo pode afetar performance. Considere consultar períodos menores.',
      )
    }

    if (diffDays < 7) {
      result.suggestions.push(
        'Período muito curto pode não ter dados suficientes para análise.',
      )
    }
  }

  private async validarMovimentacoes(
    consumoData: any,
    options: ConsumoValidationOptions,
    result: ValidationResult,
  ): Promise<void> {
    if (!consumoData.movimentacoes) {
      result.errors.push('Dados de movimentações não encontrados')
      result.isValid = false
      return
    }

    const totalMov =
      consumoData.totalMovimentacoes || consumoData.movimentacoes.length
    const maxMov = options.maxMovimentacoes || 1000

    if (totalMov > maxMov) {
      result.warnings.push(
        `Número de movimentações (${totalMov}) é muito alto e pode afetar performance`,
      )
    }

    if (totalMov === 0) {
      result.warnings.push('Nenhuma movimentação encontrada no período')
      result.suggestions.push(
        'Verifique se o período ou o produto estão corretos',
      )
    }

    if (Array.isArray(consumoData.movimentacoes)) {
      const movInvalidas = consumoData.movimentacoes.filter(
        (mov: any) => !mov.nunota || !mov.quantidadeMov,
      )

      if (movInvalidas.length > 0) {
        result.errors.push(
          `${movInvalidas.length} movimentações com dados inválidos`,
        )
        result.isValid = false
      }
    }
  }

  private async validarSaldos(
    consumoData: any,
    result: ValidationResult,
  ): Promise<void> {
    if (consumoData.saldoAnterior) {
      const saldoAnt = consumoData.saldoAnterior.saldoQtd || 0
      if (saldoAnt < 0) {
        result.warnings.push(
          'Saldo anterior negativo - verificar consistência dos dados',
        )
      }
    }

    if (consumoData.saldoAtual) {
      const saldoAtual = consumoData.saldoAtual.saldoQtdFinal || 0
      if (saldoAtual < 0) {
        result.warnings.push(
          'Saldo atual negativo - pode indicar problema no controle de estoque',
        )
        result.suggestions.push(
          'Verifique se há saídas não planejadas ou erros de lançamento',
        )
      }
    }

    if (consumoData.movimentoLiquido !== undefined) {
      const saldoAnt = consumoData.saldoAnterior?.saldoQtd || 0
      const saldoAtual = consumoData.saldoAtual?.saldoQtdFinal || 0
      const movimentoLiquidoCalculado = saldoAtual - saldoAnt

      if (
        Math.abs(consumoData.movimentoLiquido - movimentoLiquidoCalculado) >
        0.01
      ) {
        result.errors.push('Inconsistência no movimento líquido calculado')
        result.isValid = false
      }
    }
  }

  private async validarMetricas(
    consumoData: any,
    result: ValidationResult,
  ): Promise<void> {
    if (!consumoData.metrics) {
      result.warnings.push('Métricas não calculadas')
      return
    }

    const metrics = consumoData.metrics

    if (metrics.percentualConsumo !== undefined) {
      if (metrics.percentualConsumo < 0) {
        result.warnings.push('Percentual de consumo negativo - verificar dados')
      }

      if (metrics.percentualConsumo > 100) {
        result.warnings.push(
          'Percentual de consumo maior que 100% - pode indicar estoque negativo',
        )
      }

      if (metrics.percentualConsumo > 200) {
        result.errors.push(
          'Percentual de consumo extremamente alto - dados inconsistentes',
        )
        result.isValid = false
      }
    }

    if (metrics.diasEstoqueDisponivel !== undefined) {
      if (metrics.diasEstoqueDisponivel < 0) {
        result.warnings.push(
          'Dias de estoque disponível negativo - verificar cálculos',
        )
      }

      if (metrics.diasEstoqueDisponivel > 999) {
        result.warnings.push(
          'Dias de estoque disponível muito alto - produto com baixo giro',
        )
      }
    }

    if (metrics.mediaConsumoDia !== undefined && metrics.mediaConsumoDia < 0) {
      result.warnings.push(
        'Média de consumo por dia negativa - verificar dados',
      )
    }
  }

  private async validarConsistencia(
    consumoData: any,
    result: ValidationResult,
  ): Promise<void> {
    if (!consumoData.produto || !consumoData.produto.codprod) {
      result.errors.push('Dados do produto não encontrados')
      result.isValid = false
    }

    if (!consumoData.periodo) {
      result.errors.push('Dados do período não encontrados')
      result.isValid = false
    }

    if (consumoData.page !== undefined && consumoData.perPage !== undefined) {
      if (consumoData.page < 1) {
        result.errors.push('Número da página deve ser maior que 0')
        result.isValid = false
      }

      if (consumoData.perPage < 1 || consumoData.perPage > 100) {
        result.errors.push('Itens por página deve estar entre 1 e 100')
        result.isValid = false
      }
    }

    if (consumoData.saldoAtual?.localizacoes) {
      const localizacoes = consumoData.saldoAtual.localizacoes
      const totalEstoqueLocalizacoes = localizacoes.reduce(
        (sum: number, loc: any) => sum + (loc.estoque || 0),
        0,
      )

      const saldoAtual = consumoData.saldoAtual.saldoQtdFinal || 0

      if (Math.abs(totalEstoqueLocalizacoes - saldoAtual) > 0.1) {
        result.warnings.push('Soma das localizações não bate com o saldo atual')
      }
    }
  }

  gerarRelatorioValidacao(validation: ValidationResult): string {
    const lines: string[] = []

    lines.push('📋 RELATÓRIO DE VALIDAÇÃO')
    lines.push('='.repeat(40))

    if (validation.isValid) {
      lines.push('✅ Dados VALIDADOS com sucesso')
    } else {
      lines.push('❌ Dados INVÁLIDOS - correções necessárias')
    }

    if (validation.errors.length > 0) {
      lines.push('\n🚨 ERROS:')
      validation.errors.forEach((error, index) => {
        lines.push(`   ${index + 1}. ${error}`)
      })
    }

    if (validation.warnings.length > 0) {
      lines.push('\n⚠️  AVISOS:')
      validation.warnings.forEach((warning, index) => {
        lines.push(`   ${index + 1}. ${warning}`)
      })
    }

    if (validation.suggestions.length > 0) {
      lines.push('\n💡 SUGESTÕES:')
      validation.suggestions.forEach((suggestion, index) => {
        lines.push(`   ${index + 1}. ${suggestion}`)
      })
    }

    return lines.join('\n')
  }
}
