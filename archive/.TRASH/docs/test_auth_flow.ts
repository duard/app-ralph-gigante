/**
 * Script para testar o fluxo de autenticação e inspeção de tabelas
 * Este script simula o fluxo atual do sistema
 */

import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

class TestAuthFlow {
  private httpService: HttpService
  private sankhyaToken: string | null = null

  constructor() {
    this.httpService = new HttpService()
  }

  /**
   * Testa autenticação com usuário CONVIDADO
   */
  async testAuthentication(): Promise<void> {
    console.log('🔑 Testando autenticação com usuário CONVIDADO...')
    
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api-nestjs-sankhya-read-producao.gigantao.net/auth/login',
          {
            username: 'CONVIDADO',
            password: 'guest123'
          },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        )
      )

      const data = response.data
      if (data && data.access_token) {
        this.sankhyaToken = data.access_token
        console.log('✅ Autenticação bem-sucedida!')
        console.log('🔐 Token recebido:', this.sankhyaToken.substring(0, 50) + '...')
        
        // Decodificar token para ver informações
        const payload = JSON.parse(
          Buffer.from(this.sankhyaToken.split('.')[1], 'base64').toString()
        )
        console.log('📋 Payload do token:', JSON.stringify(payload, null, 2))
        
        return
      }
      
      throw new Error('Token não recebido')
    } catch (error) {
      console.error('❌ Falha na autenticação:', error.message)
      throw error
    }
  }

  /**
   * Testa inspeção da tabela TGFVEN
   */
  async testTableInspection(): Promise<void> {
    if (!this.sankhyaToken) {
      throw new Error('Token não disponível. Execute autenticação primeiro.')
    }

    console.log('🔍 Inspecionando tabela TGFVEN...')

    try {
      // 1. Obter schema da tabela
      console.log('📋 Obtendo schema da tabela...')
      const schemaResponse = await firstValueFrom(
        this.httpService.get(
          'https://api-nestjs-sankhya-read-producao.gigantao.net/inspection/table-schema?tableName=TGFVEN',
          {
            headers: {
              'Authorization': `Bearer ${this.sankhyaToken}`,
              'accept': 'application/json'
            }
          }
        )
      )

      console.log('✅ Schema obtido:', JSON.stringify(schemaResponse.data, null, 2))

      // 2. Obter relações da tabela
      console.log('🔗 Obtendo relações da tabela...')
      const relationsResponse = await firstValueFrom(
        this.httpService.get(
          'https://api-nestjs-sankhya-read-producao.gigantao.net/inspection/table-relations?tableName=TGFVEN',
          {
            headers: {
              'Authorization': `Bearer ${this.sankhyaToken}`,
              'accept': 'application/json'
            }
          }
        )
      )

      console.log('✅ Relações obtidas:', JSON.stringify(relationsResponse.data, null, 2))

      // 3. Obter chaves primárias
      console.log('🔑 Obtendo chaves primárias...')
      const primaryKeysResponse = await firstValueFrom(
        this.httpService.get(
          'https://api-nestjs-sankhya-read-producao.gigantao.net/inspection/primary-keys/TGFVEN',
          {
            headers: {
              'Authorization': `Bearer ${this.sankhyaToken}`,
              'accept': 'application/json'
            }
          }
        )
      )

      console.log('✅ Chaves primárias obtidas:', JSON.stringify(primaryKeysResponse.data, null, 2))

      // 4. Executar uma query simples
      console.log('📊 Executando query de exemplo...')
      const queryResponse = await firstValueFrom(
        this.httpService.post(
          'https://api-nestjs-sankhya-read-producao.gigantao.net/inspection/query',
          {
            query: 'SELECT TOP 5 CODVEND, NOMEVEND FROM TGFVEN',
            params: []
          },
          {
            headers: {
              'Authorization': `Bearer ${this.sankhyaToken}`,
              'accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        )
      )

      console.log('✅ Query executada:', JSON.stringify(queryResponse.data, null, 2))

    } catch (error) {
      console.error('❌ Falha na inspeção da tabela:', error.message)
      if (error.response) {
        console.error('📋 Detalhes do erro:', error.response.data)
      }
      throw error
    }
  }

  /**
   * Executa o fluxo completo de teste
   */
  async run(): Promise<void> {
    try {
      await this.testAuthentication()
      await this.testTableInspection()
      console.log('🎉 Todos os testes concluídos com sucesso!')
    } catch (error) {
      console.error('❌ Fluxo de teste falhou:', error.message)
      process.exit(1)
    }
  }
}

// Executar o teste
const testFlow = new TestAuthFlow()
testFlow.run()