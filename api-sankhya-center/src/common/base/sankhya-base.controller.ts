import { Get, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { SankhyaBaseService } from './sankhya-base.service'

@ApiTags('Base Sankhya')
export abstract class SankhyaBaseController<T> {
  constructor(protected readonly service: SankhyaBaseService<T>) {}

  @Get(':id')
  @ApiOperation({ summary: 'Buscar por ID' })
  @ApiResponse({ status: 200, description: 'Registro encontrado' })
  @ApiResponse({ status: 404, description: 'Registro não encontrado' })
  @ApiParam({ name: 'id', type: Number })
  async findById(@Param('id') id: number): Promise<T | null> {
    return this.service.findById(+id)
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
