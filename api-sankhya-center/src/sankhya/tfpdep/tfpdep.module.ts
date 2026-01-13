import { Module } from '@nestjs/common'
import { SharedModule } from '../shared/shared.module'
import { TfpdepService } from './tfpdep.service'
import { TfpdepController } from './tfpdep.controller'

@Module({
  imports: [SharedModule],
  providers: [TfpdepService],
  controllers: [TfpdepController],
})
export class TfpdepModule {}
