import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, IsString, IsInt, IsEnum, Min, Max } from 'class-validator'

/**
 * DTO para listagem de produtos sem NCM com filtros e paginação
 */
export class ProdutosSemNcmDto {
  // ========== Busca e filtros ==========
  @ApiPropertyOptional({
    description: 'Busca em descrição, referência ou marca',
    example: 'parafuso',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: 'Filtro por código do grupo',
    example: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  codgrupoprod?: number

  @ApiPropertyOptional({
    description: 'Filtro por status ativo',
    enum: ['S', 'N'],
    example: 'S',
  })
  @IsOptional()
  @IsEnum(['S', 'N'])
  ativo?: 'S' | 'N'

  @ApiPropertyOptional({
    description: 'Filtro por marca',
    example: 'BOSCH',
  })
  @IsOptional()
  @IsString()
  marca?: string

  @ApiPropertyOptional({
    description: 'Filtro por código do local de estoque',
    example: 101001,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  codlocal?: number

  @ApiPropertyOptional({
    description: 'Filtro por tipo de uso do produto',
    enum: ['C', 'V', 'S'],
    example: 'C',
  })
  @IsOptional()
  @IsEnum(['C', 'V', 'S'])
  usoprod?: 'C' | 'V' | 'S'

  @ApiPropertyOptional({
    description: 'Filtro por criticidade',
    enum: ['ALTA', 'MEDIA', 'BAIXA'],
    example: 'ALTA',
  })
  @IsOptional()
  @IsEnum(['ALTA', 'MEDIA', 'BAIXA'])
  criticidade?: 'ALTA' | 'MEDIA' | 'BAIXA'

  // ========== Paginação ==========
  @ApiPropertyOptional({
    description: 'Número da página',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @ApiPropertyOptional({
    description: 'Itens por página',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  perPage?: number

  // ========== Ordenação ==========
  @ApiPropertyOptional({
    description: 'Ordenação (ex: DESCRPROD ASC, CODPROD DESC)',
    example: 'DESCRPROD ASC',
    default: 'CRITICIDADE_PRIORIDADE ASC, DESCRPROD ASC',
  })
  @IsOptional()
  @IsString()
  sort?: string
}
