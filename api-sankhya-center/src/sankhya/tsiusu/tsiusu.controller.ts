import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { TsiusuService } from './tsiusu.service'
import { TokenAuthGuard } from '../auth/token-auth.guard'

@ApiTags('E. TSIUSU')
@Controller('sankhya/tsiusu')
@UseGuards(TokenAuthGuard)
export class TsiusuController {
  constructor(private readonly tsiusuService: TsiusuService) {}

  @Get('all')
  @ApiOperation({ summary: 'Obter todos os usuários (para selects)' })
  @ApiResponse({
    status: 200,
    description: 'Lista completa de usuários retornada com sucesso',
  })
  async listAll() {
    const data = await this.tsiusuService.listAll()
    return { data }
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuários do SRT' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
  })
  async findAll(@Query('limit') limit?: number) {
    return this.tsiusuService.findAll(limit)
  }

  @Get(':codusu')
  @ApiOperation({ summary: 'Obter dados de um usuário pelo código' })
  @ApiResponse({ status: 200, description: 'Usuário retornado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(@Param('codusu') codusu: string) {
    return this.tsiusuService.findOne(+codusu)
  }
}
