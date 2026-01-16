import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger'
import { TokenAuthGuard } from '../auth/token-auth.guard'
import { TgflocService } from './tgfloc.service'

@ApiBearerAuth('JWT-auth')
@ApiTags('TGFLOC - Locais de Estoque')
@UseGuards(TokenAuthGuard)
@Controller('sankhya/tgfloc')
export class TgflocController {
  constructor(private readonly tgflocService: TgflocService) {}

  @Get()
  @ApiOperation({ summary: 'Listar locais de estoque' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'perPage', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('search') search?: string,
  ) {
    return this.tgflocService.findAll({
      page: page || 1,
      perPage: perPage || 100,
      search,
    })
  }

  @Get(':codlocal')
  @ApiOperation({ summary: 'Buscar local por código' })
  async findOne(@Query('codlocal') codlocal: number) {
    return this.tgflocService.findOne(codlocal)
  }
}
