import { ApiProperty } from '@nestjs/swagger'

export class ProdutoDashboardDto {
  @ApiProperty({ description: 'Código do produto' })
  codprod: number

  @ApiProperty({ description: 'Descrição do produto' })
  descrprod: string

  @ApiProperty({ description: 'Referência do produto', required: false })
  referencia?: string

  @ApiProperty({ description: 'Status ativo (S/N)' })
  ativo: string

  @ApiProperty({ description: 'Código do grupo de produto' })
  codgrupoprod: number

  @ApiProperty({ description: 'Descrição do grupo', required: false })
  descrgrupoprod?: string

  @ApiProperty({ description: 'Quantidade em estoque', required: false })
  quantidadeEstoque?: number

  @ApiProperty({ description: 'Valor unitário', required: false })
  valorUnitario?: number

  @ApiProperty({ description: 'Valor total em estoque', required: false })
  valorTotalEstoque?: number

  @ApiProperty({ description: 'Data da última alteração' })
  dataUltimaAlteracao: Date

  @ApiProperty({ description: 'Quantidade vendida', required: false })
  quantidadeVendida?: number

  @ApiProperty({ description: 'Valor vendido', required: false })
  valorVendido?: number

  @ApiProperty({ description: 'Margem de lucro', required: false })
  margemLucro?: number

  @ApiProperty({ description: 'Estoque baixo', required: false })
  estoqueBaixo?: boolean

  @ApiProperty({ description: 'Produto ativo', required: false })
  produtoAtivo?: boolean
}
