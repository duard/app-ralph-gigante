/**
 * Script para analisar AD_GIG_LOG e entender TITCONTEST/LISCONTEST
 * Analisa logs de alteração da tabela TGFPRO
 */

import axios from 'axios'

async function analyzeAdGigLogTgfpro() {
  try {
    console.log('🔑 Autenticando...')

    // 1. Autenticar
    const authResponse = await axios.post(
      'https://api-nestjs-sankhya-read-producao.gigantao.net/auth/login',
      {
        username: 'CONVIDADO',
        password: 'guest123',
      },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )

    const token = authResponse.data.access_token
    console.log('✅ Autenticação bem-sucedida')

    // 2. Analisar logs de alteração da TGFPRO
    console.log('📋 Analisando AD_GIG_LOG para TGFPRO...')

    // Query para obter logs recentes
    const logQuery = `
      SELECT TOP 10 *
      FROM AD_GIG_LOG
      ORDER BY DTCREATED DESC
    `

    try {
      const logResponse = await axios.post(
        'https://api-nestjs-sankhya-read-producao.gigantao.net/inspection/query',
        { query: logQuery, params: [] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      )

      const logs = logResponse.data.data || []

      console.log(
        `✅ Encontrados ${logs.length} registros de alteração em TGFPRO`,
      )

      if (logs.length > 0) {
        console.log('\n📊 ANÁLISE DE AD_GIG_LOG PARA TGFPRO 📊')
        console.log('='.repeat(70))

        // Analisar os logs
        logs.forEach((log, index) => {
          console.log(`\n📦 LOG ${index + 1}:`)
          console.log(`   ID: ${log.ID}`)
          console.log(`   Ação: ${log.ACAO}`)
          console.log(
            `   Data: ${new Date(log.DTCREATED).toISOString().split('T')[0]}`,
          )
          console.log(`   Usuário: ${log.NOMEUSU} (${log.CODUSU})`)

          // Analisar campos alterados
          let titcontest = null
          let listcontest = null
          try {
            if (log.CAMPOS_ALTERADOS) {
              const campos = JSON.parse(log.CAMPOS_ALTERADOS)
              titcontest = campos.TITCONTEST || campos.titcontest
              listcontest = campos.LISTCONTEST || campos.listcontest
            }
            if (!titcontest && log.VERSAO_NOVA) {
              const nova = JSON.parse(log.VERSAO_NOVA)
              titcontest = nova.TITCONTEST || nova.titcontest
              listcontest = nova.LISTCONTEST || nova.listcontest
            }
          } catch (e) {
            // Ignorar erro de parse
          }

          console.log(`\n   🎯 SISTEMA DE CONTROLE NO LOG:`)
          console.log(`   Título (TITCONTEST): "${titcontest || 'N/A'}"`)
          console.log(`   Lista (LISTCONTEST): "${listcontest || 'N/A'}"`)

          // Analisar padrões
          if (titcontest) {
            console.log(`   • Tamanho título: ${titcontest.length} chars`)
          }
          if (listcontest) {
            const linhas = listcontest.split('\n').filter((l) => l.trim())
            console.log(`   • Linhas na lista: ${linhas.length}`)
            console.log(`   • Tamanho lista: ${listcontest.length} chars`)
          }
        })

        // 3. Agrupar por tipo de controle
        const porTitulo = {}
        logs.forEach((log) => {
          let titcontest = null
          try {
            if (log.CAMPOS_ALTERADOS) {
              const campos = JSON.parse(log.CAMPOS_ALTERADOS)
              titcontest = campos.TITCONTEST || campos.titcontest
            }
            if (!titcontest && log.VERSAO_NOVA) {
              const nova = JSON.parse(log.VERSAO_NOVA)
              titcontest = nova.TITCONTEST || nova.titcontest
            }
          } catch (e) {}
          if (titcontest) {
            if (!porTitulo[titcontest]) {
              porTitulo[titcontest] = []
            }
            porTitulo[titcontest].push(log)
          }
        })

        console.log(
          `\n📋 TIPOS DE CONTROLE ENCONTRADOS (${Object.keys(porTitulo).length}):`,
        )
        Object.keys(porTitulo).forEach((titulo) => {
          console.log(`   • "${titulo}": ${porTitulo[titulo].length} registros`)
        })

        // 4. Analisar ações
        const porAcao = {}
        logs.forEach((log) => {
          if (!porAcao[log.ACAO]) {
            porAcao[log.ACAO] = []
          }
          porAcao[log.ACAO].push(log)
        })

        console.log(`\n📋 AÇÕES COM CONTROLE:`)
        Object.keys(porAcao).forEach((acao) => {
          console.log(`   • ${acao}: ${porAcao[acao].length} registros`)
        })

        // 5. Exibir exemplo completo
        if (logs.length > 0) {
          const exemplo = logs[0]
          let titcontest = null
          let listcontest = null
          try {
            if (exemplo.CAMPOS_ALTERADOS) {
              const campos = JSON.parse(exemplo.CAMPOS_ALTERADOS)
              titcontest = campos.TITCONTEST || campos.titcontest
              listcontest = campos.LISTCONTEST || campos.listcontest
            }
            if (!titcontest && exemplo.VERSAO_NOVA) {
              const nova = JSON.parse(exemplo.VERSAO_NOVA)
              titcontest = nova.TITCONTEST || nova.titcontest
              listcontest = nova.LISTCONTEST || nova.listcontest
            }
          } catch (e) {}
          console.log(`\n📝 EXEMPLO COMPLETO DE LOG:`)
          console.log(`   ID: ${exemplo.ID}`)
          console.log(`   Tabela: ${exemplo.TABELA}`)
          console.log(`   Ação: ${exemplo.ACAO}`)
          console.log(`   Data: ${new Date(exemplo.DTCREATED).toISOString()}`)
          console.log(`   Usuário: ${exemplo.NOMEUSU}`)
          console.log(`   Título Controle: "${titcontest || 'N/A'}"`)
          console.log(`   Lista Controle: "${listcontest || 'N/A'}"`)
        }

        console.log('\n💡 INTERPRETAÇÃO DO SISTEMA DE CONTROLE:')
        console.log('   • TITCONTEST: Código/tipo de controle (padronizado)')
        console.log('   • LISCONTEST: Detalhes do controle (descritivo)')
        console.log('   • Juntos formam um sistema de CONTROLE (não problemas)')
        console.log('   • Usado para gerenciamento de qualidade/processos')
        console.log('   • Registrado em alterações de produtos (INSERT/UPDATE)')
      } else {
        console.log('\n⚠️ Nenhum log encontrado para TGFPRO')
        console.log('   Isso pode indicar:')
        console.log('   • Tabela não alterada recentemente')
        console.log('   • Problema na query')
      }
    } catch (error) {
      console.log('⚠️ Não foi possível analisar AD_GIG_LOG')
      console.log(`   Erro: ${error.response?.data?.message || error.message}`)
    }

    // 6. Recomendações para implementação
    console.log('\n🎯 RECOMENDAÇÕES PARA IMPLEMENTAÇÃO:')
    console.log('  1. Criar enum para TITCONTEST com valores encontrados')
    console.log('  2. Implementar histórico de alterações com controle')
    console.log('  3. Criar relatórios de auditoria de produtos')
    console.log('  4. Integrar com sistema de qualidade/processos')
  } catch (error) {
    console.error('❌ Erro:', error.message)
    if (error.response) {
      console.error('📋 Status:', error.response.status)
      console.error('📋 Data:', error.response.data)
    }
  }
}

analyzeAdGigLogTgfpro()
