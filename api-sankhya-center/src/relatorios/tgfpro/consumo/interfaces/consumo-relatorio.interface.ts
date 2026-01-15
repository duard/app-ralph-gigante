/**
 * Interfaces para o Relatório de Consumo de Produto
 * Contexto: Empresa que COMPRA e CONSOME internamente (não produz, não vende)
 */

export interface ProdutoInfo {
  codprod: number
  descrprod: string
  complemento: string | null
  unidade: string
  ativo: string
  tipcontest: string | null
}

export interface ResumoConsumo {
  saldoInicialQtd: number
  saldoInicialValor: number
  totalComprasQtd: number
  totalComprasValor: number
  totalConsumoQtd: number
  totalConsumoValor: number
  saldoFinalQtd: number        // Saldo no fim do período consultado
  saldoFinalValor: number
  saldoAtualQtd: number        // Saldo em tempo real (hoje)
  saldoAtualValor: number
  mediaConsumoDia: number
  diasEstoqueDisponivel: number
  percentualConsumo: number
  valorMedioUnitario: number
}

export interface ConsumoDiario {
  data: string
  dataFormatada: string
  qtdConsumo: number
  qtdCompra: number
  saldoDia: number
}

export interface ConsumoMensal {
  ano: number
  mes: number
  mesNome: string
  qtdConsumo: number
  valorConsumo: number
}

export interface ConsumoPorDepartamento {
  codgrupo: number | null
  departamento: string
  qtdConsumo: number
  valorConsumo: number
  qtdRequisicoes: number
  percentual: number
}

export interface MovimentacaoDetalhada {
  data: string
  dataFormatada: string
  nunota: number
  tipo: 'COMPRA' | 'CONSUMO' | 'TRANSF' | 'OUTROS'
  tipoOperacao: string
  codtipoper: number
  setor: string
  usuario: string
  grupoUsuario: string
  codparc: number | null
  parceiro: string
  qtdMov: number
  valorMov: number
  observacao: string | null
}

export interface DadosRelatorio {
  produto: ProdutoInfo
  periodo: {
    dataInicio: string
    dataFim: string
    totalDias: number
  }
  resumo: ResumoConsumo
  consumoDiario: ConsumoDiario[]
  consumoMensal: ConsumoMensal[]
  consumoPorCentroCusto: ConsumoPorDepartamento[]
  consumoPorGrupoUsuario: ConsumoPorDepartamento[]
  movimentacoes: MovimentacaoDetalhada[]
  geradoEm: string
  geradoPor: string
}
