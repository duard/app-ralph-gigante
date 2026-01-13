/**
 * Interface para TGFCAB - Cabeçalhos de Notas Fiscais
 * Representa os dados principais de uma nota fiscal, incluindo informações de emissão, valores, parceiros, etc.
 */
export interface Tgfcab {
  /** Número único da nota */
  nunota: number
  /** Código da empresa */
  codemp: number
  /** Código do centro de custo */
  codcencus: number
  /** Número da nota */
  numnota?: number
  /** Série da nota */
  serienota?: string
  /** Data de negociação */
  dtneg?: Date
  /** Data de faturamento */
  dtfatur?: Date
  /** Data de saída/entrada */
  dtentsai?: Date
  /** Data de validade */
  dtval?: Date
  /** Data de movimento */
  dtmov?: Date
  /** Data de contabilidade */
  dtcontab?: Date
  /** Hora do movimento */
  hrmov?: number
  /** Código da empresa negociadora */
  codempnegoc: number
  /** Código do parceiro */
  codparc: number
  /** Código de contato */
  codcontato?: number
  /** Rateado (S/N) */
  rateado: string
  /** Código do veículo */
  codveiculo: number
  /** Código do tipo de operação */
  codtipoper: number
  /** Data do tipo de operação */
  dhtipoper?: Date
  /** Tipo de movimento (V/P/D/A/O/C/E/H/T/J/Q/L/F) */
  tipmov: string
  /** Código do tipo de venda */
  codtipvenda: number
  /** Data do tipo de venda */
  dhtipvenda?: Date
  /** Número da cotação */
  numcotacao?: number
  /** Código do vendedor */
  codvend: number
  /** Comissão */
  comissao: number
  /** Código da moeda */
  codmoeda: number
  /** Código da observação padrão */
  codobspadrao?: number
  /** Observação */
  observacao?: string
  /** Valor do seguro */
  vlrseg: number
  /** Valor do ICMS sobre seguro */
  vlricmsseg: number
  /** Valor do destaque */
  vlrdestaque: number
  /** Valor do juros */
  vlrjuro: number
  /** Valor do vendedor */
  vlrvendor: number
  /** Valor de outros */
  vlroutros: number
  /** Valor do embargo */
  vlremb: number
  /** Valor do ICMS sobre embargo */
  vlricmsemb: number
  /** Valor do desconto sobre serviços */
  vlrdescserv: number
  /** IPI sobre embargo */
  ipiemb?: number
  /** Tipo de IPI sobre embargo */
  tipipiemb: string
  /** Valor total de desconto */
  vlrdesctot: number
  /** Valor de desconto sobre itens */
  vlrdesctotitem: number
  /** Valor do frete */
  vlrfrete: number
  /** ICMS sobre frete */
  icmsfrete: number
  /** Base de ICMS sobre frete */
  baseicmsfrete: number
  /** Tipo de frete */
  tipfrete: string
  /** CIF/FOB */
  cif_fob: string
  /** Vencimento do frete */
  vencfrete?: Date
  /** Valor da nota */
  vlrnota: number
  /** Vencimento do IPI */
  vencipi?: Date
  /** Ordem de carga */
  ordemcarga: number
  /** Sequência de carga */
  seqcarga?: string
  /** Quilometragem do veículo */
  kmveiculo?: number
  /** Código do parceiro transportador */
  codparctransp: number
  /** Quantidade de volumes */
  qtdvol: number
  /** Pendente (S/N) */
  pendente: string
  /** Base de ICMS */
  baseicms: number
  /** Valor do ICMS */
  vlricms: number
  /** Base do IPI */
  baseipi: number
  /** Valor do IPI */
  vlripi: number
  /** ISS retido (S/N) */
  issretido: string
  /** Base do ISS */
  baseiss: number
  /** Valor do ISS */
  vlriss: number
  /** Código do usuário */
  codusu: number
  /** Aprovado (S/N) */
  aprovado: string
  /** Valor do IRF */
  vlrirf: number
  /** IRF retido (S/N) */
  irfretido: string
  /** Status da nota */
  statusnota: string
  /** Comissão geral */
  comger?: number
  /** Data de alteração */
  dtalter?: Date
  /** Volume */
  volume?: string
  /** Código do parceiro de destino */
  codparcdest: number
  /** Valor de substituição */
  vlrsubst: number
  /** Base de substituição */
  basesubstit: number
  /** Código do projeto */
  codproj: number
  /** Número do contrato */
  numcontrato: number
  /** Base do INSS */
  baseinss: number
  /** Valor do INSS */
  vlrinss: number
  /** Valor total de redução de preço */
  vlrrepredtot: number
  /** Percentual de desconto */
  percdesc: number
  // ... (truncated for brevity, but include all fields)
  /** Chave da NF-e */
  chavenfe?: string
  // Relations
  /** Relacionamento com TGFTOP */
  tgftop?: {
    codtipoper: number
    descrtipoper: string
  }
  /** Relacionamento com TGFPAR */
  tgfpar?: {
    codparc: number
    nomeparc: string
  }
  /** Relacionamento com TGFVEN */
  tgfven?: {
    codvend: number
    nomevend: string
  }
}
