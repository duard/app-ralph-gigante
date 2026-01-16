import { Injectable } from '@nestjs/common'
import { SankhyaApiService } from '../shared/sankhya-api.service'

@Injectable()
export class TgflocService {
  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  async findAll(params: { page: number; perPage: number; search?: string }) {
    const { page, perPage, search } = params
    const offset = (page - 1) * perPage

    let whereClause = '1=1'
    const queryParams: any[] = []

    if (search) {
      whereClause += ` AND (L.DESCRLOCAL LIKE @search OR CAST(L.CODLOCAL AS VARCHAR) LIKE @search)`
      queryParams.push({ name: 'search', value: `%${search}%` })
    }

    // Count query
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM TGFLOC L WITH(NOLOCK)
      WHERE ${whereClause}
    `

    const [countResult] = await this.sankhyaApiService.executeQuery(
      countQuery,
      queryParams,
    )
    const total = countResult?.total || 0

    // Data query - Simplificada sem campos customizados e sem JOIN
    const dataQuery = `
      SELECT
        L.CODLOCAL,
        L.DESCRLOCAL,
        L.ATIVO
      FROM TGFLOC L WITH(NOLOCK)
      WHERE ${whereClause}
      ORDER BY L.DESCRLOCAL
      OFFSET ${offset} ROWS
      FETCH NEXT ${perPage} ROWS ONLY
    `

    const data = await this.sankhyaApiService.executeQuery(dataQuery, queryParams)

    return {
      data,
      total,
      page,
      perPage,
      lastPage: Math.ceil(total / perPage),
    }
  }

  async findOne(codlocal: number) {
    const query = `
      SELECT
        L.CODLOCAL,
        L.DESCRLOCAL,
        L.ATIVO
      FROM TGFLOC L WITH(NOLOCK)
      WHERE L.CODLOCAL = @codlocal
    `

    const [result] = await this.sankhyaApiService.executeQuery(query, [
      { name: 'codlocal', value: codlocal },
    ])

    return result || null
  }
}
