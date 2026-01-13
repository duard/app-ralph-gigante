import { Module } from '@nestjs/common'
import { EstoqueGiroController } from './controllers/estoque-giro.controller'
import { EstoqueGiroService } from './services/estoque-giro.service'
import { SharedModule } from '../../shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [EstoqueGiroController],
  providers: [EstoqueGiroService],
  exports: [EstoqueGiroService],
})
export class EstoqueGiroModule {}
