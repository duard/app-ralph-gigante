import { Injectable } from '@nestjs/common'
import { SankhyaBaseService } from '../../common/base/sankhya-base.service'
import { Tfpcar } from './models/tfpcar.interface'
import { TfpcarFindAllDto } from './models/tfpcar-find-all.dto'
import { trimStrings } from '../../common/utils/string.utils'

@Injectable()
export class TfpcarService extends SankhyaBaseService<Tfpcar> {
  getTableName(): string {
    return 'TFPCAR'
  }

  async listAll(): Promise<any[]> {
    const query = `SELECT CODCARGO, DESCRCARGO FROM TFPCAR WHERE ATIVO = 'S' ORDER BY DESCRCARGO ASC`
    return this.sankhyaApiService.executeQuery(query, [])
  }

  getPrimaryKey(): string {
    return 'CODCARGO'
  }

  getRelationsQuery(): string {
    return ''
  }

  mapToEntity(item: any): Tfpcar {
    return {
      codcargo: item.CODCARGO,
      descrcargo: item.DESCRCARGO,
      dtalter: item.DTALTER,
      ativo: item.ATIVO,
      codgrupocargo: item.CODGRUPOCARGO,
      contagemtempo: item.CONTAGEMTEMPO,
      dedicacaoexc: item.DEDICACAOEXC,
      origativ: item.ORIGATIV,
      aposentaesp: item.APOSENTAESP,
      possuinivel: item.POSSUINIVEL,
      usadoesocial: item.USADOESOCIAL,
      tfpgca: item.TFPGCA,
      funcionariosCount: 0,
    } as any
  }

  async findAll(dto: TfpcarFindAllDto): Promise<any> {
    const whereClauses: string[] = []

    if (dto.descrcargo) {
      whereClauses.push(`DESCRCARGO LIKE '%${dto.descrcargo}%'`)
    }
    if (dto.ativo) {
      whereClauses.push(`ATIVO = '${dto.ativo}'`)
    }
    if (dto.codgrupocargo) {
      whereClauses.push(`CODGRUPOCARGO = ${dto.codgrupocargo}`)
    }

    const where =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const query = `SELECT TOP ${dto.perPage} * FROM TFPCAR ${where}`

    const response = await this.sankhyaApiService.executeQuery(query, [])

    const data: Tfpcar[] = response.map((item: any) =>
      trimStrings(this.mapToEntity(item)),
    )

    const totalQuery = `SELECT COUNT(*) as total FROM TFPCAR ${where}`
    const totalResponse = await this.sankhyaApiService.executeQuery(
      totalQuery,
      [],
    )
    const total = totalResponse.length > 0 ? totalResponse[0].total : 0

    return this.buildPaginatedResult({
      data,
      total,
      page: dto.page,
      perPage: dto.perPage,
    })
  }

  async findById(id: number): Promise<Tfpcar | null> {
    const query = `SELECT * FROM TFPCAR WHERE ${this.getPrimaryKey()} = ${id}`

    const response = await this.sankhyaApiService.executeQuery(query, [])

    if (response.length === 0) return null

    const entity = trimStrings(this.mapToEntity(response[0]))

    return entity
  }
}
