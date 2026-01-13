import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger'
import { TokenAuthGuard } from '../auth/token-auth.guard'
import { ProdutosV2Service } from './produtos-v2.service'
import { ProdutoV2FindAllDto } from './models'

@ApiTags('F. Produtos V2')
@ApiBearerAuth('JWT-auth')
@UseGuards(TokenAuthGuard)
@Controller('produtos-v2')
export class ProdutosV2Controller {
  constructor(private readonly produtosV2Service: ProdutosV2Service) {}

  @Get('dashboard/kpis')
  @ApiOperation({ summary: 'Obtém KPIs do dashboard de produtos' })
  @ApiResponse({ status: 200, description: 'KPIs retornados com sucesso' })
  async getDashboardKpis() {
    return this.produtosV2Service.getDashboardKpis()
  }

  @Get('listagem')
  @ApiOperation({ summary: 'Lista produtos com filtros avançados' })
  @ApiResponse({ status: 200, description: 'Lista de produtos paginada' })
  async findAll(@Query() dto: ProdutoV2FindAllDto) {
    return this.produtosV2Service.findAll(dto)
  }

  @Get('filtros/grupos')
  @ApiOperation({ summary: 'Lista grupos com contagem de produtos' })
  @ApiResponse({ status: 200, description: 'Lista de grupos' })
  async getGrupos() {
    return this.produtosV2Service.getGruposComContagem()
  }

  @Get('filtros/locais')
  @ApiOperation({ summary: 'Lista locais com contagem de produtos' })
  @ApiResponse({ status: 200, description: 'Lista de locais' })
  async getLocais() {
    return this.produtosV2Service.getLocaisComContagem()
  }

  @Get('filtros/controles')
  @ApiOperation({ summary: 'Lista tipos de controle com contagem' })
  @ApiResponse({ status: 200, description: 'Lista de controles' })
  async getControles() {
    return this.produtosV2Service.getControlesComContagem()
  }

  @Get('filtros/marcas')
  @ApiOperation({ summary: 'Lista marcas com contagem de produtos' })
  @ApiResponse({ status: 200, description: 'Lista de marcas' })
  async getMarcas() {
    return this.produtosV2Service.getMarcasComContagem()
  }

  @Get('grupo/:codgrupoprod/resumo')
  @ApiOperation({ summary: 'Obtém resumo de um grupo' })
  @ApiParam({ name: 'codgrupoprod', type: Number })
  @ApiResponse({ status: 200, description: 'Resumo do grupo' })
  async getGrupoResumo(@Param('codgrupoprod') codgrupoprod: string) {
    return this.produtosV2Service.getGrupoResumo(Number(codgrupoprod))
  }

  @Get('grupo/:codgrupoprod/produtos')
  @ApiOperation({ summary: 'Lista produtos de um grupo' })
  @ApiParam({ name: 'codgrupoprod', type: Number })
  @ApiResponse({ status: 200, description: 'Lista de produtos do grupo' })
  async getProdutosByGrupo(
    @Param('codgrupoprod') codgrupoprod: string,
    @Query() dto: ProdutoV2FindAllDto,
  ) {
    return this.produtosV2Service.findByGrupo(Number(codgrupoprod), dto)
  }

  @Get('local/:codlocal/resumo')
  @ApiOperation({ summary: 'Obtém resumo de um local' })
  @ApiParam({ name: 'codlocal', type: Number })
  @ApiResponse({ status: 200, description: 'Resumo do local' })
  async getLocalResumo(@Param('codlocal') codlocal: string) {
    return this.produtosV2Service.getLocalResumo(Number(codlocal))
  }

  @Get('local/:codlocal/produtos')
  @ApiOperation({ summary: 'Lista produtos de um local' })
  @ApiParam({ name: 'codlocal', type: Number })
  @ApiResponse({ status: 200, description: 'Lista de produtos do local' })
  async getProdutosByLocal(
    @Param('codlocal') codlocal: string,
    @Query() dto: ProdutoV2FindAllDto,
  ) {
    return this.produtosV2Service.findByLocal(Number(codlocal), dto)
  }

  @Get(':codprod/completo')
  @ApiOperation({ summary: 'Obtém dados completos de um produto' })
  @ApiParam({ name: 'codprod', type: Number })
  @ApiResponse({ status: 200, description: 'Dados completos do produto' })
  async getProdutoCompleto(@Param('codprod') codprod: string) {
    return this.produtosV2Service.getProdutoCompleto(Number(codprod))
  }

  @Get(':codprod/estoque-por-local')
  @ApiOperation({ summary: 'Obtém estoque do produto por local' })
  @ApiParam({ name: 'codprod', type: Number })
  @ApiResponse({ status: 200, description: 'Estoque do produto por local' })
  async getEstoquePorLocal(@Param('codprod') codprod: string) {
    return this.produtosV2Service.getEstoquePorLocal(Number(codprod))
  }

  @Get(':codprod/consumo-mensal')
  @ApiOperation({ summary: 'Obtém histórico de consumo mensal do produto' })
  @ApiParam({ name: 'codprod', type: Number })
  @ApiResponse({ status: 200, description: 'Histórico de consumo mensal' })
  async getConsumoMensal(
    @Param('codprod') codprod: string,
    @Query('periodo') periodo: string = '12',
  ) {
    return this.produtosV2Service.getConsumoMensal(
      Number(codprod),
      Number(periodo),
    )
  }
}
