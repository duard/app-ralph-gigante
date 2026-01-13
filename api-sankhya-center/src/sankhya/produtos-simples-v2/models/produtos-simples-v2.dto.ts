import { ApiProperty } from '@nestjs/swagger'

export class ProdutoSimplesV2Dto {
  @ApiProperty({ example: 12345, description: 'Product code' })
  codprod: number

  @ApiProperty({
    example: 'Product Description',
    description: 'Product description',
  })
  descrprod: string

  @ApiProperty({ example: 'Warehouse A', description: 'Product location' })
  localizacao: string

  @ApiProperty({ example: 150.5, description: 'Average purchase value' })
  valor_medio: number

  @ApiProperty({ example: 160.0, description: 'Last purchase value' })
  valor_ultima_compra: number

  @ApiProperty({ example: 'S', description: 'Active status' })
  ativo: string
}
