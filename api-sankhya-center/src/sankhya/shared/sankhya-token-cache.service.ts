import { Injectable, Logger, Inject } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'

/**
 * Serviço de cache para tokens Sankhya
 * Armazena tokens por usuário e gerencia sua validade
 */
@Injectable()
export class SankhyaTokenCacheService {
  private readonly logger = new Logger(SankhyaTokenCacheService.name)
  private readonly TOKEN_CACHE_TTL = 3600000 // 1 hora em ms (mesmo TTL do token)
  private readonly TOKEN_REFRESH_MARGIN = 300000 // 5 minutos de margem para renovação

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  /**
   * Armazena um token Sankhya no cache
   * @param userId - ID do usuário
   * @param token - Token Sankhya
   * @param expiry - Data de expiração do token
   */
  async setToken(userId: string, token: string, expiry: Date): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(userId)
      const ttl = this.calculateTTL(expiry)

      await this.cache.set(cacheKey, { token, expiry }, ttl)

      this.logger.log(
        `🔐 Token cacheado para usuário ${userId} (validade: ${ttl}ms)`,
      )
    } catch (error) {
      this.logger.error(
        `❌ Falha ao cachear token para usuário ${userId}: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Obtém um token válido do cache
   * @param userId - ID do usuário
   * @returns Token Sankhya ou null se não válido
   */
  async getValidToken(userId: string): Promise<string | null> {
    try {
      const cacheKey = this.getCacheKey(userId)
      const cachedData = await this.cache.get(cacheKey)

      if (!cachedData) {
        this.logger.debug(`🔍 Nenhum token cacheado para usuário ${userId}`)
        return null
      }

      const { token, expiry } = cachedData as { token: string; expiry: Date }
      const now = new Date()

      // Verificar se token ainda é válido
      if (now >= expiry) {
        this.logger.warn(
          `⏰ Token expirado para usuário ${userId}. Removendo do cache.`,
        )
        await this.cache.del(cacheKey)
        return null
      }

      // Verificar se está prestes a expirar (para renovação)
      const timeLeft = expiry.getTime() - now.getTime()
      if (timeLeft <= this.TOKEN_REFRESH_MARGIN) {
        this.logger.warn(
          `⏳ Token prestes a expirar para usuário ${userId} (${Math.round(timeLeft / 1000)}s restante)`,
        )
      }

      this.logger.debug(
        `✅ Token válido retornado para usuário ${userId} (expira em ${Math.round(timeLeft / 1000)}s)`,
      )

      return token
    } catch (error) {
      this.logger.error(
        `❌ Falha ao obter token do cache para usuário ${userId}: ${error.message}`,
      )
      return null
    }
  }

  /**
   * Remove um token do cache
   * @param userId - ID do usuário
   */
  async removeToken(userId: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(userId)
      await this.cache.del(cacheKey)
      this.logger.log(`🗑️ Token removido do cache para usuário ${userId}`)
    } catch (error) {
      this.logger.error(
        `❌ Falha ao remover token do cache para usuário ${userId}: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Verifica se um token precisa ser renovado
   * @param userId - ID do usuário
   * @returns true se precisa de renovação
   */
  async needsRefresh(userId: string): Promise<boolean> {
    try {
      const cachedData = await this.getValidToken(userId)
      if (!cachedData) return true

      const cacheKey = this.getCacheKey(userId)
      const { expiry } = (await this.cache.get(cacheKey)) as { expiry: Date }
      const now = new Date()
      const timeLeft = expiry.getTime() - now.getTime()

      return timeLeft <= this.TOKEN_REFRESH_MARGIN
    } catch (error) {
      this.logger.error(
        `❌ Falha ao verificar necessidade de renovação para usuário ${userId}: ${error.message}`,
      )
      return true // Se falhar, assumir que precisa de renovação
    }
  }

  /**
   * Obtém informações completas do token cacheado
   * @param userId - ID do usuário
   */
  async getTokenInfo(
    userId: string,
  ): Promise<{ token: string; expiry: Date } | null> {
    try {
      const cacheKey = this.getCacheKey(userId)
      return await this.cache.get(cacheKey)
    } catch (error) {
      this.logger.error(
        `❌ Falha ao obter informações do token para usuário ${userId}: ${error.message}`,
      )
      return null
    }
  }

  /**
   * Calcula o TTL para o cache com base na data de expiração
   */
  private calculateTTL(expiry: Date): number {
    const now = new Date()
    const ttl = expiry.getTime() - now.getTime()
    return Math.max(ttl, 0) // Garantir que não seja negativo
  }

  /**
   * Obtém a chave de cache para um usuário
   */
  private getCacheKey(userId: string): string {
    return `sankhya_token_${userId}`
  }
}
