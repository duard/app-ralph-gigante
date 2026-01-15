import * as PDFDocument from 'pdfkit'
import {
  DadosRelatorio,
  ConsumoDiario,
  ConsumoMensal,
  ConsumoPorDepartamento,
  MovimentacaoDetalhada,
} from '../interfaces/consumo-relatorio.interface'
import { TipoRelatorio } from '../dto/consumo-relatorio-query.dto'
import { getMapaTiposMovimento } from '../../../../sankhya/shared/sankhya-tipmov.util'

export class PdfGeneratorUtils {
  private doc: PDFKit.PDFDocument
  private pageWidth: number
  private pageHeight: number
  private margin: number
  private marginBottom: number
  private contentWidth: number
  private currentY: number
  private pageNumber: number
  private tipoRelatorio: TipoRelatorio = 'completo'

  // Mapeamento dos tipos de movimento Sankhya (usa função utilitária)
  private tiposMovimento: Record<string, string> = getMapaTiposMovimento()

  // Cores do tema - paleta profissional
  private colors = {
    primary: '#1e3a5f',       // Azul escuro profissional
    secondary: '#34495e',     // Cinza azulado
    accent: '#2980b9',        // Azul médio
    success: '#27ae60',       // Verde
    danger: '#c0392b',        // Vermelho
    warning: '#f39c12',       // Amarelo/laranja
    light: '#f8f9fa',         // Cinza claro
    border: '#dee2e6',        // Cinza borda
    text: '#212529',          // Preto suave
    textLight: '#6c757d',     // Cinza texto
    white: '#ffffff',
  }

  constructor() {
    this.margin = 40
    this.marginBottom = 50  // Margem inferior para rodapé
    this.pageNumber = 1
  }

  /**
   * Espaço máximo utilizável na página (Y máximo antes do rodapé)
   */
  private get maxY(): number {
    return this.pageHeight - this.marginBottom
  }

  /**
   * Verifica se há espaço suficiente, se não, cria nova página
   * Retorna true se criou nova página
   */
  private garantirEspaco(espacoNecessario: number): boolean {
    if (this.currentY + espacoNecessario > this.maxY) {
      this.doc.addPage()
      this.pageNumber++
      this.currentY = this.margin
      return true
    }
    return false
  }

  /**
   * Método principal - Gera o PDF completo
   */
  async gerarPdf(dados: DadosRelatorio, tipo: TipoRelatorio = 'completo'): Promise<Buffer> {
    this.tipoRelatorio = tipo

    return new Promise((resolve, reject) => {
      try {
        const chunks: Buffer[] = []

        this.doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: this.margin,
            bottom: this.margin,
            left: this.margin,
            right: this.margin,
          },
          bufferPages: true,
        })

        this.pageWidth = this.doc.page.width
        this.pageHeight = this.doc.page.height
        this.contentWidth = this.pageWidth - 2 * this.margin
        this.currentY = this.margin

        this.doc.on('data', (chunk) => chunks.push(chunk))
        this.doc.on('end', () => resolve(Buffer.concat(chunks)))
        this.doc.on('error', reject)

        // Gerar conteúdo baseado no tipo de relatório
        switch (tipo) {
          case 'resumo':
            this.gerarRelatorioResumo(dados)
            break
          case 'executivo':
            this.gerarRelatorioExecutivo(dados)
            break
          case 'centro-custo':
            this.gerarRelatorioCentroCusto(dados)
            break
          case 'grupo-usuario':
            this.gerarRelatorioGrupoUsuario(dados)
            break
          case 'completo':
          default:
            this.gerarRelatorioCompleto(dados)
            break
        }

        // Adicionar rodapé em todas as páginas
        this.adicionarRodapeTodasPaginas()

        this.doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Relatório RESUMO - Uma única página A4 com todos os dados essenciais
   */
  private gerarRelatorioResumo(dados: DadosRelatorio): void {
    // Layout otimizado para caber em 1 página A4
    // Cabeçalho compacto
    this.doc
      .rect(this.margin, this.currentY, this.contentWidth, 45)
      .fill(this.colors.primary)

    this.doc.font('Helvetica-Bold').fontSize(12).fillColor('#ffffff')
      .text('RELATÓRIO DE CONSUMO', this.margin + 10, this.currentY + 8)

    this.doc.font('Helvetica').fontSize(9)
      .text(`${dados.produto.codprod} - ${dados.produto.descrprod}`, this.margin + 10, this.currentY + 22)

    this.doc.fontSize(8)
      .text(`Período: ${this.formatarData(dados.periodo.dataInicio)} a ${this.formatarData(dados.periodo.dataFim)} | ${dados.periodo.totalDias} dias | Gerado: ${this.formatarDataHora(dados.geradoEm)}`, this.margin + 10, this.currentY + 34)

    this.currentY += 52

    // Resumo em 5 colunas
    const resumo = dados.resumo
    const colWidth = this.contentWidth / 5

    this.doc.rect(this.margin, this.currentY, this.contentWidth, 50).fill(this.colors.light).stroke(this.colors.border)

    const colunas = [
      { label: 'Saldo Inicial', qtd: resumo.saldoInicialQtd, valor: resumo.saldoInicialValor, color: this.colors.text },
      { label: 'Compras', qtd: resumo.totalComprasQtd, valor: resumo.totalComprasValor, color: this.colors.success, prefix: '+' },
      { label: 'Consumo', qtd: resumo.totalConsumoQtd, valor: resumo.totalConsumoValor, color: this.colors.danger, prefix: '-' },
      { label: 'Saldo Período', qtd: resumo.saldoFinalQtd, valor: resumo.saldoFinalValor, color: this.colors.text },
      { label: 'SALDO ATUAL', qtd: resumo.saldoAtualQtd, valor: resumo.saldoAtualValor, color: this.colors.primary },
    ]

    colunas.forEach((col, i) => {
      const x = this.margin + colWidth * i + 5
      this.doc.font('Helvetica').fontSize(6).fillColor(this.colors.textLight).text(col.label, x, this.currentY + 4)
      const qtdText = col.prefix ? `${col.prefix}${this.formatarNumero(col.qtd)}` : this.formatarNumero(col.qtd)
      this.doc.font('Helvetica-Bold').fontSize(11).fillColor(col.color).text(qtdText, x, this.currentY + 14)
      this.doc.font('Helvetica').fontSize(6).fillColor(this.colors.textLight).text(dados.produto.unidade, x, this.currentY + 27)
      this.doc.font('Helvetica-Bold').fontSize(8).fillColor(col.color).text(this.formatarMoeda(col.valor), x, this.currentY + 37)
    })

    this.currentY += 56

    // Gráfico de barras compacto (se houver dados)
    if (dados.consumoMensal.length > 0) {
      this.doc.font('Helvetica-Bold').fontSize(8).fillColor(this.colors.primary).text('CONSUMO MENSAL', this.margin, this.currentY)
      this.currentY += 10

      const chartX = this.margin + 25
      const chartWidth = this.contentWidth - 30
      const chartHeight = 50
      const maxConsumo = Math.max(...dados.consumoMensal.map(m => m.qtdConsumo), 1)

      this.doc.moveTo(chartX, this.currentY + chartHeight).lineTo(chartX + chartWidth, this.currentY + chartHeight).stroke(this.colors.border)

      const barSpacing = chartWidth / dados.consumoMensal.length
      const barWidth = barSpacing * 0.7

      dados.consumoMensal.forEach((mes, i) => {
        const barHeight = (mes.qtdConsumo / maxConsumo) * chartHeight
        const x = chartX + i * barSpacing + (barSpacing - barWidth) / 2
        const y = this.currentY + chartHeight - barHeight

        this.doc.rect(x, y, barWidth, barHeight).fill(this.colors.accent)
        if (mes.qtdConsumo > 0) {
          this.doc.fontSize(5).fillColor(this.colors.text).text(this.formatarNumero(mes.qtdConsumo), x, y - 7, { width: barWidth, align: 'center' })
        }
        this.doc.fontSize(5).fillColor(this.colors.textLight).text(mes.mesNome, x, this.currentY + chartHeight + 2, { width: barWidth, align: 'center' })
      })

      this.currentY += chartHeight + 18
    }

    // Duas tabelas lado a lado
    const tableWidth = (this.contentWidth - 10) / 2
    const rowH = 13
    const headerH = 14
    const maxRows = 5
    const tableStartY = this.currentY

    // Tabela Centro de Custo
    this.doc.font('Helvetica-Bold').fontSize(7).fillColor(this.colors.primary).text('POR CENTRO DE CUSTO', this.margin, tableStartY - 10)
    this.doc.rect(this.margin, tableStartY, tableWidth, headerH).fill(this.colors.primary)
    this.doc.font('Helvetica-Bold').fontSize(6).fillColor(this.colors.white)
    this.doc.text('SETOR', this.margin + 3, tableStartY + 4)
    this.doc.text('QTD', this.margin + tableWidth * 0.6, tableStartY + 4)
    this.doc.text('%', this.margin + tableWidth * 0.8, tableStartY + 4)

    let rowY = tableStartY + headerH
    dados.consumoPorCentroCusto.slice(0, maxRows).forEach((dep, i) => {
      this.doc.rect(this.margin, rowY, tableWidth, rowH).fill(i % 2 === 0 ? this.colors.white : this.colors.light)
      this.doc.font('Helvetica').fontSize(6).fillColor(this.colors.text)
      this.doc.text(dep.departamento.substring(0, 16), this.margin + 3, rowY + 3)
      this.doc.text(this.formatarNumero(dep.qtdConsumo), this.margin + tableWidth * 0.6, rowY + 3)
      this.doc.text(`${Math.round(dep.percentual)}%`, this.margin + tableWidth * 0.8, rowY + 3)
      rowY += rowH
    })
    this.doc.lineWidth(0.5).rect(this.margin, tableStartY, tableWidth, headerH + dados.consumoPorCentroCusto.slice(0, maxRows).length * rowH).stroke(this.colors.border)

    // Tabela Grupo de Usuário
    const table2X = this.margin + tableWidth + 10
    this.doc.font('Helvetica-Bold').fontSize(7).fillColor(this.colors.primary).text('POR GRUPO DE USUÁRIO', table2X, tableStartY - 10)
    this.doc.rect(table2X, tableStartY, tableWidth, headerH).fill(this.colors.primary)
    this.doc.font('Helvetica-Bold').fontSize(6).fillColor(this.colors.white)
    this.doc.text('GRUPO', table2X + 3, tableStartY + 4)
    this.doc.text('QTD', table2X + tableWidth * 0.6, tableStartY + 4)
    this.doc.text('%', table2X + tableWidth * 0.8, tableStartY + 4)

    rowY = tableStartY + headerH
    dados.consumoPorGrupoUsuario.slice(0, maxRows).forEach((grp, i) => {
      this.doc.rect(table2X, rowY, tableWidth, rowH).fill(i % 2 === 0 ? this.colors.white : this.colors.light)
      this.doc.font('Helvetica').fontSize(6).fillColor(this.colors.text)
      this.doc.text(grp.departamento.substring(0, 16), table2X + 3, rowY + 3)
      this.doc.text(this.formatarNumero(grp.qtdConsumo), table2X + tableWidth * 0.6, rowY + 3)
      this.doc.text(`${Math.round(grp.percentual)}%`, table2X + tableWidth * 0.8, rowY + 3)
      rowY += rowH
    })
    this.doc.lineWidth(0.5).rect(table2X, tableStartY, tableWidth, headerH + dados.consumoPorGrupoUsuario.slice(0, maxRows).length * rowH).stroke(this.colors.border)

    const maxTableRows = Math.max(dados.consumoPorCentroCusto.slice(0, maxRows).length, dados.consumoPorGrupoUsuario.slice(0, maxRows).length)
    this.currentY = tableStartY + headerH + maxTableRows * rowH + 12

    // Indicadores finais
    this.doc.rect(this.margin, this.currentY, this.contentWidth, 38).fill(this.colors.light).stroke(this.colors.border)

    const indWidth = this.contentWidth / 4
    const inds = [
      { label: 'Média/Dia', valor: `${this.formatarNumero(resumo.mediaConsumoDia)} ${dados.produto.unidade}` },
      { label: 'Dias Estoque', valor: `${Math.round(resumo.diasEstoqueDisponivel)} dias`, color: resumo.diasEstoqueDisponivel < 7 ? this.colors.danger : resumo.diasEstoqueDisponivel < 15 ? this.colors.warning : this.colors.success },
      { label: 'Custo Unit. Médio', valor: this.formatarMoeda(resumo.valorMedioUnitario) },
      { label: '% Consumido', valor: `${this.formatarNumero(resumo.percentualConsumo)}%` },
    ]

    inds.forEach((ind, i) => {
      const x = this.margin + indWidth * i + 8
      this.doc.font('Helvetica').fontSize(6).fillColor(this.colors.textLight).text(ind.label, x, this.currentY + 6)
      this.doc.font('Helvetica-Bold').fontSize(10).fillColor(ind.color || this.colors.primary).text(ind.valor, x, this.currentY + 18)
    })
  }

  /**
   * Relatório COMPLETO - Todas as seções
   */
  private gerarRelatorioCompleto(dados: DadosRelatorio): void {
    this.criarCabecalho(dados)
    this.criarSecaoProduto(dados)
    this.criarResumoConsumo(dados)
    this.criarGraficoLinha(dados.consumoDiario, dados)
    this.criarGraficoBarras(dados.consumoMensal)
    this.criarTabelaDepartamentos(dados.consumoPorCentroCusto, 'CONSUMO POR CENTRO DE CUSTO')
    this.criarTabelaDepartamentos(dados.consumoPorGrupoUsuario, 'CONSUMO POR GRUPO DE USUÁRIO')
    this.criarTabelaMovimentacoes(dados.movimentacoes)
  }

  /**
   * Relatório EXECUTIVO - Resumo claro e conciso
   */
  private gerarRelatorioExecutivo(dados: DadosRelatorio): void {
    this.criarCabecalhoExecutivo(dados)
    this.criarSecaoProduto(dados)
    this.criarResumoExecutivo(dados)
    this.criarGraficoBarras(dados.consumoMensal)
    this.criarIndicadoresExecutivos(dados)
    this.criarTopConsumidores(dados)
  }

  /**
   * Relatório CENTRO DE CUSTO - Foco em centros de custo
   */
  private gerarRelatorioCentroCusto(dados: DadosRelatorio): void {
    this.criarCabecalho(dados)
    this.criarSecaoProduto(dados)
    this.criarResumoConsumo(dados)
    this.criarTabelaDepartamentos(dados.consumoPorCentroCusto, 'CONSUMO POR CENTRO DE CUSTO')
    this.criarMovimentacoesPorCentroCusto(dados)
  }

  /**
   * Relatório GRUPO DE USUÁRIO - Foco em grupos de usuários
   */
  private gerarRelatorioGrupoUsuario(dados: DadosRelatorio): void {
    this.criarCabecalho(dados)
    this.criarSecaoProduto(dados)
    this.criarResumoConsumo(dados)
    this.criarTabelaDepartamentos(dados.consumoPorGrupoUsuario, 'CONSUMO POR GRUPO DE USUÁRIO')
    this.criarMovimentacoesPorGrupoUsuario(dados)
  }

  /**
   * TASK-017: Criar cabeçalho do PDF
   */
  private criarCabecalho(dados: DadosRelatorio): void {
    this.pageNumber++

    // Fundo do cabeçalho
    this.doc
      .rect(this.margin, this.currentY, this.contentWidth, 70)
      .fill(this.colors.primary)

    // Título
    this.doc
      .font('Helvetica-Bold')
      .fontSize(18)
      .fillColor('#ffffff')
      .text('RELATÓRIO DE CONSUMO DE PRODUTO', this.margin + 15, this.currentY + 15, {
        width: this.contentWidth - 30,
      })

    // Subtítulo
    this.doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#ffffff')
      .text(
        `Período: ${this.formatarData(dados.periodo.dataInicio)} a ${this.formatarData(dados.periodo.dataFim)} (${dados.periodo.totalDias} dias)`,
        this.margin + 15,
        this.currentY + 40,
      )

    // Data de geração
    this.doc
      .fontSize(9)
      .text(
        `Gerado em: ${this.formatarDataHora(dados.geradoEm)} | Usuário: ${dados.geradoPor}`,
        this.margin + 15,
        this.currentY + 55,
      )

    this.currentY += 85
  }

  /**
   * TASK-018: Criar seção de dados do produto
   */
  private criarSecaoProduto(dados: DadosRelatorio): void {
    this.criarTituloSecao('DADOS DO PRODUTO')

    const produto = dados.produto
    const boxY = this.currentY
    const boxHeight = 80

    // Box com borda
    this.doc
      .rect(this.margin, boxY, this.contentWidth, boxHeight)
      .fill(this.colors.light)
      .stroke(this.colors.border)

    const col1X = this.margin + 15
    const col2X = this.margin + this.contentWidth / 2

    this.doc.fillColor(this.colors.text).font('Helvetica').fontSize(9)

    // Coluna 1
    this.doc
      .font('Helvetica-Bold')
      .text('Código:', col1X, boxY + 12)
      .font('Helvetica')
      .text(String(produto.codprod), col1X + 50, boxY + 12)

    this.doc
      .font('Helvetica-Bold')
      .text('Descrição:', col1X, boxY + 27)
      .font('Helvetica')
      .text(produto.descrprod, col1X + 60, boxY + 27, {
        width: this.contentWidth / 2 - 80,
      })

    if (produto.complemento) {
      this.doc
        .font('Helvetica-Bold')
        .text('Complemento:', col1X, boxY + 42)
        .font('Helvetica')
        .text(produto.complemento, col1X + 75, boxY + 42, {
          width: this.contentWidth / 2 - 90,
        })
    }

    // Coluna 2
    this.doc
      .font('Helvetica-Bold')
      .text('Unidade:', col2X, boxY + 12)
      .font('Helvetica')
      .text(produto.unidade, col2X + 55, boxY + 12)

    this.doc
      .font('Helvetica-Bold')
      .text('Status:', col2X, boxY + 27)
      .font('Helvetica')
      .fillColor(produto.ativo === 'S' ? this.colors.success : this.colors.danger)
      .text(produto.ativo === 'S' ? 'ATIVO' : 'INATIVO', col2X + 45, boxY + 27)

    if (produto.tipcontest) {
      this.doc
        .fillColor(this.colors.text)
        .font('Helvetica-Bold')
        .text('Controle:', col2X, boxY + 42)
        .font('Helvetica')
        .text(produto.tipcontest, col2X + 55, boxY + 42)
    }

    this.currentY = boxY + boxHeight + 15
  }

  /**
   * TASK-019: Criar resumo de consumo
   */
  private criarResumoConsumo(dados: DadosRelatorio): void {
    this.criarTituloSecao('RESUMO DO PERÍODO')

    const resumo = dados.resumo
    const boxY = this.currentY
    const boxHeight = 120

    // Box principal
    this.doc
      .rect(this.margin, boxY, this.contentWidth, boxHeight)
      .fill(this.colors.light)
      .stroke(this.colors.border)

    // Layout com 5 colunas
    const colWidth = this.contentWidth / 5
    const cols = [
      this.margin + 8,
      this.margin + colWidth,
      this.margin + colWidth * 2,
      this.margin + colWidth * 3,
      this.margin + colWidth * 4,
    ]

    // Linha 1 - Labels
    this.doc.font('Helvetica').fontSize(8).fillColor(this.colors.textLight)

    this.doc.text('Saldo Inicial', cols[0], boxY + 8)
    this.doc.text('Compras', cols[1], boxY + 8)
    this.doc.text('Consumo', cols[2], boxY + 8)
    this.doc.text('Saldo Período', cols[3], boxY + 8)
    this.doc.text('SALDO ATUAL', cols[4], boxY + 8)

    // Linha 2 - Quantidades
    this.doc.font('Helvetica-Bold').fontSize(10).fillColor(this.colors.text)

    this.doc.text(`${this.formatarNumero(resumo.saldoInicialQtd)}`, cols[0], boxY + 20)
    this.doc.fillColor(this.colors.success).text(`+${this.formatarNumero(resumo.totalComprasQtd)}`, cols[1], boxY + 20)
    this.doc.fillColor(this.colors.danger).text(`-${this.formatarNumero(resumo.totalConsumoQtd)}`, cols[2], boxY + 20)
    this.doc.fillColor(this.colors.text).text(`${this.formatarNumero(resumo.saldoFinalQtd)}`, cols[3], boxY + 20)
    this.doc.fillColor(this.colors.primary).fontSize(11).text(`${this.formatarNumero(resumo.saldoAtualQtd)}`, cols[4], boxY + 20)

    // Linha 3 - Unidade
    this.doc.font('Helvetica').fontSize(7).fillColor(this.colors.textLight)
    this.doc.text(dados.produto.unidade, cols[0], boxY + 33)
    this.doc.text(dados.produto.unidade, cols[1], boxY + 33)
    this.doc.text(dados.produto.unidade, cols[2], boxY + 33)
    this.doc.text(dados.produto.unidade, cols[3], boxY + 33)
    this.doc.text(dados.produto.unidade, cols[4], boxY + 33)

    // Linha 4 - Valores em R$
    this.doc.font('Helvetica-Bold').fontSize(9).fillColor(this.colors.text)

    this.doc.text(this.formatarMoeda(resumo.saldoInicialValor), cols[0], boxY + 45)
    this.doc.fillColor(this.colors.success).text(this.formatarMoeda(resumo.totalComprasValor), cols[1], boxY + 45)
    this.doc.fillColor(this.colors.danger).text(this.formatarMoeda(resumo.totalConsumoValor), cols[2], boxY + 45)
    this.doc.fillColor(this.colors.text).text(this.formatarMoeda(resumo.saldoFinalValor), cols[3], boxY + 45)
    this.doc.fillColor(this.colors.primary).fontSize(10).text(this.formatarMoeda(resumo.saldoAtualValor), cols[4], boxY + 45)

    // Linha divisória
    this.doc
      .moveTo(this.margin + 8, boxY + 62)
      .lineTo(this.margin + this.contentWidth - 8, boxY + 62)
      .stroke(this.colors.border)

    // Linha 5 - Labels das Métricas
    this.doc.font('Helvetica').fontSize(8).fillColor(this.colors.textLight)

    this.doc.text('Média/Dia', cols[0], boxY + 72)
    this.doc.text('Dias Estoque', cols[1], boxY + 72)
    this.doc.text('% Consumido', cols[2], boxY + 72)
    this.doc.text('Custo Unit. Médio', cols[3], boxY + 72)

    // Linha 6 - Valores das Métricas
    this.doc.font('Helvetica-Bold').fontSize(10).fillColor(this.colors.text)

    this.doc.text(`${this.formatarNumero(resumo.mediaConsumoDia)} ${dados.produto.unidade}`, cols[0], boxY + 84)

    // Dias de estoque com cor baseada na criticidade
    const diasColor = resumo.diasEstoqueDisponivel < 7 ? this.colors.danger :
                      resumo.diasEstoqueDisponivel < 15 ? this.colors.warning : this.colors.success
    this.doc.fillColor(diasColor).text(`${Math.round(resumo.diasEstoqueDisponivel)} dias`, cols[1], boxY + 84)

    this.doc.fillColor(this.colors.text).text(`${this.formatarNumero(resumo.percentualConsumo)}%`, cols[2], boxY + 84)
    this.doc.text(this.formatarMoeda(resumo.valorMedioUnitario), cols[3], boxY + 84)

    this.currentY = boxY + boxHeight + 15
  }

  /**
   * TASK-020: Criar gráfico de linha - consumo diário
   */
  private criarGraficoLinha(consumoDiario: ConsumoDiario[], dados: DadosRelatorio): void {
    this.garantirEspaco(200)
    this.criarTituloSecao('EVOLUÇÃO DO CONSUMO - VISÃO DIÁRIA')

    if (consumoDiario.length === 0) {
      this.doc
        .fontSize(10)
        .fillColor(this.colors.textLight)
        .text('Nenhuma movimentação no período', this.margin, this.currentY, {
          align: 'center',
          width: this.contentWidth,
        })
      this.currentY += 30
      return
    }

    const chartX = this.margin + 40
    const chartY = this.currentY
    const chartWidth = this.contentWidth - 60
    const chartHeight = 120

    // Eixos
    this.doc
      .moveTo(chartX, chartY)
      .lineTo(chartX, chartY + chartHeight)
      .lineTo(chartX + chartWidth, chartY + chartHeight)
      .stroke(this.colors.border)

    // Calcular escala
    const maxConsumo = Math.max(...consumoDiario.map((d) => d.qtdConsumo), 1)
    const mediaConsumo = dados.resumo.mediaConsumoDia

    // Plotar pontos e linhas
    if (consumoDiario.length > 1) {
      const pointSpacing = chartWidth / (consumoDiario.length - 1)

      // Linha de consumo
      this.doc.strokeColor(this.colors.accent).lineWidth(2)
      consumoDiario.forEach((dia, index) => {
        const x = chartX + index * pointSpacing
        const y = chartY + chartHeight - (dia.qtdConsumo / maxConsumo) * chartHeight

        if (index === 0) {
          this.doc.moveTo(x, y)
        } else {
          this.doc.lineTo(x, y)
        }
      })
      this.doc.stroke()

      // Pontos
      this.doc.fillColor(this.colors.accent)
      consumoDiario.forEach((dia, index) => {
        const x = chartX + index * pointSpacing
        const y = chartY + chartHeight - (dia.qtdConsumo / maxConsumo) * chartHeight
        this.doc.circle(x, y, 3).fill()
      })

      // Linha de média
      const mediaY = chartY + chartHeight - (mediaConsumo / maxConsumo) * chartHeight
      this.doc
        .strokeColor(this.colors.warning)
        .lineWidth(1)
        .dash(5, { space: 3 })
        .moveTo(chartX, mediaY)
        .lineTo(chartX + chartWidth, mediaY)
        .stroke()
        .undash()
    }

    // Labels do eixo Y
    this.doc.fontSize(7).fillColor(this.colors.textLight)
    this.doc.text(this.formatarNumero(maxConsumo), this.margin, chartY - 3)
    this.doc.text('0', this.margin, chartY + chartHeight - 3)

    // Legenda
    const legendY = chartY + chartHeight + 10
    this.doc.fontSize(8)

    this.doc.fillColor(this.colors.accent).circle(chartX, legendY + 4, 4).fill()
    this.doc.fillColor(this.colors.text).text('Consumo Diário', chartX + 10, legendY)

    this.doc.fillColor(this.colors.warning).circle(chartX + 120, legendY + 4, 4).fill()
    this.doc.fillColor(this.colors.text).text('Média do Período', chartX + 130, legendY)

    this.currentY = legendY + 25
  }

  /**
   * TASK-021: Criar gráfico de barras - consumo mensal
   */
  private criarGraficoBarras(consumoMensal: ConsumoMensal[]): void {
    this.garantirEspaco(180)
    this.criarTituloSecao('HISTÓRICO DE CONSUMO - ÚLTIMOS 6 MESES')

    if (consumoMensal.length === 0) {
      this.doc
        .fontSize(10)
        .fillColor(this.colors.textLight)
        .text('Nenhum dado de consumo nos últimos 6 meses', this.margin, this.currentY, {
          align: 'center',
          width: this.contentWidth,
        })
      this.currentY += 30
      return
    }

    const chartX = this.margin + 40
    const chartY = this.currentY
    const chartWidth = this.contentWidth - 60
    const chartHeight = 100

    // Eixo Y
    this.doc
      .moveTo(chartX, chartY)
      .lineTo(chartX, chartY + chartHeight)
      .lineTo(chartX + chartWidth, chartY + chartHeight)
      .stroke(this.colors.border)

    // Calcular escala
    const maxConsumo = Math.max(...consumoMensal.map((m) => m.qtdConsumo), 1)

    // Barras
    const barWidth = (chartWidth / consumoMensal.length) * 0.6
    const barSpacing = chartWidth / consumoMensal.length

    consumoMensal.forEach((mes, index) => {
      const barHeight = (mes.qtdConsumo / maxConsumo) * chartHeight
      const x = chartX + index * barSpacing + (barSpacing - barWidth) / 2
      const y = chartY + chartHeight - barHeight

      // Barra com gradiente
      this.doc.rect(x, y, barWidth, barHeight).fill(this.colors.accent)

      // Label do mês
      this.doc
        .fontSize(8)
        .fillColor(this.colors.text)
        .text(
          `${mes.mesNome}/${String(mes.ano).slice(-2)}`,
          x - 5,
          chartY + chartHeight + 5,
          { width: barWidth + 10, align: 'center' },
        )

      // Valor acima da barra
      if (mes.qtdConsumo > 0) {
        this.doc
          .fontSize(7)
          .fillColor(this.colors.textLight)
          .text(this.formatarNumero(mes.qtdConsumo), x - 5, y - 12, {
            width: barWidth + 10,
            align: 'center',
          })
      }
    })

    // Label do eixo Y
    this.doc.fontSize(7).fillColor(this.colors.textLight)
    this.doc.text(this.formatarNumero(maxConsumo), this.margin, chartY - 3)

    this.currentY = chartY + chartHeight + 35
  }

  /**
   * TASK-022: Criar tabela de consumo por departamento
   */
  private criarTabelaDepartamentos(departamentos: ConsumoPorDepartamento[], titulo: string = 'CONSUMO POR SETOR/DEPARTAMENTO'): void {
    const rowHeight = 22
    const headerHeight = 24
    // Calcular altura total da tabela
    const tabelaHeight = headerHeight + (departamentos.length * rowHeight) + 30

    // Se a tabela inteira não couber, começar em nova página
    this.garantirEspaco(Math.min(tabelaHeight, 200))
    this.criarTituloSecao(titulo)

    if (departamentos.length === 0) {
      this.doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(this.colors.textLight)
        .text('Nenhum consumo registrado no período', this.margin, this.currentY, {
          align: 'center',
          width: this.contentWidth,
        })
      this.currentY += 30
      return
    }

    const cols = [
      { x: this.margin, width: 160, label: 'SETOR/DEPARTAMENTO' },
      { x: this.margin + 160, width: 75, label: 'QUANTIDADE' },
      { x: this.margin + 235, width: 95, label: 'VALOR' },
      { x: this.margin + 330, width: 55, label: 'REQ.' },
      { x: this.margin + 385, width: this.contentWidth - 385 + this.margin, label: 'PERCENTUAL' },
    ]

    // Cabeçalho
    const tableStartY = this.currentY
    this.doc.rect(this.margin, this.currentY, this.contentWidth, headerHeight).fill(this.colors.primary)

    this.doc.font('Helvetica-Bold').fontSize(9).fillColor(this.colors.white)
    cols.forEach((col) => {
      this.doc.text(col.label, col.x + 6, this.currentY + 7, { width: col.width - 12 })
    })

    this.currentY += headerHeight

    // Linhas de dados
    departamentos.forEach((dep, index) => {
      // Verificar se precisa de nova página antes de cada linha
      if (this.currentY + rowHeight > this.maxY) {
        // Fechar borda atual
        this.doc
          .lineWidth(0.5)
          .rect(this.margin, tableStartY, this.contentWidth, this.currentY - tableStartY)
          .stroke(this.colors.border)

        this.doc.addPage(); this.pageNumber++; this.currentY = this.margin

        // Redesenhar cabeçalho na nova página
        this.doc.rect(this.margin, this.currentY, this.contentWidth, headerHeight).fill(this.colors.primary)
        this.doc.font('Helvetica-Bold').fontSize(9).fillColor(this.colors.white)
        cols.forEach((col) => {
          this.doc.text(col.label, col.x + 6, this.currentY + 7, { width: col.width - 12 })
        })
        this.currentY += headerHeight
      }

      const bgColor = index % 2 === 0 ? this.colors.white : this.colors.light

      this.doc.rect(this.margin, this.currentY, this.contentWidth, rowHeight).fill(bgColor)

      this.doc.font('Helvetica').fontSize(9).fillColor(this.colors.text)

      this.doc.text(dep.departamento, cols[0].x + 6, this.currentY + 6, { width: cols[0].width - 12 })
      this.doc.text(this.formatarNumero(dep.qtdConsumo), cols[1].x + 6, this.currentY + 6, { width: cols[1].width - 12 })
      this.doc.text(this.formatarMoeda(dep.valorConsumo), cols[2].x + 6, this.currentY + 6, { width: cols[2].width - 12 })
      this.doc.text(String(dep.qtdRequisicoes), cols[3].x + 6, this.currentY + 6, { width: cols[3].width - 12 })

      // Barra de percentual
      const maxBarWidth = cols[4].width - 50
      const barWidth = Math.max(2, (dep.percentual / 100) * maxBarWidth)
      this.doc
        .rect(cols[4].x + 6, this.currentY + 6, barWidth, 12)
        .fill(this.colors.accent)

      this.doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor(this.colors.text)
        .text(`${this.formatarNumero(dep.percentual)}%`, cols[4].x + maxBarWidth + 10, this.currentY + 7)

      this.currentY += rowHeight
    })

    // Borda final da tabela
    this.doc
      .lineWidth(0.5)
      .rect(this.margin, tableStartY, this.contentWidth, this.currentY - tableStartY)
      .stroke(this.colors.border)

    this.currentY += 20
  }

  /**
   * TASK-024: Criar tabela de movimentações detalhadas
   * Inclui: Data, Nota, Tipo, Parceiro, Grupo Usuario, Qtd, Valor
   */
  private criarTabelaMovimentacoes(movimentacoes: MovimentacaoDetalhada[]): void {
    // Verificar se há espaço para pelo menos o título + algumas linhas
    this.garantirEspaco(100)
    this.criarTituloSecao('DETALHAMENTO DAS MOVIMENTAÇÕES')

    if (movimentacoes.length === 0) {
      this.doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(this.colors.textLight)
        .text('Nenhuma movimentação no período', this.margin, this.currentY, {
          align: 'center',
          width: this.contentWidth,
        })
      this.currentY += 30
      return
    }

    // Colunas reorganizadas com Parceiro e Grupo
    const cols = [
      { x: this.margin, width: 58, label: 'DATA' },
      { x: this.margin + 58, width: 48, label: 'NOTA' },
      { x: this.margin + 106, width: 55, label: 'TIPO' },
      { x: this.margin + 161, width: 95, label: 'PARCEIRO' },
      { x: this.margin + 256, width: 85, label: 'GRUPO USU.' },
      { x: this.margin + 341, width: 50, label: 'QTD' },
      { x: this.margin + 391, width: this.contentWidth - 391 + this.margin, label: 'VALOR' },
    ]

    const rowHeight = 18
    const headerHeight = 20

    // Função para desenhar cabeçalho da tabela
    const desenharCabecalho = () => {
      this.doc
        .rect(this.margin, this.currentY, this.contentWidth, headerHeight)
        .fill(this.colors.primary)

      this.doc.font('Helvetica-Bold').fontSize(7).fillColor(this.colors.white)
      cols.forEach((col) => {
        this.doc.text(col.label, col.x + 3, this.currentY + 6, { width: col.width - 6 })
      })
      this.currentY += headerHeight
    }

    desenharCabecalho()

    // Mostrar todas as movimentações (máximo 60)
    const movsParaMostrar = movimentacoes.slice(0, 60)
    let tableStartY = this.currentY - headerHeight

    movsParaMostrar.forEach((mov, index) => {
      // Verificar se precisa de nova página
      if (this.currentY + rowHeight > this.maxY - 10) {
        // Fechar tabela atual com borda
        this.doc
          .lineWidth(0.5)
          .rect(this.margin, tableStartY, this.contentWidth, this.currentY - tableStartY)
          .stroke(this.colors.border)

        this.doc.addPage(); this.pageNumber++; this.currentY = this.margin
        tableStartY = this.currentY
        desenharCabecalho()
      }

      // Alternar cores de fundo
      const bgColor = index % 2 === 0 ? this.colors.white : this.colors.light
      this.doc.rect(this.margin, this.currentY, this.contentWidth, rowHeight).fill(bgColor)

      // Fonte padrão
      this.doc.font('Helvetica').fontSize(7).fillColor(this.colors.text)

      // Data
      this.doc.text(mov.dataFormatada, cols[0].x + 3, this.currentY + 5, { width: cols[0].width - 6 })

      // Nota
      this.doc.text(String(mov.nunota), cols[1].x + 3, this.currentY + 5, { width: cols[1].width - 6 })

      // Tipo com cor
      const tipoColor =
        mov.tipo === 'COMPRA' ? this.colors.success :
        mov.tipo === 'CONSUMO' ? this.colors.danger : this.colors.warning
      this.doc
        .font('Helvetica-Bold')
        .fontSize(7)
        .fillColor(tipoColor)
        .text(mov.tipo, cols[2].x + 3, this.currentY + 5, { width: cols[2].width - 6 })

      // Parceiro
      this.doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor(this.colors.text)
        .text(mov.parceiro.substring(0, 15), cols[3].x + 3, this.currentY + 5, { width: cols[3].width - 6 })

      // Grupo Usuario
      this.doc.text(mov.grupoUsuario.substring(0, 13), cols[4].x + 3, this.currentY + 5, { width: cols[4].width - 6 })

      // Quantidade com cor
      const qtdColor = mov.qtdMov > 0 ? this.colors.success : this.colors.danger
      const qtdText = mov.qtdMov > 0 ? `+${this.formatarNumero(mov.qtdMov)}` : this.formatarNumero(mov.qtdMov)
      this.doc
        .font('Helvetica-Bold')
        .fillColor(qtdColor)
        .text(qtdText, cols[5].x + 3, this.currentY + 5, { width: cols[5].width - 6 })

      // Valor
      this.doc
        .font('Helvetica')
        .fillColor(this.colors.text)
        .text(this.formatarMoeda(mov.valorMov), cols[6].x + 3, this.currentY + 5, { width: cols[6].width - 6 })

      this.currentY += rowHeight
    })

    // Borda final
    this.doc
      .lineWidth(0.5)
      .rect(this.margin, tableStartY, this.contentWidth, this.currentY - tableStartY)
      .stroke(this.colors.border)

    // Mensagem se houver mais registros
    if (movimentacoes.length > 60) {
      this.currentY += 5
      this.doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(this.colors.textLight)
        .text(
          `Exibindo 60 de ${movimentacoes.length} movimentações.`,
          this.margin,
          this.currentY,
          { align: 'center', width: this.contentWidth },
        )
    }
  }

  /**
   * TASK-025: Adicionar rodapé em todas as páginas
   */
  private adicionarRodapeTodasPaginas(): void {
    const pages = this.doc.bufferedPageRange()
    for (let i = 0; i < pages.count; i++) {
      this.doc.switchToPage(i)

      const footerY = this.pageHeight - 35

      this.doc
        .lineWidth(0.5)
        .moveTo(this.margin, footerY)
        .lineTo(this.pageWidth - this.margin, footerY)
        .stroke(this.colors.border)

      this.doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(this.colors.textLight)
        .text(`Página ${i + 1} de ${pages.count}`, this.margin, footerY + 10)

      this.doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(this.colors.textLight)
        .text(
          'API Sankhya Center - Relatório gerado automaticamente',
          this.pageWidth - this.margin - 200,
          footerY + 10,
          { width: 200, align: 'right' },
        )
    }
  }

  /**
   * Criar título de seção
   */
  private criarTituloSecao(titulo: string): void {
    this.doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor(this.colors.primary)
      .text(titulo, this.margin, this.currentY)

    this.currentY += 20
  }

  /**
   * Formatar número
   */
  private formatarNumero(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(valor)
  }

  /**
   * Formatar moeda
   */
  private formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  /**
   * Formatar data
   */
  private formatarData(data: string): string {
    try {
      const d = new Date(data)
      return d.toLocaleDateString('pt-BR')
    } catch {
      return data
    }
  }

  /**
   * Formatar data e hora
   */
  private formatarDataHora(data: string): string {
    try {
      const d = new Date(data)
      return d.toLocaleString('pt-BR')
    } catch {
      return data
    }
  }

  // ============================================================
  // MÉTODOS PARA RELATÓRIO EXECUTIVO
  // ============================================================

  /**
   * Cabeçalho do relatório executivo
   */
  private criarCabecalhoExecutivo(dados: DadosRelatorio): void {
    this.pageNumber++

    // Fundo do cabeçalho - maior para destaque
    this.doc
      .rect(this.margin, this.currentY, this.contentWidth, 90)
      .fill(this.colors.primary)

    // Título maior
    this.doc
      .font('Helvetica-Bold')
      .fontSize(22)
      .fillColor('#ffffff')
      .text('RELATÓRIO EXECUTIVO', this.margin + 15, this.currentY + 15, {
        width: this.contentWidth - 30,
      })

    // Subtítulo - Consumo de Produto
    this.doc
      .font('Helvetica')
      .fontSize(14)
      .fillColor('#ffffff')
      .text('Análise de Consumo de Produto', this.margin + 15, this.currentY + 42)

    // Período
    this.doc
      .fontSize(10)
      .text(
        `Período: ${this.formatarData(dados.periodo.dataInicio)} a ${this.formatarData(dados.periodo.dataFim)} (${dados.periodo.totalDias} dias)`,
        this.margin + 15,
        this.currentY + 62,
      )

    // Data de geração
    this.doc
      .fontSize(9)
      .text(
        `Gerado em: ${this.formatarDataHora(dados.geradoEm)} | Por: ${dados.geradoPor}`,
        this.margin + 15,
        this.currentY + 77,
      )

    this.currentY += 105
  }

  /**
   * Resumo executivo - cards grandes com destaque
   */
  private criarResumoExecutivo(dados: DadosRelatorio): void {
    this.criarTituloSecao('VISÃO GERAL')

    const resumo = dados.resumo
    const cardWidth = (this.contentWidth - 30) / 3
    const cardHeight = 80
    const startY = this.currentY

    // Card 1 - Consumo Total
    this.doc
      .rect(this.margin, startY, cardWidth, cardHeight)
      .fill(this.colors.danger)

    this.doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#ffffff')
      .text('CONSUMO TOTAL', this.margin + 10, startY + 10)

    this.doc
      .fontSize(20)
      .text(`${this.formatarNumero(resumo.totalConsumoQtd)}`, this.margin + 10, startY + 28)

    this.doc
      .font('Helvetica')
      .fontSize(9)
      .text(dados.produto.unidade, this.margin + 10, startY + 52)

    this.doc
      .fontSize(11)
      .text(this.formatarMoeda(resumo.totalConsumoValor), this.margin + 10, startY + 65)

    // Card 2 - Compras
    this.doc
      .rect(this.margin + cardWidth + 15, startY, cardWidth, cardHeight)
      .fill(this.colors.success)

    this.doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#ffffff')
      .text('COMPRAS', this.margin + cardWidth + 25, startY + 10)

    this.doc
      .fontSize(20)
      .text(`${this.formatarNumero(resumo.totalComprasQtd)}`, this.margin + cardWidth + 25, startY + 28)

    this.doc
      .font('Helvetica')
      .fontSize(9)
      .text(dados.produto.unidade, this.margin + cardWidth + 25, startY + 52)

    this.doc
      .fontSize(11)
      .text(this.formatarMoeda(resumo.totalComprasValor), this.margin + cardWidth + 25, startY + 65)

    // Card 3 - Saldo Final
    const saldoColor = resumo.saldoFinalQtd > 0 ? this.colors.accent : this.colors.warning
    this.doc
      .rect(this.margin + (cardWidth + 15) * 2, startY, cardWidth, cardHeight)
      .fill(saldoColor)

    this.doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#ffffff')
      .text('SALDO FINAL', this.margin + (cardWidth + 15) * 2 + 10, startY + 10)

    this.doc
      .fontSize(20)
      .text(`${this.formatarNumero(resumo.saldoFinalQtd)}`, this.margin + (cardWidth + 15) * 2 + 10, startY + 28)

    this.doc
      .font('Helvetica')
      .fontSize(9)
      .text(dados.produto.unidade, this.margin + (cardWidth + 15) * 2 + 10, startY + 52)

    this.doc
      .fontSize(11)
      .text(this.formatarMoeda(resumo.saldoFinalValor), this.margin + (cardWidth + 15) * 2 + 10, startY + 65)

    this.currentY = startY + cardHeight + 25
  }

  /**
   * Indicadores executivos - métricas chave
   */
  private criarIndicadoresExecutivos(dados: DadosRelatorio): void {
    this.garantirEspaco(120)
    this.criarTituloSecao('INDICADORES CHAVE')

    const resumo = dados.resumo
    const boxY = this.currentY
    const boxHeight = 70

    this.doc
      .rect(this.margin, boxY, this.contentWidth, boxHeight)
      .fill(this.colors.light)
      .stroke(this.colors.border)

    const colWidth = this.contentWidth / 4
    const cols = [
      this.margin + 15,
      this.margin + colWidth,
      this.margin + colWidth * 2,
      this.margin + colWidth * 3,
    ]

    // Labels
    this.doc.fontSize(9).fillColor(this.colors.textLight).font('Helvetica')

    this.doc.text('Média/Dia', cols[0], boxY + 12)
    this.doc.text('Dias de Estoque', cols[1], boxY + 12)
    this.doc.text('Custo Unitário', cols[2], boxY + 12)
    this.doc.text('% do Estoque', cols[3], boxY + 12)

    // Valores
    this.doc.font('Helvetica-Bold').fontSize(16).fillColor(this.colors.primary)

    this.doc.text(`${this.formatarNumero(resumo.mediaConsumoDia)}`, cols[0], boxY + 30)

    // Dias de estoque com cor baseada na criticidade
    const diasColor = resumo.diasEstoqueDisponivel < 7 ? this.colors.danger :
                      resumo.diasEstoqueDisponivel < 15 ? this.colors.warning : this.colors.success
    this.doc.fillColor(diasColor).text(`${Math.round(resumo.diasEstoqueDisponivel)}`, cols[1], boxY + 30)

    this.doc.fillColor(this.colors.primary).text(this.formatarMoeda(resumo.valorMedioUnitario), cols[2], boxY + 30)
    this.doc.text(`${this.formatarNumero(resumo.percentualConsumo)}%`, cols[3], boxY + 30)

    // Subtexto
    this.doc.font('Helvetica').fontSize(8).fillColor(this.colors.textLight)

    this.doc.text(dados.produto.unidade, cols[0], boxY + 50)
    this.doc.text('até acabar', cols[1], boxY + 50)
    this.doc.text('médio', cols[2], boxY + 50)
    this.doc.text('consumido', cols[3], boxY + 50)

    this.currentY = boxY + boxHeight + 20
  }

  /**
   * Top consumidores - ranking dos maiores consumidores
   */
  private criarTopConsumidores(dados: DadosRelatorio): void {
    this.garantirEspaco(200)
    this.criarTituloSecao('TOP CONSUMIDORES')

    // Combinar centro de custo e grupo de usuário em um ranking
    const todosConsumidores = [
      ...dados.consumoPorCentroCusto.map(c => ({ ...c, origem: 'Centro de Custo' })),
      ...dados.consumoPorGrupoUsuario.map(g => ({ ...g, origem: 'Grupo de Usuário' })),
    ].sort((a, b) => b.qtdConsumo - a.qtdConsumo).slice(0, 5)

    if (todosConsumidores.length === 0) {
      this.doc
        .fontSize(10)
        .fillColor(this.colors.textLight)
        .text('Nenhum consumo registrado', this.margin, this.currentY)
      this.currentY += 30
      return
    }

    const barMaxWidth = this.contentWidth - 180
    const maxConsumo = todosConsumidores[0]?.qtdConsumo || 1
    const rowHeight = 35
    let currentRowY = this.currentY

    todosConsumidores.forEach((consumidor, index) => {
      const barWidth = (consumidor.qtdConsumo / maxConsumo) * barMaxWidth
      const rankColor = index === 0 ? this.colors.danger :
                       index === 1 ? this.colors.warning :
                       index === 2 ? this.colors.accent : this.colors.secondary

      // Número do ranking
      this.doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .fillColor(rankColor)
        .text(`${index + 1}º`, this.margin, currentRowY + 8)

      // Nome
      this.doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(this.colors.text)
        .text(consumidor.departamento, this.margin + 30, currentRowY + 5, { width: 140 })

      this.doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(this.colors.textLight)
        .text(consumidor.origem, this.margin + 30, currentRowY + 18)

      // Barra
      this.doc
        .rect(this.margin + 180, currentRowY + 5, barWidth, 20)
        .fill(rankColor)

      // Valor na barra
      this.doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#ffffff')
        .text(
          `${this.formatarNumero(consumidor.qtdConsumo)} (${this.formatarNumero(consumidor.percentual)}%)`,
          this.margin + 185,
          currentRowY + 11,
        )

      currentRowY += rowHeight
    })

    this.currentY = currentRowY + 10
  }

  // ============================================================
  // MÉTODOS PARA RELATÓRIO POR CENTRO DE CUSTO
  // ============================================================

  /**
   * Movimentações agrupadas por centro de custo
   */
  private criarMovimentacoesPorCentroCusto(dados: DadosRelatorio): void {
    this.garantirEspaco(150)
    this.criarTituloSecao('MOVIMENTAÇÕES POR CENTRO DE CUSTO')

    // Simplificar: mostrar apenas as últimas 30 movimentações de consumo
    const consumos = dados.movimentacoes.filter(m => m.tipo === 'CONSUMO').slice(0, 30)

    if (consumos.length === 0) {
      this.doc
        .fontSize(10)
        .fillColor(this.colors.textLight)
        .text('Nenhuma movimentação de consumo no período', this.margin, this.currentY)
      this.currentY += 30
      return
    }

    this.criarTabelaMovimentacoesSimplificada(consumos, 'setor')
  }

  // ============================================================
  // MÉTODOS PARA RELATÓRIO POR GRUPO DE USUÁRIO
  // ============================================================

  /**
   * Movimentações agrupadas por grupo de usuário
   */
  private criarMovimentacoesPorGrupoUsuario(dados: DadosRelatorio): void {
    this.garantirEspaco(150)
    this.criarTituloSecao('MOVIMENTAÇÕES POR GRUPO DE USUÁRIO')

    const consumos = dados.movimentacoes.filter(m => m.tipo === 'CONSUMO').slice(0, 30)

    if (consumos.length === 0) {
      this.doc
        .fontSize(10)
        .fillColor(this.colors.textLight)
        .text('Nenhuma movimentação de consumo no período', this.margin, this.currentY)
      this.currentY += 30
      return
    }

    this.criarTabelaMovimentacoesSimplificada(consumos, 'usuario')
  }

  /**
   * Tabela simplificada de movimentações com Parceiro e Grupo
   */
  private criarTabelaMovimentacoesSimplificada(movimentacoes: MovimentacaoDetalhada[], destaque: 'setor' | 'usuario'): void {
    const cols = [
      { x: this.margin, width: 58, label: 'DATA' },
      { x: this.margin + 58, width: 48, label: 'NOTA' },
      { x: this.margin + 106, width: 90, label: destaque === 'setor' ? 'CENTRO CUSTO' : 'GRUPO USU.' },
      { x: this.margin + 196, width: 90, label: 'PARCEIRO' },
      { x: this.margin + 286, width: 50, label: 'QTD' },
      { x: this.margin + 336, width: this.contentWidth - 336 + this.margin, label: 'VALOR' },
    ]

    const rowHeight = 18
    const headerHeight = 20
    const tableStartY = this.currentY

    // Função para desenhar cabeçalho
    const desenharCabecalho = () => {
      this.doc.rect(this.margin, this.currentY, this.contentWidth, headerHeight).fill(this.colors.primary)
      this.doc.font('Helvetica-Bold').fontSize(7).fillColor(this.colors.white)
      cols.forEach((col) => {
        this.doc.text(col.label, col.x + 3, this.currentY + 6, { width: col.width - 6 })
      })
      this.currentY += headerHeight
    }

    desenharCabecalho()
    let tableContentStartY = tableStartY

    movimentacoes.forEach((mov, index) => {
      // Verificar quebra de página
      if (this.currentY + rowHeight > this.maxY - 10) {
        // Fechar tabela atual
        this.doc
          .lineWidth(0.5)
          .rect(this.margin, tableContentStartY, this.contentWidth, this.currentY - tableContentStartY)
          .stroke(this.colors.border)

        this.doc.addPage(); this.pageNumber++; this.currentY = this.margin
        tableContentStartY = this.currentY
        desenharCabecalho()
      }

      const bgColor = index % 2 === 0 ? this.colors.white : this.colors.light
      this.doc.rect(this.margin, this.currentY, this.contentWidth, rowHeight).fill(bgColor)

      this.doc.font('Helvetica').fontSize(7).fillColor(this.colors.text)

      // Data
      this.doc.text(mov.dataFormatada, cols[0].x + 3, this.currentY + 5, { width: cols[0].width - 6 })

      // Nota
      this.doc.text(String(mov.nunota), cols[1].x + 3, this.currentY + 5, { width: cols[1].width - 6 })

      // Destaque (Centro Custo ou Grupo Usuario)
      const destaqueTexto = destaque === 'setor' ? mov.setor : mov.grupoUsuario
      this.doc.font('Helvetica-Bold').text(destaqueTexto.substring(0, 14), cols[2].x + 3, this.currentY + 5, { width: cols[2].width - 6 })

      // Parceiro
      this.doc.font('Helvetica').text(mov.parceiro.substring(0, 14), cols[3].x + 3, this.currentY + 5, { width: cols[3].width - 6 })

      // Quantidade
      this.doc.font('Helvetica-Bold').fillColor(this.colors.danger).text(this.formatarNumero(Math.abs(mov.qtdMov)), cols[4].x + 3, this.currentY + 5, { width: cols[4].width - 6 })

      // Valor
      this.doc.font('Helvetica').fillColor(this.colors.text).text(this.formatarMoeda(Math.abs(mov.valorMov)), cols[5].x + 3, this.currentY + 5, { width: cols[5].width - 6 })

      this.currentY += rowHeight
    })

    // Borda final
    this.doc
      .lineWidth(0.5)
      .rect(this.margin, tableContentStartY, this.contentWidth, this.currentY - tableContentStartY)
      .stroke(this.colors.border)
  }
}
