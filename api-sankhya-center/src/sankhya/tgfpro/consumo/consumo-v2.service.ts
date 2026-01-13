import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
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
import { ConsumoCalculatorUtils } from './utils/consumo-calculator.utils'
import { ConsumoValidationService } from './utils/consumo-validation.service'
import { ProdutoCacheService } from './utils/produto-cache.service'

/**
 * Serviço V2 - Com todas as melhorias
 * REUTILIZA métodos do ConsumoService (v1) para evitar duplicação
 */
@Injectable()
export class ConsumoV2Service {
  private readonly logger = new Logger(ConsumoV2Service.name)

  constructor(
    private readonly sankhyaApiService: SankhyaApiService,
    private readonly validationService: ConsumoValidationService,
    private readonly produtoCacheService: ProdutoCacheService,
  ) {}

  // ============================================================
  // MÉTODOS COMPARTILHADOS (podem ser usados por v1 e v2)
  // ============================================================

  /**
   * Busca informações completas do produto incluindo TIPCONTEST
   */
  async fetchProdutoInfo(codprod: number) {
    const cachedProduto = await this.produtoCacheService.getProduto(codprod)
    if (cachedProduto) {
      return cachedProduto
    }

    const sql = `
      SELECT 
        CODPROD,
        DESCRPROD,
        COMPLDESC,
        CODVOL AS unidade,
        ATIVO,
        TIPCONTEST
      FROM TGFPRO
      WHERE CODPROD = ${codprod}
    `
    const res = await this.sankhyaApiService.executeQuery(sql, [])

    if (res.length > 0) {
      const normalized = {
        codprod: Number(res[0].CODPROD),
        descrprod: res[0].DESCRPROD,
        complemento: res[0].COMPLDESC || null,
        unidade: res[0].unidade,
        ativo: res[0].ATIVO,
        tipcontest: res[0].TIPCONTEST,
      }
      await this.produtoCacheService.setProduto(codprod, normalized as any)
      return normalized
    }

    return null
  }

  /**
   * Busca localizações de estoque COM CONTROLE (considera TIPCONTEST)
   */
  async fetchLocalizacoesEstoque(codprod: number) {
    const sql = `
      SELECT 
        e.CODLOCAL,
        l.DESCRLOCAL AS descricao,
        e.CONTROLE,
        e.ESTOQUE
      FROM TGFEST e
      LEFT JOIN TGFLOC l ON l.CODLOCAL = e.CODLOCAL
      WHERE e.CODPROD = ${codprod}
        AND e.CODPARC = 0
        AND e.ATIVO = 'S'
        AND e.ESTOQUE > 0
      ORDER BY e.ESTOQUE DESC, e.CONTROLE
    `
    const res = await this.sankhyaApiService.executeQuery(sql, [])
    return res.map((r: any) => ({
      codlocal: r.CODLOCAL,
      descricao: r.descricao || 'N/D',
      controle: r.CONTROLE || null,
      estoque: Number(r.ESTOQUE || 0),
    }))
  }

  /**
   * Busca movimentações com informações adicionais (v2)
   * REUTILIZA estrutura do v1, adicionando apenas campos extras (OBSERVACAO, CONTROLE, pendências)
   */
  async fetchMovimentacoesV2(
    codprod: number,
    dataInicio: string,
    dataFim: string,
  ) {
    const sql = `
      SELECT
        COALESCE(c.DTENTSAI, c.DTNEG) AS data_mov,
        c.DTNEG,
        c.DTENTSAI,
        c.NUNOTA,
        c.TIPMOV,
        c.CODTIPOPER,
        c.CODPARC,
        c.CODCENCUS,
        par.NOMEPARC AS nome_parceiro,
        u.NOMEUSU AS usuario,
        c.OBSERVACAO,
        i.OBSERVACAO AS obs_item,
        i.CONTROLE,
        i.QTDNEG,
        i.QTDENTREGUE,
        i.PENDENTE,
        (i.QTDNEG - i.QTDENTREGUE) AS qtd_pendente,
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
   * Busca informações do TGFTOP para um CODTIPOPER
   * Cache em memória para evitar queries repetidas
   */
  private tgftopCache: Map<number, any> = new Map()

  async fetchTipoOperacao(codtipoper: number) {
    if (this.tgftopCache.has(codtipoper)) {
      return this.tgftopCache.get(codtipoper)
    }

    const sql = `SELECT TOP 1 CODTIPOPER, DESCROPER, ATUALEST FROM TGFTOP WHERE CODTIPOPER = ${codtipoper}`
    const res = await this.sankhyaApiService.executeQuery(sql, [])
    const data =
      res.length > 0
        ? res[0]
        : { CODTIPOPER: codtipoper, DESCROPER: 'N/D', ATUALEST: 'N/D' }

    this.tgftopCache.set(codtipoper, data)
    return data
  }

  /**
   * Calcula dias entre duas datas
   */
  calcularDiasEntreDatas(dataInicio: string, dataFim: string): number {
    const inicio = new Date(dataInicio)
    const fim = new Date(dataFim)
    const diff = fim.getTime() - inicio.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
  }

  /**
   * Valida datas de entrada
   */
  validarDatas(dataInicio: string, dataFim: string, maxDias: number = 365) {
    const inicio = new Date(dataInicio)
    const fim = new Date(dataFim)

    if (fim < inicio) {
      throw new BadRequestException(
        'Data fim deve ser maior ou igual à data início',
      )
    }

    const totalDias = this.calcularDiasEntreDatas(dataInicio, dataFim)
    if (totalDias > maxDias) {
      throw new BadRequestException(`Período máximo permitido: ${maxDias} dias`)
    }

    return totalDias
  }

  /**
   * Transforma movimentações processadas para formato V2 (camelCase)
   * REUTILIZA os dados já processados pelo ConsumoCalculatorUtils
   * Busca informações do TGFTOP separadamente (com cache)
   */
  async transformarMovimentacoesV2(processed: any[], movRows: any[]) {
    // Buscar TGFTOP info para todos os CODTIPOPER únicos (com cache)
    const uniqueCodtipoper = [...new Set(movRows.map((r: any) => r.CODTIPOPER))]
    const tgftopPromises = uniqueCodtipoper.map((cod) =>
      this.fetchTipoOperacao(cod),
    )
    await Promise.all(tgftopPromises)

    return processed.map((mov: any) => {
      const original = movRows.find((r: any) => r.NUNOTA === mov.nunota)
      const tgftop = this.tgftopCache.get(original?.CODTIPOPER) || {}

      return {
        tipoRegistro: 'MOVIMENTACAO',
        dataReferencia: mov.data_referencia,
        dtneg: original?.DTNEG || null,
        dtentsai: original?.DTENTSAI || null,
        nunota: mov.nunota,
        tipmov: mov.tipmov,
        tipoOperacao: {
          codtipoper: original?.CODTIPOPER || 0,
          descricao: tgftop.DESCROPER || 'N/D',
          atualizaEstoque: tgftop.ATUALEST || 'N/D',
        },
        codparc: mov.codparc,
        nomeParceiro: mov.nome_parceiro || 'N/D',
        centroCusto: original?.CODCENCUS
          ? {
              codigo: original.CODCENCUS,
              descricao: 'N/D',
            }
          : undefined,
        usuario: mov.usuario || 'N/D',
        observacao: original?.OBSERVACAO || null,
        observacaoItem: original?.obs_item || null,
        controle: original?.CONTROLE || null,
        quantidadeMov: mov.quantidade_mov,
        quantidadeNegociada: original?.QTDNEG || null,
        quantidadeEntregue: original?.QTDENTREGUE || null,
        quantidadePendente: original?.qtd_pendente || null,
        statusPendente: original?.PENDENTE || null,
        valorMov: mov.valor_mov,
        valorMovFormatted: mov.valor_mov_formatted,
        valorUnitario: mov.valor_unitario,
        saldoQtdAnterior: mov.saldo_qtd_anterior,
        saldoQtdFinal: mov.saldo_qtd_final,
        saldoValorAnterior: mov.saldo_valor_anterior,
        saldoValorFinal: mov.saldo_valor_final,
        saldoValorFinalFormatted: mov.saldo_valor_final_formatted,
        pmm: mov.pmm,
      }
    })
  }

  /**
   * Calcula métricas V2 expandidas
   * REUTILIZA calculateMetrics do ConsumoCalculatorUtils
   */
  calcularMetricasV2(
    processed: any[],
    saldoIniQty: number,
    totalDias: number,
    finalQty: number,
  ) {
    const totalEntradasQtd = processed
      .filter((m: any) => m.quantidade_mov > 0)
      .reduce((acc: number, m: any) => acc + m.quantidade_mov, 0)

    const totalSaidasQtd = Math.abs(
      processed
        .filter((m: any) => m.quantidade_mov < 0)
        .reduce((acc: number, m: any) => acc + m.quantidade_mov, 0),
    )

    const totalEntradasValor = processed
      .filter((m: any) => m.valor_mov > 0)
      .reduce((acc: number, m: any) => acc + m.valor_mov, 0)

    const totalSaidasValor = Math.abs(
      processed
        .filter((m: any) => m.valor_mov < 0)
        .reduce((acc: number, m: any) => acc + m.valor_mov, 0),
    )

    const metricsV1 = ConsumoCalculatorUtils.calculateMetrics(processed)

    return {
      valorMedioPeriodo: metricsV1.valor_medio_periodo,
      valorMedioEntradas: metricsV1.valor_medio_entradas,
      totalConsumoBaixas: metricsV1.total_consumo_baixas,
      totalEntradasQtd,
      totalSaidasQtd,
      totalEntradasValor,
      totalSaidasValor,
      percentualConsumo:
        saldoIniQty > 0 ? (totalSaidasQtd / saldoIniQty) * 100 : 0,
      mediaConsumoDia: totalDias > 0 ? totalSaidasQtd / totalDias : 0,
      diasEstoqueDisponivel:
        totalSaidasQtd > 0 ? finalQty / (totalSaidasQtd / totalDias) : 0,
    }
  }

  /**
   * Consulta de consumo V2 com todas as melhorias
   * REUTILIZA: ConsumoCalculatorUtils.processExtrato e calculateMetrics
   */
  async consultarConsumoPeriodoV2(
    codprod: number,
    dataInicio: string,
    dataFim: string,
    fetchUltimaCompra: (codprod: number, dataInicio: string) => Promise<number>,
    fetchSaldoAnterior: (
      codprod: number,
      dataInicio: string,
    ) => Promise<number>,
    page: number = 1,
    perPage: number = 50,
    validationOptions: any = {},
  ) {
    const offset = (page - 1) * perPage

    try {
      const validationResult =
        await this.validationService.validarConsultaConsumo(
          codprod,
          dataInicio,
          dataFim,
          validationOptions,
        )

      if (!validationResult.isValid) {
        this.logger.error('Validação falhou:', validationResult.errors)
        throw new BadRequestException(
          `Validação falhou: ${validationResult.errors.join(', ')}`,
        )
      }

      if (validationResult.warnings.length > 0) {
        this.logger.warn('Avisos de validação:', validationResult.warnings)
      }
      // 1. Validar produto existe
      const produtoInfo = await this.fetchProdutoInfo(codprod)
      if (!produtoInfo) {
        throw new NotFoundException(`Produto ${codprod} não encontrado`)
      }

      // 2. Validar datas
      const totalDias = this.validarDatas(dataInicio, dataFim)

      // 3. REUTILIZAR método do v1 para buscar última compra
      const valorUltimaCompra = await fetchUltimaCompra(codprod, dataInicio)

      // 4. REUTILIZAR método do v1 para buscar saldo anterior
      const saldoIniQty = await fetchSaldoAnterior(codprod, dataInicio)
      const saldoIniVal = saldoIniQty * valorUltimaCompra

      // 5. Buscar movimentações V2 (com dados extras)
      const movRows = await this.fetchMovimentacoesV2(
        codprod,
        dataInicio,
        dataFim,
      )

      // 6. REUTILIZAR processamento do v1
      const { processed, finalQty, finalVal } =
        ConsumoCalculatorUtils.processExtrato(saldoIniQty, saldoIniVal, movRows)

      // 7. Transformar para formato V2 (reutiliza dados processados)
      const movimentacoesV2 = await this.transformarMovimentacoesV2(
        processed,
        movRows,
      )

      // 8. Calcular métricas V2 (reutiliza calculateMetrics do v1)
      const metricsV2 = this.calcularMetricasV2(
        processed,
        saldoIniQty,
        totalDias,
        finalQty,
      )

      // 9. Buscar localizações de estoque (com CONTROLE)
      const localizacoes = await this.fetchLocalizacoesEstoque(codprod)
      const estoqueFisico = localizacoes.reduce((acc, l) => acc + l.estoque, 0)

      // 10. Paginar movimentações
      const totalMov = movimentacoesV2.length
      const pagedMovs = movimentacoesV2
        .slice()
        .reverse()
        .slice(offset, offset + perPage)

      const respostaV2 = {
        produto: {
          codprod: produtoInfo.codprod,
          descrprod: produtoInfo.descrprod,
          complemento: produtoInfo.complemento || null,
          unidade: produtoInfo.unidade,
          ativo: produtoInfo.ativo,
          tipcontest: produtoInfo.tipcontest,
        },
        periodo: {
          dataInicio,
          dataFim,
          totalDias,
        },
        page,
        perPage,
        totalMovimentacoes: totalMov,
        saldoAnterior: {
          tipoRegistro: 'SALDO_ANTERIOR',
          dataReferencia: `${dataInicio} 00:00:00`,
          saldoQtd: saldoIniQty,
          saldoValor: saldoIniVal,
          saldoValorFormatted: formatBRL(saldoIniVal),
          valorUnitarioReferencia: valorUltimaCompra,
        },
        movimentacoes: pagedMovs,
        totalMovimentacoesOnPage: pagedMovs.length,
        metrics: metricsV2,
        movimentoLiquido: finalQty - saldoIniQty,
        saldoAtual: {
          tipoRegistro: 'SALDO_ATUAL',
          dataReferencia: `${dataFim} 23:59:59`,
          saldoQtdFinal: finalQty,
          estoqueFisico: Number(estoqueFisico),
          saldoValorFinal: finalVal,
          saldoValorFinalFormatted: formatBRL(finalVal),
          localizacoes,
        },
      }

      const validacaoDados = await this.validationService.validarDadosConsumo(
        respostaV2,
        validationOptions,
      )

      if (!validacaoDados.isValid) {
        this.logger.error('Validação de dados falhou:', validacaoDados.errors)
        throw new BadRequestException(
          `Validação de dados falhou: ${validacaoDados.errors.join(', ')}`,
        )
      }

      if (validacaoDados.warnings.length > 0) {
        this.logger.warn(
          'Avisos de validação dos dados:',
          validacaoDados.warnings,
        )
      }

      return respostaV2
    } catch (error) {
      this.logger.error(
        `Erro em consultarConsumoPeriodoV2: ${error.message}`,
        error.stack,
      )
      throw error
    }
  }
}
