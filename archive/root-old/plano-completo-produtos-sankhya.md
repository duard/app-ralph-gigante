# Plano Completo: API e Frontend de Produtos Sankhya Center

## 📋 Visão Geral

Criar uma solução completa e integrada de gestão de produtos do sistema Sankhya, com:

- **API NestJS** robusta com todos os endpoints necessários
- **Frontend React** moderno com todas as visões de produtos
- **Integração perfeita** entre backend e frontend
- **Qualidade enterprise** com testes, documentação e performance

## 🎯 Objetivos Principais

### 1. API de Produtos (Backend)

- ✅ **Já implementado**: Estrutura base, autenticação, endpoints CRUD
- 🔄 **Melhorar**: Adicionar mais endpoints de análise e relatórios
- ➕ **Adicionar**: Endpoints para histórico, estatísticas, exportação

### 2. Frontend de Produtos (Dashboard)

- ✅ **Já implementado**: Listagem, filtros, detalhes, dashboard básico
- 🔄 **Melhorar**: Adicionar mais visões analíticas
- ➕ **Adicionar**: Visões de análise avançada, comparação, relatórios

## 📐 Arquitetura Atual

### Backend (API)

```
api-sankhya-center/src/sankhya/tgfpro/
├── tgfpro.controller.ts     ✅ Endpoints principais
├── tgfpro.service.ts         ✅ Lógica de negócio
├── tgfpro.module.ts          ✅ Módulo NestJS
├── consumo/                  ✅ Submódulo de consumo
│   ├── consumo.controller.ts
│   ├── consumo.service.ts
│   └── consumo.module.ts
├── models/                   ✅ Tipos e interfaces
└── entities/                 ✅ Entidades do domínio
```

**Endpoints Existentes:**

- `GET /tgfpro` - Listar produtos com paginação
- `GET /tgfpro/:codprod` - Detalhes do produto
- `GET /tgfpro/with-stock/all` - Produtos com estoque
- `GET /tgfpro/search/:termo` - Busca avançada
- `GET /tgfpro/ultra-search` - Ultra busca com filtros
- `GET /tgfpro/consumo-periodo/:codprod` - Consumo por período

### Frontend (Dashboard)

```
sankhya-products-dashboard/src/
├── app/
│   ├── dashboard/           ✅ Dashboard principal
│   │   ├── page.tsx
│   │   └── components/
│   │       ├── dashboard-cards.tsx
│   │       ├── price-trend-chart.tsx
│   │       └── category-distribution-chart.tsx
│   ├── produtos/            ✅ Página de produtos
│   │   └── page.tsx
│   └── bem-vindo/          ✅ Página inicial
│       └── page.tsx
├── components/
│   └── products/            ✅ Componentes de produtos
│       ├── product-list.tsx
│       ├── product-details-modal.tsx
│       ├── product-filters-sidebar.tsx
│       ├── product-table-toolbar.tsx
│       └── price-history-chart.tsx
├── hooks/                   ✅ Hooks customizados
│   ├── use-products.ts
│   ├── use-products-with-cache.ts
│   ├── use-dashboard-metrics.ts
│   └── use-auto-refresh.ts
└── stores/                  ✅ Estado global (Zustand)
    └── products-store.ts
```

**Visões Existentes:**

1. ✅ Dashboard principal com métricas
2. ✅ Listagem de produtos com filtros
3. ✅ Detalhes do produto (modal)
4. ✅ Gráficos de tendência de preços
5. ✅ Produtos mais vendidos
6. ✅ Produtos recentes

## 🚀 Plano de Implementação

### FASE 1: Completar API de Produtos (Backend)

#### 1.1 Endpoints de Análise e Estatísticas

**Objetivo:** Fornecer dados analíticos para o frontend

**Novos Endpoints:**

```typescript
// Estatísticas gerais de produtos
GET /tgfpro/statistics
Response: {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  totalInventoryValue: number;
  averagePrice: number;
  categoriesCount: number;
}

// Top produtos por critério
GET /tgfpro/top/:criterio?limit=10
Parâmetros: criterio = 'valor' | 'movimentacao' | 'vendas'
Response: Product[] com ranking

// Comparação de produtos
GET /tgfpro/compare?codprods=1,2,3
Response: {
  products: Product[];
  comparison: ComparisonMatrix;
}

// Histórico de alterações de preço
GET /tgfpro/:codprod/price-history?period=30
Response: {
  codprod: number;
  history: Array<{
    data: string;
    preco: number;
    variacao: number;
  }>;
}

// Produtos similares/relacionados
GET /tgfpro/:codprod/similar?limit=5
Response: Product[]

// Análise de categoria
GET /tgfpro/category/:codgrupoprod/analysis
Response: {
  codgrupoprod: number;
  descgrupoprod: string;
  totalProducts: number;
  totalValue: number;
  averagePrice: number;
  topProducts: Product[];
}
```

**Implementação:**

1. Criar novo arquivo: `tgfpro.analytics.service.ts`
2. Adicionar métodos ao controller existente
3. Implementar queries SQL otimizadas
4. Adicionar cache para queries pesadas
5. Documentar com Swagger

#### 1.2 Endpoints de Exportação

**Objetivo:** Permitir exportação de dados

**Novos Endpoints:**

```typescript
// Exportar produtos filtrados
POST /tgfpro/export
Body: {
  format: 'csv' | 'excel' | 'pdf';
  filters: TgfproFindAllDto;
}
Response: Stream de arquivo

// Relatório personalizado
POST /tgfpro/report
Body: {
  type: 'inventory' | 'pricing' | 'movement';
  period: { start: string; end: string };
  codprods?: number[];
}
Response: ReportData
```

**Implementação:**

1. Instalar bibliotecas: `exceljs`, `csv-writer`, `pdfkit`
2. Criar `tgfpro.export.service.ts`
3. Implementar geração de cada formato
4. Adicionar streaming para arquivos grandes

#### 1.3 Melhorias de Performance

**Objetivo:** Otimizar queries e cache

**Tarefas:**

1. Adicionar índices no banco (se possível)
2. Implementar cache Redis para queries frequentes
3. Otimizar queries SQL com análise de execução
4. Adicionar paginação em todos os endpoints
5. Implementar rate limiting por usuário

### FASE 2: Completar Frontend de Produtos

#### 2.1 Novas Visões de Produtos

##### Visão 1: Análise Comparativa de Produtos

**Arquivo:** `src/app/produtos/comparacao/page.tsx`

**Funcionalidades:**

- Selecionar múltiplos produtos (máx 5)
- Comparar lado a lado: preço, estoque, movimentação, características
- Gráficos comparativos
- Exportar comparação

**Componentes:**

```typescript
// src/components/products/product-comparison.tsx
- ProductComparisonSelector: Seleção de produtos
- ComparisonTable: Tabela comparativa
- ComparisonCharts: Gráficos comparativos
```

##### Visão 2: Histórico e Tendências

**Arquivo:** `src/app/produtos/historico/page.tsx`

**Funcionalidades:**

- Histórico completo de um produto
- Gráfico de evolução de preço
- Histórico de movimentação
- Análise de tendências (alta/baixa/estável)
- Previsão básica de demanda

**Componentes:**

```typescript
// src/components/products/product-history.tsx
- ProductHistoryChart: Gráfico de histórico
- PriceEvolutionTimeline: Timeline de preços
- MovementAnalysis: Análise de movimentação
```

##### Visão 3: Análise por Categoria

**Arquivo:** `src/app/produtos/categorias/page.tsx`

**Funcionalidades:**

- Lista de todas as categorias
- Métricas por categoria (total produtos, valor, média)
- Drill-down em categoria específica
- Comparação entre categorias
- Gráficos de distribuição

**Componentes:**

```typescript
// src/components/products/category-analysis.tsx
- CategoryList: Lista de categorias
- CategoryMetrics: Métricas da categoria
- CategoryComparison: Comparação entre categorias
- CategoryDrillDown: Detalhes da categoria
```

##### Visão 4: Relatórios e Exportação

**Arquivo:** `src/app/produtos/relatorios/page.tsx`

**Funcionalidades:**

- Seleção de tipo de relatório (estoque, preços, movimentação)
- Filtros avançados (período, categorias, produtos)
- Pré-visualização do relatório
- Exportação em múltiplos formatos (CSV, Excel, PDF)
- Agendamento de relatórios (futuro)

**Componentes:**

```typescript
// src/components/products/reports.tsx
- ReportBuilder: Construtor de relatórios
- ReportPreview: Pré-visualização
- ReportExporter: Exportador multi-formato
```

##### Visão 5: Dashboard de Produto Individual

**Arquivo:** `src/app/produtos/[codprod]/dashboard/page.tsx`

**Funcionalidades:**

- Visão 360° do produto
- Métricas principais (vendas, estoque, preço)
- Histórico de movimentação
- Produtos relacionados/similares
- Alertas e notificações
- Ações rápidas (sem edição real)

**Componentes:**

```typescript
// src/components/products/product-dashboard.tsx
- ProductOverview: Visão geral
- ProductMetrics: Métricas do produto
- ProductMovementHistory: Histórico
- RelatedProducts: Produtos relacionados
- ProductAlerts: Alertas do produto
```

##### Visão 6: Pesquisa Avançada

**Arquivo:** `src/app/produtos/pesquisa/page.tsx`

**Funcionalidades:**

- Busca multi-critério (nome, código, categoria, preço, etc.)
- Busca por faixa de valores
- Busca por características técnicas
- Salvar buscas favoritas
- Resultados com destaque
- Ordenação avançada

**Componentes:**

```typescript
// src/components/products/advanced-search.tsx
- SearchBuilder: Construtor de busca avançada
- SearchFilters: Filtros de busca
- SearchResults: Resultados destacados
- SavedSearches: Buscas salvas
```

#### 2.2 Melhorias no Dashboard Principal

**Arquivo:** `src/app/dashboard/page.tsx`

**Novas Features:**

1. **Widget de Alertas:**
   - Produtos sem estoque
   - Produtos com preço desatualizado
   - Produtos inativos com movimentação

2. **Gráficos Adicionais:**
   - Distribuição de preços (histograma)
   - Movimentação por período
   - Top categorias por valor

3. **Filtros Temporais:**
   - Hoje, Semana, Mês, Trimestre, Ano, Período customizado
   - Comparação com período anterior

4. **Exportação de Dashboard:**
   - Exportar visão atual como PDF
   - Snapshot das métricas

#### 2.3 Melhorias na Listagem de Produtos

**Arquivo:** `src/app/produtos/page.tsx`

**Novas Features:**

1. **Ações em Lote:**
   - Exportar selecionados
   - Comparar selecionados
   - Ver relatório de selecionados

2. **Visualizações Alternativas:**
   - Grid de cards (atual mobile)
   - Tabela detalhada (atual desktop)
   - Visualização compacta
   - Visualização com imagens

3. **Filtros Persistentes:**
   - Salvar conjunto de filtros
   - Filtros rápidos pré-definidos
   - Histórico de filtros

4. **Ordenação Avançada:**
   - Multi-coluna
   - Ascendente/descendente
   - Salvar ordenação padrão

### FASE 3: Integração e Otimização

#### 3.1 Integração Backend-Frontend

**Objetivo:** Garantir integração perfeita

**Tarefas:**

1. Atualizar API client (`src/lib/api/products-api.ts`):

   ```typescript
   // Adicionar todos os novos endpoints
   export const productsApi = {
     // Existentes
     getProducts,
     getProductById,
     searchProducts,

     // Novos
     getStatistics,
     getTopProducts,
     compareProducts,
     getPriceHistory,
     getSimilarProducts,
     getCategoryAnalysis,
     exportProducts,
     generateReport,
   };
   ```

2. Criar hooks customizados para novos endpoints:

   ```typescript
   // src/hooks/use-product-statistics.ts
   // src/hooks/use-product-comparison.ts
   // src/hooks/use-product-history.ts
   // src/hooks/use-category-analysis.ts
   ```

3. Adicionar tipos TypeScript para todas as respostas:
   ```typescript
   // src/types/product.types.ts
   export interface ProductStatistics { ... }
   export interface ProductComparison { ... }
   export interface PriceHistory { ... }
   ```

#### 3.2 Testes

**Objetivo:** Garantir qualidade com testes

**Backend:**

```bash
# Testes unitários
- tgfpro.service.spec.ts
- tgfpro.analytics.service.spec.ts
- tgfpro.export.service.spec.ts

# Testes e2e
- tgfpro.e2e-spec.ts

# Coverage mínimo: 70%
```

**Frontend:**

```bash
# Testes de componentes
- product-comparison.test.tsx
- product-history.test.tsx
- category-analysis.test.tsx
- reports.test.tsx

# Testes de hooks
- use-product-statistics.test.ts
- use-product-comparison.test.ts

# Testes de integração
- products-flow.integration.test.tsx

# Coverage mínimo: 70%
```

#### 3.3 Performance

**Objetivo:** Otimizar performance

**Backend:**

1. Cache Redis para queries pesadas (5min TTL)
2. Indexação de campos frequentes
3. Query optimization com EXPLAIN PLAN
4. Compressão de respostas grandes
5. Rate limiting: 100 req/min por usuário

**Frontend:**

1. Code splitting por rota (já implementado)
2. Lazy loading de componentes pesados
3. Virtualização de listas longas (já implementado)
4. Memoização de componentes
5. Debounce em inputs de busca (já implementado)
6. React Query cache: 5min staleTime

### FASE 4: Documentação e DevOps

#### 4.1 Documentação Backend

**Arquivos:**

```markdown
# api-sankhya-center/README.md

- Atualizar com novos endpoints
- Exemplos de uso
- Guia de contribuição

# api-sankhya-center/docs/API.md

- Documentação completa de endpoints
- Schemas de request/response
- Exemplos curl

# api-sankhya-center/docs/ARCHITECTURE.md

- Arquitetura do módulo tgfpro
- Diagramas de fluxo
- Decisões técnicas
```

**Swagger:**

- Atualizar todas as definições OpenAPI
- Adicionar exemplos em todos os endpoints
- Documentar erros possíveis

#### 4.2 Documentação Frontend

**Arquivos:**

```markdown
# sankhya-products-dashboard/README.md

- Atualizar com novas páginas
- Screenshots das visões
- Guia de desenvolvimento

# sankhya-products-dashboard/docs/COMPONENTS.md

- Documentação de todos os componentes
- Props e exemplos de uso
- Storybook stories (já iniciado)

# sankhya-products-dashboard/docs/ARCHITECTURE.md

- Estrutura de pastas
- Fluxo de dados
- Padrões de código
```

**Storybook:**

- Stories para todos os novos componentes
- Controles interativos
- Documentação inline

#### 4.3 DevOps

**CI/CD Pipeline:**

```yaml
# .github/workflows/api.yml
- Lint
- Type check
- Unit tests
- E2E tests
- Build
- Deploy staging
- Deploy production

# .github/workflows/frontend.yml
- Lint
- Type check
- Unit tests
- Integration tests
- Build
- Lighthouse check
- Deploy staging
- Deploy production
```

**Monitoramento:**

- Sentry para error tracking (backend e frontend)
- Google Analytics para métricas de uso
- Health checks: `/health`, `/metrics`
- Logs estruturados com Winston

## 📊 Resumo de Entregas

### Backend (API)

| Item                    | Status      | Prioridade |
| ----------------------- | ----------- | ---------- |
| Endpoints base CRUD     | ✅ Completo | Alta       |
| Endpoints de análise    | 🔄 A fazer  | Alta       |
| Endpoints de exportação | 🔄 A fazer  | Média      |
| Cache e performance     | 🔄 A fazer  | Alta       |
| Testes (70%+ coverage)  | ⚠️ Parcial  | Alta       |
| Documentação completa   | 🔄 A fazer  | Média      |

### Frontend (Dashboard)

| Item                        | Status      | Prioridade |
| --------------------------- | ----------- | ---------- |
| Listagem de produtos        | ✅ Completo | Alta       |
| Dashboard principal         | ✅ Completo | Alta       |
| Visão: Comparação           | ❌ A fazer  | Alta       |
| Visão: Histórico            | ⚠️ Parcial  | Alta       |
| Visão: Categorias           | ⚠️ Parcial  | Média      |
| Visão: Relatórios           | ❌ A fazer  | Alta       |
| Visão: Dashboard Individual | ❌ A fazer  | Média      |
| Visão: Pesquisa Avançada    | ⚠️ Parcial  | Média      |
| Testes (70%+ coverage)      | ⚠️ Parcial  | Alta       |
| Documentação Storybook      | ⚠️ Parcial  | Média      |

## 🎯 Critérios de Aceitação

### Backend

- [ ] Todos os endpoints documentados no Swagger
- [ ] Testes com coverage ≥ 70%
- [ ] Response time < 500ms para queries simples
- [ ] Response time < 2s para queries complexas
- [ ] Cache implementado em endpoints pesados
- [ ] Rate limiting configurado
- [ ] Logs estruturados em todas as operações
- [ ] Health check endpoint funcionando

### Frontend

- [ ] Todas as 6 visões implementadas e funcionais
- [ ] Testes com coverage ≥ 70%
- [ ] Lighthouse score ≥ 90 (Performance)
- [ ] Mobile-first responsive em todas as telas
- [ ] Dark/Light mode funcionando
- [ ] Loading states em todas as operações
- [ ] Error boundaries em todas as páginas
- [ ] Exportação funcionando (CSV, Excel, PDF)
- [ ] Navegação fluida entre visões
- [ ] Documentação Storybook completa

## 📝 Preceitos Ralph Seguidos

### 1. ✅ Especificidade e Detalhe

- Plano detalhado com arquivos, funções e implementações específicas
- Endpoints com request/response examples
- Estrutura de componentes com props definidos

### 2. ✅ Funcionalidade Completa

- API completa com todos os endpoints necessários
- Frontend com todas as visões de produtos
- Integração end-to-end testada

### 3. ✅ Melhores Práticas

- Seguindo padrões NestJS (services, controllers, modules)
- Seguindo padrões React (hooks, components, stores)
- TypeScript strict mode
- Testes automatizados
- Documentação inline

### 4. ✅ Arquitetura e Padrões

- Reutilizando estrutura existente
- Mantendo convenções do projeto
- Separação de responsabilidades clara
- DRY (Don't Repeat Yourself)

### 5. ✅ Qualidade Enterprise

- Testes com coverage mínimo 70%
- Performance otimizada (cache, lazy loading)
- Error handling robusto
- Logs estruturados
- Monitoramento e observabilidade

### 6. ✅ Documentação

- README atualizado
- Swagger/OpenAPI completo
- Storybook para componentes
- Comentários inline
- Guias de desenvolvimento

### 7. ✅ DevOps e Deploy

- CI/CD pipeline completo
- Health checks
- Staging e production environments
- Rollback strategy
- Monitoring e alertas

## 🔄 Ordem de Implementação Recomendada

### Sprint 1 (2 semanas): Backend - Análise e Estatísticas

1. Implementar endpoints de estatísticas
2. Implementar endpoints de análise
3. Adicionar cache Redis
4. Escrever testes
5. Atualizar documentação Swagger

### Sprint 2 (2 semanas): Backend - Exportação e Performance

1. Implementar endpoints de exportação
2. Otimizar queries existentes
3. Adicionar rate limiting
4. Completar testes (70%+)
5. Documentação completa

### Sprint 3 (2 semanas): Frontend - Visões Principais

1. Implementar visão de Comparação
2. Melhorar visão de Histórico
3. Implementar visão de Relatórios
4. Atualizar API client
5. Criar hooks customizados

### Sprint 4 (2 semanas): Frontend - Visões Secundárias

1. Implementar visão de Categorias
2. Implementar Dashboard Individual
3. Melhorar Pesquisa Avançada
4. Escrever testes
5. Documentação Storybook

### Sprint 5 (1 semana): Integração e Refinamento

1. Integração end-to-end
2. Testes de integração
3. Performance tuning
4. Bug fixes
5. Documentação final

### Sprint 6 (1 semana): Deploy e Lançamento

1. CI/CD setup
2. Deploy staging
3. QA completo
4. Deploy production
5. Monitoring setup

## 📈 Métricas de Sucesso

### Técnicas

- Response time médio < 500ms
- Lighthouse score ≥ 90
- Test coverage ≥ 70%
- Bundle size < 500KB (gzipped)
- 0 erros críticos no Sentry

### Funcionais

- Todas as 6 visões funcionando
- Exportação em 3 formatos (CSV, Excel, PDF)
- Comparação de até 5 produtos simultâneos
- Histórico de até 2 anos
- Dashboard atualizando a cada 5 min

### UX

- Tempo de carregamento < 3s
- Mobile responsive em todas as telas
- Dark mode funcionando
- Transições suaves
- Feedback visual em todas as ações

---

## 🚦 Status Geral

**Backend:** 70% completo

- ✅ Estrutura base
- ✅ CRUD básico
- 🔄 Análise e estatísticas (0%)
- 🔄 Exportação (0%)
- ⚠️ Performance (50%)
- ⚠️ Testes (40%)

**Frontend:** 60% completo

- ✅ Listagem (100%)
- ✅ Dashboard (100%)
- ⚠️ Detalhes (80%)
- 🔄 Comparação (0%)
- ⚠️ Histórico (30%)
- ⚠️ Categorias (40%)
- 🔄 Relatórios (0%)
- 🔄 Dashboard Individual (0%)
- ⚠️ Pesquisa Avançada (50%)
- ⚠️ Testes (40%)

**Integração:** 50% completo

- ✅ API client base
- ⚠️ Hooks customizados (60%)
- ⚠️ Types completos (70%)
- 🔄 Testes integração (0%)

**Documentação:** 40% completo

- ⚠️ README backend (60%)
- ⚠️ README frontend (70%)
- ⚠️ Swagger (60%)
- ⚠️ Storybook (40%)
- 🔄 Guias técnicos (0%)

**DevOps:** 30% completo

- ⚠️ Scripts de build (80%)
- 🔄 CI/CD (0%)
- 🔄 Monitoring (0%)
- 🔄 Health checks (0%)

---

**Total Estimado:** 8 semanas (40 dias úteis)
**Prioridade:** Alta
**Risco:** Médio
**Complexidade:** Média-Alta
