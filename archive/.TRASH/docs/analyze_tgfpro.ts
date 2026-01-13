/**
 * Script para analisar a estrutura da tabela TGFPRO e suas relações
 */

import axios from 'axios'

async function analyzeTgfpro() {
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

    // 2. Obter schema da tabela TGFPRO
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

    // 3. Obter relações da tabela TGFPRO
    console.log('🔗 Obtendo relações da tabela TGFPRO...')
    const relationsResponse = await axios.get(
      'https://api-nestjs-sankhya-read-producao.gigantao.net/inspection/table-relations?tableName=TGFPRO',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    )

    const relations = relationsResponse.data
    console.log(`✅ Relações obtidas: ${relations.length} relações`)

    // 4. Obter chaves primárias
    console.log('🔑 Obtendo chaves primárias...')
    const primaryKeysResponse = await axios.get(
      'https://api-nestjs-sankhya-read-producao.gigantao.net/inspection/primary-keys/TGFPRO',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    )

    const primaryKeys = primaryKeysResponse.data
    console.log(`✅ Chaves primárias: ${primaryKeys.join(', ')}`)

    // 5. Analisar e exibir informações
    console.log('\n📊 ANÁLISE COMPLETA DA TABELA TGFPRO 📊')
    console.log('='.repeat(50))

    console.log('\n📋 COLUNAS PRINCIPAIS:')
    const importantColumns = [
      'CODPROD', 'DESCRPROD', 'REFERENCIA', 'ATIVO', 'CODGRUPOPROD',
      'CODUNIDADE', 'QTDESTOQUE', 'VLRUNITARIO', 'CODBARRA', 'DTALTER'
    ]

    importantColumns.forEach(colName => {
      const column = schema.columns.find(c => c.COLUMN_NAME === colName)
      if (column) {
        console.log(`  ✅ ${colName}: ${column.DATA_TYPE} (${column.IS_NULLABLE === 'YES' ? 'Nulo' : 'Não nulo'})`)
      }
    })

    console.log('\n🔗 RELAÇÕES IMPORTANTES:')
    relations.forEach(relation => {
      console.log(`  📋 ${relation.ForeignKeyName}:`)
      console.log(`     Tabela: ${relation.ParentTable}`)
      console.log(`     Campo: ${relation.ParentColumn}`)
      console.log(`     Referência: ${relation.ReferencedTable}.${relation.ReferencedColumn}`)
    })

    console.log('\n💡 INFORMAÇÕES PARA DASHBOARD:')
    console.log('  📊 Campos para análise de estoque: CODPROD, DESCRPROD, QTDESTOQUE')
    console.log('  💰 Campos para análise financeira: VLRUNITARIO, VLRULTCOMPRA')
    console.log('  📅 Campos para análise temporal: DTALTER, DTINCLUSAO')
    console.log('  🏷️ Campos para categorização: CODGRUPOPROD, CODUNIDADE, ATIVO')

    console.log('\n🎯 MICROENDPOINTS SUGERIDOS:')
    console.log('  1. /produtos/mais-vendidos?periodo=mensal&top=10')
    console.log('  2. /produtos/estoque-baixo?limite=5')
    console.log('  3. /produtos/valorizado?periodo=anual')
    console.log('  4. /produtos/por-grupo?codGrupo=1')
    console.log('  5. /produtos/movimentacao?dataInicial=2024-01-01&dataFinal=2024-12-31')

  } catch (error) {
    console.error('❌ Erro:', error.message)
    if (error.response) {
      console.error('📋 Status:', error.response.status)
      console.error('📋 Data:', error.response.data)
    }
  }
}

analyzeTgfpro()