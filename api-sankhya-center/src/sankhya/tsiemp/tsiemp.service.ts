import { Injectable } from '@nestjs/common'
import { SankhyaApiService } from '../shared/sankhya-api.service'
import { trimStrings } from '../../common/utils/string.utils'

@Injectable()
export class TsiempService {
  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  async listAll(): Promise<any[]> {
    const query = `SELECT CODEMP, NOMEFANTASIA FROM TSIEMP ORDER BY CODEMP ASC`
    const response = await this.sankhyaApiService.executeQuery(query, [])
    return response.map((item: any) =>
      trimStrings({
        CODEMP: item.CODEMP,
        NOME: item.NOMEFANTASIA,
      }),
    )
  }
}
