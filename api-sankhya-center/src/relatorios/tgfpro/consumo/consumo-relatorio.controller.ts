import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  ParseIntPipe,
  Logger,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger'
import { Response, Request } from 'express'
import { TokenAuthGuard } from '../../../sankhya/auth/token-auth.guard'
import { ConsumoRelatorioService } from './consumo-relatorio.service'
import { ConsumoRelatorioQueryDto } from './dto/consumo-relatorio-query.dto'

@ApiBearerAuth('JWT-auth')
@ApiTags('Relatórios - Consumo de Produto')
@UseGuards(TokenAuthGuard)
@Controller('relatorios/tgfpro/consumo')
export class ConsumoRelatorioController {
  private readonly logger = new Logger(ConsumoRelatorioController.name)

  constructor(
    private readonly consumoRelatorioService: ConsumoRelatorioService,
  ) {}

  @Get(':codprod')
  @ApiOperation({
    summary: 'Gerar relatório PDF de consumo do produto',
    description: `
      Gera um relatório PDF completo com:
      - Dados do produto
      - Resumo de consumo (saldo inicial, compras, consumo, saldo final)
      - Gráfico de linha - consumo diário
      - Gráfico de barras - consumo mensal (últimos 6 meses)
      - Tabela de consumo por departamento/setor
      - Detalhamento das movimentações (requisições e compras)

      **Contexto:** Empresa que compra e consome internamente (não produz, não vende)
      - Entradas = Compras de fornecedores
      - Saídas = Consumo interno (requisições dos setores)
    `,
  })
  @ApiParam({
    name: 'codprod',
    description: 'Código do produto',
    example: 3680,
    type: Number,
  })
  @ApiQuery({
    name: 'dataInicio',
    description: 'Data inicial do período (YYYY-MM-DD)',
    example: '2025-12-01',
    required: true,
  })
  @ApiQuery({
    name: 'dataFim',
    description: 'Data final do período (YYYY-MM-DD)',
    example: '2025-12-31',
    required: true,
  })
  @ApiQuery({
    name: 'tipo',
    description: 'Tipo do relatório: resumo (1 página A4), executivo (resumido), completo (tudo), centro-custo, grupo-usuario',
    enum: ['resumo', 'executivo', 'completo', 'centro-custo', 'grupo-usuario'],
    required: false,
    example: 'resumo',
  })
  @ApiProduces('application/pdf')
  @ApiResponse({
    status: 200,
    description: 'Relatório PDF gerado com sucesso',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async gerarRelatorioPdf(
    @Param('codprod', ParseIntPipe) codprod: number,
    @Query() query: ConsumoRelatorioQueryDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const usuario = (req as any).user?.nome || (req as any).user?.login || 'Sistema'

    const tipoRelatorio = query.tipo || 'completo'

    this.logger.log(
      `Gerando relatório PDF - Produto: ${codprod}, Período: ${query.dataInicio} a ${query.dataFim}, Tipo: ${tipoRelatorio}, Usuário: ${usuario}`,
    )

    const pdfBuffer = await this.consumoRelatorioService.gerarRelatorioPdf(
      codprod,
      query.dataInicio,
      query.dataFim,
      usuario,
      tipoRelatorio,
    )

    // Gerar timestamp: YYYYMMDD-HHmmss
    const now = new Date()
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`

    // Sanitizar username para nome de arquivo (remove caracteres especiais e múltiplos underscores)
    const usuarioSanitizado = usuario
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase()

    const filename = `consumo-${codprod}-${tipoRelatorio}-${timestamp}-${usuarioSanitizado}.pdf`

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    })

    res.send(pdfBuffer)
  }
}
