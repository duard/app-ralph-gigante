import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, IsString, IsInt, IsEnum, Min, Max } from 'class-validator'

/**
 * DTO para listagem de produtos com filtros e paginação
 */
export class ProdutoFindAllDto {
  // ========== Busca e filtros ==========
  @ApiPropertyOptional({
    description: 'Busca em descrição, referência ou marca',
    example: 'parafuso',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: 'Filtro por descrição do produto',
    example: 'PARAFUSO',
  })
  @IsOptional()
  @IsString()
  descrprod?: string

  @ApiPropertyOptional({
    description: 'Filtro por referência',
    example: 'REF123',
  })
  @IsOptional()
  @IsString()
  referencia?: string

  @ApiPropertyOptional({
    description: 'Filtro por marca',
    example: 'BOSCH',
  })
  @IsOptional()
  @IsString()
  marca?: string

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
    description: 'Filtro por localização física',
    example: 'A1-01',
  })
  @IsOptional()
  @IsString()
  localizacao?: string

  @ApiPropertyOptional({
    description: 'Filtro por tipo de controle',
    example: 'L',
  })
  @IsOptional()
  @IsString()
  tipcontest?: string

  @ApiPropertyOptional({
    description: 'Filtro por NCM',
    example: '7318.15.00',
  })
  @IsOptional()
  @IsString()
  ncm?: string

  // ========== Opções de inclusão ==========
  @ApiPropertyOptional({
    description: 'Incluir informações de estoque agregado',
    default: false,
  })
  @IsOptional()
  includeEstoque?: boolean

  @ApiPropertyOptional({
    description: 'Incluir estoque detalhado por local',
    default: false,
  })
  @IsOptional()
  includeEstoqueLocais?: boolean

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
    example: 10,
    default: 10,
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
    default: 'CODPROD DESC',
  })
  @IsOptional()
  @IsString()
  sort?: string
}
