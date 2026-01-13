import { Module } from '@nestjs/common'
import { SharedModule } from '../shared/shared.module'
import { ConsumoModule } from './consumo/consumo.module'
import { TgfproController } from './tgfpro.controller'
import { TgfproService } from './tgfpro.service'

@Module({
  imports: [SharedModule, ConsumoModule],
  controllers: [TgfproController],
  providers: [TgfproService],
})
export class TgfproModule {}
