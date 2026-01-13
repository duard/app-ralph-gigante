import { Module } from '@nestjs/common'
import { TgfiteController } from './tgfite.controller'
import { TgfiteService } from './tgfite.service'
import { SharedModule } from '../shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [TgfiteController],
  providers: [TgfiteService],
  exports: [TgfiteService],
})
export class TgfiteModule {}
