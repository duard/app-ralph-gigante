import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { TokenAuthGuard } from '../../auth/token-auth.guard'
import { ConsumoV2Service } from './consumo-v2.service'
import { ConsumoV3Service } from './consumo-v3.service'
import { ConsumoService } from './consumo.service'
import { ConsumoPeriodoQueryDto } from './dto/consumo-periodo-query.dto'
import { ConsumoPeriodoResponseDto } from './dto/consumo-periodo-response.dto'
import { ConsumoPeriodoV2ResponseDto } from './dto/consumo-periodo-v2-response.dto'
import { Produto360V3ResponseDto } from './dto/produto-360-v3-response.dto'

@ApiBearerAuth('JWT-auth')
@ApiTags('E. tgfpro - consumo')
@UseGuards(TokenAuthGuard)
@Controller('tgfpro')
export class ConsumoController {
  constructor(
    private readonly consumoService: ConsumoService,
    private readonly consumoV2Service: ConsumoV2Service,
    private readonly consumoV3Service: ConsumoV3Service,
  ) {}

  @Get('consumo-periodo/:codprod')
  @ApiOperation({
    summary: 'Consultar consumo/movimentações de produto em período',
  })
  @ApiParam({
    name: 'codprod',
    description: 'Código do produto',
    example: 3680,
    type: Number,
  })
  @ApiQuery({
    name: 'dataInicio',
    description: 'Data inicial (YYYY-MM-DD)',
    example: '2025-12-01',
    required: true,
  })
  @ApiQuery({
    name: 'dataFim',
    description: 'Data final (YYYY-MM-DD)',
    example: '2025-12-31',
    required: true,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    description: 'Items per page',
    example: 50,
  })
  async consultarConsumoPeriodo(
    @Param('codprod') codprod: number,
    @Query() query: ConsumoPeriodoQueryDto,
  ): Promise<ConsumoPeriodoResponseDto> {
    return this.consumoService.consultarConsumoPeriodo(
      codprod,
      query.dataInicio,
      query.dataFim,
      Number(query.page) || 1,
      Number(query.perPage) || 50,
    )
  }

  @Get('consumo-periodo-v2/:codprod')
  @ApiOperation({
    summary:
      'V2 - Consultar consumo com TODAS as melhorias (TGFTOP, centro custo, controle, observações, localizações)',
    description: `
      Endpoint V2 com melhorias:
      - ✅ Informações completas do produto (TIPCONTEST, COMPLDESC)
      - ✅ TGFTOP com descrição da operação
      - ✅ CONTROLE (lote/série) em movimentações e localizações
      - ✅ Centro de Custo
      - ✅ Observações da nota e do item
      - ✅ Métricas expandidas (% consumo, dias estoque, média/dia)
      - ✅ Status de pendências (qtd negociada vs entregue)
      - ✅ Validações de entrada (produto existe, datas válidas)
      - ✅ Localizações de estoque detalhadas
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
    description: 'Data inicial (YYYY-MM-DD)',
    example: '2025-12-01',
    required: true,
  })
  @ApiQuery({
    name: 'dataFim',
    description: 'Data final (YYYY-MM-DD)',
    example: '2025-12-31',
    required: true,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página',
    example: 1,
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    description: 'Itens por página',
    example: 50,
  })
  async consultarConsumoPeriodoV2(
    @Param('codprod') codprod: number,
    @Query() query: ConsumoPeriodoQueryDto,
  ): Promise<ConsumoPeriodoV2ResponseDto> {
    // REUTILIZAR métodos do v1
    return this.consumoV2Service.consultarConsumoPeriodoV2(
      codprod,
      query.dataInicio,
      query.dataFim,
      // Passar métodos do v1 como parâmetros (reusabilidade)
      this.consumoService.fetchUltimaCompra.bind(this.consumoService),
      this.consumoService.fetchSaldoAnterior.bind(this.consumoService),
      Number(query.page) || 1,
      Number(query.perPage) || 50,
    )
  }

  @Get('produto-360-v3/:codprod')
  @ApiOperation({
    summary: 'V3 - Visão 360º do Produto (Histórico, Atual e Futuro)',
    description: `
      Endpoint V3 que consolida:
      - ✅ Dados básicos do produto (TGFPRO)
      - ✅ Estado atual do estoque (Físico, Reservado, Disponível)
      - ✅ Valorização do estoque atual (Custo Médio)
      - ✅ Histórico de saldos mensais (6 meses retroativos)
      - ✅ Pedidos de Compra Pendentes (Entradas previstas)
      - ✅ Pedidos de Venda Pendentes (Reservas de pedidos)
      - ✅ Transferências Pendentes
    `,
  })
  @ApiParam({
    name: 'codprod',
    description: 'Código do produto',
    example: 3680,
    type: Number,
  })
  async consultarProduto360V3(
    @Param('codprod') codprod: number,
  ): Promise<Produto360V3ResponseDto> {
    const result = await this.consumoV3Service.consultarProduto360V3(codprod)
    if (!result) {
      throw new NotFoundException(`Produto ${codprod} não encontrado`)
    }
    return result
  }
}
