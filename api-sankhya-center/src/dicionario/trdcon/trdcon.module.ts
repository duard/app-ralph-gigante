import { Module } from '@nestjs/common'
import { TrdconController } from './trdcon.controller'
import { TrdconService } from './trdcon.service'
import { SharedModule } from '../../sankhya/shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [TrdconController],
  providers: [TrdconService],
  exports: [TrdconService],
})
export class TrdconModule {}
