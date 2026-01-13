import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import { TokenAuthGuard } from '../auth/token-auth.guard'
import { SankhyaApiService } from './sankhya-api.service'

@ApiBearerAuth('JWT-auth')
@ApiTags('B. Inspeção Sankhya')
@UseGuards(TokenAuthGuard)
@Controller('inspection')
export class InspectionController {
  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  @Get('table-schema')
  @ApiOperation({
    summary: 'Obter schema completo da tabela',
    description:
      'Retorna informações detalhadas sobre a estrutura da tabela, incluindo nome das colunas, tipos de dados, chaves primárias, etc.',
  })
  @ApiQuery({
    name: 'tableName',
    required: true,
    type: String,
    description: 'Nome da tabela Sankhya (ex: TGFPRO, TFPFUN, AD_GIG_LOG)',
    example: 'AD_GIG_LOG',
  })
  @ApiResponse({
    status: 200,
    description: 'Schema da tabela retornado com sucesso',
    schema: {
      example: {
        tableName: 'AD_GIG_LOG',
        columns: [
          {
            COLUMN_NAME: 'ID',
            DATA_TYPE: 'int',
            IS_NULLABLE: 'NO',
            COLUMN_DEFAULT: null,
            ORDINAL_POSITION: 1,
          },
        ],
        totalColumns: 9,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Nome da tabela não informado' })
  @ApiResponse({ status: 404, description: 'Tabela não encontrada' })
  async getTableSchema(@Query('tableName') tableName: string) {
    return this.sankhyaApiService.getTableSchema(tableName)
  }

  @Get('table-relations')
  @ApiOperation({
    summary: 'Obter relações e foreign keys da tabela',
    description:
      'Retorna as relações de chave estrangeira e dependências entre tabelas.',
  })
  @ApiQuery({
    name: 'tableName',
    required: true,
    type: String,
    description: 'Nome da tabela para analisar relações',
    example: 'TGFPRO',
  })
  @ApiResponse({
    status: 200,
    description: 'Relações da tabela retornadas',
    schema: {
      example: {
        tableName: 'TGFPRO',
        relations: [],
        totalRelations: 0,
      },
    },
  })
  async getTableRelations(@Query('tableName') tableName: string) {
    return this.sankhyaApiService.getTableRelations(tableName)
  }

  @Get('primary-keys/:tableName')
  @ApiOperation({
    summary: 'Obter chaves primárias da tabela',
    description:
      'Retorna as colunas que formam a chave primária da tabela especificada.',
  })
  @ApiParam({
    name: 'tableName',
    description: 'Nome da tabela para obter chaves primárias',
    example: 'TGFPRO',
  })
  @ApiResponse({
    status: 200,
    description: 'Chaves primárias retornadas com sucesso',
    schema: {
      example: {
        tableName: 'TGFPRO',
        primaryKeys: ['CODPROD'],
        totalKeys: 1,
      },
    },
  })
  async getPrimaryKeys(@Param('tableName') tableName: string) {
    return this.sankhyaApiService.getPrimaryKeys(tableName)
  }

  @Post('query')
  @ApiOperation({
    summary: 'Executar query SQL no banco Sankhya',
    description: `
    Permite executar queries SQL diretamente no banco de dados Sankhya.
    Use com cuidado - apenas queries SELECT são permitidas por segurança.

    ⚠️ LIMITAÇÕES CONHECIDAS:
    - ORDER BY DTCREATED pode falhar devido a limitações da API Sankhya
    - Use ORDER BY ID DESC para ordenação temporal confiável
    - Campos muito grandes podem causar problemas de performance

    Exemplos de uso:

    1. Listar registros de uma tabela (recomendado):
    {
      "query": "SELECT TOP 10 * FROM TGFPRO ORDER BY CODPROD DESC",
      "params": []
    }

    2. Query com parâmetros:
    {
      "query": "SELECT * FROM TFPFUN WHERE CODEMP = ? AND SITUACAO = ?",
      "params": [1, "A"]
    }

    3. Query analítica:
    {
      "query": "SELECT ACAO, COUNT(*) as total FROM AD_GIG_LOG GROUP BY ACAO ORDER BY total DESC",
      "params": []
    }

    4. AD_GIG_LOG (dados de auditoria):
    {
      "query": "SELECT TOP 20 ID, ACAO, TABELA, NOMEUSU, DTCREATED FROM AD_GIG_LOG ORDER BY ID DESC",
      "params": []
    }
    `,
  })
  @ApiBody({
    description: 'Parâmetros da query SQL',
    schema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: {
          type: 'string',
          description: 'Query SQL a ser executada',
          example:
            'SELECT TOP 10 ID, ACAO, TABELA, NOMEUSU FROM AD_GIG_LOG ORDER BY ID DESC',
        },
        params: {
          type: 'array',
          description: 'Parâmetros da query (para queries preparadas com ?)',
          items: { type: 'any' },
          example: [],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado da query executada com sucesso',
    schema: {
      example: [
        {
          ID: 1105185,
          ACAO: 'UPDATE',
          TABELA: 'TSILIB',
          CODUSU: 34,
          NOMEUSU: 'WILSON.MONTE',
        },
      ],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado da query executada com sucesso',
    schema: {
      example: [
        {
          ID: 1,
          ACAO: 'UPDATE',
          TABELA: 'TGFCAB',
          CODUSU: 34,
          NOMEUSU: 'WILSON.MONTE',
          VERSAO_NOVA: '[dados completos pós-alteração]',
          VERSAO_ANTIGA: '[dados completos pré-alteração]',
          DTCREATED: '2024-08-13T17:05:52.060Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado à tabela ou operação não permitida',
  })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor Sankhya' })
  async executeQuery(@Body() body: { query: string; params?: any[] }) {
    return this.sankhyaApiService.executeQuery(body.query, body.params)
  }
}
