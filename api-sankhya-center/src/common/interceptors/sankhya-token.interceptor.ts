import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { SankhyaApiService } from '../../sankhya/shared/sankhya-api.service'

/**
 * Interceptor global que configura automaticamente o token Sankhya
 * para todas as requisições autenticadas.
 *
 * Elimina a necessidade de setupSankhyaToken() duplicado nos controllers.
 */
@Injectable()
export class SankhyaTokenInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SankhyaTokenInterceptor.name)

  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest()
    const user = (request as any).user

    // Se há usuário autenticado, usar o token do header como sankhyaToken
    if (user) {
      const token = this.extractTokenFromHeaders(request)
      if (token) {
        this.logger.log(
          `Setting sankhya token for user ${user.username || user.sub}`,
        )
        await this.sankhyaApiService.setSankhyaTokenFromJwt({
          sankhyaToken: token,
        })
      }
    }

    return next.handle()
  }

  private extractTokenFromHeaders(request: any): string {
    const authHeader = request.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1]
    }
    return ''
  }
}
