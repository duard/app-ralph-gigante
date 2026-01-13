import {
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { TokenAuthGuard } from '../../auth/token-auth.guard'
import { RhDashboardService, DashFilters } from './rh-dashboard.service'

/**
 * Controller responsável pelas rotas do Dashboard de RH "Poderoso".
 * Suporta filtros de período, empresa e departamento em todos os indicadores.
 */
@ApiBearerAuth('JWT-auth')
@ApiTags('E. Sankhya RH Dashboard')
@Controller('sankhya/rh-dashboard')
@UseGuards(TokenAuthGuard)
export class RhDashboardController {
  constructor(private readonly rhDashboardService: RhDashboardService) {}

  /**
   * Obtém os indicadores principais (KPIs) de RH com filtros.
   */
  @Get('estatisticas')
  @ApiOperation({
    summary: 'Obter estatísticas gerais de RH (KPIs consolidados)',
  })
  @ApiQuery({
    name: 'codemp',
    required: false,
    type: String,
    description: 'IDs das empresas (CSV)',
  })
  @ApiQuery({
    name: 'coddep',
    required: false,
    type: String,
    description: 'IDs dos departamentos (CSV)',
  })
  @ApiQuery({
    name: 'dataInicio',
    required: false,
    type: String,
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'dataFim',
    required: false,
    type: String,
    example: '2024-12-31',
  })
  @UseInterceptors(CacheInterceptor)
  async obterEstatisticas(@Query() filtros: DashFilters): Promise<any> {
    return this.rhDashboardService.obterEstatisticas(filtros)
  }

  /**
   * Obtém a tendência detalhada de Turnover.
   */
  @Get('turnover')
  @ApiOperation({
    summary: 'Obter tendência mensal de Turnover (Admissões vs Demissões)',
  })
  @ApiQuery({ name: 'codemp', required: false, type: Number })
  @ApiQuery({ name: 'coddep', required: false, type: Number })
  @ApiQuery({
    name: 'dataInicio',
    required: false,
    type: String,
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'dataFim',
    required: false,
    type: String,
    example: '2024-12-31',
  })
  @UseInterceptors(CacheInterceptor)
  async obterTurnover(@Query() filtros: DashFilters): Promise<any[]> {
    return this.rhDashboardService.obterTurnover(filtros)
  }

  /**
   * Obtém a distribuição demográfica (Idade e Tempo de Empresa).
   */
  @Get('demografia')
  @ApiOperation({
    summary: 'Obter dados demográficos (Faixa Etária e Tempo de Casa)',
  })
  @ApiQuery({ name: 'codemp', required: false, type: Number })
  @ApiQuery({ name: 'coddep', required: false, type: Number })
  @ApiQuery({
    name: 'dataInicio',
    required: false,
    type: String,
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'dataFim',
    required: false,
    type: String,
    example: '2024-12-31',
  })
  @UseInterceptors(CacheInterceptor)
  async obterDemografia(@Query() filtros: DashFilters): Promise<any> {
    return this.rhDashboardService.obterDemografia(filtros)
  }

  /**
   * Obtém a lista de talentos em risco (alto tempo de casa).
   */
  @Get('talentos-risco')
  @ApiOperation({
    summary: 'Obter top 10 talentos em risco (maior tempo de empresa)',
  })
  @ApiQuery({ name: 'codemp', required: false, type: Number })
  @ApiQuery({ name: 'coddep', required: false, type: Number })
  @UseInterceptors(CacheInterceptor)
  async obterTalentosRisco(@Query() filtros: DashFilters): Promise<any[]> {
    return this.rhDashboardService.obterTalentosRisco(filtros)
  }

  /**
   * Obtém o resumo status das requisições corporativas.
   */
  @Get('resumo-requisicoes')
  @ApiOperation({
    summary: 'Obter resumo de status das requisições com descritivos',
  })
  @ApiQuery({ name: 'codemp', required: false, type: Number })
  @ApiQuery({ name: 'coddep', required: false, type: Number })
  @ApiQuery({ name: 'dataInicio', required: false, type: String })
  @ApiQuery({ name: 'dataFim', required: false, type: String })
  @UseInterceptors(CacheInterceptor)
  async obterResumoRequisicoes(@Query() filtros: DashFilters): Promise<any[]> {
    return this.rhDashboardService.obterResumoRequisicoes(filtros)
  }

  @Get('ausencias')
  @ApiOperation({ summary: 'Obter faltas recentes registradas com filtros' })
  @ApiQuery({ name: 'codemp', required: false, type: Number })
  @ApiQuery({ name: 'coddep', required: false, type: Number })
  @ApiQuery({ name: 'dataInicio', required: false, type: String })
  @ApiQuery({ name: 'dataFim', required: false, type: String })
  @UseInterceptors(CacheInterceptor)
  async obterAusencias(@Query() filtros: DashFilters): Promise<any[]> {
    return this.rhDashboardService.obterAusencias(filtros)
  }

  /**
   * Monitor detalhado de requisições com SLA.
   */
  @Get('monitor-requisicoes')
  @ApiOperation({
    summary: 'Obter lista detalhada de requisições com SLA e status',
  })
  @ApiQuery({ name: 'codemp', required: false, type: String })
  @ApiQuery({ name: 'coddep', required: false, type: String })
  @ApiQuery({ name: 'dataInicio', required: false, type: String })
  @ApiQuery({ name: 'dataFim', required: false, type: String })
  async obterMonitorRequisicoes(@Query() filtros: DashFilters): Promise<any[]> {
    return this.rhDashboardService.obterMonitorRequisicoes(filtros)
  }

  /**
   * Monitor de processamento de folha e rescisões.
   */
  @Get('monitor-folha')
  @ApiOperation({
    summary: 'Obter monitor de processamento de folha e rescisões',
  })
  @ApiQuery({ name: 'codemp', required: false, type: String })
  @ApiQuery({ name: 'coddep', required: false, type: String })
  @ApiQuery({ name: 'dataInicio', required: false, type: String })
  @ApiQuery({ name: 'dataFim', required: false, type: String })
  async obterMonitorFolha(@Query() filtros: DashFilters): Promise<any[]> {
    return this.rhDashboardService.obterMonitorFolha(filtros)
  }

  /**
   * Monitor de demografia avançada (Escolaridade, Estado Civil, etc).
   */
  @Get('monitor-demografia')
  @ApiOperation({ summary: 'Obter insights demográficos avançados' })
  @ApiQuery({ name: 'codemp', required: false, type: String })
  @ApiQuery({ name: 'coddep', required: false, type: String })
  async obterDemografiaAvancada(@Query() filtros: DashFilters): Promise<any> {
    return this.rhDashboardService.obterDemografiaAvancada(filtros)
  }
}
