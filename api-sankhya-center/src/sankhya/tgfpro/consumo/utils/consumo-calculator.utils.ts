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

export interface MovimentacaoBase {
  data_mov: string
  NUNOTA: number
  TIPMOV: string
  CODPARC: number
  nome_parceiro: string
  usuario: string
  qtd_mov: number
  valor_mov: number
}

export class ConsumoCalculatorUtils {
  /**
   * Processa a lista de movimentações calculando saldos acumulados e PMM.
   */
  static processExtrato(saldoIniQty: number, saldoIniVal: number, movs: any[]) {
    let runningQty = saldoIniQty
    let runningVal = saldoIniVal

    const processed = movs.map((r: any) => {
      const q = Number(r.qtd_mov || 0)
      const v = Number(r.valor_mov || 0)

      const beforeQty = runningQty
      const beforeVal = runningVal
      const afterQty = Number((runningQty + q).toFixed(4))
      const afterVal = Number((runningVal + v).toFixed(4))

      runningQty = afterQty
      runningVal = afterVal

      return {
        tipo_registro: 'MOVIMENTACAO',
        data_referencia: r.data_mov,
        nunota: r.NUNOTA,
        tipmov: r.TIPMOV,
        codparc: r.CODPARC,
        nome_parceiro: r.nome_parceiro,
        usuario: r.usuario,
        quantidade_mov: q,
        valor_mov: v,
        valor_mov_formatted: formatBRL(v),
        valor_unitario: q !== 0 ? Number((v / q).toFixed(4)) : 0,
        saldo_qtd_anterior: beforeQty,
        saldo_qtd_final: afterQty,
        saldo_valor_anterior: beforeVal,
        saldo_valor_final: afterVal,
        saldo_valor_final_formatted: formatBRL(afterVal),
        pmm: afterQty !== 0 ? Number((afterVal / afterQty).toFixed(4)) : 0,
      }
    })

    return {
      processed,
      finalQty: runningQty,
      finalVal: runningVal,
    }
  }

  /**
   * Calcula métricas do período (Valor Médio, Entradas, Baixas).
   */
  static calculateMetrics(movimentacoes: any[]) {
    let sumVal = 0
    let sumQty = 0
    let sumEntriesVal = 0
    let sumEntriesQty = 0
    let sumBaixasQty = 0

    for (const m of movimentacoes) {
      const v = Number(m.valor_mov || 0)
      const q = Math.abs(Number(m.quantidade_mov || 0))
      sumVal += v
      sumQty += q

      if (m.tipmov === 'E') {
        sumEntriesVal += v
        sumEntriesQty += q
      } else if (m.tipmov === 'B' || m.quantidade_mov < 0) {
        sumBaixasQty += q
      }
    }

    return {
      valor_medio_periodo:
        sumQty !== 0 ? Number((sumVal / sumQty).toFixed(4)) : 0,
      valor_medio_entradas:
        sumEntriesQty !== 0
          ? Number((sumEntriesVal / sumEntriesQty).toFixed(4))
          : 0,
      total_consumo_baixas: Number(sumBaixasQty.toFixed(4)),
    }
  }
}
