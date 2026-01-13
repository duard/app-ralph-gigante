import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ResumoInventarioDto } from './inventario.dto'
import { ResumoMovimentacoesDto } from './movimentacoes.dto'
import { ResumoProdutosParadosDto } from './produtos-parados.dto'
import { ResumoTopProdutosDto } from './top-produtos.dto'

export class KardexResumoDto {
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

  @ApiProperty({ description: 'Estoque atual', example: 28930 })
  estoqueAtual: number

  @ApiProperty({ description: 'Estoque mínimo', example: 1000 })
  estoqueMinimo?: number

  @ApiProperty({ description: 'Estoque máximo', example: 50000 })
  estoqueMaximo?: number

  @ApiProperty({ description: 'Total de entradas no período', example: 35000 })
  totalEntradas: number

  @ApiProperty({ description: 'Total de saídas no período', example: 29332 })
  totalSaidas: number

  @ApiProperty({ description: 'Saldo do período', example: 5668 })
  saldoPeriodo: number

  @ApiProperty({ description: 'Giro do produto', example: 1.01 })
  giro: number

  @ApiProperty({ description: 'Classificação', example: 'EQUILIBRADO' })
  classificacao: string
}

export class AlertaEstoqueDto {
  @ApiProperty({
    description: 'Tipo de alerta',
    enum: ['CRITICO', 'BAIXO', 'ALTO', 'NEGATIVO'],
  })
  tipo: string

  @ApiProperty({ description: 'Código do produto', example: 4830 })
  codigoProduto: number

  @ApiProperty({
    description: 'Descrição do produto',
    example: 'OLEO SINTETICO 5W30',
  })
  descricaoProduto: string

  @ApiProperty({ description: 'Código do subgrupo', example: 20102 })
  codigoSubgrupo: number

  @ApiProperty({ description: 'Descrição do subgrupo', example: 'MECANICA' })
  descricaoSubgrupo: string

  @ApiProperty({ description: 'Valor atual', example: 4 })
  valorAtual: number

  @ApiProperty({ description: 'Valor de referência', example: 500 })
  valorReferencia: number

  @ApiProperty({
    description: 'Mensagem do alerta',
    example: 'Estoque crítico! Repor imediatamente.',
  })
  mensagem: string

  @ApiPropertyOptional({ description: 'Sugestão de ação' })
  acaoSugerida?: string
}

export class DashboardResponseDto {
  @ApiProperty({ description: 'Status da operação', example: 'success' })
  status: string

  @ApiProperty({ description: 'Timestamp da resposta' })
  timestamp: Date

  @ApiProperty({
    type: ResumoInventarioDto,
    description: 'Resumo do inventário',
  })
  inventario: ResumoInventarioDto

  @ApiProperty({
    type: ResumoMovimentacoesDto,
    description: 'Resumo das movimentações',
  })
  movimentacoes: ResumoMovimentacoesDto

  @ApiProperty({
    type: ResumoProdutosParadosDto,
    description: 'Resumo de produtos parados',
  })
  produtosParados: ResumoProdutosParadosDto

  @ApiProperty({
    type: ResumoTopProdutosDto,
    description: 'Resumo do TOP produtos',
  })
  topProdutos: ResumoTopProdutosDto

  @ApiProperty({ type: [AlertaEstoqueDto], description: 'Alertas ativos' })
  alertas: AlertaEstoqueDto[]

  @ApiProperty({ type: [KardexResumoDto], description: 'Kardex resumido' })
  kardex: KardexResumoDto[]

  @ApiProperty({ description: 'Filtros aplicados na consulta' })
  filtrosAplicados: Record<string, any>

  @ApiProperty({ description: 'Metadados da resposta' })
  meta: {
    versaoApi: string
    tempoRespostaMs: number
    totalQueriesExecutadas: number
  }
}

export class DashboardSummaryDto {
  @ApiProperty({ description: 'Total de produtos no grupo' })
  totalProdutos: number

  @ApiProperty({ description: 'Total de unidades em estoque' })
  totalEstoque: number

  @ApiProperty({ description: 'Valor total estimado em estoque' })
  valorEstoque: number

  @ApiProperty({ description: 'Total de produtos parados' })
  produtosParados: number

  @ApiProperty({ description: 'Percentual de produtos parados' })
  percentualParado: number

  @ApiProperty({ description: 'Produtos críticos' })
  produtosCriticos: number

  @ApiProperty({ description: 'Produtos com estoque baixo' })
  produtosBaixoEstoque: number

  @ApiProperty({ description: 'Produtos equilibrados' })
  produtosEquilibrados: number

  @ApiProperty({ description: 'Giro médio do grupo' })
  giroMedio: number

  @ApiProperty({
    description: 'Classificação geral do grupo',
    enum: ['EXCELENTE', 'BOM', 'REGULAR', 'RUIM'],
  })
  classificacaoGeral: string
}
