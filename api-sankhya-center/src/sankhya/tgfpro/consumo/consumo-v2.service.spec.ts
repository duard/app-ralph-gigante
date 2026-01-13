import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ConsumoV2Service } from './consumo-v2.service'
import { ConsumoValidationService } from './utils/consumo-validation.service'
import { ProdutoCacheService } from './utils/produto-cache.service'
import { SankhyaApiService } from '../../shared/sankhya-api.service'

describe('ConsumoV2Service', () => {
  let service: ConsumoV2Service
  let sankhyaApiService: jest.Mocked<SankhyaApiService>
  let validationService: jest.Mocked<ConsumoValidationService>
  let cacheService: jest.Mocked<ProdutoCacheService>

  const mockProdutoInfo = {
    CODPROD: 3680,
    DESCRPROD: 'PAPEL SULFITE A4 500 FOLHAS',
    COMPLDESC: null,
    unidade: 'UN',
    ATIVO: 'S',
    TIPCONTEST: 'N',
  }

  const mockMovimentacoes = [
    {
      NUNOTA: 273279,
      DTNEG: '2025-12-26',
      DTENTSAI: '2025-12-26',
      TIPMOV: 'S',
      CODTIPOPER: 500,
      CODPARC: 0,
      CODCENCUS: 1,
      nome_parceiro: 'CONSUMIDOR INTERNO',
      usuario: 'ADMIN',
      OBSERVACAO: 'PAPEL SULFITE A4 500 FOLHAS PCM',
      obs_item: null,
      CONTROLE: null,
      QTDNEG: -3,
      QTDENTREGUE: -3,
      PENDENTE: 'N',
      qtd_pendente: 0,
      qtd_mov: -3,
      valor_mov: -15.9,
    },
  ]

  const mockLocalizacoes = [
    {
      codlocal: 105002,
      descricao: 'MATERIAL ESCRITORIO',
      controle: null,
      estoque: 153,
    },
  ]

  beforeEach(async () => {
    const mockSankhyaApiService = {
      executeQuery: jest.fn(),
      getTableSchema: jest.fn(),
      getTableRelations: jest.fn(),
      getPrimaryKeys: jest.fn(),
    } as any

    const mockValidationService = {
      validarConsultaConsumo: jest.fn(),
      validarDadosConsumo: jest.fn(),
      gerarRelatorioValidacao: jest.fn(),
    } as any

    const mockCacheService = {
      getProduto: jest.fn(),
      setProduto: jest.fn(),
      removeProduto: jest.fn(),
      clearCache: jest.fn(),
      getCacheStats: jest.fn(),
      preloadCommonProducts: jest.fn(),
    } as any

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsumoV2Service,
        {
          provide: SankhyaApiService,
          useValue: mockSankhyaApiService,
        },
        {
          provide: ConsumoValidationService,
          useValue: mockValidationService,
        },
        {
          provide: ProdutoCacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile()

    service = module.get<ConsumoV2Service>(ConsumoV2Service)
    sankhyaApiService = module.get(SankhyaApiService)
    validationService = module.get(ConsumoValidationService)
    cacheService = module.get(ProdutoCacheService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchProdutoInfo', () => {
    it('deve retornar produto do cache se disponível', async () => {
      cacheService.getProduto.mockResolvedValue(mockProdutoInfo as any)

      const result = await service.fetchProdutoInfo(3680)

      expect(result).toEqual(mockProdutoInfo)
      expect(cacheService.getProduto).toHaveBeenCalledWith(3680)
      expect(sankhyaApiService.executeQuery).not.toHaveBeenCalled()
    })

    it('deve buscar produto no banco se não estiver em cache', async () => {
      cacheService.getProduto.mockResolvedValue(null)
      sankhyaApiService.executeQuery.mockResolvedValue([mockProdutoInfo])
      cacheService.setProduto.mockResolvedValue()

      const result = await service.fetchProdutoInfo(3680)

      expect(result).toEqual(mockProdutoInfo)
      expect(cacheService.getProduto).toHaveBeenCalledWith(3680)
      expect(sankhyaApiService.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT CODPROD, DESCRPROD'),
        [],
      )
      expect(cacheService.setProduto).toHaveBeenCalledWith(
        3680,
        mockProdutoInfo,
      )
    })

    it('deve retornar null se produto não for encontrado', async () => {
      cacheService.getProduto.mockResolvedValue(null)
      sankhyaApiService.executeQuery.mockResolvedValue([])

      const result = await service.fetchProdutoInfo(999)

      expect(result).toBeNull()
      expect(cacheService.setProduto).not.toHaveBeenCalled()
    })
  })

  describe('fetchLocalizacoesEstoque', () => {
    it('deve retornar localizações formatadas', async () => {
      const mockEstoqueData = [
        {
          CODLOCAL: 105002,
          DESCRLOCAL: 'MATERIAL ESCRITORIO',
          CONTROLE: null,
          ESTOQUE: 153,
        },
        {
          CODLOCAL: 105003,
          DESCRLOCAL: 'ALMOXARIFADO',
          CONTROLE: 'LOT001',
          ESTOQUE: 50,
        },
      ]

      sankhyaApiService.executeQuery.mockResolvedValue(mockEstoqueData)

      const result = await service.fetchLocalizacoesEstoque(3680)

      expect(result).toEqual([
        {
          codlocal: 105002,
          descricao: 'MATERIAL ESCRITORIO',
          controle: null,
          estoque: 153,
        },
        {
          codlocal: 105003,
          descricao: 'ALMOXARIFADO',
          controle: 'LOT001',
          estoque: 50,
        },
      ])
    })

    it('deve lidar com descrição nula', async () => {
      sankhyaApiService.executeQuery.mockResolvedValue([
        { CODLOCAL: 105002, DESCRLOCAL: null, CONTROLE: null, ESTOQUE: 153 },
      ])

      const result = await service.fetchLocalizacoesEstoque(3680)

      expect(result[0].descricao).toBe('N/D')
    })
  })

  describe('fetchMovimentacoesV2', () => {
    it('deve retornar movimentações com dados adicionais', async () => {
      sankhyaApiService.executeQuery.mockResolvedValue(mockMovimentacoes)

      const result = await service.fetchMovimentacoesV2(
        3680,
        '2025-12-01',
        '2025-12-31',
      )

      expect(result).toEqual(mockMovimentacoes)
      expect(sankhyaApiService.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining(
          'SELECT COALESCE(c.DTENTSAI, c.DTNEG) AS data_mov',
        ),
        [],
      )
    })
  })

  describe('validarDatas', () => {
    it('deve validar período válido', () => {
      expect(() =>
        service.validarDatas('2025-12-01', '2025-12-31'),
      ).not.toThrow()
    })

    it('deve lançar erro se data fim for menor que data início', () => {
      expect(() => service.validarDatas('2025-12-31', '2025-12-01')).toThrow(
        BadRequestException,
      )
    })

    it('deve lançar erro se período exceder máximo', () => {
      expect(() =>
        service.validarDatas('2025-01-01', '2025-12-31', 100),
      ).toThrow(BadRequestException)
    })

    it('deve retornar número de dias corretos', () => {
      const dias = service.validarDatas('2025-12-01', '2025-12-31')
      expect(dias).toBe(31)
    })
  })

  describe('calcularDiasEntreDatas', () => {
    it('deve calcular dias corretamente', () => {
      const dias = service.calcularDiasEntreDatas('2025-12-01', '2025-12-31')
      expect(dias).toBe(31)
    })

    it('deve calcular 1 dia para mesmo dia', () => {
      const dias = service.calcularDiasEntreDatas('2025-12-01', '2025-12-01')
      expect(dias).toBe(1)
    })
  })

  describe('calcularMetricasV2', () => {
    const mockProcessed = [
      {
        quantidade_mov: -10,
        valor_mov: -53.0,
      },
      {
        quantidade_mov: 5,
        valor_mov: 26.5,
      },
    ]

    it('deve calcular métricas expandidas corretamente', () => {
      const metrics = service.calcularMetricasV2(mockProcessed, 100, 30, 95)

      expect(metrics.totalEntradasQtd).toBe(5)
      expect(metrics.totalSaidasQtd).toBe(10)
      expect(metrics.totalEntradasValor).toBe(26.5)
      expect(metrics.totalSaidasValor).toBe(53.0)
      expect(metrics.percentualConsumo).toBe(10)
    })

    it('deve evitar divisão por zero', () => {
      const metrics = service.calcularMetricasV2(mockProcessed, 0, 30, 95)

      expect(metrics.percentualConsumo).toBe(0)
      expect(metrics.mediaConsumoDia).toBe(0)
      expect(metrics.diasEstoqueDisponivel).toBe(0)
    })
  })

  describe('consultarConsumoPeriodoV2', () => {
    const mockFetchUltimaCompraFn = jest.fn()
    const mockFetchSaldoAnteriorFn = jest.fn()

    beforeEach(() => {
      mockFetchUltimaCompraFn.mockResolvedValue(5.3)
      mockFetchSaldoAnteriorFn.mockResolvedValue(104)

      validationService.validarConsultaConsumo.mockResolvedValue({
        isValid: true,
        warnings: [],
        errors: [],
        suggestions: [],
      })

      validationService.validarDadosConsumo.mockResolvedValue({
        isValid: true,
        warnings: [],
        errors: [],
        suggestions: [],
      })
    })

    it('deve lançar erro se validação da consulta falhar', async () => {
      validationService.validarConsultaConsumo.mockResolvedValue({
        isValid: false,
        warnings: [],
        errors: ['Produto inválido'],
        suggestions: [],
      })

      await expect(
        service.consultarConsumoPeriodoV2(
          999,
          '2025-12-01',
          '2025-12-31',
          mockFetchUltimaCompraFn,
          mockFetchSaldoAnteriorFn,
        ),
      ).rejects.toThrow(BadRequestException)
    })

    it('deve lançar erro se produto não for encontrado', async () => {
      cacheService.getProduto.mockResolvedValue(null)
      sankhyaApiService.executeQuery.mockResolvedValue([])

      await expect(
        service.consultarConsumoPeriodoV2(
          999,
          '2025-12-01',
          '2025-12-31',
          mockFetchUltimaCompraFn,
          mockFetchSaldoAnteriorFn,
        ),
      ).rejects.toThrow(NotFoundException)
    })

    it('deve retornar dados completos do consumo V2', async () => {
      cacheService.getProduto.mockResolvedValue(null)
      sankhyaApiService.executeQuery
        .mockResolvedValueOnce([mockProdutoInfo])
        .mockResolvedValueOnce(mockMovimentacoes)
        .mockResolvedValueOnce(mockLocalizacoes)

      const result = await service.consultarConsumoPeriodoV2(
        3680,
        '2025-12-01',
        '2025-12-31',
        mockFetchUltimaCompraFn,
        mockFetchSaldoAnteriorFn,
      )

      expect(result).toHaveProperty('produto')
      expect(result).toHaveProperty('periodo')
      expect(result).toHaveProperty('movimentacoes')
      expect(result).toHaveProperty('metrics')
      expect(result).toHaveProperty('saldoAnterior')
      expect(result).toHaveProperty('saldoAtual')
      expect(result.produto.codprod).toBe(3680)
      expect(result.produto.descrprod).toBe('PAPEL SULFITE A4 500 FOLHAS')
    })
  })
})
