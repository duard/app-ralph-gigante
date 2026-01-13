import { ApiProperty } from '@nestjs/swagger'
import { IsISO8601, IsInt, IsOptional } from 'class-validator'

export class ConsumoPeriodoQueryDto {
  @ApiProperty({
    example: '2025-12-01',
    description: 'Data inicial (YYYY-MM-DD)',
  })
  @IsISO8601()
  dataInicio: string

  @ApiProperty({
    example: '2025-12-31',
    description: 'Data final (YYYY-MM-DD)',
  })
  @IsISO8601()
  dataFim: string

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  page?: number = 1

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsInt()
  perPage?: number = 50
}
