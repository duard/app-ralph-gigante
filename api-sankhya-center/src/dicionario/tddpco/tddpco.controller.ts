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
import { TddpcoService } from './tddpco.service'
import { TddpcoFindAllDto } from './models/tddpco-find-all.dto'
import { Tddpco } from './models/tddpco.interface'

type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  perPage: number
  lastPage: number
  hasMore: boolean
}

@ApiBearerAuth('JWT-auth')
@ApiTags('C. Dicionário de Dados - Parâmetros de Campos (TDDPCO)')
@Controller('dicionario/parametros-campos')
@UseGuards(TokenAuthGuard)
export class TddpcoController {
  constructor(private readonly tddpcoService: TddpcoService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar parâmetros de campos com paginação e filtros',
    description:
      'Retorna uma lista paginada de parâmetros de campos do dicionário.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de parâmetros retornada com sucesso',
    schema: {
      example: {
        data: [
          {
            nucampo: 331,
            nome: 'required',
            valor: 'S',
            controle: '0',
            domain: 'mge',
          },
        ],
        total: 1000,
        page: 1,
        perPage: 10,
        lastPage: 100,
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
    description: 'Ordenação (ex: nucampo ASC)',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    type: String,
    description: 'Campos a retornar (separados por vírgula ou * para todos)',
  })
  @ApiQuery({
    name: 'nucampo',
    required: false,
    type: Number,
    description: 'Filtrar por número do campo',
  })
  @ApiQuery({
    name: 'nome',
    required: false,
    type: String,
    description: 'Filtrar por nome do parâmetro',
  })
  @ApiQuery({
    name: 'valor',
    required: false,
    type: String,
    description: 'Filtrar por valor do parâmetro',
  })
  async findAll(
    @Query() dto: TddpcoFindAllDto,
  ): Promise<PaginatedResult<Tddpco>> {
    return this.tddpcoService.findAll(dto)
  }

  @Get(':nucampo/:nome')
  @ApiOperation({ summary: 'Buscar parâmetro por NUCAMPO e NOME' })
  @ApiParam({ name: 'nucampo', type: Number, description: 'Número do campo' })
  @ApiParam({ name: 'nome', type: String, description: 'Nome do parâmetro' })
  @ApiResponse({ status: 200, description: 'Parâmetro encontrado' })
  @ApiResponse({ status: 404, description: 'Parâmetro não encontrado' })
  async findById(
    @Param('nucampo') nucampo: number,
    @Param('nome') nome: string,
  ): Promise<Tddpco | null> {
    return this.tddpcoService.findById(+nucampo, nome)
  }
}
