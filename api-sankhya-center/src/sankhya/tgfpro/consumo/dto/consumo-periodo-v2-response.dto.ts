import { ApiProperty } from '@nestjs/swagger'

// ============================================================
// DTOs V2 - Com todas as melhorias (camelCase)
// ============================================================

export class ProdutoInfoDto {
  @ApiProperty({ description: 'Código do produto' })
  codprod: number

  @ApiProperty({ description: 'Descrição do produto' })
  descrprod: string

  @ApiProperty({ description: 'Complemento da descrição', required: false })
  complemento?: string

  @ApiProperty({ description: 'Unidade de medida' })
  unidade: string

  @ApiProperty({ description: 'Status ativo (S/N)' })
  ativo: string
}

export class TipoOperacaoDto {
  @ApiProperty({ description: 'Código do tipo de operação' })
  codtipoper: number

  @ApiProperty({ description: 'Descrição da operação' })
  descricao: string

  @ApiProperty({ description: 'Como atualiza estoque (B, E, N, R)' })
  atualizaEstoque: string
}

export class CentroCustoDto {
  @ApiProperty({ description: 'Código do centro de custo', required: false })
  codigo?: number

  @ApiProperty({ description: 'Descrição do centro de custo', required: false })
  descricao?: string
}

export class LocalizacaoEstoqueDto {
  @ApiProperty({ description: 'Código do local' })
  codlocal: number

  @ApiProperty({ description: 'Descrição do local' })
  descricao: string

  @ApiProperty({ description: 'Controle (lote/série)', required: false })
  controle?: string

  @ApiProperty({ description: 'Quantidade em estoque' })
  estoque: number
}

export class MovimentacaoV2Dto {
  @ApiProperty({ description: 'Tipo de registro' })
  tipoRegistro: string

  @ApiProperty({ description: 'Data de referência (efetiva)' })
  dataReferencia: string | Date

  @ApiProperty({ description: 'Data de negociação', required: false })
  dtneg?: string | Date

  @ApiProperty({ description: 'Data de entrada/saída', required: false })
  dtentsai?: string | Date

  @ApiProperty({ description: 'Número da nota' })
  nunota: number

  @ApiProperty({ description: 'Tipo de movimento (C, V, Q, etc)' })
  tipmov: string

  @ApiProperty({
    type: TipoOperacaoDto,
    description: 'Informações do tipo de operação',
  })
  tipoOperacao: TipoOperacaoDto

  @ApiProperty({ description: 'Código do parceiro' })
  codparc: number

  @ApiProperty({ description: 'Nome do parceiro' })
  nomeParceiro: string

  @ApiProperty({
    type: CentroCustoDto,
    required: false,
    description: 'Centro de custo',
  })
  centroCusto?: CentroCustoDto

  @ApiProperty({ description: 'Usuário que incluiu' })
  usuario: string

  @ApiProperty({ description: 'Observação da nota', required: false })
  observacao?: string

  @ApiProperty({ description: 'Observação do item', required: false })
  observacaoItem?: string

  @ApiProperty({ description: 'Controle (lote/série)', required: false })
  controle?: string

  @ApiProperty({ description: 'Quantidade movimentada' })
  quantidadeMov: number

  @ApiProperty({ description: 'Quantidade negociada', required: false })
  quantidadeNegociada?: number

  @ApiProperty({ description: 'Quantidade entregue', required: false })
  quantidadeEntregue?: number

  @ApiProperty({ description: 'Quantidade pendente', required: false })
  quantidadePendente?: number

  @ApiProperty({ description: 'Status pendente (S/N)', required: false })
  statusPendente?: string

  @ApiProperty({ description: 'Valor movimentado' })
  valorMov: number

  @ApiProperty({ description: 'Valor movimentado formatado' })
  valorMovFormatted: string

  @ApiProperty({ description: 'Valor unitário' })
  valorUnitario: number

  @ApiProperty({ description: 'Saldo quantidade anterior' })
  saldoQtdAnterior: number

  @ApiProperty({ description: 'Saldo quantidade final' })
  saldoQtdFinal: number

  @ApiProperty({ description: 'Saldo valor anterior' })
  saldoValorAnterior: number

  @ApiProperty({ description: 'Saldo valor final' })
  saldoValorFinal: number

  @ApiProperty({ description: 'Saldo valor final formatado' })
  saldoValorFinalFormatted: string

  @ApiProperty({ description: 'Preço Médio Móvel' })
  pmm: number
}

export class SaldoV2Dto {
  @ApiProperty({ description: 'Tipo de registro' })
  tipoRegistro: string

  @ApiProperty({ description: 'Data de referência' })
  dataReferencia: string

  @ApiProperty({ description: 'Quantidade em estoque', required: false })
  saldoQtd?: number

  @ApiProperty({ description: 'Valor em estoque', required: false })
  saldoValor?: number

  @ApiProperty({ description: 'Valor formatado', required: false })
  saldoValorFormatted?: string

  @ApiProperty({ description: 'Valor unitário de referência', required: false })
  valorUnitarioReferencia?: number

  @ApiProperty({ description: 'Quantidade final', required: false })
  saldoQtdFinal?: number

  @ApiProperty({ description: 'Valor final', required: false })
  saldoValorFinal?: number

  @ApiProperty({ description: 'Valor final formatado', required: false })
  saldoValorFinalFormatted?: string

  @ApiProperty({
    type: [LocalizacaoEstoqueDto],
    required: false,
    description: 'Localizações físicas do estoque',
  })
  localizacoes?: LocalizacaoEstoqueDto[]
}

export class MetricasV2Dto {
  @ApiProperty({ description: 'Valor médio do período' })
  valorMedioPeriodo: number

  @ApiProperty({ description: 'Valor médio das entradas' })
  valorMedioEntradas: number

  @ApiProperty({ description: 'Total de consumo (baixas)' })
  totalConsumoBaixas: number

  @ApiProperty({ description: 'Total de entradas (quantidade)' })
  totalEntradasQtd: number

  @ApiProperty({ description: 'Total de saídas (quantidade)' })
  totalSaidasQtd: number

  @ApiProperty({ description: 'Total de entradas (valor)' })
  totalEntradasValor: number

  @ApiProperty({ description: 'Total de saídas (valor)' })
  totalSaidasValor: number

  @ApiProperty({ description: 'Percentual de consumo sobre saldo inicial' })
  percentualConsumo: number

  @ApiProperty({ description: 'Média de consumo por dia' })
  mediaConsumoDia: number

  @ApiProperty({ description: 'Dias de estoque disponível (estimativa)' })
  diasEstoqueDisponivel: number
}

export class PeriodoInfoDto {
  @ApiProperty({ description: 'Data inicial' })
  dataInicio: string

  @ApiProperty({ description: 'Data final' })
  dataFim: string

  @ApiProperty({ description: 'Total de dias no período' })
  totalDias: number
}

export class ConsumoPeriodoV2ResponseDto {
  @ApiProperty({ type: ProdutoInfoDto, description: 'Informações do produto' })
  produto: ProdutoInfoDto

  @ApiProperty({ type: PeriodoInfoDto, description: 'Informações do período' })
  periodo: PeriodoInfoDto

  @ApiProperty({ description: 'Número da página', required: false })
  page?: number

  @ApiProperty({ description: 'Itens por página', required: false })
  perPage?: number

  @ApiProperty({ description: 'Total de movimentações no período' })
  totalMovimentacoes: number

  @ApiProperty({ type: SaldoV2Dto, description: 'Saldo anterior ao período' })
  saldoAnterior: SaldoV2Dto

  @ApiProperty({
    type: [MovimentacaoV2Dto],
    description: 'Lista de movimentações',
  })
  movimentacoes: MovimentacaoV2Dto[]

  @ApiProperty({ description: 'Total de movimentações na página atual' })
  totalMovimentacoesOnPage: number

  @ApiProperty({
    type: MetricasV2Dto,
    description: 'Métricas calculadas do período',
  })
  metrics: MetricasV2Dto

  @ApiProperty({ description: 'Movimento líquido (entradas - saídas)' })
  movimentoLiquido: number

  @ApiProperty({ type: SaldoV2Dto, description: 'Saldo atual' })
  saldoAtual: SaldoV2Dto
}
