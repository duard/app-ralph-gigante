import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { ConsumoService } from './consumo.service'
import { ConsumoV2Service } from './consumo-v2.service'
import { ProdutoCacheService } from './utils/produto-cache.service'

@ApiTags('Consumo - Health Check')
@Controller('consumo')
export class ConsumoHealthController {
  constructor(
    private readonly consumoService: ConsumoService,
    private readonly consumoV2Service: ConsumoV2Service,
    private readonly produtoCacheService: ProdutoCacheService,
  ) {}

  @Get('health')
  @ApiOperation({
    summary: 'Health check do serviço de consumo',
    description: 'Verifica o status dos componentes do módulo de consumo',
  })
  @ApiResponse({
    status: 200,
    description: 'Serviço saudável',
    schema: {
      example: {
        status: 'healthy',
        timestamp: '2026-01-10T11:49:34.000Z',
        uptime: 3600,
        services: {
          consumoV1: 'healthy',
          consumoV2: 'healthy',
          cache: 'healthy',
          sankhyaApi: 'healthy',
        },
        cache: {
          totalItems: 125,
          hitRate: 78.5,
          missRate: 21.5,
          totalRequests: 1500,
          topProducts: [
            {
              codprod: 3680,
              descrprod: 'PAPEL SULFITE A4 500 FOLHAS',
              accessCount: 45,
            },
          ],
        },
        version: '2.0.0',
        environment: 'development',
      },
    },
  })
  async healthCheck() {
    const startTime = Date.now()

    const healthStatus = {
      status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: 0,
      services: {
        consumoV1: await this.checkConsumoV1(),
        consumoV2: await this.checkConsumoV2(),
        cache: await this.checkCache(),
        sankhyaApi: await this.checkSankhyaApi(),
      },
      cache: await this.getCacheStats(),
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
    }

    healthStatus.responseTime = Date.now() - startTime

    const serviceValues = Object.values(healthStatus.services)
    const unhealthyServices = serviceValues.filter(
      (status) => status === 'unhealthy',
    ).length
    const degradedServices = serviceValues.filter(
      (status) => status === 'degraded',
    ).length

    if (unhealthyServices > 0) {
      healthStatus.status = 'unhealthy'
    } else if (degradedServices > 0) {
      healthStatus.status = 'degraded'
    }

    return healthStatus
  }

  @Get('health/detailed')
  @ApiOperation({
    summary: 'Health check detalhado do serviço de consumo',
    description: 'Verificação completa com diagnósticos detalhados',
  })
  async detailedHealthCheck() {
    const basicHealth = await this.healthCheck()

    return {
      ...basicHealth,
      diagnostics: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid,
      },
      lastCheck: {
        timestamp: new Date().toISOString(),
        checksPerformed: Object.keys(basicHealth.services).length,
        totalResponseTime: basicHealth.responseTime,
      },
    }
  }

  @Get('health/cache')
  @ApiOperation({
    summary: 'Health check específico do cache',
    description: 'Verifica o status e estatísticas do cache de produtos',
  })
  async cacheHealthCheck() {
    const cacheStats = await this.produtoCacheService.getCacheStats()
    const cacheServiceHealth = await this.checkCache()

    return {
      status: cacheServiceHealth,
      timestamp: new Date().toISOString(),
      stats: cacheStats,
      recommendations: this.generateCacheRecommendations(cacheStats),
    }
  }

  private async checkConsumoV1(): Promise<
    'healthy' | 'degraded' | 'unhealthy'
  > {
    try {
      await this.consumoV2Service.fetchProdutoInfo(0)
      return 'healthy'
    } catch (error) {
      return 'unhealthy'
    }
  }

  private async checkConsumoV2(): Promise<
    'healthy' | 'degraded' | 'unhealthy'
  > {
    try {
      await this.consumoV2Service.fetchProdutoInfo(0)
      return 'healthy'
    } catch (error) {
      return 'unhealthy'
    }
  }

  private async checkCache(): Promise<'healthy' | 'degraded' | 'unhealthy'> {
    try {
      const stats = await this.produtoCacheService.getCacheStats()

      if (stats.hitRate < 50) {
        return 'degraded'
      }

      if (stats.missRate > 80) {
        return 'unhealthy'
      }

      return 'healthy'
    } catch (error) {
      return 'unhealthy'
    }
  }

  private async checkSankhyaApi(): Promise<
    'healthy' | 'degraded' | 'unhealthy'
  > {
    try {
      await this.consumoV2Service.fetchProdutoInfo(0)
      return 'healthy'
    } catch (error) {
      return 'unhealthy'
    }
  }

  private async getCacheStats() {
    try {
      return await this.produtoCacheService.getCacheStats()
    } catch (error) {
      return {
        totalItems: 0,
        hitRate: 0,
        missRate: 0,
        totalRequests: 0,
        totalHits: 0,
        totalMisses: 0,
        topProducts: [],
        error: 'Unable to fetch cache stats',
      }
    }
  }

  private generateCacheRecommendations(stats: any): string[] {
    const recommendations: string[] = []

    if (stats.hitRate < 50) {
      recommendations.push(
        'Baixa taxa de cache hit (<50%). Considere aumentar o TTL ou pré-carregar produtos comuns.',
      )
    }

    if (stats.totalItems === 0) {
      recommendations.push(
        'Cache vazio. Verifique se os produtos estão sendo adicionados corretamente.',
      )
    }

    if (stats.totalItems > 900) {
      recommendations.push(
        'Cache quase cheio (>90%). Considere limpar itens antigos ou aumentar o limite.',
      )
    }

    if (stats.missRate > 80) {
      recommendations.push(
        'Alta taxa de cache miss (>80%). Verifique a estratégia de cache.',
      )
    }

    if (recommendations.length === 0) {
      recommendations.push('Cache operando normalmente.')
    }

    return recommendations
  }
}
