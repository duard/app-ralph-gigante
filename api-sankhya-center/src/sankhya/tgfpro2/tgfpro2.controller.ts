import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger'
import { PaginatedResult } from '../../common/pagination/pagination.types'
import { TokenAuthGuard } from '../auth/token-auth.guard'
import { ProdutoFindAllDto, ConsumoFindAllDto } from './dtos'
import {
  Produto2,
  EstoqueLocal,
  MovimentacaoConsumo,
  ConsumoProduto,
  ConsumoAnalise,
} from './interfaces'
import { Tgfpro2Service } from './tgfpro2.service'

/**
 * Controller para endpoints TGFPRO2 (produtos com estoque por local)
 */
@ApiBearerAuth('JWT-auth')
@ApiTags('TGFPRO2 - Produtos com Estoque por Local')
@UseGuards(TokenAuthGuard)
@Controller('tgfpro2')
export class Tgfpro2Controller {
  constructor(private readonly tgfpro2Service: Tgfpro2Service) {}

  @Get('produtos')
  @ApiOperation({
    summary: 'Listar produtos com opção de estoque por local',
    description:
      'Lista produtos com filtros avançados e opção de incluir informações de estoque agregado e/ou detalhado por local',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos retornada com sucesso',
    schema: {
      example: {
        data: [
          {
            codprod: 3680,
            descrprod: 'PARAFUSO CABECA CHATA',
            referencia: 'REF123',
            marca: 'BOSCH',
            codgrupoprod: 1000,
            codvol: 'UN',
            ativo: 'S',
            tgfgru: {
              codgrupoprod: 1000,
              descrgrupoprod: 'FERRAGENS',
            },
            tgfvol: {
              codvol: 'UN',
              descrvol: 'UNIDADE',
            },
            estoque: {
              totalGeral: 150,
              totalMin: 50,
              totalMax: 200,
              qtdeLocais: 3,
              statusGeral: 'NORMAL',
            },
            estoqueLocais: [
              {
                codlocal: 101001,
                descrlocal: 'ALMOX PECAS',
                controle: null,
                quantidade: 100,
                estmin: 30,
                estmax: 150,
                statusLocal: 'NORMAL',
                percOcupacao: 66.67,
              },
            ],
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
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async findAll(
    @Query() dto: ProdutoFindAllDto,
  ): Promise<PaginatedResult<Produto2>> {
    return this.tgfpro2Service.findAll(dto)
  }

  @Get('produtos/:codprod')
  @ApiOperation({
    summary: 'Buscar produto por código',
    description:
      'Retorna detalhes completos de um produto específico, com opção de incluir informações de estoque',
  })
  @ApiParam({
    name: 'codprod',
    description: 'Código do produto',
    example: 3680,
    type: Number,
  })
  @ApiQuery({
    name: 'includeEstoque',
    required: false,
    description: 'Incluir resumo de estoque agregado',
    type: Boolean,
    example: false,
  })
  @ApiQuery({
    name: 'includeEstoqueLocais',
    required: false,
    description: 'Incluir estoque detalhado por local',
    type: Boolean,
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Produto encontrado com sucesso',
    schema: {
      example: {
        codprod: 3680,
        descrprod: 'PARAFUSO CABECA CHATA',
        referencia: 'REF123',
        marca: 'BOSCH',
        codgrupoprod: 1000,
        codvol: 'UN',
        ativo: 'S',
        tgfgru: {
          codgrupoprod: 1000,
          descrgrupoprod: 'FERRAGENS',
        },
        tgfvol: {
          codvol: 'UN',
          descrvol: 'UNIDADE',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado',
  })
  async findOne(
    @Param('codprod', ParseIntPipe) codprod: number,
    @Query('includeEstoque') includeEstoque?: boolean,
    @Query('includeEstoqueLocais') includeEstoqueLocais?: boolean,
  ): Promise<Produto2> {
    const produto = await this.tgfpro2Service.findOne(
      codprod,
      includeEstoque,
      includeEstoqueLocais,
    )

    if (!produto) {
      throw new NotFoundException(`Produto com código ${codprod} não encontrado`)
    }

    return produto
  }

  @Get('produtos/:codprod/locais')
  @ApiOperation({
    summary: 'Buscar estoque por local de um produto',
    description:
      'Retorna lista de todos os locais onde o produto possui estoque, com quantidades e status',
  })
  @ApiParam({
    name: 'codprod',
    description: 'Código do produto',
    example: 3680,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Estoque por local retornado com sucesso',
    schema: {
      example: [
        {
          codlocal: 101001,
          descrlocal: 'ALMOX PECAS',
          controle: null,
          quantidade: 100,
          estmin: 30,
          estmax: 150,
          statusLocal: 'NORMAL',
          percOcupacao: 66.67,
        },
        {
          codlocal: 101002,
          descrlocal: 'ALMOX FERRAMENTAS',
          controle: null,
          quantidade: 50,
          estmin: 20,
          estmax: 100,
          statusLocal: 'NORMAL',
          percOcupacao: 50.0,
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado ou sem estoque',
  })
  async findEstoqueLocais(
    @Param('codprod', ParseIntPipe) codprod: number,
  ): Promise<EstoqueLocal[]> {
    return this.tgfpro2Service.findEstoqueLocais(codprod)
  }

  @Get('grupos')
  @ApiOperation({
    summary: 'Listar todos os grupos de produtos',
    description:
      'Retorna lista de grupos de produtos com contagem total de produtos ativos em cada grupo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de grupos retornada com sucesso',
    schema: {
      example: [
        {
          codgrupoprod: 20303,
          descrgrupoprod: 'MATERIAL ESCRITORIO',
          totalProdutos: 45,
        },
        {
          codgrupoprod: 20102,
          descrgrupoprod: 'MECANICA',
          totalProdutos: 128,
        },
      ],
    },
  })
  async findAllGrupos(): Promise<
    Array<{ codgrupoprod: number; descrgrupoprod: string; totalProdutos: number }>
  > {
    return this.tgfpro2Service.findAllGrupos()
  }

  @Get('grupos/:codgrupoprod/produtos')
  @ApiOperation({
    summary: 'Listar produtos de um grupo específico',
    description: 'Retorna lista paginada de produtos ativos de um grupo específico',
  })
  @ApiParam({
    name: 'codgrupoprod',
    description: 'Código do grupo de produtos',
    example: 20303,
    type: Number,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página',
    example: 1,
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    description: 'Itens por página',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos do grupo retornada com sucesso',
  })
  async findByGrupo(
    @Param('codgrupoprod', ParseIntPipe) codgrupoprod: number,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ): Promise<PaginatedResult<Produto2>> {
    return this.tgfpro2Service.findByGrupo(
      codgrupoprod,
      page || 1,
      perPage || 10,
    )
  }

  @Get('locais')
  @ApiOperation({
    summary: 'Listar todos os locais de estoque',
    description:
      'Retorna lista de locais de estoque com contagem de produtos com estoque em cada local',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de locais retornada com sucesso',
    schema: {
      example: [
        {
          codlocal: 105002,
          descrlocal: 'MATERIAL ESCRITORIO',
          totalProdutos: 35,
        },
        {
          codlocal: 101001,
          descrlocal: 'ALMOX PECAS',
          totalProdutos: 254,
        },
      ],
    },
  })
  async findAllLocais(): Promise<
    Array<{ codlocal: number; descrlocal: string; totalProdutos: number }>
  > {
    return this.tgfpro2Service.findAllLocais()
  }

  @Get('locais/:codlocal/produtos')
  @ApiOperation({
    summary: 'Listar produtos em um local específico',
    description:
      'Retorna lista paginada de produtos ativos com estoque em um local específico',
  })
  @ApiParam({
    name: 'codlocal',
    description: 'Código do local de estoque',
    example: 105002,
    type: Number,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página',
    example: 1,
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    description: 'Itens por página',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos do local retornada com sucesso',
  })
  async findByLocal(
    @Param('codlocal', ParseIntPipe) codlocal: number,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ): Promise<PaginatedResult<Produto2>> {
    return this.tgfpro2Service.findByLocal(codlocal, page || 1, perPage || 10)
  }

  /**
   * ===========================================================================
   * ENDPOINTS DE CONSUMO DE PRODUTOS
   * ===========================================================================
   */

  @Get('consumo')
  @ApiOperation({
    summary: 'Listar movimentações de consumo de produtos',
    description:
      'Lista movimentações de consumo com filtros por produto, departamento, usuário, período, etc. Útil para rastrear consumo interno de produtos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de movimentações retornada com sucesso',
    schema: {
      example: {
        data: [
          {
            nunota: 123456,
            codprod: 3680,
            descrprod: 'FOLHAS A4 SULFITE 75G 210X297MM',
            qtdneg: 10,
            vlrunit: 25.5,
            vlrtot: 255.0,
            dtneg: '2026-01-10',
            coddep: 1,
            descrDep: 'TI',
            codusuinc: 311,
            nomeusu: 'CONVIDADE',
            codtipoper: 400,
            descrtipoper: 'REQUISIÇÃO INTERNA',
            atualizaEstoque: 'B',
            atualizaEstoqueDescr: 'Baixar estoque',
          },
        ],
        total: 150,
        page: 1,
        perPage: 10,
        lastPage: 15,
        hasMore: true,
      },
    },
  })
  async findConsumo(
    @Query() dto: ConsumoFindAllDto,
  ): Promise<PaginatedResult<MovimentacaoConsumo>> {
    return this.tgfpro2Service.findConsumo(dto)
  }

  @Get('consumo/produto/:codprod')
  @ApiOperation({
    summary: 'Análise de consumo de um produto específico',
    description:
      'Retorna análise detalhada do consumo de um produto, incluindo consumo por departamento e por usuário, com percentuais',
  })
  @ApiParam({
    name: 'codprod',
    description: 'Código do produto',
    example: 3680,
    type: Number,
  })
  @ApiQuery({
    name: 'dataInicio',
    required: false,
    description: 'Data inicial (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'dataFim',
    required: false,
    description: 'Data final (YYYY-MM-DD)',
    example: '2026-01-13',
  })
  @ApiResponse({
    status: 200,
    description: 'Análise de consumo retornada com sucesso',
    schema: {
      example: {
        codprod: 3680,
        descrprod: 'FOLHAS A4 SULFITE 75G 210X297MM',
        referencia: 'A4-75G',
        marca: 'PAPEL SUL',
        totalMovimentacoes: 45,
        quantidadeTotal: 1200,
        valorMedio: 25.5,
        valorTotal: 30600.0,
        primeiraMov: '2025-01-01',
        ultimaMov: '2026-01-10',
        departamentos: [
          {
            coddep: 1,
            descrDep: 'TI',
            quantidade: 600,
            percentual: 50.0,
          },
          {
            coddep: 2,
            descrDep: 'Financeiro',
            quantidade: 400,
            percentual: 33.33,
          },
          {
            coddep: 3,
            descrDep: 'RH',
            quantidade: 200,
            percentual: 16.67,
          },
        ],
        usuarios: [
          {
            codusuinc: 311,
            nomeusu: 'CONVIDADE',
            quantidade: 800,
            percentual: 66.67,
          },
        ],
      },
    },
  })
  async findConsumoProduto(
    @Param('codprod', ParseIntPipe) codprod: number,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ): Promise<ConsumoProduto> {
    return this.tgfpro2Service.findConsumoProduto(codprod, dataInicio, dataFim)
  }

  @Get('consumo/analise')
  @ApiOperation({
    summary: 'Análise completa de consumo por período',
    description:
      'Retorna análise completa de consumo em um período, incluindo top produtos, departamentos e usuários',
  })
  @ApiQuery({
    name: 'dataInicio',
    required: true,
    description: 'Data inicial (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'dataFim',
    required: true,
    description: 'Data final (YYYY-MM-DD)',
    example: '2026-01-13',
  })
  @ApiQuery({
    name: 'top',
    required: false,
    description: 'Quantidade de itens no top (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Análise completa retornada com sucesso',
    schema: {
      example: {
        periodo: {
          inicio: '2025-01-01',
          fim: '2026-01-13',
          dias: 378,
        },
        totais: {
          movimentacoes: 450,
          produtos: 85,
          departamentos: 8,
          usuarios: 12,
          quantidadeTotal: 15000,
          valorTotal: 125000.0,
        },
        topProdutos: [
          {
            codprod: 3680,
            descrprod: 'FOLHAS A4',
            quantidade: 5000,
            valor: 45000.0,
            percentual: 33.33,
          },
        ],
        topDepartamentos: [
          {
            coddep: 1,
            descrDep: 'TI',
            quantidade: 7500,
            valor: 62500.0,
            percentual: 50.0,
          },
        ],
        topUsuarios: [
          {
            codusuinc: 311,
            nomeusu: 'CONVIDADE',
            quantidade: 10000,
            valor: 83333.33,
            percentual: 66.67,
          },
        ],
      },
    },
  })
  async findConsumoAnalise(
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
    @Query('top') top?: number,
  ): Promise<ConsumoAnalise> {
    return this.tgfpro2Service.findConsumoAnalise(
      dataInicio,
      dataFim,
      top ? Number(top) : 10,
    )
  }
}
