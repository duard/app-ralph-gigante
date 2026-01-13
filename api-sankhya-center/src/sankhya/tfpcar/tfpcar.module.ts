import { Module } from '@nestjs/common'
import { SharedModule } from '../shared/shared.module'
import { TfpcarService } from './tfpcar.service'
import { TfpcarController } from './tfpcar.controller'

@Module({
  imports: [SharedModule],
  providers: [TfpcarService],
  controllers: [TfpcarController],
})
export class TfpcarModule {}
