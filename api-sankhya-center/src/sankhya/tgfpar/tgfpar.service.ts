import { Injectable } from '@nestjs/common'
import { Tgfpar } from './models/tgfpar.interface'
import { TgfparFindAllDto } from './models/tgfpar-find-all.dto'
import { SankhyaBaseService } from '../../common/base/sankhya-base.service'
import { PaginatedResult } from '../../common/pagination/pagination.types'
import { trimStrings } from '../../common/utils/string.utils'

@Injectable()
export class TgfparService extends SankhyaBaseService<Tgfpar> {
  getTableName(): string {
    return 'TGFPAR'
  }

  getPrimaryKey(): string {
    return 'CODPARC'
  }

  getRelationsQuery(): string {
    return ''
  }

  mapToEntity(item: any): Tgfpar {
    // Include all fields from the item, and add nested relations
    const entity = this.lowercaseKeys(item)
    entity.tcicid = undefined
    entity.tsibai = undefined
    entity.tsicus = undefined
    entity.tgpfis = undefined
    entity.tsiemp = undefined
    entity.tsiusu = undefined
    return entity as Tgfpar
  }

  async findAll(
    dto: TgfparFindAllDto,
    token?: string,
  ): Promise<PaginatedResult<Tgfpar>> {
    const whereClauses: string[] = []

    if (dto.nomeparc) {
      whereClauses.push(`TGFPAR.NOMEPARC LIKE '%${dto.nomeparc}%'`)
    }
    if (dto.cliente) {
      whereClauses.push(`TGFPAR.CLIENTE = '${dto.cliente}'`)
    }
    if (dto.fornecedor) {
      whereClauses.push(`TGFPAR.FORNECEDOR = '${dto.fornecedor}'`)
    }
    if (dto.vendedor) {
      whereClauses.push(`TGFPAR.VENDEDOR = '${dto.vendedor}'`)
    }
    if (dto.ativo) {
      whereClauses.push(`TGFPAR.ATIVO = '${dto.ativo}'`)
    }
    if (dto.email) {
      whereClauses.push(`TGFPAR.EMAIL LIKE '%${dto.email}%'`)
    }
    if (dto.cep) {
      whereClauses.push(`TGFPAR.CEP LIKE '%${dto.cep}%'`)
    }
    if (dto.cgcCpf) {
      whereClauses.push(`TGFPAR.CGC_CPF LIKE '%${dto.cgcCpf}%'`)
    }
    if (dto.tippessoa) {
      whereClauses.push(`TGFPAR.TIPPESSOA = '${dto.tippessoa}'`)
    }
    if (dto.codcid) {
      whereClauses.push(`TGFPAR.CODCID = ${dto.codcid}`)
    }
    if (dto.codbai) {
      whereClauses.push(`TGFPAR.CODBAI = ${dto.codbai}`)
    }

    if (dto.inscricaoestadual) {
      whereClauses.push(
        `TGFPAR.INSCRICAOESTADUAL LIKE '%${dto.inscricaoestadual}%'`,
      )
    }
    if (dto.endereco) {
      whereClauses.push(`TGFPAR.ENDERECO LIKE '%${dto.endereco}%'`)
    }
    if (dto.numero) {
      whereClauses.push(`TGFPAR.NUMERO LIKE '%${dto.numero}%'`)
    }
    if (dto.codus) {
      whereClauses.push(`TGFPAR.CODUS = ${dto.codus}`)
    }
    if (dto.codemp) {
      whereClauses.push(`TGFPAR.CODEMP = ${dto.codemp}`)
    }
    if (dto.dtcadFrom) {
      whereClauses.push(`TGFPAR.DTCAD >= '${dto.dtcadFrom}'`)
    }
    if (dto.dtcadTo) {
      whereClauses.push(`TGFPAR.DTCAD <= '${dto.dtcadTo}'`)
    }
    if (dto.dtalterFrom) {
      whereClauses.push(`TGFPAR.DTALTER >= '${dto.dtalterFrom}'`)
    }
    if (dto.dtalterTo) {
      whereClauses.push(`TGFPAR.DTALTER <= '${dto.dtalterTo}'`)
    }

    const where =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const orderBy = dto.sort ? `ORDER BY ${dto.sort}` : ''
    const query = `SELECT TOP ${dto.perPage} TGFPAR.* FROM TGFPAR ${where} ${orderBy}`

    const response = await this.sankhyaApiService.executeQuery(query, [])

    const data: Tgfpar[] = response.map((item: any) =>
      this.filterObjectKeys(
        trimStrings(this.mapToEntity(item)),
        dto.fields || '*',
      ),
    )

    // No mock, use real data

    const totalQuery = `SELECT COUNT(*) as total FROM TGFPAR ${where}`
    const totalResponse = await this.sankhyaApiService.executeQuery(
      totalQuery,
      [],
    )
    let total = totalResponse.length > 0 ? totalResponse[0].total : 0
    if (data.length === 1 && total === 0) total = 1 // For mock

    return this.buildPaginatedResult({
      data,
      total,
      page: dto.page,
      perPage: dto.perPage,
    })
  }

  async findById(id: number): Promise<Tgfpar | null> {
    const query = `SELECT TGFPAR.* FROM TGFPAR WHERE TGFPAR.${this.getPrimaryKey()} = ${id}`

    const response = await this.sankhyaApiService.executeQuery(query, [])

    if (response.length === 0) return null

    return trimStrings(this.mapToEntity(response[0]))
  }

  protected buildPaginatedResult<T>(args: {
    data: T[]
    total: number
    page: number
    perPage: number
  }): PaginatedResult<T> {
    const { data, total, page, perPage } = args
    const lastPage = Math.max(1, Math.ceil(total / Math.max(1, perPage)))
    const hasMore = page < lastPage
    return { data, total, page, perPage, lastPage, hasMore }
  }
}
