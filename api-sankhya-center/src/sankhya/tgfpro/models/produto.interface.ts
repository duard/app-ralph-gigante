export interface Produto {
  codprod: number
  descrprod: string
  compldesc?: string
  referencia?: string
  codgrupoprod: number
  marca?: string
  ativo: string
  codvol: string
  pesobruto: number
  pesoliq: number
  tipcontest?: string // Campo de controle
  liscontest?: string // Lista de controle

  // Relacionamentos
  grupo?: {
    codgrupoprod: number
    descrgrupoprod: string
  }
}
