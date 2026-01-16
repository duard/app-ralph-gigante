import { useProdutosOS } from '@/hooks/use-ordens-servico'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Package } from 'lucide-react'

interface ProdutosTabProps {
  nuos: number
}

export function ProdutosTab({ nuos }: ProdutosTabProps) {
  const { data: produtos, isLoading } = useProdutosOS(nuos)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted/20 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!produtos || produtos.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground py-8">
            Nenhum produto/peça utilizado nesta OS
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seq.</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Vlr. Unit.</TableHead>
                <TableHead>Vlr. Total</TableHead>
                <TableHead>Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtos.map((produto) => (
                <TableRow key={produto.sequencia}>
                  <TableCell className="font-medium">{produto.sequencia}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{produto.produto?.descrprod || 'N/A'}</div>
                      {produto.produto?.marca && (
                        <div className="text-xs text-muted-foreground">
                          {produto.produto.marca}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {produto.produto?.referencia || '-'}
                  </TableCell>
                  <TableCell>{produto.codvol || '-'}</TableCell>
                  <TableCell className="font-semibold">{produto.qtdneg || 0}</TableCell>
                  <TableCell>
                    {produto.vlrunit
                      ? `R$ ${produto.vlrunit.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}`
                      : '-'}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {produto.vlrtot
                      ? `R$ ${produto.vlrtot.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}`
                      : '-'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {produto.observacao || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Totais */}
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Package className="h-4 w-4" />
              Total de Produtos
            </div>
            <div className="text-2xl font-bold">{produtos.length}</div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Package className="h-4 w-4" />
              Quantidade Total
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {produtos.reduce((sum, p) => sum + (p.qtdneg || 0), 0).toLocaleString('pt-BR')}
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Package className="h-4 w-4" />
              Valor Total
            </div>
            <div className="text-2xl font-bold text-green-600">
              R${' '}
              {produtos
                .reduce((sum, p) => sum + (p.vlrtot || 0), 0)
                .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
