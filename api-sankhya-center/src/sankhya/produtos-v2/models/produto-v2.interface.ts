export interface ProdutoV2 {
  codprod: number
  descrprod: string
  referencia: string | null
  marca: string | null
  codvol: string | null
  ativo: string
  codgrupoprod: number
  descrgrupoprod: string | null
  localizacao: string | null
  tipcontest: string | null
  liscontest: string | null
  estoque: number | null
  estmin: number | null
  estmax: number | null
  valorEstoque: number | null
}

export interface ProdutoV2Completo extends ProdutoV2 {
  compldesc: string | null
  caracteristicas: string | null
  ncm: string | null
  pesobruto: number | null
  pesoliq: number | null
  usoprod: string | null
  origprod: string | null
}
