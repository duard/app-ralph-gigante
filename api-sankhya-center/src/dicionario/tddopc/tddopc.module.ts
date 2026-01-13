import { Module } from '@nestjs/common'
import { TddopcController } from './tddopc.controller'
import { TddopcService } from './tddopc.service'
import { SharedModule } from '../../sankhya/shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [TddopcController],
  providers: [TddopcService],
  exports: [TddopcService],
})
export class TddopcModule {}
