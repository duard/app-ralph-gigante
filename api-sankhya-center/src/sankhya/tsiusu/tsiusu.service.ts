import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { SankhyaApiService } from '../shared/sankhya-api.service'

@Injectable()
export class TsiusuService {
  private readonly logger = new Logger(TsiusuService.name)

  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  async listAll(): Promise<any[]> {
    const query = `
            SELECT CODUSU, NOMEUSU, CODEMP 
            FROM TSIUSU 
            WHERE ATIVO = 'S' 
            ORDER BY NOMEUSU ASC
        `
    return this.sankhyaApiService.executeQuery(query, [])
  }

  async findAll(limit: number = 100): Promise<any[]> {
    const query = `SELECT TOP ${limit} * FROM TSIUSU ORDER BY NOMEUSU`
    return this.sankhyaApiService.executeQuery(query, [])
  }

  async findOne(codusu: number): Promise<any> {
    const query = 'SELECT * FROM TSIUSU WHERE CODUSU = @param1'
    const results = await this.sankhyaApiService.executeQuery(query, [codusu])

    if (!results || results.length === 0) {
      throw new NotFoundException(`Usuário com código ${codusu} não encontrado`)
    }

    return results[0]
  }

  async findByUsername(nomeusu: string): Promise<any> {
    const query = 'SELECT * FROM TSIUSU WHERE NOMEUSU = @param1'
    const results = await this.sankhyaApiService.executeQuery(query, [nomeusu])

    if (!results || results.length === 0) {
      return null
    }

    return results[0]
  }
}
