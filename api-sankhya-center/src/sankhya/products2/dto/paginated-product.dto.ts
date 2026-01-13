import { ApiProperty } from '@nestjs/swagger'
import { ProductBasicDto } from './product-basic.dto'

/**
 * DTO para resposta paginada de produtos
 * Usa interface PaginatedResult<T> existente
 */
export class PaginatedProductDto {
  @ApiProperty({
    description: 'Array de produtos',
    type: [ProductBasicDto],
  })
  data: ProductBasicDto[]

  @ApiProperty({
    description: 'Total de produtos encontrados',
    example: 150,
  })
  total: number

  @ApiProperty({
    description: 'Página atual',
    example: 1,
  })
  page: number

  @ApiProperty({
    description: 'Itens por página',
    example: 20,
  })
  perPage: number

  @ApiProperty({
    description: 'Número da última página',
    example: 8,
  })
  lastPage: number

  @ApiProperty({
    description: 'Indica se há mais páginas disponíveis',
    example: true,
  })
  hasMore: boolean
}
