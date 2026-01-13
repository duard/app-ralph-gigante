import { Module } from '@nestjs/common'
import { TddpcoController } from './tddpco.controller'
import { TddpcoService } from './tddpco.service'
import { SharedModule } from '../../sankhya/shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [TddpcoController],
  providers: [TddpcoService],
  exports: [TddpcoService],
})
export class TddpcoModule {}
