import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class TokenAuthGuard implements CanActivate {
  private readonly logger = new Logger(TokenAuthGuard.name)

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const msg =
        '❌ Acesso negado: Header Authorization ausente ou mal formatado'
      this.logger.warn(msg)
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden resource',
        message: msg,
        reason: 'AUTH_HEADER_MISSING_OR_INVALID',
        hint: 'O header Authorization deve estar presente e iniciar com Bearer',
      })
    }

    const token = authHeader.split(' ')[1]
    if (!token || token.length < 10) {
      const msg = '❌ Acesso negado: Token inválido ou muito curto'
      this.logger.warn(msg)
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden resource',
        message: msg,
        reason: 'TOKEN_TOO_SHORT_OR_INVALID',
        hint: 'O token deve ser um JWT válido e ter tamanho suficiente',
      })
    }

    // Log bonito do token recebido
    this.logger.log('\n================ TOKEN RECEBIDO ================')
    this.logger.log(
      `🔑 Token (primeiros 40 chars): ${token.slice(0, 40)}${token.length > 40 ? '...' : ''}`,
    )
    this.logger.log('===============================================\n')

    try {
      // Decode JWT payload without signature verification (for external JWTs)
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('Token JWT mal formatado')
      }

      let payload: any
      try {
        const decodedPayload = Buffer.from(parts[1], 'base64').toString()
        payload = JSON.parse(decodedPayload)
      } catch (decodeError) {
        throw new Error(
          `Falha ao decodificar payload do token: ${decodeError.message}`,
        )
      }

      // Log bonito do payload decodificado
      this.logger.log('\n================ PAYLOAD DO TOKEN ================')
      this.logger.log(JSON.stringify(payload, null, 2))
      this.logger.log('--------------------------------------------------')
      this.logger.log('🔎 Descrição dos campos do token:')
      if (payload.username)
        this.logger.log(`👤 username: Usuário do sistema (${payload.username})`)
      if (payload.sub)
        this.logger.log(`🆔 sub: Identificador do usuário (${payload.sub})`)
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000).toISOString()
        const now = Math.floor(Date.now() / 1000)
        const timeLeft = payload.exp - now
        const timeLeftFormatted = this.formatTimeLeft(timeLeft)
        this.logger.log(
          `⏰ exp: Expiração do token (timestamp ${payload.exp} = ${expDate})`,
        )
        this.logger.log(`🕒 Tempo restante até expirar: ${timeLeftFormatted}`)
      }
      if (payload.iat) {
        const iatDate = new Date(payload.iat * 1000).toISOString()
        this.logger.log(
          `📅 iat: Data de emissão do token (timestamp ${payload.iat} = ${iatDate})`,
        )
      }
      if (payload.iss)
        this.logger.log(`🏢 iss: Emissor do token (${payload.iss})`)
      if (payload.aud)
        this.logger.log(`🎯 aud: Audiência do token (${payload.aud})`)
      // Exibe outros campos genéricos
      Object.keys(payload).forEach((key) => {
        if (!['username', 'sub', 'exp', 'iat', 'iss', 'aud'].includes(key)) {
          this.logger.log(`🔸 ${key}: ${JSON.stringify(payload[key])}`)
        }
      })
      this.logger.log('==================================================\n')

      // Verificar expiração
      if (payload.exp) {
        const now = Math.floor(Date.now() / 1000)
        const timeLeft = payload.exp - now

        if (timeLeft <= 0) {
          const userInfo = payload.username || payload.sub || 'desconhecido'
          const message = `❌ Acesso negado: Token expirado para usuário ${userInfo}`
          this.logger.warn(message)
          throw new ForbiddenException({
            statusCode: 403,
            error: 'Forbidden resource',
            message: `Token expirado para usuário ${userInfo}`,
            reason: 'TOKEN_EXPIRED',
            hint: 'O token JWT está expirado. Solicite novo login.',
            user: userInfo,
            exp: payload.exp,
            exp_human: this.formatTimeLeft(0),
          })
        }

        // Log do usuário e tempo restante
        const userInfo = payload.username || payload.sub || 'desconhecido'
        const timeLeftFormatted = this.formatTimeLeft(timeLeft)
        this.logger.log(
          `✅ Acesso autorizado: Usuário ${userInfo} - Token válido por: ${timeLeftFormatted} ⏳`,
        )
      } else {
        const msg = `⚠️ Token sem expiração definido para usuário ${payload.username || 'desconhecido'}`
        this.logger.warn(msg)
        throw new ForbiddenException({
          statusCode: 403,
          error: 'Forbidden resource',
          message: msg,
          reason: 'TOKEN_NO_EXP',
          hint: 'O token JWT deve conter campo exp (expiração)',
        })
      }

      // Armazenar informações do usuário na request para uso posterior
      request.user = payload

      return true
    } catch (error) {
      this.logger.error(
        `❌ Acesso negado: Erro ao validar token - ${error.message}`,
      )
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden resource',
        message: `Erro ao validar token: ${error.message}`,
        reason: 'TOKEN_UNKNOWN_ERROR',
        hint: 'Erro inesperado ao validar token',
      })
    }
  }

  private formatTimeLeft(seconds: number): string {
    if (seconds <= 0) return 'Expirado'
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    const parts = []
    if (days > 0) parts.push(`${days}d`)
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    if (secs > 0 && parts.length === 0) parts.push(`${secs}s`)
    return parts.join(' ') || 'Menos de 1s'
  }
}
