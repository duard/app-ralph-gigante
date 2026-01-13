import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { TokenAuthGuard } from '../../sankhya/auth/token-auth.guard'
import { TrdconService } from './trdcon.service'
import { TrdconFindAllDto } from './models/trdcon-find-all.dto'
import { Trdcon } from './models/trdcon.interface'

type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  perPage: number
  lastPage: number
  hasMore: boolean
}

@ApiBearerAuth('JWT-auth')
@ApiTags('C. Dicionário de Dados - Configurações de Tradução (TRDCON)')
@Controller('dicionario/traducao-configuracoes')
@UseGuards(TokenAuthGuard)
export class TrdconController {
  constructor(private readonly trdconService: TrdconService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar configurações de tradução com paginação e filtros',
    description: 'Retorna uma lista paginada de configurações de tradução.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de configurações retornada com sucesso',
    schema: {
      example: {
        data: [
          {
            nucontrole: 1,
            descrcontrole: 'Tradução de produtos',
            tipocontrole: 'PT',
          },
        ],
        total: 100,
        page: 1,
        perPage: 10,
        lastPage: 10,
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
    description: 'Ordenação (ex: nucontrole ASC)',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    type: String,
    description: 'Campos a retornar (separados por vírgula ou * para todos)',
  })
  @ApiQuery({
    name: 'nucontrole',
    required: false,
    type: Number,
    description: 'Filtrar por número do controle',
  })
  @ApiQuery({
    name: 'descrcontrole',
    required: false,
    type: String,
    description: 'Filtrar por descrição do controle',
  })
  @ApiQuery({
    name: 'tipocontrole',
    required: false,
    type: String,
    description: 'Filtrar por tipo de controle',
  })
  async findAll(
    @Query() dto: TrdconFindAllDto,
  ): Promise<PaginatedResult<Trdcon>> {
    return this.trdconService.findAll(dto)
  }

  @Get(':nucontrole')
  @ApiOperation({ summary: 'Buscar configuração por NUCONTROLE' })
  @ApiParam({
    name: 'nucontrole',
    type: Number,
    description: 'Número do controle',
  })
  @ApiResponse({ status: 200, description: 'Configuração encontrada' })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada' })
  async findById(
    @Param('nucontrole') nucontrole: number,
  ): Promise<Trdcon | null> {
    return this.trdconService.findById(+nucontrole)
  }
}
