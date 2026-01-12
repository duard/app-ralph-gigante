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

  const formatValue = (value: unknown): string => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <BaseLayout title="Inspect Query" description="Inspecione o JWT token e execute queries na API">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* JWT Token Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              JWT Token Decodificado
            </CardTitle>
            <CardDescription>Dados do token JWT atualmente autenticado</CardDescription>
          </CardHeader>
          <CardContent>
            {decodedToken ? (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {Object.entries(decodedToken).map(([key, value]) => (
                    <div key={key} className="flex flex-col space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {key}
                        </Badge>
                      </div>
                      <ScrollArea className="max-h-32 w-full rounded-md border p-2">
                        <pre className="text-sm whitespace-pre-wrap">{formatValue(value)}</pre>
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

        <Separator />

        {/* Query Execution Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Executar Inspect Query
            </CardTitle>
            <CardDescription>
              Digite uma query para executar na API e visualizar os resultados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="query" className="text-sm font-medium">
                Query
              </label>
              <Textarea
                id="query"
                placeholder="Digite sua query aqui..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-24"
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
                <ScrollArea className="max-h-64 w-full rounded-md border p-4">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(queryResult, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  );
}
