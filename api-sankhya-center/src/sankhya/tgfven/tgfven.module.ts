import { Module } from '@nestjs/common'
import { TgfvenController } from './tgfven.controller'
import { TgfvenService } from './tgfven.service'
import { SharedModule } from '../shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [TgfvenController],
  providers: [TgfvenService],
})
export class TgfvenModule {}
