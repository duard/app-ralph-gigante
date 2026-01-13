import { Module } from '@nestjs/common'
import { TsiempController } from './tsiemp.controller'
import { TsiempService } from './tsiemp.service'
import { SharedModule } from '../shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [TsiempController],
  providers: [TsiempService],
  exports: [TsiempService],
})
export class TsiempModule {}
