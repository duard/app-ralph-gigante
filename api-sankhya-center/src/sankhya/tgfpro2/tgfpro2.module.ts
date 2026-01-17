import { Module } from '@nestjs/common'
import { SharedModule } from '../shared/shared.module'
import { Tgfpro2Controller } from './tgfpro2.controller'
import { Tgfpro2Repository } from './repository/tgfpro2.repository'
import { Tgfpro2Service } from './tgfpro2.service'

/**
 * Módulo TGFPRO2 - Produtos com informações de estoque por local
 *
 * Endpoints:
 * - GET /tgfpro2/produtos - Lista produtos com filtros e opção de estoque por local
 */
@Module({
  imports: [SharedModule],
  controllers: [Tgfpro2Controller],
  providers: [Tgfpro2Service, Tgfpro2Repository],
  exports: [Tgfpro2Service, Tgfpro2Repository],
})
export class Tgfpro2Module {}
