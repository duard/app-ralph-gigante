import { Module } from '@nestjs/common'
import { TfpfunService } from './tfpfun.service'
import { TfpfunController } from './tfpfun.controller'
import { SharedModule } from '../shared/shared.module'

@Module({
  imports: [SharedModule],
  providers: [TfpfunService],
  controllers: [TfpfunController],
})
export class TfpfunModule {}
