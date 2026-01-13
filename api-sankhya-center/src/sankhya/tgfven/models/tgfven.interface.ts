export interface Tgfven {
  codvend: number
  tipvend?: string
  apelido: string
  codparc: number
  codreg: number
  comvenda: number
  dtalter?: Date
  codusu: number

  tgfpar?: { codparc: number; nomeparc: string }
}
