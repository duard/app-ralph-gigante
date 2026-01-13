import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { SankhyaAuthService } from './sankhya-auth.service'

@Module({
  imports: [
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
  providers: [SankhyaAuthService],
  exports: [SankhyaAuthService],
})
export class SankhyaAuthModule {}
