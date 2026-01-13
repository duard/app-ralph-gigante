/**
 * Script para analisar o sistema de controle TITCONTEST + LISCONTEST
 */

import axios from 'axios'

async function analyzeControleSystem() {
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

    // 2. Obter alguns produtos específicos para analisar o sistema de controle
    console.log('📋 Analisando sistema de controle (TITCONTEST + LISCONTEST)...')

    // Query para obter produtos com ambos os campos preenchidos
    const query = `
      SELECT TOP 10
        CODPROD,
        DESCRPROD,
        TITCONTEST,
        LISCONTEST,
        ATIVO,
        DTALTER
      FROM TGFPRO
      WHERE TITCONTEST IS NOT NULL AND LISCONTEST IS NOT NULL
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
      
      console.log(`✅ Encontrados ${produtos.length} produtos com sistema de controle ativo`)

      if (produtos.length > 0) {
        console.log('\n📊 ANÁLISE DO SISTEMA DE CONTROLE 📊')
        console.log('='.repeat(60))

        produtos.slice(0, 3).forEach((produto, index) => {
          console.log(`\n📦 PRODUTO ${index + 1}: ${produto.DESCRPROD}`)
          console.log(`   Código: ${produto.CODPROD}`)
          console.log(`   Ativo: ${produto.ATIVO}`)
          console.log(`   Data: ${new Date(produto.DTALTER).toISOString().split('T')[0]}`)
          
          console.log(`\n   🎯 SISTEMA DE CONTROLE:`)
          console.log(`   Título (TITCONTEST): "${produto.TITCONTEST}"`)
          console.log(`   Lista (LISCONTEST): "${produto.LISCONTEST}"`)
          
          // Analisar o padrão
          const tituloLength = produto.TITCONTEST ? produto.TITCONTEST.length : 0
          const listaLength = produto.LISCONTEST ? produto.LISCONTEST.length : 0
          
          console.log(`\n   📏 ANÁLISE:`)
          console.log(`   • Tamanho do título: ${tituloLength} caracteres`)
          console.log(`   • Tamanho da lista: ${listaLength} caracteres`)
          console.log(`   • Razão lista/título: ${listaLength > 0 ? (listaLength / tituloLength).toFixed(2) : 0}`)
        })

        // 3. Tentar identificar padrões
        console.log('\n🔍 PADRÕES IDENTIFICADOS:')
        
        // Agrupar por TITCONTEST
        const porTitulo = {}
        produtos.forEach(produto => {
          if (produto.TITCONTEST) {
            if (!porTitulo[produto.TITCONTEST]) {
              porTitulo[produto.TITCONTEST] = []
            }
            porTitulo[produto.TITCONTEST].push(produto)
          }
        })

        console.log(`\n   📋 Tipos de controle encontrados (${Object.keys(porTitulo).length}):`)
        Object.keys(porTitulo).forEach(titulo => {
          console.log(`   • "${titulo}": ${porTitulo[titulo].length} produtos`)
        })

        // 4. Exibir exemplos de diferentes tipos
        if (Object.keys(porTitulo).length > 1) {
          console.log('\n📊 EXEMPLOS DE DIFERENTES TIPOS DE CONTROLE:')
          
          Object.keys(porTitulo).slice(0, 3).forEach(titulo => {
            const exemplo = porTitulo[titulo][0]
            console.log(`\n   🏷️ Tipo: "${titulo}"`)
            console.log(`   📋 Exemplo: "${exemplo.LISCONTEST.substring(0, 100)}${exemplo.LISCONTEST.length > 100 ? '...' : ''}"`)
            console.log(`   📊 Quantidade: ${porTitulo[titulo].length} produtos`)
          })
        }

        console.log('\n💡 INTERPRETAÇÃO DO SISTEMA:')
        console.log('   • TITCONTEST: Código/tipo de controle (curto, padronizado)')
        console.log('   • LISCONTEST: Detalhes do controle (longo, descritivo)')
        console.log('   • Juntos formam um sistema de controle de qualidade/problemas')
        console.log('   • Provavelmente usado para gerenciamento de não-conformidades')

      } else {
        console.log('\n⚠️ Nenhum produto com ambos os campos preenchidos encontrado')
        console.log('   Isso pode indicar:')
        console.log('   • Sistema de controle não utilizado')
        console.log('   • Campos usados separadamente')
        console.log('   • Dados em outra tabela relacionada')
      }

    } catch (error) {
      console.log('⚠️ Não foi possível analisar o sistema de controle')
      console.log(`   Erro: ${error.response?.data?.message || error.message}`)
    }

    // 5. Recomendações para microendpoints
    console.log('\n🎯 MICROENDPOINTS RECOMENDADOS PARA SISTEMA DE CONTROLE:')
    console.log('  1. /produtos/controle/tipos')
    console.log('     → Lista todos os tipos de controle (TITCONTEST) e suas quantidades')
    console.log('  2. /produtos/controle/por-tipo?tipo=X')
    console.log('     → Produtos de um tipo específico de controle')
    console.log('  3. /produtos/controle/estatisticas')
    console.log('     → Estatísticas completas do sistema de controle')
    console.log('  4. /produtos/{id}/controle')
    console.log('     → Detalhes do controle de um produto específico')

    console.log('\n🔧 SUGESTÕES DE IMPLEMENTAÇÃO:')
    console.log('  • Criar enum para TITCONTEST com valores comuns')
    console.log('  • Implementar validação dos campos')
    console.log('  • Criar relatórios de não-conformidades')
    console.log('  • Integrar com sistema de qualidade')

  } catch (error) {
    console.error('❌ Erro:', error.message)
    if (error.response) {
      console.error('📋 Status:', error.response.status)
      console.error('📋 Data:', error.response.data)
    }
  }
}

analyzeControleSystem()