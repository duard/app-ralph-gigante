import {
  Controller,
  Get,
  Param,
  Query,
  UsePipes,
  UseInterceptors,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common'

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { PaginatedResult } from '../../common/pagination/pagination.types'
import { TgfiteFindAllDto } from './models/tgfite-find-all.dto'
import { Tgfite } from './models/tgfite.interface'
import { TgfiteService } from './tgfite.service'
import { TokenAuthGuard } from '../auth/token-auth.guard'

/**
 * Controller para gerenciamento de itens de notas (TGFITE)
 */
@ApiBearerAuth('JWT-auth')
@ApiTags('E. TGFITE - Itens de Notas')
@UseGuards(TokenAuthGuard)
@Controller('tgfite')
export class TgfiteController {
  constructor(private readonly tgfiteService: TgfiteService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar itens de nota',
    description:
      'Retorna uma lista paginada de itens de nota com filtros por nota, produto, grupo, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista retornada com sucesso',
    schema: {
      example: {
        data: [
          {
            nunota: 123,
            sequencia: 1,
            qtdneg: 10,
            vlrtot: 1000,
            tgfpro: { descrprod: 'Produto X' },
          },
        ],
        total: 500,
        page: 1,
        perPage: 10,
        lastPage: 50,
        hasMore: true,
      },
    },
  })
  @ApiQuery({
    name: 'nunota',
    required: false,
    type: Number,
    description: 'Filtrar por número da nota',
  })
  @ApiQuery({
    name: 'codprod',
    required: false,
    type: Number,
    description: 'Filtrar por código do produto',
  })
  @ApiQuery({
    name: 'codgrupoprod',
    required: false,
    type: Number,
    description: 'Filtrar por grupo de produto',
  })
  @UseInterceptors(CacheInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(
    @Query() dto: TgfiteFindAllDto,
  ): Promise<PaginatedResult<Tgfite>> {
    return this.tgfiteService.findAll(dto)
  }

  @Get(':nunota/:sequencia')
  @ApiOperation({ summary: 'Buscar item por nota e sequência' })
  @ApiResponse({ status: 200, description: 'Item encontrado' })
  @ApiResponse({ status: 404, description: 'Item não encontrado' })
  @ApiParam({ name: 'nunota', type: Number, description: 'Número da nota' })
  @ApiParam({
    name: 'sequencia',
    type: Number,
    description: 'Sequência do item',
  })
  async findById(
    @Param('nunota') nunota: number,
    @Param('sequencia') sequencia: number,
  ): Promise<Tgfite | null> {
    return this.tgfiteService.findById(+nunota, +sequencia)
  }

  @Get('movimentacoes/locais')
  @ApiOperation({
    summary: 'Mostrar movimentações entre locais',
    description:
      'Lista itens de notas que envolvem movimentação entre locais diferentes',
  })
  @ApiResponse({ status: 200, description: 'Movimentações retornadas' })
  @UseInterceptors(CacheInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getMovimentacoesLocais(
    @Query() dto: TgfiteFindAllDto,
  ): Promise<PaginatedResult<any>> {
    return this.tgfiteService.getMovimentacoesLocais(dto)
  }

  @Get('admin/test')
  async test() {
    return { status: 'Tgfite module is working' }
  }
}
