# Plano: Análise Detalhada de Consumo por Produto

## Objetivo
Criar endpoint backend e tela frontend para análise detalhada de consumo de um produto específico, com opções de agrupamento (group by) para diferentes visualizações.

## Produto de Teste: 3680 (PAPEL SULFITE A4 500 FOLHAS)

---

## PARTE 1: BACKEND - API Route

### 1.1 Endpoint Principal
**Route**: `GET /tgfpro2/produtos/:codprod/consumo/analise`

**Query Parameters**:
- `dataInicio` (required): Data inicial (YYYY-MM-DD)
- `dataFim` (required): Data final (YYYY-MM-DD)
- `groupBy` (optional): Tipo de agrupamento
  - `usuario` - Agrupar por usuário (CODUSUINC)
  - `grupo` - Agrupar por grupo de usuário (CODGRUPO via TSIUSU)
  - `mes` - Agrupar por mês
  - `tipooper` - Agrupar por tipo de operação (CODTIPOPER)
  - `none` (default) - Sem agrupamento, lista detalhada

**Response Structure**:
```typescript
{
  produto: {
    codprod: number
    descrprod: string
    ativo: string
  }
  periodo: {
    inicio: string
    fim: string
    dias: number
  }
  resumo: {
    totalMovimentacoes: number      // COUNT DISTINCT NUNOTA
    totalLinhas: number              // COUNT de registros
    quantidadeConsumo: number        // SUM onde ATUALESTOQUE < 0
    valorConsumo: number             // SUM VLRTOT onde ATUALESTOQUE < 0
    quantidadeEntrada: number        // SUM onde ATUALESTOQUE > 0
    valorEntrada: number             // SUM VLRTOT onde ATUALESTOQUE > 0
  }
  agrupamento?: {
    tipo: string                     // usuario | mes | tipooper
    dados: Array<{
      chave: string                  // Nome do usuário, mês, tipo operação
      codigo?: number                // Código do usuário, tipo operação
      movimentacoes: number
      quantidadeConsumo: number
      valorConsumo: number
      percentual: number             // % do total
    }>
  }
  movimentacoes: {
    data: Array<MovimentacaoDetalhada>
    page: number
    perPage: number
    total: number
    lastPage: number
  }
}
```

### 1.2 DTO Types (criar arquivos)

**`produto-consumo-analise-query.dto.ts`**:
```typescript
export class ProdutoConsumoAnaliseQueryDto {
  @IsDateString()
  @IsNotEmpty()
  dataInicio: string;

  @IsDateString()
  @IsNotEmpty()
  dataFim: string;

  @IsOptional()
  @IsIn(['usuario', 'mes', 'tipooper', 'none'])
  groupBy?: string = 'none';

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  perPage?: number = 20;
}
```

**`produto-consumo-analise.dto.ts`**:
```typescript
export interface ProdutoInfo {
  codprod: number;
  descrprod: string;
  ativo: string;
}

export interface PeriodoInfo {
  inicio: string;
  fim: string;
  dias: number;
}

export interface ResumoConsumo {
  totalMovimentacoes: number;
  totalLinhas: number;
  quantidadeConsumo: number;
  valorConsumo: number;
  quantidadeEntrada: number;
  valorEntrada: number;
}

export interface DadoAgrupamento {
  chave: string;
  codigo?: number;
  movimentacoes: number;
  quantidadeConsumo: number;
  valorConsumo: number;
  percentual: number;
}

export interface Agrupamento {
  tipo: string;
  dados: DadoAgrupamento[];
}

export interface MovimentacaoDetalhada {
  nunota: number;
  numnota: number;
  dtneg: string;
  dtmov?: string;
  statusnota: string;
  statusnotaDescr: string;
  codtipoper: number;
  descrtipoper: string;
  atualestoque: number;
  tipoMovimento: 'consumo' | 'entrada' | 'neutro';
  codusuinc: number;
  nomeusu: string;
  qtdneg: number;
  vlrunit: number;
  vlrtot: number;
  codlocalorig?: number;
  descrlocal?: string;
}

export interface ProdutoConsumoAnalise {
  produto: ProdutoInfo;
  periodo: PeriodoInfo;
  resumo: ResumoConsumo;
  agrupamento?: Agrupamento;
  movimentacoes: {
    data: MovimentacaoDetalhada[];
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
}
```

### 1.3 Service Methods (tgfpro2.service.ts)

**Método Principal**: `findProdutoConsumoAnalise(codprod, query)`

**Queries SQL** (considerar limites de caracteres):

1. **Query Produto Info** (simples):
```sql
SELECT CODPROD, DESCRPROD, ATIVO FROM TGFPRO WHERE CODPROD = {codprod}
```

2. **Query Resumo** (split em queries menores):
```sql
-- q1: Contadores
SELECT COUNT(DISTINCT ITE.NUNOTA)TM, COUNT(*)TL
FROM TGFITE ITE WITH(NOLOCK)
JOIN TGFCAB CAB WITH(NOLOCK) ON CAB.NUNOTA=ITE.NUNOTA
WHERE ITE.CODPROD={codprod} AND CAB.DTNEG>='{inicio}' AND CAB.DTNEG<='{fim}' AND CAB.STATUSNOTA='L'

-- q2: Somas consumo (ATUALESTOQUE < 0)
SELECT SUM(ITE.QTDNEG)QC, SUM(ITE.VLRTOT)VC
FROM TGFITE ITE WITH(NOLOCK)
JOIN TGFCAB CAB WITH(NOLOCK) ON CAB.NUNOTA=ITE.NUNOTA
WHERE ITE.CODPROD={codprod} AND ITE.ATUALESTOQUE<0 AND CAB.DTNEG>='{inicio}' AND CAB.DTNEG<='{fim}' AND CAB.STATUSNOTA='L'

-- q3: Somas entrada (ATUALESTOQUE > 0)
SELECT SUM(ITE.QTDNEG)QE, SUM(ITE.VLRTOT)VE
FROM TGFITE ITE WITH(NOLOCK)
JOIN TGFCAB CAB WITH(NOLOCK) ON CAB.NUNOTA=ITE.NUNOTA
WHERE ITE.CODPROD={codprod} AND ITE.ATUALESTOQUE>0 AND CAB.DTNEG>='{inicio}' AND CAB.DTNEG<='{fim}' AND CAB.STATUSNOTA='L'
```

3. **Query Agrupamento por Usuário**:
```sql
SELECT TOP 10 CAB.CODUSUINC COD, USU.NOMEUSU NOME, COUNT(DISTINCT CAB.NUNOTA)MOV, SUM(CASE WHEN ITE.ATUALESTOQUE<0 THEN ITE.QTDNEG ELSE 0 END)QTD, SUM(CASE WHEN ITE.ATUALESTOQUE<0 THEN ITE.VLRTOT ELSE 0 END)VLR
FROM TGFITE ITE WITH(NOLOCK)
JOIN TGFCAB CAB WITH(NOLOCK) ON CAB.NUNOTA=ITE.NUNOTA
LEFT JOIN TSIUSU USU WITH(NOLOCK) ON USU.CODUSU=CAB.CODUSUINC
WHERE ITE.CODPROD={codprod} AND CAB.DTNEG>='{inicio}' AND CAB.DTNEG<='{fim}' AND CAB.STATUSNOTA='L'
GROUP BY CAB.CODUSUINC, USU.NOMEUSU
ORDER BY QTD DESC
```

4. **Query Agrupamento por Mês**:
```sql
SELECT SUBSTRING(CONVERT(VARCHAR,CAB.DTNEG,120),1,7)MES, COUNT(DISTINCT CAB.NUNOTA)MOV, SUM(CASE WHEN ITE.ATUALESTOQUE<0 THEN ITE.QTDNEG ELSE 0 END)QTD, SUM(CASE WHEN ITE.ATUALESTOQUE<0 THEN ITE.VLRTOT ELSE 0 END)VLR
FROM TGFITE ITE WITH(NOLOCK)
JOIN TGFCAB CAB WITH(NOLOCK) ON CAB.NUNOTA=ITE.NUNOTA
WHERE ITE.CODPROD={codprod} AND CAB.DTNEG>='{inicio}' AND CAB.DTNEG<='{fim}' AND CAB.STATUSNOTA='L'
GROUP BY SUBSTRING(CONVERT(VARCHAR,CAB.DTNEG,120),1,7)
ORDER BY MES DESC
```

5. **Query Agrupamento por Tipo Operação**:
```sql
SELECT TOP 10 CAB.CODTIPOPER COD, TOP.DESCROPER NOME, COUNT(DISTINCT CAB.NUNOTA)MOV, SUM(CASE WHEN ITE.ATUALESTOQUE<0 THEN ITE.QTDNEG ELSE 0 END)QTD, SUM(CASE WHEN ITE.ATUALESTOQUE<0 THEN ITE.VLRTOT ELSE 0 END)VLR
FROM TGFITE ITE WITH(NOLOCK)
JOIN TGFCAB CAB WITH(NOLOCK) ON CAB.NUNOTA=ITE.NUNOTA
LEFT JOIN TGFTOP TOP WITH(NOLOCK) ON TOP.CODTIPOPER=CAB.CODTIPOPER AND TOP.DHALTER=(SELECT MAX(T2.DHALTER) FROM TGFTOP T2 WHERE T2.CODTIPOPER=CAB.CODTIPOPER AND T2.DHALTER<=CAB.DTNEG)
WHERE ITE.CODPROD={codprod} AND CAB.DTNEG>='{inicio}' AND CAB.DTNEG<='{fim}' AND CAB.STATUSNOTA='L'
GROUP BY CAB.CODTIPOPER, TOP.DESCROPER
ORDER BY QTD DESC
```

6. **Query Movimentações Detalhadas** (paginada):
```sql
SELECT ITE.NUNOTA, CAB.NUMNOTA, CAB.DTNEG, CAB.DTMOV, CAB.HRMOV, CAB.STATUSNOTA, CAB.CODTIPOPER, TOP.DESCROPER, ITE.ATUALESTOQUE, CAB.CODUSUINC, USU.NOMEUSU, ITE.QTDNEG, ITE.VLRUNIT, ITE.VLRTOT, ITE.CODLOCALORIG
FROM TGFITE ITE WITH(NOLOCK)
JOIN TGFCAB CAB WITH(NOLOCK) ON CAB.NUNOTA=ITE.NUNOTA
LEFT JOIN TGFTOP TOP WITH(NOLOCK) ON TOP.CODTIPOPER=CAB.CODTIPOPER AND TOP.DHALTER=(SELECT MAX(T2.DHALTER) FROM TGFTOP T2 WHERE T2.CODTIPOPER=CAB.CODTIPOPER AND T2.DHALTER<=CAB.DTNEG)
LEFT JOIN TSIUSU USU WITH(NOLOCK) ON USU.CODUSU=CAB.CODUSUINC
WHERE ITE.CODPROD={codprod} AND CAB.DTNEG>='{inicio}' AND CAB.DTNEG<='{fim}' AND CAB.STATUSNOTA='L'
ORDER BY CAB.DTNEG DESC, ITE.NUNOTA DESC
OFFSET {offset} ROWS FETCH NEXT {perPage} ROWS ONLY
```

### 1.4 Controller Method (tgfpro2.controller.ts)

```typescript
@Get('produtos/:codprod/consumo/analise')
@ApiOperation({ summary: 'Análise detalhada de consumo de produto' })
@ApiParam({ name: 'codprod', description: 'Código do produto' })
async getProdutoConsumoAnalise(
  @Param('codprod', ParseIntPipe) codprod: number,
  @Query() query: ProdutoConsumoAnaliseQueryDto,
): Promise<ProdutoConsumoAnalise> {
  return this.tgfpro2Service.findProdutoConsumoAnalise(codprod, query);
}
```

---

## PARTE 2: FRONTEND - Tela de Análise

### 2.1 Estrutura de Arquivos

```
src/app/produtos-v2/produto/[codprod]/consumo/
├── page.tsx                           # Página principal
├── components/
│   ├── produto-info-header.tsx        # Header com info do produto
│   ├── periodo-selector.tsx           # Seletor de período
│   ├── resumo-cards.tsx               # Cards com resumo (KPIs)
│   ├── agrupamento-selector.tsx       # Selector de tipo de agrupamento
│   ├── agrupamento-chart.tsx          # Gráfico do agrupamento
│   ├── agrupamento-table.tsx          # Tabela do agrupamento
│   ├── movimentacoes-table.tsx        # Tabela de movimentações detalhadas
│   └── movimentacoes-pagination.tsx   # Paginação
```

### 2.2 API Service (consumo-produto-service.ts)

```typescript
export async function getProdutoConsumoAnalise(
  codprod: number,
  params: {
    dataInicio: string;
    dataFim: string;
    groupBy?: string;
    page?: number;
    perPage?: number;
  }
): Promise<ProdutoConsumoAnalise> {
  const query = new URLSearchParams({
    dataInicio: params.dataInicio,
    dataFim: params.dataFim,
    ...(params.groupBy && { groupBy: params.groupBy }),
    ...(params.page && { page: params.page.toString() }),
    ...(params.perPage && { perPage: params.perPage.toString() }),
  });

  const response = await fetch(
    `${API_BASE_URL}/tgfpro2/produtos/${codprod}/consumo/analise?${query}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Erro ao carregar análise de consumo do produto');
  }

  return response.json();
}
```

### 2.3 Componentes Principais

**produto-info-header.tsx**:
- Exibe CODPROD, DESCRPROD, ATIVO
- Badge de status (Ativo/Inativo)
- Breadcrumb de navegação

**periodo-selector.tsx**:
- 2 date pickers (início e fim)
- Quick actions: "Últimos 30 dias", "Últimos 3 meses", "Último ano"
- Botão "Aplicar"

**resumo-cards.tsx**:
- Card 1: Total Movimentações (com ícone)
- Card 2: Quantidade Consumo (badge vermelho) vs Entrada (badge verde)
- Card 3: Valor Consumo (R$) vs Entrada (R$)
- Card 4: Total de Linhas

**agrupamento-selector.tsx**:
- Tabs: "Por Usuário", "Por Mês", "Por Tipo Operação", "Sem Agrupamento"
- Ao mudar tab, atualiza query.groupBy

**agrupamento-chart.tsx**:
- Bar chart horizontal mostrando top 10 do agrupamento
- Eixo X: quantidade/valor
- Eixo Y: nome do agrupamento
- Tooltip com detalhes

**agrupamento-table.tsx**:
- Colunas: Nome, Código (se aplicável), Movimentações, Quantidade, Valor, %
- Sortable
- Total no footer

**movimentacoes-table.tsx**:
- Colunas:
  - Data/Hora
  - Nota (NUNOTA/NUMNOTA)
  - Tipo Operação
  - Tipo Movimento (Badge: Consumo/Entrada/Neutro)
  - Usuário
  - Quantidade
  - Vlr Unit
  - Vlr Total
  - Status
- Color coding: Consumo (vermelho), Entrada (verde), Neutro (cinza)

### 2.4 Layout da Página

```
┌─────────────────────────────────────────────────────────┐
│ [← Voltar] Produtos > Produto 3680 > Consumo           │
├─────────────────────────────────────────────────────────┤
│ PAPEL SULFITE A4 500 FOLHAS             [✓ Ativo]      │
│ Código: 3680                                            │
├─────────────────────────────────────────────────────────┤
│ [De: 2025-12-15] [Até: 2026-01-14] [Aplicar]          │
│ Quick: [30 dias] [3 meses] [1 ano]                     │
├─────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│ │   24     │ │ 14 / 10  │ │  R$ X.XX │ │   24     │   │
│ │Moviment. │ │ Cons/Ent │ │ Cons/Ent │ │  Linhas  │   │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
├─────────────────────────────────────────────────────────┤
│ Agrupamento: [Por Usuário][Por Mês][Por Tipo][Nenhum] │
├─────────────────────────────────────────────────────────┤
│ ┌─── Gráfico ───────────────────────────────────────┐  │
│ │ ████████████████████ Usuário 177 (23%)           │  │
│ │ ████████████ Usuário 448 (14%)                   │  │
│ │ ███████████ Usuário 14 (13%)                     │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ ┌─── Tabela Agrupamento ─────────────────────────────┐ │
│ │ Nome         │ Código │ Mov │ Qtd   │ Valor │ %   │ │
│ │──────────────┼────────┼─────┼───────┼───────┼─────│ │
│ │ Usuário 177  │ 177    │ 120 │ 2,882 │ 56.9K │ 23% │ │
│ │ Usuário 448  │ 448    │  85 │ 1,832 │ 27.2K │ 14% │ │
│ └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│ Movimentações Detalhadas                               │
│ ┌───────────────────────────────────────────────────┐  │
│ │ Data     │ Nota   │ Tipo Op │ Mov  │ Usuá │ Qtd │  │
│ │──────────┼────────┼─────────┼──────┼──────┼─────│  │
│ │ 13/01/26 │ 35085  │ REQ INT │[▼C] │ João │  5  │  │
│ │ 13/01/26 │ 35084  │ REQ INT │[▼C] │ Maria│  4  │  │
│ │ 07/01/26 │ 34962  │ REQ INT │[▼C] │ José │  5  │  │
│ └───────────────────────────────────────────────────┘  │
│ [< Anterior] Página 1 de 5 [Próxima >]                │
└─────────────────────────────────────────────────────────┘
```

---

## PARTE 3: TESTES

### 3.1 Backend Tests

Criar script de teste: `/tmp/test_consumo_produto_3680.sh`

```bash
# Test 1: Análise básica (sem agrupamento)
GET /tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-12-15&dataFim=2026-01-14

# Test 2: Agrupamento por usuário
GET /tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-12-15&dataFim=2026-01-14&groupBy=usuario

# Test 3: Agrupamento por mês
GET /tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-12-01&dataFim=2026-01-14&groupBy=mes

# Test 4: Agrupamento por tipo operação
GET /tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-12-15&dataFim=2026-01-14&groupBy=tipooper

# Test 5: Paginação
GET /tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-12-15&dataFim=2026-01-14&page=2&perPage=10
```

### 3.2 Frontend Tests

- Testar mudança de período
- Testar cada tipo de agrupamento
- Testar paginação
- Testar responsividade
- Testar loading states
- Testar error states

---

## ORDEM DE EXECUÇÃO

1. **Backend DTOs** - Criar types/interfaces
2. **Backend Service** - Implementar queries e lógica
3. **Backend Controller** - Criar endpoint
4. **Backend Tests** - Validar com produto 3680
5. **Frontend Service** - API client
6. **Frontend Components** - Um por vez
7. **Frontend Page** - Integrar componentes
8. **Frontend Tests** - Validar UX

---

## CONSIDERAÇÕES IMPORTANTES

1. **Limites de Query**:
   - **LIMITE REAL: ~450 caracteres** (testado e confirmado)
   - Queries até 438 chars funcionam perfeitamente
   - Queries > 536 chars são truncadas
   - Usar aliases curtos mas legíveis (não precisa ultra-comprimir)
   - Split em múltiplas queries apenas quando necessário

2. **Campos Bloqueados**:
   - CODDEP de TGFCAB está bloqueado
   - Não tentar usar em nenhuma query

3. **DHALTER Subquery**:
   - Necessário para TGFTOP (tabela multi-versionada)
   - Usar pattern: `TOP.DHALTER=(SELECT MAX(T2.DHALTER) FROM TGFTOP T2 WHERE T2.CODTIPOPER=CAB.CODTIPOPER AND T2.DHALTER<=CAB.DTNEG)`

4. **Performance**:
   - Limitar agrupamentos a TOP 10
   - Paginação de 20 registros por padrão
   - Usar WITH(NOLOCK) em todas as queries

5. **UX**:
   - Loading skeletons para todas as seções
   - Error boundaries
   - Feedback visual claro
   - Mobile-first design
