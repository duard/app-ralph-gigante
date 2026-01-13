import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { TokenAuthGuard } from '../sankhya/auth/token-auth.guard'
import { TddcamFindAllDto } from './models/tddcam-find-all.dto'
import { TddcamDto } from './models/tddcam.dto'
import { TddtabFindAllDto } from './models/tddtab-find-all.dto'
import { TddtabDto } from './models/tddtab.dto'
import { TddtabService } from './tddtab.service'
import { TddcamService } from './tddcam.service'
import { TddopcService } from './tddopc/tddopc.service'

@ApiBearerAuth('JWT-auth')
@ApiTags('C. Dicionário de Dados')
@UseGuards(TokenAuthGuard)
@Controller('dicionario')
export class DicionarioController {
  constructor(
    private readonly tddcamService: TddcamService,
    private readonly tddtabService: TddtabService,
    private readonly tddopcService: TddopcService,
  ) {}

  @Get('tabelas')
  @ApiOperation({
    summary: 'Listar tabelas do dicionário com paginação e filtros',
    description:
      'Retorna uma lista paginada de tabelas do dicionário com filtros.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tabelas retornada com sucesso',
    schema: {
      example: {
        data: [{ nometab: 'TGFPRO', descrtab: 'Produtos', tiponumeracao: 'T' }],
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
    description: 'Ordenação (ex: nometab ASC)',
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
    name: 'descrtab',
    required: false,
    type: String,
    description: 'Filtrar por descrição da tabela',
  })
  @ApiQuery({
    name: 'adicional',
    required: false,
    type: String,
    description: 'Filtrar por campo adicional',
  })
  async findAllTabelas(@Query(new ValidationPipe()) dto: TddtabFindAllDto) {
    return this.tddtabService.findAll(dto)
  }

  @Get('tabelas/:nomeTabela')
  @ApiOperation({ summary: 'Buscar tabela por nome' })
  @ApiParam({ name: 'nomeTabela', description: 'Nome da tabela' })
  @ApiResponse({ status: 200, description: 'Tabela encontrada', type: Object })
  async findTabelaByNome(@Param('nomeTabela') nomeTabela: string) {
    return this.tddtabService.findByName(nomeTabela)
  }

  @Get('metadados/:nomeTabela')
  @ApiOperation({
    summary: 'Obter metadados completos de uma tabela',
    description:
      'Retorna informações completas sobre uma tabela: definição, campos, opções, instâncias, etc.',
  })
  @ApiParam({ name: 'nomeTabela', description: 'Nome da tabela' })
  @ApiResponse({
    status: 200,
    description: 'Metadados retornados com sucesso',
    schema: {
      example: {
        tabela: { nometab: 'TGFPRO', descrtab: 'Produtos' },
        campos: [{ nomecampo: 'CODPROD', descrcampo: 'Código' }],
        opcoes: [{ nucampo: 331, valor: 'S', opcao: 'Sim' }],
        parametros: [],
        instancias: [{ nuinstancia: 1, nomeinstancia: 'Cadastro' }],
      },
    },
  })
  async getMetadados(@Param('nomeTabela') nomeTabela: string) {
    const tabela = await this.tddtabService.findByName(nomeTabela)
    const campos = await this.tddcamService.findByTable(nomeTabela)
    const opcoes = await this.tddopcService.findByTable(nomeTabela)

    // Aqui podemos adicionar chamadas para outros services quando implementados
    return {
      tabela,
      campos,
      opcoes,
      parametros: [], // TDDPCO
      instancias: [], // TDDINS
    }
  }

  @Get('tabelas/lista')
  @ApiOperation({ summary: 'Listar tabelas com paginação limitada' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de tabelas (máx. 100 por página)',
    schema: {
      example: {
        data: [{ nometab: 'TGFPRO', descrtab: 'Produtos' }],
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
    description: 'Página (padrão: 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    description: 'Itens por página (máx. 100, padrão: 10)',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    description: 'Ordenação (padrão: NOMETAB ASC)',
  })
  @ApiQuery({
    name: 'nometab',
    required: false,
    type: String,
    description: 'Filtro por nome da tabela',
  })
  @ApiQuery({
    name: 'descrtab',
    required: false,
    type: String,
    description: 'Filtro por descrição',
  })
  async listAllTabelas(@Query(new ValidationPipe()) dto: TddtabFindAllDto) {
    // Limitar perPage a 100 para segurança
    const safeDto = { ...dto, perPage: Math.min(dto.perPage || 10, 100) }
    return this.tddtabService.findAll(safeDto)
  }

  @Get('campos')
  @ApiOperation({
    summary: 'Listar campos do dicionário com paginação e filtros',
    description:
      'Retorna campos do dicionário com suporte a filtros por tabela, nome do campo, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Campos encontrados',
    schema: {
      example: {
        data: [
          {
            nucampo: 331,
            nometab: 'TGFPRO',
            nomecampo: 'CODPROD',
            descrcampo: 'Código',
            tipcampo: 'I',
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
    name: 'nometab',
    required: false,
    type: String,
    description: 'Filtrar por nome da tabela',
  })
  @ApiQuery({
    name: 'nomecampo',
    required: false,
    type: String,
    description: 'Filtrar por nome do campo',
  })
  @ApiQuery({
    name: 'descrcampo',
    required: false,
    type: String,
    description: 'Filtrar por descrição do campo',
  })
  @ApiQuery({
    name: 'tipcampo',
    required: false,
    type: String,
    description: 'Filtrar por tipo do campo',
  })
  async findAllCampos(@Query(new ValidationPipe()) dto: TddcamFindAllDto) {
    return this.tddcamService.findAll(dto)
  }

  @Get('campos/tabela/:nomeTabela')
  @ApiOperation({ summary: 'Listar campos de uma tabela específica' })
  @ApiParam({ name: 'nomeTabela', description: 'Nome da tabela' })
  @ApiResponse({
    status: 200,
    description: 'Campos da tabela',
    type: TddcamDto,
    isArray: true,
  })
  async findCamposByTabela(@Param('nomeTabela') nomeTabela: string) {
    return this.tddcamService.findByTable(nomeTabela)
  }

  @Get('admin/test')
  @ApiOperation({ summary: 'Teste de conexão com dicionário' })
  @ApiResponse({ status: 200, description: 'Teste executado com sucesso' })
  async test() {
    const tabelaTest = await this.tddtabService.findByName('TSIUSU')
    const camposTest = await this.tddcamService.findByTable('TSIUSU')

    return {
      message: 'Dicionário está funcionando corretamente',
      timestamp: new Date().toISOString(),
      tabela_encontrada: tabelaTest ? 'sim' : 'não',
      campos_encontrados: camposTest ? `${camposTest.length} campos` : 'não',
    }
  }
}
