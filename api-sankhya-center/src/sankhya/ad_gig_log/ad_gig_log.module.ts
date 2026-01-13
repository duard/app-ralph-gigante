import { Module } from '@nestjs/common'
import { SharedModule } from '../shared/shared.module'
import { AdGigLogService } from './ad_gig_log.service'
import { AdGigLogController } from './ad_gig_log.controller'

@Module({
  imports: [SharedModule],
  providers: [AdGigLogService],
  controllers: [AdGigLogController],
  exports: [AdGigLogService],
})
export class AdGigLogModule {}
