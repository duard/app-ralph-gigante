import { Injectable } from '@nestjs/common'
import { SankhyaApiService } from '../shared/sankhya-api.service'
import { ProdutoSimplesV2 } from './models/produtos-simples-v2.interface'
import { ProdutosSimplesV2FindAllDto } from './models/produtos-simples-v2-find-all.dto'

@Injectable()
export class ProdutosSimplesV2Service {
  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  async findAll(
    query: ProdutosSimplesV2FindAllDto,
  ): Promise<{ data: ProdutoSimplesV2[]; total: number; lastPage: number }> {
    const { search, page = 1, perPage = 20, sort = 'codprod asc' } = query

    // Escape search para evitar SQL injection
    const searchEscaped = search ? search.replace(/'/g, "''") : ''

    let whereSql = ''
    if (searchEscaped) {
      whereSql = ` WHERE UPPER(DESCRPROD) LIKE '%${searchEscaped.toUpperCase()}%'`
    }

    // Get total count
    const countSql = `SELECT COUNT(*) AS total FROM TGFPRO WITH (NOLOCK)${whereSql}`
    const countResult = await this.sankhyaApiService.executeQuery(countSql, [])
    const total = countResult[0]?.total || 0
    const lastPage = Math.ceil(total / perPage)

    // Pagination com OFFSET/FETCH (SQL Server 2012+)
    const offset = (page - 1) * perPage
    const dataSql = `
      SELECT CODPROD, DESCRPROD, ATIVO
      FROM TGFPRO WITH (NOLOCK)
      ${whereSql}
      ORDER BY ${sort}
      OFFSET ${offset} ROWS FETCH NEXT ${perPage} ROWS ONLY
    `

    const produtos = await this.sankhyaApiService.executeQuery(dataSql, [])

    const result: ProdutoSimplesV2[] = []

    for (const prod of produtos) {
      const codprod = prod.CODPROD
      const localizacao = await this.getLocalizacao(codprod)
      const valor_medio = await this.getValorMedio(codprod)
      const valor_ultima_compra = await this.getValorUltimaCompra(codprod)

      result.push({
        codprod,
        descrprod: prod.DESCRPROD,
        localizacao,
        valor_medio,
        valor_ultima_compra,
        ativo: prod.ATIVO,
      })
    }

    return { data: result, total, lastPage }
  }

  private async getLocalizacao(codprod: number): Promise<string> {
    const sql = `
      SELECT ISNULL(LOCALIZACAO, 'N/A') AS LOCALIZACAO
      FROM TGFPRO WITH (NOLOCK)
      WHERE CODPROD = ${codprod}
    `
    const result = await this.sankhyaApiService.executeQuery(sql, [])
    return result[0]?.LOCALIZACAO || 'N/A'
  }

  private async getValorMedio(codprod: number): Promise<number> {
    const sql = `
      SELECT AVG(ITE.VLRUNIT) AS VALOR_MEDIO
      FROM TGFCAB CAB WITH (NOLOCK)
      JOIN TGFITE ITE WITH (NOLOCK) ON CAB.NUNOTA = ITE.NUNOTA
      WHERE ITE.CODPROD = ${codprod} AND CAB.TIPMOV = 'C'
    `
    const result = await this.sankhyaApiService.executeQuery(sql, [])
    return result[0]?.VALOR_MEDIO || 0
  }

  private async getValorUltimaCompra(codprod: number): Promise<number> {
    const sql = `
      SELECT TOP 1 ITE.VLRUNIT AS VALOR_ULTIMA
      FROM TGFCAB CAB WITH (NOLOCK)
      JOIN TGFITE ITE WITH (NOLOCK) ON CAB.NUNOTA = ITE.NUNOTA
      WHERE ITE.CODPROD = ${codprod} AND CAB.TIPMOV = 'C'
      ORDER BY CAB.DTNEG DESC
    `
    const result = await this.sankhyaApiService.executeQuery(sql, [])
    return result[0]?.VALOR_ULTIMA || 0
  }
}
