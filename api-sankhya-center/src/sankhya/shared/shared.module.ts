import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { SankhyaApiService } from './sankhya-api.service'
import { SankhyaTokenCacheService } from './sankhya-token-cache.service'
import { TableInspectionService } from './table-inspection.service'
import { AuthService } from '../auth/auth.service'
import { InspectionController } from './inspection.controller'

@Module({
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL:
          configService.get<string>('API_SANKHYA_READ_BASE_URL') ||
          'https://api-nestjs-sankhya-read-producao.gigantao.net',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    SankhyaApiService,
    SankhyaTokenCacheService,
    TableInspectionService,
    AuthService,
  ],
  controllers: [InspectionController],
  exports: [
    SankhyaApiService,
    SankhyaTokenCacheService,
    TableInspectionService,
  ],
})
export class SharedModule {}
