import { Module } from '@nestjs/common'
import { TgfgruController } from './tgfgru.controller'
import { TgfgruService } from './tgfgru.service'
import { SharedModule } from '../shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [TgfgruController],
  providers: [TgfgruService],
})
export class TgfgruModule {}
