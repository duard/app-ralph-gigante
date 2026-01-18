import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { AxiosError } from 'axios'

interface ErrorDetails {
  message: string
  details?: Record<string, unknown>
  step?: string
  stack?: string[]
  errorType?: string
}

interface ErrorResponse {
  statusCode: number
  timestamp: string
  path: string
  method: string
  message: string
  error?: string
  details?: Record<string, unknown>
  step?: string
  stack?: string[]
  errorType?: string
  requestId?: string
  // Apenas em desenvolvimento
  debug?: {
    query?: Record<string, unknown>
    params?: Record<string, unknown>
    body?: unknown
    headers?: Record<string, unknown>
    user?: unknown
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter')
  private readonly isDev = process.env.NODE_ENV !== 'production'

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const requestId = this.generateRequestId()

    // Extrair informações do erro
    const { status, errorDetails } = this.extractErrorInfo(exception)

    // Construir response
    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorDetails.message,
      requestId,
    }

    // Adicionar detalhes extras se disponíveis
    if (errorDetails.details) {
      errorResponse.details = errorDetails.details
    }
    if (errorDetails.step) {
      errorResponse.step = errorDetails.step
    }
    if (errorDetails.errorType) {
      errorResponse.errorType = errorDetails.errorType
    }

    // Em desenvolvimento, incluir stack trace e debug info
    if (this.isDev) {
      if (errorDetails.stack) {
        errorResponse.stack = errorDetails.stack
      }
      errorResponse.debug = {
        query: request.query as Record<string, unknown>,
        params: request.params,
        body: this.sanitizeBody(request.body),
        headers: this.sanitizeHeaders(request.headers),
        user: (request as any).user,
      }
    }

    // Log detalhado do erro
    this.logError(request, exception, status, errorDetails, requestId)

    response.status(status).json(errorResponse)
  }

  /**
   * Extrai informações do erro de diferentes tipos de exceção
   */
  private extractErrorInfo(exception: unknown): {
    status: number
    errorDetails: ErrorDetails
  } {
    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let errorDetails: ErrorDetails = {
      message: 'Erro interno do servidor',
      errorType: 'UnknownError',
    }

    // HttpException do NestJS
    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'string') {
        errorDetails.message = exceptionResponse
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>
        errorDetails.message = (resp.message as string) || exception.message
        errorDetails.details = resp.details as Record<string, unknown>
        errorDetails.step = resp.step as string
        errorDetails.errorType = resp.errorType as string || exception.name
      }

      errorDetails.stack = exception.stack?.split('\n').slice(0, 15)
    }
    // Erro do Axios (chamadas externas)
    else if (this.isAxiosError(exception)) {
      const axiosError = exception as AxiosError
      status = axiosError.response?.status || HttpStatus.BAD_GATEWAY

      errorDetails = {
        message: `Erro na API externa: ${axiosError.message}`,
        errorType: 'AxiosError',
        details: {
          url: axiosError.config?.url,
          method: axiosError.config?.method?.toUpperCase(),
          responseStatus: axiosError.response?.status,
          responseData: this.truncate(
            JSON.stringify(axiosError.response?.data),
            500,
          ),
        },
        stack: axiosError.stack?.split('\n').slice(0, 10),
      }
    }
    // Error padrão do JavaScript
    else if (exception instanceof Error) {
      errorDetails = {
        message: exception.message,
        errorType: exception.name,
        stack: exception.stack?.split('\n').slice(0, 15),
      }
    }
    // Tipo desconhecido
    else if (typeof exception === 'string') {
      errorDetails.message = exception
    } else {
      errorDetails.message = 'Erro desconhecido'
      errorDetails.details = {
        rawError: String(exception),
      }
    }

    return { status, errorDetails }
  }

  /**
   * Log detalhado do erro no console
   */
  private logError(
    request: Request,
    exception: unknown,
    status: number,
    errorDetails: ErrorDetails,
    requestId: string,
  ) {
    const separator = '═'.repeat(80)
    const thinSeparator = '─'.repeat(80)

    // Header do erro
    this.logger.error(`
${separator}
❌ ERRO ${status} - ${errorDetails.errorType || 'Error'}
${separator}
📋 Request ID: ${requestId}
📅 Timestamp: ${new Date().toISOString()}
🌐 ${request.method} ${request.url}
👤 User: ${JSON.stringify((request as any).user?.username || 'Anonymous')}
🖥️ IP: ${request.ip || request.socket?.remoteAddress || 'Unknown'}
${thinSeparator}`)

    // Mensagem do erro
    this.logger.error(`
💬 MENSAGEM: ${errorDetails.message}
${errorDetails.step ? `📍 STEP: ${errorDetails.step}` : ''}`)

    // Detalhes extras
    if (errorDetails.details) {
      this.logger.error(`
📦 DETALHES:
${JSON.stringify(errorDetails.details, null, 2)}`)
    }

    // Request info (em dev)
    if (this.isDev) {
      const queryStr = Object.keys(request.query || {}).length
        ? JSON.stringify(request.query)
        : 'none'
      const paramsStr = Object.keys(request.params || {}).length
        ? JSON.stringify(request.params)
        : 'none'
      const bodyStr = request.body
        ? this.truncate(JSON.stringify(this.sanitizeBody(request.body)), 500)
        : 'none'

      this.logger.error(`
🔍 REQUEST DEBUG:
   Query: ${queryStr}
   Params: ${paramsStr}
   Body: ${bodyStr}
   Headers: ${JSON.stringify(this.sanitizeHeaders(request.headers))}`)
    }

    // Stack trace
    if (errorDetails.stack && errorDetails.stack.length > 0) {
      this.logger.error(`
📚 STACK TRACE:
${errorDetails.stack.map((line) => `   ${line.trim()}`).join('\n')}`)
    }

    // Se for erro do Axios, mostrar detalhes da chamada externa
    if (this.isAxiosError(exception)) {
      const axiosError = exception as AxiosError
      this.logger.error(`
🌐 AXIOS ERROR DETAILS:
   URL: ${axiosError.config?.url}
   Method: ${axiosError.config?.method?.toUpperCase()}
   Status: ${axiosError.response?.status}
   Response: ${this.truncate(JSON.stringify(axiosError.response?.data), 300)}`)
    }

    // Footer
    this.logger.error(`
${separator}
⏱️ Processed in ${Date.now()}ms
${separator}
`)
  }

  /**
   * Gera um ID único para a request (para rastreamento)
   */
  private generateRequestId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * Remove dados sensíveis do body
   */
  private sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') return body

    const sanitized = { ...(body as Record<string, unknown>) }
    const sensitiveFields = [
      'password',
      'senha',
      'token',
      'secret',
      'key',
      'authorization',
      'apiKey',
      'api_key',
      'accessToken',
      'refreshToken',
    ]

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]'
      }
    }

    return sanitized
  }

  /**
   * Remove headers sensíveis
   */
  private sanitizeHeaders(
    headers: Record<string, unknown>,
  ): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {}
    const allowedHeaders = [
      'content-type',
      'accept',
      'user-agent',
      'host',
      'origin',
      'referer',
    ]

    for (const header of allowedHeaders) {
      if (headers[header]) {
        sanitized[header] = headers[header]
      }
    }

    // Indicar se tinha authorization
    if (headers['authorization']) {
      sanitized['authorization'] = '[PRESENT]'
    }

    return sanitized
  }

  /**
   * Verifica se é um erro do Axios
   */
  private isAxiosError(error: unknown): boolean {
    return (
      error !== null &&
      typeof error === 'object' &&
      'isAxiosError' in error &&
      (error as AxiosError).isAxiosError === true
    )
  }

  /**
   * Trunca uma string para o tamanho máximo
   */
  private truncate(str: string, maxLength: number): string {
    if (!str) return ''
    if (str.length <= maxLength) return str
    return str.substring(0, maxLength) + '...[truncated]'
  }
}
