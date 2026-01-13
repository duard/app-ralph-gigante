import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import {
  PaginatedResult,
  wrapAllAsSinglePage,
} from '../../common/pagination/pagination.types'
import { TokenAuthGuard } from '../auth/token-auth.guard'
import { ConsumoService } from './consumo/consumo.service'
import { TgfproFindAllDto } from './models/tgfpro-find-all.dto'
import { Tgfpro } from './models/tgfpro.interface'
import { TgfproSimplified } from './models/tgfpro-simplified.interface'
import { TgfproService } from './tgfpro.service'

@ApiBearerAuth('JWT-auth')
@ApiTags('E. tgfpro')
@UseGuards(TokenAuthGuard)
@Controller('tgfpro')
export class TgfproController {
  constructor(
    private readonly tgfproService: TgfproService,
    private readonly consumoService: ConsumoService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar produtos' })
  @ApiResponse({ status: 200, description: 'Lista de produtos', type: Object })
  async findAll(
    @Query() dto: TgfproFindAllDto,
  ): Promise<PaginatedResult<Tgfpro>> {
    const hasSpecificFilters =
      dto.search ||
      dto.descrprod ||
      dto.referencia ||
      dto.marca ||
      dto.codgrupoprod ||
      dto.tipcontest ||
      dto.liscontest
    const effectiveDto = {
      ...dto,
      sort: dto.sort || (hasSpecificFilters ? 'DESCRPROD ASC' : 'CODPROD DESC'),
      page: dto.page || 1,
      perPage: dto.perPage || 10,
    }
    return this.tgfproService.findAll(effectiveDto)
  }

  @Get(':codprod(\\d+)')
  @ApiOperation({ summary: 'Buscar produto por código' })
  @ApiResponse({ status: 200, description: 'Produto encontrado', type: Object })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async findById(@Param('codprod') codprod: number): Promise<Tgfpro | null> {
    return this.tgfproService.findById(codprod)
  }

  @Get('simplified')
  @ApiOperation({
    summary: 'Listar produtos simplificados (ultra rápido)',
    description:
      'Endpoint leve e rápido que retorna apenas campos essenciais sem JOINs. Ideal para listagens e autocomplete.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Busca em descrição, referência ou marca',
  })
  @ApiQuery({
    name: 'ativo',
    required: false,
    description: 'Filtro de status ativo (S/N)',
    enum: ['S', 'N'],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Página (padrão: 1)',
  })
  @ApiQuery({
    name: 'codgrupoprod',
    required: false,
    type: Number,
    description: 'Filtrar por código do grupo',
  })
  @ApiQuery({
    name: 'localizacao',
    required: false,
    description: 'Filtrar por localização (LIKE)',
  })
  @ApiQuery({
    name: 'tipcontest',
    required: false,
    description: 'Filtrar por tipo de controle (LIKE)',
  })
  @ApiQuery({
    name: 'expandControle',
    required: false,
    type: Boolean,
    description: 'Expandir linhas para cada item de controle (LISCONTEST)',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description:
      'Ordenação (ex: codprod desc, descrprod asc, grupo, localizacao, tipcontest, ativo)',
  })
  @ApiQuery({
    name: 'comLocal',
    required: false,
    type: Boolean,
    description: 'Apenas produtos com localização definida',
  })
  @ApiQuery({
    name: 'semLocal',
    required: false,
    type: Boolean,
    description: 'Apenas produtos sem localização',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    description: 'Itens por página (padrão: 50, máximo: 200)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista simplificada de produtos',
    schema: {
      example: {
        data: [
          {
            codprod: 123,
            descrprod: 'PARAFUSO CABECA CHATA',
            referencia: 'P123',
            marca: 'GENERICO',
            codvol: 'UN',
            ativo: 'S',
            codgrupoprod: 10,
            descrgrupoprod: 'PARAFUSOS',
            localizacao: 'A1-01',
            tipcontest: 'L',
            liscontest: 'LOTE1',
          },
        ],
        total: 1000,
        page: 1,
        perPage: 50,
        lastPage: 20,
        hasMore: true,
      },
    },
  })
  async findAllSimplified(
    @Query('search') search?: string,
    @Query('ativo') ativo?: string,
    @Query('codgrupoprod') codgrupoprod?: number,
    @Query('localizacao') localizacao?: string,
    @Query('tipcontest') tipcontest?: string,
    @Query('expandControle') expandControle?: string,
    @Query('sort') sort?: string,
    @Query('comLocal') comLocal?: string,
    @Query('semLocal') semLocal?: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ): Promise<PaginatedResult<TgfproSimplified>> {
    return this.tgfproService.findAllSimplified({
      search,
      ativo,
      codgrupoprod,
      localizacao,
      tipcontest,
      expandControle: expandControle === 'true',
      sort,
      comLocal: comLocal === 'true',
      semLocal: semLocal === 'true',
      page,
      perPage,
    })
  }

  @Get('with-stock/all')
  @ApiOperation({ summary: 'Listar produtos com informações de estoque' })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos com estoque',
    type: Object,
  })
  async findAllWithStock(
    @Query() dto: TgfproFindAllDto,
  ): Promise<PaginatedResult<any>> {
    return this.tgfproService.findAllWithStock(dto)
  }

  @Get('search/:termo')
  @ApiOperation({
    summary: 'Busca avançada de produtos com relevância',
    description:
      'Busca inteligente que engloba múltiplos campos com pontuação de relevância. Ultra rápida e precisa.',
  })
  @ApiParam({
    name: 'termo',
    description: 'Termo de busca (mínimo 2 caracteres)',
    example: 'parafuso',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limite de resultados (padrão: 50, máximo: 200)',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados ordenados por relevância',
    schema: {
      example: {
        data: [
          {
            codprod: 123,
            descrprod: 'PARAFUSO CABECA CHATA',
            referencia: 'P123',
            marca: 'GENERICO',
          },
        ],
        total: 1,
        page: 1,
        perPage: 1,
        lastPage: 1,
        hasMore: false,
      },
    },
  })
  async searchAvancada(
    @Param('termo') termo: string,
    @Query('limit') limit?: number,
  ): Promise<PaginatedResult<Tgfpro>> {
    const maxLimit = Math.min(limit || 50, 200)
    const results = await this.tgfproService.searchAvancada(termo, maxLimit)
    return wrapAllAsSinglePage(results)
  }

  @Get('ultra-search')
  @ApiOperation({ summary: 'Ultra search for products with rich data' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term for product description',
  })
  @ApiQuery({ name: 'marca', required: false, description: 'Brand filter' })
  @ApiQuery({
    name: 'ativo',
    required: false,
    description: 'Active status (S/N)',
  })
  @ApiQuery({
    name: 'codgrupoprod',
    required: false,
    description: 'Grupo de produto (código numérico)',
  })
  @ApiQuery({
    name: 'ncm',
    required: false,
    description: 'Filtro por NCM (LIKE)',
  })
  @ApiQuery({
    name: 'localizacao',
    required: false,
    description: 'Filtro por localização (LIKE)',
  })
  @ApiQuery({
    name: 'codcencus',
    required: false,
    description: 'Centro de custo (código numérico)',
  })
  @ApiQuery({
    name: 'tipcontest',
    required: false,
    description: 'Tipo de controle (LIKE)',
  })
  @ApiQuery({
    name: 'liscontest',
    required: false,
    description: 'Lista de controle contém (LIKE)',
  })
  @ApiQuery({
    name: 'includeEstoque',
    required: false,
    description: 'Incluir agregados de estoque (S/N)',
  })
  @ApiQuery({
    name: 'includeJoins',
    required: false,
    description: 'Incluir joins (grupo/volume) (S/N)',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'perPage', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'Products found',
    schema: {
      example: {
        data: [
          {
            codprod: 123,
            descrprod: 'PARAFUSO CABECA CHATA',
            codgrupoprod: 1,
            codvol: 'UN',
            pesobruto: 0.1,
            pesoliq: 0.09,
          },
        ],
        total: 1,
        page: 1,
        perPage: 10,
        lastPage: 1,
        hasMore: false,
      },
    },
  })
  async ultraSearch(
    @Query() dto: TgfproFindAllDto,
  ): Promise<PaginatedResult<Tgfpro>> {
    return this.tgfproService.ultraSearch(dto as any)
  }

  @Get('consumo-periodo/:codprod')
  @ApiOperation({
    summary: 'Consultar consumo/movimentações de produto em período',
    description:
      'Retorna todas as movimentações de entrada/saída de um produto em um período específico',
  })
  @ApiParam({
    name: 'codprod',
    description: 'Código do produto',
    example: 3680,
    type: Number,
  })
  @ApiQuery({
    name: 'dataInicio',
    description: 'Data inicial (YYYY-MM-DD)',
    example: '2025-12-01',
    required: true,
  })
  @ApiQuery({
    name: 'dataFim',
    description: 'Data final (YYYY-MM-DD)',
    example: '2025-12-31',
    required: true,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    description: 'Items per page',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Movimentações do produto no período',
    schema: {
      example: {
        codprod: 3680,
        dataInicio: '2025-12-01',
        dataFim: '2025-12-31',
        page: 1,
        perPage: 50,
        totalMovimentacoes: 108,
        saldoAnterior: { qtd: 153, valor: -30525.93 },
        movimentacoes: [
          {
            data_referencia: '2025-12-26T00:00:00.000Z',
            tipo_registro: 'MOVIMENTACAO',
            nunota: 273279,
            tipmov: 'Q',
            tipo_movimentacao: 'Requisição',
            codparc: 3618,
            nome_parceiro: 'DANUBIA CRISTINA GARCIA DE OLIVEIRA',
            usuario: 'ELLEN.SOUZA',
            quantidade_mov: -3,
            valor_mov: -71.07,
            saldo_qtd_anterior: 153,
            saldo_qtd_final: 150,
          },
        ],
        saldoAtual: { qtd: 104, valor: -30525.93 },
      },
    },
  })
  async consultarConsumoPeriodo(
    @Param('codprod') codprod: number,
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.consumoService.consultarConsumoPeriodo(
      codprod,
      dataInicio,
      dataFim,
      Number(page) || 1,
      Number(perPage) || 50,
    )
  }

  @Get('admin/test')
  async test() {
    return { message: 'Teste TGFPRO', timestamp: new Date().toISOString() }
  }
}
