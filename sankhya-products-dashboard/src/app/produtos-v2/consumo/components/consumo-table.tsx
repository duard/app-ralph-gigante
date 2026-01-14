import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Loader2, Package } from 'lucide-react';
import { formatarValor } from '@/lib/api/consumo-service';
import type { MovimentacaoConsumo } from '@/types/consumo';

interface ConsumoTableProps {
  movimentacoes: MovimentacaoConsumo[];
  loading?: boolean;
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(dateTimeString?: string): string {
  if (!dateTimeString) return '-';
  if (dateTimeString.includes(' ')) {
    const [datePart, timePart] = dateTimeString.split(' ');
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year} ${timePart}`;
  }
  const date = new Date(dateTimeString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getBadgeVariant(status?: string): "default" | "secondary" | "destructive" | "outline" {
  if (!status) return 'secondary';
  switch (status) {
    case 'L':
      return 'default';
    case 'P':
      return 'outline';
    case 'A':
      return 'secondary';
    default:
      return 'secondary';
  }
}

function getAtualizaEstoqueBadge(atualiza?: string): "default" | "secondary" | "destructive" {
  if (!atualiza) return 'secondary';
  switch (atualiza) {
    case 'B':
      return 'destructive';
    case 'E':
      return 'default';
    default:
      return 'secondary';
  }
}

export function ConsumoTable({ movimentacoes, loading }: ConsumoTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (movimentacoes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Nenhuma movimentação encontrada</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Tente ajustar os filtros ou selecionar um período diferente
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Nota</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Tipo Operação</TableHead>
            <TableHead className="text-center">Qtd</TableHead>
            <TableHead className="text-right">Vlr Unit</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Data Neg</TableHead>
            <TableHead>Data Mov</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Estoque</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movimentacoes.map((mov) => (
            <TableRow key={`${mov.nunota}-${mov.sequencia}`} className="hover:bg-muted/50">
              <TableCell className="font-mono text-sm">
                {mov.numnota || mov.nunota}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Link
                    to={`/produtos-v2/${mov.codprod}`}
                    className="font-medium hover:underline line-clamp-2 text-sm"
                  >
                    {mov.descrprod}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    Cód: {mov.codprod}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm font-medium">{mov.descrtipoper}</div>
                  <div className="text-xs text-muted-foreground">
                    TOP: {mov.codtipoper}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center font-medium">
                {mov.qtdneg?.toLocaleString('pt-BR')}
              </TableCell>
              <TableCell className="text-right text-sm">
                {formatarValor(mov.vlrunit || 0)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatarValor(mov.vlrtot || 0)}
              </TableCell>
              <TableCell>
                <div className="text-sm">{mov.nomeusu}</div>
              </TableCell>
              <TableCell className="text-sm">
                {formatDate(mov.dtneg)}
              </TableCell>
              <TableCell className="text-sm font-mono">
                {formatDateTime(mov.dtmov)}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={getBadgeVariant(mov.statusnota)}>
                  {mov.statusnotaDescr}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={getAtualizaEstoqueBadge(mov.atualizaEstoque)}>
                  {mov.atualizaEstoque}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/produtos-v2/${mov.codprod}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
