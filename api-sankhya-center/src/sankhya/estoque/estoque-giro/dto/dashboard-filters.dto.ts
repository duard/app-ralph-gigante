export enum GrupoEstoque {
  MANUTENCAO_AUTOMOTIVA = 20100,
  ELETRICA_AUTOMOTIVA = 20101,
  MECANICA = 20102,
  HIDRAULICA = 20103,
  CALDEIRARIA = 20104,
  PINTURA_AUTOMOTIVA = 20105,
  RODAGEM = 20106,
  LAVADOR = 20107,
  BORRACHARIA = 20108,
}

export enum StatusClassificacao {
  CRITICO = 'CRITICO',
  BAIXO = 'BAIXO',
  EQUILIBRADO = 'EQUILIBRADO',
  SEM_ESTOQUE = 'SEM_ESTOQUE',
}

export enum TipoMovimento {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
  NAO_AFETA = 'NAO_AFETA',
}

export enum Periodo {
  MES_ATUAL = 'MES_ATUAL',
  ULTIMOS_3_MESES = 'ULTIMOS_3_MESES',
  ULTIMOS_6_MESES = 'ULTIMOS_6_MESES',
  ULTIMOS_12_MESES = 'ULTIMOS_12_MESES',
  PERSONALIZADO = 'PERSONALIZADO',
}

export class DashboardFiltersDto {
  codigoGrupo?: number = GrupoEstoque.MANUTENCAO_AUTOMOTIVA
  codigoSubgrupo?: number
  subgrupos?: number[]
  statusClassificacao?: StatusClassificacao
  tipoMovimento?: TipoMovimento
  periodo: Periodo = Periodo.ULTIMOS_12_MESES
  dataInicio?: string
  dataFim?: string
  limite: number = 50
  ordem?: string = 'estoque'
  direcao: 'asc' | 'desc' = 'desc'
  busca?: string
  pagina: number = 1
  itensPorPagina: number = 20

  constructor(init?: Partial<DashboardFiltersDto>) {
    if (init) {
      Object.assign(this, init)
    }
  }
}

export function getPeriodoDates(
  periodo: Periodo,
  dataInicio?: string,
  dataFim?: string,
): { inicio: Date; fim: Date } {
  const now = new Date()
  let inicio: Date
  let fim: Date = now

  switch (periodo) {
    case Periodo.MES_ATUAL:
      inicio = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case Periodo.ULTIMOS_3_MESES:
      inicio = new Date(now.getFullYear(), now.getMonth() - 3, 1)
      break
    case Periodo.ULTIMOS_6_MESES:
      inicio = new Date(now.getFullYear(), now.getMonth() - 6, 1)
      break
    case Periodo.ULTIMOS_12_MESES:
      inicio = new Date(now.getFullYear(), now.getMonth() - 12, 1)
      break
    case Periodo.PERSONALIZADO:
      inicio = dataInicio
        ? new Date(dataInicio)
        : new Date(now.getFullYear(), now.getMonth() - 12, 1)
      fim = dataFim ? new Date(dataFim) : now
      break
    default:
      inicio = new Date(now.getFullYear(), now.getMonth() - 12, 1)
  }

  return { inicio, fim }
}
