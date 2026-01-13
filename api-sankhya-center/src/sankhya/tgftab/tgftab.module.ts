import { Module } from '@nestjs/common'
import { TgftabController } from './tgftab.controller'
import { TgftabService } from './tgftab.service'
import { SharedModule } from '../shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [TgftabController],
  providers: [TgftabService],
})
export class TgftabModule {}
