export class Produto360V3ResponseDto {
  produto: {
    codprod: number
    descrprod: string
    complemento: string | null
    unidade: string
    ativo: string
    tipcontest: string
  }
  estoque_atual: {
    fisico: number
    reservado: number
    disponivel: number
    valor_total: number
    valor_total_formatted: string
  }
  pedidos_pendentes: {
    compras: Array<{
      nunota: number
      dtneg: string
      qtd_negociada: number
      qtd_entregue: number
      qtd_pendente: number
      nome_parceiro: string
    }>
    vendas: Array<{
      nunota: number
      dtneg: string
      qtd_negociada: number
      qtd_entregue: number
      qtd_pendente: number
      nome_parceiro: string
    }>
    transferencias: Array<{
      nunota: number
      dtneg: string
      qtd_negociada: number
      qtd_entregue: number
      qtd_pendente: number
      nome_parceiro: string
    }>
  }
  historico_mensal: Array<{
    mes_ano: string
    saldo_qtd: number
    saldo_valor: number
    saldo_valor_formatted: string
    consumo_qtd: number
    consumo_valor: number
    entradas_qtd: number
    entradas_valor: number
  }>
  ultima_compra: {
    nunota: number
    dtneg: string
    data_entrada: string
    valor_unitario: number
    valor_unitario_formatted: string
    quantidade: number
    nome_fornecedor: string
    codparc: number
  } | null
  maiores_consumidores: Array<{
    codparc: number
    nome_parceiro: string
    total_qtd: number
    total_valor: number
    total_valor_formatted: string
  }>
  metricas: {
    media_consumo_mensal: number
    media_consumo_mensal_formatted: string
    cobertura_estoque_meses: number
  }
}
