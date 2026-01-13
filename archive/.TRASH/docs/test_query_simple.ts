/**
 * Teste simples para verificar a rota de query
 */

import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

async function testSimpleQuery() {
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

    // 2. Testar query simples
    console.log('📊 Testando query simples...')
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
            'accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )
    )

    console.log('✅ Query executada com sucesso:')
    console.log(JSON.stringify(queryResponse.data, null, 2))

  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', error.response.data)
    }
  }
}

testSimpleQuery()