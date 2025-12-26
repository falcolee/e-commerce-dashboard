/**
 * Feature Flags Configuration
 *
 * Centralized configuration for enabling/disabling features.
 * Reads from environment variables with fallback defaults.
 */

// Get feature flag from environment variable with default value
const getEnvFlag = (key: string, defaultValue: boolean = false): boolean => {
  if (import.meta.env[key] !== undefined) {
    return import.meta.env[key] === 'true' || import.meta.env[key] === '1';
  }
  return defaultValue;
};

// Get numeric feature value from environment variable
const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

export const FEATURES = {
  // Data transformation features
  RESPONSE_TRANSFORMATION: getEnvFlag('VITE_API_TRANSFORM_ENABLED', true),
  TYPE_GENERATION: getEnvFlag('VITE_TYPE_GENERATION_ENABLED', import.meta.env.DEV),

  // Dashboard features
  REAL_TIME_DASHBOARD: getEnvFlag('VITE_REAL_TIME_DASHBOARD', true),
  ADVANCED_ANALYTICS: getEnvFlag('VITE_ADVANCED_ANALYTICS', false),
  EXPORT_DASHBOARD: getEnvFlag('VITE_EXPORT_DASHBOARD', false),

  // API features
  CACHING_ENABLED: getEnvFlag('VITE_CACHING_ENABLED', true),
  CACHE_DURATION: getEnvNumber('VITE_CACHE_DURATION', 5 * 60 * 1000), // 5 minutes
  RETRY_REQUESTS: getEnvFlag('VITE_RETRY_REQUESTS', true),
  MAX_RETRY_ATTEMPTS: getEnvNumber('VITE_MAX_RETRY_ATTEMPTS', 3),

  // UI/UX features
  DARK_MODE: getEnvFlag('VITE_DARK_MODE', true),
  COMPACT_MODE: getEnvFlag('VITE_COMPACT_MODE', false),
  ANIMATIONS_ENABLED: getEnvFlag('VITE_ANIMATIONS_ENABLED', true),

  // Development features
  DEBUG_MODE: getEnvFlag('VITE_DEBUG_MODE', import.meta.env.DEV),
  DEVTOOLS: getEnvFlag('VITE_DEVTOOLS', import.meta.env.DEV),
  USE_MOCK: getEnvFlag('VITE_USE_MOCK', false),

  // Experimental features
  BULK_OPERATIONS: getEnvFlag('VITE_BULK_OPERATIONS', true),
  ADVANCED_FILTERING: getEnvFlag('VITE_ADVANCED_FILTERING', true),
  REAL_TIME_UPDATES: getEnvFlag('VITE_REAL_TIME_UPDATES', false),
  OFFLINE_MODE: getEnvFlag('VITE_OFFLINE_MODE', false),

  // Legacy compatibility
  DEV_MODE: getEnvFlag('VITE_DEV_MODE', false),
};

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: keyof typeof FEATURES): boolean => {
  return Boolean(FEATURES[feature]);
};

/**
 * Feature-specific configurations
 */
export const QUERY_CONFIG = {
  // Default stale time for React Query
  staleTime: FEATURES.CACHING_ENABLED ? FEATURES.CACHE_DURATION : 0,

  // Default retry attempts
  retry: FEATURES.RETRY_REQUESTS ? FEATURES.MAX_RETRY_ATTEMPTS : 0,

  // Refetch on window focus
  refetchOnWindowFocus: FEATURES.CACHING_ENABLED,

  // Refetch on reconnect
  refetchOnReconnect: true,

  // Retry delay function
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

export const API_CONFIG = {
  // Base timeout for API requests
  timeout: 10000,

  // Enable request/response transformation
  transformEnabled: FEATURES.RESPONSE_TRANSFORMATION,

  // Enable automatic retries
  retryEnabled: FEATURES.RETRY_REQUESTS,

  // Maximum retry attempts
  maxRetries: FEATURES.MAX_RETRY_ATTEMPTS,
};

export const UI_CONFIG = {
  // Animation duration
  animationDuration: FEATURES.ANIMATIONS_ENABLED ? 200 : 0,

  // Enable dark mode
  darkModeEnabled: FEATURES.DARK_MODE,

  // Compact mode
  compactMode: FEATURES.COMPACT_MODE,

  // Pagination
  defaultPageSize: 20,
  pageSizes: [10, 20, 50, 100],

  // Table
  tableRowsPerPage: 20,
  tableMaxRows: 100,
};

export default FEATURES;