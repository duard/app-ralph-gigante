import { Module } from '@nestjs/common'
import { TgftopController } from './tgftop.controller'
import { TgftopService } from './tgftop.service'
import { SharedModule } from '../shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [TgftopController],
  providers: [TgftopService],
  exports: [TgftopService],
})
export class TgftopModule {}
