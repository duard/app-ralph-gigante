import { ApiProperty } from '@nestjs/swagger'

export class ProdutoInfoDto {
  @ApiProperty({ example: 3680 })
  codprod: number

  @ApiProperty({ example: 'PAPEL SULFITE A4 500 FOLHAS' })
  descrprod: string

  @ApiProperty({ example: 'S' })
  ativo: string
}

export class PeriodoInfoDto {
  @ApiProperty({ example: '2025-12-01' })
  inicio: string

  @ApiProperty({ example: '2025-12-31' })
  fim: string

  @ApiProperty({ example: 31, description: 'Dias no período' })
  dias: number
}

export class HistoricoPrecoDto {
  @ApiProperty({ example: '2025-12-15', description: 'Data da compra' })
  data: string

  @ApiProperty({ example: 123456, description: 'Número único da nota' })
  nunota: number

  @ApiProperty({ example: 25.00, description: 'Preço unitário nesta compra' })
  precoUnitario: number

  @ApiProperty({ example: 100, description: 'Quantidade comprada' })
  quantidadeComprada: number

  @ApiProperty({ example: 2500.00, description: 'Valor total da compra' })
  valorTotal: number
}

export class ResumoConsumoDto {
  @ApiProperty({ example: 22, description: 'Total de notas fiscais' })
  totalMovimentacoes: number

  @ApiProperty({ example: 22, description: 'Total de linhas de itens' })
  totalLinhas: number

  @ApiProperty({ example: 37, description: 'Quantidade total consumida' })
  quantidadeConsumo: number

  @ApiProperty({ example: 876.53, description: 'Valor total consumido' })
  valorConsumo: number

  @ApiProperty({ example: 342, description: 'Quantidade total de entradas' })
  quantidadeEntrada: number

  @ApiProperty({ example: 7954.22, description: 'Valor total de entradas' })
  valorEntrada: number

  @ApiProperty({
    example: 23.68,
    description: 'Média diária de consumo',
  })
  mediaDiariaConsumo?: number

  @ApiProperty({
    example: 1.2,
    description: 'Consumo por movimentação',
  })
  mediaPorMovimentacao?: number

  @ApiProperty({
    example: 100,
    description: 'Saldo inicial (quantidade) no início do período',
  })
  saldoInicialQuantidade?: number

  @ApiProperty({
    example: 2500.00,
    description: 'Saldo inicial (valor) no início do período',
  })
  saldoInicialValor?: number

  @ApiProperty({
    example: 405,
    description: 'Saldo final (quantidade) ao final do período',
  })
  saldoFinalQuantidade?: number

  @ApiProperty({
    example: 9377.69,
    description: 'Saldo final (valor) ao final do período',
  })
  saldoFinalValor?: number

  // ========== ANÁLISE DE PREÇO AO LONGO DO TEMPO ==========

  @ApiProperty({
    example: 23.50,
    description: 'Preço médio ponderado das compras no período (por quantidade)',
  })
  precoMedioPonderado?: number

  @ApiProperty({
    example: 25.00,
    description: 'Preço da última compra DENTRO do período',
  })
  precoUltimaCompra?: number

  @ApiProperty({
    example: 20.00,
    description: 'Menor preço de compra no período',
  })
  precoMinimo?: number

  @ApiProperty({
    example: 25.00,
    description: 'Maior preço de compra no período',
  })
  precoMaximo?: number

  @ApiProperty({
    example: 25.0,
    description: 'Variação percentual do preço (%) entre primeira e última compra',
  })
  variacaoPrecoPercentual?: number

  @ApiProperty({
    example: 'AUMENTO',
    description: 'Tendência de preço: AUMENTO, QUEDA, ESTAVEL',
    enum: ['AUMENTO', 'QUEDA', 'ESTAVEL'],
  })
  tendenciaPreco?: 'AUMENTO' | 'QUEDA' | 'ESTAVEL'

  @ApiProperty({
    type: [HistoricoPrecoDto],
    description: 'Histórico cronológico de preços de compra no período',
  })
  historicoPrecos?: HistoricoPrecoDto[]
}

export class AgrupamentoItemDto {
  @ApiProperty({ example: 311, description: 'Código do usuário' })
  codigo?: number

  @ApiProperty({ example: 'ELLEN.SOUZA', description: 'Nome do usuário' })
  nome?: string

  @ApiProperty({ example: 16, description: 'Código do grupo' })
  codigoGrupo?: number

  @ApiProperty({ example: 'FINANCEIRO', description: 'Nome do grupo' })
  nomeGrupo?: string

  @ApiProperty({ example: 1234, description: 'Código do parceiro' })
  codigoParceiro?: number

  @ApiProperty({ example: 'FORNECEDOR XYZ', description: 'Nome do parceiro' })
  nomeParceiro?: string

  @ApiProperty({ example: '2025-12', description: 'Mês (YYYY-MM)' })
  mes?: string

  @ApiProperty({ example: 500, description: 'Tipo de operação' })
  tipoOperacao?: number

  @ApiProperty({ example: 10, description: 'Número de movimentações' })
  movimentacoes: number

  @ApiProperty({ example: 25, description: 'Quantidade consumida' })
  quantidadeConsumo: number

  @ApiProperty({ example: 592.25, description: 'Valor consumido' })
  valorConsumo: number

  @ApiProperty({
    example: 100,
    description: 'Percentual do total',
  })
  percentual?: number
}

export class AgrupamentoDto {
  @ApiProperty({
    example: 'usuario',
    description: 'Tipo de agrupamento aplicado',
  })
  tipo: string

  @ApiProperty({
    type: [AgrupamentoItemDto],
    description: 'Dados agrupados',
  })
  dados: AgrupamentoItemDto[]

  @ApiProperty({
    example: 10,
    description: 'Total de registros no agrupamento',
  })
  total: number
}

export class MovimentacaoDetalhadaDto {
  @ApiProperty({ example: '2025-12-15T10:30:00' })
  data: string

  @ApiProperty({ example: 123456 })
  nunota: number

  @ApiProperty({ example: 1234 })
  numnota?: number

  @ApiProperty({ example: 500 })
  codtipoper: number

  @ApiProperty({ example: -1, description: 'Atualização de estoque' })
  atualestoque: number

  @ApiProperty({ example: 'V', description: 'Tipo de movimento (C/O/Q/V/D/T/J/L/P)' })
  tipmov?: string

  @ApiProperty({ example: 'B', description: 'Atualização de estoque (B/E/N/R)' })
  atualest?: string

  @ApiProperty({ example: 'CONSUMO' })
  tipoMovimento: string

  @ApiProperty({ example: 'Venda', description: 'Tipo de movimento traduzido' })
  tipoMovimentoDescricao?: string

  @ApiProperty({ example: 311 })
  codusuinc?: number

  @ApiProperty({ example: 'ELLEN.SOUZA' })
  nomeusuinc?: string

  @ApiProperty({ example: 1234 })
  codparc?: number

  @ApiProperty({ example: 'FORNECEDOR XYZ' })
  nomeparc?: string

  @ApiProperty({ example: 5 })
  quantidade: number

  @ApiProperty({ example: 23.65 })
  valorUnitario: number

  @ApiProperty({ example: 118.25 })
  valorTotal: number
}

export class MovimentacoesDto {
  @ApiProperty({ type: [MovimentacaoDetalhadaDto] })
  data: MovimentacaoDetalhadaDto[]

  @ApiProperty({ example: 1 })
  page: number

  @ApiProperty({ example: 20 })
  perPage: number

  @ApiProperty({ example: 22 })
  total: number

  @ApiProperty({ example: 2 })
  lastPage: number
}

export class ProdutoConsumoAnaliseResponseDto {
  @ApiProperty({ type: ProdutoInfoDto })
  produto: ProdutoInfoDto

  @ApiProperty({ type: PeriodoInfoDto })
  periodo: PeriodoInfoDto

  @ApiProperty({ type: ResumoConsumoDto })
  resumo: ResumoConsumoDto

  @ApiProperty({ type: AgrupamentoDto, required: false })
  agrupamento?: AgrupamentoDto

  @ApiProperty({ type: MovimentacoesDto })
  movimentacoes: MovimentacoesDto
}
