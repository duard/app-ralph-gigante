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
import { TfpfunService } from './tfpfun.service'
import { TfpfunFindAllDto } from './models/tfpfun-find-all.dto'
import { Tfpfun } from './models/tfpfun.interface'
import { PaginatedResult } from '../../common/pagination/pagination.types'
import { SankhyaBaseController } from '../../common/base/sankhya-base.controller'

@ApiBearerAuth('JWT-auth')
@ApiTags('E. Funcionários (TFPFUN)')
@Controller('sankhya/tfpfun')
@UseGuards(TokenAuthGuard)
export class TfpfunController {
  constructor(private readonly tfpfunService: TfpfunService) {}

  @Get('all')
  @ApiOperation({ summary: 'Obter todos os funcionários (para selects)' })
  @ApiResponse({
    status: 200,
    description: 'Lista completa de funcionários retornada com sucesso',
  })
  @UseInterceptors(CacheInterceptor)
  async listAll(): Promise<any> {
    const data = await this.tfpfunService.listAll()
    return { data }
  }

  @Get()
  @ApiOperation({
    summary: 'Listar funcionários com paginação, filtros e ordenação',
    description:
      'Retorna uma lista paginada de funcionários com suporte a filtros avançados por nome, situação, departamento, cargo, centro de custo, idade, datas, etc., e ordenação personalizada. Inclui todas as relações: usuário, parceiro, empresa, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de funcionários retornada com sucesso',
    schema: {
      example: {
        data: [
          {
            codfunc: 133,
            nomefunc: 'FRANK DORNELES CARRIJO CUNHA',
            idade: 43,
            situacaoLegivel: 'Ativo',
            tgfpar: { codparc: 365, nomeparc: 'FRANK DORNELES CARRIJO CUNHA' },
            empresa: {
              codemp: 1,
              nomefantasia: 'GIGANTAO LOCADORA',
              cnpjFormatado: '23.981.517/0001-04',
            },
          },
        ],
        total: 1085,
        page: 1,
        perPage: 10,
        lastPage: 109,
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
    description: 'Ordenação (ex: DTADM DESC)',
    example: 'DTADM DESC',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    type: String,
    description: 'Campos a retornar (include/exclude)',
    example: 'nomefunc,idade',
  })
  @ApiQuery({
    name: 'nomefunc',
    required: false,
    type: String,
    description: 'Filtrar por nome',
  })
  @ApiQuery({
    name: 'situacao',
    required: false,
    type: String,
    description: 'Filtrar por situação',
  })
  @ApiQuery({
    name: 'coddep',
    required: false,
    type: Number,
    description: 'Filtrar por departamento',
  })
  @ApiQuery({
    name: 'codcargo',
    required: false,
    type: Number,
    description: 'Filtrar por cargo',
  })
  @ApiQuery({
    name: 'codcencus',
    required: false,
    type: Number,
    description: 'Filtrar por centro de custo',
  })
  @ApiQuery({
    name: 'dtadmFrom',
    required: false,
    type: String,
    description: 'Data admissão de',
  })
  @ApiQuery({
    name: 'dtadmTo',
    required: false,
    type: String,
    description: 'Data admissão até',
  })
  @ApiQuery({
    name: 'codusu',
    required: false,
    type: Number,
    description: 'Filtrar por usuário',
  })
  @ApiQuery({
    name: 'nomeusu',
    required: false,
    type: String,
    description: 'Filtrar por nome usuário',
  })
  @ApiQuery({
    name: 'emailusu',
    required: false,
    type: String,
    description: 'Filtrar por email usuário',
  })
  @ApiQuery({
    name: 'codparc',
    required: false,
    type: Number,
    description: 'Filtrar por parceiro',
  })
  @ApiQuery({
    name: 'nomeparc',
    required: false,
    type: String,
    description: 'Filtrar por nome parceiro',
  })
  @ApiQuery({
    name: 'coddeps',
    required: false,
    type: String,
    description: 'Departamentos (CSV)',
  })
  @ApiQuery({
    name: 'codcargos',
    required: false,
    type: String,
    description: 'Cargos (CSV)',
  })
  @ApiQuery({
    name: 'codcencusList',
    required: false,
    type: String,
    description: 'Centros custo (CSV)',
  })
  @ApiQuery({
    name: 'nome',
    required: false,
    type: String,
    description: 'Nome LIKE',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
    description: 'Email LIKE',
  })
  @ApiQuery({
    name: 'emailCorporativo',
    required: false,
    type: String,
    description: 'Email corporativo',
  })
  @ApiQuery({
    name: 'dtNascFrom',
    required: false,
    type: String,
    description: 'Data nascimento de',
  })
  @ApiQuery({
    name: 'dtNascTo',
    required: false,
    type: String,
    description: 'Data nascimento até',
  })
  @ApiQuery({
    name: 'idadeMin',
    required: false,
    type: Number,
    description: 'Idade mínima',
  })
  @ApiQuery({
    name: 'idadeMax',
    required: false,
    type: Number,
    description: 'Idade máxima',
  })
  @UseInterceptors(CacheInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(
    @Query() dto: TfpfunFindAllDto,
  ): Promise<PaginatedResult<Tfpfun>> {
    return this.tfpfunService.findAll(dto)
  }

  @Get('detalhes')
  @ApiOperation({
    summary: 'Listar funcionários com dados detalhados (PT-BR)',
    description:
      'Retorna a lista de funcionários com chaves em português e dados completos de gestor e empresa.',
  })
  @ApiResponse({ status: 200, description: 'Lista detalhada com sucesso' })
  @UseInterceptors(CacheInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAllDetalhados(
    @Query() dto: TfpfunFindAllDto,
  ): Promise<PaginatedResult<any>> {
    return this.tfpfunService.findAllEnriched(dto)
  }

  @Get(':codemp/:codfunc')
  @ApiOperation({ summary: 'Buscar funcionário por empresa e código' })
  @ApiResponse({ status: 200, description: 'Funcionário encontrado' })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado' })
  @ApiParam({ name: 'codemp', type: Number, description: 'Código da empresa' })
  @ApiParam({
    name: 'codfunc',
    type: Number,
    description: 'Código do funcionário',
  })
  async findById(
    @Param('codemp') codemp: number,
    @Param('codfunc') codfunc: number,
  ): Promise<Tfpfun | null> {
    return this.tfpfunService.findById(+codemp, +codfunc)
  }

  @Get('any/:codfunc')
  @ApiOperation({
    summary:
      'Buscar funcionário pelo código (ignorando empresa, prioriza ativo)',
  })
  @ApiResponse({ status: 200, description: 'Funcionário encontrado' })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado' })
  @ApiParam({
    name: 'codfunc',
    type: Number,
    description: 'Código do funcionário',
  })
  async findByAnyCodFunc(
    @Param('codfunc') codfunc: number,
  ): Promise<Tfpfun | null> {
    return this.tfpfunService.findByAnyCodFunc(+codfunc)
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
