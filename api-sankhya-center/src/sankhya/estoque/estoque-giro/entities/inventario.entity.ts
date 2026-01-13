export class InventarioSubgrupoEntity {
  codigo: number
  descricao: string
  totalProdutos: number
  quantidadeEstoque: number
  mediaPorProduto: number
  giro: number
  classificacao: string

  constructor(partial: Partial<InventarioSubgrupoEntity>) {
    Object.assign(this, partial)
  }
}

export class InventarioEntity {
  codigoGrupo: number
  descricaoGrupo: string
  totalSubgrupos: number
  totalProdutos: number
  quantidadeTotalEstoque: number
  mediaGeralPorProduto: number
  valorTotalEstoque?: number
  subgrupos: InventarioSubgrupoEntity[]

  constructor(partial: Partial<InventarioEntity>) {
    Object.assign(this, partial)
    this.subgrupos = partial.subgrupos || []
  }
}
