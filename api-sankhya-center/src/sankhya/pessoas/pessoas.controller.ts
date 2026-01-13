import {
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { TokenAuthGuard } from '../auth/token-auth.guard'
import { PessoasService } from './pessoas.service'
import { PessoasFindAllDto } from './models/pessoas-find-all.dto'
import { PaginatedResult } from '../../common/pagination/pagination.types'

@ApiBearerAuth('JWT-auth')
@ApiTags('E. Sankhya Pessoas')
@Controller('sankhya/pessoas')
@UseGuards(TokenAuthGuard)
export class PessoasController {
  constructor(private readonly pessoasService: PessoasService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar pessoas (colaboradores) com dados enriquecidos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pessoas retornada com sucesso',
  })
  @UseInterceptors(CacheInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(
    @Query() dto: PessoasFindAllDto,
  ): Promise<PaginatedResult<any>> {
    return this.pessoasService.findAll(dto)
  }
}
