import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { TokenAuthGuard } from '../auth/token-auth.guard'
import { Products2Service } from './products2.service'
import {
  ProductBasicDto,
  FindProductsDto,
  PaginatedProductDto,
} from './dto'

/**
 * Controller para módulo TGFPRO2 (Products v2)
 * Phase 1: Basic Listing
 *
 * Endpoints:
 * - GET /api/products2 - Lista produtos (com busca e paginação)
 * - GET /api/products2/:id - Busca por código
 * - GET /api/products2/group/:groupId - Filtro por grupo
 */
@ApiTags('Produtos v2')
@Controller('api/products2')
@ApiBearerAuth('JWT-auth')
@UseGuards(TokenAuthGuard)
export class Products2Controller {
  constructor(private readonly service: Products2Service) {}

  @Get()
  @ApiOperation({
    summary: 'Listar produtos ativos',
    description: `
      Retorna lista paginada de produtos ativos de consumo.

      **Casos de Uso:**
      - Listagem geral de produtos
      - Busca por descrição (parâmetro \`search\`)
      - Autocomplete e dropdowns
      - Seleção de produtos

      **Performance:**
      - Primeira requisição: 200-500ms (database gateway)
      - Cache futuro: ~50ms
      - Cache TTL planejado: 5 minutos

      **Filtros Disponíveis:**
      - \`search\`: Busca por descrição (LIKE)
      - \`page\`: Número da página (padrão: 1)
      - \`perPage\`: Itens por página (padrão: 20)

      **Baseado em:** docs/tgfpro/queries/01-basic-listing.md (Query 1.1 e 1.3)
    `,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (padrão: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    description: 'Itens por página (padrão: 20)',
    example: 20,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Termo de busca na descrição do produto',
    example: 'FOLHA',
  })
  @ApiResponse({
    status: 200,
    description: 'Produtos recuperados com sucesso',
    type: PaginatedProductDto,
    content: {
      'application/json': {
        example: {
          data: [
            {
              codprod: 3680,
              descrprod: 'FOLHAS A4 SULFITE 75G 210X297MM',
              referencia: 'A4-75G',
              ativo: 'S',
              usoprod: 'C',
              vlrultcompra: 23.44,
              dtalter: '2026-01-10T00:00:00.000Z',
            },
          ],
          total: 150,
          page: 1,
          perPage: 20,
          lastPage: 8,
          hasMore: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros inválidos',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: ['página deve ser um número inteiro'],
          error: 'Requisição Inválida',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token inválido ou expirado',
  })
  async findAll(@Query() dto: FindProductsDto) {
    if (dto.search) {
      return this.service.search(dto)
    }
    return this.service.findAll(dto)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar produto por código',
    description: `
      Retorna informações detalhadas de um produto específico pelo código (CODPROD).

      **Casos de Uso:**
      - Detalhes de produto
      - Validação de código
      - Informações para compras

      **Performance:**
      - Primeira requisição: 200-400ms (database gateway)
      - Cache futuro: ~50ms
      - Cache TTL planejado: 10 minutos

      **Baseado em:** docs/tgfpro/queries/01-basic-listing.md (Query 1.2)
    `,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Código do produto (CODPROD)',
    example: 3680,
  })
  @ApiResponse({
    status: 200,
    description: 'Produto encontrado com sucesso',
    type: ProductBasicDto,
    content: {
      'application/json': {
        example: {
          codprod: 3680,
          descrprod: 'FOLHAS A4 SULFITE 75G 210X297MM',
          referencia: 'A4-75G',
          ativo: 'S',
          usoprod: 'C',
          vlrultcompra: 23.44,
          dtalter: '2026-01-10T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Produto com código 3680 não encontrado',
          error: 'Não Encontrado',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token inválido ou expirado',
  })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id)
  }

  @Get('group/:groupId')
  @ApiOperation({
    summary: 'Listar produtos por grupo',
    description: `
      Retorna lista paginada de produtos de um grupo específico.

      **Casos de Uso:**
      - Filtro por grupo de produtos
      - Navegação por categorias
      - Análise de grupo

      **Performance:**
      - Primeira requisição: 300-500ms (database gateway, JOIN)
      - Cache futuro: ~50ms
      - Cache TTL planejado: 5 minutos

      **Baseado em:** docs/tgfpro/queries/01-basic-listing.md (Query 1.4)
    `,
  })
  @ApiParam({
    name: 'groupId',
    type: Number,
    description: 'Código do grupo de produtos (CODGRUPOPROD)',
    example: 10,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (padrão: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    description: 'Itens por página (padrão: 20)',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Produtos do grupo recuperados com sucesso',
    type: PaginatedProductDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token inválido ou expirado',
  })
  async findByGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query() dto: FindProductsDto,
  ) {
    return this.service.findByGroup(groupId, dto)
  }
}
