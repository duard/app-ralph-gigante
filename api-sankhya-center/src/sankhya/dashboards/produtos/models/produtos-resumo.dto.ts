import { ApiProperty } from '@nestjs/swagger'

/**
 * DTO para resumo de produtos
 */
export class ProdutosResumoDto {
  @ApiProperty({ description: 'Total de produtos' })
  totalProdutos: number

  @ApiProperty({ description: 'Total de produtos ativos' })
  totalAtivos: number

  @ApiProperty({ description: 'Total de produtos inativos' })
  totalInativos: number

  @ApiProperty({ description: 'Valor total em estoque' })
  valorTotalEstoque: number

  @ApiProperty({ description: 'Quantidade total em estoque' })
  quantidadeTotalEstoque: number

  @ApiProperty({ description: 'Produtos com estoque baixo' })
  produtosEstoqueBaixo: number

  @ApiProperty({ description: 'Data do resumo' })
  dataResumo: Date
}
