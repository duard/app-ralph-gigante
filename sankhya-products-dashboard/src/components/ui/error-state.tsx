"use client"

import * as React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorStateProps {
  error: string | null
  onRetry?: () => void
  isRetrying?: boolean
  title?: string
  description?: string
}

export function ErrorState({
  error,
  onRetry,
  isRetrying = false,
  title = "Erro ao carregar dados",
  description,
}: ErrorStateProps) {
  if (!error) return null

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Alert variant="destructive" className="max-w-lg">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          <div className="space-y-3">
            <p>
              {description || error}
            </p>
            {onRetry && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  disabled={isRetrying}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? 'Tentando novamente...' : 'Tentar novamente'}
                </Button>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}