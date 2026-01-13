import { Module } from '@nestjs/common'
import { Products2Controller } from './products2.controller'
import { Products2Service } from './products2.service'
import { SharedModule } from '../shared/shared.module'

/**
 * Módulo TGFPRO2 (Products v2)
 * Phase 1: Basic Listing
 *
 * Fornece endpoints otimizados para gestão de produtos com:
 * - Queries documentadas e testadas
 * - Cache strategy (futuro: Redis)
 * - Swagger documentation em pt-BR
 * - Paginação compatível com PaginatedResult<T>
 */
@Module({
  imports: [SharedModule],
  controllers: [Products2Controller],
  providers: [Products2Service],
  exports: [Products2Service],
})
export class Products2Module {}
