import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { TokenAuthGuard } from '../auth/token-auth.guard'
import { TsiempService } from './tsiemp.service'

@ApiBearerAuth('JWT-auth')
@ApiTags('E. Empresas (TSIEMP)')
@Controller('sankhya/tsiemp')
@UseGuards(TokenAuthGuard)
export class TsiempController {
  constructor(private readonly tsiempService: TsiempService) {}

  @Get('all')
  @ApiOperation({ summary: 'Obter todas as empresas (para selects)' })
  @ApiResponse({
    status: 200,
    description: 'Lista completa de empresas retornada com sucesso',
  })
  @UseInterceptors(CacheInterceptor)
  async listAll(): Promise<any> {
    const data = await this.tsiempService.listAll()
    return { data }
  }
}
