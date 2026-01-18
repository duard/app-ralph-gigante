import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common'
import {
  PaginatedResult,
  buildPaginatedResult,
} from '../../common/pagination/pagination.types'
import { SankhyaApiService } from '../shared/sankhya-api.service'
import { OrdemServicoFindAllDto } from './models/tcfoscab.dto'
import {
  OrdemServico,
  OrdemServicoDetalhada,
  ServicoOS,
  ApontamentoOS,
  ProdutoOS,
  EstatisticasOS,
  ProdutividadeExecutor,
} from './models/tcfoscab.interface'
import * as OSQueries from './queries/os.queries'

@Injectable()
export class TcfoscabService {
  private readonly logger = new Logger(TcfoscabService.name)

  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  /**
   * Lista ordens de serviço com filtros
   */
  async findAll(
    dto: OrdemServicoFindAllDto,
  ): Promise<PaginatedResult<OrdemServico>> {
    const whereClauses: string[] = []
    const params: any[] = []

    if (dto.status) whereClauses.push(`cab.STATUS = '${dto.status}'`)
    if (dto.codveiculo)
      whereClauses.push(`cab.CODVEICULO = ${dto.codveiculo}`)
    if (dto.manutencao)
      whereClauses.push(`cab.MANUTENCAO = '${dto.manutencao}'`)
    if (dto.tipo) whereClauses.push(`cab.TIPO = '${dto.tipo}'`)

    if (dto.dtInicio && dto.dtFim) {
      whereClauses.push(
        `cab.DTABERTURA BETWEEN '${dto.dtInicio}' AND '${dto.dtFim}'`,
      )
    }

    if (dto.search) {
      const s = dto.search.trim().replace(/'/g, "''")
      whereClauses.push(
        `(v.PLACA LIKE '%${s}%' OR v.MARCAMODELO LIKE '%${s}%' OR CAST(cab.NUOS AS VARCHAR) = '${s}')`,
      )
    }

    const where = whereClauses.length
      ? `WHERE ${whereClauses.join(' AND ')}`
      : ''
    const sort = dto.sort || 'cab.DTABERTURA DESC'
    const perPage = Number(dto.perPage) || 50
    const page = Number(dto.page) || 1
    const offset = (page - 1) * perPage

    const query = OSQueries.FIND_ALL_OS_QUERY + ` ${where} ORDER BY ${sort}`

    try {
      // 1. Buscar dados principais
      const allResults = await this.sankhyaApiService.executeQuery(query, [])

      // 2. Paginar resultados
      const paginatedItems = allResults.slice(offset, offset + perPage)

      // 3. Buscar contadores de serviços para os itens da página atual
      this.logger.log(`[findAll] Buscando contadores para ${paginatedItems.length} itens`)

      if (paginatedItems.length > 0) {
        // Buscar contadores de serviços para cada OS individualmente (em paralelo)
        await Promise.all(
          paginatedItems.map(async (item: any) => {
            try {
              const nuos = Number(item.NUOS)
              const countQuery = OSQueries.buildServicosCountQuerySingle(nuos)
              this.logger.debug(`[findAll] Query para OS ${nuos}: ${countQuery.replace(/\s+/g, ' ').trim()}`)

              const results = await this.sankhyaApiService.executeQuery(countQuery, [])
              this.logger.debug(`[findAll] OS ${nuos} - Resultado bruto: ${JSON.stringify(results)}`)

              if (results && results.length > 0) {
                const row = results[0]
                this.logger.debug(`[findAll] OS ${nuos} - Row keys: ${Object.keys(row).join(', ')}`)

                // Tentar diferentes nomes de coluna
                const total = Number(row.TOTAL || row.total || row['TOTAL'] || 0)
                const finalizados = Number(row.FINALIZADOS || row.finalizados || row['FINALIZADOS'] || 0)

                item.QTD_SERVICOS = total
                item.QTD_SERVICOS_FINALIZADOS = finalizados

                this.logger.log(`[findAll] OS ${nuos}: Serviços ${finalizados}/${total}`)
              } else {
                this.logger.warn(`[findAll] OS ${nuos}: Nenhum resultado da query de contagem`)
              }
            } catch (err) {
              this.logger.error(`[findAll] Erro ao buscar contadores para OS ${item.NUOS}: ${(err as any)?.message}`)
            }
          }),
        )
      }

      // Log dos itens com contadores antes do mapeamento
      this.logger.debug(`[findAll] Itens com contadores: ${JSON.stringify(paginatedItems.slice(0, 2).map((i: any) => ({ nuos: i.NUOS, QTD_SERVICOS: i.QTD_SERVICOS, QTD_SERVICOS_FINALIZADOS: i.QTD_SERVICOS_FINALIZADOS })))}`)

      // 4. Mapear para o formato de resposta
      const data = paginatedItems.map((item: any) => this.mapOrdemServico(item))

      // Log dados após mapeamento
      this.logger.log(`[findAll] Dados mapeados (primeiros 2): ${JSON.stringify(data.slice(0, 2).map(d => ({ nuos: d.nuos, qtdServicos: d.qtdServicos, qtdServicosFinalizados: d.qtdServicosFinalizados })))}`)

      return buildPaginatedResult({
        data,
        total: allResults.length,
        page,
        perPage,
      })
    } catch (error) {
      this.logger.error('Erro em findAll:', (error as any)?.message || error)
      throw new InternalServerErrorException(
        'Erro ao buscar ordens de serviço',
      )
    }
  }

  /**
   * Busca OS por ID com todos os detalhes
   */
  async findById(nuos: number): Promise<OrdemServicoDetalhada> {
    const startTime = Date.now()
    this.logger.log(`[findById] Iniciando busca da OS ${nuos}`)

    try {
      // Step 1: Buscar cabeçalho da OS
      this.logger.debug(`[findById:${nuos}] Step 1: Executando query FIND_OS_BY_ID_QUERY`)
      const cabStartTime = Date.now()

      let cabResults: any[]
      try {
        // Usa interpolação direta do nuos pois a API não suporta parâmetros nomeados
        const query = OSQueries.buildFindByIdQuery(nuos)
        cabResults = await this.sankhyaApiService.executeQuery(query, [])
        this.logger.debug(
          `[findById:${nuos}] Step 1 OK: Query executada em ${Date.now() - cabStartTime}ms, ${cabResults?.length || 0} resultados`,
        )
      } catch (queryError) {
        this.logger.error(
          `[findById:${nuos}] Step 1 FALHOU: Erro na query FIND_OS_BY_ID_QUERY`,
          {
            error: (queryError as any)?.message,
            stack: (queryError as any)?.stack,
            query: 'buildFindByIdQuery',
            nuos,
          },
        )
        throw new InternalServerErrorException({
          message: 'Erro ao executar query de busca da OS',
          details: {
            step: 'FIND_OS_BY_ID_QUERY',
            nuos,
            error: (queryError as any)?.message,
            stack: (queryError as any)?.stack?.split('\n').slice(0, 5),
          },
        })
      }

      const [cabResult] = cabResults

      if (!cabResult) {
        this.logger.warn(`[findById:${nuos}] OS não encontrada`)
        throw new NotFoundException(`Ordem de serviço ${nuos} não encontrada`)
      }

      // Step 2: Mapear resultado
      this.logger.debug(`[findById:${nuos}] Step 2: Mapeando resultado do cabeçalho`)
      let os: OrdemServico
      try {
        os = this.mapOrdemServicoDetalhada(cabResult)
        this.logger.debug(`[findById:${nuos}] Step 2 OK: Mapeamento concluído`)
      } catch (mapError) {
        this.logger.error(`[findById:${nuos}] Step 2 FALHOU: Erro no mapeamento`, {
          error: (mapError as any)?.message,
          cabResult: JSON.stringify(cabResult).slice(0, 500),
        })
        throw new InternalServerErrorException({
          message: 'Erro ao mapear dados da OS',
          details: {
            step: 'mapOrdemServicoDetalhada',
            nuos,
            error: (mapError as any)?.message,
            rawData: JSON.stringify(cabResult).slice(0, 200),
          },
        })
      }

      // Step 3: Buscar serviços
      this.logger.debug(`[findById:${nuos}] Step 3: Buscando serviços`)
      const servicosStartTime = Date.now()
      const servicos = await this.findServicos(nuos)
      this.logger.debug(
        `[findById:${nuos}] Step 3 OK: ${servicos.length} serviços em ${Date.now() - servicosStartTime}ms`,
      )

      // Step 4: Buscar apontamentos
      this.logger.debug(`[findById:${nuos}] Step 4: Buscando apontamentos`)
      const apontStartTime = Date.now()
      const apontamentos = await this.findApontamentos(nuos)
      this.logger.debug(
        `[findById:${nuos}] Step 4 OK: ${apontamentos.length} apontamentos em ${Date.now() - apontStartTime}ms`,
      )

      // Step 5: Buscar produtos
      this.logger.debug(`[findById:${nuos}] Step 5: Buscando produtos`)
      const prodStartTime = Date.now()
      const produtos = await this.findProdutos(nuos)
      this.logger.debug(
        `[findById:${nuos}] Step 5 OK: ${produtos.length} produtos em ${Date.now() - prodStartTime}ms`,
      )

      // Step 6: Calcular totais
      this.logger.debug(`[findById:${nuos}] Step 6: Calculando totais`)
      const totalHorasHomem = apontamentos.reduce(
        (sum, a) => sum + (a.minutosTrabalhados || 0),
        0,
      )
      const totalHorasLiquidas = apontamentos.reduce(
        (sum, a) => sum + (a.minutosLiquidos || 0),
        0,
      )
      const totalCusto = produtos.reduce((sum, p) => sum + (p.vlrtot || 0), 0)

      const result = {
        ...os,
        servicos,
        apontamentos,
        produtos,
        totalHorasHomem: totalHorasHomem / 60,
        totalHorasLiquidas: totalHorasLiquidas / 60,
        totalProdutos: produtos.length,
        totalServicos: servicos.length,
        totalCusto,
        qtdExecutores: new Set(apontamentos.map((a) => a.codexec)).size,
      }

      this.logger.log(
        `[findById:${nuos}] Concluído em ${Date.now() - startTime}ms - ${servicos.length} serviços, ${apontamentos.length} apontamentos, ${produtos.length} produtos`,
      )

      return result
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      if (error instanceof InternalServerErrorException) throw error

      // Erro não tratado
      this.logger.error(`[findById:${nuos}] Erro não tratado:`, {
        message: (error as any)?.message,
        name: (error as any)?.name,
        stack: (error as any)?.stack,
        error: JSON.stringify(error, Object.getOwnPropertyNames(error as any)),
      })

      throw new InternalServerErrorException({
        message: 'Erro interno ao buscar ordem de serviço',
        details: {
          nuos,
          errorType: (error as any)?.name || 'Unknown',
          errorMessage: (error as any)?.message || String(error),
          stack: (error as any)?.stack?.split('\n').slice(0, 10),
          timestamp: new Date().toISOString(),
        },
      })
    }
  }

  /**
   * Busca serviços de uma OS
   */
  async findServicos(nuos: number): Promise<ServicoOS[]> {
    try {
      const query = OSQueries.buildFindServicosQuery(nuos)
      const results = await this.sankhyaApiService.executeQuery(query, [])

      return results.map((item: any) => this.mapServico(item))
    } catch (error) {
      this.logger.error('Erro em findServicos:', error)
      return []
    }
  }

  /**
   * Busca apontamentos de uma OS
   */
  async findApontamentos(nuos: number): Promise<ApontamentoOS[]> {
    try {
      const query = OSQueries.buildFindApontamentosQuery(nuos)
      const results = await this.sankhyaApiService.executeQuery(query, [])

      return results.map((item: any) => this.mapApontamento(item))
    } catch (error) {
      this.logger.error('Erro em findApontamentos:', error)
      return []
    }
  }

  /**
   * Busca produtos de uma OS
   */
  async findProdutos(nuos: number): Promise<ProdutoOS[]> {
    try {
      const query = OSQueries.buildFindProdutosQuery(nuos)
      const results = await this.sankhyaApiService.executeQuery(query, [])

      return results.map((item: any) => this.mapProduto(item))
    } catch (error) {
      this.logger.error('Erro em findProdutos:', error)
      return []
    }
  }

  /**
   * Estatísticas gerais
   */
  async getEstatisticas(
    dataInicio: string,
    dataFim: string,
  ): Promise<EstatisticasOS> {
    try {
      const query = OSQueries.buildEstatisticasGeralQuery(dataInicio, dataFim)
      const [result] = await this.sankhyaApiService.executeQuery(query, [])

      return {
        totalOS: Number(result.TOTAL_OS),
        finalizadas: Number(result.FINALIZADAS),
        emExecucao: Number(result.EM_EXECUCAO),
        abertas: Number(result.ABERTAS),
        reabertas: Number(result.REABERTAS),
        preventivas: Number(result.PREVENTIVAS),
        corretivas: Number(result.CORRETIVAS),
        outras: Number(result.OUTRAS),
        tempoMedioDias: Number(result.MEDIA_DIAS_MANUTENCAO || 0),
        totalHorasHomem: 0, // Calculado separadamente se necessário
        totalVeiculos: Number(result.TOTAL_VEICULOS),
        totalExecutores: Number(result.TOTAL_RESPONSAVEIS),
      }
    } catch (error) {
      this.logger.error('Erro em getEstatisticas:', error)
      throw new InternalServerErrorException('Erro ao buscar estatísticas')
    }
  }

  /**
   * OS ativas (resumo)
   */
  async getOSAtivas(): Promise<any[]> {
    try {
      const results = await this.sankhyaApiService.executeQuery(
        OSQueries.GET_OS_ATIVAS_RESUMO_QUERY,
        [],
      )

      return results.map((item: any) => ({
        nuos: Number(item.NUOS),
        codveiculo: Number(item.CODVEICULO),
        placa: item.PLACA,
        veiculo: item.VEICULO,
        status: item.STATUS,
        manutencao: item.MANUTENCAO,
        dataini: new Date(item.DATAINI),
        previsao: item.PREVISAO ? new Date(item.PREVISAO) : undefined,
        diasEmManutencao: Number(item.DIAS_EM_MANUTENCAO),
        situacao: item.SITUACAO,
        qtdServicos: Number(item.QTD_SERVICOS),
        servicosConcluidos: Number(item.SERVICOS_CONCLUIDOS),
        servicosEmAndamento: Number(item.SERVICOS_EM_ANDAMENTO),
        proximoServico: item.PROXIMO_SERVICO,
      }))
    } catch (error) {
      this.logger.error('Erro em getOSAtivas:', error)
      return []
    }
  }

  /**
   * Produtividade de executores
   */
  async getProdutividade(
    dataInicio: string,
    dataFim: string,
  ): Promise<ProdutividadeExecutor[]> {
    try {
      const results = await this.sankhyaApiService.executeQuery(
        OSQueries.buildProdutividadeExecutoresQuery(dataInicio, dataFim),
      )

      return results.map((item: any) => ({
        codexec: Number(item.CODEXEC),
        nomeExecutor: item.EXECUTOR_NOME,
        totalOS: Number(item.TOTAL_OS),
        totalApontamentos: Number(item.TOTAL_APONTAMENTOS),
        totalMinutos: Number(item.TOTAL_MINUTOS_LIQUIDOS),
        totalHoras: Number(item.TOTAL_HORAS_LIQUIDAS),
        mediaMinutosPorApontamento: Number(item.MEDIA_MINUTOS_APONTAMENTO),
      }))
    } catch (error) {
      this.logger.error('Erro em getProdutividade:', error)
      return []
    }
  }

  /**
   * Produtos mais utilizados
   */
  async getProdutosMaisUtilizados(
    dataInicio: string,
    dataFim: string,
  ): Promise<any[]> {
    try {
      const results = await this.sankhyaApiService.executeQuery(
        OSQueries.buildProdutosMaisUtilizadosQuery(dataInicio, dataFim),
      )

      return results.map((item: any) => ({
        codprod: Number(item.CODPROD),
        descrprod: item.DESCRPROD,
        referencia: item.REFERENCIA,
        marca: item.MARCA,
        descrgrupoprod: item.DESCRGRUPOPROD,
        qtdOS: Number(item.QTD_OS),
        qtdTotal: Number(item.QTD_TOTAL),
        valorTotal: Number(item.VALOR_TOTAL),
        valorMedio: Number(item.VALOR_MEDIO),
      }))
    } catch (error) {
      this.logger.error('Erro em getProdutosMaisUtilizados:', error)
      return []
    }
  }

  // ==========================================
  // MAPEAMENTO DE ENTIDADES
  // ==========================================

  private mapOrdemServico(item: any): OrdemServico {
    return {
      nuos: Number(item.NUOS),
      dtabertura: item.DTABERTURA ? new Date(item.DTABERTURA) : undefined,
      dataini: item.DATAINI ? new Date(item.DATAINI) : undefined,
      datafin: item.DATAFIN ? new Date(item.DATAFIN) : undefined,
      previsao: item.PREVISAO ? new Date(item.PREVISAO) : undefined,
      status: item.STATUS,
      tipo: item.TIPO,
      manutencao: item.MANUTENCAO,
      codveiculo: item.CODVEICULO ? Number(item.CODVEICULO) : undefined,
      codparc: item.CODPARC ? Number(item.CODPARC) : undefined,
      codusuinc: item.CODUSUINC ? Number(item.CODUSUINC) : undefined,
      codusu: item.CODUSU ? Number(item.CODUSU) : undefined,
      codusufinaliza: item.CODUSUFINALIZA
        ? Number(item.CODUSUFINALIZA)
        : undefined,
      km: item.KM ? Number(item.KM) : undefined,
      horimetro: item.HORIMETRO ? Number(item.HORIMETRO) : undefined,
      codcencus: item.CODCENCUS ? Number(item.CODCENCUS) : undefined,
      veiculo: item.PLACA
        ? {
            codveiculo: Number(item.CODVEICULO),
            placa: item.PLACA,
            marcamodelo: item.VEICULO_NOME,
            ad_tipoeqpto: item.VEICULO_TIPO,
          }
        : undefined,
      parceiro: item.PARCEIRO_NOME
        ? {
            codparc: Number(item.CODPARC),
            nomeparc: item.PARCEIRO_NOME,
          }
        : undefined,
      usuarioInclusao: item.USUARIO_INCLUSAO
        ? {
            codusu: Number(item.CODUSUINC),
            nomeusu: item.USUARIO_INCLUSAO,
          }
        : undefined,
      // Contadores (vindos da query FIND_ALL_OS_QUERY)
      // Nota: tentamos ambos os cases pois a API pode retornar em case diferente
      qtdServicos: this.getNumber(item, 'QTD_SERVICOS', 0),
      qtdServicosFinalizados: this.getNumber(item, 'QTD_SERVICOS_FINALIZADOS', 0),
      qtdApontamentos: this.getNumber(item, 'QTD_APONTAMENTOS', 0),
      qtdProdutos: this.getNumber(item, 'QTD_PRODUTOS', 0),
      diasManutencao: this.getNumber(item, 'DIAS_MANUTENCAO', undefined),
      situacaoPrazo: this.getString(item, 'SITUACAO_PRAZO'),
    }
  }

  private mapOrdemServicoDetalhada(item: any): OrdemServico {
    return this.mapOrdemServico(item)
  }

  private mapServico(item: any): ServicoOS {
    return {
      nuos: Number(item.NUOS),
      sequencia: Number(item.SEQUENCIA),
      codprod: item.CODPROD ? Number(item.CODPROD) : undefined,
      qtd: item.QTD ? Number(item.QTD) : undefined,
      vlrunit: item.VLRUNIT ? Number(item.VLRUNIT) : undefined,
      vlrtot: item.VLRTOT ? Number(item.VLRTOT) : undefined,
      dataini: item.DATAINI ? new Date(item.DATAINI) : undefined,
      datafin: item.DATAFIN ? new Date(item.DATAFIN) : undefined,
      tempo: item.TEMPO ? Number(item.TEMPO) : undefined,
      status: item.STATUS,
      observacao: item.OBSERVACAO,
      produto: item.DESCRPROD
        ? {
            codprod: Number(item.CODPROD),
            descrprod: item.DESCRPROD,
            referencia: item.REFERENCIA,
          }
        : undefined,
    }
  }

  private mapApontamento(item: any): ApontamentoOS {
    return {
      nuos: Number(item.NUOS),
      id: Number(item.ID),
      sequencia: Number(item.SEQUENCIA),
      codexec: item.CODEXEC ? Number(item.CODEXEC) : undefined,
      dhini: item.DHINI ? new Date(item.DHINI) : undefined,
      dhfin: item.DHFIN ? new Date(item.DHFIN) : undefined,
      intervalo: item.INTERVALO ? Number(item.INTERVALO) : undefined,
      intervaloMinutos: item.INTERVALO_MINUTOS
        ? Number(item.INTERVALO_MINUTOS)
        : undefined,
      status: item.STATUS,
      dhapont: item.DHAPONT ? new Date(item.DHAPONT) : undefined,
      ad_descr: item.AD_DESCR,
      minutosTrabalhados: item.MINUTOS_TRABALHADOS
        ? Number(item.MINUTOS_TRABALHADOS)
        : undefined,
      minutosLiquidos: item.MINUTOS_LIQUIDOS
        ? Number(item.MINUTOS_LIQUIDOS)
        : undefined,
      executor: item.EXECUTOR_NOME
        ? {
            codusu: Number(item.CODEXEC),
            nomeusu: item.EXECUTOR_NOME,
          }
        : undefined,
      servicoDescricao: item.SERVICO_DESCRICAO,
    }
  }

  private mapProduto(item: any): ProdutoOS {
    return {
      nuos: Number(item.NUOS),
      sequencia: Number(item.SEQUENCIA),
      codprod: item.CODPROD ? Number(item.CODPROD) : undefined,
      codlocal: item.CODLOCAL ? Number(item.CODLOCAL) : undefined,
      codvol: item.CODVOL,
      controle: item.CONTROLE,
      qtdneg: item.QTDNEG ? Number(item.QTDNEG) : undefined,
      vlrunit: item.VLRUNIT ? Number(item.VLRUNIT) : undefined,
      vlrtot: item.VLRTOT ? Number(item.VLRTOT) : undefined,
      observacao: item.OBSERVACAO,
      produto: item.DESCRPROD
        ? {
            codprod: Number(item.CODPROD),
            descrprod: item.DESCRPROD,
            referencia: item.REFERENCIA,
            codvol: item.CODVOL,
          }
        : undefined,
    }
  }

  /**
   * Helper para obter valor numérico de um campo (case-insensitive)
   */
  private getNumber(item: any, fieldName: string, defaultValue: number | undefined): number | undefined {
    // Tenta uppercase, lowercase e original
    const value = item[fieldName] ?? item[fieldName.toLowerCase()] ?? item[fieldName.toUpperCase()]
    if (value === null || value === undefined) return defaultValue
    const num = Number(value)
    return isNaN(num) ? defaultValue : num
  }

  /**
   * Helper para obter valor string de um campo (case-insensitive)
   */
  private getString(item: any, fieldName: string): string | undefined {
    return item[fieldName] ?? item[fieldName.toLowerCase()] ?? item[fieldName.toUpperCase()]
  }
}
