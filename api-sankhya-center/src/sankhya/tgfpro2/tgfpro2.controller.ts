import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { PaginatedResult } from '../../common/pagination/pagination.types'
import { TokenAuthGuard } from '../auth/token-auth.guard'
import { ProdutoFindAllDto } from './dtos'
import { Produto2 } from './interfaces'
import { Tgfpro2Service } from './tgfpro2.service'

/**
 * Controller para endpoints TGFPRO2 (produtos com estoque por local)
 */
@ApiBearerAuth('JWT-auth')
@ApiTags('TGFPRO2 - Produtos com Estoque por Local')
@UseGuards(TokenAuthGuard)
@Controller('tgfpro2')
export class Tgfpro2Controller {
  constructor(private readonly tgfpro2Service: Tgfpro2Service) {}

  @Get('produtos')
  @ApiOperation({
    summary: 'Listar produtos com opção de estoque por local',
    description:
      'Lista produtos com filtros avançados e opção de incluir informações de estoque agregado e/ou detalhado por local',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos retornada com sucesso',
    schema: {
      example: {
        data: [
          {
            codprod: 3680,
            descrprod: 'PARAFUSO CABECA CHATA',
            referencia: 'REF123',
            marca: 'BOSCH',
            codgrupoprod: 1000,
            codvol: 'UN',
            ativo: 'S',
            tgfgru: {
              codgrupoprod: 1000,
              descrgrupoprod: 'FERRAGENS',
            },
            tgfvol: {
              codvol: 'UN',
              descrvol: 'UNIDADE',
            },
            estoque: {
              totalGeral: 150,
              totalMin: 50,
              totalMax: 200,
              qtdeLocais: 3,
              statusGeral: 'NORMAL',
            },
            estoqueLocais: [
              {
                codlocal: 101001,
                descrlocal: 'ALMOX PECAS',
                controle: null,
                quantidade: 100,
                estmin: 30,
                estmax: 150,
                statusLocal: 'NORMAL',
                percOcupacao: 66.67,
              },
            ],
          },
        ],
        total: 1,
        page: 1,
        perPage: 10,
        lastPage: 1,
        hasMore: false,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async findAll(
    @Query() dto: ProdutoFindAllDto,
  ): Promise<PaginatedResult<Produto2>> {
    return this.tgfpro2Service.findAll(dto)
  }
}
