import { BaseLayout } from '@/components/layouts/base-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Play, Code } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';
import { sankhyaClient } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth-store';

interface JWTPayload {
  [key: string]: unknown;
}

export default function Page() {
  const { token } = useAuthStore();
  const [decodedToken, setDecodedToken] = useState<JWTPayload | null>(null);
  const [query, setQuery] = useState<string>('SELECT TOP 10 * FROM TGFPRO ORDER BY CODPROD DESC');
  const [queryResult, setQueryResult] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        setDecodedToken(decoded);
      } catch (_err) {
        setDecodedToken(null);
        toast.error('Erro ao decodificar JWT token');
      }
    } else {
      setDecodedToken(null);
    }
  }, [token]);

  const executeQuery = async () => {
    if (!query.trim()) {
      toast.error('Digite uma query para executar');
      return;
    }

    setIsLoading(true);
    setError('');
    setQueryResult(null);

    try {
      // Execute the query using the Sankhya API client
      const response = await sankhyaClient.post('/inspection/query', { query, params: [] });
      setQueryResult(response.data);
      toast.success('Query executada com sucesso');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || 'Erro ao executar query');
      toast.error('Erro ao executar query');
    } finally {
      setIsLoading(false);
    }
  };

  const formatValue = (key: string, value: unknown): string => {
    // Se for timestamp de expiração (exp ou iat), formatar como data legível
    if ((key === 'exp' || key === 'iat') && typeof value === 'number') {
      const date = new Date(value * 1000);
      const now = new Date();
      const diff = date.getTime() - now.getTime();
      const diffMinutes = Math.floor(diff / 60000);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      let relative = '';
      if (key === 'exp') {
        if (diffDays > 0) relative = ` (expira em ${diffDays} dias)`;
        else if (diffHours > 0) relative = ` (expira em ${diffHours}h)`;
        else if (diffMinutes > 0) relative = ` (expira em ${diffMinutes}min)`;
        else relative = ' (EXPIRADO!)';
      }

      return `${date.toLocaleString('pt-BR')}${relative}`;
    }

    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <BaseLayout title="Inspect Query" description="Execute queries SQL e inspecione o JWT token">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Query Execution Section - PRIMEIRO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Executar Query SQL
            </CardTitle>
            <CardDescription>
              Digite uma query SQL para executar diretamente no banco Sankhya
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="query" className="text-sm font-medium">
                Query SQL
              </label>
              <Textarea
                id="query"
                placeholder="Digite sua query aqui..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-32 font-mono"
              />
            </div>

            <Button
              onClick={executeQuery}
              disabled={isLoading || !query.trim()}
              className="w-full sm:w-auto"
            >
              {isLoading ? 'Executando...' : 'Executar Query'}
            </Button>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {queryResult && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Resultado:</label>
                <ScrollArea className="max-h-96 w-full rounded-md border p-4">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(queryResult, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* JWT Token Section - POR ÚLTIMO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              JWT Token Decodificado
            </CardTitle>
            <CardDescription>Informações do token de autenticação (legível)</CardDescription>
          </CardHeader>
          <CardContent>
            {decodedToken ? (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {Object.entries(decodedToken).map(([key, value]) => (
                    <div key={key} className="flex flex-col space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs font-mono">
                          {key}
                        </Badge>
                      </div>
                      <ScrollArea className="max-h-32 w-full rounded-md border p-2">
                        <pre className="text-sm whitespace-pre-wrap">{formatValue(key, value)}</pre>
                      </ScrollArea>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                Nenhum token JWT encontrado ou inválido
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  );
}
