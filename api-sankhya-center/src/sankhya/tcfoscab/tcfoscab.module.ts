import { Module } from '@nestjs/common'
import { TcfoscabController } from './tcfoscab.controller'
import { TcfoscabService } from './tcfoscab.service'
import { SharedModule } from '../shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [TcfoscabController],
  providers: [TcfoscabService],
  exports: [TcfoscabService],
})
export class TcfoscabModule {}
