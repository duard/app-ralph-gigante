import { Controller, Get, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { TokenAuthGuard } from '../../auth/token-auth.guard'
import { EstoquesDashboardService } from './estoques-dashboard.service'

@ApiBearerAuth('JWT-auth')
@ApiTags('E. Dashboard Estoques')
@UseGuards(TokenAuthGuard)
@Controller('estoques-dashboard')
export class EstoquesDashboardController {
  constructor(private readonly dashboardService: EstoquesDashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Visão geral do dashboard de estoques' })
  @ApiResponse({ status: 200, description: 'Dados do dashboard' })
  async getOverview() {
    return this.dashboardService.getOverview()
  }

  @Get('grupos')
  @ApiOperation({ summary: 'Dados por grupos de produto' })
  @ApiResponse({ status: 200, description: 'Grupos com métricas' })
  async getGrupos() {
    return this.dashboardService.getGrupos()
  }

  @Get('locais')
  @ApiOperation({ summary: 'Dados por locais' })
  @ApiResponse({ status: 200, description: 'Locais com métricas' })
  async getLocais() {
    return this.dashboardService.getLocais()
  }

  @Get('alertas')
  @ApiOperation({ summary: 'Alertas de estoque baixo e sem estoque' })
  @ApiResponse({ status: 200, description: 'Produtos em alerta' })
  async getAlertas() {
    return this.dashboardService.getAlertas()
  }

  @Get('tendencias')
  @ApiOperation({ summary: 'Tendências de estoque (simulado)' })
  @ApiResponse({ status: 200, description: 'Dados de tendências' })
  async getTendencias() {
    return this.dashboardService.getTendencias()
  }
}
