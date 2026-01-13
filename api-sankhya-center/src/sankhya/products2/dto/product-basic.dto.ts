import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/**
 * DTO para informações básicas de produto
 * Baseado em: docs/tgfpro/queries/01-basic-listing.md
 */
export class ProductBasicDto {
  @ApiProperty({
    description: 'Código único do produto',
    example: 3680,
  })
  codprod: number

  @ApiProperty({
    description: 'Descrição do produto',
    example: 'FOLHAS A4 SULFITE 75G 210X297MM',
  })
  descrprod: string

  @ApiPropertyOptional({
    description: 'Referência interna do produto',
    example: 'A4-75G',
  })
  referencia?: string

  @ApiProperty({
    description: 'Status ativo (S=Sim, N=Não)',
    enum: ['S', 'N'],
    example: 'S',
  })
  ativo: 'S' | 'N'

  @ApiProperty({
    description: 'Tipo de uso do produto (C=Consumo)',
    example: 'C',
  })
  usoprod: string

  @ApiPropertyOptional({
    description: 'Valor da última compra em R$',
    example: 23.44,
  })
  vlrultcompra?: number

  @ApiPropertyOptional({
    description: 'Data da última alteração do cadastro',
    example: '2026-01-10T00:00:00.000Z',
  })
  dtalter?: Date
}
