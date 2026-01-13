import { apiClient } from '@/lib/api/client';

/**
 * Preload data for common product navigation scenarios
 */
export class ProductDataPreloader {
  private static cache = new Map<string, any>();
  private static pendingRequests = new Map<string, Promise<any>>();

  /**
   * Preload product detail data
   */
  static async preloadProductDetail(codprod: number): Promise<void> {
    const cacheKey = `product-${codprod}`;

    // Check if data is already cached
    if (this.cache.has(cacheKey)) {
      return;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      return;
    }

    const request = apiClient
      .get(`/produtos-v2/${codprod}/completo`)
      .then((response) => {
        this.cache.set(cacheKey, response.data);
        this.pendingRequests.delete(cacheKey);
      })
      .catch((error) => {
        console.debug('Failed to preload product detail:', error);
        this.pendingRequests.delete(cacheKey);
      });

    this.pendingRequests.set(cacheKey, request);
  }

  /**
   * Preload group summary data
   */
  static async preloadGroupSummary(codgrupoprod: number): Promise<void> {
    const cacheKey = `group-${codgrupoprod}`;

    if (this.cache.has(cacheKey)) {
      return;
    }

    if (this.pendingRequests.has(cacheKey)) {
      return;
    }

    const request = apiClient
      .get(`/produtos-v2/grupo/${codgrupoprod}/resumo`)
      .then((response) => {
        this.cache.set(cacheKey, response.data);
        this.pendingRequests.delete(cacheKey);
      })
      .catch((error) => {
        console.debug('Failed to preload group summary:', error);
        this.pendingRequests.delete(cacheKey);
      });

    this.pendingRequests.set(cacheKey, request);
  }

  /**
   * Preload local summary data
   */
  static async preloadLocalSummary(codlocal: number): Promise<void> {
    const cacheKey = `local-${codlocal}`;

    if (this.cache.has(cacheKey)) {
      return;
    }

    if (this.pendingRequests.has(cacheKey)) {
      return;
    }

    const request = apiClient
      .get(`/produtos-v2/local/${codlocal}/resumo`)
      .then((response) => {
        this.cache.set(cacheKey, response.data);
        this.pendingRequests.delete(cacheKey);
      })
      .catch((error) => {
        console.debug('Failed to preload local summary:', error);
        this.pendingRequests.delete(cacheKey);
      });

    this.pendingRequests.set(cacheKey, request);
  }

  /**
   * Get cached data if available
   */
  static getCached<T>(key: string): T | undefined {
    return this.cache.get(key);
  }

  /**
   * Clear cache (useful for invalidation)
   */
  static clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Prefetch data based on hover events
   */
  static prefetchOnHover(
    element: HTMLElement,
    dataKey: string,
    prefetchFn: () => void
  ): () => void {
    const handleMouseEnter = () => {
      // Small delay to avoid unnecessary prefetching if user just scrolls past
      setTimeout(() => {
        if (!this.cache.has(dataKey) && !this.pendingRequests.has(dataKey)) {
          prefetchFn();
        }
      }, 300);
    };

    element.addEventListener('mouseenter', handleMouseEnter);

    // Cleanup function
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
    };
  }
}
