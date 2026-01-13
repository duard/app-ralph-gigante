import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { ProdutosSimplesV2Service } from './produtos-simples-v2.service'
import { ProdutoSimplesV2Dto } from './models/produtos-simples-v2.dto'
import { ProdutosSimplesV2FindAllDto } from './models/produtos-simples-v2-find-all.dto'

@ApiTags('produtos-simples-v2')
@Controller('produtos-simples-v2')
export class ProdutosSimplesV2Controller {
  constructor(
    private readonly produtosSimplesV2Service: ProdutosSimplesV2Service,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get simplified products v2' })
  @ApiResponse({
    status: 200,
    description: 'List of simplified products',
    type: [ProdutoSimplesV2Dto],
  })
  async findAll(
    @Query() query: ProdutosSimplesV2FindAllDto,
  ): Promise<{ data: ProdutoSimplesV2Dto[]; total: number; lastPage: number }> {
    return this.produtosSimplesV2Service.findAll(query)
  }
}
