export interface Tgfite {
  [key: string]: any
  nunota: number
  sequencia: number
  codprod?: number
  qtdneg?: number
  vlrunit?: number
  vlrtot?: number
  vlrdesc?: number
  // Relations
  tgfpro?: {
    codprod: number
    descrprod: string
    referencia?: string
    marca?: string
  }
  tgfgru?: {
    codgrupoprod: number
    descrgrupoprod: string
  }
}
