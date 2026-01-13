'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios-instance';

export interface PerformanceMetrics {
  queryTime: number;
  cacheHitRate: number;
  pageSize: number;
  totalItems: number;
  serverSideFiltering: boolean;
  optimizations: string[];
}

export function usePerformanceOptimization() {
  return useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async () => {
      const startTime = performance.now();

      const response = await apiClient.get('/estoque/performance-metrics');

      const queryTime = performance.now() - startTime;

      return {
        ...response.data,
        queryTime,
      };
    },
    staleTime: 30 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useOptimizedProductsQuery(params: {
  page?: number;
  perPage?: number;
  search?: string;
  statusEstoque?: string;
  comMovimento?: boolean;
  semMovimento?: boolean;
  codlocal?: number;
}) {
  const {
    page = 1,
    perPage = 20,
    search,
    statusEstoque,
    comMovimento,
    semMovimento,
    codlocal,
  } = params;

  const queryKey = React.useMemo(
    () => [
      'products-optimized',
      page,
      perPage,
      search,
      statusEstoque,
      comMovimento,
      semMovimento,
      codlocal,
    ],
    [page, perPage, search, statusEstoque, comMovimento, semMovimento, codlocal]
  );

  return useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const startTime = performance.now();

      const response = await apiClient.get('/estoque/ultra-search-optimized', {
        signal,
        params: {
          page,
          perPage,
          ...(search && { search }),
          ...(statusEstoque && { statusEstoque }),
          ...(comMovimento && { comMovimento }),
          ...(semMovimento && { semMovimento }),
          ...(codlocal && { codlocal }),
          includeValor: true,
        },
      });

      const queryTime = performance.now() - startTime;

      if (queryTime > 1000) {
        console.warn(`[Performance] Slow query detected: ${queryTime.toFixed(2)}ms`);
      }

      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    enabled: page >= 1 && perPage > 0,
    placeholderData: (previousData) => ({
      data: previousData?.data || [],
      total: previousData?.total || 0,
      page,
      perPage,
      lastPage: previousData?.lastPage || 1,
      hasMore: previousData?.hasMore || false,
    }),
  });
}

export function useVirtualizedTable(data: any[], enabled: boolean = true) {
  return React.useMemo(() => {
    if (!enabled || data.length === 0) {
      return {
        virtualized: false,
        itemHeight: 0,
        totalHeight: 0,
      };
    }

    const itemHeight = 60;
    const viewportHeight = 600;
    const visibleItems = Math.ceil(viewportHeight / itemHeight) + 5;

    return {
      virtualized: data.length > 100,
      itemHeight,
      totalHeight: data.length * itemHeight,
      visibleItems,
      shouldUseVirtualization: data.length > 100,
    };
  }, [data, enabled]);
}

export function useInfiniteScroll(
  fetchNextPage: (page: number) => Promise<any>,
  initialPage: number = 1
) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [page, setPage] = React.useState(initialPage);
  const [data, setData] = React.useState<any[]>([]);

  const loadMore = React.useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const result = await fetchNextPage(nextPage);

      setData((prev) => [...prev, ...result.data]);
      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('[InfiniteScroll] Error loading more:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore, fetchNextPage]);

  const reset = React.useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setIsLoading(false);
  }, [initialPage]);

  return {
    data,
    isLoading,
    hasMore,
    loadMore,
    reset,
    page,
  };
}

export function useDebouncedSearch<T>(
  searchFunction: (query: string) => Promise<T>,
  delay: number = 300
) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [results, setResults] = React.useState<T | null>(null);
  const debouncedSearchQuery = React.useMemo(
    () => debounce(searchFunction, delay),
    [searchFunction, delay]
  );

  const performSearch = React.useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setResults(null);
        return;
      }

      setIsSearching(true);
      try {
        const result = await debouncedSearchQuery(query);
        setResults(result);
      } catch (error) {
        console.error('[DebouncedSearch] Error:', error);
        setResults(null);
      } finally {
        setIsSearching(false);
      }
    },
    [debouncedSearchQuery]
  );

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, delay, performSearch]);

  return {
    searchQuery,
    setSearchQuery,
    isSearching,
    results,
    performSearch,
  };
}

function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
