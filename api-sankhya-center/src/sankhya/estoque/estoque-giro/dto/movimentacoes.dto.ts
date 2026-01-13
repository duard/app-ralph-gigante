import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class MovimentacaoSubgrupoDto {
  @ApiProperty({ description: 'Código do subgrupo', example: 20102 })
  codigo: number

  @ApiProperty({ description: 'Descrição do subgrupo', example: 'MECANICA' })
  descricao: string

  @ApiProperty({ description: 'Quantidade de entradas', example: 629010 })
  entradas: number

  @ApiProperty({ description: 'Quantidade de saídas', example: 199591 })
  saidas: number

  @ApiProperty({ description: 'Saldo (entradas - saídas)', example: 429419 })
  saldo: number

  @ApiProperty({
    description: 'Quantidade de movimentações de entrada',
    example: 55786,
  })
  qtdMovimentacoesEntrada: number

  @ApiProperty({
    description: 'Quantidade de movimentações de saída',
    example: 13663,
  })
  qtdMovimentacoesSaida: number

  @ApiProperty({ description: 'Giro do subgrupo', example: 1.92 })
  giro: number

  @ApiPropertyOptional({
    description: 'Classificação do giro',
    enum: ['MUITO_ALTO', 'ALTO', 'NORMAL', 'BAIXO'],
  })
  classificacao?: string
}

export class ResumoMovimentacoesDto {
  @ApiProperty({ description: 'Código do grupo', example: 20100 })
  codigoGrupo: number

  @ApiProperty({
    description: 'Descrição do grupo',
    example: 'MANUTENCAO AUTOMOTIVA',
  })
  descricaoGrupo: string

  @ApiProperty({
    description: 'Período de análise',
    example: 'ULTIMOS_12_MESES',
  })
  periodo: string

  @ApiProperty({ description: 'Data de início do período' })
  dataInicio: Date

  @ApiProperty({ description: 'Data de fim do período' })
  dataFim: Date

  @ApiProperty({ description: 'Total de entradas no grupo', example: 1828446 })
  totalEntradas: number

  @ApiProperty({ description: 'Total de saídas no grupo', example: 356868 })
  totalSaidas: number

  @ApiProperty({ description: 'Saldo geral do grupo', example: 1471578 })
  saldoGeral: number

  @ApiProperty({
    type: [MovimentacaoSubgrupoDto],
    description: 'Movimentações por subgrupo',
  })
  porSubgrupo: MovimentacaoSubgrupoDto[]
}

export class MovimentacoesRequestDto {
  @ApiPropertyOptional({
    description: 'Código do subgrupo',
    example: 20102,
  })
  codigoSubgrupo?: number

  @ApiPropertyOptional({
    description: 'Tipo de movimento a filtrar',
    enum: ['ENTRADA', 'SAIDA', 'TODOS'],
    default: 'TODOS',
  })
  tipo?: 'ENTRADA' | 'SAIDA' | 'TODOS'

  @ApiPropertyOptional({
    description: 'Período de análise',
    enum: [
      'MES_ATUAL',
      'ULTIMOS_3_MESES',
      'ULTIMOS_6_MESES',
      'ULTIMOS_12_MESES',
    ],
    default: 'ULTIMOS_12_MESES',
  })
  periodo?: string

  @ApiPropertyOptional({
    description: 'Data início personalizada',
    example: '2025-01-01',
  })
  dataInicio?: string

  @ApiPropertyOptional({
    description: 'Data fim personalizada',
    example: '2025-12-31',
  })
  dataFim?: string
}

export class MovimentacoesResponseDto {
  @ApiProperty({ description: 'Status da operação', example: 'success' })
  status: string

  @ApiProperty({ description: 'Timestamp da resposta' })
  timestamp: Date

  @ApiProperty({ type: ResumoMovimentacoesDto })
  data: ResumoMovimentacoesDto

  @ApiPropertyOptional({ description: 'Filtros aplicados' })
  filtros?: Record<string, any>
}
