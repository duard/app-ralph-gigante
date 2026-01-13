import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { StatusClassificacao } from './dashboard-filters.dto'

export class TopProdutoDto {
  @ApiProperty({ description: 'Posição no ranking', example: 1 })
  posicao: number

  @ApiProperty({ description: 'Código do produto', example: 2213 })
  codigo: number

  @ApiProperty({
    description: 'Descrição do produto',
    example: 'ABRACADEIRA NYLON',
  })
  descricao: string

  @ApiProperty({ description: 'Código do subgrupo', example: 20102 })
  codigoSubgrupo: number

  @ApiProperty({ description: 'Descrição do subgrupo', example: 'MECANICA' })
  descricaoSubgrupo: string

  @ApiPropertyOptional({ description: 'Marca do produto', example: 'GENERICO' })
  marca?: string

  @ApiProperty({ description: 'Quantidade em estoque atual', example: 28930 })
  estoque: number

  @ApiProperty({ description: 'Total consumido/saído', example: 29332 })
  totalConsumo: number

  @ApiProperty({ description: 'Total de entradas', example: 35000 })
  totalEntrada: number

  @ApiProperty({ description: 'Ratio estoque/consumo (0-1)', example: 0.99 })
  ratio: number

  @ApiProperty({
    description: 'Classificação do status',
    enum: StatusClassificacao,
  })
  status: StatusClassificacao

  @ApiPropertyOptional({ description: 'Sugestão de compra', example: 500 })
  sugestaoCompra?: number

  @ApiPropertyOptional({
    description: 'Consumo médio mensal estimado',
    example: 2444,
  })
  consumoMedioMensal?: number
}

export class ResumoTopProdutosDto {
  @ApiProperty({ description: 'Código do grupo', example: 20100 })
  codigoGrupo: number

  @ApiProperty({
    description: 'Descrição do grupo',
    example: 'MANUTENCAO AUTOMOTIVA',
  })
  descricaoGrupo: string

  @ApiProperty({ description: 'Código do subgrupo', example: 20102 })
  codigoSubgrupo?: number

  @ApiPropertyOptional({ description: 'Descrição do subgrupo' })
  descricaoSubgrupo?: string

  @ApiProperty({ description: 'Total de produtos no subgrupo', example: 7202 })
  totalProdutosSubgrupo: number

  @ApiProperty({ description: 'Quantidade de produtos no TOP', example: 50 })
  totalNoTop: number

  @ApiProperty({ description: 'Produtos críticos no TOP', example: 18 })
  totalCriticos: number

  @ApiProperty({
    description: 'Produtos com estoque baixo no TOP',
    example: 19,
  })
  totalBaixo: number

  @ApiProperty({ description: 'Produtos equilibrados no TOP', example: 12 })
  totalEquilibrado: number

  @ApiProperty({ description: 'Sem estoque no TOP', example: 1 })
  totalSemEstoque: number

  @ApiProperty({ type: [TopProdutoDto], description: 'Lista dos TOP produtos' })
  produtos: TopProdutoDto[]
}

export class TopProdutosRequestDto {
  @ApiPropertyOptional({
    description: 'Código do subgrupo',
    example: 20102,
  })
  codigoSubgrupo?: number

  @ApiPropertyOptional({
    description: 'Classificação para filtrar',
    enum: StatusClassificacao,
  })
  statusClassificacao?: StatusClassificacao

  @ApiPropertyOptional({
    description: 'Limite de produtos no ranking',
    example: 50,
    default: 50,
  })
  limite?: number

  @ApiPropertyOptional({
    description: 'Ordenar por',
    example: 'totalConsumo',
    default: 'totalConsumo',
  })
  ordemPor?: string

  @ApiPropertyOptional({
    description: 'Direção da ordenação',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  direcao?: 'asc' | 'desc'

  @ApiPropertyOptional({
    description: 'Buscar por descrição',
    example: 'parafuso',
  })
  busca?: string

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

export class TopProdutosResponseDto {
  @ApiProperty({ description: 'Status da operação', example: 'success' })
  status: string

  @ApiProperty({ description: 'Timestamp da resposta' })
  timestamp: Date

  @ApiProperty({ type: ResumoTopProdutosDto })
  data: ResumoTopProdutosDto

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
