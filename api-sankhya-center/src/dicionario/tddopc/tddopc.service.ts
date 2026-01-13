import { Injectable } from '@nestjs/common'
import { Tddopc } from './models/tddopc.interface'
import { TddopcFindAllDto } from './models/tddopc-find-all.dto'
import { SankhyaApiService } from '../../sankhya/shared/sankhya-api.service'

type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  perPage: number
  lastPage: number
  hasMore: boolean
}

@Injectable()
export class TddopcService {
  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  private mapToEntity(item: any): Tddopc {
    return {
      nucampo: item.NUCAMPO,
      valor: item.VALOR,
      opcao: item.OPCAO,
      padrao: item.PADRAO,
      ordem: item.ORDEM,
      controle: item.CONTROLE,
      domain: item.DOMAIN,
    }
  }

  async findAll(dto: TddopcFindAllDto): Promise<PaginatedResult<Tddopc>> {
    const whereClauses: string[] = []

    if (dto.nucampo !== undefined) {
      whereClauses.push(`TDDOPC.NUCAMPO = ${dto.nucampo}`)
    }
    if (dto.valor) {
      whereClauses.push(`TDDOPC.VALOR LIKE '%${dto.valor}%'`)
    }
    if (dto.opcao) {
      whereClauses.push(`TDDOPC.OPCAO LIKE '%${dto.opcao}%'`)
    }
    if (dto.padrao) {
      whereClauses.push(`TDDOPC.PADRAO = '${dto.padrao}'`)
    }

    const where =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const sort = dto.sort || 'TDDOPC.NUCAMPO ASC, TDDOPC.VALOR ASC'
    const limit = dto.perPage || 10
    const offset = ((dto.page || 1) - 1) * limit

    const query = `
      SELECT TOP ${limit} TDDOPC.*
      FROM TDDOPC
      ${where}
      ORDER BY ${sort}
    `

    const countQuery = `SELECT COUNT(*) as total FROM TDDOPC ${where}`

    const [dataResult, countResult] = await Promise.all([
      this.sankhyaApiService.executeQuery(query, []),
      this.sankhyaApiService.executeQuery(countQuery, []),
    ])

    const data = dataResult.map(this.mapToEntity)
    const total = countResult[0]?.TOTAL || 0
    const lastPage = Math.ceil(total / limit)
    const hasMore = (dto.page || 1) < lastPage

    return {
      data,
      total,
      page: dto.page || 1,
      perPage: limit,
      lastPage,
      hasMore,
    }
  }

  async findById(nucampo: number, valor: string): Promise<Tddopc | null> {
    const query = `SELECT * FROM TDDOPC WHERE NUCAMPO = ${nucampo} AND VALOR = '${valor}'`
    const results = await this.sankhyaApiService.executeQuery(query, [])
    return results.length > 0 ? this.mapToEntity(results[0]) : null
  }

  async findByTable(nomeTabela: string): Promise<Tddopc[]> {
    // First get all nucampo from TDDCAM for the table
    const nucampoQuery = `SELECT DISTINCT NUCAMPO FROM TDDCAM WHERE NOMETAB = '${nomeTabela}'`
    const nucampoResults = await this.sankhyaApiService.executeQuery(
      nucampoQuery,
      [],
    )
    const nucampos = nucampoResults.map((item) => item.NUCAMPO).filter((n) => n)

    if (nucampos.length === 0) return []

    // Then get options for those nucampos
    const nucampoList = nucampos.join(',')
    const query = `SELECT * FROM TDDOPC WHERE NUCAMPO IN (${nucampoList}) ORDER BY NUCAMPO, ORDEM`
    const results = await this.sankhyaApiService.executeQuery(query, [])
    return results.map(this.mapToEntity)
  }
}
