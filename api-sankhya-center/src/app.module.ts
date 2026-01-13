import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { CacheModule } from '@nestjs/cache-manager'
import { SankhyaModule } from './sankhya/sankhya.module'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { SankhyaTokenInterceptor } from './common/interceptors/sankhya-token.interceptor'
import { SharedModule } from './sankhya/shared/shared.module'
import { HealthModule } from './health/health.module'
import { DicionarioModule } from './dicionario/dicionario.module'

import { AppGateway } from './app.gateway'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'envs'],
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-change-in-prod',
      signOptions: { expiresIn: '1h' },
    }),
    CacheModule.register({ isGlobal: true, ttl: 300000 }), // 5 minutes
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    SharedModule,
    SankhyaModule,
    HealthModule,
    DicionarioModule,
  ],
  providers: [
    AppGateway,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SankhyaTokenInterceptor,
    },
  ],
})
export class AppModule {}
