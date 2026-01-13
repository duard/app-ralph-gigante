import { Module } from '@nestjs/common'
import { TgfestController } from './tgfest.controller'
import { TgfestService } from './tgfest.service'
import { SharedModule } from '../shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [TgfestController],
  providers: [TgfestService],
})
export class TgfestModule {}
