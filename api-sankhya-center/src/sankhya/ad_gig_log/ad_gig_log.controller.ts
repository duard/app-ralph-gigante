import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import { SankhyaBaseController } from '../../common/base/sankhya-base.controller'
import { PaginatedResult } from '../../common/pagination/pagination.types'
import { TokenAuthGuard } from '../auth/token-auth.guard'
import { AdGigLogService } from './ad_gig_log.service'
import { AdGigLogFindAllDto } from './models/ad_gig_log-find-all.dto'
import { AdGigLog } from './models/ad_gig_log.interface'

@ApiBearerAuth('JWT-auth')
@ApiTags('D. Logs de Auditoria (AD_GIG_LOG)')
@Controller('sankhya/ad-gig-log')
@UseGuards(TokenAuthGuard)
export class AdGigLogController extends SankhyaBaseController<AdGigLog> {
  constructor(protected readonly adGigLogService: AdGigLogService) {
    super(adGigLogService)
  }

  @Get()
  @ApiOperation({
    summary: 'Listar logs de auditoria com paginação, filtros e ordenação',
    description:
      'Retorna uma lista paginada de logs de auditoria com suporte a filtros por ação, tabela, usuário, período e ordenação por data/hora.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de logs retornada com sucesso',
    schema: {
      example: {
        data: [
          {
            id: 1,
            acao: 'UPDATE',
            tabela: 'TFPFUN',
            codusu: 292,
            nomeusu: 'CONVIDADO',
            camposAlterados: '{"NOMEFUNC": ["João", "José"]}',
            versaoNova: '...',
            versaoAntiga: '...',
            dtcreated: '2025-01-01T10:30:00.000Z',
            tsiusu: {
              codusu: 292,
              nomeusu: 'CONVIDADO',
              email: 'convidado@example.com',
            },
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
    description: 'Ordenação, ex: DTCREATED DESC, ID ASC',
    example: 'DTCREATED DESC',
  })
  @ApiQuery({
    name: 'acao',
    required: false,
    type: String,
    description: 'Filtrar por tipo de ação (INSERT, UPDATE, DELETE)',
  })
  @ApiQuery({
    name: 'tabela',
    required: false,
    type: String,
    description: 'Filtrar por nome da tabela',
  })
  @ApiQuery({
    name: 'codusu',
    required: false,
    type: Number,
    description: 'Filtrar por código do usuário',
  })
  @ApiQuery({
    name: 'nomeusu',
    required: false,
    type: String,
    description: 'Filtrar por nome do usuário (parcial)',
  })
  @ApiQuery({
    name: 'dtcreatedStart',
    required: false,
    type: String,
    description: 'Data/hora inicial (YYYY-MM-DD HH:MM:SS)',
  })
  @ApiQuery({
    name: 'dtcreatedEnd',
    required: false,
    type: String,
    description: 'Data/hora final (YYYY-MM-DD HH:MM:SS)',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    type: String,
    description:
      'Campos a retornar. Modo include: separados por vírgula. Modo exclude: comece com -. Use * para todos.',
    example: 'id,acao,tabela,nomeusu,dtcreated',
  })
  async findAll(
    @Query() dto: AdGigLogFindAllDto,
  ): Promise<PaginatedResult<AdGigLog>> {
    return this.adGigLogService.findAll(dto)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar log por ID' })
  @ApiResponse({
    status: 200,
    description: 'Log encontrado',
    schema: {
      example: {
        id: 1,
        acao: 'UPDATE',
        tabela: 'TFPFUN',
        codusu: 292,
        nomeusu: 'CONVIDADO',
        camposAlterados: '{"NOMEFUNC": ["João", "José"]}',
        versaoNova: '...',
        versaoAntiga: '...',
        dtcreated: '2025-01-01T10:30:00.000Z',
        tsiusu: {
          codusu: 292,
          nomeusu: 'CONVIDADO',
          email: 'convidado@example.com',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Log não encontrado' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do log' })
  async findById(@Param('id') id: number): Promise<AdGigLog | null> {
    return this.adGigLogService.findById(+id)
  }
}
