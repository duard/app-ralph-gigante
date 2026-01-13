import {
  Controller,
  Get,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
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
import { TokenAuthGuard } from '../auth/token-auth.guard'
import { TfpcarService } from './tfpcar.service'
import { TfpcarFindAllDto } from './models/tfpcar-find-all.dto'
import { Tfpcar } from './models/tfpcar.interface'
import { PaginatedResult } from '../../common/pagination/pagination.types'
import { SankhyaBaseController } from '../../common/base/sankhya-base.controller'

@ApiBearerAuth('JWT-auth')
@ApiTags('E. Cargos (TFPCAR)')
@Controller('sankhya/tfpcar')
@UseGuards(TokenAuthGuard)
export class TfpcarController {
  constructor(private readonly tfpcarService: TfpcarService) {}

  @Get('all')
  @ApiOperation({ summary: 'Obter todos os cargos (para selects)' })
  @ApiResponse({
    status: 200,
    description: 'Lista completa de cargos retornada com sucesso',
  })
  @UseInterceptors(CacheInterceptor)
  async listAll(): Promise<any> {
    const data = await this.tfpcarService.listAll()
    return { data }
  }

  @Get()
  @ApiOperation({
    summary: 'Listar cargos com paginação, filtros e ordenação',
    description:
      'Retorna uma lista paginada de cargos com suporte a filtros por descrição, status ativo, grupo de cargo, etc., e ordenação personalizada. Inclui contagem de funcionários ativos por cargo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cargos retornada com sucesso',
    schema: {
      example: {
        data: [
          {
            codcargo: 1,
            descrcargo: 'MOTORISTA',
            dtalter: '2025-01-01T00:00:00.000Z',
            ativo: 'S',
            funcionariosCount: 10,
            tfpcbo: { codcbo: 123, descrcbo: 'Operador de veículo' },
            tfpgca: { codgrupocargo: 1, descrgrupocargo: 'GRUPO A' },
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
    description:
      'Ordenação, ex: DHALTER DESC, CODDEP ASC. Campos disponíveis: DHALTER, CODDEP, etc.',
    example: 'DHALTER DESC',
  })
  @ApiQuery({
    name: 'descrcargo',
    required: false,
    type: String,
    description: 'Filtrar por descrição do cargo',
  })
  @ApiQuery({
    name: 'ativo',
    required: false,
    type: String,
    description: 'Filtrar por status ativo (S/N)',
  })
  @ApiQuery({
    name: 'codgrupocargo',
    required: false,
    type: Number,
    description: 'Filtrar por código do grupo de cargo',
  })
  @UseInterceptors(CacheInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(
    @Query() dto: TfpcarFindAllDto,
  ): Promise<PaginatedResult<Tfpcar>> {
    return this.tfpcarService.findAll(dto)
  }

  @Get(':codcargo')
  @ApiOperation({ summary: 'Buscar cargo por código' })
  @ApiResponse({
    status: 200,
    description: 'Cargo encontrado',
    schema: {
      example: {
        codcargo: 1,
        descrcargo: 'MOTORISTA',
        dtalter: '2025-01-01T00:00:00.000Z',
        ativo: 'S',
        funcionariosCount: 10,
        tfpcbo: { codcbo: 123, descrcbo: 'Operador de veículo' },
        tfpgca: { codgrupocargo: 1, descrgrupocargo: 'GRUPO A' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Cargo não encontrado' })
  @ApiParam({ name: 'codcargo', type: Number, description: 'Código do cargo' })
  async findById(@Param('codcargo') codcargo: number): Promise<Tfpcar | null> {
    return this.tfpcarService.findById(codcargo)
  }
}
