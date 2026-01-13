export interface FiltroOpcao {
  codigo: string | number
  descricao: string
  contagem: number
}

export interface GrupoResumo {
  codgrupoprod: number
  descrgrupoprod: string
  totalProdutos: number
  produtosAtivos: number
  produtosCriticos: number
  valorEstoque: number
}

export interface LocalResumo {
  codlocal: number
  descrlocal: string
  totalProdutos: number
  valorEstoque: number
}
