import { Module } from '@nestjs/common'
import { RhDashboardController } from './rh-dashboard.controller'
import { RhDashboardService } from './rh-dashboard.service'
import { SharedModule } from '../../shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [RhDashboardController],
  providers: [RhDashboardService],
  exports: [RhDashboardService],
})
export class RhDashboardModule {}
