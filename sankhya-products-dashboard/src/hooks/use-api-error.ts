import { useState, useCallback } from 'react'
import type { AxiosError } from 'axios'

export interface ApiErrorDetails {
  message: string
  status?: number
  statusText?: string
  url?: string
  method?: string
  timestamp?: string
  details?: Record<string, unknown>
  stack?: string[]
  step?: string
  errorType?: string
  requestId?: string
  debug?: {
    query?: Record<string, unknown>
    params?: Record<string, unknown>
    body?: unknown
    headers?: Record<string, unknown>
    user?: unknown
  }
}

/**
 * Extrai detalhes de um erro de API
 */
export function extractApiError(error: unknown): ApiErrorDetails {
  if (!error) {
    return { message: 'Erro desconhecido', timestamp: new Date().toISOString() }
  }

  // Axios error
  if (typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<ApiErrorDetails>
    const response = axiosError.response
    const data = response?.data

    return {
      message: data?.message || axiosError.message || 'Erro na requisição',
      status: response?.status,
      statusText: response?.statusText,
      url: axiosError.config?.url,
      method: axiosError.config?.method?.toUpperCase(),
      timestamp: data?.timestamp || new Date().toISOString(),
      details: data?.details,
      stack: data?.stack,
      step: data?.step,
      errorType: data?.errorType,
      requestId: data?.requestId,
      debug: data?.debug,
    }
  }

  // React Query error wrapper
  if (typeof error === 'object' && 'message' in error) {
    const err = error as Error & { cause?: unknown }
    if (err.cause) {
      return extractApiError(err.cause)
    }
    return {
      message: err.message,
      errorType: err.name,
      timestamp: new Date().toISOString(),
    }
  }

  // String error
  if (typeof error === 'string') {
    return { message: error, timestamp: new Date().toISOString() }
  }

  return { message: String(error), timestamp: new Date().toISOString() }
}

/**
 * Hook para gerenciar estado de erro de API
 */
export function useApiError() {
  const [error, setError] = useState<ApiErrorDetails | null>(null)

  const handleError = useCallback((err: unknown) => {
    const errorDetails = extractApiError(err)
    setError(errorDetails)

    // Log no console para desenvolvimento
    if (import.meta.env.DEV) {
      console.group('🔴 API Error')
      console.error('Message:', errorDetails.message)
      if (errorDetails.status) console.error('Status:', errorDetails.status)
      if (errorDetails.url) console.error('URL:', `${errorDetails.method} ${errorDetails.url}`)
      if (errorDetails.step) console.error('Step:', errorDetails.step)
      if (errorDetails.details) console.error('Details:', errorDetails.details)
      if (errorDetails.stack) console.error('Stack:', errorDetails.stack)
      if (errorDetails.debug) console.error('Debug:', errorDetails.debug)
      console.groupEnd()
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    setError: handleError,
    clearError,
    hasError: error !== null,
  }
}

export default useApiError
