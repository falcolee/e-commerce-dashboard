// Centralized error extraction for API/UI
import type { AxiosError } from 'axios';

interface ErrorResponseLike {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: unknown;
}

export function getErrorMessage(err: unknown, fallback = 'An error occurred') {
  if (!err) return fallback;

  // AxiosError with server response
  const ax = err as AxiosError<ErrorResponseLike>;
  if (ax && typeof ax === 'object') {
    const data = ax.response?.data;
    if (data && (data.message || data.error)) {
      return data.message || String(data.error);
    }
  }

  // Our interceptor rejects with ErrorResponse-like objects
  const er = err as ErrorResponseLike;
  if (er && typeof er === 'object' && (er.message || er.error)) {
    return er.message || String(er.error);
  }

  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return fallback;
  }
}

