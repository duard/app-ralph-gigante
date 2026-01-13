import {
  Controller,
  Get,
  // ...existing code...
  Logger,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import {
  DashboardFiltersDto,
  DashboardResponseDto,
  InventarioResponseDto,
  MovimentacoesResponseDto,
  ProdutosParadosResponseDto,
  TopProdutosResponseDto,
} from '../dto'
import { LocalTokenAuthGuard } from '../local-token-auth.guard'
import { EstoqueGiroService } from '../services/estoque-giro.service'

@ApiBearerAuth('JWT-auth')
@ApiTags('F. Estoque Giro Dashboard')
@UseGuards(LocalTokenAuthGuard)
@Controller('estoque-giro')
export class EstoqueGiroController {
  private readonly logger = new Logger(EstoqueGiroController.name)

  constructor(private readonly estoqueGiroService: EstoqueGiroService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Dashboard completo de Giro de Estoque',
    description:
      'Retorna um dashboard consolidado com inventário, movimentações, produtos parados, TOP produtos e alertas. Todos os filtros se aplicam a todas as seções.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard completo retornado com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 500, description: 'Erro interno' })
  @ApiQuery({ name: 'codigoGrupo', required: false, example: 20100 })
  @ApiQuery({ name: 'codigoSubgrupo', required: false, example: 20102 })
  @ApiQuery({ name: 'subgrupos', required: false, type: [Number] })
  @ApiQuery({
    name: 'periodo',
    required: false,
    enum: [
      'MES_ATUAL',
      'ULTIMOS_3_MESES',
      'ULTIMOS_6_MESES',
      'ULTIMOS_12_MESES',
      'PERSONALIZADO',
    ],
  })
  @ApiQuery({ name: 'dataInicio', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'dataFim', required: false, example: '2025-12-31' })
  async getDashboard(
    @Query('codigoGrupo') codigoGrupo?: number,
    @Query('codigoSubgrupo') codigoSubgrupo?: number,
    @Query('subgrupos') subgrupos?: string,
    @Query('periodo') periodo?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ): Promise<DashboardResponseDto> {
    const startTime = Date.now()

    const filters = new DashboardFiltersDto()
    filters.codigoGrupo = codigoGrupo ? Number(codigoGrupo) : 20100
    filters.codigoSubgrupo = codigoSubgrupo ? Number(codigoSubgrupo) : undefined
    filters.subgrupos = subgrupos ? subgrupos.split(',').map(Number) : undefined
    filters.periodo = (periodo as any) || 'ULTIMOS_12_MESES'
    filters.dataInicio = dataInicio
    filters.dataFim = dataFim

    try {
      const [
        inventario,
        movimentacoes,
        produtosParados,
        topProdutos,
        alertas,
        kardex,
      ] = await Promise.all([
        this.estoqueGiroService.getInventario(filters),
        this.estoqueGiroService.getMovimentacoes(filters),
        this.estoqueGiroService.getProdutosParados(filters),
        this.estoqueGiroService.getTopProdutos(filters),
        this.estoqueGiroService.getAlertas(filters),
        this.estoqueGiroService.getKardex(filters, 50),
      ])

      const response: DashboardResponseDto = {
        status: 'success',
        timestamp: new Date(),
        inventario: {
          codigoGrupo: inventario.codigoGrupo,
          descricaoGrupo: inventario.descricaoGrupo,
          totalSubgrupos: inventario.totalSubgrupos,
          totalProdutos: inventario.totalProdutos,
          quantidadeTotalEstoque: inventario.quantidadeTotalEstoque,
          mediaGeralPorProduto: inventario.mediaGeralPorProduto,
          subgrupos: inventario.subgrupos.map((s) => ({
            codigo: s.codigo,
            descricao: s.descricao,
            totalProdutos: s.totalProdutos,
            quantidadeEstoque: s.quantidadeEstoque,
            mediaPorProduto: s.mediaPorProduto,
            giro: s.giro,
            classificacao: s.classificacao,
          })),
        },
        movimentacoes: {
          codigoGrupo: movimentacoes.codigoGrupo,
          descricaoGrupo: movimentacoes.descricaoGrupo,
          periodo: movimentacoes.periodo,
          dataInicio: movimentacoes.dataInicio,
          dataFim: movimentacoes.dataFim,
          totalEntradas: movimentacoes.totalEntradas,
          totalSaidas: movimentacoes.totalSaidas,
          saldoGeral: movimentacoes.saldoGeral,
          porSubgrupo: movimentacoes.porSubgrupo.map((s) => ({
            codigo: s.codigo,
            descricao: s.descricao,
            entradas: s.entradas,
            saidas: s.saidas,
            saldo: s.saldo,
            qtdMovimentacoesEntrada: s.qtdMovimentacoesEntrada,
            qtdMovimentacoesSaida: s.qtdMovimentacoesSaida,
            giro: s.giro,
            classificacao: s.classificacao,
          })),
        },
        produtosParados: {
          codigoGrupo: produtosParados.codigoGrupo,
          descricaoGrupo: produtosParados.descricaoGrupo,
          totalProdutosParados: produtosParados.totalProdutosParados,
          comEstoque: produtosParados.comEstoque,
          semEstoque: produtosParados.semEstoque,
          percentualParado: produtosParados.percentualParado,
          porSubgrupo: produtosParados.porSubgrupo.map((s) => ({
            codigo: s.codigo,
            descricao: s.descricao,
            totalParados: s.totalParados,
            comEstoque: s.comEstoque,
            semEstoque: s.semEstoque,
          })),
          produtos: [],
        },
        topProdutos: {
          codigoGrupo: topProdutos.codigoGrupo,
          descricaoGrupo: topProdutos.descricaoGrupo,
          codigoSubgrupo: topProdutos.codigoSubgrupo,
          descricaoSubgrupo: topProdutos.descricaoSubgrupo,
          totalProdutosSubgrupo: topProdutos.totalProdutosSubgrupo,
          totalNoTop: topProdutos.totalNoTop,
          totalCriticos: topProdutos.totalCriticos,
          totalBaixo: topProdutos.totalBaixo,
          totalEquilibrado: topProdutos.totalEquilibrado,
          totalSemEstoque: topProdutos.totalSemEstoque,
          produtos: topProdutos.produtos.map((p) => ({
            posicao: p.posicao,
            codigo: p.codigo,
            descricao: p.descricao,
            codigoSubgrupo: p.codigoSubgrupo,
            descricaoSubgrupo: p.descricaoSubgrupo,
            marca: p.marca,
            estoque: p.estoque,
            totalConsumo: p.totalConsumo,
            totalEntrada: p.totalEntrada,
            ratio: p.ratio,
            status: p.status,
            sugestaoCompra: p.sugestaoCompra,
            consumoMedioMensal: p.consumoMedioMensal,
          })),
        },
        alertas: alertas.map((a) => ({
          tipo: a.tipo,
          codigoProduto: a.codigoProduto,
          descricaoProduto: a.descricaoProduto,
          codigoSubgrupo: a.codigoSubgrupo,
          descricaoSubgrupo: a.descricaoSubgrupo,
          valorAtual: a.valorAtual,
          valorReferencia: a.valorReferencia,
          mensagem: a.mensagem,
          acaoSugerida: a.acaoSugerida,
        })),
        kardex: kardex.map((k) => ({
          codigo: k.codigo,
          descricao: k.descricao,
          codigoSubgrupo: k.codigoSubgrupo,
          descricaoSubgrupo: k.descricaoSubgrupo,
          estoqueAtual: k.estoqueAtual,
          estoqueMinimo: k.estoqueMinimo,
          estoqueMaximo: k.estoqueMaximo,
          totalEntradas: k.totalEntradas,
          totalSaidas: k.totalSaidas,
          saldoPeriodo: k.saldoPeriodo,
          giro: k.giro,
          classificacao: k.classificacao,
        })),
        filtrosAplicados: {
          codigoGrupo: filters.codigoGrupo,
          codigoSubgrupo: filters.codigoSubgrupo,
          subgrupos: filters.subgrupos,
          periodo: filters.periodo,
          dataInicio: filters.dataInicio,
          dataFim: filters.dataFim,
        },
        meta: {
          versaoApi: '1.0.0',
          tempoRespostaMs: Date.now() - startTime,
          totalQueriesExecutadas: 7,
        },
      }
      return response
    } catch (error) {
      // Lança HttpException para resposta detalhada e compatível com REST
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { HttpException } = require('@nestjs/common')
      throw new HttpException(
        {
          status: 'error',
          timestamp: new Date(),
          message: error.message,
          stack: error.stack,
          error,
        },
        500,
      )
    }
  }

  @Get('inventario')
  @ApiOperation({
    summary: 'Resumo do Inventário por Subgrupo',
    description:
      'Retorna o inventário atual do grupo de produtos, incluindo quantidade em estoque e médias por subgrupo.',
  })
  @ApiResponse({ status: 200, description: 'Inventário retornado com sucesso' })
  @ApiQuery({ name: 'codigoGrupo', required: false, example: 20100 })
  @ApiQuery({ name: 'subgrupos', required: false, type: [Number] })
  @ApiQuery({ name: 'ordemPor', required: false })
  @ApiQuery({ name: 'direcao', required: false, enum: ['asc', 'desc'] })
  async getInventario(
    @Query('codigoGrupo') codigoGrupo?: number,
    @Query('subgrupos') subgrupos?: string,
  ): Promise<InventarioResponseDto> {
    const filters = new DashboardFiltersDto()
    filters.codigoGrupo = codigoGrupo ? Number(codigoGrupo) : 20100
    filters.subgrupos = subgrupos ? subgrupos.split(',').map(Number) : undefined

    this.logger.log('Filters Inventario:', JSON.stringify(filters))
    const inventario = await this.estoqueGiroService.getInventario(filters)

    return {
      status: 'success',
      timestamp: new Date(),
      data: {
        codigoGrupo: inventario.codigoGrupo,
        descricaoGrupo: inventario.descricaoGrupo,
        totalSubgrupos: inventario.totalSubgrupos,
        totalProdutos: inventario.totalProdutos,
        quantidadeTotalEstoque: inventario.quantidadeTotalEstoque,
        mediaGeralPorProduto: inventario.mediaGeralPorProduto,
        subgrupos: inventario.subgrupos.map((s) => ({
          codigo: s.codigo,
          descricao: s.descricao,
          totalProdutos: s.totalProdutos,
          quantidadeEstoque: s.quantidadeEstoque,
          mediaPorProduto: s.mediaPorProduto,
          giro: s.giro,
          classificacao: s.classificacao,
        })),
      },
      filtros: {
        codigoGrupo: filters.codigoGrupo,
        subgrupos: filters.subgrupos,
      },
    }
  }

  @Get('movimentacoes')
  @ApiOperation({
    summary: 'Resumo das Movimentações de Estoque',
    description:
      'Retorna o resumo de entradas e saídas de estoque por subgrupo, com cálculo de giro.',
  })
  @ApiResponse({
    status: 200,
    description: 'Movimentações retornadas com sucesso',
  })
  @ApiQuery({ name: 'codigoGrupo', required: false, example: 20100 })
  @ApiQuery({ name: 'codigoSubgrupo', required: false, example: 20102 })
  @ApiQuery({
    name: 'periodo',
    required: false,
    enum: [
      'MES_ATUAL',
      'ULTIMOS_3_MESES',
      'ULTIMOS_6_MESES',
      'ULTIMOS_12_MESES',
    ],
  })
  @ApiQuery({ name: 'dataInicio', required: false })
  @ApiQuery({ name: 'dataFim', required: false })
  async getMovimentacoes(
    @Query('codigoGrupo') codigoGrupo?: number,
    @Query('codigoSubgrupo') codigoSubgrupo?: number,
    @Query('periodo') periodo?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ): Promise<MovimentacoesResponseDto> {
    const filters = new DashboardFiltersDto()
    filters.codigoGrupo = codigoGrupo ? Number(codigoGrupo) : 20100
    filters.codigoSubgrupo = codigoSubgrupo ? Number(codigoSubgrupo) : undefined
    filters.periodo = (periodo as any) || 'ULTIMOS_12_MESES'
    filters.dataInicio = dataInicio
    filters.dataFim = dataFim

    const movimentacoes =
      await this.estoqueGiroService.getMovimentacoes(filters)

    return {
      status: 'success',
      timestamp: new Date(),
      data: {
        codigoGrupo: movimentacoes.codigoGrupo,
        descricaoGrupo: movimentacoes.descricaoGrupo,
        periodo: movimentacoes.periodo,
        dataInicio: movimentacoes.dataInicio,
        dataFim: movimentacoes.dataFim,
        totalEntradas: movimentacoes.totalEntradas,
        totalSaidas: movimentacoes.totalSaidas,
        saldoGeral: movimentacoes.saldoGeral,
        porSubgrupo: movimentacoes.porSubgrupo.map((s) => ({
          codigo: s.codigo,
          descricao: s.descricao,
          entradas: s.entradas,
          saidas: s.saidas,
          saldo: s.saldo,
          qtdMovimentacoesEntrada: s.qtdMovimentacoesEntrada,
          qtdMovimentacoesSaida: s.qtdMovimentacoesSaida,
          giro: s.giro,
          classificacao: s.classificacao,
        })),
      },
      filtros: {
        codigoGrupo: filters.codigoGrupo,
        codigoSubgrupo: filters.codigoSubgrupo,
        periodo: filters.periodo,
        dataInicio: filters.dataInicio,
        dataFim: filters.dataFim,
      },
    }
  }

  @Get('produtos-parados')
  @ApiOperation({
    summary: 'Produtos Sem Movimentação',
    description:
      'Retorna a lista de produtos que não tiveram saída (consumo) no período analisado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Produtos parados retornados com sucesso',
  })
  @ApiQuery({ name: 'codigoGrupo', required: false, example: 20100 })
  @ApiQuery({ name: 'codigoSubgrupo', required: false, example: 20102 })
  @ApiQuery({ name: 'apenasComEstoque', required: false, type: Boolean })
  @ApiQuery({ name: 'ordemPor', required: false })
  @ApiQuery({ name: 'limite', required: false, type: Number })
  @ApiQuery({ name: 'pagina', required: false, type: Number })
  @ApiQuery({ name: 'itensPorPagina', required: false, type: Number })
  async getProdutosParados(
    @Query('codigoGrupo') codigoGrupo?: number,
    @Query('codigoSubgrupo') codigoSubgrupo?: number,
    @Query('apenasComEstoque') apenasComEstoque?: boolean,
    @Query('ordemPor') ordemPor?: string,
    @Query('limite') limite?: number,
    @Query('pagina') pagina?: number,
    @Query('itensPorPagina') itensPorPagina?: number,
  ): Promise<ProdutosParadosResponseDto> {
    const filters = new DashboardFiltersDto()
    filters.codigoGrupo = codigoGrupo ? Number(codigoGrupo) : 20100
    filters.codigoSubgrupo = codigoSubgrupo ? Number(codigoSubgrupo) : undefined
    filters.limite = limite || 100
    filters.pagina = pagina || 1
    filters.itensPorPagina = itensPorPagina || 20

    const produtosParados =
      await this.estoqueGiroService.getProdutosParados(filters)

    return {
      status: 'success',
      timestamp: new Date(),
      data: {
        codigoGrupo: produtosParados.codigoGrupo,
        descricaoGrupo: produtosParados.descricaoGrupo,
        totalProdutosParados: produtosParados.totalProdutosParados,
        comEstoque: produtosParados.comEstoque,
        semEstoque: produtosParados.semEstoque,
        percentualParado: produtosParados.percentualParado,
        porSubgrupo: produtosParados.porSubgrupo.map((s) => ({
          codigo: s.codigo,
          descricao: s.descricao,
          totalParados: s.totalParados,
          comEstoque: s.comEstoque,
          semEstoque: s.semEstoque,
        })),
        produtos: produtosParados.produtos.map((p) => ({
          codigo: p.codigo,
          descricao: p.descricao,
          codigoSubgrupo: p.codigoSubgrupo,
          descricaoSubgrupo: p.descricaoSubgrupo,
          marca: p.marca,
          estoque: p.estoque,
          totalEntrada: p.totalEntrada,
          totalSaida: p.totalSaida,
          dataUltimaMovimentacao: p.dataUltimaMovimentacao,
          sugestao: p.sugestao,
        })),
      },
      filtros: {
        codigoGrupo: filters.codigoGrupo,
        codigoSubgrupo: filters.codigoSubgrupo,
        apenasComEstoque,
      },
      paginacao: {
        pagina: filters.pagina,
        itensPorPagina: filters.itensPorPagina,
        totalItens: produtosParados.totalProdutosParados,
        totalPaginas: Math.ceil(
          produtosParados.totalProdutosParados / filters.itensPorPagina,
        ),
      },
    }
  }

  @Get('top-produtos')
  @ApiOperation({
    summary: 'TOP Produtos Mais Consumidos',
    description:
      'Retorna o ranking dos produtos mais consumidos, com classificação de status e sugestões de compra.',
  })
  @ApiResponse({
    status: 200,
    description: 'TOP produtos retornados com sucesso',
  })
  @ApiQuery({ name: 'codigoGrupo', required: false, example: 20100 })
  @ApiQuery({ name: 'codigoSubgrupo', required: false, example: 20102 })
  @ApiQuery({
    name: 'statusClassificacao',
    required: false,
    enum: ['CRITICO', 'BAIXO', 'EQUILIBRADO', 'SEM_ESTOQUE'],
  })
  @ApiQuery({ name: 'limite', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'ordemPor', required: false })
  @ApiQuery({ name: 'direcao', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'busca', required: false })
  @ApiQuery({ name: 'pagina', required: false, type: Number })
  @ApiQuery({ name: 'itensPorPagina', required: false, type: Number })
  async getTopProdutos(
    @Query('codigoGrupo') codigoGrupo?: number,
    @Query('codigoSubgrupo') codigoSubgrupo?: number,
    @Query('statusClassificacao') statusClassificacao?: string,
    @Query('limite') limite?: number,
    @Query('ordemPor') ordemPor?: string,
    @Query('direcao') direcao?: 'asc' | 'desc',
    @Query('busca') busca?: string,
    @Query('pagina') pagina?: number,
    @Query('itensPorPagina') itensPorPagina?: number,
  ): Promise<TopProdutosResponseDto> {
    const filters = new DashboardFiltersDto()
    filters.codigoGrupo = codigoGrupo ? Number(codigoGrupo) : 20100
    filters.codigoSubgrupo = codigoSubgrupo ? Number(codigoSubgrupo) : undefined
    filters.statusClassificacao = statusClassificacao as any
    filters.limite = limite || 50
    filters.ordem = ordemPor || 'totalConsumo'
    filters.direcao = direcao || 'desc'
    filters.busca = busca
    filters.pagina = pagina || 1
    filters.itensPorPagina = itensPorPagina || 20

    const topProdutos = await this.estoqueGiroService.getTopProdutos(filters)

    return {
      status: 'success',
      timestamp: new Date(),
      data: {
        codigoGrupo: topProdutos.codigoGrupo,
        descricaoGrupo: topProdutos.descricaoGrupo,
        codigoSubgrupo: topProdutos.codigoSubgrupo,
        descricaoSubgrupo: topProdutos.descricaoSubgrupo,
        totalProdutosSubgrupo: topProdutos.totalProdutosSubgrupo,
        totalNoTop: topProdutos.totalNoTop,
        totalCriticos: topProdutos.totalCriticos,
        totalBaixo: topProdutos.totalBaixo,
        totalEquilibrado: topProdutos.totalEquilibrado,
        totalSemEstoque: topProdutos.totalSemEstoque,
        produtos: topProdutos.produtos.map((p) => ({
          posicao: p.posicao,
          codigo: p.codigo,
          descricao: p.descricao,
          codigoSubgrupo: p.codigoSubgrupo,
          descricaoSubgrupo: p.descricaoSubgrupo,
          marca: p.marca,
          estoque: p.estoque,
          totalConsumo: p.totalConsumo,
          totalEntrada: p.totalEntrada,
          ratio: p.ratio,
          status: p.status,
          sugestaoCompra: p.sugestaoCompra,
          consumoMedioMensal: p.consumoMedioMensal,
        })),
      },
      filtros: {
        codigoGrupo: filters.codigoGrupo,
        codigoSubgrupo: filters.codigoSubgrupo,
        statusClassificacao: filters.statusClassificacao,
        limite: filters.limite,
      },
      paginacao: {
        pagina: filters.pagina,
        itensPorPagina: filters.itensPorPagina,
        totalItens: topProdutos.totalNoTop,
        totalPaginas: Math.ceil(
          topProdutos.totalNoTop / filters.itensPorPagina,
        ),
      },
    }
  }

  @Get('alertas')
  @ApiOperation({
    summary: 'Alertas de Estoque',
    description:
      'Retorna os alertas ativos de produtos com estoque crítico ou baixo.',
  })
  @ApiResponse({ status: 200, description: 'Alertas retornados com sucesso' })
  @ApiQuery({ name: 'codigoGrupo', required: false, example: 20100 })
  @ApiQuery({ name: 'codigoSubgrupo', required: false, example: 20102 })
  @ApiQuery({
    name: 'tipo',
    required: false,
    enum: ['CRITICO', 'BAIXO', 'ALTO', 'NEGATIVO'],
  })
  async getAlertas(
    @Query('codigoGrupo') codigoGrupo?: number,
    @Query('codigoSubgrupo') codigoSubgrupo?: number,
    @Query('tipo') tipo?: string,
  ): Promise<{ status: string; timestamp: Date; data: any[]; filtros: any }> {
    const filters = new DashboardFiltersDto()
    filters.codigoGrupo = codigoGrupo ? Number(codigoGrupo) : 20100
    filters.codigoSubgrupo = codigoSubgrupo ? Number(codigoSubgrupo) : undefined

    const alertas = await this.estoqueGiroService.getAlertas(filters)

    const alertasFiltrados = tipo
      ? alertas.filter((a) => a.tipo === tipo)
      : alertas

    return {
      status: 'success',
      timestamp: new Date(),
      data: alertasFiltrados.map((a) => ({
        tipo: a.tipo,
        codigoProduto: a.codigoProduto,
        descricaoProduto: a.descricaoProduto,
        codigoSubgrupo: a.codigoSubgrupo,
        descricaoSubgrupo: a.descricaoSubgrupo,
        valorAtual: a.valorAtual,
        valorReferencia: a.valorReferencia,
        mensagem: a.mensagem,
        acaoSugerida: a.acaoSugerida,
      })),
      filtros: {
        codigoGrupo: filters.codigoGrupo,
        codigoSubgrupo: filters.codigoSubgrupo,
        tipo,
      },
    }
  }

  @Get('kardex')
  @ApiOperation({
    summary: 'Resumo de Kardex',
    description: 'Retorna o resumo de kardex dos produtos com maior estoque.',
  })
  @ApiResponse({ status: 200, description: 'Kardex retornado com sucesso' })
  @ApiQuery({ name: 'codigoGrupo', required: false, example: 20100 })
  @ApiQuery({ name: 'codigoSubgrupo', required: false, example: 20102 })
  @ApiQuery({ name: 'periodo', required: false })
  @ApiQuery({ name: 'limite', required: false, type: Number, example: 100 })
  async getKardex(
    @Query('codigoGrupo') codigoGrupo?: number,
    @Query('codigoSubgrupo') codigoSubgrupo?: number,
    @Query('periodo') periodo?: string,
    @Query('limite') limite?: number,
  ): Promise<{ status: string; timestamp: Date; data: any[]; filtros: any }> {
    const filters = new DashboardFiltersDto()
    filters.codigoGrupo = codigoGrupo ? Number(codigoGrupo) : 20100
    filters.codigoSubgrupo = codigoSubgrupo ? Number(codigoSubgrupo) : undefined
    filters.periodo = (periodo as any) || 'ULTIMOS_12_MESES'

    const kardex = await this.estoqueGiroService.getKardex(
      filters,
      limite || 100,
    )

    return {
      status: 'success',
      timestamp: new Date(),
      data: kardex.map((k) => ({
        codigo: k.codigo,
        descricao: k.descricao,
        codigoSubgrupo: k.codigoSubgrupo,
        descricaoSubgrupo: k.descricaoSubgrupo,
        estoqueAtual: k.estoqueAtual,
        estoqueMinimo: k.estoqueMinimo,
        estoqueMaximo: k.estoqueMaximo,
        totalEntradas: k.totalEntradas,
        totalSaidas: k.totalSaidas,
        saldoPeriodo: k.saldoPeriodo,
        giro: k.giro,
        classificacao: k.classificacao,
      })),
      filtros: {
        codigoGrupo: filters.codigoGrupo,
        codigoSubgrupo: filters.codigoSubgrupo,
        periodo: filters.periodo,
        limite: limite || 100,
      },
    }
  }
}
