import { Module } from '@nestjs/common'
import { TddlgcController } from './tddlgc.controller'
import { TddlgcService } from './tddlgc.service'
import { SharedModule } from '../../sankhya/shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [TddlgcController],
  providers: [TddlgcService],
  exports: [TddlgcService],
})
export class TddlgcModule {}
