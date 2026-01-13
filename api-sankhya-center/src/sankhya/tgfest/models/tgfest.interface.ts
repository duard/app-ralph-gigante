export interface Tgfest {
  codemp: number
  codlocal: number
  codprod: number
  controle: string
  reservado?: number
  estmin: number
  estmax: number
  codbarra?: string
  ativo: string
  dtval?: Date
  tipo: string
  codparc: number
  percpureza?: number
  percgermin?: number
  estoque?: number
  dtfabricacao?: Date
  statuslote: string
  md5paf?: string
  dtentrada?: Date
  qtdpedpendest?: number
  wmsbloqueado?: number
  percvc?: number
  codagregacao?: string

  tgfemp?: { codemp: number; nomefantasia: string }
  tgfloc?: { codlocal: number; nome: string }
  tgfpar?: { codparc: number; nomparc: string }
  tgfpro?: { codprod: number; descrprod: string }
}
