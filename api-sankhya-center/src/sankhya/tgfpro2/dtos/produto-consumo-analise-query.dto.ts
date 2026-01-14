import { ApiProperty } from '@nestjs/swagger'
import { IsISO8601, IsInt, IsOptional, IsIn, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'

export class ProdutoConsumoAnaliseQueryDto {
  @ApiProperty({
    example: '2025-12-01',
    description: 'Data inicial do período (YYYY-MM-DD)',
    required: true,
  })
  @IsISO8601()
  dataInicio: string

  @ApiProperty({
    example: '2025-12-31',
    description: 'Data final do período (YYYY-MM-DD)',
    required: true,
  })
  @IsISO8601()
  dataFim: string

  @ApiProperty({
    example: 'usuario',
    description:
      'Tipo de agrupamento: usuario, grupo, parceiro, mes, tipooper, none (default)',
    required: false,
    enum: ['usuario', 'grupo', 'parceiro', 'mes', 'tipooper', 'none'],
  })
  @IsOptional()
  @IsIn(['usuario', 'grupo', 'parceiro', 'mes', 'tipooper', 'none'])
  groupBy?: string = 'none'

  @ApiProperty({
    example: 1,
    description: 'Número da página para paginação',
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiProperty({
    example: 20,
    description: 'Itens por página',
    required: false,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  perPage?: number = 20
}
