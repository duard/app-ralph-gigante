/**
 * Script para analisar os campos TITCONTEST e LISCONTEST da tabela TGFPRO
 */

import axios from 'axios'

async function analyzeContestFields() {
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

    // 2. Obter schema da tabela TGFPRO para analisar campos de contestação
    console.log('📋 Obtendo schema da tabela TGFPRO...')
    const schemaResponse = await axios.get(
      'https://api-nestjs-sankhya-read-producao.gigantao.net/inspection/table-schema?tableName=TGFPRO',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    )

    const schema = schemaResponse.data
    console.log(`✅ Schema obtido: ${schema.columns.length} colunas`)

    // 3. Analisar campos TITCONTEST e LISCONTEST
    console.log('\n🔍 ANÁLISE DOS CAMPOS DE CONTESTAÇÃO 🔍')
    console.log('='.repeat(50))

    const titcontestColumn = schema.columns.find(c => c.COLUMN_NAME === 'TITCONTEST')
    const liscontestColumn = schema.columns.find(c => c.COLUMN_NAME === 'LISCONTEST')

    console.log('\n📋 Campo TITCONTEST:')
    if (titcontestColumn) {
      console.log(`  ✅ Encontrado: ${titcontestColumn.DATA_TYPE}`)
      console.log(`  📝 Tipo: ${titcontestColumn.DATA_TYPE}`)
      console.log(`  📏 Tamanho: ${titcontestColumn.CHARACTER_MAXIMUM_LENGTH || 'N/A'}`)
      console.log(`  ❓ Nulo: ${titcontestColumn.IS_NULLABLE === 'YES' ? 'Sim' : 'Não'}`)
      console.log(`  📌 Descrição: Título da contestação`)
    } else {
      console.log('  ❌ Não encontrado na tabela TGFPRO')
    }

    console.log('\n📋 Campo LISCONTEST:')
    if (liscontestColumn) {
      console.log(`  ✅ Encontrado: ${liscontestColumn.DATA_TYPE}`)
      console.log(`  📝 Tipo: ${liscontestColumn.DATA_TYPE}`)
      console.log(`  📏 Tamanho: ${liscontestColumn.CHARACTER_MAXIMUM_LENGTH || 'N/A'}`)
      console.log(`  ❓ Nulo: ${liscontestColumn.IS_NULLABLE === 'YES' ? 'Sim' : 'Não'}`)
      console.log(`  📌 Descrição: Lista de contestações`)
    } else {
      console.log('  ❌ Não encontrado na tabela TGFPRO')
    }

    // 4. Buscar produtos com contestações
    console.log('\n🔎 Buscando produtos com contestações...')
    
    const query = `
      SELECT TOP 10
        CODPROD,
        DESCRPROD,
        TITCONTEST,
        LISCONTEST,
        ATIVO,
        DTALTER
      FROM TGFPRO
      WHERE TITCONTEST IS NOT NULL OR LISCONTEST IS NOT NULL
      ORDER BY DTALTER DESC
    `

    try {
      const produtosResponse = await axios.post(
        'https://api-nestjs-sankhya-read-producao.gigantao.net/inspection/query',
        { query, params: [] },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )

      const produtos = produtosResponse.data.data || []
      
      console.log(`✅ Encontrados ${produtos.length} produtos com contestações`)

      if (produtos.length > 0) {
        console.log('\n📊 EXEMPLOS DE PRODUTOS COM CONTESTAÇÕES:')
        produtos.slice(0, 3).forEach((produto, index) => {
          console.log(`\n  ${index + 1}. ${produto.DESCRPROD} (COD: ${produto.CODPROD})`)
          console.log(`     Título: ${produto.TITCONTEST || 'N/A'}`)
          console.log(`     Lista: ${produto.LISCONTEST || 'N/A'}`)
          console.log(`     Ativo: ${produto.ATIVO}`)
        })
      }

    } catch (error) {
      console.log('  ⚠️ Não foi possível buscar produtos com contestações')
      console.log(`     Erro: ${error.response?.data?.message || error.message}`)
    }

    // 5. Recomendações para microendpoints
    console.log('\n🎯 MICROENDPOINTS RECOMENDADOS PARA CONTESTAÇÕES:')
    console.log('  1. /produtos/com-contestacoes')
    console.log('     → Lista todos os produtos com contestações')
    console.log('  2. /produtos/contestacoes/por-titulo?titulo=X')
    console.log('     → Busca produtos por título de contestação')
    console.log('  3. /produtos/contestacoes/estatisticas')
    console.log('     → Estatísticas de contestações por tipo')
    console.log('  4. /produtos/{id}/contestacoes')
    console.log('     → Detalhes das contestações de um produto específico')

    console.log('\n💡 INFORMAÇÕES ADICIONAIS:')
    console.log('  • TITCONTEST: Título ou tipo da contestação')
    console.log('  • LISCONTEST: Lista detalhada de contestações')
    console.log('  • Estes campos são importantes para controle de qualidade')
    console.log('  • Podem ser usados para identificar produtos problemáticos')

  } catch (error) {
    console.error('❌ Erro:', error.message)
    if (error.response) {
      console.error('📋 Status:', error.response.status)
      console.error('📋 Data:', error.response.data)
    }
  }
}

analyzeContestFields()