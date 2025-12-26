/**
 * Query Parameter Builder Utilities
 *
 * Provides standardized query parameter handling for API requests.
 * Supports pagination, sorting, search, and filtering with URL encoding.
 */

/**
 * Filter operators for query conditions
 */
export type FilterOperator = 'equals' | 'contains' | 'range';

/**
 * Filter condition structure
 */
export interface FilterCondition {
  operator: FilterOperator;
  value: string | number | [number, number];
}

export type FilterValue = FilterCondition | string | number | [number, number];

export type FilterRecord = Record<string, FilterValue>;

/**
 * Standardized query parameters for API requests
 */
export interface QueryParams {
  page?: number;           // 1-indexed page number
  pageSize?: number;       // Items per page (default: 20, max: 100)
  sortBy?: string;         // Field name to sort by
  order?: 'asc' | 'desc';  // Sort direction
  search?: string;         // Search keyword
  filter?: FilterRecord; // Dynamic filters
}

/**
 * Pagination metadata from API responses
 */
export interface PaginationParams {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Encodes a filter condition value to string format
 */
function encodeFilterValue(condition: FilterCondition): string {
  const { operator, value } = condition;

  if (operator === 'range' && Array.isArray(value)) {
    return `${operator}:${value[0]},${value[1]}`;
  }

  return `${operator}:${value}`;
}

/**
 * Decodes a filter string back to FilterCondition
 */
function decodeFilterValue(encoded: string): FilterCondition {
  const [operator, valueStr] = encoded.split(':') as [FilterOperator, string];

  if (operator === 'range') {
    const [min, max] = valueStr.split(',').map(Number);
    return { operator, value: [min, max] };
  }

  // Try to parse as number, fallback to string
  const numValue = Number(valueStr);
  const value = isNaN(numValue) ? valueStr : numValue;

  return { operator, value };
}

/**
 * Encodes filter conditions to URL query parameters
 *
 * @param filters - Record of field names to filter conditions
 * @returns Array of [key, value] tuples for URLSearchParams
 *
 * @example
 * encodeFilters({ status: { operator: 'equals', value: 'active' } })
 * // Returns: [['filter[status]', 'equals:active']]
 */
function normalizeFilterCondition(condition: FilterValue): FilterCondition {
  if (typeof condition === 'string' || typeof condition === 'number') {
    return { operator: 'equals', value: condition };
  }

  if (Array.isArray(condition)) {
    return { operator: 'range', value: condition };
  }

  return condition;
}

export function encodeFilters(filters: FilterRecord): [string, string][] {
  return Object.entries(filters).map(([field, condition]) => [
    `filter[${field}]`,
    encodeFilterValue(normalizeFilterCondition(condition)),
  ]);
}

/**
 * Decodes filter parameters from URLSearchParams
 *
 * @param searchParams - URLSearchParams instance
 * @returns Record of field names to filter conditions
 *
 * @example
 * const params = new URLSearchParams('filter[status]=equals:active');
 * decodeFilters(params)
 * // Returns: { status: { operator: 'equals', value: 'active' } }
 */
export function decodeFilters(searchParams: URLSearchParams): Record<string, FilterCondition> {
  const filters: Record<string, FilterCondition> = {};

  for (const [key, value] of searchParams.entries()) {
    const match = key.match(/^filter\[(.+)\]$/);
    if (match) {
      const field = match[1];
      filters[field] = decodeFilterValue(value);
    }
  }

  return filters;
}

/**
 * Builds URLSearchParams from QueryParams object
 *
 * @param params - Query parameters object
 * @returns URLSearchParams instance ready for API requests
 *
 * @example
 * buildQueryParams({ page: 1, page_size: 20, search: 'test' })
 * // Returns: URLSearchParams with 'page=1&page_size=20&search=test'
 */
export function buildQueryParams(params: QueryParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  // Add pagination parameters
  if (params.page !== undefined) {
    searchParams.set('page', String(params.page));
  }
  if (params.pageSize !== undefined) {
    searchParams.set('page_size', String(params.pageSize));
  }

  // Add sorting parameters
  if (params.sortBy && params.order) {
    if (params.order === 'desc') {
      searchParams.set('sort_by', `-${params.sortBy}`);
    } else {
      searchParams.set('sort_by', params.sortBy);
    }
  }

  // Add search parameter
  if (params.search) {
    searchParams.set('search', params.search);
  }

  // Add filter parameters
  if (params.filter) {
    const filterEntries = encodeFilters(params.filter);
    filterEntries.forEach(([key, value]) => {
      searchParams.set(key, value);
    });
  }

  return searchParams;
}

/**
 * Parses URLSearchParams into QueryParams object
 *
 * @param searchParams - URLSearchParams instance from URL
 * @returns QueryParams object
 *
 * @example
 * const urlParams = new URLSearchParams('page=1&search=test');
 * parseQueryParams(urlParams)
 * // Returns: { page: 1, search: 'test' }
 */
export function parseQueryParams(searchParams: URLSearchParams): QueryParams {
  const params: QueryParams = {};

  // Parse pagination
  const page = searchParams.get('page');
  if (page) {
    params.page = parseInt(page, 10);
  }

  const pageSize = searchParams.get('page_size');
  if (pageSize) {
    params.pageSize = parseInt(pageSize, 10);
  }

  // Parse sorting
  const sortBy = searchParams.get('sort_by');
  if (sortBy) {
    params.sortBy = sortBy;
  }

  const order = searchParams.get('order');
  if (order === 'asc' || order === 'desc') {
    params.order = order;
  }

  // Parse search
  const search = searchParams.get('search');
  if (search) {
    params.search = search;
  }

  // Parse filters
  const filters = decodeFilters(searchParams);
  if (Object.keys(filters).length > 0) {
    params.filter = filters;
  }

  return params;
}

/**
 * Validates and normalizes query parameters
 *
 * @param params - Query parameters to validate
 * @returns Validated and normalized parameters
 */
export function validateQueryParams(params: QueryParams): QueryParams {
  const validated: QueryParams = { ...params };

  // Validate pageSize (default: 20, max: 100)
  if (validated.pageSize !== undefined) {
    validated.pageSize = Math.min(Math.max(1, validated.pageSize), 100);
  } else {
    validated.pageSize = 20;
  }

  // Validate page (minimum: 1)
  if (validated.page !== undefined) {
    validated.page = Math.max(1, validated.page);
  } else {
    validated.page = 1;
  }

  return validated;
}
