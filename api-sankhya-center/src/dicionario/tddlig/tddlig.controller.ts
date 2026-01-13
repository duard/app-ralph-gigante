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
import { TddligService } from './tddlig.service'
import { TddligFindAllDto } from './models/tddlig-find-all.dto'
import { Tddlig } from './models/tddlig.interface'

type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  perPage: number
  lastPage: number
  hasMore: boolean
}

@ApiBearerAuth('JWT-auth')
@ApiTags('C. Dicionário de Dados - Ligações entre Campos (TDDLIG)')
@Controller('dicionario/ligacoes-campos')
@UseGuards(TokenAuthGuard)
export class TddligController {
  constructor(private readonly tddligService: TddligService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar ligações entre campos com paginação e filtros',
    description:
      'Retorna uma lista paginada de ligações entre instâncias de campos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ligações retornada com sucesso',
    schema: {
      example: {
        data: [
          {
            nuinstorig: 1,
            nuinstdest: 2,
            tipligacao: 'I',
            inserir: 'N',
            alterar: 'N',
            excluir: 'N',
            obrigatoria: 'S',
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
    description: 'Ordenação (ex: nuinstorig ASC)',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    type: String,
    description: 'Campos a retornar (separados por vírgula ou * para todos)',
  })
  @ApiQuery({
    name: 'nuinstorig',
    required: false,
    type: Number,
    description: 'Filtrar por instância origem',
  })
  @ApiQuery({
    name: 'nuinstdest',
    required: false,
    type: Number,
    description: 'Filtrar por instância destino',
  })
  @ApiQuery({
    name: 'tipligacao',
    required: false,
    type: String,
    description: 'Filtrar por tipo de ligação',
  })
  async findAll(
    @Query() dto: TddligFindAllDto,
  ): Promise<PaginatedResult<Tddlig>> {
    return this.tddligService.findAll(dto)
  }

  @Get(':nuinstorig/:nuinstdest')
  @ApiOperation({ summary: 'Buscar ligação por NUINSTORIG e NUINSTDEST' })
  @ApiParam({
    name: 'nuinstorig',
    type: Number,
    description: 'Número da instância origem',
  })
  @ApiParam({
    name: 'nuinstdest',
    type: Number,
    description: 'Número da instância destino',
  })
  @ApiResponse({ status: 200, description: 'Ligação encontrada' })
  @ApiResponse({ status: 404, description: 'Ligação não encontrada' })
  async findById(
    @Param('nuinstorig') nuinstorig: number,
    @Param('nuinstdest') nuinstdest: number,
  ): Promise<Tddlig | null> {
    return this.tddligService.findById(+nuinstorig, +nuinstdest)
  }
}
