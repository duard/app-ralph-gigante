'use client';

import * as React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface DataErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface DataErrorBoundaryProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  onRetry?: () => void;
  fallback?: React.ComponentType<{
    error: Error;
    onRetry: () => void;
    onDismiss?: () => void;
    title?: string;
    description?: string;
    showToast?: boolean;
  }>;
  showToast?: boolean;
}

function DefaultDataErrorFallback({
  error,
  onRetry,
  onDismiss,
  title = 'Erro ao carregar dados',
  showToast = true,
}: {
  error: Error;
  onRetry: () => void;
  onDismiss?: () => void;
  title?: string;
  showToast?: boolean;
  description?: string;
}) {
  React.useEffect(() => {
    if (showToast) {
      toast.error(`Erro: ${error.message}`);
    }
  }, [error.message, showToast]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          Ocorreu um erro ao buscar os dados. Por favor, tente novamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Detalhes do erro</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button onClick={onRetry} variant="default" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
          {onDismiss && (
            <Button onClick={onDismiss} variant="outline" size="sm">
              Dispensar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export class DataErrorBoundary extends React.Component<
  DataErrorBoundaryProps,
  DataErrorBoundaryState
> {
  constructor(props: DataErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<DataErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('DataErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });

    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleDismiss = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultDataErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error}
          onRetry={this.handleRetry}
          onDismiss={this.handleDismiss}
          title={this.props.title}
          description={this.props.description}
          showToast={this.props.showToast}
        />
      );
    }

    return this.props.children;
  }
}

// Hook for data components to handle async errors
export function useDataErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    toast.error('Erro ao processar dados');
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  // Throw error to be caught by ErrorBoundary
  if (error) {
    throw error;
  }

  return { handleError, resetError };
}

// Wrapper component for data fetching operations
export function DataBoundaryWrapper({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <DataErrorBoundary title={title} showToast={true}>
      {children}
    </DataErrorBoundary>
  );
}
