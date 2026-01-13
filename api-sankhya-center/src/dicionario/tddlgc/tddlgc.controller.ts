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
import { TddlgcService } from './tddlgc.service'
import { TddlgcFindAllDto } from './models/tddlgc-find-all.dto'
import { Tddlgc } from './models/tddlgc.interface'

type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  perPage: number
  lastPage: number
  hasMore: boolean
}

@ApiBearerAuth('JWT-auth')
@ApiTags('C. Dicionário de Dados - Logs de Ligações de Campos (TDDLGC)')
@Controller('dicionario/logs-ligacoes-campos')
@UseGuards(TokenAuthGuard)
export class TddlgcController {
  constructor(private readonly tddlgcService: TddlgcService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar logs de ligações de campos com paginação e filtros',
    description: 'Retorna uma lista paginada de logs de ligações entre campos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de logs retornada com sucesso',
    schema: {
      example: {
        data: [
          {
            nuinstorig: 1,
            nucampoorig: 331,
            nuinstdest: 2,
            nucampodest: 332,
            orig_obrigatoria: 'S',
            ordem: 1,
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
    name: 'nucampoorig',
    required: false,
    type: Number,
    description: 'Filtrar por campo origem',
  })
  @ApiQuery({
    name: 'nuinstdest',
    required: false,
    type: Number,
    description: 'Filtrar por instância destino',
  })
  @ApiQuery({
    name: 'nucampodest',
    required: false,
    type: Number,
    description: 'Filtrar por campo destino',
  })
  async findAll(
    @Query() dto: TddlgcFindAllDto,
  ): Promise<PaginatedResult<Tddlgc>> {
    return this.tddlgcService.findAll(dto)
  }

  @Get(':nuinstorig/:nucampoorig/:nuinstdest/:nucampodest')
  @ApiOperation({ summary: 'Buscar log por chaves compostas' })
  @ApiParam({
    name: 'nuinstorig',
    type: Number,
    description: 'Número da instância origem',
  })
  @ApiParam({
    name: 'nucampoorig',
    type: Number,
    description: 'Número do campo origem',
  })
  @ApiParam({
    name: 'nuinstdest',
    type: Number,
    description: 'Número da instância destino',
  })
  @ApiParam({
    name: 'nucampodest',
    type: Number,
    description: 'Número do campo destino',
  })
  @ApiResponse({ status: 200, description: 'Log encontrado' })
  @ApiResponse({ status: 404, description: 'Log não encontrado' })
  async findById(
    @Param('nuinstorig') nuinstorig: number,
    @Param('nucampoorig') nucampoorig: number,
    @Param('nuinstdest') nuinstdest: number,
    @Param('nucampodest') nucampodest: number,
  ): Promise<Tddlgc | null> {
    return this.tddlgcService.findById(
      +nuinstorig,
      +nucampoorig,
      +nuinstdest,
      +nucampodest,
    )
  }
}
