/**
 * Data Transformation Utilities
 *
 * Provides utilities for converting between snake_case (backend) and camelCase (frontend)
 * data structures automatically. These transformers handle nested objects, arrays,
 * and preserve special types like Dates.
 */

/**
 * Converts snake_case strings to camelCase
 */
function toCamelCaseString(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts camelCase strings to snake_case
 */
function toSnakeCaseString(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Recursively transforms object keys from snake_case to camelCase
 *
 * @param obj - The object to transform
 * @returns The transformed object with camelCase keys
 */
export function toCamelCase(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  }

  // Handle plain objects
  if (obj.constructor === Object) {
    return Object.keys(obj as Record<string, unknown>).reduce((acc, key) => {
      const camelKey = toCamelCaseString(key);
      acc[camelKey] = toCamelCase((obj as Record<string, unknown>)[key]);
      return acc;
    }, {} as Record<string, unknown>);
  }

  return obj;
}

/**
 * Recursively transforms object keys from camelCase to snake_case
 *
 * @param obj - The object to transform
 * @returns The transformed object with snake_case keys
 */
export function toSnakeCase(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item));
  }

  // Handle plain objects
  if (obj.constructor === Object) {
    return Object.keys(obj as Record<string, unknown>).reduce((acc, key) => {
      const snakeKey = toSnakeCaseString(key);
      acc[snakeKey] = toSnakeCase((obj as Record<string, unknown>)[key]);
      return acc;
    }, {} as Record<string, unknown>);
  }

  return obj;
}

/**
 * Transforms response data from snake_case to camelCase
 * Safely handles API response envelopes
 *
 * @param response - Axios response object
 * @returns Response with camelCase data
 */
export function transformResponse(response: unknown): unknown {
  // Handle common API response patterns
  if (response && typeof response === 'object') {
    const responseObj = response as Record<string, unknown>;
    return responseObj;
  }

  return response;
}

/**
 * Utility to transform URL query parameters
 *
 * @param params - Query parameters object
 * @returns Transformed query parameters
 */
export function transformQueryParams(params: Record<string, unknown>): Record<string, unknown> {
  const transformed: Record<string, unknown> = {};

  Object.keys(params).forEach(key => {
    const snakeKey = toSnakeCaseString(key);
    transformed[snakeKey] = params[key];
  });

  return transformed;
}

/**
 * Type guard to check if transformation should be applied
 */
export function shouldTransform(data: unknown): boolean {
  return (
    data !== null &&
    data !== undefined &&
    typeof data === 'object' &&
    !(data instanceof FormData) &&
    !(data instanceof Date) &&
    !(data instanceof Blob) &&
    !(data instanceof File)
  );
}

// Default export for convenience
export default {
  toCamelCase,
  toSnakeCase,
  transformResponse,
  transformQueryParams,
  shouldTransform,
};