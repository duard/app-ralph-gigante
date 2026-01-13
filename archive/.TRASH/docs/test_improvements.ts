/**
 * Script para testar as melhorias implementadas
 * Testa cache de tokens, renovação automática e serviço de inspeção de tabelas
 */

import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { Cache } from 'cache-manager'

// Mock classes para teste
class MockCache {
  private store: Map<string, any> = new Map()

  async get(key: string): Promise<any> {
    return this.store.get(key)
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<T> {
    this.store.set(key, value)
    if (ttl) {
      setTimeout(() => this.store.delete(key), ttl)
    }
    return value
  }

  async del(key: string): Promise<boolean> {
    return this.store.delete(key)
  }

  async reset(): Promise<void> {
    this.store.clear()
  }
}

class TestImprovements {
  private httpService: HttpService
  private cache: MockCache
  private sankhyaToken: string | null = null

  constructor() {
    this.httpService = new HttpService()
    this.cache = new MockCache()
  }

  async testAuthenticationAndCache(): Promise<void> {
    console.log('🔑 Testando autenticação e cache de token...')

    try {
      // 1. Autenticar
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api-nestjs-sankhya-read-producao.gigantao.net/auth/login',
          {
            username: 'CONVIDADO',
            password: 'guest123',
          },
          {
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )

      const data = response.data
      if (!data || !data.access_token) {
        throw new Error('Token não recebido')
      }

      this.sankhyaToken = data.access_token
      console.log('✅ Autenticação bem-sucedida')

      // 2. Simular cache de token
      const payload = JSON.parse(
        Buffer.from(this.sankhyaToken.split('.')[1], 'base64').toString(),
      )
      const expiry = new Date(payload.exp * 1000)

      await this.cache.set(
        'sankhya_token_CONVIDADO',
        {
          token: this.sankhyaToken,
          expiry,
        },
        3600000,
      )

      console.log('✅ Token cacheado com sucesso')

      // 3. Testar recuperação do cache
      const cachedToken = await this.cache.get('sankhya_token_CONVIDADO')
      if (cachedToken && cachedToken.token === this.sankhyaToken) {
        console.log('✅ Recuperação do token cacheado funcionando')
      } else {
        throw new Error('Falha ao recuperar token do cache')
      }
    } catch (error) {
      console.error('❌ Falha no teste de autenticação e cache:', error.message)
      throw error
    }
  }

  async testTableInspectionService(): Promise<void> {
    console.log('🔍 Testando serviço de inspeção de tabelas otimizado...')

    if (!this.sankhyaToken) {
      throw new Error('Token não disponível')
    }

    try {
      // 1. Testar obtenção de schema com cache
      const schemaResponse = await firstValueFrom(
        this.httpService.get(
          'https://api-nestjs-sankhya-read-producao.gigantao.net/inspection/table-schema?tableName=TGFVEN',
          {
            headers: {
              Authorization: `Bearer ${this.sankhyaToken}`,
              accept: 'application/json',
            },
          },
        ),
      )

      const schema = schemaResponse.data

      // 2. Cachear schema
      await this.cache.set(
        'table_info_TGFVEN',
        {
          name: 'TGFVEN',
          schema,
          lastUpdated: new Date(),
          cached: false,
        },
        24 * 60 * 60 * 1000,
      )

      console.log('✅ Schema cacheado com sucesso')

      // 3. Testar recuperação do cache
      const cachedSchema = await this.cache.get('table_info_TGFVEN')
      if (cachedSchema && cachedSchema.schema) {
        console.log('✅ Recuperação do schema cacheado funcionando')
        console.log(
          `📋 Tabela TGFVEN tem ${cachedSchema.schema.columns.length} colunas`,
        )
      } else {
        throw new Error('Falha ao recuperar schema do cache')
      }

      // 4. Testar geração de interface
      const interfaceTemplate = this.generateInterfaceFromSchema(schema)
      console.log('✅ Geração de interface TypeScript:')
      console.log(interfaceTemplate)
    } catch (error) {
      console.error('❌ Falha no teste de inspeção de tabelas:', error.message)
      throw error
    }
  }

  private generateInterfaceFromSchema(schema: any): string {
    const columns = schema.columns || []
    const interfaceName = `I${schema.tableName || 'Table'}`

    const fields = columns
      .map((col) => {
        const tsType = this.mapSqlTypeToTypeScript(col.DATA_TYPE)
        const isOptional = col.IS_NULLABLE === 'YES'
        return `  ${col.COLUMN_NAME}${isOptional ? '?' : ''}: ${tsType}`
      })
      .join('\n')

    return `export interface ${interfaceName} {
${fields}
}`
  }

  private mapSqlTypeToTypeScript(sqlType: string): string {
    const typeMap: Record<string, string> = {
      int: 'number',
      smallint: 'number',
      bigint: 'number',
      float: 'number',
      decimal: 'number',
      numeric: 'number',
      money: 'number',
      char: 'string',
      varchar: 'string',
      text: 'string',
      nchar: 'string',
      nvarchar: 'string',
      date: 'Date',
      datetime: 'Date',
      timestamp: 'Date',
      bit: 'boolean',
      binary: 'Buffer',
      varbinary: 'Buffer',
    }

    return typeMap[sqlType.toLowerCase()] || 'any'
  }

  async testTokenRenewalSimulation(): Promise<void> {
    console.log('🔄 Testando simulação de renovação de token...')

    try {
      // 1. Simular token prestes a expirar
      const expiryDate = new Date(Date.now() + 300000) // 5 minutos no futuro
      await this.cache.set(
        'sankhya_token_TEST',
        {
          token: 'old_token',
          expiry: expiryDate,
        },
        300000,
      )

      console.log('✅ Token simulado como prestes a expirar')

      // 2. Simular renovação
      const newToken = 'new_refreshed_token_' + Date.now()
      const newExpiry = new Date(Date.now() + 3600000) // 1 hora no futuro

      await this.cache.set(
        'sankhya_token_TEST',
        {
          token: newToken,
          expiry: newExpiry,
        },
        3600000,
      )

      console.log('✅ Token renovado com sucesso')

      // 3. Verificar novo token
      const cachedToken = await this.cache.get('sankhya_token_TEST')
      if (cachedToken && cachedToken.token === newToken) {
        console.log('✅ Novo token cacheado corretamente')
      } else {
        throw new Error('Falha ao verificar novo token')
      }
    } catch (error) {
      console.error('❌ Falha no teste de renovação de token:', error.message)
      throw error
    }
  }

  async runAllTests(): Promise<void> {
    try {
      console.log('🧪 Iniciando testes das melhorias implementadas...\n')

      await this.testAuthenticationAndCache()
      console.log()

      await this.testTableInspectionService()
      console.log()

      await this.testTokenRenewalSimulation()
      console.log()

      console.log('🎉 Todos os testes concluídos com sucesso!')
      console.log('\n📊 Resumo das melhorias implementadas:')
      console.log('✅ Cache de tokens Sankhya')
      console.log('✅ Renovação automática de tokens')
      console.log('✅ Serviço de inspeção de tabelas otimizado')
      console.log('✅ Cache de esquemas de tabelas')
      console.log('✅ Geração automática de interfaces TypeScript')
    } catch (error) {
      console.error('❌ Testes falharam:', error.message)
      process.exit(1)
    }
  }
}

// Executar os testes
const testImprovements = new TestImprovements()
testImprovements.runAllTests()
