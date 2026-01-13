import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger'
import { TokenAuthGuard } from '../../auth/token-auth.guard'
import { ProdutosDashboardService } from './services/produtos-dashboard.service'
import { ProdutosResumoDto } from './models/produtos-resumo.dto'
import { ProdutosFiltroDto } from './models/produtos-filtro.dto'
import { ProdutoDashboard } from './models/produto-dashboard.interface'
import { ProdutoDashboardDto } from './models/produto-dashboard.dto'

@ApiBearerAuth('JWT-auth')
@ApiTags('F. Dashboard de Produtos')
@UseGuards(TokenAuthGuard)
@Controller('sankhya/dashboards/produtos')
export class ProdutosDashboardController {
  constructor(
    private readonly produtosDashboardService: ProdutosDashboardService,
  ) {}

  @Get('resumo')
  @ApiOperation({
    summary: 'Resumo geral de produtos',
    description: 'Retorna estatísticas gerais sobre os produtos cadastrados',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumo de produtos retornado com sucesso',
    type: ProdutosResumoDto,
  })
  async getResumoProdutos(): Promise<ProdutosResumoDto> {
    return this.produtosDashboardService.getResumoProdutos()
  }

  @Get('filtros')
  @ApiOperation({
    summary: 'Produtos com filtros avançados',
    description: 'Retorna produtos com diversos filtros e opções de paginação',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos filtrados',
    type: [ProdutoDashboardDto],
  })
  @ApiQuery({ name: 'codprod', required: false, type: Number })
  @ApiQuery({ name: 'descrprod', required: false, type: String })
  @ApiQuery({ name: 'referencia', required: false, type: String })
  @ApiQuery({ name: 'ativo', required: false, type: Boolean })
  @ApiQuery({ name: 'codgrupoprod', required: false, type: Number })
  @ApiQuery({ name: 'dataInicial', required: false, type: String })
  @ApiQuery({ name: 'dataFinal', required: false, type: String })
  @ApiQuery({ name: 'limiteEstoque', required: false, type: Number })
  @ApiQuery({ name: 'ordenacao', required: false, type: String })
  @ApiQuery({ name: 'pagina', required: false, type: Number })
  @ApiQuery({ name: 'itensPorPagina', required: false, type: Number })
  async getProdutosComFiltros(
    @Query() filtro: ProdutosFiltroDto,
  ): Promise<ProdutoDashboard[]> {
    return this.produtosDashboardService.getProdutosComFiltros(filtro)
  }

  @Get('estoque-baixo')
  @ApiOperation({
    summary: 'Produtos com estoque baixo',
    description:
      'Retorna produtos que estão com estoque abaixo do limite recomendado',
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    type: Number,
    description: 'Limite de estoque',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos com estoque baixo',
    type: [ProdutoDashboardDto],
  })
  async getProdutosEstoqueBaixo(
    @Query('limite') limite: number = 5,
  ): Promise<ProdutoDashboard[]> {
    return this.produtosDashboardService.getProdutosEstoqueBaixo(limite)
  }

  @Get('por-grupo')
  @ApiOperation({
    summary: 'Produtos por grupo',
    description: 'Retorna todos os produtos de um grupo específico',
  })
  @ApiQuery({
    name: 'codGrupo',
    required: true,
    type: Number,
    description: 'Código do grupo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos do grupo',
    type: [ProdutoDashboardDto],
  })
  async getProdutosPorGrupo(
    @Query('codGrupo') codGrupo: number,
  ): Promise<ProdutoDashboard[]> {
    return this.produtosDashboardService.getProdutosPorGrupo(codGrupo)
  }

  @Get('recentes')
  @ApiOperation({
    summary: 'Produtos mais recentes',
    description: 'Retorna os produtos mais recentemente alterados',
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    type: Number,
    description: 'Número de produtos a retornar',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos recentes',
    type: [ProdutoDashboardDto],
  })
  async getProdutosRecentes(
    @Query('limite') limite: number = 10,
  ): Promise<ProdutoDashboard[]> {
    return this.produtosDashboardService.getProdutosRecentes(limite)
  }

  @Get('buscar')
  @ApiOperation({
    summary: 'Buscar produtos por descrição',
    description:
      'Retorna produtos que contenham o termo de busca na descrição (autocomplete)',
  })
  @ApiQuery({
    name: 'termo',
    required: true,
    type: String,
    description: 'Termo de busca',
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    type: Number,
    description: 'Número de resultados',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos encontrados',
    type: [ProdutoDashboardDto],
  })
  async buscarProdutosPorDescricao(
    @Query('termo') termo: string,
    @Query('limite') limite: number = 10,
  ): Promise<ProdutoDashboard[]> {
    return this.produtosDashboardService.buscarProdutosPorDescricao(
      termo,
      limite,
    )
  }

  @Get('estatisticas/por-grupo')
  @ApiOperation({
    summary: 'Estatísticas por grupo',
    description: 'Retorna estatísticas de produtos agrupados por grupo',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas por grupo',
    schema: {
      example: [
        {
          CODGRUPOPROD: 1,
          quantidade: 100,
          ativos: 95,
        },
      ],
    },
  })
  async getEstatisticasPorGrupo(): Promise<any[]> {
    return this.produtosDashboardService.getEstatisticasPorGrupo()
  }

  @Get('controle/produtos')
  @ApiOperation({
    summary: 'Produtos com sistema de controle',
    description:
      'Retorna produtos que possuem contestações ou controle de qualidade (TITCONTEST/LISCONTEST)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos com sistema de controle',
    type: [ProdutoDashboardDto],
  })
  async getProdutosComContestacoes(): Promise<ProdutoDashboard[]> {
    return this.produtosDashboardService.getProdutosComContestacoes()
  }

  @Get('controle/estatisticas')
  @ApiOperation({
    summary: 'Estatísticas de controle',
    description:
      'Retorna estatísticas dos tipos de controle (TITCONTEST) encontrados',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas de controle',
    schema: {
      example: [
        {
          titulo: 'TIPO1',
          quantidade: 50,
          ativos: 45,
        },
      ],
    },
  })
  async getEstatisticasContestacoes(): Promise<any[]> {
    return this.produtosDashboardService.getEstatisticasContestacoes()
  }

  @Get('controle/:codprod')
  @ApiOperation({
    summary: 'Detalhes de controle de um produto',
    description:
      'Retorna os detalhes do sistema de controle para um produto específico',
  })
  @ApiParam({ name: 'codprod', type: Number, description: 'Código do produto' })
  @ApiResponse({
    status: 200,
    description: 'Detalhes de controle do produto',
    schema: {
      example: {
        codprod: 123,
        descrprod: 'Produto Exemplo',
        tituloContestacao: 'TIPO1',
        listaContestacoes: 'Detalhes da contestação...',
        produtoAtivo: true,
        dataUltimaAlteracao: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  async getContestacoesPorProduto(
    @Param('codprod') codprod: number,
  ): Promise<any> {
    return this.produtosDashboardService.getContestacoesPorProduto(codprod)
  }

  @Get('admin/test')
  @ApiOperation({ summary: 'Teste de saúde do módulo' })
  @ApiResponse({ status: 200, description: 'Módulo funcionando' })
  async test() {
    return {
      status: 'ProdutosDashboardModule is working',
      endpoints: [
        'GET /resumo',
        'GET /filtros',
        'GET /estoque-baixo',
        'GET /por-grupo',
        'GET /recentes',
        'GET /buscar',
        'GET /estatisticas/por-grupo',
        'GET /controle/produtos',
        'GET /controle/estatisticas',
        'GET /controle/:codprod',
      ],
    }
  }
}
