import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator'
import { Transform, Type } from 'class-transformer'

export class ProdutoV2FindAllDto {
  @ApiPropertyOptional({ description: 'Busca em descrição, referência, marca' })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: 'Códigos dos grupos (array)',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n))
    }
    return value
  })
  grupos?: number[]

  @ApiPropertyOptional({
    description: 'Códigos dos locais (array)',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n))
    }
    return value
  })
  locais?: number[]

  @ApiPropertyOptional({ description: 'Tipos de controle (array)' })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s)
    }
    return value
  })
  controles?: string[]

  @ApiPropertyOptional({ description: 'Marcas (array)' })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s)
    }
    return value
  })
  marcas?: string[]

  @ApiPropertyOptional({ description: 'Status ativo (S/N)' })
  @IsOptional()
  @IsString()
  ativo?: string

  @ApiPropertyOptional({ description: 'Estoque mínimo' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  estoqueMin?: number

  @ApiPropertyOptional({ description: 'Estoque máximo' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  estoqueMax?: number

  @ApiPropertyOptional({ description: 'Apenas com estoque' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  comEstoque?: boolean

  @ApiPropertyOptional({ description: 'Apenas sem estoque' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  semEstoque?: boolean

  @ApiPropertyOptional({
    description: 'Apenas estoque crítico (abaixo mínimo)',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  critico?: boolean

  @ApiPropertyOptional({ description: 'Ordenação (ex: codprod desc)' })
  @IsOptional()
  @IsString()
  sort?: string

  @ApiPropertyOptional({ description: 'Página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number

  @ApiPropertyOptional({ description: 'Itens por página', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  perPage?: number
}
