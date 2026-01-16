'use client'

import { useState } from 'react'
import { AlertCircle, Copy, Check, ChevronDown, ChevronUp, Bug, RefreshCw, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface ErrorDetails {
  message?: string
  status?: number
  statusText?: string
  url?: string
  method?: string
  timestamp?: string
  details?: Record<string, unknown>
  stack?: string[] | string
  step?: string
  errorType?: string
  requestId?: string
}

interface ErrorDisplayProps {
  error: Error | ErrorDetails | unknown
  title?: string
  onRetry?: () => void
  className?: string
}

/**
 * Extrai detalhes do erro de diferentes formatos
 */
function extractErrorDetails(error: unknown): ErrorDetails {
  if (!error) return { message: 'Erro desconhecido' }

  // Axios error
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>

    // Axios error format
    if ('response' in err && err.response) {
      const response = err.response as Record<string, unknown>
      const data = response.data as Record<string, unknown> | undefined

      return {
        message: data?.message as string || err.message as string || 'Erro na requisição',
        status: response.status as number,
        statusText: response.statusText as string,
        url: (err.config as Record<string, unknown>)?.url as string,
        method: ((err.config as Record<string, unknown>)?.method as string)?.toUpperCase(),
        details: data?.details as Record<string, unknown>,
        stack: data?.stack as string[] || (err.stack as string)?.split('\n'),
        step: data?.step as string,
        errorType: data?.errorType as string,
        timestamp: new Date().toISOString(),
      }
    }

    // Standard Error object
    if ('message' in err) {
      return {
        message: err.message as string,
        stack: (err.stack as string)?.split('\n'),
        errorType: err.name as string,
        timestamp: new Date().toISOString(),
      }
    }

    // Plain object with error details
    if ('details' in err || 'status' in err) {
      return {
        message: err.message as string || 'Erro',
        status: err.status as number,
        details: err.details as Record<string, unknown>,
        stack: err.stack as string[],
        step: err.step as string,
        errorType: err.errorType as string,
        timestamp: err.timestamp as string || new Date().toISOString(),
      }
    }
  }

  // String error
  if (typeof error === 'string') {
    return { message: error, timestamp: new Date().toISOString() }
  }

  return { message: String(error), timestamp: new Date().toISOString() }
}

/**
 * Formata o erro para cópia
 */
function formatErrorForCopy(details: ErrorDetails): string {
  const lines = [
    '=== ERROR REPORT ===',
    `Timestamp: ${details.timestamp || new Date().toISOString()}`,
    `Message: ${details.message}`,
  ]

  if (details.status) lines.push(`HTTP Status: ${details.status} ${details.statusText || ''}`)
  if (details.method && details.url) lines.push(`Request: ${details.method} ${details.url}`)
  if (details.step) lines.push(`Failed Step: ${details.step}`)
  if (details.errorType) lines.push(`Error Type: ${details.errorType}`)

  if (details.details) {
    lines.push('\n=== DETAILS ===')
    lines.push(JSON.stringify(details.details, null, 2))
  }

  if (details.stack) {
    lines.push('\n=== STACK TRACE ===')
    const stackLines = Array.isArray(details.stack) ? details.stack : details.stack.split('\n')
    lines.push(...stackLines.slice(0, 15))
  }

  lines.push('\n=== END REPORT ===')
  return lines.join('\n')
}

export function ErrorDisplay({ error, title = 'Erro', onRetry, className }: ErrorDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showStack, setShowStack] = useState(false)

  const details = extractErrorDetails(error)
  const hasDetails = details.details && Object.keys(details.details).length > 0
  const hasStack = details.stack && (Array.isArray(details.stack) ? details.stack.length > 0 : details.stack.length > 0)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatErrorForCopy(details))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = formatErrorForCopy(details)
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getStatusColor = (status?: number) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    if (status >= 500) return 'bg-red-100 text-red-800 border-red-200'
    if (status >= 400) return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <Card className={cn('border-destructive/50 bg-destructive/5', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {details.status && (
              <Badge variant="outline" className={getStatusColor(details.status)}>
                {details.status} {details.statusText}
              </Badge>
            )}
            {details.step && (
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                Step: {details.step}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mensagem principal */}
        <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20">
          <p className="text-sm font-medium text-destructive">{details.message}</p>
          {details.method && details.url && (
            <p className="text-xs text-muted-foreground mt-2 font-mono">
              {details.method} {details.url}
            </p>
          )}
        </div>

        {/* Timestamp e tipo */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {details.timestamp && (
            <span className="font-mono bg-muted px-2 py-1 rounded">
              {new Date(details.timestamp).toLocaleString('pt-BR')}
            </span>
          )}
          {details.errorType && (
            <span className="font-mono bg-muted px-2 py-1 rounded">
              {details.errorType}
            </span>
          )}
        </div>

        {/* Detalhes expandíveis */}
        {hasDetails && (
          <div className="border rounded-md overflow-hidden">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted/70 transition-colors text-sm font-medium"
            >
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4" />
                <span>Detalhes do Erro</span>
              </div>
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showDetails && (
              <div className="p-3 bg-muted/30">
                <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-60 overflow-y-auto">
                  {JSON.stringify(details.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Stack trace expandível */}
        {hasStack && (
          <div className="border rounded-md overflow-hidden">
            <button
              onClick={() => setShowStack(!showStack)}
              className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted/70 transition-colors text-sm font-medium"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span>Stack Trace</span>
              </div>
              {showStack ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showStack && (
              <div className="p-3 bg-muted/30">
                <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-60 overflow-y-auto text-muted-foreground">
                  {Array.isArray(details.stack)
                    ? details.stack.join('\n')
                    : details.stack}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar Erro
              </>
            )}
          </Button>

          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar Novamente
            </Button>
          )}
        </div>

        {/* Dica para desenvolvedor */}
        <div className="text-xs text-muted-foreground border-t pt-3 mt-3">
          <p className="font-medium mb-1">Para desenvolvedores:</p>
          <p>Verifique o console do navegador (F12) e os logs do backend para mais detalhes.</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default ErrorDisplay
