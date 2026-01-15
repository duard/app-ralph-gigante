import { Module } from '@nestjs/common'
import { ConsumoRelatorioController } from './consumo-relatorio.controller'
import { ConsumoRelatorioService } from './consumo-relatorio.service'
import { SharedModule } from '../../../sankhya/shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [ConsumoRelatorioController],
  providers: [ConsumoRelatorioService],
  exports: [ConsumoRelatorioService],
})
export class ConsumoRelatorioModule {}
