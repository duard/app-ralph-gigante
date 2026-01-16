import { Module } from '@nestjs/common'
import { SharedModule } from '../shared/shared.module'
import { EstoqueDashboardController } from './controllers/estoque-dashboard.controller'
import { ProdutosController } from './controllers/produtos.controller'
import { EstoqueController } from './estoque.controller'
import { EstoqueService } from './estoque.service'

/**
 * Módulo Ultra Completo de Gestão de Estoque
 * API poderosa read-only que fornece TODAS as informações sobre produtos
 * Estrutura organizada por controllers especializados para máxima compreensão
 */
@Module({
  imports: [SharedModule],
  controllers: [EstoqueDashboardController, ProdutosController, EstoqueController],
  providers: [EstoqueService],
  exports: [EstoqueService],
})
export class EstoqueModule {}
