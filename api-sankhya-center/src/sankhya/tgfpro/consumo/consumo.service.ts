import { Injectable, Logger } from '@nestjs/common'
import { trimStrings } from '../../../common/utils/string.utils'
import { SankhyaApiService } from '../../shared/sankhya-api.service'
import { ConsumoCalculatorUtils } from './utils/consumo-calculator.utils'

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

@Injectable()
export class ConsumoService {
  private readonly logger = new Logger(ConsumoService.name)

  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  /**
   * Obtém o valor unitário da última compra antes da data informada.
   * Usado como referência para valorizar o saldo anterior.
   * PUBLIC para ser reutilizado pelo v2
   */
  async fetchUltimaCompra(codprod: number, dataInicio: string) {
    const sql = `
      SELECT TOP 1 i.VLRUNIT AS valor_unitario
      FROM TGFCAB c
      JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
      WHERE i.CODPROD = ${codprod}
        AND c.STATUSNOTA = 'L'
        AND c.TIPMOV = 'C'
        AND i.ATUALESTOQUE > 0
        AND COALESCE(c.DTENTSAI, c.DTNEG) < '${dataInicio}'
      ORDER BY COALESCE(c.DTENTSAI, c.DTNEG) DESC, c.NUNOTA DESC
    `
    const res = await this.sankhyaApiService.executeQuery(sql, [])
    return res.length > 0 ? Number(res[0].valor_unitario || 0) : 0
  }

  /**
   * Obtém apenas a quantidade do saldo anterior.
   * O valor será calculado usando o preço da última compra.
   * PUBLIC para ser reutilizado pelo v2
   */
  async fetchSaldoAnterior(codprod: number, dataInicio: string) {
    const sql = `
      SELECT
        COALESCE(SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN -i.QTDNEG ELSE i.QTDNEG END), 0) AS saldo_qtd
      FROM TGFCAB c
      JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
      WHERE i.CODPROD = ${codprod}
        AND c.STATUSNOTA = 'L'
        AND i.ATUALESTOQUE <> 0
        AND i.RESERVA = 'N'
        AND COALESCE(c.DTENTSAI, c.DTNEG) < '${dataInicio}'
    `
    const res = await this.sankhyaApiService.executeQuery(sql, [])
    return res.length > 0 ? Number(res[0].saldo_qtd || 0) : 0
  }

  /**
   * Obtém a lista plana de movimentações no período filtrada por impacto no estoque.
   */
  private async fetchMovimentacoes(
    codprod: number,
    dataInicio: string,
    dataFim: string,
  ) {
    const sql = `
      SELECT
        COALESCE(c.DTENTSAI, c.DTNEG) AS data_mov,
        c.NUNOTA,
        c.TIPMOV,
        c.CODPARC,
        par.NOMEPARC AS nome_parceiro,
        u.NOMEUSU AS usuario,
        CASE WHEN i.ATUALESTOQUE < 0 THEN -i.QTDNEG ELSE i.QTDNEG END AS qtd_mov,
        CASE WHEN i.ATUALESTOQUE < 0 THEN -i.VLRTOT ELSE i.VLRTOT END AS valor_mov
      FROM TGFCAB c
      JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
      LEFT JOIN TGFPAR par ON par.CODPARC = c.CODPARC
      LEFT JOIN TSIUSU u ON u.CODUSU = c.CODUSUINC
      WHERE i.CODPROD = ${codprod}
        AND c.STATUSNOTA = 'L'
        AND i.ATUALESTOQUE <> 0
        AND i.RESERVA = 'N'
        AND COALESCE(c.DTENTSAI, c.DTNEG) BETWEEN '${dataInicio}' AND '${dataFim} 23:59:59'
      ORDER BY data_mov ASC, c.NUNOTA ASC
    `
    const rows = await this.sankhyaApiService.executeQuery(sql, [])
    return rows.map((r: any) => trimStrings(r))
  }

  /**
   * Obtém o estoque físico atual da TGFEST.
   */
  private async fetchEstoqueFisico(codprod: number) {
    const sql = `SELECT COALESCE(SUM(ESTOQUE), 0) AS estoque FROM TGFEST WHERE CODPROD = ${codprod} AND ATIVO = 'S'`
    const res = await this.sankhyaApiService.executeQuery(sql, [])
    return res.length > 0 ? Number(res[0].estoque || 0) : 0
  }

  /**
   * Orquestra a consulta de consumo de produtos em um período.
   */
  async consultarConsumoPeriodo(
    codprod: number,
    dataInicio: string,
    dataFim: string,
    page: number = 1,
    perPage: number = 50,
  ) {
    const offset = (page - 1) * perPage

    try {
      // 1. Fetch Valor da Última Compra
      const valorUltimaCompra = await this.fetchUltimaCompra(
        codprod,
        dataInicio,
      )

      // 2. Fetch Saldo Anterior (apenas quantidade)
      const saldoIniQty = await this.fetchSaldoAnterior(codprod, dataInicio)

      // 3. Calcular valor do saldo usando o preço da última compra
      const saldoIniVal = saldoIniQty * valorUltimaCompra

      // 4. Fetch Movimentações
      const movRows = await this.fetchMovimentacoes(
        codprod,
        dataInicio,
        dataFim,
      )

      // 5. Processamento via Utils
      const { processed, finalQty, finalVal } =
        ConsumoCalculatorUtils.processExtrato(saldoIniQty, saldoIniVal, movRows)

      const metrics = ConsumoCalculatorUtils.calculateMetrics(processed)
      const totalMov = processed.length
      const pagedMovs = processed
        .slice()
        .reverse()
        .slice(offset, offset + perPage)

      // 4. Saldo Atual (Físico)
      const estoqueFisico = await this.fetchEstoqueFisico(codprod)

      // 5. Montagem do Resultado Final
      const saldoAnterior = {
        tipo_registro: 'SALDO_ANTERIOR',
        data_referencia: `${dataInicio} 00:00:00`,
        saldo_qtd: saldoIniQty,
        saldo_valor: saldoIniVal,
        saldo_valor_formatted: formatBRL(saldoIniVal),
      }

      const saldoAtual = {
        tipo_registro: 'SALDO_ATUAL',
        data_referencia: `${dataFim} 23:59:59`,
        saldo_qtd_final: estoqueFisico,
        saldo_valor_final: finalVal,
        saldo_valor_final_formatted: formatBRL(finalVal),
      }

      return {
        codprod,
        dataInicio,
        dataFim,
        page,
        perPage,
        totalMovimentacoes: totalMov,
        metrics,
        saldoAnterior,
        movimentacoes: pagedMovs,
        totalMovimentacoesOnPage: pagedMovs.length,
        movimentoLiquido: finalQty - saldoIniQty,
        saldoAtual,
      }
    } catch (error) {
      this.logger.error(
        `Erro em consultarConsumoPeriodo: ${error.message}`,
        error.stack,
      )
      return {
        codprod,
        dataInicio,
        dataFim,
        movimentacoes: [],
        totalMovimentacoes: 0,
        movimentoLiquido: 0,
        error: error.message || 'Erro desconhecido',
      }
    }
  }
}
