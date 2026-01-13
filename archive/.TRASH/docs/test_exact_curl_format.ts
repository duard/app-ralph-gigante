/**
 * Teste com formato exato do curl
 */

import axios from 'axios'

async function testExactCurlFormat() {
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

    // 2. Testar query com formato exato do curl
    console.log('📊 Testando query com formato exato do curl...')

    // Usar a query complexa que funciona no curl
    const complexQuery = `SELECT TOP 10
  F.CODEMP,
  F.CODFUNC,
  F.NOMEFUNC,
  F.DTNASC,
  F.DTADM,
  F.CPF,
  F.CELULAR,
  F.EMAIL,
  F.SITUACAO,
  U.CODUSU,
  U.NOMEUSU,
  U.EMAIL AS EMAILUSU,
  U.AD_TELEFONECORP,
  P.CODPARC,
  P.NOMEPARC
FROM TFPFUN F
LEFT JOIN TSIUSU U
  ON F.CODEMP = U.CODEMP AND F.CODFUNC = U.CODFUNC
LEFT JOIN TGFPAR P
  ON F.CODPARC = P.CODPARC
ORDER BY F.DTADM DESC;`

    const queryResponse = await axios.post(
      'https://api-nestjs-sankhya-read-producao.gigantao.net/inspection/query',
      {
        query: complexQuery,
        params: []
      },
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
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

testExactCurlFormat()