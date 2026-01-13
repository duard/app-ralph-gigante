import { Module } from '@nestjs/common'
import { SharedModule } from '../shared/shared.module'
import { TgfparService } from './tgfpar.service'
import { TgfparController } from './tgfpar.controller'

@Module({
  imports: [SharedModule],
  providers: [TgfparService],
  controllers: [TgfparController],
})
export class TgfparModule {}
