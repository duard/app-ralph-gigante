import { Module } from '@nestjs/common'
import { PessoasController } from './pessoas.controller'
import { PessoasService } from './pessoas.service'
import { SharedModule } from '../shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [PessoasController],
  providers: [PessoasService],
  exports: [PessoasService],
})
export class PessoasModule {}
