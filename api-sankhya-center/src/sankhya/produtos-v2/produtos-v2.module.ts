import { Module } from '@nestjs/common'
import { ProdutosV2Controller } from './produtos-v2.controller'
import { ProdutosV2Service } from './produtos-v2.service'
import { SharedModule } from '../shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [ProdutosV2Controller],
  providers: [ProdutosV2Service],
  exports: [ProdutosV2Service],
})
export class ProdutosV2Module {}
