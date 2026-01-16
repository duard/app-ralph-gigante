import { Module } from '@nestjs/common'
import { TgflocController } from './tgfloc.controller'
import { TgflocService } from './tgfloc.service'
import { SharedModule } from '../shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [TgflocController],
  providers: [TgflocService],
  exports: [TgflocService],
})
export class TgflocModule {}
