import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsISO8601, IsNotEmpty, IsOptional, IsIn } from 'class-validator'

export type TipoRelatorio = 'completo' | 'executivo' | 'centro-custo' | 'grupo-usuario' | 'resumo'

export class ConsumoRelatorioQueryDto {
  @ApiProperty({
    description: 'Data inicial do período (YYYY-MM-DD)',
    example: '2025-12-01',
  })
  @IsNotEmpty({ message: 'Data inicial é obrigatória' })
  @IsISO8601({}, { message: 'Data inicial deve estar no formato ISO8601 (YYYY-MM-DD)' })
  dataInicio: string

  @ApiProperty({
    description: 'Data final do período (YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @IsNotEmpty({ message: 'Data final é obrigatória' })
  @IsISO8601({}, { message: 'Data final deve estar no formato ISO8601 (YYYY-MM-DD)' })
  dataFim: string

  @ApiPropertyOptional({
    description: 'Tipo do relatório: resumo (1 página A4), executivo (resumido), completo (tudo), centro-custo, grupo-usuario',
    enum: ['resumo', 'executivo', 'completo', 'centro-custo', 'grupo-usuario'],
    default: 'resumo',
    example: 'resumo',
  })
  @IsOptional()
  @IsIn(['resumo', 'executivo', 'completo', 'centro-custo', 'grupo-usuario'], {
    message: 'Tipo deve ser: resumo, executivo, completo, centro-custo ou grupo-usuario',
  })
  tipo?: TipoRelatorio = 'resumo'
}
