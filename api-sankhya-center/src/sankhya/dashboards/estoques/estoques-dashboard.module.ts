import { Module } from '@nestjs/common'
import { EstoquesDashboardController } from './estoques-dashboard.controller'
import { EstoquesDashboardService } from './estoques-dashboard.service'
import { SharedModule } from '../../shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [EstoquesDashboardController],
  providers: [EstoquesDashboardService],
})
export class EstoquesDashboardModule {}
