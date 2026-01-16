import {
  Body,
  Controller,
  Post,
  Get,
  HttpException,
  UseGuards,
  Req,
} from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { TokenAuthGuard } from './token-auth.guard'

@ApiTags('E. Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login com credenciais Sankhya',
    description:
      'Recebe username e password, faz login na API Sankhya externa e retorna o token JWT da API externa.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'CONVIDADO',
          description: 'Nome de usuário Sankhya',
        },
        password: {
          type: 'string',
          example: 'guest123',
          description: 'Senha do usuário Sankhya',
        },
      },
      required: ['username', 'password'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Login bem-sucedido',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        token_type: {
          type: 'string',
          example: 'Bearer',
        },
        expires_in: {
          type: 'number',
          example: 3600,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() body: { username: string; password: string }) {
    try {
      return await this.authService.authenticateWithSankhya(
        body.username,
        body.password,
      )
    } catch (error) {
      throw new HttpException(
        {
          statusCode: 401,
          message: error.message || 'Falha na autenticação',
          error: 'Unauthorized',
        },
        401,
      )
    }
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Renovar token de acesso',
    description:
      'Renova o token de acesso usando o refresh token (não implementado).',
  })
  @ApiResponse({ status: 501, description: 'Funcionalidade não implementada' })
  async refresh() {
    throw new HttpException(
      {
        statusCode: 501,
        message: 'Refresh token não implementado',
        error: 'Not Implemented',
      },
      501,
    )
  }

  @Get('me')
  @UseGuards(TokenAuthGuard)
  @ApiOperation({
    summary: 'Obter informações do usuário atual',
    description:
      'Retorna as informações do usuário autenticado baseado no token JWT externo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Informações do usuário',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'CONVIDADO' },
        username: { type: 'string', example: 'CONVIDADO' },
        email: { type: 'string', example: 'CONVIDADO' },
        name: { type: 'string', example: 'CONVIDADO' },
        role: { type: 'string', example: 'user' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async getMe(@Req() req: any) {
    // O usuário está disponível no request através do TokenAuthGuard
    const user = req.user
    return {
      id: user.sub || user.username,
      username: user.username || user.sub,
      email: user.username || user.sub,
      name: user.username || user.sub,
      role: 'user',
    }
  }
}
