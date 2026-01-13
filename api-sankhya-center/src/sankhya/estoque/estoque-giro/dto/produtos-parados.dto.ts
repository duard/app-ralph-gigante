import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class SubgrupoParadoDto {
  @ApiProperty({ description: 'Código do subgrupo', example: 20102 })
  codigo: number

  @ApiProperty({ description: 'Descrição do subgrupo', example: 'MECANICA' })
  descricao: string

  @ApiProperty({ description: 'Total de produtos parados', example: 4118 })
  totalParados: number

  @ApiProperty({ description: 'Com estoque', example: 11 })
  comEstoque: number

  @ApiProperty({ description: 'Sem estoque', example: 4107 })
  semEstoque: number
}

export class ProdutoParadoDto {
  @ApiProperty({ description: 'Código do produto', example: 7047 })
  codigo: number

  @ApiProperty({
    description: 'Descrição do produto',
    example: 'SUCATA DE FERRO',
  })
  descricao: string

  @ApiProperty({ description: 'Código do subgrupo', example: 20104 })
  codigoSubgrupo: number

  @ApiProperty({ description: 'Descrição do subgrupo', example: 'CALDEIRARIA' })
  descricaoSubgrupo: string

  @ApiPropertyOptional({ description: 'Marca do produto', example: 'GENERICO' })
  marca?: string

  @ApiProperty({
    description: 'Quantidade em estoque',
    example: 0,
    nullable: true,
  })
  estoque: number | null

  @ApiProperty({ description: 'Total de entradas', example: 20063 })
  totalEntrada: number

  @ApiProperty({ description: 'Total de saídas', example: 0 })
  totalSaida: number

  @ApiProperty({ description: 'Data da última movimentação', nullable: true })
  dataUltimaMovimentacao?: Date

  @ApiPropertyOptional({
    description: 'Sugestão de ação',
    enum: [
      'VENDER_COMO_SUCATA',
      'DEVOLVER_FORNECEDOR',
      'DOAR',
      'ANALISAR',
      'MANTER',
    ],
  })
  sugestao?: string
}

export class ResumoProdutosParadosDto {
  @ApiProperty({ description: 'Código do grupo', example: 20100 })
  codigoGrupo: number

  @ApiProperty({
    description: 'Descrição do grupo',
    example: 'MANUTENCAO AUTOMOTIVA',
  })
  descricaoGrupo: string

  @ApiProperty({ description: 'Total de produtos parados', example: 6387 })
  totalProdutosParados: number

  @ApiProperty({ description: 'Produtos parados com estoque', example: 15 })
  comEstoque: number

  @ApiProperty({ description: 'Produtos parados sem estoque', example: 6372 })
  semEstoque: number

  @ApiProperty({ description: 'Percentual de produtos parados', example: 56.8 })
  percentualParado: number

  @ApiProperty({
    type: [SubgrupoParadoDto],
    description: 'Resumo por subgrupo',
  })
  porSubgrupo: SubgrupoParadoDto[]

  @ApiProperty({
    type: [ProdutoParadoDto],
    description: 'Produtos parados detalhados',
  })
  produtos: ProdutoParadoDto[]
}

export class ProdutosParadosRequestDto {
  @ApiPropertyOptional({
    description: 'Código do subgrupo',
    example: 20102,
  })
  codigoSubgrupo?: number

  @ApiPropertyOptional({
    description: 'Filtrar apenas produtos com estoque',
    default: false,
  })
  apenasComEstoque?: boolean

  @ApiPropertyOptional({
    description: 'Ordenar por',
    example: 'totalEntrada',
    default: 'totalParados',
  })
  ordemPor?: string

  @ApiPropertyOptional({
    description: 'Limite de resultados',
    example: 100,
    default: 100,
  })
  limite?: number

  @ApiPropertyOptional({
    description: 'Página para paginação',
    example: 1,
    default: 1,
  })
  pagina?: number

  @ApiPropertyOptional({
    description: 'Itens por página',
    example: 20,
    default: 20,
  })
  itensPorPagina?: number
}

export class ProdutosParadosResponseDto {
  @ApiProperty({ description: 'Status da operação', example: 'success' })
  status: string

  @ApiProperty({ description: 'Timestamp da resposta' })
  timestamp: Date

  @ApiProperty({ type: ResumoProdutosParadosDto })
  data: ResumoProdutosParadosDto

  @ApiPropertyOptional({ description: 'Filtros aplicados' })
  filtros?: Record<string, any>

  @ApiPropertyOptional({ description: 'Paginação' })
  paginacao?: {
    pagina: number
    itensPorPagina: number
    totalItens: number
    totalPaginas: number
  }
}
