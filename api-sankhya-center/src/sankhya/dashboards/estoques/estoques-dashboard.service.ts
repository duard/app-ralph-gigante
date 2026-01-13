import { Injectable } from '@nestjs/common'
import { SankhyaBaseService } from '../../../common/base/sankhya-base.service'

@Injectable()
export class EstoquesDashboardService extends SankhyaBaseService<any> {
  getTableName(): string {
    return 'TGFEST'
  }

  getPrimaryKey(): string {
    return 'CODPROD'
  }

  getRelationsQuery(): string {
    return ''
  }

  mapToEntity(item: any): any {
    return item
  }

  async getOverview() {
    const resumoQuery = `
      SELECT
        COUNT(DISTINCT CODPROD) as total_produtos,
        SUM(ESTOQUE) as total_quantidade,
        AVG(ESTOQUE) as media_estoque,
        COUNT(CASE WHEN ESTOQUE = 0 THEN 1 END) as sem_estoque,
        COUNT(CASE WHEN ESTOQUE <= ESTMIN THEN 1 END) as abaixo_minimo,
        COUNT(CASE WHEN ESTOQUE <= 5 THEN 1 END) as baixo_estoque
      FROM TGFEST
      WHERE ATIVO = 'S'
    `

    const gruposQuery = `
      SELECT TOP 10
        TGFGRU.DESCRGRUPOPROD as grupo,
        COUNT(DISTINCT TGFEST.CODPROD) as produtos,
        SUM(TGFEST.ESTOQUE) as quantidade,
        AVG(TGFEST.ESTMIN) as media_minimo,
        COUNT(CASE WHEN TGFEST.ESTOQUE <= TGFEST.ESTMIN THEN 1 END) as abaixo_minimo
      FROM TGFEST
      LEFT JOIN TGFPRO ON TGFEST.CODPROD = TGFPRO.CODPROD
      LEFT JOIN TGFGRU ON TGFPRO.CODGRUPOPROD = TGFGRU.CODGRUPOPROD
      WHERE TGFEST.ATIVO = 'S'
      GROUP BY TGFGRU.DESCRGRUPOPROD
      ORDER BY quantidade DESC
    `

    const locaisQuery = `
      SELECT TOP 10
        CODLOCAL,
        COUNT(DISTINCT CODPROD) as produtos,
        SUM(ESTOQUE) as quantidade,
        AVG(ESTMIN) as media_minimo,
        COUNT(CASE WHEN ESTOQUE <= ESTMIN THEN 1 END) as abaixo_minimo
      FROM TGFEST
      WHERE ATIVO = 'S'
      GROUP BY CODLOCAL
      ORDER BY quantidade DESC
    `

    const [resumo, grupos, locais] = await Promise.all([
      this.sankhyaApiService.executeQuery(resumoQuery, []),
      this.sankhyaApiService.executeQuery(gruposQuery, []),
      this.sankhyaApiService.executeQuery(locaisQuery, []),
    ])

    return {
      resumo: resumo[0],
      topGrupos: grupos,
      topLocais: locais,
    }
  }

  async getGrupos() {
    const query = `
      SELECT
        TGFGRU.CODGRUPOPROD,
        TGFGRU.DESCRGRUPOPROD as nome,
        COUNT(DISTINCT TGFEST.CODPROD) as total_produtos,
        SUM(TGFEST.ESTOQUE) as total_estoque,
        AVG(TGFEST.ESTOQUE) as media_estoque,
        AVG(TGFEST.ESTMIN) as media_minimo,
        COUNT(CASE WHEN TGFEST.ESTOQUE = 0 THEN 1 END) as sem_estoque,
        COUNT(CASE WHEN TGFEST.ESTOQUE <= TGFEST.ESTMIN THEN 1 END) as abaixo_minimo
      FROM TGFEST
      LEFT JOIN TGFPRO ON TGFEST.CODPROD = TGFPRO.CODPROD
      LEFT JOIN TGFGRU ON TGFPRO.CODGRUPOPROD = TGFGRU.CODGRUPOPROD
      WHERE TGFEST.ATIVO = 'S'
      GROUP BY TGFGRU.CODGRUPOPROD, TGFGRU.DESCRGRUPOPROD
      ORDER BY total_estoque DESC
    `
    return this.sankhyaApiService.executeQuery(query, [])
  }

  async getLocais() {
    const query = `
      SELECT
        CODLOCAL,
        COUNT(DISTINCT CODPROD) as total_produtos,
        SUM(ESTOQUE) as total_estoque,
        AVG(ESTOQUE) as media_estoque,
        AVG(ESTMIN) as media_minimo,
        COUNT(CASE WHEN ESTOQUE = 0 THEN 1 END) as sem_estoque,
        COUNT(CASE WHEN ESTOQUE <= ESTMIN THEN 1 END) as abaixo_minimo,
        COUNT(CASE WHEN ESTOQUE <= 5 THEN 1 END) as baixo_estoque
      FROM TGFEST
      WHERE ATIVO = 'S'
      GROUP BY CODLOCAL
      ORDER BY total_estoque DESC
    `
    return this.sankhyaApiService.executeQuery(query, [])
  }

  async getAlertas() {
    const semEstoqueQuery = `
      SELECT TOP 20
        TGFEST.CODPROD,
        TGFPRO.DESCRPROD,
        TGFEST.ESTOQUE,
        TGFEST.ESTMIN,
        TGFEST.ESTMAX,
        TGFEST.CODLOCAL,
        'Sem Estoque' as tipo_alerta
      FROM TGFEST
      LEFT JOIN TGFPRO ON TGFEST.CODPROD = TGFPRO.CODPROD
      WHERE TGFEST.ATIVO = 'S' AND TGFEST.ESTOQUE = 0
      ORDER BY TGFEST.ESTMIN DESC
    `

    const baixoEstoqueQuery = `
      SELECT TOP 20
        TGFEST.CODPROD,
        TGFPRO.DESCRPROD,
        TGFEST.ESTOQUE,
        TGFEST.ESTMIN,
        TGFEST.ESTMAX,
        TGFEST.CODLOCAL,
        'Baixo Estoque' as tipo_alerta
      FROM TGFEST
      LEFT JOIN TGFPRO ON TGFEST.CODPROD = TGFPRO.CODPROD
      WHERE TGFEST.ATIVO = 'S' AND TGFEST.ESTOQUE > 0 AND TGFEST.ESTOQUE <= TGFEST.ESTMIN
      ORDER BY (TGFEST.ESTMIN - TGFEST.ESTOQUE) DESC
    `

    const [semEstoque, baixoEstoque] = await Promise.all([
      this.sankhyaApiService.executeQuery(semEstoqueQuery, []),
      this.sankhyaApiService.executeQuery(baixoEstoqueQuery, []),
    ])

    return {
      semEstoque,
      baixoEstoque,
      totalAlertas: semEstoque.length + baixoEstoque.length,
    }
  }

  async getTendencias() {
    const query = `
      SELECT
        COUNT(CASE WHEN ESTOQUE = 0 THEN 1 END) * 100.0 / COUNT(*) as perc_sem_estoque,
        COUNT(CASE WHEN ESTOQUE <= ESTMIN THEN 1 END) * 100.0 / COUNT(*) as perc_abaixo_minimo,
        AVG(ESTOQUE) as media_estoque_atual,
        AVG(ESTMIN) as media_minimo
      FROM TGFEST
      WHERE ATIVO = 'S'
    `
    const result = await this.sankhyaApiService.executeQuery(query, [])
    return {
      metricas: result[0],
      tendencias: [
        { periodo: 'Atual', mediaEstoque: result[0].media_estoque_atual },
      ],
    }
  }
}
