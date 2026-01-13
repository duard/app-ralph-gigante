import { Injectable } from '@nestjs/common'
import { Tgfcab } from './models/tgfcab.interface'
import { TgfcabFindAllDto } from './models/tgfcab-find-all.dto'
import { SankhyaBaseService } from '../../common/base/sankhya-base.service'
import { PaginatedResult } from '../../common/pagination/pagination.types'
import { trimStrings } from '../../common/utils/string.utils'

/**
 * Serviço para TGFCAB - Cabeçalhos de Notas Fiscais
 * Fornece métodos para busca paginada e por ID, com suporte a filtros avançados e relações.
 */
@Injectable()
export class TgfcabService extends SankhyaBaseService<Tgfcab> {
  /**
   * Retorna o nome da tabela no Sankhya
   */
  getTableName(): string {
    return 'TGFCAB'
  }

  /**
   * Retorna a chave primária da tabela
   */
  getPrimaryKey(): string {
    return 'NUNOTA'
  }

  /**
   * Retorna a query de relações para JOINs
   */
  getRelationsQuery(): string {
    return `
      LEFT JOIN TGFTOP ON TGFCAB.CODTIPOPER = TGFTOP.CODTIPOPER
      LEFT JOIN TGFPAR ON TGFCAB.CODPARC = TGFPAR.CODPARC
      LEFT JOIN TGFVEN ON TGFCAB.CODVEND = TGFVEN.CODVEND
    `
  }

  /**
   * Busca paginada de cabeçalhos de notas com filtros avançados
   * @param dto Parâmetros de busca, paginação e filtros
   * @returns Resultado paginado com dados das notas
   */
  async findAll(dto: TgfcabFindAllDto): Promise<PaginatedResult<Tgfcab>> {
    const whereClauses: string[] = []

    if (dto.codtipoper) {
      whereClauses.push(`TGFCAB.CODTIPOPER = ${dto.codtipoper}`)
    }
    if (dto.codparc) {
      whereClauses.push(`TGFCAB.CODPARC = ${dto.codparc}`)
    }
    if (dto.codvend) {
      whereClauses.push(`TGFCAB.CODVEND = ${dto.codvend}`)
    }
    if (dto.statusnota) {
      whereClauses.push(`TGFCAB.STATUSNOTA = '${dto.statusnota}'`)
    }
    if (dto.dtneg) {
      whereClauses.push(`TGFCAB.DTNEG >= '${dto.dtneg}'`)
    }
    if (dto.vlrnotaMin) {
      whereClauses.push(`TGFCAB.VLRNOTA >= ${dto.vlrnotaMin}`)
    }
    if (dto.vlrnotaMax) {
      whereClauses.push(`TGFCAB.VLRNOTA <= ${dto.vlrnotaMax}`)
    }
    if (dto.tipmov) {
      whereClauses.push(`TGFCAB.TIPMOV = '${dto.tipmov}'`)
    }

    const where =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const query = `SELECT TOP ${dto.perPage || 10} * FROM TGFCAB ${where} ORDER BY ${dto.sort || 'NUNOTA DESC'}`

    const response = await this.sankhyaApiService.executeQuery(query, [])

    const data: Tgfcab[] = response.map((item: any) => {
      const lowered = this.lowercaseKeys(item)
      const entity = this.mapToEntity(lowered)
      const trimmed = trimStrings(entity)
      return this.filterObjectKeys(trimmed, dto.fields || '*')
    })

    const totalQuery = `SELECT COUNT(*) as total FROM TGFCAB ${where}`
    const totalResponse = await this.sankhyaApiService.executeQuery(
      totalQuery,
      [],
    )
    const total = totalResponse.length > 0 ? totalResponse[0].total : 0

    return this.buildPaginatedResult({
      data,
      total,
      page: dto.page || 1,
      perPage: dto.perPage || 10,
    })
  }

  /**
   * Busca uma nota específica por NUNOTA
   * @param id Número único da nota
   * @returns Dados da nota com relações, ou null se não encontrada
   */
  async findById(id: number): Promise<Tgfcab | null> {
    const query = `SELECT * FROM TGFCAB WHERE ${this.getPrimaryKey()} = ${id}`
    const response = await this.sankhyaApiService.executeQuery(query, [])
    if (response.length === 0) {
      return null
    }
    const lowered = this.lowercaseKeys(response[0])
    const entity = this.mapToEntity(lowered)
    const trimmed = trimStrings(entity)
    return trimmed
  }

  /**
   * Mapeia os dados brutos para a entidade Tgfcab, incluindo relações
   * @param item Dados brutos do Sankhya
   * @returns Entidade Tgfcab com relações aninhadas
   */
  mapToEntity(item: any): Tgfcab {
    const entity = item
    entity.tgftop = item.codtipoper
      ? { codtipoper: item.codtipoper, descrtipoper: item.descrtipoper || '' }
      : undefined
    entity.tgfpar = item.codparc
      ? { codparc: item.codparc, nomeparc: item.nomeparc || '' }
      : undefined
    entity.tgfven = item.codvend
      ? { codvend: item.codvend, nomevend: item.nomevend || '' }
      : undefined
    return entity as Tgfcab
  }
}
