// Types for Produtos V2 feature

export interface ProdutoV2Completo {
  codprod: number;
  descrprod: string;
  referencia: string | null;
  marca: string | null;
  codvol: string | null;
  ativo: string;
  codgrupoprod: number;
  descrgrupoprod: string | null;
  localizacao: string | null;
  tipcontest: string | null;
  liscontest: string | null;
  estoque: number | null;
  estmin: number | null;
  estmax: number | null;
  valorEstoque: number | null;
  compldesc: string | null;
  caracteristicas: string | null;
  ncm: string | null;
  pesobruto: number | null;
  pesoliq: number | null;
  usoprod: string | null;
  origprod: string | null;
}

export interface EstoquePorLocal {
  codlocal: number;
  descrlocal: string;
  estoque: number | null;
  estmin: number | null;
  estmax: number | null;
  custoger: number | null;
  valorEstoque: number | null;
}

export interface ConsumoMensal {
  ano: number;
  mes: number;
  descricaoMes: string;
  quantidade: number;
  valor: number;
}
