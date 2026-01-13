import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { trimStrings } from '../../common/utils/string.utils'
import { AuthService } from '../auth/auth.service'
import { SankhyaTokenCacheService } from './sankhya-token-cache.service'

@Injectable()
export class SankhyaApiService {
  private readonly logger = new Logger(SankhyaApiService.name)
  private sankhyaToken: string | null = null
  private sankhyaTokenExpiry: Date | null = null
  private currentUserId: string | null = null

  constructor(
    private readonly httpService: HttpService,
    private readonly tokenCacheService: SankhyaTokenCacheService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private get sankhyaApiBaseUrl(): string {
    return (
      this.configService.get<string>('SANKHYA_API_BASE_URL') ||
      'https://api-nestjs-sankhya-read-producao.gigantao.net'
    )
  }

  /**
   * Extrai mensagem de erro clara da resposta de erro
   */
  private extractErrorMessage(error: any, context: string): string {
    if (error.response) {
      const status = error.response.status
      const data = error.response.data

      if (status === 401) {
        return 'Credenciais inválidas - verifique usuário e senha'
      }
      if (status === 403) {
        return 'Acesso proibido - usuário sem permissões'
      }
      if (status === 429) {
        return 'Muitas tentativas - aguarde antes de tentar novamente'
      }
      if (status >= 500) {
        return 'Erro interno do servidor Sankhya - tente novamente'
      }

      // Extrai mensagem específica se disponível
      if (data?.message) {
        return data.message
      }
      if (data?.error) {
        return data.error
      }
      if (typeof data === 'string') {
        return data
      }

      return `Erro HTTP ${status} no ${context}`
    }

    if (error.code === 'ECONNREFUSED') {
      return 'Não foi possível conectar à API Sankhya - verifique conectividade'
    }

    if (error.code === 'ETIMEDOUT') {
      return 'Timeout na conexão com API Sankhya - tente novamente'
    }

    return error.message || 'Erro desconhecido'
  }

  /**
   * Faz login na API Sankhya externa com credenciais do usuário
   * @param username - Nome de usuário Sankhya
   * @param password - Senha Sankhya
   * @returns Token de acesso da API Sankhya
   */
  async authenticateWithSankhya(
    username: string,
    password: string,
  ): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post('/auth/login', {
          username,
          password,
        }),
      )

      const token = response.data.access_token
      this.sankhyaToken = token
      // Token expira em 1 hora (segundo payload do JWT)
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString(),
      )
      this.sankhyaTokenExpiry = new Date(payload.exp * 1000)

      this.logger.log('✅ Autenticação na API Sankhya realizada com sucesso')
      return token
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error, 'autenticação')
      this.logger.error(
        '❌ Falha na autenticação da API Sankhya:',
        errorMessage,
      )
      throw new Error(`Autenticação falhou: ${errorMessage}`)
    }
  }

  /**
   * Verifica se o token Sankhya é válido
   */
  private isSankhyaTokenValid(): boolean {
    return !!(
      this.sankhyaToken &&
      this.sankhyaTokenExpiry &&
      new Date() < this.sankhyaTokenExpiry
    )
  }

  /**
   * Define o token Sankhya a partir do JWT da nossa API
   */
  async setSankhyaTokenFromJwt(jwtPayload: any): Promise<void> {
    if (jwtPayload.sankhyaToken) {
      this.sankhyaToken = jwtPayload.sankhyaToken
      this.currentUserId = jwtPayload.sub?.toString() || jwtPayload.username

      // Decodifica a expiração do token Sankhya
      const payload = JSON.parse(
        Buffer.from(this.sankhyaToken.split('.')[1], 'base64').toString(),
      )
      this.sankhyaTokenExpiry = new Date(payload.exp * 1000)

      // Cachear o token para o usuário
      if (this.currentUserId) {
        await this.tokenCacheService.setToken(
          this.currentUserId,
          this.sankhyaToken,
          this.sankhyaTokenExpiry,
        )
      }
    }
  }

  /**
   * Obtém token Sankhya válido com renovação automática
   */
  private async getValidSankhyaToken(): Promise<string> {
    // Verificar se temos um token válido em memória
    if (this.isSankhyaTokenValid()) {
      return this.sankhyaToken
    }

    // Tentar obter do cache se não tiver em memória
    if (this.currentUserId) {
      const cachedToken = await this.tokenCacheService.getValidToken(
        this.currentUserId,
      )
      if (cachedToken) {
        this.sankhyaToken = cachedToken
        // Atualizar expiração do token em memória
        const tokenInfo = await this.tokenCacheService.getTokenInfo(
          this.currentUserId,
        )
        if (tokenInfo) {
          this.sankhyaTokenExpiry = tokenInfo.expiry
        }
        return this.sankhyaToken
      }
    }

    // Se não temos token válido, tentar renovar automaticamente
    if (this.currentUserId) {
      this.logger.log(
        `🔄 Tentando renovar token para usuário ${this.currentUserId}`,
      )
      try {
        // Para renovação, precisamos das credenciais. Por enquanto, usamos credenciais padrão
        // Em produção, isso deveria ser configurável ou usar refresh tokens
        const newToken = await this.authService.refreshToken(
          'CONVIDADO',
          'guest123',
        )

        // Atualizar token em memória e cache
        this.sankhyaToken = newToken
        const payload = JSON.parse(
          Buffer.from(this.sankhyaToken.split('.')[1], 'base64').toString(),
        )
        this.sankhyaTokenExpiry = new Date(payload.exp * 1000)

        // Cachear o novo token
        await this.tokenCacheService.setToken(
          this.currentUserId,
          this.sankhyaToken,
          this.sankhyaTokenExpiry,
        )

        this.logger.log(
          `🔐 Token renovado com sucesso para usuário ${this.currentUserId}`,
        )
        return this.sankhyaToken
      } catch (error) {
        this.logger.error(
          `❌ Falha ao renovar token para usuário ${this.currentUserId}: ${error.message}`,
        )
        throw new Error(
          'Token Sankhya expirado e renovação falhou. Faça login novamente.',
        )
      }
    }

    throw new Error(
      'Token Sankhya expirado ou não encontrado. Faça login novamente.',
    )
  }

  async executeQuery(query: string, params: any[] = []): Promise<any[]> {
    // Validação de segurança: apenas queries SELECT são permitidas
    this.validateQuery(query)

    const token = await this.getValidSankhyaToken()
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }

    try {
      this.logger.log('Preparando para executar query...')

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.sankhyaApiBaseUrl}/inspection/query`,
          { query, params },
          { headers },
        ),
      )

      // A API externa retorna a resposta no formato:
      // {
      //   query: string,
      //   originalQuery: string,
      //   params: any[],
      //   data: any[],  // <- Os resultados estão aqui
      //   rowCount: number
      // }

      // Extrair os dados do campo 'data' da resposta
      const responseData = response.data
      const data = responseData.data || []

      // Aplicar trim nas strings retornadas
      const processedData = Array.isArray(data)
        ? data.map((item) => trimStrings(item))
        : []

      return processedData
    } catch (error) {
      this.logger.log(JSON.stringify(error))
      // Tenta extrair detalhes do erro SQL se disponíveis
      let sqlErrorDetails = ''
      if (error.response && error.response.data) {
        const errData = error.response.data
        if (errData.message && typeof errData.message === 'string') {
          sqlErrorDetails += ` | message: ${errData.message}`
        }
        if (errData.error && typeof errData.error === 'string') {
          sqlErrorDetails += ` | error: ${errData.error}`
        }
        if (errData.sqlMessage) {
          sqlErrorDetails += ` | sqlMessage: ${errData.sqlMessage}`
        }
        if (errData.number) {
          sqlErrorDetails += ` | number: ${errData.number}`
        }
        if (errData.lineNumber) {
          sqlErrorDetails += ` | lineNumber: ${errData.lineNumber}`
        }
        if (errData.procName) {
          sqlErrorDetails += ` | procName: ${errData.procName}`
        }
      }
      const errorMessage = this.extractErrorMessage(error, 'execução de query')
      this.logger.error(
        '❌ Falha na execução de query:',
        errorMessage,
        sqlErrorDetails,
      )
      throw new Error(`Query falhou: ${errorMessage}${sqlErrorDetails}`)
    }
  }

  /**
   * Valida se a query é segura (apenas SELECT sem campos proibidos)
   * @param query - Query SQL a ser validada
   */
  private validateQuery(query: string): void {
    if (!query) {
      throw new Error('Query não pode ser vazia')
    }

    const trimmedQuery = query.trim().toUpperCase()

    // Lista de comandos proibidos
    const forbiddenCommands = [
      'INSERT',
      'UPDATE',
      'DELETE',
      'CREATE',
      'DROP',
      'ALTER',
      'TRUNCATE',
      'MERGE',
      'EXEC',
      'EXECUTE',
      'BULK',
      'BACKUP',
      'RESTORE',
      'GRANT',
      'REVOKE',
      'DENY',
    ]

    // Lista de campos proibidos (dados binários grandes)
    const forbiddenFields = [
      'IMAGEM',
      'FOTO',
      'PHOTO',
      'PICTURE',
      'IMAGE',
      'BLOB',
      'BINARY',
      'VARBINARY',
    ]

    // Verificar se começa com comando proibido
    for (const command of forbiddenCommands) {
      if (trimmedQuery.startsWith(command + ' ')) {
        throw new Error(
          `Comando '${command}' não é permitido. Apenas consultas SELECT são autorizadas.`,
        )
      }
    }

    // Verificar se começa com SELECT ou WITH (CTE) - aceitar qualquer whitespace (inclui newline)
    if (!/^(SELECT|WITH)\b/.test(trimmedQuery)) {
      throw new Error('Apenas consultas SELECT são permitidas')
    }

    // Verificar se contém comandos destrutivos em subqueries ou outros contextos
    for (const command of forbiddenCommands) {
      const pattern1 = new RegExp(`\\b${command}\\b`, 'i')
      const pattern2 = new RegExp(`;\\s*${command}\\b`, 'i')
      if (pattern1.test(trimmedQuery) || pattern2.test(trimmedQuery)) {
        throw new Error(
          `Comando '${command}' detectado na query. Apenas SELECT é permitido.`,
        )
      }
    }

    // Verificar se contém campos proibidos (SELECT * ou campos específicos)
    // Aceita espaços ou novas linhas entre SELECT e *
    if (/\bSELECT\s+\*/i.test(trimmedQuery)) {
      throw new Error(
        'SELECT * não é permitido. Especifique os campos desejados explicitamente.',
      )
    }

    // Verificar campos proibidos na seleção
    for (const field of forbiddenFields) {
      if (
        trimmedQuery.includes(` ${field},`) ||
        trimmedQuery.includes(`,${field} `) ||
        trimmedQuery.includes(` ${field} `) ||
        trimmedQuery.endsWith(` ${field}`)
      ) {
        throw new Error(
          `Campo '${field}' não é permitido. Campos binários grandes são proibidos.`,
        )
      }
    }

    this.logger.log(`Query validada com sucesso: ${query.substring(0, 100)}...`)
  }

  async getTableSchema(tableName: string): Promise<any> {
    const token = await this.getValidSankhyaToken()
    const headers = { Authorization: `Bearer ${token}` }
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.sankhyaApiBaseUrl}/inspection/table-schema?tableName=${tableName}`,
        { headers },
      ),
    )
    return trimStrings(response.data)
  }

  async getTableRelations(tableName: string): Promise<any> {
    const token = await this.getValidSankhyaToken()
    const headers = { Authorization: `Bearer ${token}` }
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.sankhyaApiBaseUrl}/inspection/table-relations?tableName=${tableName}`,
        { headers },
      ),
    )
    return trimStrings(response.data)
  }

  async getPrimaryKeys(tableName: string): Promise<any> {
    const token = await this.getValidSankhyaToken()
    const headers = { Authorization: `Bearer ${token}` }
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.sankhyaApiBaseUrl}/inspection/primary-keys/${tableName}`,
        { headers },
      ),
    )
    return trimStrings(response.data)
  }
}
