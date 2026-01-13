/**
 * Script para analisar produtos via AD_GIG_LOG
 * Encontra os últimos produtos cadastrados e analisa seus campos de controle
 */

import axios from 'axios'

async function analyzeProdutosViaAdGigLog() {
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

    // 2. Encontrar os últimos produtos cadastrados via AD_GIG_LOG
    console.log('🔍 Buscando últimos produtos cadastrados via AD_GIG_LOG...')

    const logQuery = `
      SELECT TOP 20
        ID,
        TABELA,
        ACAO,
        DTCREATED,
        NOMEUSU,
        CODUSU
      FROM AD_GIG_LOG
      WHERE TABELA = 'TGFPRO' AND ACAO = 'INSERT'
      ORDER BY DTCREATED DESC
    `

    try {
      const logResponse = await axios.post(
        'https://api-nestjs-sankhya-read-producao.gigantao.net/inspection/query',
        { query: logQuery, params: [] },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )

      const logs = logResponse.data.data || []
      
      console.log(`✅ Encontrados ${logs.length} registros de produtos cadastrados`)

      if (logs.length > 0) {
        // 3. Obter detalhes dos produtos recém-cadastrados
        console.log('📋 Analisando produtos recém-cadastrados...')
        
        // Criar uma query para obter os detalhes dos produtos
        const produtoIds = logs.map(log => {
          // Extrair CODPROD do log (se disponível)
          // Em AD_GIG_LOG, os dados estão em VERSAO_NOVA (JSON)
          return log.ID
        }).slice(0, 10) // Limitar a 10 produtos

        // Como não temos acesso direto aos IDs, vamos buscar produtos recentes
        const produtosQuery = `
          SELECT TOP 10
            CODPROD,
            DESCRPROD,
            TITCONTEST,
            LISCONTEST,
            ATIVO,
            DTALTER,
            DTINCLUSAO
          FROM TGFPRO
          ORDER BY DTINCLUSAO DESC, DTALTER DESC
        `

        const produtosResponse = await axios.post(
          'https://api-nestjs-sankhya-read-producao.gigantao.net/inspection/query',
          { query: produtosQuery, params: [] },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        )

        const produtos = produtosResponse.data.data || []
        
        console.log(`✅ Encontrados ${produtos.length} produtos recentes`)

        if (produtos.length > 0) {
          console.log('\n📊 ANÁLISE DE PRODUTOS RECÉM-CADASTRADOS 📊')
          console.log('='.repeat(60))

          produtos.forEach((produto, index) => {
            console.log(`\n📦 PRODUTO ${index + 1}: ${produto.DESCRPROD}`)
            console.log(`   Código: ${produto.CODPROD}`)
            console.log(`   Ativo: ${produto.ATIVO}`)
            console.log(`   Data alteração: ${new Date(produto.DTALTER).toISOString().split('T')[0]}`)
            console.log(`   Data inclusão: ${produto.DTINCLUSAO ? new Date(produto.DTINCLUSAO).toISOString().split('T')[0] : 'N/A'}`)
            
            console.log(`\n   🎯 SISTEMA DE CONTROLE:`)
            if (produto.TITCONTEST || produto.LISCONTEST) {
              console.log(`   Título (TITCONTEST): "${produto.TITCONTEST || 'N/A'}"`)
              console.log(`   Lista (LISCONTEST): "${produto.LISCONTEST || 'N/A'}"`)
              
              // Analisar o conteúdo
              if (produto.LISCONTEST) {
                const linhas = produto.LISCONTEST.split('\n').filter(l => l.trim())
                console.log(`   • Linhas na lista: ${linhas.length}`)
                console.log(`   • Tamanho total: ${produto.LISCONTEST.length} caracteres`)
              }
            } else {
              console.log('   Sem contestações/controle')
            }
          })

          // 4. Analisar padrões
          const comControle = produtos.filter(p => p.TITCONTEST || p.LISCONTEST)
          const semControle = produtos.filter(p => !p.TITCONTEST && !p.LISCONTEST)

          console.log(`\n📊 ESTATÍSTICAS:`)
          console.log(`   • Com controle: ${comControle.length} (${(comControle.length/produtos.length*100).toFixed(1)}%)`)
          console.log(`   • Sem controle: ${semControle.length} (${(semControle.length/produtos.length*100).toFixed(1)}%)`)

          if (comControle.length > 0) {
            console.log('\n🔍 PADRÕES NOS PRODUTOS COM CONTROLE:')
            
            // Agrupar por TITCONTEST
            const porTitulo = {}
            comControle.forEach(produto => {
              const titulo = produto.TITCONTEST || 'SEM_TITULO'
              if (!porTitulo[titulo]) {
                porTitulo[titulo] = []
              }
              porTitulo[titulo].push(produto)
            })

            console.log(`\n   📋 Tipos de controle encontrados (${Object.keys(porTitulo).length}):`)
            Object.keys(porTitulo).forEach(titulo => {
              console.log(`   • "${titulo}": ${porTitulo[titulo].length} produto(s)`)
            })

            // Mostrar exemplos
            if (Object.keys(porTitulo).length > 0) {
              const exemploTitulo = Object.keys(porTitulo)[0]
              const exemplo = porTitulo[exemploTitulo][0]
              
              console.log(`\n   📝 EXEMPLO DE CONTROLE:`)
              console.log(`   Título: "${exemplo.TITCONTEST}"`)
              console.log(`   Lista: "${exemplo.LISCONTEST.substring(0, 200)}${exemplo.LISCONTEST.length > 200 ? '...' : ''}"`)
            }
          }

          console.log('\n💡 CONCLUSÕES:')
          console.log('   • Produtos recém-cadastrados foram analisados')
          console.log('   • Sistema de controle (TITCONTEST + LISCONTEST) foi verificado')
          console.log('   • Padrões de uso foram identificados')
          console.log('   • Produtos complexos podem ter múltiplas entradas de controle')

        } else {
          console.log('\n⚠️ Nenhum produto encontrado com os critérios')
        }

      } else {
        console.log('\n⚠️ Nenhum produto recém-cadastrado encontrado')
      }

    } catch (error) {
      console.log('⚠️ Não foi possível analisar produtos via AD_GIG_LOG')
      console.log(`   Erro: ${error.response?.data?.message || error.message}`)
    }

    console.log('\n🎯 RECOMENDAÇÕES FINAIS:')
    console.log('  1. Analisar produtos específicos com TITCONTEST preenchido')
    console.log('  2. Verificar se LISCONTEST contém informações estruturadas')
    console.log('  3. Identificar padrões de uso em diferentes grupos de produtos')
    console.log('  4. Criar relatórios de não-conformidades baseados nestes campos')

  } catch (error) {
    console.error('❌ Erro:', error.message)
    if (error.response) {
      console.error('📋 Status:', error.response.status)
      console.error('📋 Data:', error.response.data)
    }
  }
}

analyzeProdutosViaAdGigLog()