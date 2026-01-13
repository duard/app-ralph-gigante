import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class SubgrupoInventarioDto {
  @ApiProperty({ description: 'Código do subgrupo', example: 20102 })
  codigo: number

  @ApiProperty({ description: 'Descrição do subgrupo', example: 'MECANICA' })
  descricao: string

  @ApiProperty({ description: 'Total de produtos no subgrupo', example: 7202 })
  totalProdutos: number

  @ApiProperty({
    description: 'Quantidade total em estoque',
    example: 103901.41,
  })
  quantidadeEstoque: number

  @ApiProperty({ description: 'Média de estoque por produto', example: 14.43 })
  mediaPorProduto: number

  @ApiProperty({
    description: 'Giro do subgrupo (saída/estoque)',
    example: 1.92,
  })
  giro: number

  @ApiPropertyOptional({
    description: 'Classificação do giro',
    enum: ['MUITO_ALTO', 'ALTO', 'NORMAL', 'BAIXO'],
  })
  classificacao?: string
}

export class ResumoInventarioDto {
  @ApiProperty({ description: 'Código do grupo pai', example: 20100 })
  codigoGrupo: number

  @ApiProperty({
    description: 'Descrição do grupo',
    example: 'MANUTENCAO AUTOMOTIVA',
  })
  descricaoGrupo: string

  @ApiProperty({ description: 'Total de subgrupos', example: 8 })
  totalSubgrupos: number

  @ApiProperty({ description: 'Total de produtos', example: 9707 })
  totalProdutos: number

  @ApiProperty({ description: 'Quantidade total em estoque', example: 133904 })
  quantidadeTotalEstoque: number

  @ApiProperty({ description: 'Média geral por produto', example: 13.79 })
  mediaGeralPorProduto: number

  @ApiProperty({
    description: 'Valor total estimado em estoque',
    example: 0,
    nullable: true,
  })
  valorTotalEstoque?: number

  @ApiProperty({
    type: [SubgrupoInventarioDto],
    description: 'Detalhes por subgrupo',
  })
  subgrupos: SubgrupoInventarioDto[]
}

export class InventarioRequestDto {
  @ApiPropertyOptional({
    description: 'Código do grupo pai (20100 para todos)',
    example: 20100,
    default: 20100,
  })
  codigoGrupo?: number = 20100

  @ApiPropertyOptional({
    description: 'Incluir apenas subgrupos específicos',
    type: [Number],
    example: [20102, 20103],
  })
  subgrupos?: number[]

  @ApiPropertyOptional({
    description: 'Ordenar por campo',
    example: 'quantidadeEstoque',
    default: 'codigo',
  })
  ordemPor?: string

  @ApiPropertyOptional({
    description: 'Direção da ordenação',
    enum: ['asc', 'desc'],
    default: 'asc',
  })
  direcao?: 'asc' | 'desc'
}

export class InventarioResponseDto {
  @ApiProperty({ description: 'Status da operação', example: 'success' })
  status: string

  @ApiProperty({ description: 'Timestamp da resposta' })
  timestamp: Date

  @ApiProperty({ type: ResumoInventarioDto })
  data: ResumoInventarioDto

  @ApiPropertyOptional({ description: 'Filtros aplicados' })
  filtros?: Record<string, any>
}
