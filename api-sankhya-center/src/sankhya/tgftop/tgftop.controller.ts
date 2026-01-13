import { CacheInterceptor } from '@nestjs/cache-manager'
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { PaginatedResult } from '../../common/pagination/pagination.types'
import { TokenAuthGuard } from '../auth/token-auth.guard'
import { TgftopFindAllDto } from './models/tgftop-find-all.dto'
import { Tgftop } from './models/tgftop.interface'
import { TgftopService } from './tgftop.service'

@ApiBearerAuth('JWT-auth')
@ApiTags('E. Tipos de Operação (TGFTOP)')
@UseGuards(TokenAuthGuard)
@Controller('tgftop')
export class TgftopController {
  constructor(private readonly tgftopService: TgftopService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar tipos de operação',
    description: 'Retorna uma lista paginada de tipos de operação',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista retornada com sucesso',
  })
  @ApiQuery({
    name: 'descrtipoper',
    required: false,
    type: String,
    description: 'Filtrar por descrição',
  })
  @UseInterceptors(CacheInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(
    @Query() dto: TgftopFindAllDto,
  ): Promise<PaginatedResult<Tgftop>> {
    return this.tgftopService.findAll(dto)
  }

  @Get(':codtipoper')
  @ApiOperation({ summary: 'Buscar tipo de operação por código' })
  @ApiResponse({ status: 200, description: 'Tipo encontrado' })
  @ApiResponse({ status: 404, description: 'Tipo não encontrado' })
  @ApiParam({
    name: 'codtipoper',
    type: Number,
    description: 'Código do tipo de operação',
  })
  async findById(
    @Param('codtipoper') codtipoper: number,
  ): Promise<Tgftop | null> {
    return this.tgftopService.findById(+codtipoper)
  }

  @Get('admin/test')
  @ApiOperation({ summary: 'Teste de saúde do módulo' })
  @ApiResponse({ status: 200, description: 'Módulo funcionando' })
  async test() {
    return {
      status: `${this.constructor.name.replace('Controller', '')} module is working`,
    }
  }
}
