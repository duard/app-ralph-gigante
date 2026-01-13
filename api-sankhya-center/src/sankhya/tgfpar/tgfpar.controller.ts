import {
  Controller,
  Get,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
  UseInterceptors,
  Req,
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
import { TgfparService } from './tgfpar.service'
import { TgfparFindAllDto } from './models/tgfpar-find-all.dto'
import { Tgfpar } from './models/tgfpar.interface'
import { PaginatedResult } from '../../common/pagination/pagination.types'
import { SankhyaBaseController } from '../../common/base/sankhya-base.controller'

@ApiBearerAuth('JWT-auth')
@ApiTags('E. Parceiros (TGFPAR)')
@Controller('tgfpar')
export class TgfparController extends SankhyaBaseController<Tgfpar> {
  constructor(protected readonly tgfparService: TgfparService) {
    super(tgfparService)
  }

  @Get()
  @ApiOperation({
    summary: 'Listar parceiros com paginação, filtros e ordenação',
    description:
      'Retorna uma lista paginada de parceiros com suporte a filtros por nome, cliente, fornecedor, etc., e ordenação personalizada.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de parceiros retornada com sucesso',
    schema: {
      example: {
        data: [
          {
            codparc: 1,
            nomeparc: 'Empresa X',
            cliente: 'S',
            fornecedor: 'N',
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
      'Ordenação, ex: NOME DESC, CODPARC ASC. Campos disponíveis: NOME, CODPARC, etc.',
    example: 'NOME DESC',
  })
  @ApiQuery({
    name: 'nomeparc',
    required: false,
    type: String,
    description: 'Filtrar por nome do parceiro',
  })
  @ApiQuery({
    name: 'cliente',
    required: false,
    type: String,
    description: 'Filtrar por cliente (S/N)',
  })
  @ApiQuery({
    name: 'fornecedor',
    required: false,
    type: String,
    description: 'Filtrar por fornecedor (S/N)',
  })
  @ApiQuery({
    name: 'cgc_cpf',
    required: false,
    type: String,
    description: 'Filtrar por CNPJ/CPF',
  })
  @ApiQuery({
    name: 'dtcadFrom',
    required: false,
    type: String,
    description: 'Data de cadastro a partir de (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'dtcadTo',
    required: false,
    type: String,
    description: 'Data de cadastro até (YYYY-MM-DD)',
  })
  @UseInterceptors(CacheInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(
    @Query() dto: TgfparFindAllDto,
  ): Promise<PaginatedResult<Tgfpar>> {
    return this.tgfparService.findAll(dto)
  }

  @Get('admin/test')
  @ApiOperation({ summary: 'Teste de saúde do módulo' })
  @ApiResponse({ status: 200, description: 'Módulo funcionando' })
  async test() {
    return {
      status: `${this.constructor.name.replace('Controller', '')} module is working`,
    }
  }
}
