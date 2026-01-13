/**
 * Teste direto sem validação
 */

import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

async function testQueryDirect() {
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

    // 2. Testar query direta (sem passar pelo nosso serviço)
    console.log('📊 Testando query direta...')

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
            'Content-Type': 'application/json'
          }
        }
      )
    )

    console.log('✅ Query executada com sucesso!')
    console.log('📋 Resposta completa:', JSON.stringify(queryResponse, null, 2))

    // Analisar estrutura da resposta
    if (queryResponse.data) {
      console.log('📋 Tipo de data:', typeof queryResponse.data)
      console.log('📋 É array?', Array.isArray(queryResponse.data))
      
      if (Array.isArray(queryResponse.data)) {
        console.log('📋 Número de registros:', queryResponse.data.length)
        console.log('📋 Primeiro registro:', queryResponse.data[0])
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error.message)
    if (error.response) {
      console.error('📋 Status:', error.response.status)
      console.error('📋 Headers:', error.response.headers)
      console.error('📋 Data:', error.response.data)
    }
  }
}

testQueryDirect()