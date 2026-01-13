import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'
import * as jwt from 'jsonwebtoken'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

/**
 * Interceptor global para logging de requests e responses.
 * Loga informações como método, URL, usuário, status da resposta, tempo de execução e validade do token.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name)

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

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const { method, url, user, headers, body, ip } = request
    let userInfo = user
      ? `👤 ${user.username || user.sub} (${user.nome || 'N/A'})`
      : '👤 Anônimo'
    let tokenInfo = ''
    let expHuman = ''

    // Tentar extrair usuário e validade do token JWT no header Authorization
    const authHeader = headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      try {
        const payload = jwt.decode(token) as any
        if (payload && payload.username) {
          userInfo = `👤 ${payload.username}`
        }
        if (payload && payload.exp) {
          const now = Math.floor(Date.now() / 1000)
          const timeLeft = payload.exp - now
          expHuman = this.formatTimeLeft(timeLeft)
          tokenInfo = `⏳ Token expira em: ${expHuman}`
        }
      } catch (error) {
        userInfo = '❌ Token Inválido'
      }
    }

    const start = Date.now()

    // Log do request (sem dados sensíveis)
    let requestInfo =
      `\n🚦 [REQUEST] ${method} ${url}\n` +
      `🌐 IP: ${ip || request.ip || 'N/A'}\n` +
      `👤 Usuário: ${userInfo}\n` +
      (tokenInfo ? `⏳ ${tokenInfo}\n` : '') +
      `📋 Headers: ${JSON.stringify({
        'user-agent': headers['user-agent'],
        'content-type': headers['content-type'],
        accept: headers['accept'],
      })}\n`
    if (body && method !== 'GET' && !this.isSensitiveData(body)) {
      requestInfo += `📝 Body: ${JSON.stringify(body).substring(0, 200)}\n`
    }
    this.logger.log(requestInfo + '🚦 [REQUEST INÍCIO]')

    return next.handle().pipe(
      tap((data) => {
        const response = context.switchToHttp().getResponse()
        const { statusCode } = response
        const duration = Date.now() - start

        // Log da response (limitando tamanho para não poluir logs)
        let responseInfo =
          `\n🎯 [RESPONSE] ${method} ${url}\n` +
          `🔢 Status: ${statusCode}\n` +
          `⏱️ Duração: ${duration}ms\n` +
          `👤 Usuário: ${userInfo}\n` +
          (tokenInfo ? `⏳ ${tokenInfo}\n` : '')
        if (
          data &&
          typeof data === 'object' &&
          !this.isSensitiveResponse(data)
        ) {
          const dataStr = JSON.stringify(data)
          if (dataStr.length < 500) {
            responseInfo += `📦 Response: ${dataStr}\n`
          } else {
            responseInfo += `📦 Response: ${dataStr.substring(0, 500)}...\n`
          }
        }

        this.logger.log(responseInfo + '🎯 [RESPONSE FIM]\n')
      }),
    )
  }

  /**
   * Verifica se o body contém dados sensíveis que não devem ser logados
   */
  private isSensitiveData(body: any): boolean {
    if (!body || typeof body !== 'object') return false

    // Verifica campos sensíveis
    const sensitiveFields = ['password', 'senha', 'token', 'secret', 'key']
    return Object.keys(body).some((key) =>
      sensitiveFields.some((field) => key.toLowerCase().includes(field)),
    )
  }

  /**
   * Verifica se a response contém dados que não devem ser logados completos
   */
  private isSensitiveResponse(data: any): boolean {
    if (!data || typeof data !== 'object') return false

    // Evita logar responses muito grandes ou com campos sensíveis
    const dataStr = JSON.stringify(data)
    return (
      dataStr.length > 2000 ||
      dataStr.includes('access_token') ||
      dataStr.includes('password')
    )
  }
}
