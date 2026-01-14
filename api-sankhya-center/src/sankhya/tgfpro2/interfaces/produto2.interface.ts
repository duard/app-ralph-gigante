import { EstoqueLocal } from './estoque-local.interface'

/**
 * Interface Produto2 - Produto com informações de estoque por local
 * Baseado no PRD TGFPRO2-IMPLEMENTATION-GUIDE.md
 */
export interface Produto2 {
  // ========== Identificação ==========
  /** Código único do produto */
  codprod: number

  /** Descrição do produto */
  descrprod: string

  /** Complemento da descrição (opcional) */
  compldesc?: string

  /** Características detalhadas do produto */
  caracteristicas?: string

  /** Referência/código alternativo */
  referencia?: string

  /** Referência do fornecedor */
  refforn?: string

  // ========== Classificação ==========
  /** Marca do produto */
  marca?: string

  /** Código do grupo de produtos */
  codgrupoprod: number

  /** Código da unidade de medida (venda) */
  codvol: string

  /** Código da unidade de medida (compra) */
  codvolcompra?: string

  /** Código NCM (Nomenclatura Comum do Mercosul) */
  ncm?: string

  /** Status ativo (S/N) */
  ativo: string

  // ========== Características Físicas ==========
  /** Peso bruto do produto (em kg) */
  pesobruto?: number

  /** Peso líquido do produto (em kg) */
  pesoliq?: number

  // ========== Localização física ==========
  /** Localização física no depósito (ex: "Prateleira A12") */
  localizacao?: string

  /** Código do local padrão de estoque */
  codlocalpadrao?: number

  /** Usa controle de local (S/N) */
  usalocal?: string

  // ========== Financeiro/Gestão ==========
  /** Código do centro de custo */
  codcencus?: number

  // ========== Controle de Estoque ==========
  /** Tipo de controle de estoque */
  tipcontest?: string

  /** Lista de controles (lotes, séries, etc) */
  liscontest?: string

  /** Estoque mínimo padrão */
  estmin?: number

  /** Estoque máximo padrão */
  estmax?: number

  /** Alerta de estoque mínimo (S/N) */
  alertaestmin?: string

  /** Prazo de validade (em dias) */
  prazoval?: number

  /** Usa número de fogo (S/N) */
  usanrofogo?: string

  // ========== Uso ==========
  /** Uso do produto: C (Consumo), R (Revenda) */
  usoprod?: string

  /** Origem do produto */
  origprod?: string

  // ========== Tracking/Auditoria ==========
  /** Código do usuário responsável pelo produto (último manipulador) */
  codusu?: number

  /** Código do usuário que incluiu o produto */
  codusuinc?: number

  /** Data de cadastro do produto */
  dtcad?: string

  /** Código do usuário que alterou o produto */
  codusualt?: number

  /** Data da última alteração do produto */
  dtalter?: string

  /** Nome do usuário responsável (via JOIN TSIUSU ON P.CODUSU) */
  nomeusu?: string

  /** Data limite de acesso do usuário (se preenchido, usuário está desativado) */
  dtlimacesso?: string

  /** Nome do usuário que incluiu (via JOIN TSIUSU) */
  nomeusuInc?: string

  /** Nome do usuário que alterou (via JOIN TSIUSU) */
  nomeusuAlt?: string

  // ========== Relacionamentos (opcionais via JOIN) ==========
  /** Informações do grupo de produtos */
  tgfgru?: {
    codgrupoprod: number
    descrgrupoprod: string
  }

  /** Informações da unidade de medida */
  tgfvol?: {
    codvol: string
    descrvol: string
  }

  /** Informações do local de estoque */
  tgfloc?: {
    codlocal?: number
    descrlocal: string
  }

  // ========== NOVO: Estoque agregado por local ==========
  /** Array com estoque detalhado por local */
  estoqueLocais?: EstoqueLocal[]

  /** Resumo do estoque total (agregado de todos os locais) */
  estoque?: {
    /** Quantidade total em estoque (soma de todos os locais) */
    totalGeral: number

    /** Soma dos estoques mínimos */
    totalMin: number

    /** Soma dos estoques máximos */
    totalMax: number

    /** Quantidade de locais com estoque */
    qtdeLocais: number

    /** Status geral do estoque */
    statusGeral: 'NORMAL' | 'BAIXO' | 'CRITICO' | 'EXCESSO'
  }
}
