#!/usr/bin/env node

const axios = require('axios')

const BASE_URL = 'http://localhost:3000'
const SANKHYA_API_URL = 'https://api-nestjs-sankhya-read-producao.gigantao.net'
const USERNAME = 'CONVIDADO'
const PASSWORD = 'guest123'

class SankhyaTester {
  constructor() {
    this.token = null
    this.httpClient = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
    })
  }

  async authenticate() {
    console.log('🔐 Fazendo autenticação...')

    try {
      const response = await this.httpClient.post('/auth/login', {
        username: USERNAME,
        password: PASSWORD,
      })

      this.token = response.data.access_token
      console.log('✅ Autenticação realizada com sucesso!')
      console.log(`📋 Token: ${this.token.substring(0, 50)}...`)

      this.httpClient.defaults.headers.common['Authorization'] =
        `Bearer ${this.token}`

      return this.token
    } catch (error) {
      console.error(
        '❌ Falha na autenticação:',
        error.response?.data || error.message,
      )
      throw error
    }
  }

  async testInspectQuery() {
    console.log('\n🔍 Testando inspect query para estudos...')

    const queries = [
      {
        name: 'Schema da TGFPRO',
        query: 'SELECT TOP 1 * FROM TGFPRO',
        description: 'Verificar estrutura da tabela de produtos',
      },
      {
        name: 'Verificar TIPCONTEST',
        query:
          'SELECT DISTINCT TIPCONTEST FROM TGFPRO WHERE TIPCONTEST IS NOT NULL',
        description: 'Verificar tipos de controle de estoque',
      },
      {
        name: 'Produtos com controle',
        query:
          'SELECT TOP 5 CODPROD, DESCRPROD, TIPCONTEST FROM TGFPRO WHERE TIPCONTEST IS NOT NULL ORDER BY CODPROD',
        description: 'Listar produtos que têm controle de estoque',
      },
      {
        name: 'Verificar TGFTOP',
        query:
          'SELECT TOP 3 CODTIPOPER, DESCROPER, ATUALEST FROM TGFTOP ORDER BY CODTIPOPER',
        description: 'Verificar tipos de operação',
      },
      {
        name: 'Movimentações recentes',
        query:
          "SELECT TOP 3 NUNOTA, CODPROD, DTNEG, TIPMOV FROM TGFCAB WHERE STATUSNOTA = 'L' ORDER BY NUNOTA DESC",
        description: 'Verificar movimentações recentes',
      },
    ]

    for (const test of queries) {
      console.log(`\n📊 ${test.name}:`)
      console.log(`   ${test.description}`)

      try {
        const response = await this.httpClient.post('/inspection/query', {
          query: test.query,
          params: [],
        })

        console.log(`   ✅ Sucesso! (${response.data.length} registros)`)
        if (response.data.length > 0) {
          console.log(
            '   📋 Exemplo de dados:',
            JSON.stringify(response.data[0], null, 6),
          )
        }
      } catch (error) {
        console.log(
          `   ❌ Erro: ${error.response?.data?.message || error.message}`,
        )
      }
    }
  }

  async testConsumoV2() {
    console.log('\n🛒 Testando endpoint de consumo V2...')

    const codprod = 3680
    const dataInicio = '2025-12-01'
    const dataFim = '2025-12-31'

    console.log(`📦 Testando consumo do produto ${codprod}`)
    console.log(`📅 Período: ${dataInicio} a ${dataFim}`)

    try {
      const response = await this.httpClient.get(
        `/tgfpro/consumo-periodo-v2/${codprod}?dataInicio=${dataInicio}&dataFim=${dataFim}&page=1&perPage=10`,
      )

      const data = response.data
      console.log('✅ Consulta de consumo realizada com sucesso!')

      console.log('\n📋 Resumo do consumo:')
      console.log(
        `   Produto: ${data.produto.descrprod} (${data.produto.codprod})`,
      )
      console.log(`   Unidade: ${data.produto.unidade}`)
      console.log(`   Controle: ${data.produto.tipcontest}`)
      console.log(`   Período: ${data.totalDias} dias`)
      console.log(`   Movimentações: ${data.totalMovimentacoes}`)

      console.log('\n📊 Métricas:')
      console.log(
        `   Valor médio período: R$ ${data.metrics.valorMedioPeriodo?.toFixed(2) || 'N/A'}`,
      )
      console.log(
        `   Total entradas (Qtd): ${data.metrics.totalEntradasQtd || 0}`,
      )
      console.log(`   Total saídas (Qtd): ${data.metrics.totalSaidasQtd || 0}`)
      console.log(
        `   Percentual consumo: ${data.metrics.percentualConsumo?.toFixed(2) || 0}%`,
      )
      console.log(
        `   Média consumo/dia: ${data.metrics.mediaConsumoDia?.toFixed(2) || 0}`,
      )
      console.log(
        `   Dias estoque disponível: ${data.metrics.diasEstoqueDisponivel?.toFixed(1) || 0}`,
      )

      console.log('\n💰 Saldos:')
      console.log(
        `   Saldo anterior: ${data.saldoAnterior.saldoQtd} unidades (R$ ${data.saldoAnterior.saldoValorFormatted})`,
      )
      console.log(
        `   Saldo atual: ${data.saldoAtual.saldoQtdFinal} unidades (R$ ${data.saldoAtual.saldoValorFinalFormatted})`,
      )
      console.log(`   Movimento líquido: ${data.movimentoLiquido} unidades`)

      if (
        data.saldoAtual.localizacoes &&
        data.saldoAtual.localizacoes.length > 0
      ) {
        console.log('\n📍 Localizações de estoque:')
        data.saldoAtual.localizacoes.forEach((loc) => {
          console.log(
            `   ${loc.codlocal} - ${loc.descricao}: ${loc.estoque} unidades ${loc.controle ? `(Controle: ${loc.controle})` : ''}`,
          )
        })
      }

      if (data.movimentacoes && data.movimentacoes.length > 0) {
        console.log('\n🔄 Exemplo de movimentações:')
        data.movimentacoes.slice(0, 3).forEach((mov) => {
          console.log(
            `   ${mov.dataReferencia} - Nota ${mov.nunota} - ${mov.quantidadeMov > 0 ? 'Entrada' : 'Saída'}: ${Math.abs(mov.quantidadeMov)} unidades`,
          )
          console.log(
            `   Tipo operação: ${mov.tipoOperacao.descricao} (${mov.tipoOperacao.codtipoper})`,
          )
          if (mov.controle) {
            console.log(`   Controle: ${mov.controle}`)
          }
          if (mov.observacao) {
            console.log(`   Obs: ${mov.observacao}`)
          }
          console.log('')
        })
      }
    } catch (error) {
      console.error(
        '❌ Erro na consulta de consumo:',
        error.response?.data || error.message,
      )

      if (error.response?.status === 404) {
        console.log(
          '\n💡 Dica: Produto não encontrado. Vamos listar alguns produtos disponíveis...',
        )
        await this.listarProdutos()
      }
    }
  }

  async listarProdutos() {
    try {
      const response = await this.httpClient.post('/inspection/query', {
        query:
          "SELECT TOP 5 CODPROD, DESCRPROD, CODVOL, ATIVO FROM TGFPRO WHERE ATIVO = 'S' ORDER BY CODPROD",
        params: [],
      })

      console.log('\n📦 Produtos disponíveis para teste:')
      response.data.forEach((produto) => {
        console.log(
          `   CODPROD: ${produto.CODPROD} - ${produto.DESCRPROD} (${produto.CODVOL})`,
        )
      })
    } catch (error) {
      console.log(
        '❌ Erro ao listar produtos:',
        error.response?.data?.message || error.message,
      )
    }
  }

  async runAllTests() {
    console.log('🚀 Iniciando testes da API Sankhya')
    console.log('='.repeat(50))

    try {
      await this.authenticate()
      await this.testInspectQuery()
      await this.testConsumoV2()

      console.log('\n✅ Todos os testes concluídos com sucesso!')
    } catch (error) {
      console.error('\n❌ Falha nos testes:', error.message)
      process.exit(1)
    }
  }
}

if (require.main === module) {
  const tester = new SankhyaTester()
  tester.runAllTests().catch(console.error)
}

module.exports = SankhyaTester
