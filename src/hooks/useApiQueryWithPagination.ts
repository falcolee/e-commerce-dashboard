/**
 * Enhanced API Query Hook with Pagination Support
 *
 * React hook for managing API queries with automatic pagination support.
 * Integrates with React Query for caching and automatic refetching.
 */

import { useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { QueryParams, validateQueryParams } from '@/lib/queryBuilder';
import type { PaginatedResponse, Pagination } from '@/lib/types';

/**
 * Hook return type with pagination utilities
 */
export interface UseApiQueryWithPaginationReturn<T> {
  data: T[] | undefined;
  pagination: Pagination | undefined;
  isLoading: boolean;
  error: unknown;
  params: QueryParams;
  updateParams: (newParams: Partial<QueryParams>) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSort: (sortBy: string, order?: 'asc' | 'desc') => void;
  setSearch: (search: string) => void;
  setFilter: (field: string, condition: any) => void;
  removeFilter: (field: string) => void;
  clearFilters: () => void;
  reset: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

/**
 * React hook for managing API queries with pagination support
 *
 * @param queryKey - React Query key for caching
 * @param queryFn - Function that fetches data with given parameters
 * @param initialParams - Initial query parameters (optional)
 * @returns Query data and pagination utilities
 */
export function useApiQueryWithPagination<T>(
  queryKey: string[],
  queryFn: (params: QueryParams) => Promise<PaginatedResponse<T>>,
  initialParams: QueryParams = {}
): UseApiQueryWithPaginationReturn<T> {
  const [params, setParams] = useState<QueryParams>(() => {
    const validated = validateQueryParams(initialParams);
    return validated;
  });

  const query = useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => queryFn(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateParams = useCallback((newParams: Partial<QueryParams>) => {
    const merged = { ...params, ...newParams };
    const validated = validateQueryParams(merged);
    setParams(validated);
  }, [params]);

  const setPage = useCallback((page: number) => {
    updateParams({ page });
  }, [updateParams]);

  const setPageSize = useCallback((pageSize: number) => {
    updateParams({ pageSize, page: 1 }); // Reset to page 1 when changing page size
  }, [updateParams]);

  const setSort = useCallback((sortBy: string, order: 'asc' | 'desc' = 'asc') => {
    updateParams({ sortBy, order });
  }, [updateParams]);

  const setSearch = useCallback((search: string) => {
    updateParams({ search, page: 1 }); // Reset to page 1 when searching
  }, [updateParams]);

  const setFilter = useCallback((field: string, condition: any) => {
    const newFilters = { ...params.filter, [field]: condition };
    updateParams({ filter: newFilters, page: 1 }); // Reset to page 1 when filtering
  }, [params.filter, updateParams]);

  const removeFilter = useCallback((field: string) => {
    if (!params.filter) return;

    const newFilters = { ...params.filter };
    delete newFilters[field];

    updateParams({
      filter: Object.keys(newFilters).length > 0 ? newFilters : undefined,
      page: 1,
    });
  }, [params.filter, updateParams]);

  const clearFilters = useCallback(() => {
    updateParams({ filter: undefined, page: 1 });
  }, [updateParams]);

  const reset = useCallback(() => {
    const validated = validateQueryParams(initialParams);
    setParams(validated);
  }, [initialParams]);

  const goToFirstPage = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const goToLastPage = useCallback(() => {
    if (query.data?.pagination?.totalPages) {
      setPage(query.data.pagination.totalPages);
    }
  }, [setPage, query.data?.pagination?.totalPages]);

  const goToNextPage = useCallback(() => {
    if (query.data?.pagination && params.page < query.data.pagination.totalPages) {
      setPage(params.page + 1);
    }
  }, [setPage, params.page, query.data?.pagination]);

  const goToPreviousPage = useCallback(() => {
    if (params.page > 1) {
      setPage(params.page - 1);
    }
  }, [setPage, params.page]);

  const hasNextPage = Boolean(query.data?.pagination && params.page < query.data.pagination.totalPages);
  const hasPreviousPage = params.page > 1;

  return {
    data: query.data?.items,
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
    params,
    updateParams,
    setPage,
    setPageSize,
    setSort,
    setSearch,
    setFilter,
    removeFilter,
    clearFilters,
    reset,
    hasNextPage,
    hasPreviousPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
  };
}

/**
 * Hook for pagination-only data fetching
 *
 * @param queryKey - React Query key for caching
 * @param queryFn - Function that fetches paginated data
 * @param initialPageSize - Initial page size (default: 20)
 * @returns Pagination utilities and data
 */
export function usePaginatedData<T>(
  queryKey: string[],
  queryFn: (params: QueryParams) => Promise<PaginatedResponse<T>>,
  initialPageSize: number = 20
) {
  return useApiQueryWithPagination(queryKey, queryFn, {
    page: 1,
    pageSize: initialPageSize,
  });
}

export default useApiQueryWithPagination;