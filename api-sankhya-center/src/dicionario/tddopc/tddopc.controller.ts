import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { TokenAuthGuard } from '../../sankhya/auth/token-auth.guard'
import { TddopcService } from './tddopc.service'
import { TddopcFindAllDto } from './models/tddopc-find-all.dto'
import { Tddopc } from './models/tddopc.interface'

type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  perPage: number
  lastPage: number
  hasMore: boolean
}

@ApiBearerAuth('JWT-auth')
@ApiTags('C. Dicionário de Dados - Opções de Campos (TDDOPC)')
@Controller('dicionario/opcoes-campos')
@UseGuards(TokenAuthGuard)
export class TddopcController {
  constructor(private readonly tddopcService: TddopcService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar opções de campos com paginação, filtros e ordenação',
    description:
      'Retorna uma lista paginada de opções de campos do dicionário com suporte a filtros.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de opções retornada com sucesso',
    schema: {
      example: {
        data: [
          {
            nucampo: 331,
            valor: 'S',
            opcao: 'Sim',
            padrao: 'S',
            ordem: 1,
            controle: '0',
            domain: 'mge',
          },
        ],
        total: 100,
        page: 1,
        perPage: 10,
        lastPage: 10,
        hasMore: true,
      },
    },
  })
  async findAll(
    @Query() dto: TddopcFindAllDto,
  ): Promise<PaginatedResult<Tddopc>> {
    return this.tddopcService.findAll(dto)
  }

  @Get(':nucampo/:valor')
  @ApiOperation({ summary: 'Buscar opção por NUCAMPO e VALOR' })
  @ApiParam({ name: 'nucampo', type: Number, description: 'Número do campo' })
  @ApiParam({ name: 'valor', type: String, description: 'Valor da opção' })
  @ApiResponse({ status: 200, description: 'Opção encontrada' })
  @ApiResponse({ status: 404, description: 'Opção não encontrada' })
  async findById(
    @Param('nucampo') nucampo: number,
    @Param('valor') valor: string,
  ): Promise<Tddopc | null> {
    return this.tddopcService.findById(+nucampo, valor)
  }
}
