import { Module } from '@nestjs/common'
import { TgfcabController } from './tgfcab.controller'
import { TgfcabService } from './tgfcab.service'
import { SharedModule } from '../shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [TgfcabController],
  providers: [TgfcabService],
  exports: [TgfcabService],
})
export class TgfcabModule {}
