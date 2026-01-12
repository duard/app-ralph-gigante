import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

interface UsePaginationUrlStateOptions {
  defaultPage?: number;
  defaultPageSize?: number;
}

interface PaginationState {
  page: number;
  pageSize: number;
}

export function useUrlPagination(options: UsePaginationUrlStateOptions = {}) {
  const { defaultPage = 1, defaultPageSize = 10 } = options;
  const [searchParams, setSearchParams] = useSearchParams();

  // Get current pagination from URL
  const paginationState = useMemo<PaginationState>(() => {
    const pageParam = searchParams.get('page');
    const pageSizeParam = searchParams.get('pageSize');

    return {
      page: pageParam ? parseInt(pageParam, 10) : defaultPage,
      pageSize: pageSizeParam ? parseInt(pageSizeParam, 10) : defaultPageSize,
    };
  }, [searchParams, defaultPage, defaultPageSize]);

  // Update URL with new pagination
  const updatePagination = useCallback(
    (updates: Partial<PaginationState>) => {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);

          if (updates.page !== undefined) {
            if (updates.page === defaultPage) {
              newParams.delete('page');
            } else {
              newParams.set('page', updates.page.toString());
            }
          }

          if (updates.pageSize !== undefined) {
            if (updates.pageSize === defaultPageSize) {
              newParams.delete('pageSize');
            } else {
              newParams.set('pageSize', updates.pageSize.toString());
            }
            // Reset to page 1 when changing page size
            if (updates.page === undefined) {
              newParams.delete('page');
            }
          }

          return newParams;
        },
        { replace: true } // Use replace to avoid cluttering browser history
      );
    },
    [setSearchParams, defaultPage, defaultPageSize]
  );

  const goToPage = useCallback(
    (page: number) => {
      console.log('[useUrlPagination] goToPage called with:', page);
      updatePagination({ page });
    },
    [updatePagination]
  );

  const changePageSize = useCallback(
    (pageSize: number) => {
      updatePagination({ pageSize, page: 1 });
    },
    [updatePagination]
  );

  return {
    page: paginationState.page,
    pageSize: paginationState.pageSize,
    goToPage,
    changePageSize,
    updatePagination,
  };
}
