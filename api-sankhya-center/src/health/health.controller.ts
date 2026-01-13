import { Controller, Get } from '@nestjs/common'
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

/**
 * Endpoints de verificação de saúde da API.
 *
 * Esta rota aparece no início da documentação Swagger para facilitar o monitoramento.
 */
@ApiTags('A. Health')
@ApiExtraModels()
@Controller('health')
export class HealthController {
  /**
   * Verifica o status de saúde da API.
   * @returns Um objeto com status e timestamp.
   */
  @Get()
  @ApiOperation({
    summary: 'Verificar status da API',
    description: 'Endpoint público para monitoramento e health check.',
  })
  @ApiOkResponse({
    description: 'API está online',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2024-01-01T12:00:00.000Z',
      },
    },
  })
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }
}
