import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, IsInt, IsString, IsDateString, IsIn } from 'class-validator'

/**
 * DTO para filtros de busca de consumo de produtos
 */
export class ConsumoFindAllDto {
  @ApiPropertyOptional({
    description: 'Código do produto',
    example: 3680,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  codprod?: number

  @ApiPropertyOptional({
    description: 'Código do departamento',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  coddep?: number

  @ApiPropertyOptional({
    description: 'Código do usuário',
    example: 311,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  codusuinc?: number

  @ApiPropertyOptional({
    description: 'Data inicial (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  dataInicio?: string

  @ApiPropertyOptional({
    description: 'Data final (YYYY-MM-DD)',
    example: '2026-01-13',
  })
  @IsOptional()
  @IsDateString()
  dataFim?: string

  @ApiPropertyOptional({
    description: 'Tipo de atualização de estoque (B=Baixa, E=Entrada, N=Não movimenta, R=Reserva)',
    example: 'B',
    enum: ['B', 'E', 'N', 'R'],
  })
  @IsOptional()
  @IsIn(['B', 'E', 'N', 'R'])
  atualizaEstoque?: 'B' | 'E' | 'N' | 'R'

  @ApiPropertyOptional({
    description: 'Código do tipo de operação (TGFTOP)',
    example: 400,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  codtipoper?: number

  @ApiPropertyOptional({
    description: 'Buscar em descrição do produto ou tipo de operação',
    example: 'papel',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: 'Agrupar por (departamento, usuario, produto)',
    example: 'departamento',
    enum: ['departamento', 'usuario', 'produto'],
  })
  @IsOptional()
  @IsIn(['departamento', 'usuario', 'produto'])
  agruparPor?: 'departamento' | 'usuario' | 'produto'

  @ApiPropertyOptional({
    description: 'Número da página',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1

  @ApiPropertyOptional({
    description: 'Itens por página',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  perPage?: number = 10
}
