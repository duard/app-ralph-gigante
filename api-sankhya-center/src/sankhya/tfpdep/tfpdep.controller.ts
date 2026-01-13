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
import { TfpdepService } from './tfpdep.service'
import { TfpdepFindAllDto } from './models/tfpdep-find-all.dto'
import { Tfpdep } from './models/tfpdep.interface'
import { PaginatedResult } from '../../common/pagination/pagination.types'
import { SankhyaBaseController } from '../../common/base/sankhya-base.controller'

@ApiBearerAuth('JWT-auth')
@ApiTags('E. Departamentos (TFPDEP)')
@Controller('sankhya/tfpdep')
@UseGuards(TokenAuthGuard)
export class TfpdepController extends SankhyaBaseController<Tfpdep> {
  constructor(protected readonly tfpdepService: TfpdepService) {
    super(tfpdepService)
  }

  @Get()
  @ApiOperation({
    summary: 'Listar departamentos com paginação, filtros e ordenação',
    description:
      'Retorna uma lista paginada de departamentos com suporte a filtros por nome, status ativo, cliente, fornecedor, etc., e ordenação personalizada. Inclui contagem de funcionários ativos por departamento.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de departamentos retornada com sucesso',
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
  @UseInterceptors(CacheInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(
    @Query() dto: TfpdepFindAllDto,
  ): Promise<PaginatedResult<Tfpdep>> {
    return this.tfpdepService.findAll(dto)
  }

  @Get('all')
  @ApiOperation({
    summary: 'Obter todos os departamentos ativos (para selects)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista completa retornada com sucesso',
  })
  async listAll(): Promise<any> {
    const data = await this.tfpdepService.listAll()
    return { data }
  }

  @Get(':coddep')
  @ApiOperation({
    summary: 'Buscar departamento por código',
    description:
      'Retorna os detalhes completos de um departamento específico, incluindo relações e contagem de funcionários.',
  })
  @ApiResponse({ status: 200, description: 'Departamento encontrado' })
  @ApiResponse({ status: 404, description: 'Departamento não encontrado' })
  @ApiParam({
    name: 'coddep',
    type: Number,
    description: 'Código do departamento',
  })
  async findById(@Param('coddep') coddep: number): Promise<Tfpdep | null> {
    return this.tfpdepService.findById(+coddep)
  }
}
