import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, Min } from 'class-validator'

/**
 * DTO para query parameters de listagem de produtos
 * Baseado em: docs/tgfpro/queries/01-basic-listing.md
 */
export class FindProductsDto {
  @ApiPropertyOptional({
    description: 'Número da página para paginação',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsInt({ message: 'Página deve ser um número inteiro' })
  @Min(1, { message: 'Página deve ser no mínimo 1' })
  @Type(() => Number)
  @IsOptional()
  page?: number = 1

  @ApiPropertyOptional({
    description: 'Itens por página',
    minimum: 1,
    default: 20,
    example: 20,
  })
  @IsInt({ message: 'Itens por página deve ser um número inteiro' })
  @Min(1, { message: 'Mínimo de 1 item por página' })
  @Type(() => Number)
  @IsOptional()
  perPage?: number = 20

  @ApiPropertyOptional({
    description: 'Termo de busca na descrição do produto',
    example: 'FOLHA',
  })
  @IsString({ message: 'Busca deve ser um texto' })
  @IsOptional()
  search?: string

  @ApiPropertyOptional({
    description: 'Código do grupo de produtos para filtro',
    example: 10,
  })
  @IsInt({ message: 'Código do grupo deve ser um número inteiro' })
  @Type(() => Number)
  @IsOptional()
  codgrupoprod?: number
}
