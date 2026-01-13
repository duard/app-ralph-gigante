import { Module } from '@nestjs/common'
import { HealthGateway } from './health.gateway'
import { HealthController } from './health.controller'

@Module({
  providers: [HealthGateway],
  controllers: [HealthController],
})
export class HealthModule {}
