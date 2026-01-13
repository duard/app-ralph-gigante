export interface TgfproSimplified {
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
  controleItem?: string | null
  controleIndex?: number
  totalControles?: number
  estoque?: number | null
  estmin?: number | null
  estmax?: number | null
}
