import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { PaginatedResult } from '../../common/pagination/pagination.types'
import { TokenAuthGuard } from '../auth/token-auth.guard'
import { TgfestService } from './tgfest.service'

@ApiTags('E. Estoque (TGFEST)')
@UseGuards(TokenAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('sankhya/tgfest')
export class TgfestController {
  constructor(private readonly tgfestService: TgfestService) {}

  /**
   * 📋 Resumo de Estoque e Últimas Compras
   * Lista produtos com dados de estoque e últimas compras (query especial)
   */
  @Get('resumo-ultimas-compras')
  @ApiOperation({
    summary: 'Resumo de Estoque e Últimas Compras',
    description:
      'Lista produtos com dados de estoque, grupo e últimas compras (data, preço, nota, fornecedor).',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumo retornado',
    schema: {
      example: {
        data: [
          {
            codprod: 2572,
            descrprod: 'COPO DESCARTAVEL',
            codgrupoprod: 20301,
            descrgrupoprod: 'COPA E COZINHA',
            estoque: 22500,
            data_ultima_compra: '2023-04-25T00:00:00.000Z',
            preco_ultima_compra: 0.0435,
            nota_ultima_compra: 48295,
            fornecedor_ultima_compra: 201,
          },
        ],
        total: 50,
        page: 1,
        perPage: 50,
      },
    },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Página (padrão: 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    description: 'Itens por página (padrão: 50)',
  })
  async getResumoUltimasCompras(
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ): Promise<PaginatedResult<any>> {
    return this.tgfestService.getResumoUltimasCompras({
      page: page ?? 1,
      perPage: perPage ?? 50,
    })
  }

  /**
   * 🔍 Busca Avançada de Produtos com Estoque
   * Busca poderosa em múltiplos campos com filtros avançados
   */
  @Get('search-avancado')
  @ApiOperation({
    summary: 'Busca Avançada de Produtos',
    description:
      'Busca poderosa em múltiplos campos (produto, grupo, fornecedor, local) com paginação e filtros avançados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados da busca',
    schema: {
      example: {
        data: [
          {
            codprod: 2572,
            descrprod: 'COPO DESCARTAVEL',
            codgrupoprod: 20301,
            descrgrupoprod: 'COPA E COZINHA',
            estoque: 22500,
            nome_local: 'ALMOXARIFADO',
            nome_parceiro: 'FORNECEDOR ABC',
            score: 95,
          },
        ],
        total: 15,
        page: 1,
        perPage: 50,
        searchTime: '45ms',
      },
    },
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description:
      'Termo de busca (pesquisa em produto, grupo, fornecedor, local)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Página (padrão: 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    description: 'Itens por página (padrão: 50)',
  })
  @ApiQuery({
    name: 'estoqueMin',
    required: false,
    type: Number,
    description: 'Estoque mínimo (filtro opcional)',
  })
  @ApiQuery({
    name: 'estoqueMax',
    required: false,
    type: Number,
    description: 'Estoque máximo (filtro opcional)',
  })
  @ApiQuery({
    name: 'ativo',
    required: false,
    type: String,
    description: 'Status do produto (S/N, padrão: S)',
  })
  async searchAvancado(
    @Query('q') q: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('estoqueMin') estoqueMin?: number,
    @Query('estoqueMax') estoqueMax?: number,
    @Query('ativo') ativo?: string,
  ): Promise<any> {
    return this.tgfestService.searchAvancado({
      query: q,
      page: page ?? 1,
      perPage: perPage ?? 50,
      estoqueMin,
      estoqueMax,
      ativo: ativo ?? 'S',
    })
  }
}
