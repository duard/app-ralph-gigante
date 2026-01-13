import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { TokenAuthGuard } from '../auth/token-auth.guard'
import { EstoqueService } from './estoque.service'

@ApiBearerAuth('JWT-auth')
@ApiTags('E. Estoque - Visão Geral')
@UseGuards(TokenAuthGuard)
@Controller('estoque')
export class EstoqueController {
  constructor(private readonly estoqueService: EstoqueService) {}

  @Get('resumo')
  @ApiOperation({ summary: 'Resumo geral do estoque' })
  @ApiResponse({ status: 200, description: 'Resumo retornado' })
  async getResumo() {
    return this.estoqueService.getResumo()
  }

  @Get('baixo')
  @ApiOperation({ summary: 'Produtos com estoque baixo' })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos com baixo estoque',
  })
  async getBaixoEstoque(@Query('limite') limite: number = 10) {
    return this.estoqueService.getBaixoEstoque(limite)
  }

  @Get('por-local')
  @ApiOperation({ summary: 'Estoque agrupado por local' })
  @ApiResponse({ status: 200, description: 'Agrupamento por local' })
  async getPorLocal() {
    return this.estoqueService.getPorLocal()
  }

  @Get('por-grupo')
  @ApiOperation({ summary: 'Estoque agrupado por grupo de produto' })
  @ApiResponse({ status: 200, description: 'Agrupamento por grupo' })
  async getPorGrupo() {
    return this.estoqueService.getPorGrupo()
  }

  @Get('top-produtos')
  @ApiOperation({ summary: 'Top produtos por quantidade em estoque' })
  @ApiResponse({ status: 200, description: 'Top produtos' })
  async getTopProdutos(@Query('limite') limite: number = 10) {
    return this.estoqueService.getTopProdutos(limite)
  }

  @Get('por-valor')
  @ApiOperation({ summary: 'Produtos ordenados por valor total em estoque' })
  @ApiResponse({ status: 200, description: 'Produtos por valor' })
  async getPorValor(@Query('limite') limite: number = 10) {
    return this.estoqueService.getPorValor(limite)
  }

  @Get('abaixo-minimo')
  @ApiOperation({ summary: 'Produtos abaixo do estoque mínimo' })
  @ApiResponse({ status: 200, description: 'Produtos abaixo mínimo' })
  async getAbaixoMinimo(@Query('limite') limite: number = 20) {
    return this.estoqueService.getAbaixoMinimo(limite)
  }

  @Get('movimentacoes/:codprod')
  @ApiOperation({ summary: 'Movimentações de um produto via TGFITE' })
  @ApiResponse({ status: 200, description: 'Movimentações do produto' })
  @ApiParam({ name: 'codprod', type: Number, description: 'Código do produto' })
  async getMovimentacoesProduto(
    @Param('codprod') codprod: number,
    @Query('limite') limite: number = 10,
  ) {
    return this.estoqueService.getMovimentacoesProduto(codprod, limite)
  }

  @Get('notas-fiscais/:codprod')
  @ApiOperation({
    summary: 'Notas fiscais relacionadas a um produto via TGFCAB/TGFITE',
  })
  @ApiResponse({ status: 200, description: 'Notas fiscais do produto' })
  @ApiParam({ name: 'codprod', type: Number, description: 'Código do produto' })
  async getNotasFiscaisProduto(
    @Param('codprod') codprod: number,
    @Query('limite') limite: number = 10,
  ) {
    return this.estoqueService.getNotasFiscaisProduto(codprod, limite)
  }

  @Get('inventario')
  @ApiOperation({ summary: 'Simulação de inventário com diferenças' })
  @ApiResponse({ status: 200, description: 'Dados de inventário' })
  async getInventario(@Query('codlocal') codlocal?: number) {
    return this.estoqueService.getInventario(codlocal)
  }

  @Get('conferencias')
  @ApiOperation({ summary: 'Itens com status de conferência via TGFITE' })
  @ApiResponse({ status: 200, description: 'Itens de conferência' })
  async getConferencias(
    @Query('status') status?: string,
    @Query('limite') limite: number = 20,
  ) {
    return this.estoqueService.getConferencias(status, limite)
  }
}
