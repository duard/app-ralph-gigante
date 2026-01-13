import { ApiProperty } from '@nestjs/swagger'

export class MovimentacaoDto {
  @ApiProperty()
  tipo_registro: string

  @ApiProperty()
  data_referencia: string | Date

  @ApiProperty()
  nunota: number

  @ApiProperty()
  tipmov: string

  @ApiProperty()
  codparc: number

  @ApiProperty()
  nome_parceiro: string

  @ApiProperty()
  usuario: string

  @ApiProperty()
  quantidade_mov: number

  @ApiProperty()
  valor_mov: number

  @ApiProperty({ required: false })
  valor_mov_formatted?: string

  @ApiProperty({ required: false })
  valor_unitario?: number

  @ApiProperty()
  saldo_qtd_anterior: number

  @ApiProperty()
  saldo_qtd_final: number

  @ApiProperty()
  saldo_valor_anterior: number

  @ApiProperty()
  saldo_valor_final: number

  @ApiProperty({ required: false })
  saldo_valor_final_formatted?: string

  @ApiProperty({ required: false })
  pmm?: number
}
