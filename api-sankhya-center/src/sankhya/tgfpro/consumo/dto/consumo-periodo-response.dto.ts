import { ApiProperty } from '@nestjs/swagger'
import { MovimentacaoDto } from './movimentacao.dto'

class SaldoDto {
  @ApiProperty()
  tipo_registro: string

  @ApiProperty()
  data_referencia: string

  // previous-period fields
  @ApiProperty({ required: false })
  saldo_qtd?: number

  @ApiProperty({ required: false })
  saldo_valor?: number

  // current-period fields
  @ApiProperty({ required: false })
  saldo_qtd_final?: number

  @ApiProperty({ required: false })
  saldo_valor_final?: number

  @ApiProperty({ required: false })
  saldo_valor_formatted?: string

  @ApiProperty({ required: false })
  saldo_valor_final_formatted?: string
}

export class ConsumoPeriodoResponseDto {
  @ApiProperty()
  codprod: number

  @ApiProperty()
  dataInicio: string

  @ApiProperty()
  dataFim: string

  @ApiProperty({ required: false })
  page?: number

  @ApiProperty({ required: false })
  perPage?: number

  @ApiProperty({ required: false })
  totalMovimentacoes?: number

  @ApiProperty({ type: SaldoDto, required: false })
  saldoAnterior?: SaldoDto

  @ApiProperty({ type: [MovimentacaoDto], required: false })
  movimentacoes?: MovimentacaoDto[]

  @ApiProperty({ required: false })
  totalMovimentacoesOnPage?: number

  @ApiProperty({ required: false })
  metrics?: {
    valor_medio_periodo: number
    valor_medio_entradas: number
    total_consumo_baixas: number
  }

  @ApiProperty({ required: false })
  movimentoLiquido?: number

  @ApiProperty({ type: SaldoDto, required: false })
  saldoAtual?: SaldoDto
}
