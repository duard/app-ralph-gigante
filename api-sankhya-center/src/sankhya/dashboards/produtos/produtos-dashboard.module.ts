import { Module } from '@nestjs/common'
import { ProdutosDashboardController } from './produtos-dashboard.controller'
import { ProdutosDashboardService } from './services/produtos-dashboard.service'
import { SharedModule } from '../../shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [ProdutosDashboardController],
  providers: [ProdutosDashboardService],
  exports: [ProdutosDashboardService],
})
export class ProdutosDashboardModule {}
