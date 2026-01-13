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
import { TddinsService } from './tddins.service'
import { TddinsFindAllDto } from './models/tddins-find-all.dto'
import { Tddins } from './models/tddins.interface'

type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  perPage: number
  lastPage: number
  hasMore: boolean
}

@ApiBearerAuth('JWT-auth')
@ApiTags('C. Dicionário de Dados - Instâncias de Campos (TDDINS)')
@Controller('dicionario/instancias-campos')
@UseGuards(TokenAuthGuard)
export class TddinsController {
  constructor(private readonly tddinsService: TddinsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar instâncias de campos com paginação e filtros',
    description:
      'Retorna uma lista paginada de instâncias de campos do dicionário.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de instâncias retornada com sucesso',
    schema: {
      example: {
        data: [
          {
            nuinstancia: 1,
            nometab: 'TGFPRO',
            nomeinstancia: 'Cadastro Produto',
            descrinstancia: 'Instância principal',
            raiz: 'S',
            filtro: 'N',
            ativo: 'S',
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
    description: 'Ordenação (ex: nuinstancia ASC)',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    type: String,
    description: 'Campos a retornar (separados por vírgula ou * para todos)',
  })
  @ApiQuery({
    name: 'nometab',
    required: false,
    type: String,
    description: 'Filtrar por nome da tabela',
  })
  @ApiQuery({
    name: 'nomeinstancia',
    required: false,
    type: String,
    description: 'Filtrar por nome da instância',
  })
  @ApiQuery({
    name: 'ativo',
    required: false,
    type: String,
    description: 'Filtrar por ativo (S/N)',
  })
  async findAll(
    @Query() dto: TddinsFindAllDto,
  ): Promise<PaginatedResult<Tddins>> {
    return this.tddinsService.findAll(dto)
  }

  @Get(':nuinstancia')
  @ApiOperation({ summary: 'Buscar instância por NUINSTANCIA' })
  @ApiParam({
    name: 'nuinstancia',
    type: Number,
    description: 'Número da instância',
  })
  @ApiResponse({ status: 200, description: 'Instância encontrada' })
  @ApiResponse({ status: 404, description: 'Instância não encontrada' })
  async findById(
    @Param('nuinstancia') nuinstancia: number,
  ): Promise<Tddins | null> {
    return this.tddinsService.findById(+nuinstancia)
  }
}
