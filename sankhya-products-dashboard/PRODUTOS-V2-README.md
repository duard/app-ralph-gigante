# Produtos V2 - Dashboard Frontend

Frontend React/Vite para visualização e análise completa de produtos com integração TGFPRO2 API.

## 🎯 Visão Geral

Este módulo fornece interface completa para gestão de produtos, estoque e análise de consumo, integrado com o backend API Sankhya Center em `/api-sankhya-center`.

## 📋 Índice

- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Menu de Navegação](#menu-de-navegação)
- [Rotas Disponíveis](#rotas-disponíveis)
- [Componentes](#componentes)
- [Serviços de API](#serviços-de-api)
- [Hooks Customizados](#hooks-customizados)
- [Tipos TypeScript](#tipos-typescript)
- [Configuração](#configuração)
- [Desenvolvimento](#desenvolvimento)

---

## 🗂️ Estrutura do Projeto

```
src/
├── app/
│   └── produtos-v2/
│       ├── page.tsx                      # Dashboard principal
│       ├── listagem/
│       │   └── page.tsx                  # Listagem completa de produtos
│       ├── grupo/
│       │   └── [codgrupoprod]/
│       │       └── page.tsx              # Produtos por grupo
│       ├── local/
│       │   └── [codlocal]/
│       │       └── page.tsx              # Produtos por local
│       ├── [codprod]/
│       │   └── page.tsx                  # Detalhes do produto
│       ├── consumo/
│       │   ├── page.tsx                  # Lista de movimentações
│       │   ├── analise/
│       │   │   └── page.tsx              # Análise por período
│       │   ├── departamentos/
│       │   │   └── page.tsx              # Consumo por departamento
│       │   └── usuarios/
│       │       └── page.tsx              # Consumo por usuário
│       ├── estoque/
│       │   ├── status/page.tsx           # Status geral de estoque
│       │   ├── critico/page.tsx          # Produtos críticos
│       │   ├── sem-estoque/page.tsx      # Produtos sem estoque
│       │   └── excesso/page.tsx          # Produtos com excesso
│       └── qualidade/
│           ├── sem-ncm/page.tsx          # Produtos sem NCM
│           ├── incompletos/page.tsx      # Campos incompletos
│           └── inativos-estoque/page.tsx # Inativos com estoque
├── components/
│   ├── produtos-v2/
│   │   ├── produto-table.tsx             # Tabela de produtos
│   │   ├── kpi-card.tsx                  # Card de KPI reutilizável
│   │   └── ...
│   └── consumo/                          # NOVOS COMPONENTES
│       ├── consumo-table.tsx             # Tabela de movimentações
│       ├── consumo-charts.tsx            # Gráficos de consumo
│       ├── consumo-filters.tsx           # Filtros de consumo
│       ├── departamento-chart.tsx        # Gráfico por departamento
│       └── usuario-chart.tsx             # Gráfico por usuário
├── lib/
│   └── api/
│       └── consumo-service.ts            # Serviço de API de consumo
├── hooks/
│   └── consumo/                          # NOVOS HOOKS
│       ├── use-movimentacoes-consumo.ts  # Hook para movimentações
│       ├── use-consumo-produto.ts        # Hook para consumo de produto
│       └── use-consumo-analise.ts        # Hook para análise de período
└── types/
    └── consumo.ts                        # Tipos TypeScript de consumo
```

---

## ✨ Funcionalidades

### 1. **Dashboard Principal** (`/produtos-v2`)
- KPIs gerais de produtos e estoque
- Gráficos de resumo
- Atalhos rápidos para análises

### 2. **Gestão de Produtos**

#### Listagem Completa (`/produtos-v2/listagem`)
- Tabela paginada com todos os produtos
- Filtros avançados (busca, grupo, status)
- Ordenação por múltiplos campos
- Exportação (CSV, Excel, PDF)

#### Por Grupo (`/produtos-v2/grupo/:codgrupoprod`)
- Produtos filtrados por grupo específico
- Estatísticas do grupo
- Comparação com outros grupos

#### Por Local (`/produtos-v2/local/:codlocal`)
- Produtos em um local de estoque
- Níveis de estoque por local
- Alertas de min/max

#### Detalhes do Produto (`/produtos-v2/:codprod`)
- Informações completas do produto
- Estoque por local
- Histórico de movimentação
- Análise de consumo

### 3. **Análise de Estoque**

#### Status Geral (`/produtos-v2/estoque/status`)
- Dashboard com distribuição por status
- Cards: Crítico, Baixo, Normal, Excesso, Sem Estoque
- Gráficos de tendência

#### Estoque Crítico (`/produtos-v2/estoque/critico`)
- Produtos com estoque <= 50% do mínimo
- Déficit calculado
- Priorização para compras
- Alertas visuais

#### Sem Estoque (`/produtos-v2/estoque/sem-estoque`)
- Produtos completamente zerados
- Impacto em vendas
- Lista de reposição urgente

#### Excesso de Estoque (`/produtos-v2/estoque/excesso`)
- Produtos acima do máximo
- Valor imobilizado
- Sugestões de promoção

### 4. **Consumo de Produtos** 🆕

#### Todas Movimentações (`/produtos-v2/consumo`)
**Funcionalidades:**
- Lista todas as movimentações de consumo interno
- Filtros:
  - Por produto
  - Por departamento
  - Por usuário
  - Por período (data início/fim)
  - Por tipo de operação (TGFTOP)
  - Por tipo de atualização de estoque (Baixa, Entrada, etc)
- Paginação completa
- Detalhes da movimentação:
  - Número da nota
  - Produto consumido
  - Quantidade e valores
  - Departamento responsável
  - Usuário que realizou
  - Tipo de operação
  - Data e hora

**Exemplo de Dados:**
```typescript
{
  nunota: 123456,
  codprod: 3680,
  descrprod: "FOLHAS A4 SULFITE 75G",
  qtdneg: 10,
  vlrunit: 25.50,
  vlrtot: 255.00,
  coddep: 1,
  descrDep: "TI",
  nomeusu: "CONVIDADE",
  descrtipoper: "REQUISIÇÃO INTERNA",
  dtneg: "2026-01-10"
}
```

#### Análise por Período (`/produtos-v2/consumo/analise`)
**Funcionalidades:**
- Seleção de período customizado
- Top N produtos mais consumidos
- Top N departamentos que mais consumem
- Top N usuários que mais requisitam
- Totais gerais:
  - Total de movimentações
  - Quantidade total consumida
  - Valor total
  - Número de produtos distintos
  - Número de departamentos
  - Número de usuários
- Gráficos de evolução diária (opcional)
- Percentuais de participação

**Exemplo de Response:**
```typescript
{
  periodo: {
    inicio: "2025-01-01",
    fim: "2026-01-13",
    dias: 378
  },
  totais: {
    movimentacoes: 450,
    produtos: 85,
    departamentos: 8,
    usuarios: 12,
    quantidadeTotal: 15000,
    valorTotal: 125000.00
  },
  topProdutos: [
    {
      codprod: 3680,
      descrprod: "FOLHAS A4",
      quantidade: 5000,
      valor: 45000.00,
      percentual: 33.33
    }
  ],
  topDepartamentos: [...],
  topUsuarios: [...]
}
```

#### Por Departamento (`/produtos-v2/consumo/departamentos`)
**Funcionalidades:**
- Visualização de consumo agrupado por departamento
- Tabela com:
  - Nome do departamento
  - Quantidade consumida
  - Valor consumido
  - Percentual do total
- Gráfico de pizza/barras
- Drill-down para ver produtos consumidos por cada departamento
- Comparação entre departamentos
- Exportação de relatório

**Formato da Tabela:**
| Departamento | Qtd Consumida | Valor Consumido | % do Total |
|--------------|---------------|-----------------|------------|
| TI           | 120           | R$ 780,00       | 50.0%      |
| Financeiro   | 80            | R$ 520,00       | 33.3%      |
| RH           | 40            | R$ 260,00       | 16.7%      |

#### Por Usuário (`/produtos-v2/consumo/usuarios`)
**Funcionalidades:**
- Visualização de consumo agrupado por usuário
- Tabela com:
  - Nome do usuário
  - Departamento
  - Quantidade requisitada
  - Valor total
  - Percentual do total
- Ranking de usuários
- Filtro por departamento
- Análise de padrões de consumo
- Exportação de relatório

### 5. **Qualidade de Dados**

#### Sem NCM (`/produtos-v2/qualidade/sem-ncm`)
- Produtos sem NCM cadastrado
- Impacto fiscal
- Priorização por estoque

#### Campos Incompletos (`/produtos-v2/qualidade/incompletos`)
- Produtos com dados faltantes
- Percentual de completude
- Checklist de campos

#### Inativos com Estoque (`/produtos-v2/qualidade/inativos-estoque`)
- Produtos inativos que ainda têm estoque
- Valor imobilizado
- Sugestões de ação

---

## 🗺️ Menu de Navegação

### Sidebar - Produtos V2

```
📊 Produtos V2
├── 📈 Dashboard V2
├── 📦 Listagem Completa
├── 🏷️ Por Grupo
│   ├── Ver Todos Grupos
│   ├── MATERIAL ESCRITORIO
│   └── MECANICA
├── 📍 Por Local
│   ├── Ver Todos Locais
│   ├── ALMOX PECAS
│   └── MATERIAL ESCRITORIO
├── 📊 Análise de Estoque
│   ├── Status Geral
│   ├── Crítico
│   ├── Sem Estoque
│   └── Excesso
├── 🛒 Consumo de Produtos      🆕
│   ├── Todas Movimentações
│   ├── Análise por Período
│   ├── Por Departamento
│   └── Por Usuário
└── ⚠️ Qualidade de Dados
    ├── Produtos Sem NCM
    ├── Campos Incompletos
    └── Inativos com Estoque
```

---

## 🛣️ Rotas Disponíveis

### Produtos Base
- `/produtos-v2` - Dashboard principal
- `/produtos-v2/listagem` - Listagem completa
- `/produtos-v2/:codprod` - Detalhes do produto

### Filtros por Grupo/Local
- `/produtos-v2/grupos` - Lista de todos os grupos
- `/produtos-v2/grupo/:codgrupoprod` - Produtos por grupo
- `/produtos-v2/locais` - Lista de todos os locais
- `/produtos-v2/local/:codlocal` - Produtos por local

### Análise de Estoque
- `/produtos-v2/estoque/status` - Status geral
- `/produtos-v2/estoque/critico` - Estoque crítico
- `/produtos-v2/estoque/sem-estoque` - Sem estoque
- `/produtos-v2/estoque/excesso` - Excesso de estoque

### Consumo (NOVO) 🆕
- `/produtos-v2/consumo` - Todas as movimentações
- `/produtos-v2/consumo/analise` - Análise por período
- `/produtos-v2/consumo/departamentos` - Consumo por departamento
- `/produtos-v2/consumo/usuarios` - Consumo por usuário

### Qualidade de Dados
- `/produtos-v2/qualidade/sem-ncm` - Produtos sem NCM
- `/produtos-v2/qualidade/incompletos` - Campos incompletos
- `/produtos-v2/qualidade/inativos-estoque` - Inativos com estoque

---

## 🧩 Componentes

### Componentes Reutilizáveis Existentes

1. **`<KpiCard />`** - Card de KPI
2. **`<ProdutoTable />`** - Tabela de produtos
3. **`<Card />`** - Card genérico (Shadcn)
4. **`<Table />`** - Tabela genérica (Shadcn)
5. **`<Chart />`** - Gráficos (Recharts)
6. **`<DataTablePagination />`** - Paginação de tabela

### Novos Componentes de Consumo 🆕

#### `<ConsumoTable />`
Tabela para exibir movimentações de consumo.

**Props:**
```typescript
interface ConsumoTableProps {
  data: MovimentacaoConsumo[];
  loading?: boolean;
  onRowClick?: (movimentacao: MovimentacaoConsumo) => void;
}
```

**Uso:**
```tsx
<ConsumoTable
  data={movimentacoes}
  loading={isLoading}
  onRowClick={(mov) => console.log(mov)}
/>
```

#### `<ConsumoFilters />`
Formulário de filtros para consumo.

**Props:**
```typescript
interface ConsumoFiltersProps {
  filtros: ConsumoFiltros;
  onChange: (filtros: ConsumoFiltros) => void;
  onReset: () => void;
}
```

#### `<DepartamentoChart />`
Gráfico de consumo por departamento (Pizza ou Barras).

**Props:**
```typescript
interface DepartamentoChartProps {
  data: ConsumoProduto['departamentos'];
  tipo?: 'pie' | 'bar';
}
```

#### `<UsuarioChart />`
Gráfico de consumo por usuário.

**Props:**
```typescript
interface UsuarioChartProps {
  data: ConsumoProduto['usuarios'];
  tipo?: 'pie' | 'bar';
}
```

---

## 🔌 Serviços de API

### `consumo-service.ts`

#### Métodos Disponíveis

1. **`getMovimentacoesConsumo(filtros)`**
   - Lista movimentações com filtros
   - Retorna: `PaginatedResponse<MovimentacaoConsumo>`

2. **`getConsumoProduto(codprod, dataInicio?, dataFim?)`**
   - Análise de consumo de um produto
   - Retorna: `ConsumoProduto`

3. **`getConsumoAnalise(dataInicio, dataFim, top?)`**
   - Análise completa de período
   - Retorna: `ConsumoAnalise`

#### Helpers

1. **`formatarDataParaAPI(date: Date): string`**
   - Converte Date para formato YYYY-MM-DD

2. **`getPeriodoPadrao(dias: number): { dataInicio, dataFim }`**
   - Retorna período dos últimos N dias

3. **`formatarValor(valor: number): string`**
   - Formata valores monetários (R$ 1.234,56)

4. **`formatarPercentual(valor: number): string`**
   - Formata percentuais (12.34%)

### Exemplo de Uso

```typescript
import {
  getMovimentacoesConsumo,
  getPeriodoPadrao,
  formatarValor,
} from '@/lib/api/consumo-service';

// Buscar movimentações dos últimos 30 dias
const periodo = getPeriodoPadrao(30);
const response = await getMovimentacoesConsumo({
  ...periodo,
  codprod: 3680,
  atualizaEstoque: 'B', // Apenas baixas de estoque
  page: 1,
  perPage: 20,
});

console.log(formatarValor(response.data[0].vlrtot)); // R$ 255,00
```

---

## 🪝 Hooks Customizados

### `use-movimentacoes-consumo.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { getMovimentacoesConsumo } from '@/lib/api/consumo-service';
import type { ConsumoFiltros } from '@/types/consumo';

export function useMovimentacoesConsumo(filtros: ConsumoFiltros) {
  return useQuery({
    queryKey: ['consumo', 'movimentacoes', filtros],
    queryFn: () => getMovimentacoesConsumo(filtros),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
```

**Uso:**
```tsx
const { data, isLoading, error } = useMovimentacoesConsumo({
  codprod: 3680,
  dataInicio: '2025-01-01',
  dataFim: '2026-01-13',
  page: 1,
  perPage: 20,
});
```

### `use-consumo-produto.ts`

```typescript
export function useConsumoProduto(
  codprod: number,
  dataInicio?: string,
  dataFim?: string
) {
  return useQuery({
    queryKey: ['consumo', 'produto', codprod, dataInicio, dataFim],
    queryFn: () => getConsumoProduto(codprod, dataInicio, dataFim),
    enabled: !!codprod,
  });
}
```

### `use-consumo-analise.ts`

```typescript
export function useConsumoAnalise(
  dataInicio: string,
  dataFim: string,
  top: number = 10
) {
  return useQuery({
    queryKey: ['consumo', 'analise', dataInicio, dataFim, top],
    queryFn: () => getConsumoAnalise(dataInicio, dataFim, top),
    enabled: !!dataInicio && !!dataFim,
  });
}
```

---

## 📘 Tipos TypeScript

Ver arquivo completo: `src/types/consumo.ts`

### Interfaces Principais

1. **`MovimentacaoConsumo`** - Movimentação individual
2. **`ConsumoProduto`** - Análise de consumo de produto
3. **`ConsumoAnalise`** - Análise de período
4. **`ConsumoFiltros`** - Filtros de busca
5. **`PaginatedResponse<T>`** - Resposta paginada genérica

---

## ⚙️ Configuração

### Variáveis de Ambiente

Arquivo: `.env.local`

```bash
# URL da API Backend
VITE_API_URL=http://localhost:3000

# Timeout de requisições (ms)
VITE_API_TIMEOUT=30000

# Habilitar logs de debug
VITE_DEBUG=true
```

### Integração com Backend

O frontend espera que o backend esteja rodando em `http://localhost:3000` (ou conforme `VITE_API_URL`).

**Endpoints Backend Utilizados:**
- `GET /tgfpro2/consumo` - Lista movimentações
- `GET /tgfpro2/consumo/produto/:codprod` - Consumo de produto
- `GET /tgfpro2/consumo/analise` - Análise de período

Ver documentação completa do backend em: `/api-sankhya-center/TGFPRO2_PRD.md`

---

## 🚀 Desenvolvimento

### Instalação

```bash
cd /home/carloshome/z-ralph-code/sankhya-products-dashboard
pnpm install
```

### Desenvolvimento

```bash
# Iniciar frontend
pnpm dev

# Em outro terminal, iniciar backend
cd ../api-sankhya-center
npm run start:dev
```

### Build de Produção

```bash
pnpm build
pnpm preview
```

### Testes

```bash
# Rodar testes unitários
pnpm test

# Rodar testes com coverage
pnpm test:coverage

# Rodar testes em modo watch
pnpm test:watch
```

### Storybook

```bash
# Iniciar Storybook para documentação de componentes
pnpm storybook
```

---

## 📊 Fluxo de Dados

```
┌─────────────────┐
│  Componente     │
│  React          │
└────────┬────────┘
         │
         │ usa
         ▼
┌─────────────────┐
│  Custom Hook    │
│  useConsumo...  │
└────────┬────────┘
         │
         │ chama
         ▼
┌─────────────────┐
│  API Service    │
│  consumo-       │
│  service.ts     │
└────────┬────────┘
         │
         │ HTTP Request
         ▼
┌─────────────────┐
│  Backend API    │
│  /tgfpro2/      │
│  consumo        │
└────────┬────────┘
         │
         │ Query SQL
         ▼
┌─────────────────┐
│  Banco Sankhya  │
│  TGFCAB, TGFITE │
│  TGFDEP, etc    │
└─────────────────┘
```

---

## 📝 Convenções de Código

1. **Componentes**: PascalCase (`ConsumoTable.tsx`)
2. **Hooks**: camelCase com `use` prefix (`useConsumoAnalise.ts`)
3. **Tipos**: PascalCase (`MovimentacaoConsumo`)
4. **Serviços**: camelCase (`consumo-service.ts`)
5. **Formatação**: Prettier + ESLint
6. **Comentários**: TSDoc para funções públicas

---

## 🐛 Debugging

### Logs de API

O `apiClient` loga automaticamente:
- Token de autenticação (primeiros 20 caracteres)
- Erros 401/403 (autenticação)
- Outros erros HTTP

### React Query DevTools

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />
```

---

## 🔐 Autenticação

O frontend usa token JWT armazenado em `localStorage`:
- `auth-storage` (Zustand persist)
- `sankhya-token` (fallback)

Interceptor do Axios adiciona automaticamente o token em todas as requisições.

---

## 📚 Recursos Adicionais

- **Backend API**: `/api-sankhya-center/README.md`
- **PRD Completo**: `/api-sankhya-center/TGFPRO2_PRD.md`
- **Swagger**: `http://localhost:3000/api`
- **Storybook**: `http://localhost:6006`

---

## 🤝 Contribuindo

1. Criar branch feature: `git checkout -b feature/nome-da-feature`
2. Implementar mudanças
3. Rodar testes: `pnpm test`
4. Rodar lint: `pnpm lint`
5. Commit: `git commit -m "feat: descrição"`
6. Push: `git push origin feature/nome-da-feature`
7. Abrir Pull Request

---

## 📄 Licença

Projeto interno - Sankhya Center

---

**Última atualização:** 2026-01-13
**Versão:** 2.0.0
**Mantido por:** Time de Desenvolvimento
