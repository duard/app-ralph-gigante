import { Injectable, Logger, Inject } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager'

export interface ProdutoCacheItem {
  codprod: number
  descrprod: string
  complemento?: string
  unidade: string
  ativo: string
  tipcontest: string
  timestamp: number
  ttl: number
  accessCount?: number
}

export interface CacheStats {
  totalItems: number
  hitRate: number
  missRate: number
  totalRequests: number
  totalHits: number
  totalMisses: number
  oldestItem?: Date
  newestItem?: Date
  topProducts: Array<{
    codprod: number
    descrprod: string
    accessCount: number
  }>
}

@Injectable()
export class ProdutoCacheService {
  private readonly logger = new Logger(ProdutoCacheService.name)
  private readonly cacheKey = 'produtos_cache'
  private readonly statsKey = 'produtos_cache_stats'
  private readonly defaultTTL = 3600000
  private readonly maxItems = 1000

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getProduto(codprod: number): Promise<ProdutoCacheItem | null> {
    const startTime = Date.now()

    try {
      const cacheData = await this.cacheManager.get<{
        [key: number]: ProdutoCacheItem
      }>(this.cacheKey)

      if (!cacheData || !cacheData[codprod]) {
        await this.incrementStats('miss')
        this.logger.debug(`Cache MISS para produto ${codprod}`)
        return null
      }

      const produto = cacheData[codprod]

      if (Date.now() > produto.timestamp + produto.ttl) {
        await this.removeProduto(codprod)
        await this.incrementStats('miss')
        this.logger.debug(`Cache EXPIRADO para produto ${codprod}`)
        return null
      }

      await this.incrementStats('hit')
      await this.incrementAccessCount(codprod)
      produto.accessCount = (produto.accessCount || 0) + 1

      this.logger.debug(
        `Cache HIT para produto ${codprod} (${Date.now() - startTime}ms)`,
      )
      return produto
    } catch (error) {
      this.logger.error(`Erro ao buscar produto ${codprod} no cache:`, error)
      await this.incrementStats('miss')
      return null
    }
  }

  async setProduto(
    codprod: number,
    produtoData: Partial<ProdutoCacheItem>,
    ttl: number = this.defaultTTL,
  ): Promise<void> {
    try {
      const cacheData =
        (await this.cacheManager.get<{ [key: number]: ProdutoCacheItem }>(
          this.cacheKey,
        )) || {}

      if (Object.keys(cacheData).length >= this.maxItems) {
        await this.cleanupOldItems()
      }

      const produtoCache: ProdutoCacheItem = {
        codprod,
        descrprod: produtoData.descrprod || '',
        complemento: produtoData.complemento,
        unidade: produtoData.unidade || '',
        ativo: produtoData.ativo || '',
        tipcontest: produtoData.tipcontest || '',
        timestamp: Date.now(),
        ttl,
        accessCount: 1,
      }

      cacheData[codprod] = produtoCache
      await this.cacheManager.set(this.cacheKey, cacheData)

      this.logger.debug(`Produto ${codprod} adicionado ao cache`)
    } catch (error) {
      this.logger.error(`Erro ao adicionar produto ${codprod} ao cache:`, error)
    }
  }

  async removeProduto(codprod: number): Promise<void> {
    try {
      const cacheData = await this.cacheManager.get<{
        [key: number]: ProdutoCacheItem
      }>(this.cacheKey)

      if (cacheData && cacheData[codprod]) {
        delete cacheData[codprod]
        await this.cacheManager.set(this.cacheKey, cacheData)
        this.logger.debug(`Produto ${codprod} removido do cache`)
      }
    } catch (error) {
      this.logger.error(`Erro ao remover produto ${codprod} do cache:`, error)
    }
  }

  async clearCache(): Promise<void> {
    try {
      await this.cacheManager.del(this.cacheKey)
      await this.resetStats()
      this.logger.log('Cache de produtos limpo com sucesso')
    } catch (error) {
      this.logger.error('Erro ao limpar cache de produtos:', error)
    }
  }

  async getCacheStats(): Promise<CacheStats> {
    try {
      const stats = (await this.cacheManager.get<any>(this.statsKey)) || {
        totalRequests: 0,
        totalHits: 0,
        totalMisses: 0,
        accessCounts: {},
      }

      const cacheData =
        (await this.cacheManager.get<{ [key: number]: ProdutoCacheItem }>(
          this.cacheKey,
        )) || {}

      const totalItems = Object.keys(cacheData).length
      const hitRate =
        stats.totalRequests > 0
          ? (stats.totalHits / stats.totalRequests) * 100
          : 0
      const missRate =
        stats.totalRequests > 0
          ? (stats.totalMisses / stats.totalRequests) * 100
          : 0

      let oldestItem: Date | undefined
      let newestItem: Date | undefined

      if (totalItems > 0) {
        const timestamps = Object.values(cacheData).map((p) => p.timestamp)
        oldestItem = new Date(Math.min(...timestamps))
        newestItem = new Date(Math.max(...timestamps))
      }

      const topProducts = Object.entries(stats.accessCounts)
        .map(([codprod, count]) => ({
          codprod: parseInt(codprod),
          accessCount: count as number,
        }))
        .sort((a, b) => b.accessCount - a.accessCount)
        .slice(0, 10)
        .map((item) => ({
          ...item,
          descrprod: cacheData[item.codprod]?.descrprod || 'N/A',
        }))

      return {
        totalItems,
        hitRate: Math.round(hitRate * 100) / 100,
        missRate: Math.round(missRate * 100) / 100,
        totalRequests: stats.totalRequests,
        totalHits: stats.totalHits,
        totalMisses: stats.totalMisses,
        oldestItem,
        newestItem,
        topProducts,
      }
    } catch (error) {
      this.logger.error('Erro ao obter estatísticas do cache:', error)
      return {
        totalItems: 0,
        hitRate: 0,
        missRate: 0,
        totalRequests: 0,
        totalHits: 0,
        totalMisses: 0,
        topProducts: [],
      }
    }
  }

  async preloadCommonProducts(limit: number = 50): Promise<void> {
    this.logger.log(`Iniciando preload dos ${limit} produtos mais comuns...`)

    try {
      const cacheData =
        (await this.cacheManager.get<{ [key: number]: ProdutoCacheItem }>(
          this.cacheKey,
        )) || {}

      const produtosParaRemover = Object.keys(cacheData)
        .map(Number)
        .slice(limit)

      for (const codprod of produtosParaRemover) {
        await this.removeProduto(codprod)
      }

      this.logger.log(
        `Preload concluído. Cache com ${Object.keys(cacheData).length} itens.`,
      )
    } catch (error) {
      this.logger.error('Erro durante preload de produtos:', error)
    }
  }

  private async incrementStats(type: 'hit' | 'miss'): Promise<void> {
    try {
      const stats = (await this.cacheManager.get<any>(this.statsKey)) || {
        totalRequests: 0,
        totalHits: 0,
        totalMisses: 0,
        accessCounts: {},
      }

      stats.totalRequests++
      if (type === 'hit') {
        stats.totalHits++
      } else {
        stats.totalMisses++
      }

      await this.cacheManager.set(this.statsKey, stats)
    } catch (error) {
      this.logger.error('Erro ao incrementar estatísticas:', error)
    }
  }

  private async incrementAccessCount(codprod: number): Promise<void> {
    try {
      const stats = (await this.cacheManager.get<any>(this.statsKey)) || {
        totalRequests: 0,
        totalHits: 0,
        totalMisses: 0,
        accessCounts: {},
      }

      if (!stats.accessCounts) {
        stats.accessCounts = {}
      }

      stats.accessCounts[codprod] = (stats.accessCounts[codprod] || 0) + 1
      await this.cacheManager.set(this.statsKey, stats)
    } catch (error) {
      this.logger.error('Erro ao incrementar contador de acesso:', error)
    }
  }

  private async resetStats(): Promise<void> {
    try {
      await this.cacheManager.set(this.statsKey, {
        totalRequests: 0,
        totalHits: 0,
        totalMisses: 0,
        accessCounts: {},
      })
    } catch (error) {
      this.logger.error('Erro ao resetar estatísticas:', error)
    }
  }

  private async cleanupOldItems(): Promise<void> {
    try {
      const cacheData =
        (await this.cacheManager.get<{ [key: number]: ProdutoCacheItem }>(
          this.cacheKey,
        )) || {}

      const now = Date.now()
      const itemsToRemove: number[] = []

      for (const [codprod, produto] of Object.entries(cacheData)) {
        if (now > produto.timestamp + produto.ttl) {
          itemsToRemove.push(parseInt(codprod))
        }
      }

      for (const codprod of itemsToRemove) {
        delete cacheData[codprod]
      }

      if (Object.keys(cacheData).length > this.maxItems) {
        const sortedItems = Object.entries(cacheData)
          .sort(([, a], [, b]) => a.timestamp - b.timestamp)
          .slice(0, Object.keys(cacheData).length - this.maxItems)

        for (const [codprod] of sortedItems) {
          delete cacheData[parseInt(codprod)]
        }
      }

      await this.cacheManager.set(this.cacheKey, cacheData)

      if (itemsToRemove.length > 0) {
        this.logger.debug(
          `Cleanup: ${itemsToRemove.length} itens removidos por expiração`,
        )
      }
    } catch (error) {
      this.logger.error('Erro durante cleanup do cache:', error)
    }
  }
}
