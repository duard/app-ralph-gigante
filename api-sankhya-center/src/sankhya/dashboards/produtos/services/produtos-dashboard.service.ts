import { Injectable, Logger } from '@nestjs/common'
import { SankhyaApiService } from '../../../shared/sankhya-api.service'
import { ProdutoDashboard } from '../models/produto-dashboard.interface'
import { ProdutosFiltroDto } from '../models/produtos-filtro.dto'
import { ProdutosResumoDto } from '../models/produtos-resumo.dto'
import {
  PaginatedResult,
  buildPaginatedResult,
} from '../../../../common/pagination/pagination.types'

/**
 * Serviço para dashboard de produtos
 * Fornece microendpoints com informações úteis sobre produtos TGFPRO
 */
@Injectable()
export class ProdutosDashboardService {
  private readonly logger = new Logger(ProdutosDashboardService.name)

  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  /**
   * Obtém resumo geral dos produtos
   */
  async getResumoProdutos(): Promise<ProdutosResumoDto> {
    this.logger.log('📊 Gerando resumo de produtos')

    try {
      // Query para obter resumo básico
      const query = `
        SELECT
          COUNT(*) as totalProdutos,
          SUM(CASE WHEN ATIVO = 'S' THEN 1 ELSE 0 END) as totalAtivos,
          SUM(CASE WHEN ATIVO = 'N' THEN 1 ELSE 0 END) as totalInativos,
          GETDATE() as dataResumo
        FROM TGFPRO
      `

      const result = await this.sankhyaApiService.executeQuery(query, [])

      if (result && result.length > 0) {
        const row = result[0]
        return {
          totalProdutos: row.totalProdutos || 0,
          totalAtivos: row.totalAtivos || 0,
          totalInativos: row.totalInativos || 0,
          valorTotalEstoque: 0, // Seria calculado com dados de estoque
          quantidadeTotalEstoque: 0, // Seria calculado com dados de estoque
          produtosEstoqueBaixo: 0, // Seria calculado com dados de estoque
          dataResumo: new Date(row.dataResumo),
        }
      }

      return {
        totalProdutos: 0,
        totalAtivos: 0,
        totalInativos: 0,
        valorTotalEstoque: 0,
        quantidadeTotalEstoque: 0,
        produtosEstoqueBaixo: 0,
        dataResumo: new Date(),
      }
    } catch (error) {
      this.logger.error('❌ Erro ao gerar resumo de produtos:', error.message)
      throw new Error('Falha ao gerar resumo de produtos')
    }
  }

  /**
   * Obtém produtos com filtros avançados
   */
  async getProdutosComFiltros(
    filtro: ProdutosFiltroDto,
  ): Promise<ProdutoDashboard[]> {
    this.logger.log('🔍 Buscando produtos com filtros', JSON.stringify(filtro))

    try {
      // Construir query dinâmica com base nos filtros
      const whereClauses = []
      const params = []

      if (filtro.codprod) {
        whereClauses.push('CODPROD = ?')
        params.push(filtro.codprod)
      }

      if (filtro.descrprod) {
        whereClauses.push('DESCRPROD LIKE ?')
        params.push(`%${filtro.descrprod}%`)
      }

      if (filtro.referencia) {
        whereClauses.push('REFERENCIA LIKE ?')
        params.push(`%${filtro.referencia}%`)
      }

      if (filtro.ativo !== undefined) {
        whereClauses.push('ATIVO = ?')
        params.push(filtro.ativo ? 'S' : 'N')
      }

      if (filtro.codgrupoprod) {
        whereClauses.push('CODGRUPOPROD = ?')
        params.push(filtro.codgrupoprod)
      }

      if (filtro.dataInicial || filtro.dataFinal) {
        if (filtro.dataInicial && filtro.dataFinal) {
          whereClauses.push('DTALTER BETWEEN ? AND ?')
          params.push(filtro.dataInicial, filtro.dataFinal)
        } else if (filtro.dataInicial) {
          whereClauses.push('DTALTER >= ?')
          params.push(filtro.dataInicial)
        } else {
          whereClauses.push('DTALTER <= ?')
          params.push(filtro.dataFinal)
        }
      }

      const whereClause =
        whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

      const orderBy =
        (filtro as any).sort || (filtro as any).ordenacao || 'DESCRPROD ASC'
      const page = (filtro as any).pagina ?? (filtro as any).page ?? 1
      const perPage =
        (filtro as any).itensPorPagina ?? (filtro as any).perPage ?? 10
      const limit = perPage
      const offset = (page - 1) * limit

      const query = `
        SELECT TOP ${limit} 
          CODPROD, 
          DESCRPROD, 
          REFERENCIA, 
          ATIVO, 
          CODGRUPOPROD,
          DTALTER
        FROM TGFPRO
        ${whereClause}
        ORDER BY ${orderBy}
      `

      const result = await this.sankhyaApiService.executeQuery(query, params)

      // Mapear para o formato do dashboard
      return result.map((item) => ({
        codprod: item.CODPROD,
        descrprod: item.DESCRPROD,
        referencia: item.REFERENCIA,
        ativo: item.ATIVO,
        codgrupoprod: item.CODGRUPOPROD,
        dataUltimaAlteracao: new Date(item.DTALTER),
        produtoAtivo: item.ATIVO === 'S',
      }))
    } catch (error) {
      this.logger.error(
        '❌ Erro ao buscar produtos com filtros:',
        error.message,
      )
      throw new Error('Falha ao buscar produtos')
    }
  }

  /**
   * Obtém produtos com estoque baixo
   */
  async getProdutosEstoqueBaixo(
    limite: number = 5,
  ): Promise<ProdutoDashboard[]> {
    this.logger.log(
      `📉 Buscando produtos com estoque baixo (limite: ${limite})`,
    )

    try {
      // Esta query seria adaptada com os campos reais de estoque
      // Por enquanto, retornamos produtos ativos como exemplo
      const query = `
        SELECT TOP 20
          CODPROD, 
          DESCRPROD, 
          REFERENCIA, 
          ATIVO, 
          CODGRUPOPROD,
          DTALTER
        FROM TGFPRO
        WHERE ATIVO = 'S'
        ORDER BY DESCRPROD ASC
      `

      const result = await this.sankhyaApiService.executeQuery(query, [])

      return result.map((item) => ({
        codprod: item.CODPROD,
        descrprod: item.DESCRPROD,
        referencia: item.REFERENCIA,
        ativo: item.ATIVO,
        codgrupoprod: item.CODGRUPOPROD,
        dataUltimaAlteracao: new Date(item.DTALTER),
        produtoAtivo: item.ATIVO === 'S',
        estoqueBaixo: true, // Marcado como estoque baixo para exemplo
      }))
    } catch (error) {
      this.logger.error(
        '❌ Erro ao buscar produtos com estoque baixo:',
        error.message,
      )
      throw new Error('Falha ao buscar produtos com estoque baixo')
    }
  }

  /**
   * Obtém produtos por grupo
   */
  async getProdutosPorGrupo(codGrupo: number): Promise<ProdutoDashboard[]> {
    this.logger.log(`📋 Buscando produtos do grupo ${codGrupo}`)

    try {
      const query = `
        SELECT 
          CODPROD, 
          DESCRPROD, 
          REFERENCIA, 
          ATIVO, 
          CODGRUPOPROD,
          DTALTER
        FROM TGFPRO
        WHERE CODGRUPOPROD = ?
        ORDER BY DESCRPROD ASC
      `

      const result = await this.sankhyaApiService.executeQuery(query, [
        codGrupo,
      ])

      return result.map((item) => ({
        codprod: item.CODPROD,
        descrprod: item.DESCRPROD,
        referencia: item.REFERENCIA,
        ativo: item.ATIVO,
        codgrupoprod: item.CODGRUPOPROD,
        dataUltimaAlteracao: new Date(item.DTALTER),
        produtoAtivo: item.ATIVO === 'S',
      }))
    } catch (error) {
      this.logger.error(
        `❌ Erro ao buscar produtos do grupo ${codGrupo}:`,
        error.message,
      )
      throw new Error('Falha ao buscar produtos por grupo')
    }
  }

  /**
   * Obtém produtos mais recentes
   */
  async getProdutosRecentes(limite: number = 10): Promise<ProdutoDashboard[]> {
    this.logger.log(`🆕 Buscando ${limite} produtos mais recentes`)

    try {
      const query = `
        SELECT TOP ${limite}
          CODPROD, 
          DESCRPROD, 
          REFERENCIA, 
          ATIVO, 
          CODGRUPOPROD,
          DTALTER
        FROM TGFPRO
        WHERE ATIVO = 'S'
        ORDER BY DTALTER DESC
      `

      const result = await this.sankhyaApiService.executeQuery(query, [])

      return result.map((item) => ({
        codprod: item.CODPROD,
        descrprod: item.DESCRPROD,
        referencia: item.REFERENCIA,
        ativo: item.ATIVO,
        codgrupoprod: item.CODGRUPOPROD,
        dataUltimaAlteracao: new Date(item.DTALTER),
        produtoAtivo: item.ATIVO === 'S',
      }))
    } catch (error) {
      this.logger.error('❌ Erro ao buscar produtos recentes:', error.message)
      throw new Error('Falha ao buscar produtos recentes')
    }
  }

  /**
   * Busca produtos por descrição (autocomplete)
   */
  async buscarProdutosPorDescricao(
    termo: string,
    limite: number = 10,
  ): Promise<ProdutoDashboard[]> {
    this.logger.log(`🔍 Buscando produtos com "${termo}"`)

    try {
      const query = `
        SELECT TOP ${limite}
          CODPROD, 
          DESCRPROD, 
          REFERENCIA, 
          ATIVO, 
          CODGRUPOPROD,
          DTALTER
        FROM TGFPRO
        WHERE DESCRPROD LIKE ?
        ORDER BY DESCRPROD ASC
      `

      const result = await this.sankhyaApiService.executeQuery(query, [
        `%${termo}%`,
      ])

      return result.map((item) => ({
        codprod: item.CODPROD,
        descrprod: item.DESCRPROD,
        referencia: item.REFERENCIA,
        ativo: item.ATIVO,
        codgrupoprod: item.CODGRUPOPROD,
        dataUltimaAlteracao: new Date(item.DTALTER),
        produtoAtivo: item.ATIVO === 'S',
      }))
    } catch (error) {
      this.logger.error(
        '❌ Erro ao buscar produtos por descrição:',
        error.message,
      )
      throw new Error('Falha ao buscar produtos')
    }
  }

  /**
   * Obtém estatísticas de produtos por grupo
   */
  async getEstatisticasPorGrupo(): Promise<any[]> {
    this.logger.log('📊 Gerando estatísticas por grupo')

    try {
      const query = `
        SELECT
          CODGRUPOPROD,
          COUNT(*) as quantidade,
          SUM(CASE WHEN ATIVO = 'S' THEN 1 ELSE 0 END) as ativos
        FROM TGFPRO
        GROUP BY CODGRUPOPROD
        ORDER BY quantidade DESC
      `

      return await this.sankhyaApiService.executeQuery(query, [])
    } catch (error) {
      this.logger.error(
        '❌ Erro ao gerar estatísticas por grupo:',
        error.message,
      )
      throw new Error('Falha ao gerar estatísticas')
    }
  }

  /**
   * Obtém produtos com contestações
   */
  async getProdutosComContestacoes(): Promise<ProdutoDashboard[]> {
    this.logger.log('📋 Buscando produtos com contestações')

    try {
      const query = `
        SELECT 
          CODPROD, 
          DESCRPROD, 
          REFERENCIA, 
          ATIVO, 
          CODGRUPOPROD,
          DTALTER,
          TITCONTEST,
          LISCONTEST
        FROM TGFPRO
        WHERE TITCONTEST IS NOT NULL OR LISCONTEST IS NOT NULL
        ORDER BY DTALTER DESC
      `

      const result = await this.sankhyaApiService.executeQuery(query, [])

      return result.map((item) => ({
        codprod: item.CODPROD,
        descrprod: item.DESCRPROD,
        referencia: item.REFERENCIA,
        ativo: item.ATIVO,
        codgrupoprod: item.CODGRUPOPROD,
        dataUltimaAlteracao: new Date(item.DTALTER),
        produtoAtivo: item.ATIVO === 'S',
        tituloContestacao: item.TITCONTEST,
        listaContestacoes: item.LISCONTEST,
      }))
    } catch (error) {
      this.logger.error(
        '❌ Erro ao buscar produtos com contestações:',
        error.message,
      )
      throw new Error('Falha ao buscar produtos com contestações')
    }
  }

  /**
   * Obtém estatísticas de contestações
   */
  async getEstatisticasContestacoes(): Promise<any[]> {
    this.logger.log('📊 Gerando estatísticas de contestações')

    try {
      const query = `
        SELECT
          TITCONTEST as titulo,
          COUNT(*) as quantidade,
          SUM(CASE WHEN ATIVO = 'S' THEN 1 ELSE 0 END) as ativos
        FROM TGFPRO
        WHERE TITCONTEST IS NOT NULL
        GROUP BY TITCONTEST
        ORDER BY quantidade DESC
      `

      return await this.sankhyaApiService.executeQuery(query, [])
    } catch (error) {
      this.logger.error(
        '❌ Erro ao gerar estatísticas de contestações:',
        error.message,
      )
      throw new Error('Falha ao gerar estatísticas de contestações')
    }
  }

  /**
   * Obtém detalhes de contestações de um produto específico
   */
  async getContestacoesPorProduto(codprod: number): Promise<any> {
    this.logger.log(`🔍 Buscando contestações do produto ${codprod}`)

    try {
      const query = `
        SELECT 
          CODPROD, 
          DESCRPROD, 
          TITCONTEST as tituloContestacao,
          LISCONTEST as listaContestacoes,
          ATIVO,
          DTALTER as dataUltimaAlteracao
        FROM TGFPRO
        WHERE CODPROD = ?
      `

      const result = await this.sankhyaApiService.executeQuery(query, [codprod])

      if (result.length === 0) {
        return {
          codprod,
          mensagem: 'Produto não encontrado ou sem contestações',
        }
      }

      return {
        codprod: result[0].CODPROD,
        descrprod: result[0].DESCRPROD,
        tituloContestacao: result[0].tituloContestacao,
        listaContestacoes: result[0].listaContestacoes,
        produtoAtivo: result[0].ATIVO === 'S',
        dataUltimaAlteracao: new Date(result[0].dataUltimaAlteracao),
      }
    } catch (error) {
      this.logger.error(
        `❌ Erro ao buscar contestações do produto ${codprod}:`,
        error.message,
      )
      throw new Error('Falha ao buscar contestações do produto')
    }
  }
}
