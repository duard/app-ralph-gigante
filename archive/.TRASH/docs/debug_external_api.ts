/**
 * Debug completo da API externa
 */

import axios from 'axios'

async function debugExternalApi() {
  try {
    console.log('🔑 Autenticando na API externa...')
    
    // 1. Autenticar
    const authResponse = await axios.post(
      'https://api-nestjs-sankhya-read-producao.gigantao.net/auth/login',
      {
        username: 'CONVIDADO',
        password: 'guest123'
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )

    const token = authResponse.data.access_token
    console.log('✅ Autenticação bem-sucedida')
    console.log('🔐 Token:', token.substring(0, 50) + '...')

    // 2. Testar query com axios puro para ver erro completo
    console.log('📊 Testando query com axios puro...')

    const queryResponse = await axios.post(
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
        },
        // Habilitar resposta completa incluindo headers
        validateStatus: () => true // Não rejeitar por status code
      }
    )

    console.log('✅ Query executada!')
    console.log('📋 Status:', queryResponse.status)
    console.log('📋 Headers:', queryResponse.headers)
    console.log('📋 Data:', queryResponse.data)

  } catch (error) {
    console.error('❌ Erro completo da API externa:')
    
    if (error.response) {
      console.error('📋 Status:', error.response.status)
      console.error('📋 Status Text:', error.response.statusText)
      console.error('📋 Headers:', error.response.headers)
      console.error('📋 Data:', error.response.data)
      console.error('📋 Config:', error.response.config)
    } else if (error.request) {
      console.error('📋 Request:', error.request)
    } else {
      console.error('📋 Message:', error.message)
    }
    
    console.error('📋 Error object:', error)
  }
}

debugExternalApi()