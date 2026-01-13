/**
 * Teste com query simples
 */

import axios from 'axios'

async function testSimpleQuery() {
  try {
    console.log('🔑 Autenticando...')
    
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

    // 2. Testar query simples
    console.log('📊 Testando query simples: SELECT TOP 10 * FROM TGFVEN')

    const queryResponse = await axios.post(
      'https://api-nestjs-sankhya-read-producao.gigantao.net/inspection/query',
      {
        query: 'SELECT TOP 10 * FROM TGFVEN',
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

    console.log('✅ Query executada com sucesso!')
    console.log('📋 Estrutura da resposta:', Object.keys(queryResponse.data))
    console.log('📋 Número de registros:', queryResponse.data.data ? queryResponse.data.data.length : 0)
    
    if (queryResponse.data.data && queryResponse.data.data.length > 0) {
      console.log('📋 Primeiro registro:', queryResponse.data.data[0])
    }

  } catch (error) {
    console.error('❌ Erro:', error.message)
    if (error.response) {
      console.error('📋 Status:', error.response.status)
      console.error('📋 Data:', error.response.data)
    }
  }
}

testSimpleQuery()