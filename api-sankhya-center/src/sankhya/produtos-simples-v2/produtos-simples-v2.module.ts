import { Module } from '@nestjs/common'
import { ProdutosSimplesV2Controller } from './produtos-simples-v2.controller'
import { ProdutosSimplesV2Service } from './produtos-simples-v2.service'
import { SharedModule } from '../shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [ProdutosSimplesV2Controller],
  providers: [ProdutosSimplesV2Service],
})
export class ProdutosSimplesV2Module {}
