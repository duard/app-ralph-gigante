import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger'
import { TokenAuthGuard } from '../auth/token-auth.guard'
import { TgfgruService } from './tgfgru.service'
import { TgfgruFindAllDto } from './models/tgfgru-find-all.dto'
import { Tgfgru } from './models/tgfgru.interface'
import { PaginatedResult } from '../../common/pagination/pagination.types'

@ApiBearerAuth('JWT-auth')
@ApiTags('E. Grupos de Produto (TGFGRU)')
@UseGuards(TokenAuthGuard)
@Controller('sankhya/tgfgru')
export class TgfgruController {
  constructor(private readonly tgfgruService: TgfgruService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar grupos de produto com paginação, filtros e ordenação',
    description:
      'Retorna uma lista paginada de grupos de produto com suporte a filtros por descrição, status ativo, hierarquia, natureza, centro de custo, projeto e regras WMS. Inclui controle de curvas ABC e metadados de apresentação.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de grupos retornada com sucesso',
    schema: {
      example: {
        data: [
          {
            codgrupoprod: 1,
            descrgrupoprod: 'ELETRONICOS',
            codgrupai: 0,
            analitico: 'S',
            grau: 1,
            ativo: 'S',
            codnat: 0,
            codcencus: 0,
            codproj: 0,
            solcompra: 'N',
            regrawms: 'O',
            aprprodvda: 'S',
            limcurva_b: 1000.0,
            limcurva_c: 5000.0,
            comcurva_a: 5.0,
            comcurva_b: 3.0,
            comcurva_c: 1.0,
            dhalter: '2025-01-01T10:30:00.000Z',
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
    description: 'Ordenação, ex: CODGRUPOPROD DESC, DESCRGRUPOPROD ASC',
    example: 'CODGRUPOPROD DESC',
  })
  @ApiQuery({
    name: 'descrgrupoprod',
    required: false,
    type: String,
    description: 'Filtrar por descrição do grupo',
  })
  @ApiQuery({
    name: 'codgrupai',
    required: false,
    type: Number,
    description: 'Filtrar por código do grupo pai',
  })
  @ApiQuery({
    name: 'analitico',
    required: false,
    type: String,
    description: 'Filtrar por tipo analítico (S/N)',
    enum: ['S', 'N'],
  })
  @ApiQuery({
    name: 'ativo',
    required: false,
    type: String,
    description: 'Filtrar por status ativo (S/N)',
    enum: ['S', 'N'],
  })
  @ApiQuery({
    name: 'codnat',
    required: false,
    type: Number,
    description: 'Filtrar por código da natureza',
  })
  @ApiQuery({
    name: 'codcencus',
    required: false,
    type: Number,
    description: 'Filtrar por centro de custo',
  })
  @ApiQuery({
    name: 'codproj',
    required: false,
    type: Number,
    description: 'Filtrar por projeto',
  })
  @ApiQuery({
    name: 'solcompra',
    required: false,
    type: String,
    description: 'Filtrar por solicitação de compra (S/N)',
    enum: ['S', 'N'],
  })
  @ApiQuery({
    name: 'regrawms',
    required: false,
    type: String,
    description: 'Filtrar por regra WMS',
  })
  @ApiQuery({
    name: 'aprprodvda',
    required: false,
    type: String,
    description: 'Filtrar por aprovação produto venda (S/N)',
    enum: ['S', 'N'],
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    type: String,
    description:
      'Campos a retornar. Modo include: separados por vírgula. Modo exclude: comece com -. Use * para todos.',
    example: 'codgrupoprod,descrgrupoprod,ativo',
  })
  async findAll(
    @Query() dto: TgfgruFindAllDto,
  ): Promise<PaginatedResult<Tgfgru>> {
    return this.tgfgruService.findAll(dto)
  }

  @Get(':codgrupoprod')
  @ApiOperation({ summary: 'Buscar grupo por código' })
  @ApiResponse({
    status: 200,
    description: 'Grupo encontrado',
    schema: {
      example: {
        codgrupoprod: 1,
        descrgrupoprod: 'ELETRONICOS',
        codgrupai: 0,
        analitico: 'S',
        grau: 1,
        ativo: 'S',
        codnat: 0,
        codcencus: 0,
        codproj: 0,
        solcompra: 'N',
        regrawms: 'O',
        aprprodvda: 'S',
        limcurva_b: 1000.0,
        limcurva_c: 5000.0,
        comcurva_a: 5.0,
        comcurva_b: 3.0,
        comcurva_c: 1.0,
        dhalter: '2025-01-01T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Grupo não encontrado' })
  @ApiParam({
    name: 'codgrupoprod',
    type: Number,
    description: 'Código do grupo de produto',
  })
  async findById(
    @Param('codgrupoprod') codgrupoprod: number,
  ): Promise<Tgfgru | null> {
    return this.tgfgruService.findById(codgrupoprod)
  }

  @Get('admin/test')
  @ApiOperation({ summary: 'Teste de conexão com grupos de produto' })
  @ApiResponse({ status: 200, description: 'Teste executado com sucesso' })
  async test() {
    const gruposCount = await this.tgfgruService.findAll({
      page: 1,
      perPage: 1,
    })

    return {
      message: 'Grupos de Produto estão funcionando corretamente',
      timestamp: new Date().toISOString(),
      total_grupos: gruposCount.total,
      status: 'OK',
    }
  }
}
