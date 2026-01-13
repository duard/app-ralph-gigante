/**
 * Debug detalhado da rota de query
 */

import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { AxiosRequestConfig } from 'axios'

async function debugQuery() {
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
    console.log('✅ Token obtido:', token.substring(0, 50) + '...')

    // 2. Testar query com debug detalhado
    console.log('📊 Testando query com debug...')

    const config: AxiosRequestConfig = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      // Adicionar timeout para evitar espera longa
      timeout: 30000,
    }

    const queryData = {
      query: 'SELECT TOP 5 CODVEND, NOMEVEND FROM TGFVEN',
      params: []
    }

    console.log('📋 Query a ser executada:', queryData.query)
    console.log('📋 Headers:', JSON.stringify(config.headers, null, 2))

    const queryResponse = await firstValueFrom(
      httpService.post(
        'https://api-nestjs-sankhya-read-producao.gigantao.net/inspection/query',
        queryData,
        config
      )
    )

    console.log('✅ Query executada com sucesso')
    console.log('📋 Resposta completa:', JSON.stringify(queryResponse, null, 2))

    // Verificar estrutura da resposta
    if (queryResponse.data) {
      console.log('📋 Data field:', typeof queryResponse.data)
      console.log('📋 Data content:', JSON.stringify(queryResponse.data, null, 2))
    }

    // Verificar se tem o campo 'data' dentro de data
    if (queryResponse.data && queryResponse.data.data) {
      console.log('📋 Nested data field encontrado:', queryResponse.data.data.length, 'registros')
    }

  } catch (error) {
    console.error('❌ Erro detalhado:')
    console.error('📋 Error message:', error.message)
    console.error('📋 Error name:', error.name)
    console.error('📋 Error stack:', error.stack)
    
    if (error.response) {
      console.error('📋 Response status:', error.response.status)
      console.error('📋 Response headers:', error.response.headers)
      console.error('📋 Response data:', JSON.stringify(error.response.data, null, 2))
    }
    
    if (error.config) {
      console.error('📋 Request config:', JSON.stringify(error.config, null, 2))
    }
  }
}

debugQuery()