import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger'
import { PaginatedResult } from '../../common/pagination/pagination.types'
import { TokenAuthGuard } from '../auth/token-auth.guard'
import { TgfvenFindAllDto } from './models/tgfven-find-all.dto'
import { Tgfven } from './models/tgfven.interface'
import { TgfvenService } from './tgfven.service'

@ApiBearerAuth('JWT-auth')
@ApiTags('E. tgfven')
@UseGuards(TokenAuthGuard)
@Controller('tgfven')
export class TgfvenController {
  constructor(private readonly tgfvenService: TgfvenService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar vendedores com paginação, filtros e ordenação',
    description:
      'Retorna uma lista paginada de vendedores com suporte a filtros por código do parceiro, nome do parceiro, apelido e tipo de vendedor.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Página atual (padrão: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    description: 'Itens por página (padrão: 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    description: 'Ordenação (padrão: CODVEND DESC)',
    example: 'CODVEND DESC',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    type: String,
    description: 'Campos a selecionar (separados por vírgula, padrão: *)',
    example: '*',
  })
  @ApiQuery({
    name: 'codparc',
    required: false,
    type: Number,
    description: 'Código do parceiro',
  })
  @ApiQuery({
    name: 'nomeparc',
    required: false,
    type: String,
    description: 'Nome do parceiro',
  })
  @ApiQuery({
    name: 'apelido',
    required: false,
    type: String,
    description: 'Apelido do vendedor',
  })
  @ApiQuery({
    name: 'tipvend',
    required: false,
    type: String,
    description: 'Tipo de vendedor',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de vendedores retornada com sucesso',
    schema: {
      example: {
        data: [
          {
            codvend: 1,
            tipvend: 'V',
            apelido: 'VENDEDOR1',
            codparc: 123,
            codreg: 1,
            comvenda: 10.5,
            dtalter: '2023-01-01T00:00:00.000Z',
            codusu: 1,
            tgfpar: { codparc: 123, nomeparc: 'Parceiro Exemplo' },
          },
        ],
        total: 50,
        page: 1,
        perPage: 10,
        lastPage: 5,
        hasMore: true,
      },
    },
  })
  async findAll(
    @Query() dto: TgfvenFindAllDto,
  ): Promise<PaginatedResult<Tgfven>> {
    return this.tgfvenService.findAll(dto)
  }

  @Get(':codvend')
  @ApiOperation({ summary: 'Buscar vendedor por código' })
  @ApiParam({
    name: 'codvend',
    type: Number,
    description: 'Código do vendedor',
  })
  @ApiResponse({
    status: 200,
    description: 'Vendedor encontrado',
    schema: {
      example: {
        codvend: 1,
        tipvend: 'V',
        apelido: 'VENDEDOR1',
        codparc: 123,
        codreg: 1,
        comvenda: 10.5,
        dtalter: '2023-01-01T00:00:00.000Z',
        codusu: 1,
        tgfpar: { codparc: 123, nomeparc: 'Parceiro Exemplo' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Vendedor não encontrado' })
  async findById(@Param('codvend') codvend: number): Promise<Tgfven | null> {
    return this.tgfvenService.findById(codvend)
  }

  @Get('admin/test')
  @ApiOperation({ summary: 'Teste do módulo TGFVEN' })
  @ApiResponse({ status: 200, description: 'Módulo funcionando' })
  async adminTest(): Promise<{ status: string }> {
    return { status: 'Tgfven module is working' }
  }
}
