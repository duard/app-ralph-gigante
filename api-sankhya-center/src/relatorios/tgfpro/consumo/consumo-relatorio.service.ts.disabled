import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { SankhyaApiService } from '../../../sankhya/shared/sankhya-api.service'
import { PdfGeneratorUtils } from './utils/pdf-generator.utils'
import {
  ProdutoInfo,
  ResumoConsumo,
  ConsumoDiario,
  ConsumoMensal,
  ConsumoPorDepartamento,
  MovimentacaoDetalhada,
  DadosRelatorio,
} from './interfaces/consumo-relatorio.interface'
import { TipoRelatorio } from './dto/consumo-relatorio-query.dto'

@Injectable()
export class ConsumoRelatorioService {
  private readonly logger = new Logger(ConsumoRelatorioService.name)

  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  /**
   * Método principal - Gera o relatório PDF completo
   */
  async gerarRelatorioPdf(
    codprod: number,
    dataInicio: string,
    dataFim: string,
    usuario: string,
    tipo: TipoRelatorio = 'completo',
  ): Promise<Buffer> {
    this.logger.log(
      `Gerando relatório PDF para produto ${codprod} - Período: ${dataInicio} a ${dataFim} - Tipo: ${tipo}`,
    )

    // Validar datas
    this.validarDatas(dataInicio, dataFim)

    // Buscar todos os dados necessários em paralelo
    const [
      produto,
      resumo,
      consumoDiario,
      consumoMensal,
      consumoPorCentroCusto,
      consumoPorGrupoUsuario,
      movimentacoes,
    ] = await Promise.all([
      this.fetchDadosProduto(codprod),
      this.fetchResumoConsumo(codprod, dataInicio, dataFim),
      this.fetchConsumoDiario(codprod, dataInicio, dataFim),
      this.fetchConsumoMensal(codprod, dataFim),
      this.fetchConsumoPorCentroCusto(codprod, dataInicio, dataFim),
      this.fetchConsumoPorGrupoUsuario(codprod, dataInicio, dataFim),
      this.fetchMovimentacoesDetalhadas(codprod, dataInicio, dataFim),
    ])

    if (!produto) {
      throw new NotFoundException(`Produto ${codprod} não encontrado`)
    }

    const totalDias = this.calcularDiasEntreDatas(dataInicio, dataFim)

    const dadosRelatorio: DadosRelatorio = {
      produto,
      periodo: {
        dataInicio,
        dataFim,
        totalDias,
      },
      resumo,
      consumoDiario,
      consumoMensal,
      consumoPorCentroCusto,
      consumoPorGrupoUsuario,
      movimentacoes,
      geradoEm: new Date().toISOString(),
      geradoPor: usuario,
    }

    // Gerar PDF
    const pdfGenerator = new PdfGeneratorUtils()
    return pdfGenerator.gerarPdf(dadosRelatorio, tipo)
  }

  /**
   * Valida as datas de entrada
   */
  private validarDatas(dataInicio: string, dataFim: string): void {
    const inicio = new Date(dataInicio)
    const fim = new Date(dataFim)

    if (isNaN(inicio.getTime())) {
      throw new BadRequestException('Data inicial inválida')
    }
    if (isNaN(fim.getTime())) {
      throw new BadRequestException('Data final inválida')
    }
    if (fim < inicio) {
      throw new BadRequestException(
        'Data fim deve ser maior ou igual à data início',
      )
    }

    const dias = this.calcularDiasEntreDatas(dataInicio, dataFim)
    if (dias > 365) {
      throw new BadRequestException('Período máximo permitido: 365 dias')
    }
  }

  /**
   * Calcula dias entre duas datas
   */
  private calcularDiasEntreDatas(dataInicio: string, dataFim: string): number {
    const inicio = new Date(dataInicio)
    const fim = new Date(dataFim)
    const diff = fim.getTime() - inicio.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
  }

  /**
   * TASK-010: Busca dados do produto
   */
  async fetchDadosProduto(codprod: number): Promise<ProdutoInfo | null> {
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

    if (res.length === 0) {
      return null
    }

    return {
      codprod: Number(res[0].CODPROD),
      descrprod: String(res[0].DESCRPROD || '').trim(),
      complemento: res[0].COMPLDESC ? String(res[0].COMPLDESC).trim() : null,
      unidade: String(res[0].unidade || 'UN').trim(),
      ativo: String(res[0].ATIVO || 'S').trim(),
      tipcontest: res[0].TIPCONTEST ? String(res[0].TIPCONTEST).trim() : null,
    }
  }

  /**
   * TASK-011: Busca resumo de consumo (saldos e totais)
   */
  async fetchResumoConsumo(
    codprod: number,
    dataInicio: string,
    dataFim: string,
  ): Promise<ResumoConsumo> {
    // Buscar valor da última compra antes do período
    const sqlUltimaCompra = `
      SELECT TOP 1
        CASE WHEN i.QTDNEG > 0 THEN i.VLRTOT / i.QTDNEG ELSE 0 END AS valor_unitario
      FROM TGFCAB c
      JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
      WHERE i.CODPROD = ${codprod}
        AND c.STATUSNOTA = 'L'
        AND i.ATUALESTOQUE > 0
        AND COALESCE(c.DTENTSAI, c.DTNEG) < '${dataInicio}'
      ORDER BY COALESCE(c.DTENTSAI, c.DTNEG) DESC
    `
    const resUltimaCompra = await this.sankhyaApiService.executeQuery(
      sqlUltimaCompra,
      [],
    )
    const valorUnitarioRef = Number(resUltimaCompra[0]?.valor_unitario || 0)

    // Buscar saldo anterior ao período
    const sqlSaldoAnterior = `
      SELECT
        SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN -i.QTDNEG ELSE i.QTDNEG END) AS saldo_qtd
      FROM TGFCAB c
      JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
      WHERE i.CODPROD = ${codprod}
        AND c.STATUSNOTA = 'L'
        AND i.ATUALESTOQUE <> 0
        AND i.RESERVA = 'N'
        AND COALESCE(c.DTENTSAI, c.DTNEG) < '${dataInicio}'
    `
    const resSaldoAnterior = await this.sankhyaApiService.executeQuery(
      sqlSaldoAnterior,
      [],
    )
    const saldoInicialQtd = Number(resSaldoAnterior[0]?.saldo_qtd || 0)
    const saldoInicialValor = saldoInicialQtd * valorUnitarioRef

    // Buscar totais do período
    const sqlTotais = `
      SELECT
        SUM(CASE WHEN i.ATUALESTOQUE > 0 THEN i.QTDNEG ELSE 0 END) AS total_compras_qtd,
        SUM(CASE WHEN i.ATUALESTOQUE > 0 THEN i.VLRTOT ELSE 0 END) AS total_compras_valor,
        SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN ABS(i.QTDNEG) ELSE 0 END) AS total_consumo_qtd,
        SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN ABS(i.VLRTOT) ELSE 0 END) AS total_consumo_valor
      FROM TGFCAB c
      JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
      WHERE i.CODPROD = ${codprod}
        AND c.STATUSNOTA = 'L'
        AND i.ATUALESTOQUE <> 0
        AND i.RESERVA = 'N'
        AND COALESCE(c.DTENTSAI, c.DTNEG) BETWEEN '${dataInicio}' AND '${dataFim} 23:59:59'
    `
    const resTotais = await this.sankhyaApiService.executeQuery(sqlTotais, [])

    const totalComprasQtd = Number(resTotais[0]?.total_compras_qtd || 0)
    const totalComprasValor = Number(resTotais[0]?.total_compras_valor || 0)
    const totalConsumoQtd = Number(resTotais[0]?.total_consumo_qtd || 0)
    // Recalcular valor de consumo usando custo médio de compra do período
    const custoMedioPeriodo = totalComprasQtd > 0
      ? totalComprasValor / totalComprasQtd
      : valorUnitarioRef
    const totalConsumoValor = totalConsumoQtd * custoMedioPeriodo

    const saldoFinalQtd = saldoInicialQtd + totalComprasQtd - totalConsumoQtd
    // Saldo Final Valor = Qtd × Custo Médio de Compra do período
    const saldoFinalValor = saldoFinalQtd * custoMedioPeriodo

    // Buscar saldo ATUAL (tempo real) e custo médio de compra
    const sqlSaldoAtual = `
      SELECT
        SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN -i.QTDNEG ELSE i.QTDNEG END) AS saldo_qtd,
        SUM(CASE WHEN i.ATUALESTOQUE > 0 THEN i.QTDNEG ELSE 0 END) AS total_compras_qtd,
        SUM(CASE WHEN i.ATUALESTOQUE > 0 THEN i.VLRTOT ELSE 0 END) AS total_compras_valor
      FROM TGFCAB c
      JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
      WHERE i.CODPROD = ${codprod}
        AND c.STATUSNOTA = 'L'
        AND i.ATUALESTOQUE <> 0
        AND i.RESERVA = 'N'
    `
    const resSaldoAtual = await this.sankhyaApiService.executeQuery(sqlSaldoAtual, [])
    const saldoAtualQtd = Number(resSaldoAtual[0]?.saldo_qtd || 0)
    // Calcular custo médio de compra (todas as compras)
    const totalComprasQtdGeral = Number(resSaldoAtual[0]?.total_compras_qtd || 0)
    const totalComprasValorGeral = Number(resSaldoAtual[0]?.total_compras_valor || 0)
    const custoMedioCompra = totalComprasQtdGeral > 0
      ? totalComprasValorGeral / totalComprasQtdGeral
      : valorUnitarioRef
    // Saldo Atual Valor = Qtd em estoque × Custo médio de compra
    const saldoAtualValor = saldoAtualQtd * custoMedioCompra

    const totalDias = this.calcularDiasEntreDatas(dataInicio, dataFim)
    const mediaConsumoDia = totalDias > 0 ? totalConsumoQtd / totalDias : 0
    const diasEstoqueDisponivel =
      mediaConsumoDia > 0 ? saldoAtualQtd / mediaConsumoDia : 0
    const percentualConsumo =
      saldoInicialQtd > 0 ? (totalConsumoQtd / saldoInicialQtd) * 100 : 0
    // Usar custo médio de compra como valor unitário de referência
    const valorMedioUnitario = custoMedioCompra > 0 ? custoMedioCompra : valorUnitarioRef

    return {
      saldoInicialQtd,
      saldoInicialValor,
      totalComprasQtd,
      totalComprasValor,
      totalConsumoQtd,
      totalConsumoValor,
      saldoFinalQtd,
      saldoFinalValor,
      saldoAtualQtd,
      saldoAtualValor,
      mediaConsumoDia,
      diasEstoqueDisponivel,
      percentualConsumo,
      valorMedioUnitario,
    }
  }

  /**
   * TASK-012: Busca consumo diário para gráfico de linha
   */
  async fetchConsumoDiario(
    codprod: number,
    dataInicio: string,
    dataFim: string,
  ): Promise<ConsumoDiario[]> {
    const sql = `
      SELECT
        CAST(COALESCE(c.DTENTSAI, c.DTNEG) AS DATE) AS data_consumo,
        SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN ABS(i.QTDNEG) ELSE 0 END) AS qtd_consumo,
        SUM(CASE WHEN i.ATUALESTOQUE > 0 THEN i.QTDNEG ELSE 0 END) AS qtd_compra
      FROM TGFCAB c
      JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
      WHERE i.CODPROD = ${codprod}
        AND c.STATUSNOTA = 'L'
        AND i.ATUALESTOQUE <> 0
        AND i.RESERVA = 'N'
        AND COALESCE(c.DTENTSAI, c.DTNEG) BETWEEN '${dataInicio}' AND '${dataFim} 23:59:59'
      GROUP BY CAST(COALESCE(c.DTENTSAI, c.DTNEG) AS DATE)
      ORDER BY data_consumo
    `
    const res = await this.sankhyaApiService.executeQuery(sql, [])

    let saldoAcumulado = 0
    return res.map((row: any) => {
      const qtdConsumo = Number(row.qtd_consumo || 0)
      const qtdCompra = Number(row.qtd_compra || 0)
      saldoAcumulado += qtdCompra - qtdConsumo

      const data = String(row.data_consumo || '').trim()
      return {
        data,
        dataFormatada: this.formatarData(data),
        qtdConsumo,
        qtdCompra,
        saldoDia: saldoAcumulado,
      }
    })
  }

  /**
   * TASK-013: Busca consumo mensal (últimos 6 meses)
   */
  async fetchConsumoMensal(
    codprod: number,
    dataFim: string,
  ): Promise<ConsumoMensal[]> {
    const sql = `
      SELECT
        YEAR(COALESCE(c.DTENTSAI, c.DTNEG)) AS ano,
        MONTH(COALESCE(c.DTENTSAI, c.DTNEG)) AS mes,
        SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN ABS(i.QTDNEG) ELSE 0 END) AS qtd_consumo,
        SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN ABS(i.VLRTOT) ELSE 0 END) AS valor_consumo
      FROM TGFCAB c
      JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
      WHERE i.CODPROD = ${codprod}
        AND c.STATUSNOTA = 'L'
        AND i.ATUALESTOQUE < 0
        AND i.RESERVA = 'N'
        AND COALESCE(c.DTENTSAI, c.DTNEG) >= DATEADD(MONTH, -6, '${dataFim}')
        AND COALESCE(c.DTENTSAI, c.DTNEG) <= '${dataFim} 23:59:59'
      GROUP BY YEAR(COALESCE(c.DTENTSAI, c.DTNEG)), MONTH(COALESCE(c.DTENTSAI, c.DTNEG))
      ORDER BY ano, mes
    `
    const res = await this.sankhyaApiService.executeQuery(sql, [])

    const mesesNome = [
      '',
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ]

    return res.map((row: any) => ({
      ano: Number(row.ano),
      mes: Number(row.mes),
      mesNome: mesesNome[Number(row.mes)] || '',
      qtdConsumo: Number(row.qtd_consumo || 0),
      valorConsumo: Number(row.valor_consumo || 0),
    }))
  }

  /**
   * TASK-014: Busca consumo por Centro de Custo
   */
  async fetchConsumoPorCentroCusto(
    codprod: number,
    dataInicio: string,
    dataFim: string,
  ): Promise<ConsumoPorDepartamento[]> {
    const sql = `
      SELECT
        c.CODCENCUS AS CODGRUPO,
        COALESCE(cc.DESCRCENCUS, 'SEM CENTRO CUSTO') AS departamento,
        SUM(ABS(i.QTDNEG)) AS qtd_consumo,
        SUM(ABS(i.VLRTOT)) AS valor_consumo,
        COUNT(DISTINCT c.NUNOTA) AS qtd_requisicoes
      FROM TGFCAB c
      JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
      LEFT JOIN TSICUS cc ON cc.CODCENCUS = c.CODCENCUS
      WHERE i.CODPROD = ${codprod}
        AND c.STATUSNOTA = 'L'
        AND i.ATUALESTOQUE < 0
        AND i.RESERVA = 'N'
        AND COALESCE(c.DTENTSAI, c.DTNEG) BETWEEN '${dataInicio}' AND '${dataFim} 23:59:59'
      GROUP BY c.CODCENCUS, cc.DESCRCENCUS
      ORDER BY qtd_consumo DESC
    `
    const res = await this.sankhyaApiService.executeQuery(sql, [])

    const totalConsumo = res.reduce(
      (acc: number, row: any) => acc + Number(row.qtd_consumo || 0),
      0,
    )

    return res.map((row: any) => {
      const qtdConsumo = Number(row.qtd_consumo || 0)
      return {
        codgrupo: row.CODGRUPO ? Number(row.CODGRUPO) : null,
        departamento: String(row.departamento || 'SEM CENTRO CUSTO').trim(),
        qtdConsumo,
        valorConsumo: Number(row.valor_consumo || 0),
        qtdRequisicoes: Number(row.qtd_requisicoes || 0),
        percentual: totalConsumo > 0 ? (qtdConsumo / totalConsumo) * 100 : 0,
      }
    })
  }

  /**
   * Busca consumo por Grupo de Usuário (quem incluiu a nota)
   */
  async fetchConsumoPorGrupoUsuario(
    codprod: number,
    dataInicio: string,
    dataFim: string,
  ): Promise<ConsumoPorDepartamento[]> {
    const sql = `
      SELECT
        g.CODGRUPO,
        COALESCE(g.NOMEGRUPO, 'SEM GRUPO') AS departamento,
        SUM(ABS(i.QTDNEG)) AS qtd_consumo,
        SUM(ABS(i.VLRTOT)) AS valor_consumo,
        COUNT(DISTINCT c.NUNOTA) AS qtd_requisicoes
      FROM TGFCAB c
      JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
      LEFT JOIN TSIUSU u ON u.CODUSU = c.CODUSUINC
      LEFT JOIN TSIGRU g ON g.CODGRUPO = u.CODGRUPO
      WHERE i.CODPROD = ${codprod}
        AND c.STATUSNOTA = 'L'
        AND i.ATUALESTOQUE < 0
        AND i.RESERVA = 'N'
        AND COALESCE(c.DTENTSAI, c.DTNEG) BETWEEN '${dataInicio}' AND '${dataFim} 23:59:59'
      GROUP BY g.CODGRUPO, g.NOMEGRUPO
      ORDER BY qtd_consumo DESC
    `
    const res = await this.sankhyaApiService.executeQuery(sql, [])

    // Calcular total para percentuais
    const totalConsumo = res.reduce(
      (acc: number, row: any) => acc + Number(row.qtd_consumo || 0),
      0,
    )

    return res.map((row: any) => {
      const qtdConsumo = Number(row.qtd_consumo || 0)
      return {
        codgrupo: row.CODGRUPO ? Number(row.CODGRUPO) : null,
        departamento: String(row.departamento || 'SEM DEPARTAMENTO').trim(),
        qtdConsumo,
        valorConsumo: Number(row.valor_consumo || 0),
        qtdRequisicoes: Number(row.qtd_requisicoes || 0),
        percentual: totalConsumo > 0 ? (qtdConsumo / totalConsumo) * 100 : 0,
      }
    })
  }

  /**
   * TASK-015: Busca movimentações detalhadas
   */
  async fetchMovimentacoesDetalhadas(
    codprod: number,
    dataInicio: string,
    dataFim: string,
  ): Promise<MovimentacaoDetalhada[]> {
    // Query principal com parceiro e grupo de usuário
    const sql = `
      SELECT
        COALESCE(c.DTENTSAI, c.DTNEG) AS data_mov,
        c.NUNOTA,
        c.TIPMOV,
        c.CODTIPOPER,
        CASE WHEN i.ATUALESTOQUE < 0 THEN -i.QTDNEG ELSE i.QTDNEG END AS qtd_mov,
        CASE WHEN i.ATUALESTOQUE < 0 THEN -i.VLRTOT ELSE i.VLRTOT END AS valor_mov,
        u.NOMEUSU AS usuario,
        COALESCE(g.NOMEGRUPO, 'S/ Grupo') AS grupo_usuario,
        COALESCE(cc.DESCRCENCUS, 'S/ Centro Custo') AS setor,
        c.CODPARC,
        COALESCE(p.NOMEPARC, 'S/ Parceiro') AS parceiro,
        c.OBSERVACAO
      FROM TGFCAB c
      JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
      LEFT JOIN TSIUSU u ON u.CODUSU = c.CODUSUINC
      LEFT JOIN TSIGRU g ON g.CODGRUPO = u.CODGRUPO
      LEFT JOIN TSICUS cc ON cc.CODCENCUS = c.CODCENCUS
      LEFT JOIN TGFPAR p ON p.CODPARC = c.CODPARC
      WHERE i.CODPROD = ${codprod}
        AND c.STATUSNOTA = 'L'
        AND i.ATUALESTOQUE <> 0
        AND i.RESERVA = 'N'
        AND COALESCE(c.DTENTSAI, c.DTNEG) BETWEEN '${dataInicio}' AND '${dataFim} 23:59:59'
      ORDER BY data_mov ASC, c.NUNOTA ASC
    `
    const res = await this.sankhyaApiService.executeQuery(sql, [])

    // Buscar tipos de operação únicos para evitar duplicação por versionamento
    const codtipopers = [...new Set(res.map((r: any) => Number(r.CODTIPOPER || 0)))]
    const tiposOperacaoMap = await this.fetchTiposOperacao(codtipopers)

    return res.map((row: any) => {
      const qtdMov = Number(row.qtd_mov || 0)
      const tipmov = String(row.TIPMOV || '').trim()
      const codtipoper = Number(row.CODTIPOPER || 0)

      let tipo: 'COMPRA' | 'CONSUMO' | 'TRANSF' | 'OUTROS'
      if (qtdMov > 0) {
        tipo = 'COMPRA'
      } else if (tipmov === 'T') {
        tipo = 'TRANSF'
      } else if (qtdMov < 0) {
        tipo = 'CONSUMO'
      } else {
        tipo = 'OUTROS'
      }

      const data = String(row.data_mov || '').trim()
      return {
        data,
        dataFormatada: this.formatarData(data),
        nunota: Number(row.NUNOTA),
        tipo,
        tipoOperacao: tiposOperacaoMap.get(codtipoper) || 'N/D',
        codtipoper,
        setor: String(row.setor || 'S/ Centro Custo').trim(),
        usuario: String(row.usuario || 'N/D').trim(),
        grupoUsuario: String(row.grupo_usuario || 'S/ Grupo').trim(),
        codparc: row.CODPARC ? Number(row.CODPARC) : null,
        parceiro: String(row.parceiro || 'S/ Parceiro').trim(),
        qtdMov,
        valorMov: Number(row.valor_mov || 0),
        observacao: row.OBSERVACAO ? String(row.OBSERVACAO).trim() : null,
      }
    })
  }

  /**
   * Busca descrições dos tipos de operação (uma por CODTIPOPER)
   */
  private async fetchTiposOperacao(codtipopers: number[]): Promise<Map<number, string>> {
    const map = new Map<number, string>()
    if (codtipopers.length === 0) return map

    // Buscar um por um para evitar problemas com versionamento
    for (const cod of codtipopers) {
      try {
        const sql = `SELECT TOP 1 CODTIPOPER, DESCROPER FROM TGFTOP WHERE CODTIPOPER = ${cod}`
        const res = await this.sankhyaApiService.executeQuery(sql, [])
        if (res.length > 0) {
          map.set(cod, String(res[0].DESCROPER || 'N/D').trim())
        }
      } catch {
        map.set(cod, 'N/D')
      }
    }

    return map
  }

  /**
   * Formata data para dd/MM/yyyy
   */
  private formatarData(data: string): string {
    try {
      const d = new Date(data)
      if (isNaN(d.getTime())) return data
      return d.toLocaleDateString('pt-BR')
    } catch {
      return data
    }
  }
}
