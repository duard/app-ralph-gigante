import {
  Controller,
  Get,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
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
import { TgfcabService } from './tgfcab.service'
import { TgfcabFindAllDto } from './models/tgfcab-find-all.dto'
import { Tgfcab } from './models/tgfcab.interface'
import { PaginatedResult } from '../../common/pagination/pagination.types'

/**
 * Controller para TGFCAB - Cabeçalhos de Notas Fiscais
 * Fornece endpoints para consultar notas fiscais com paginação, filtros avançados e relações.
 */
@ApiTags('E. Cabeçalhos de Notas (TGFCAB)')
@ApiBearerAuth('JWT-auth')
@Controller('tgfcab')
export class TgfcabController {
  constructor(private readonly tgfcabService: TgfcabService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar cabeçalhos de notas fiscais',
    description:
      'Retorna uma lista paginada de cabeçalhos de notas com suporte a filtros avançados por códigos, datas, valores e status. Inclui relações aninhadas com TGFTOP, TGFPAR e TGFVEN. Dados reais do Sankhya ERP.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de notas retornada com sucesso',
    schema: {
      example: {
        data: [
          {
            nunota: 273248,
            numnota: 16020,
            codtipoper: 505,
            codparc: 100045,
            codvend: 0,
            statusnota: 'L',
            dtneg: '2025-01-22T00:00:00.000Z',
            vlrnota: 10.05,
            tipmov: 'Q',
            tgftop: { codtipoper: 505, descrtipoper: 'Descrição do Tipo' },
            tgfpar: { codparc: 100045, nomeparc: 'Nome do Parceiro' },
            tgfven: { codvend: 0, nomevend: 'Nome do Vendedor' },
          },
        ],
        total: 208860,
        page: 1,
        perPage: 10,
        lastPage: 20886,
        hasMore: true,
      },
    },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Página atual (padrão: 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    description: 'Itens por página (padrão: 10)',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    description: 'Ordenação (ex: NUNOTA DESC)',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    type: String,
    description: 'Campos a retornar (ex: nunota,numnota ou * para todos)',
  })
  @ApiQuery({
    name: 'codtipoper',
    required: false,
    type: Number,
    description: 'Filtrar por código do tipo de operação',
  })
  @ApiQuery({
    name: 'codparc',
    required: false,
    type: Number,
    description: 'Filtrar por código do parceiro',
  })
  @ApiQuery({
    name: 'codvend',
    required: false,
    type: Number,
    description: 'Filtrar por código do vendedor',
  })
  @ApiQuery({
    name: 'statusnota',
    required: false,
    type: String,
    description: 'Filtrar por status da nota (L/Liberada)',
  })
  @ApiQuery({
    name: 'dtneg',
    required: false,
    type: String,
    description: 'Filtrar por data de negociação (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'vlrnotaMin',
    required: false,
    type: Number,
    description: 'Valor mínimo da nota',
  })
  @ApiQuery({
    name: 'vlrnotaMax',
    required: false,
    type: Number,
    description: 'Valor máximo da nota',
  })
  @ApiQuery({
    name: 'tipmov',
    required: false,
    type: String,
    description: 'Tipo de movimento (V/P/D/A/O/C/E/H/T/J/Q/L/F)',
  })
  @UseInterceptors(CacheInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(
    @Query() dto: TgfcabFindAllDto,
  ): Promise<PaginatedResult<Tgfcab>> {
    return this.tgfcabService.findAll(dto)
  }

  @Get(':nunota')
  @ApiOperation({
    summary: 'Buscar cabeçalho de nota fiscal por NUNOTA',
    description:
      'Retorna os dados completos de uma nota fiscal específica, incluindo todos os campos e relações aninhadas com tipos de operação, parceiros e vendedores.',
  })
  @ApiResponse({
    status: 200,
    description: 'Nota encontrada com sucesso',
    schema: {
      example: {
        nunota: 273248,
        numnota: 16020,
        codtipoper: 505,
        codparc: 100045,
        codvend: 0,
        statusnota: 'L',
        dtneg: '2025-01-22T00:00:00.000Z',
        vlrnota: 10.05,
        tipmov: 'Q',
        tgftop: { codtipoper: 505, descrtipoper: 'Descrição do Tipo' },
        tgfpar: { codparc: 100045, nomeparc: 'Nome do Parceiro' },
        tgfven: { codvend: 0, nomevend: 'Nome do Vendedor' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Nota não encontrada no Sankhya ERP',
  })
  @ApiParam({
    name: 'nunota',
    type: Number,
    description: 'Número único da nota (NUNOTA)',
    example: 273248,
  })
  async findById(@Param('nunota') nunota: number): Promise<Tgfcab | null> {
    return this.tgfcabService.findById(nunota)
  }

  @Get('admin/test')
  @ApiOperation({
    summary: 'Teste de saúde do módulo TGFCAB',
    description:
      'Verifica se o módulo de cabeçalhos de notas está funcionando corretamente. Retorna status de saúde.',
  })
  @ApiResponse({
    status: 200,
    description: 'Módulo TGFCAB funcionando',
    schema: { example: { status: 'Tgfcab module is working' } },
  })
  async test() {
    return { status: 'Tgfcab module is working' }
  }
}
