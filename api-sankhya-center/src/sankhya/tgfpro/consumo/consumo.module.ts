import { Module } from '@nestjs/common'
import { SharedModule } from '../../shared/shared.module'
import { ConsumoHealthController } from './consumo-health.controller'
import { ConsumoV2Service } from './consumo-v2.service'
import { ConsumoV3Service } from './consumo-v3.service'
import { ConsumoController } from './consumo.controller'
import { ConsumoService } from './consumo.service'
import { ConsumoValidationService } from './utils/consumo-validation.service'
import { ProdutoCacheService } from './utils/produto-cache.service'

@Module({
  imports: [SharedModule],
  controllers: [ConsumoController, ConsumoHealthController],
  providers: [
    ConsumoService,
    ConsumoV2Service,
    ConsumoV3Service,
    ConsumoValidationService,
    ProdutoCacheService,
  ],
  exports: [
    ConsumoService,
    ConsumoV2Service,
    ConsumoV3Service,
    ConsumoValidationService,
    ProdutoCacheService,
  ],
})
export class ConsumoModule {}
