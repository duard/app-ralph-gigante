import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { PaginatedResult } from '../../common/pagination/pagination.types'
import { TokenAuthGuard } from '../auth/token-auth.guard'
import { TgftabFindAllDto } from './models/tgftab-find-all.dto'
import { Tgftab } from './models/tgftab.interface'
import { TgftabService } from './tgftab.service'

@ApiBearerAuth('JWT-auth')
@ApiTags('E. tgftab')
@UseGuards(TokenAuthGuard)
@Controller('tgftab')
export class TgftabController {
  constructor(private readonly tgftabService: TgftabService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tabelas de preço' })
  @ApiResponse({ status: 200, description: 'Lista de tabelas', type: Object })
  async findAll(
    @Query() dto: TgftabFindAllDto,
  ): Promise<PaginatedResult<Tgftab>> {
    return this.tgftabService.findAll(dto)
  }

  @Get(':codtab')
  @ApiOperation({ summary: 'Buscar tabela por código' })
  @ApiResponse({ status: 200, description: 'Tabela encontrada', type: Object })
  @ApiResponse({ status: 404, description: 'Tabela não encontrada' })
  async findById(@Param('codtab') codtab: number): Promise<Tgftab | null> {
    return this.tgftabService.findById(codtab)
  }

  @Get('admin/test')
  @ApiOperation({ summary: 'Teste do módulo TGFTAB' })
  @ApiResponse({ status: 200, description: 'Módulo funcionando' })
  async adminTest(): Promise<{ status: string }> {
    return { status: 'Tgftab module is working' }
  }
}
