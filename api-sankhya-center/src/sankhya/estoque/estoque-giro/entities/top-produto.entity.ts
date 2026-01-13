export enum StatusClassificacao {
  CRITICO = 'CRITICO',
  BAIXO = 'BAIXO',
  EQUILIBRADO = 'EQUILIBRADO',
  SEM_ESTOQUE = 'SEM_ESTOQUE',
}

export class TopProdutoEntity {
  posicao: number
  codigo: number
  descricao: string
  codigoSubgrupo: number
  descricaoSubgrupo: string
  marca?: string
  estoque: number
  totalConsumo: number
  totalEntrada: number
  ratio: number
  status: StatusClassificacao
  sugestaoCompra?: number
  consumoMedioMensal?: number

  constructor(partial: Partial<TopProdutoEntity>) {
    Object.assign(this, partial)
  }
}

export class TopProdutosEntity {
  codigoGrupo: number
  descricaoGrupo: string
  codigoSubgrupo?: number
  descricaoSubgrupo?: string
  totalProdutosSubgrupo: number
  totalNoTop: number
  totalCriticos: number
  totalBaixo: number
  totalEquilibrado: number
  totalSemEstoque: number
  produtos: TopProdutoEntity[]

  constructor(partial: Partial<TopProdutosEntity>) {
    Object.assign(this, partial)
    this.produtos = partial.produtos || []
  }
}
