import { Module } from '@nestjs/common'
import { SharedModule } from '../sankhya/shared/shared.module'
import { DicionarioController } from './dicionario.controller'
import { TddcamService } from './tddcam.service'
import { TddtabService } from './tddtab.service'
import { TddopcModule } from './tddopc/tddopc.module'
import { TddpcoModule } from './tddpco/tddpco.module'
import { TddinsModule } from './tddins/tddins.module'
import { TddligModule } from './tddlig/tddlig.module'
import { TddlgcModule } from './tddlgc/tddlgc.module'
import { TrdconModule } from './trdcon/trdcon.module'

@Module({
  imports: [
    SharedModule,
    TddopcModule,
    TddpcoModule,
    TddinsModule,
    TddligModule,
    TddlgcModule,
    TrdconModule,
  ],
  controllers: [DicionarioController],
  providers: [TddcamService, TddtabService],
  exports: [TddcamService, TddtabService],
})
export class DicionarioModule {}
