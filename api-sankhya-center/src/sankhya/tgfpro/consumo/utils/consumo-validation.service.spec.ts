import { Test, TestingModule } from '@nestjs/testing'
import {
  ConsumoValidationService,
  ValidationResult,
} from './consumo-validation.service'

describe('ConsumoValidationService', () => {
  let service: ConsumoValidationService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConsumoValidationService],
    }).compile()

    service = module.get<ConsumoValidationService>(ConsumoValidationService)
  })

  describe('validarConsultaConsumo', () => {
    it('deve validar consulta com sucesso', async () => {
      const result = await service.validarConsultaConsumo(
        3680,
        '2025-12-01',
        '2025-12-31',
        {},
      )

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('deve rejeitar código de produto inválido', async () => {
      const result = await service.validarConsultaConsumo(
        -1,
        '2025-12-01',
        '2025-12-31',
        {},
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'Código do produto deve ser um número positivo',
      )
    })

    it('deve rejeitar código de produto reservado', async () => {
      const result = await service.validarConsultaConsumo(
        0,
        '2025-12-01',
        '2025-12-31',
        {},
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'Código de produto 0 é inválido ou reservado',
      )
    })

    it('deve rejeitar data início inválida', async () => {
      const result = await service.validarConsultaConsumo(
        3680,
        'data-invalida',
        '2025-12-31',
        {},
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'Data início deve estar no formato YYYY-MM-DD',
      )
    })

    it('deve rejeitar data fim inválida', async () => {
      const result = await service.validarConsultaConsumo(
        3680,
        '2025-12-01',
        'data-invalida',
        {},
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'Data fim deve estar no formato YYYY-MM-DD',
      )
    })

    it('deve rejeitar período com data fim menor que início', async () => {
      const result = await service.validarConsultaConsumo(
        3680,
        '2025-12-31',
        '2025-12-01',
        {},
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'Data fim deve ser maior ou igual à data início',
      )
    })

    it('deve rejeitar período muito longo', async () => {
      const result = await service.validarConsultaConsumo(
        3680,
        '2025-01-01',
        '2025-12-31',
        { maxDiasPeriodo: 100 },
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Período máximo permitido é de 100 dias')
    })

    it('deve gerar avisos para código de produto alto', async () => {
      const result = await service.validarConsultaConsumo(
        9999999,
        '2025-12-01',
        '2025-12-31',
        {},
      )

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain(
        'Código de produto muito alto, verificar se está correto',
      )
    })

    it('deve gerar sugestões para período longo', async () => {
      const result = await service.validarConsultaConsumo(
        3680,
        '2025-01-01',
        '2025-12-31',
        {},
      )

      expect(result.isValid).toBe(true)
      expect(result.suggestions).toContain(
        'Período muito longo pode afetar performance. Considere consultar períodos menores.',
      )
    })

    it('deve gerar sugestões para período curto', async () => {
      const result = await service.validarConsultaConsumo(
        3680,
        '2025-12-01',
        '2025-12-02',
        {},
      )

      expect(result.isValid).toBe(true)
      expect(result.suggestions).toContain(
        'Período muito curto pode não ter dados suficientes para análise.',
      )
    })
  })

  describe('validarDadosConsumo', () => {
    const mockConsumoData = {
      produto: { codprod: 3680 },
      periodo: { totalDias: 30 },
      movimentacoes: [
        { nunota: 123, quantidadeMov: -5 },
        { nunota: 124, quantidadeMov: 3 },
      ],
      totalMovimentacoes: 2,
      saldoAnterior: { saldoQtd: 100 },
      saldoAtual: { saldoQtdFinal: 98 },
      movimentoLiquido: -2,
      metrics: {
        percentualConsumo: 2,
        diasEstoqueDisponivel: 290,
        mediaConsumoDia: 0.07,
      },
      page: 1,
      perPage: 50,
    }

    it('deve validar dados completos com sucesso', async () => {
      const result = await service.validarDadosConsumo(mockConsumoData, {})

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('deve rejeitar dados sem movimentações', async () => {
      const dataWithoutMov = { ...mockConsumoData, movimentacoes: null }

      const result = await service.validarDadosConsumo(dataWithoutMov, {})

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Dados de movimentações não encontrados')
    })

    it('deve rejeitar dados sem produto', async () => {
      const dataWithoutProduto = { ...mockConsumoData, produto: null }

      const result = await service.validarDadosConsumo(dataWithoutProduto, {})

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Dados do produto não encontrados')
    })

    it('deve rejeitar dados sem período', async () => {
      const dataWithoutPeriod = { ...mockConsumoData, periodo: null }

      const result = await service.validarDadosConsumo(dataWithoutPeriod, {})

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Dados do período não encontrados')
    })

    it('deve avisar sobre movimentações inválidas', async () => {
      const dataWithInvalidMov = {
        ...mockConsumoData,
        movimentacoes: [
          { nunota: null, quantidadeMov: -5 },
          { nunota: 124, quantidadeMov: 3 },
        ],
      }

      const result = await service.validarDadosConsumo(dataWithInvalidMov, {})

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('1 movimentações com dados inválidos')
    })

    it('deve avisar sobre número excessivo de movimentações', async () => {
      const dataWithManyMov = {
        ...mockConsumoData,
        totalMovimentacoes: 1500,
      }

      const result = await service.validarDadosConsumo(dataWithManyMov, {
        maxMovimentacoes: 1000,
      })

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain(
        'Número de movimentações (1500) é muito alto e pode afetar performance',
      )
    })

    it('deve avisar sobre nenhuma movimentação', async () => {
      const dataWithNoMov = {
        ...mockConsumoData,
        movimentacoes: [],
        totalMovimentacoes: 0,
      }

      const result = await service.validarDadosConsumo(dataWithNoMov, {})

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain(
        'Nenhuma movimentação encontrada no período',
      )
      expect(result.suggestions).toContain(
        'Verifique se o período ou o produto estão corretos',
      )
    })

    it('deve validar saldo anterior negativo', async () => {
      const dataWithNegativeSaldo = {
        ...mockConsumoData,
        saldoAnterior: { saldoQtd: -10 },
      }

      const result = await service.validarDadosConsumo(
        dataWithNegativeSaldo,
        {},
      )

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain(
        'Saldo anterior negativo - verificar consistência dos dados',
      )
    })

    it('deve validar saldo atual negativo', async () => {
      const dataWithNegativeCurrentSaldo = {
        ...mockConsumoData,
        saldoAtual: { saldoQtdFinal: -5 },
      }

      const result = await service.validarDadosConsumo(
        dataWithNegativeCurrentSaldo,
        {},
      )

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain(
        'Saldo atual negativo - pode indicar problema no controle de estoque',
      )
      expect(result.suggestions).toContain(
        'Verifique se há saídas não planejadas ou erros de lançamento',
      )
    })

    it('deve rejeitar movimento líquido inconsistente', async () => {
      const dataWithInconsistentMovement = {
        ...mockConsumoData,
        movimentoLiquido: -999,
      }

      const result = await service.validarDadosConsumo(
        dataWithInconsistentMovement,
        {},
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'Inconsistência no movimento líquido calculado',
      )
    })

    it('deve validar percentual de consumo extremo', async () => {
      const dataWithExtremePercent = {
        ...mockConsumoData,
        metrics: {
          ...mockConsumoData.metrics,
          percentualConsumo: 300,
        },
      }

      const result = await service.validarDadosConsumo(
        dataWithExtremePercent,
        {},
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'Percentual de consumo extremamente alto - dados inconsistentes',
      )
    })

    it('deve validar dias de estoque disponível negativos', async () => {
      const dataWithNegativeDays = {
        ...mockConsumoData,
        metrics: {
          ...mockConsumoData.metrics,
          diasEstoqueDisponivel: -10,
        },
      }

      const result = await service.validarDadosConsumo(dataWithNegativeDays, {})

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain(
        'Dias de estoque disponível negativo - verificar cálculos',
      )
    })

    it('deve validar paginação inválida', async () => {
      const dataWithInvalidPagination = {
        ...mockConsumoData,
        page: 0,
        perPage: 150,
      }

      const result = await service.validarDadosConsumo(
        dataWithInvalidPagination,
        {},
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Número da página deve ser maior que 0')
      expect(result.errors).toContain(
        'Itens por página deve estar entre 1 e 100',
      )
    })
  })

  describe('gerarRelatorioValidacao', () => {
    it('deve gerar relatório para validação bem-sucedida', () => {
      const validation: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: ['Aviso de teste'],
        suggestions: ['Sugestão de teste'],
      }

      const report = service.gerarRelatorioValidacao(validation)

      expect(report).toContain('✅ Dados VALIDADOS com sucesso')
      expect(report).toContain('⚠️  AVISOS:')
      expect(report).toContain('💡 SUGESTÕES:')
      expect(report).not.toContain('🚨 ERROS:')
    })

    it('deve gerar relatório para validação falhada', () => {
      const validation: ValidationResult = {
        isValid: false,
        errors: ['Erro de teste 1', 'Erro de teste 2'],
        warnings: [],
        suggestions: [],
      }

      const report = service.gerarRelatorioValidacao(validation)

      expect(report).toContain('❌ Dados INVÁLIDOS - correções necessárias')
      expect(report).toContain('🚨 ERROS:')
      expect(report).toContain('1. Erro de teste 1')
      expect(report).toContain('2. Erro de teste 2')
      expect(report).not.toContain('⚠️  AVISOS:')
    })

    it('deve gerar relatório completo com todas as seções', () => {
      const validation: ValidationResult = {
        isValid: false,
        errors: ['Erro crítico'],
        warnings: ['Aviso importante'],
        suggestions: ['Sugestão útil'],
      }

      const report = service.gerarRelatorioValidacao(validation)

      expect(report).toContain('📋 RELATÓRIO DE VALIDAÇÃO')
      expect(report).toContain('❌ Dados INVÁLIDOS - correções necessárias')
      expect(report).toContain('🚨 ERROS:')
      expect(report).toContain('⚠️  AVISOS:')
      expect(report).toContain('💡 SUGESTÕES:')
    })
  })
})
