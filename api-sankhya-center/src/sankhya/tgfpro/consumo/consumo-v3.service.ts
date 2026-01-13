import { Injectable, Logger } from '@nestjs/common'
import { trimStrings } from '../../../common/utils/string.utils'

function formatBRL(value: number): string {
  try {
    const nf = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return nf.format(Number(value || 0))
  } catch (e) {
    return `R$ ${Number(value || 0).toFixed(2)}`
  }
}
import { SankhyaApiService } from '../../shared/sankhya-api.service'
import { ConsumoV2Service } from './consumo-v2.service'
import { ConsumoService } from './consumo.service'

@Injectable()
export class ConsumoV3Service {
  private readonly logger = new Logger(ConsumoV3Service.name)

  constructor(
    private readonly sankhyaApiService: SankhyaApiService,
    private readonly consumoService: ConsumoService,
    private readonly consumoV2Service: ConsumoV2Service,
  ) {}

  /**
   * Busca pedidos pendentes segregados por tipo
   */
  async fetchPedidosPendentes(codprod: number, tipmov: string) {
    const sql = `
      SELECT 
        c.NUNOTA,
        c.DTNEG,
        i.QTDNEG as qtd_negociada,
        i.QTDENTREGUE as qtd_entregue,
        (i.QTDNEG - i.QTDENTREGUE) as qtd_pendente,
        par.NOMEPARC as nome_parceiro
      FROM TGFCAB c
      JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
      LEFT JOIN TGFPAR par ON par.CODPARC = c.CODPARC
      WHERE i.CODPROD = ${codprod}
        AND c.TIPMOV = '${tipmov}'
        AND i.PENDENTE = 'S'
        AND c.STATUSNOTA = 'L'
      ORDER BY c.DTNEG DESC
    `
    const rows = await this.sankhyaApiService.executeQuery(sql, [])
    return rows.map((r) => trimStrings(r))
  }

  /**
   * Busca dados agregados de entradas e saídas em um período
   */
  private async fetchDadosMensais(codprod: number, start: string, end: string) {
    const sql = `
            SELECT 
                SUM(CASE WHEN i.ATUALESTOQUE > 0 THEN i.QTDNEG ELSE 0 END) as entradas_qtd,
                SUM(CASE WHEN i.ATUALESTOQUE > 0 THEN i.VLRTOT ELSE 0 END) as entradas_valor,
                SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN i.QTDNEG ELSE 0 END) as consumo_qtd,
                SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN i.VLRTOT ELSE 0 END) as consumo_valor
            FROM TGFCAB c
            JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
            WHERE i.CODPROD = ${codprod}
              AND c.STATUSNOTA = 'L'
              AND i.ATUALESTOQUE <> 0
              AND i.RESERVA = 'N'
              AND COALESCE(c.DTENTSAI, c.DTNEG) BETWEEN '${start}' AND '${end} 23:59:59'
        `
    const res = await this.sankhyaApiService.executeQuery(sql, [])
    const row = res[0] || {}
    return {
      entradas_qtd: Number(row.entradas_qtd || 0),
      entradas_valor: Number(row.entradas_valor || 0),
      consumo_qtd: Number(row.consumo_qtd || 0),
      consumo_valor: Number(row.consumo_valor || 0),
    }
  }

  /**
   * Busca detalhes da última compra
   */
  async fetchUltimaCompraDetalhada(codprod: number) {
    const sql = `
            SELECT TOP 1 
                c.NUNOTA,
                c.DTNEG,
                COALESCE(c.DTENTSAI, c.DTNEG) as data_entrada,
                i.VLRUNIT as valor_unitario,
                i.QTDNEG as quantidade,
                par.NOMEPARC as nome_fornecedor,
                c.CODPARC as codparc
            FROM TGFCAB c
            JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
            LEFT JOIN TGFPAR par ON par.CODPARC = c.CODPARC
            WHERE i.CODPROD = ${codprod}
              AND c.STATUSNOTA = 'L'
              AND c.TIPMOV = 'C'
              AND i.ATUALESTOQUE > 0
            ORDER BY COALESCE(c.DTENTSAI, c.DTNEG) DESC, c.NUNOTA DESC
        `
    const res = await this.sankhyaApiService.executeQuery(sql, [])
    if (res.length === 0) return null
    const row = trimStrings(res[0])
    return {
      ...row,
      valor_unitario: Number(row.valor_unitario || 0),
      quantidade: Number(row.quantidade || 0),
      valor_unitario_formatted: formatBRL(row.valor_unitario),
    }
  }

  /**
   * Busca os maiores consumidores do produto
   */
  async fetchMaioresConsumidores(codprod: number, meses: number = 3) {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - meses, 1)
    const startStr = start.toISOString().split('T')[0]

    const sql = `
            SELECT TOP 5
                c.CODPARC,
                par.NOMEPARC as nome_parceiro,
                SUM(i.QTDNEG) as total_qtd,
                SUM(i.VLRTOT) as total_valor
            FROM TGFCAB c
            JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
            LEFT JOIN TGFPAR par ON par.CODPARC = c.CODPARC
            WHERE i.CODPROD = ${codprod}
              AND c.STATUSNOTA = 'L'
              AND i.ATUALESTOQUE < 0
              AND COALESCE(c.DTENTSAI, c.DTNEG) >= '${startStr}'
            GROUP BY c.CODPARC, par.NOMEPARC
            ORDER BY total_qtd DESC
        `
    const res = await this.sankhyaApiService.executeQuery(sql, [])
    return res.map((r) => ({
      ...trimStrings(r),
      total_valor: Number(r.total_valor || 0),
      total_qtd: Number(r.total_qtd || 0),
      total_valor_formatted: formatBRL(r.total_valor),
    }))
  }

  /**
   * Calcula saldo histórico em snapshots mensais
   */
  async fetchHistoricoMensal(codprod: number, meses: number = 6) {
    const historico = []
    const now = new Date()

    for (let i = 0; i < meses; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const startStr = date.toISOString().split('T')[0]
      const endStr = lastDay.toISOString().split('T')[0]

      const saldoQty = await this.consumoService.fetchSaldoAnterior(
        codprod,
        startStr,
      )
      const valorReferencia = await this.consumoService.fetchUltimaCompra(
        codprod,
        startStr,
      )
      const valorTotal = saldoQty * valorReferencia

      const dadosMensais = await this.fetchDadosMensais(
        codprod,
        startStr,
        endStr,
      )

      historico.push({
        mes_ano: `${date.getMonth() + 1}/${date.getFullYear()}`,
        saldo_qtd: saldoQty,
        saldo_valor: valorTotal,
        saldo_valor_formatted: formatBRL(valorTotal),
        ...dadosMensais,
      })
    }

    return historico
  }

  /**
   * Visão 360º do Produto (V3)
   */
  async consultarProduto360V3(codprod: number) {
    try {
      // 1. Informações Básicas
      const produto = await this.consumoV2Service.fetchProdutoInfo(codprod)
      if (!produto) return null

      // 2. Estado Atual do Estoque e Valorização (Sincronizado com V1)
      const nowStr = new Date().toISOString().split('T')[0]
      const firstDayOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      )
        .toISOString()
        .split('T')[0]

      // Reutiliza o V1 para pegar o valor contábil acumulado fiel
      const v1 = await this.consumoService.consultarConsumoPeriodo(
        codprod,
        firstDayOfMonth,
        nowStr,
      )

      const sqlEstoque = `
        SELECT 
          COALESCE(SUM(ESTOQUE), 0) as fisico,
          COALESCE(SUM(RESERVADO), 0) as reservado
        FROM TGFEST 
        WHERE CODPROD = ${codprod} AND ATIVO = 'S'
      `
      const resEstoque = await this.sankhyaApiService.executeQuery(
        sqlEstoque,
        [],
      )
      const estoque = resEstoque[0] || { fisico: 0, reservado: 0 }
      const disponivel = Number(estoque.fisico) - Number(estoque.reservado)

      // VALORIZAÇÃO: Usa o saldo_valor_final do V1 que o usuário validou como correto
      const valorTotal = v1.saldoAtual?.saldo_valor_final || 0

      // 3. Pedidos Pendentes
      const compras = await this.fetchPedidosPendentes(codprod, 'O')
      const vendas = await this.fetchPedidosPendentes(codprod, 'P')
      const transferencias = await this.fetchPedidosPendentes(codprod, 'J')

      // 4. Histórico Mensal (6 meses)
      const historico = await this.fetchHistoricoMensal(codprod, 6)

      // 5. Última Compra
      const ultimaCompra = await this.fetchUltimaCompraDetalhada(codprod)

      // 6. Maiores Consumidores
      const maioresConsumidores = await this.fetchMaioresConsumidores(
        codprod,
        6,
      )

      // 7. Métricas Gerais
      const mediaConsumo =
        historico.reduce((acc, h) => acc + h.consumo_qtd, 0) / historico.length
      const cobertura = mediaConsumo > 0 ? disponivel / mediaConsumo : 999

      return {
        produto: {
          codprod: produto.codprod,
          descrprod: produto.descrprod,
          complemento: produto.complemento,
          unidade: produto.unidade,
          ativo: produto.ativo,
          tipcontest: produto.tipcontest,
        },
        estoque_atual: {
          fisico: Number(estoque.fisico),
          reservado: Number(estoque.reservado),
          disponivel,
          valor_total: valorTotal,
          valor_total_formatted: formatBRL(valorTotal),
        },
        pedidos_pendentes: {
          compras,
          vendas,
          transferencias,
        },
        historico_mensal: historico,
        ultima_compra: ultimaCompra,
        maiores_consumidores: maioresConsumidores,
        metricas: {
          media_consumo_mensal: Number(mediaConsumo.toFixed(2)),
          media_consumo_mensal_formatted: `${mediaConsumo.toFixed(2)} ${produto.unidade}`,
          cobertura_estoque_meses: Number(cobertura.toFixed(1)),
        },
      }
    } catch (error) {
      this.logger.error(
        `Erro em consultarProduto360V3: ${error.message}`,
        error.stack,
      )
      throw error
    }
  }
}
