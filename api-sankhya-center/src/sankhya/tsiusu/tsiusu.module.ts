import { Module } from '@nestjs/common'
import { TsiusuController } from './tsiusu.controller'
import { TsiusuService } from './tsiusu.service'
import { SharedModule } from '../shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [TsiusuController],
  providers: [TsiusuService],
  exports: [TsiusuService],
})
export class TsiusuModule {}
