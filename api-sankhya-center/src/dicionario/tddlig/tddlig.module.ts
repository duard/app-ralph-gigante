import { Module } from '@nestjs/common'
import { TddligController } from './tddlig.controller'
import { TddligService } from './tddlig.service'
import { SharedModule } from '../../sankhya/shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [TddligController],
  providers: [TddligService],
  exports: [TddligService],
})
export class TddligModule {}
