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

    let sql = `
      SELECT CODPROD, DESCRPROD, ATIVO
      FROM TGFPRO
    `

    const params: any[] = []

    if (search) {
      sql += ` WHERE UPPER(DESCRPROD) LIKE UPPER(?)`
      params.push(`%${search}%`)
    }

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM (${sql})`
    const countResult = await this.sankhyaApiService.executeQuery(
      countSql,
      params,
    )
    const total = countResult[0]?.TOTAL || 0
    const lastPage = Math.ceil(total / perPage)

    sql += ` ORDER BY ${sort}`

    // Pagination
    const offset = (page - 1) * perPage
    sql += ` OFFSET ${offset} ROWS FETCH NEXT ${perPage} ROWS ONLY`

    const produtos = await this.sankhyaApiService.executeQuery(sql, params)

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
      SELECT NVL(LOC.CODLOCAL || ' - ' || LOC.DESCRLOCAL, 'N/A') AS LOCALIZACAO
      FROM TGFPRO PRO
      LEFT JOIN TGFLOC LOC ON PRO.CODLOCAL = LOC.CODLOCAL
      WHERE PRO.CODPROD = ?
    `
    const result = await this.sankhyaApiService.executeQuery(sql, [codprod])
    return result[0]?.LOCALIZACAO || 'N/A'
  }

  private async getValorMedio(codprod: number): Promise<number> {
    const sql = `
      SELECT AVG(ITE.VLRUNIT) AS VALOR_MEDIO
      FROM TGFCAB CAB
      JOIN TGFITE ITE ON CAB.NUNOTA = ITE.NUNOTA
      WHERE ITE.CODPROD = ? AND CAB.TIPMOV = 'C'
    `
    const result = await this.sankhyaApiService.executeQuery(sql, [codprod])
    return result[0]?.VALOR_MEDIO || 0
  }

  private async getValorUltimaCompra(codprod: number): Promise<number> {
    const sql = `
      SELECT ITE.VLRUNIT AS VALOR_ULTIMA
      FROM TGFCAB CAB
      JOIN TGFITE ITE ON CAB.NUNOTA = ITE.NUNOTA
      WHERE ITE.CODPROD = ? AND CAB.TIPMOV = 'C'
      ORDER BY CAB.DTNEG DESC
      FETCH FIRST 1 ROW ONLY
    `
    const result = await this.sankhyaApiService.executeQuery(sql, [codprod])
    return result[0]?.VALOR_ULTIMA || 0
  }
}
