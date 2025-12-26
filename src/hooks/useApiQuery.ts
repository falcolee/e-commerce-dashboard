/**
 * API Query Hook
 *
 * React hook for managing API query parameters with URL state persistence.
 * Provides utilities for pagination, search, filtering, and sorting with
 * automatic URL synchronization via react-router-dom.
 *
 * @example
 * // Basic pagination
 * const { params, setPage } = useApiQuery({ page_size: 20 });
 * const { data } = useQuery(['users', params], () => apiClient.users.list(params));
 * <Pagination page={params.page} onPageChange={setPage} />
 *
 * @example
 * // Search with filters
 * const { params, setSearch, setFilter } = useApiQuery();
 * setSearch('john');
 * setFilter('status', { operator: 'equals', value: 'active' });
 *
 * @example
 * // Sorting
 * const { params, updateParams } = useApiQuery();
 * updateParams({ sort_by: 'created_at', order: 'desc' });
 */

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  QueryParams,
  FilterCondition,
  buildQueryParams,
  parseQueryParams,
  validateQueryParams,
} from '@/lib/queryBuilder';

/**
 * Hook return type with query parameter utilities
 */
export interface UseApiQueryReturn {
  params: QueryParams;
  updateParams: (newParams: Partial<QueryParams>) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;
  setFilter: (field: string, condition: FilterCondition) => void;
  removeFilter: (field: string) => void;
  clearFilters: () => void;
  setSort: (sortBy: string, order?: 'asc' | 'desc') => void;
  clearSort: () => void;
  reset: () => void;
}

/**
 * React hook for managing API query parameters with URL persistence
 *
 * @param initialParams - Initial query parameters (optional)
 * @returns Query parameter utilities and current state
 */
export function useApiQuery(initialParams?: QueryParams): UseApiQueryReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse current URL parameters
  const urlParams = useMemo(() => parseQueryParams(searchParams), [searchParams]);

  // Merge initial params with URL params (URL takes precedence)
  const params = useMemo(() => {
    const merged = { ...initialParams, ...urlParams };
    return validateQueryParams(merged);
  }, [initialParams, urlParams]);

  /**
   * Updates query parameters and syncs to URL
   */
  const updateParams = useCallback(
    (newParams: Partial<QueryParams>) => {
      const merged = { ...params, ...newParams };
      const validated = validateQueryParams(merged);
      const urlSearchParams = buildQueryParams(validated);
      setSearchParams(urlSearchParams);
    },
    [params, setSearchParams]
  );

  /**
   * Sets the current page number
   */
  const setPage = useCallback(
    (page: number) => {
      updateParams({ page });
    },
    [updateParams]
  );

  /**
   * Sets the page size (items per page)
   */
  const setPageSize = useCallback(
    (pageSize: number) => {
      updateParams({ pageSize, page: 1 }); // Reset to page 1 when changing page size
    },
    [updateParams]
  );

  /**
   * Sets the search keyword
   */
  const setSearch = useCallback(
    (search: string) => {
      updateParams({ search, page: 1 }); // Reset to page 1 when searching
    },
    [updateParams]
  );

  /**
   * Sets a filter condition for a specific field
   */
  const setFilter = useCallback(
    (field: string, condition: FilterCondition) => {
      const newFilters = { ...params.filter, [field]: condition };
      updateParams({ filter: newFilters, page: 1 }); // Reset to page 1 when filtering
    },
    [params.filter, updateParams]
  );

  /**
   * Removes a filter for a specific field
   */
  const removeFilter = useCallback(
    (field: string) => {
      if (!params.filter) return;

      const newFilters = { ...params.filter };
      delete newFilters[field];

      updateParams({
        filter: Object.keys(newFilters).length > 0 ? newFilters : undefined,
        page: 1,
      });
    },
    [params.filter, updateParams]
  );

  /**
   * Clears all filters
   */
  const clearFilters = useCallback(() => {
    updateParams({ filter: undefined, page: 1 });
  }, [updateParams]);

  /**
   * Sets sorting parameters
   */
  const setSort = useCallback(
    (sortBy: string, order: 'asc' | 'desc' = 'asc') => {
      updateParams({ sortBy, order });
    },
    [updateParams]
  );

  /**
   * Clears sorting parameters
   */
  const clearSort = useCallback(() => {
    updateParams({ sortBy: undefined, order: undefined });
  }, [updateParams]);

  /**
   * Resets all query parameters to initial state
   */
  const reset = useCallback(() => {
    const validated = validateQueryParams(initialParams || {});
    const urlSearchParams = buildQueryParams(validated);
    setSearchParams(urlSearchParams);
  }, [initialParams, setSearchParams]);

  return {
    params,
    updateParams,
    setPage,
    setPageSize,
    setSearch,
    setFilter,
    removeFilter,
    clearFilters,
    setSort,
    clearSort,
    reset,
  };
}

/**
 * Hook for pagination-only query management
 *
 * @param initialPageSize - Initial page size (default: 20)
 * @returns Pagination utilities
 */
export function usePagination(initialPageSize: number = 20) {
  const { params, setPage, setPageSize } = useApiQuery({ pageSize: initialPageSize });

  return {
    page: params.page || 1,
    pageSize: params.pageSize || initialPageSize,
    setPage,
    setPageSize,
  };
}

/**
 * Hook for search-only query management
 *
 * @returns Search utilities
 */
export function useSearch() {
  const { params, setSearch } = useApiQuery();

  return {
    search: params.search || '',
    setSearch,
  };
}

/**
 * Hook for filter-only query management
 *
 * @returns Filter utilities
 */
export function useFilters() {
  const { params, setFilter, removeFilter, clearFilters } = useApiQuery();

  return {
    filters: params.filter || {},
    setFilter,
    removeFilter,
    clearFilters,
  };
}

/**
 * Hook for sort-only query management
 *
 * @returns Sort utilities
 */
export function useSort() {
  const { params, setSort, clearSort } = useApiQuery();

  return {
    sortBy: params.sortBy,
    order: params.order,
    setSort,
    clearSort,
  };
}
