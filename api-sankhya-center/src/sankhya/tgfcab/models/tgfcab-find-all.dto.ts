import { Type } from 'class-transformer'
import { IsOptional, IsNumber, IsString, IsDateString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

/**
 * DTO para busca de cabeçalhos de notas (TGFCAB)
 * Suporta filtros avançados por datas, valores, códigos e status.
 */
export class TgfcabFindAllDto extends BaseFindAllDto {
  /** Filtrar por código do tipo de operação */
  @ApiPropertyOptional({
    description: 'Código do tipo de operação',
    example: 505,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  codtipoper?: number

  /** Filtrar por código do parceiro */
  @ApiPropertyOptional({ description: 'Código do parceiro', example: 2804 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  codparc?: number

  /** Filtrar por código do vendedor */
  @ApiPropertyOptional({ description: 'Código do vendedor', example: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  codvend?: number

  /** Filtrar por status da nota */
  @ApiPropertyOptional({
    description: 'Status da nota (L/Liberada, etc.)',
    example: 'L',
  })
  @IsOptional()
  @IsString()
  statusnota?: string

  /** Filtrar por data de negociação (formato YYYY-MM-DD) */
  @ApiPropertyOptional({
    description: 'Data de negociação',
    example: '2025-01-22',
  })
  @IsOptional()
  @IsDateString()
  dtneg?: string

  /** Filtrar por valor mínimo da nota */
  @ApiPropertyOptional({ description: 'Valor mínimo da nota', example: 10 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  vlrnotaMin?: number

  /** Filtrar por valor máximo da nota */
  @ApiPropertyOptional({ description: 'Valor máximo da nota', example: 1000 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  vlrnotaMax?: number

  /** Filtrar por tipo de movimento */
  @ApiPropertyOptional({
    description: 'Tipo de movimento (V/P/D/A/O/C/E/H/T/J/Q/L/F)',
    example: 'Q',
  })
  @IsOptional()
  @IsString()
  tipmov?: string
}
