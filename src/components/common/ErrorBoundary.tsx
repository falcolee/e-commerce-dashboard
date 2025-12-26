/**
 * Error Boundary Component
 *
 * A React error boundary that catches JavaScript errors in their child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 *
 * Features:
 * - Automatic error logging
 * - Retry functionality
 * - Development vs production error displays
 * - Customizable fallback UI
 */

import * as React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ErrorResponse } from '@/types/api';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void; reset: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  showDetails?: boolean;
}

/**
 * Default fallback error component
 */
function DefaultErrorFallback({
  error,
  retry,
  reset,
  retryCount = 0,
  maxRetries = 3
}: {
  error: Error;
  retry: () => void;
  reset: () => void;
  retryCount: number;
  maxRetries: number;
}) {
  const isDevelopment = import.meta.env.DEV;
  const canRetry = retryCount < maxRetries;

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
          <p className="text-muted-foreground">
            {error.message || 'An unexpected error occurred while rendering this component.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {canRetry && (
            <Button onClick={retry} variant="default" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again {retryCount > 0 && `(${retryCount}/${maxRetries})`}
            </Button>
          )}
          <Button onClick={() => window.location.href = '/admin'} variant="outline" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Button>
        </div>

        {isDevelopment && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Development Error Details</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="text-sm space-y-1">
                <p><strong>Error:</strong> {error.name}</p>
                <p><strong>Message:</strong> {error.message}</p>
                {error.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer">Stack Trace</summary>
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

/**
 * Error display component for API errors
 */
export function ApiErrorDisplay({
  error,
  onRetry,
  title = 'Error Loading Data'
}: {
  error: ErrorResponse | Error;
  onRetry?: () => void;
  title?: string;
}) {
  const isApiError = error && typeof error === 'object' && 'success' in error && error.success === false;
  const apiError = error as ErrorResponse;

  const getErrorDescription = () => {
    if (isApiError) {
      if (apiError.errors && apiError.errors.length > 0) {
        return apiError.errors.map(err => `${err.field}: ${err.message}`).join(', ');
      }
      return apiError.message || 'An error occurred while communicating with the server.';
    }

    return (error as Error).message || 'An unexpected error occurred.';
  };

  const getErrorSeverity = () => {
    if (isApiError) {
      const errorCode = apiError.error?.toUpperCase();
      if (errorCode === 'NETWORK_ERROR' || errorCode === 'SERVER_ERROR') {
        return 'destructive' as const;
      }
      if (errorCode === 'AUTH_EXPIRED' || errorCode === 'FORBIDDEN') {
        return 'destructive' as const;
      }
      return 'default' as const;
    }
    return 'destructive' as const;
  };

  return (
    <Alert variant={getErrorSeverity()} className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-2">
          <p>{getErrorDescription()}</p>

          {isApiError && apiError.error === 'AUTH_EXPIRED' && (
            <p className="text-sm">
              Your session has expired. Please{' '}
              <button
                onClick={() => window.location.href = '/login'}
                className="underline hover:no-underline"
              >
                log in again
              </button>
              {' '}to continue.
            </p>
          )}

          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Main Error Boundary Component
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log to external service in production
    if (!import.meta.env.DEV) {
      // You could integrate with services like Sentry, LogRocket, etc.
      console.error('Production Error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });
    }
  }

  retry = () => {
    const { maxRetries = 3 } = this.props;

    if (this.state.retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  reset = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback: Fallback, maxRetries = 3, showDetails } = this.props;

    if (hasError && error) {
      if (Fallback) {
        return <Fallback error={error} retry={this.retry} reset={this.reset} />;
      }

      return (
        <DefaultErrorFallback
          error={error}
          retry={this.retry}
          reset={this.reset}
          retryCount={retryCount}
          maxRetries={maxRetries}
        />
      );
    }

    return children;
  }
}

/**
 * Hook for handling API errors in components
 */
export function useErrorHandler() {
  const handleError = React.useCallback((error: unknown): ErrorResponse => {
    // Normalize error to ErrorResponse format
    if (error && typeof error === 'object') {
      // Already an ErrorResponse
      if ('success' in error && error.success === false) {
        return error as ErrorResponse;
      }

      // Axios error
      if ('response' in error) {
        const axiosError = error as any;
        return {
          success: false,
          message: axiosError.response?.data?.message || 'Request failed',
          error: axiosError.response?.data?.error || 'API_ERROR',
          errors: axiosError.response?.data?.errors || [],
        };
      }

      // Standard Error object
      if ('message' in error) {
        return {
          success: false,
          message: (error as Error).message,
          error: 'UNKNOWN_ERROR',
        };
      }
    }

    // String error
    if (typeof error === 'string') {
      return {
        success: false,
        message: error,
        error: 'UNKNOWN_ERROR',
      };
    }

    // Fallback
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: 'UNKNOWN_ERROR',
    };
  }, []);

  return { handleError };
}

export default ErrorBoundary;