import { Module } from '@nestjs/common'
import { TddinsController } from './tddins.controller'
import { TddinsService } from './tddins.service'
import { SharedModule } from '../../sankhya/shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [TddinsController],
  providers: [TddinsService],
  exports: [TddinsService],
})
export class TddinsModule {}
