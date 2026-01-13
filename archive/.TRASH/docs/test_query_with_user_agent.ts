/**
 * Teste com user-agent similar ao curl
 */

import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

async function testQueryWithUserAgent() {
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
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'curl/7.68.0'
          }
        }
      )
    )

    const token = authResponse.data.access_token
    console.log('✅ Token obtido')

    // 2. Testar query com user-agent de curl
    console.log('📊 Testando query com user-agent de curl...')

    const queryResponse = await firstValueFrom(
      httpService.post(
        'https://api-nestjs-sankhya-read-producao.gigantao.net/inspection/query',
        {
          query: 'SELECT TOP 5 CODVEND, NOMEVEND FROM TGFVEN',
          params: []
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'curl/7.68.0'
          }
        }
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

testQueryWithUserAgent()