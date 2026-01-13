import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private get sankhyaApiBaseUrl(): string {
    return (
      this.configService.get<string>('SANKHYA_API_BASE_URL') ||
      'https://api-nestjs-sankhya-read-producao.gigantao.net'
    )
  }

  /**
   * Faz login na API Sankhya externa com credenciais do usuário
   * @param username - Nome de usuário Sankhya
   * @param password - Senha Sankhya
   * @returns Token de acesso da API Sankhya (JWT externo)
   */
  async authenticateWithSankhya(
    username: string,
    password: string,
  ): Promise<{ access_token: string; token_type: string; expires_in: number }> {
    try {
      // Faz login na API Sankhya externa
      const sankhyaResponse = await firstValueFrom(
        this.httpService.post(
          `${this.sankhyaApiBaseUrl}/auth/login`,
          { username, password },
          { headers: { 'Content-Type': 'application/json' } },
        ),
      )

      const sankhyaData = sankhyaResponse.data as any
      if (!sankhyaData || !sankhyaData.access_token) {
        throw new Error('Token não recebido da API Sankhya')
      }

      // Retorna o token JWT da API externa diretamente
      return {
        access_token: sankhyaData.access_token,
        token_type: sankhyaData.token_type || 'Bearer',
        expires_in: sankhyaData.expires_in || 3600,
      }
    } catch (error) {
      throw new Error('Credenciais inválidas')
    }
  }

  async refreshToken(username: string, password: string): Promise<string> {
    try {
      const result = await this.authenticateWithSankhya(username, password)
      return result.access_token
    } catch (error) {
      throw new Error(`Falha ao renovar token: ${error.message}`)
    }
  }
}
