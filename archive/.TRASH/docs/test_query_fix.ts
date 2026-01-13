/**
 * Teste com headers corrigidos
 */

import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { AxiosRequestConfig } from 'axios'

async function testQueryFix() {
  const httpService = new HttpService()
  
  try {
    // 1. Autenticar
    console.log('🔑 Autenticando...')
    const authResponse = await firstValueFrom(
      httpService.post(
        'https://api-nestjs-sankhya-read-producao.gigantao.net/auth/login',
        {
          username: 'CONVIDADO',
          password: 'guest123'
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      )
    )

    const token = authResponse.data.access_token
    console.log('✅ Token obtido')

    // 2. Testar query com headers corrigidos (usando Accept maiúsculo)
    console.log('📊 Testando query com headers corrigidos...')

    const config: AxiosRequestConfig = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',  // Corrigido: Accept maiúsculo
        'Content-Type': 'application/json'
      },
      timeout: 30000,
    }

    const queryData = {
      query: 'SELECT TOP 5 CODVEND, NOMEVEND FROM TGFVEN',
      params: []
    }

    console.log('📋 Headers corrigidos:', JSON.stringify(config.headers, null, 2))

    const queryResponse = await firstValueFrom(
      httpService.post(
        'https://api-nestjs-sankhya-read-producao.gigantao.net/inspection/query',
        queryData,
        config
      )
    )

    console.log('✅ Query executada com sucesso!')
    console.log('📋 Resultados:', JSON.stringify(queryResponse.data, null, 2))

  } catch (error) {
    console.error('❌ Erro:', error.message)
    if (error.response) {
      console.error('📋 Status:', error.response.status)
      console.error('📋 Data:', error.response.data)
    }
  }
}

testQueryFix()