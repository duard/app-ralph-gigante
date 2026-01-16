# Produtos V7 - Plano de Implementação

**Data:** 2026-01-16
**Objetivo:** Criar tela de produtos moderna e funcional inspirada no dashboard
**Rota:** `/produtos-v7`

---

## 🎯 OBJETIVOS

1. **Design Moderno:** Seguir padrão visual do `/dashboard`
2. **Filtros Poderosos:** Toolbar com filtros avançados
3. **Multi-Local:** Produto pode estar em múltiplos locais
4. **Performance:** Otimizado para grandes volumes
5. **Usabilidade:** Intuitivo e responsivo

---

## 📐 ESTRUTURA DA TELA

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
│ Produtos - Gestão Completa                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TOOLBAR DE FILTROS                                          │
│ ┌─────────┬─────────┬─────────┬─────────┬─────────┐       │
│ │ Busca   │ Grupo   │ Local   │ Status  │ Marca   │ ...   │
│ └─────────┴─────────┴─────────┴─────────┴─────────┘       │
│                                                              │
│ [Ativo] [Com Estoque] [Com Controle] [Limpar] [Exportar]  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CARDS DE MÉTRICAS (Grid 2x3)                               │
│ ┌───────────┬───────────┬───────────┐                      │
│ │ Total     │ Ativos    │ Inativos  │                      │
│ │ 15.234    │ 12.450    │ 2.784     │                      │
│ └───────────┴───────────┴───────────┘                      │
│ ┌───────────┬───────────┬───────────┐                      │
│ │ Com Estoq │ Sem Estoq │ Valor Tot │                      │
│ │ 11.230    │ 4.004     │ R$ 5.2M   │                      │
│ └───────────┴───────────┴───────────┘                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TABELA DE PRODUTOS                                          │
│ Mostrando 1-50 de 15.234 produtos                          │
│                                                              │
│ Cód  | Descrição | Grupo | Estoque | Locais | Preço | ... │
│ ─────┼───────────┼───────┼─────────┼────────┼───────┼─── │
│ 1001 | PROD A    | GRP1  | 150     | 3      | R$ 10 | ... │
│ 1002 | PROD B    | GRP2  | 0       | 0      | R$ 25 | ... │
│                                                              │
│ [1] [2] [3] ... [305]                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 COMPONENTES A CRIAR

### 1. **ProdutosV7Page** (Principal)
```typescript
/src/app/produtos-v7/page.tsx
- Layout principal
- Coordena todos os componentes
- Gerencia estado global dos filtros
```

### 2. **ProdutosToolbar** (Filtros)
```typescript
/src/app/produtos-v7/components/produtos-toolbar.tsx
- Busca textual
- Select de Grupo
- Select de Local
- Select de Status (Ativo/Inativo)
- Input de Marca
- Toggles: Com Estoque, Sem Estoque, Com Controle
- Botões: Limpar, Exportar
```

### 3. **ProdutosMetricsCards** (Métricas)
```typescript
/src/app/produtos-v7/components/produtos-metrics-cards.tsx
- 6 cards principais:
  1. Total de Produtos
  2. Produtos Ativos
  3. Produtos Inativos
  4. Com Estoque
  5. Sem Estoque
  6. Valor Total em Estoque
- Responsive grid (3 cols desktop, 2 cols tablet, 1 col mobile)
```

### 4. **ProdutosTable** (Tabela)
```typescript
/src/app/produtos-v7/components/produtos-table.tsx
- TanStack Table
- Colunas principais:
  - Código
  - Descrição
  - Grupo
  - Referência
  - Marca
  - Estoque Total (soma de todos os locais)
  - Qtd Locais (badge)
  - Preço
  - Status
  - Ações
- Paginação server-side
- Sorting
- Row actions (Ver detalhes, Editar)
```

### 5. **ProdutoLocaisDialog** (Multi-local)
```typescript
/src/app/produtos-v7/components/produto-locais-dialog.tsx
- Dialog mostrando estoque por local
- Lista de locais com quantidades
- Usado quando click no badge "X locais"
```

---

## 🔧 HOOKS E SERVICES

### 1. **useProdutosV7**
```typescript
/src/hooks/produtos-v7/use-produtos-v7.ts
- React Query hook principal
- Busca produtos com filtros
- Cache inteligente
- Paginação
```

### 2. **useProdutosMetrics**
```typescript
/src/hooks/produtos-v7/use-produtos-metrics.ts
- Busca métricas agregadas
- Atualiza conforme filtros mudam
```

### 3. **useProdutoLocais**
```typescript
/src/hooks/produtos-v7/use-produto-locais.ts
- Busca estoque por local de um produto específico
- Lazy loading (só busca quando dialog abre)
```

---

## 📊 FILTROS IMPLEMENTADOS

### Filtros Básicos (Select/Input):
1. **Busca textual** - Descrição, Código, Referência
2. **Grupo de Produto** - Dropdown com todos os grupos
3. **Local** - Dropdown com todos os locais
4. **Status** - Ativo/Inativo/Todos
5. **Marca** - Input de texto

### Filtros Toggle (Switch):
6. **Com Estoque** - Produtos com qtd > 0
7. **Sem Estoque** - Produtos com qtd = 0
8. **Com Controle** - Produtos controlados
9. **Sem Controle** - Produtos não controlados
10. **Com Movimento** - Produtos com vendas recentes
11. **Sem Movimento** - Produtos sem vendas

### Filtros Avançados (Future):
- Faixa de Preço (min-max)
- Faixa de Estoque (min-max)
- NCM
- Fornecedor

---

## 🎯 INTERFACE DE FILTROS

```typescript
export interface ProdutosV7Filters {
  // Básicos
  search?: string
  codgrupoprod?: number
  codlocal?: number
  ativo?: 'S' | 'N' | 'all'
  marca?: string

  // Toggles
  comEstoque?: boolean
  semEstoque?: boolean
  comControle?: boolean
  semControle?: boolean
  comMovimento?: boolean
  semMovimento?: boolean

  // Paginação
  page: number
  perPage: number

  // Ordenação
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ProdutoV7 {
  codprod: number
  descrprod: string
  referencia?: string
  marca?: string
  ativo: 'S' | 'N'

  // Grupo
  codgrupoprod?: number
  descrgrupoprod?: string

  // Estoque agregado
  estoqueTotal: number
  qtdLocais: number

  // Financeiro
  vlrunit?: number
  custoMedio?: number

  // Controle
  usacontrole?: 'S' | 'N'
  ncm?: string

  // Locais (lazy loaded)
  locais?: ProdutoLocal[]
}

export interface ProdutoLocal {
  codlocal: number
  descrlocal: string
  estoque: number
  reservado: number
  disponivel: number
}
```

---

## 🚀 FASES DE IMPLEMENTAÇÃO

### Fase 1: Estrutura Base ✅
- [x] Planejar estrutura
- [ ] Criar diretório produtos-v7
- [ ] Criar page.tsx principal
- [ ] Criar types.ts
- [ ] Registrar rota

### Fase 2: Filtros
- [ ] Criar ProdutosToolbar
- [ ] Implementar filtros básicos
- [ ] Implementar toggles
- [ ] State management dos filtros

### Fase 3: Métricas
- [ ] Criar ProdutosMetricsCards
- [ ] Hook useProdutosMetrics
- [ ] Integração com backend

### Fase 4: Tabela
- [ ] Criar ProdutosTable
- [ ] TanStack Table setup
- [ ] Paginação
- [ ] Sorting
- [ ] Row actions

### Fase 5: Multi-Local
- [ ] Criar ProdutoLocaisDialog
- [ ] Hook useProdutoLocais
- [ ] Badge de locais clicável

### Fase 6: Polish
- [ ] Loading states
- [ ] Error boundaries
- [ ] Responsive design
- [ ] Performance optimization

---

## 🔌 BACKEND ENDPOINTS NECESSÁRIOS

### Existente:
- ✅ `GET /tgfpro` - Lista produtos (já existe)
- ✅ `GET /tgfpro/:codprod` - Detalhes (já existe)
- ✅ `GET /tgfloc` - Lista locais (criado hoje)

### A Criar/Melhorar:
- `GET /tgfpro/metrics` - Métricas agregadas
- `GET /tgfpro/:codprod/locais` - Estoque por local

---

## 📱 RESPONSIVIDADE

### Desktop (> 1024px):
- Toolbar: 1 linha com todos filtros
- Cards: Grid 3 colunas
- Tabela: Todas colunas visíveis

### Tablet (768px - 1024px):
- Toolbar: 2 linhas
- Cards: Grid 2 colunas
- Tabela: Colunas principais

### Mobile (< 768px):
- Toolbar: Colapsável
- Cards: 1 coluna
- Tabela: Cards verticais

---

## 🎨 DESIGN SYSTEM

### Cores (Baseado no Dashboard):
- **Primary:** Cards e ações principais
- **Success:** Produtos ativos, com estoque
- **Warning:** Estoque baixo
- **Destructive:** Produtos inativos, sem estoque
- **Muted:** Backgrounds e bordas

### Componentes shadcn/ui:
- Card
- Select
- Input
- Button
- Badge
- Switch
- Dialog
- Table
- Skeleton (loading)

---

## ⚡ PERFORMANCE

### Otimizações:
1. **React Query Cache:** staleTime de 5min
2. **Virtualização:** Para tabelas grandes (future)
3. **Debounce:** Busca textual (500ms)
4. **Lazy Loading:** Locais só quando necessário
5. **Code Splitting:** Componentes pesados

### Métricas Alvo:
- First Load: < 2s
- Filter Apply: < 500ms
- Table Render: < 1s

---

## 📝 NOTAS IMPORTANTES

1. **Não quebrar nada:** V7 é isolada, não afeta outras versões
2. **Multi-local é crítico:** Produto pode estar em 4+ locais
3. **Filtros são fundamentais:** Usuário precisa encontrar rápido
4. **Design matters:** Seguir padrão do dashboard
5. **Mobile-first:** Funcionar bem em todos dispositivos

---

**Próximos passos:** Começar pela Fase 1 - Estrutura Base
