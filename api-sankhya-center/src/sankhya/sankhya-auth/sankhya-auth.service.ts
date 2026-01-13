import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { AxiosResponse } from 'axios'
import { firstValueFrom } from 'rxjs'

/**
 * Serviço para autenticação na API Sankhya.
 */
@Injectable()
export class SankhyaAuthService {
  private readonly logger = new Logger(SankhyaAuthService.name)
  private token: string | null = null
  private tokenExpiration: Date | null = null

  constructor(private readonly httpService: HttpService) {}

  /**
   * Obtém o token de autenticação, com cache.
   * @param username - Nome de usuário para autenticação (obrigatório)
   * @param password - Senha para autenticação (obrigatório)
   * @returns O token de acesso.
   */
  async getToken(username: string, password: string): Promise<string> {
    if (!username || !password) {
      throw new Error('Username e password são obrigatórios para autenticação')
    }
    this.logger.log('Iniciando processo de obtenção de token Sankhya...')
    if (
      this.token &&
      this.tokenExpiration &&
      new Date() < this.tokenExpiration
    ) {
      this.logger.log(
        'Token em cache encontrado e ainda válido. Retornando token do cache.',
      )
      return this.token
    }
    this.logger.log(
      'Token não encontrado em cache ou expirado. Realizando login na API Sankhya...',
    )
    try {
      this.logger.debug('Enviando requisição para /auth/login')
      const response: AxiosResponse<{ access_token: string }> =
        await firstValueFrom(
          this.httpService.post('/auth/login', {
            username,
            password,
          }),
        )
      this.logger.debug(
        'Resposta recebida da API Sankhya:',
        JSON.stringify(response.data),
      )
      this.token = response.data.access_token
      // Assume token expires in 1 hour
      this.tokenExpiration = new Date(Date.now() + 60 * 60 * 1000)
      this.logger.log('Token obtido com sucesso e salvo em cache.')
      return this.token
    } catch (err) {
      this.logger.error('Erro ao autenticar na API Sankhya:', err)
      throw err
    }
  }

  /**
   * Faz login e retorna o token.
   * @param username - Nome de usuário para autenticação (obrigatório)
   * @param password - Senha para autenticação (obrigatório)
   * @returns O token de acesso.
   */
  async login(username: string, password: string): Promise<string> {
    if (!username || !password) {
      throw new Error('Username e password são obrigatórios para login')
    }
    this.logger.log('Método login chamado.')
    return this.getToken(username, password)
  }
}
