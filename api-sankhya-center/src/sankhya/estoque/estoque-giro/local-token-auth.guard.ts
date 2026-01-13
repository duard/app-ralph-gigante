import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class LocalTokenAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)

    if (!token) {
      throw new UnauthorizedException('Token não fornecido')
    }

    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new UnauthorizedException('Token JWT mal formatado')
      }

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())

      if (payload.exp) {
        const now = Math.floor(Date.now() / 1000)
        if (payload.exp <= now) {
          throw new UnauthorizedException('Token expirado')
        }
      }

      request.user = payload
      return true
    } catch (error) {
      throw new UnauthorizedException('Token inválido')
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
