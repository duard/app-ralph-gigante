"use client"

import * as React from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; errorInfo: React.ErrorInfo; onReset: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  title?: string
}

function DefaultErrorFallback({ 
  error, 
  errorInfo, 
  onReset 
}: { 
  error: Error; 
  errorInfo: React.ErrorInfo; 
  onReset: () => void 
}) {
  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Oops! Algo deu errado</CardTitle>
          <CardDescription>
            Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada e estamos trabalhando para resolver isso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Detalhes do Erro</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="text-sm space-y-2">
                <div>
                  <strong>Mensagem:</strong> {error.message}
                </div>
                {process.env.NODE_ENV === 'development' && (
                  <>
                    <div>
                      <strong>Component:</strong> {errorInfo.componentStack?.split('\n')[1]?.trim() || 'Unknown'}
                    </div>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium">Stack Trace</summary>
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                        {error.stack}
                      </pre>
                    </details>
                  </>
                )}
              </div>
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button 
              onClick={onReset} 
              variant="default"
              className="flex-1 gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
            <Button 
              onClick={handleReload} 
              variant="outline"
              className="flex-1 gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Recarregar página
            </Button>
            <Button 
              onClick={handleGoHome} 
              variant="ghost"
              className="flex-1 gap-2"
            >
              <Home className="h-4 w-4" />
              Página inicial
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Show toast notification
    toast.error('Ocorreu um erro inesperado na aplicação')

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // In production, you might want to send error to logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendErrorToService(error, errorInfo)
      console.warn('Production error caught:', error.message)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
    
    toast.success('Tentando recuperar a aplicação...')
  }

  render() {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      
      return (
        <FallbackComponent 
          error={this.state.error} 
          errorInfo={this.state.errorInfo} 
          onReset={this.handleReset} 
        />
      )
    }

    return this.props.children
  }
}

// Hook for functional components to handle errors
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error) => {
    setError(error)
    toast.error('Ocorreu um erro na operação')
  }, [])

  // Throw error to be caught by ErrorBoundary
  if (error) {
    throw error
  }

  return { handleError }
}

// Component to wrap async operations
export function AsyncErrorBoundary({ 
  children, 
  onError 
}: { 
  children: React.ReactNode
  onError?: (error: Error) => void 
}) {
  const { handleError } = useErrorHandler()

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(new Error(event.reason))
      if (onError) {
        onError(new Error(event.reason))
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [handleError, onError])

  return <>{children}</>
}