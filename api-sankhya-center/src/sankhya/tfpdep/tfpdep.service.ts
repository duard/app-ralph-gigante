import { Injectable } from '@nestjs/common'
import { SankhyaBaseService } from '../../common/base/sankhya-base.service'
import { Tfpdep } from './models/tfpdep.interface'
import { TfpdepFindAllDto } from './models/tfpdep-find-all.dto'
import { trimStrings } from '../../common/utils/string.utils'

@Injectable()
export class TfpdepService extends SankhyaBaseService<Tfpdep> {
  getTableName(): string {
    return 'TFPDEP'
  }

  getPrimaryKey(): string {
    return 'CODDEP'
  }

  getRelationsQuery(): string {
    return 'LEFT JOIN TSICUS ON TFPDEP.CODCENCUS = TSICUS.CODCENCUS LEFT JOIN TGFPAR ON TFPDEP.CODPARC = TGFPAR.CODPARC LEFT JOIN TFPFIS ON TFPDEP.CODREGFIS = TFPFIS.CODREGFIS'
  }

  mapToEntity(item: any): Tfpdep {
    return {
      coddep: item.CODDEP,
      descrdep: item.DESCRDEP,
      dhalter: item.DHALTER,
      ativo: item.ATIVO,
      codcencus: item.CODCENCUS,
      descrcencus: item.DESCRCENCUS,
      coddeppai: item.CODDEPPAI,
      grau: item.GRAU,
      analitico: item.ANALITICO,
      codregfis: item.CODREGFIS,
      descrregfis: item.DESCRREGFIS,
      codparc: item.CODPARC,
      nomeparc: item.NOMEPARC,
      endereco: item.ENDERECO,
      tipponto: item.TIPPONTO,
      diaapuraponto: item.DIAAPURAPONTO,
      tiplotacao: item.TIPLOTACAO,
      usadoesocial: item.USADOESOCIAL,
      funcionariosCount: 0,
    }
  }

  buildWhere(dto: TfpdepFindAllDto): string {
    const whereClauses: string[] = []

    if (dto.descrdep) {
      whereClauses.push(`TFPDEP.DESCRDEP LIKE '%${dto.descrdep}%'`)
    }
    if (dto.ativo) {
      whereClauses.push(`TFPDEP.ATIVO = '${dto.ativo}'`)
    }
    if (dto.coddep) {
      whereClauses.push(`TFPDEP.CODDEP = ${dto.coddep}`)
    }
    if (dto.codcencus) {
      whereClauses.push(`TFPDEP.CODCENCUS = ${dto.codcencus}`)
    }
    if (dto.analitico) {
      whereClauses.push(`TFPDEP.ANALITICO = '${dto.analitico}'`)
    }

    return whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
  }

  async findAll(dto: TfpdepFindAllDto): Promise<any> {
    const where = this.buildWhere(dto)
    const sort = dto.sort || 'TFPDEP.CODDEP ASC'
    const offset = (dto.page - 1) * dto.perPage

    // Correct pagination for SQL Server
    const query = `
      SELECT TFPDEP.* 
      FROM TFPDEP 
      ${where} 
      ORDER BY ${sort}
      OFFSET ${offset} ROWS
      FETCH NEXT ${dto.perPage} ROWS ONLY
    `

    const response = await this.sankhyaApiService.executeQuery(query, [])

    let data: Tfpdep[] = response.map((item: any) =>
      trimStrings(this.mapToEntity(item)),
    )

    // Add employee count for each department
    for (const item of data) {
      const countQuery = `SELECT COUNT(*) as count FROM TFPFUN WHERE CODDEP = ${item.coddep} AND DTDEM IS NULL`
      const countResponse = await this.sankhyaApiService.executeQuery(
        countQuery,
        [],
      )
      item.funcionariosCount =
        countResponse.length > 0 ? countResponse[0].count : 0
    }

    data = data.map((item) => this.filterObjectKeys(item, dto.fields || '*'))

    const totalQuery = `SELECT COUNT(*) as total FROM TFPDEP ${where}`
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

  async findById(id: number): Promise<Tfpdep | null> {
    const query = `SELECT * FROM TFPDEP WHERE ${this.getPrimaryKey()} = ${id}`

    const response = await this.sankhyaApiService.executeQuery(query, [])

    if (response.length === 0) return null

    const entity = trimStrings(this.mapToEntity(response[0]))

    // Add employee count
    const countQuery = `SELECT COUNT(*) as count FROM TFPFUN WHERE CODDEP = ${entity.coddep} AND DTDEM IS NULL`
    const countResponse = await this.sankhyaApiService.executeQuery(
      countQuery,
      [],
    )
    entity.funcionariosCount =
      countResponse.length > 0 ? countResponse[0].count : 0

    return entity
  }

  async listAll(): Promise<any[]> {
    const query = `SELECT CODDEP, DESCRDEP FROM TFPDEP WHERE ATIVO = 'S' ORDER BY DESCRDEP ASC`
    const response = await this.sankhyaApiService.executeQuery(query, [])
    return response.map((item: any) =>
      trimStrings({
        CODDEP: item.CODDEP,
        DESCRDEP: item.DESCRDEP,
      }),
    )
  }
}
