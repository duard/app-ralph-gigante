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
      const allResults = await this.sankhyaApiService.executeQuery(query, [])
      const data = allResults
        .slice(offset, offset + perPage)
        .map((item: any) => this.mapOrdemServico(item))

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
    try {
      const [cabResult] = await this.sankhyaApiService.executeQuery(
        OSQueries.FIND_OS_BY_ID_QUERY,
        [{ name: 'nuos', value: nuos }],
      )

      if (!cabResult) {
        throw new NotFoundException(`Ordem de serviço ${nuos} não encontrada`)
      }

      const os = this.mapOrdemServicoDetalhada(cabResult)

      // Buscar serviços
      const servicos = await this.findServicos(nuos)
      // Buscar apontamentos
      const apontamentos = await this.findApontamentos(nuos)
      // Buscar produtos
      const produtos = await this.findProdutos(nuos)

      // Calcular totais
      const totalHorasHomem = apontamentos.reduce(
        (sum, a) => sum + (a.minutosTrabalhados || 0),
        0,
      )
      const totalHorasLiquidas = apontamentos.reduce(
        (sum, a) => sum + (a.minutosLiquidos || 0),
        0,
      )
      const totalCusto = produtos.reduce((sum, p) => sum + (p.vlrtot || 0), 0)

      return {
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
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      this.logger.error('Erro em findById:', (error as any)?.message || error)
      throw new InternalServerErrorException(
        'Erro ao buscar ordem de serviço',
      )
    }
  }

  /**
   * Busca serviços de uma OS
   */
  async findServicos(nuos: number): Promise<ServicoOS[]> {
    try {
      const results = await this.sankhyaApiService.executeQuery(
        OSQueries.FIND_SERVICOS_BY_OS_QUERY,
        [{ name: 'nuos', value: nuos }],
      )

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
      const results = await this.sankhyaApiService.executeQuery(
        OSQueries.FIND_APONTAMENTOS_BY_OS_QUERY,
        [{ name: 'nuos', value: nuos }],
      )

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
      const results = await this.sankhyaApiService.executeQuery(
        OSQueries.FIND_PRODUTOS_BY_OS_QUERY,
        [{ name: 'nuos', value: nuos }],
      )

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
      const [result] = await this.sankhyaApiService.executeQuery(
        OSQueries.GET_ESTATISTICAS_GERAL_QUERY,
        [
          { name: 'dataInicio', value: dataInicio },
          { name: 'dataFim', value: dataFim },
        ],
      )

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
        OSQueries.GET_PRODUTIVIDADE_EXECUTORES_QUERY,
        [
          { name: 'dataInicio', value: dataInicio },
          { name: 'dataFim', value: dataFim },
        ],
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
        OSQueries.GET_PRODUTOS_MAIS_UTILIZADOS_QUERY,
        [
          { name: 'dataInicio', value: dataInicio },
          { name: 'dataFim', value: dataFim },
        ],
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
}
