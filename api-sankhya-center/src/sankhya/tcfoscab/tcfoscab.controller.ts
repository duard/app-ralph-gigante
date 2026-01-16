import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { TokenAuthGuard } from '../auth/token-auth.guard'
import { TcfoscabService } from './tcfoscab.service'
import { OrdemServicoFindAllDto } from './models/tcfoscab.dto'

@ApiBearerAuth('JWT-auth')
@ApiTags('F. Ordens de Serviço - Manutenção')
@UseGuards(TokenAuthGuard)
@Controller('tcfoscab')
export class TcfoscabController {
  constructor(private readonly tcfoscabService: TcfoscabService) {}

  // ==========================================
  // LISTAGEM E BUSCA
  // ==========================================

  @Get()
  @ApiOperation({
    summary: 'Listar ordens de serviço de manutenção',
    description:
      'Lista todas as OS com filtros avançados (status, tipo, veículo, período)',
  })
  @ApiQuery({ name: 'status', required: false, description: 'F, E, A, R' })
  @ApiQuery({
    name: 'manutencao',
    required: false,
    description: 'C=Corretiva, P=Preventiva, O=Outros',
  })
  @ApiQuery({ name: 'tipo', required: false, description: 'I=Interna, E=Externa' })
  @ApiQuery({ name: 'codveiculo', required: false, type: Number })
  @ApiQuery({ name: 'dtInicio', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'dtFim', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'search', required: false, description: 'Busca por placa, veículo ou número' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'perPage', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, description: 'ex: cab.DATAINI DESC' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de ordens de serviço',
  })
  async findAll(@Query() dto: OrdemServicoFindAllDto) {
    return this.tcfoscabService.findAll(dto)
  }

  @Get(':nuos')
  @ApiOperation({
    summary: 'Buscar OS por número',
    description:
      'Retorna todos os detalhes da OS: cabeçalho, serviços, apontamentos e produtos',
  })
  @ApiParam({ name: 'nuos', description: 'Número da OS', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Detalhes completos da OS',
  })
  @ApiResponse({
    status: 404,
    description: 'OS não encontrada',
  })
  async findById(@Param('nuos') nuos: number) {
    return this.tcfoscabService.findById(Number(nuos))
  }

  // ==========================================
  // DETALHES DA OS
  // ==========================================

  @Get(':nuos/servicos')
  @ApiOperation({
    summary: 'Listar serviços da OS',
    description: 'Retorna todos os serviços/atividades executados na OS',
  })
  @ApiParam({ name: 'nuos', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista de serviços',
  })
  async findServicos(@Param('nuos') nuos: number) {
    return this.tcfoscabService.findServicos(Number(nuos))
  }

  @Get(':nuos/apontamentos')
  @ApiOperation({
    summary: 'Listar apontamentos de tempo da OS',
    description:
      'Retorna todos os apontamentos de homem-hora com cálculo de tempo líquido',
  })
  @ApiParam({ name: 'nuos', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista de apontamentos com cálculos de tempo',
  })
  async findApontamentos(@Param('nuos') nuos: number) {
    return this.tcfoscabService.findApontamentos(Number(nuos))
  }

  @Get(':nuos/produtos')
  @ApiOperation({
    summary: 'Listar produtos/peças utilizados na OS',
    description: 'Retorna todas as peças e produtos aplicados na manutenção',
  })
  @ApiParam({ name: 'nuos', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos',
  })
  async findProdutos(@Param('nuos') nuos: number) {
    return this.tcfoscabService.findProdutos(Number(nuos))
  }

  // ==========================================
  // ESTATÍSTICAS E DASHBOARDS
  // ==========================================

  @Get('stats/geral')
  @ApiOperation({
    summary: 'Estatísticas gerais de OS',
    description:
      'Métricas agregadas: totais por status, tipo de manutenção, tempos médios, etc.',
  })
  @ApiQuery({
    name: 'dataInicio',
    required: false,
    description: 'Data inicial (padrão: 30 dias atrás)',
  })
  @ApiQuery({
    name: 'dataFim',
    required: false,
    description: 'Data final (padrão: hoje)',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas agregadas',
    schema: {
      example: {
        totalOS: 150,
        finalizadas: 120,
        emExecucao: 20,
        abertas: 10,
        preventivas: 80,
        corretivas: 70,
        tempoMedioDias: 5.2,
        totalVeiculos: 45,
      },
    },
  })
  async getEstatisticas(
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    const inicio =
      dataInicio ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
    const fim = dataFim || new Date().toISOString().split('T')[0]

    return this.tcfoscabService.getEstatisticas(inicio, fim)
  }

  @Get('stats/ativas')
  @ApiOperation({
    summary: 'Resumo de OS ativas',
    description:
      'Lista resumida de todas as OS abertas ou em execução com situação de prazo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de OS ativas',
  })
  async getOSAtivas() {
    return this.tcfoscabService.getOSAtivas()
  }

  @Get('stats/produtividade')
  @ApiOperation({
    summary: 'Produtividade de executores',
    description:
      'Ranking de produtividade dos colaboradores com total de horas trabalhadas',
  })
  @ApiQuery({
    name: 'dataInicio',
    required: false,
    description: 'Data inicial',
  })
  @ApiQuery({
    name: 'dataFim',
    required: false,
    description: 'Data final',
  })
  @ApiResponse({
    status: 200,
    description: 'Produtividade por executor',
    schema: {
      example: [
        {
          codexec: 123,
          nomeExecutor: 'João Silva',
          totalOS: 45,
          totalApontamentos: 120,
          totalHoras: 180.5,
          mediaMinutosPorApontamento: 90,
        },
      ],
    },
  })
  async getProdutividade(
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    const inicio =
      dataInicio ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
    const fim = dataFim || new Date().toISOString().split('T')[0]

    return this.tcfoscabService.getProdutividade(inicio, fim)
  }

  @Get('stats/produtos-mais-usados')
  @ApiOperation({
    summary: 'Produtos mais utilizados',
    description:
      'Top 20 produtos/peças mais utilizados nas manutenções com valor total',
  })
  @ApiQuery({
    name: 'dataInicio',
    required: false,
    description: 'Data inicial',
  })
  @ApiQuery({
    name: 'dataFim',
    required: false,
    description: 'Data final',
  })
  @ApiResponse({
    status: 200,
    description: 'Produtos mais utilizados',
  })
  async getProdutosMaisUtilizados(
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    const inicio =
      dataInicio ||
      new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
    const fim = dataFim || new Date().toISOString().split('T')[0]

    return this.tcfoscabService.getProdutosMaisUtilizados(inicio, fim)
  }

  // ==========================================
  // RELATÓRIOS
  // ==========================================

  @Get('relatorios/homem-hora')
  @ApiOperation({
    summary: 'Relatório de homem-hora',
    description:
      'Relatório detalhado de produtividade com cálculo de homem-hora líquido',
  })
  @ApiQuery({ name: 'dataInicio', required: true })
  @ApiQuery({ name: 'dataFim', required: true })
  @ApiQuery({
    name: 'codexec',
    required: false,
    description: 'Filtrar por executor',
  })
  @ApiResponse({
    status: 200,
    description: 'Relatório de homem-hora',
  })
  async getRelatorioHomemHora(
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
    @Query('codexec') codexec?: number,
  ) {
    // TODO: Implementar query específica baseada no SQL os-homem-hora.sql
    return {
      message: 'Relatório em implementação',
      dataInicio,
      dataFim,
      codexec,
    }
  }
}
