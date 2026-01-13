# PRD: Dashboard de Produtos V2 - Melhorias de Gestão

## 📋 Visão Geral

Aprimorar o dashboard de produtos (`/produtos-v2`) para fornecer uma visão completa e acionável do estoque, com filtros avançados e KPIs relevantes para gestão eficiente.

## 🎯 Objetivos

1. **Visibilidade Total**: Mostrar KPIs críticos em cards visuais
2. **Filtros Avançados**: Permitir filtragem por múltiplos critérios
3. **Análise Temporal**: Facilitar análise por período com presets
4. **UX Otimizada**: Interface intuitiva com componentes modernos

## 📊 KPI Cards (Visões)

### Cards Principais

| Card                       | Descrição                                | Fonte de Dados                        | Prioridade |
| -------------------------- | ---------------------------------------- | ------------------------------------- | ---------- |
| **Total de Produtos**      | Quantidade total de produtos cadastrados | `/sankhya/dashboards/produtos/resumo` | Alta       |
| **Produtos Ativos**        | Produtos com status ativo                | `/sankhya/dashboards/produtos/resumo` | Alta       |
| **Quantidade em Estoque**  | Soma de estoqueTotal de todos produtos   | Agregação de `/tgfpro/ultra-search`   | Alta       |
| **Valor Total em Estoque** | Valor financeiro total do estoque        | `/sankhya/dashboards/produtos/resumo` | Alta       |
| **Produtos Críticos**      | Produtos abaixo do estoque mínimo        | `/sankhya/dashboards/produtos/resumo` | Alta       |
| **Sem Estoque**            | Produtos com estoqueTotal = 0            | Agregação client-side                 | Média      |
| **Total de Grupos**        | Quantidade de grupos de produtos         | `/sankhya/tgfgru`                     | Média      |
| **Total de Locais**        | Quantidade de locais de estoque          | `/tgfloc`                             | Média      |
| **Produtos Inativos**      | Produtos com status inativo              | `/sankhya/dashboards/produtos/resumo` | Baixa      |
| **Ticket Médio**           | Valor médio por produto                  | Calculado (valorTotal / qtdProdutos)  | Baixa      |

### Layout dos Cards

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  Total      │  Ativos     │  Qtd Est.   │  Valor Est. │
│  Produtos   │             │             │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  Críticos   │  Sem Est.   │  Grupos     │  Locais     │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

## 🔍 Sistema de Filtros

### 1. Filtro por Grupo

**Componente**: Multi-select dropdown com busca

- Lista todos os grupos de produtos
- Permite seleção múltipla
- Busca incremental por nome do grupo
- Badge mostrando quantidade selecionada

**Endpoint**: `GET /sankhya/tgfgru?ativo=S&perPage=1000`

### 2. Filtro por Local

**Componente**: Multi-select dropdown com busca

- Lista todos os locais de estoque
- Permite seleção múltipla
- Busca incremental por nome do local
- Badge mostrando quantidade selecionada

**Endpoint**: `GET /tgfloc?perPage=1000`

### 3. Filtro por Período

#### Toggle Buttons (Presets)

| Preset            | Descrição           | Período                                      |
| ----------------- | ------------------- | -------------------------------------------- |
| **Hoje**          | Dia atual           | startDate = hoje 00:00, endDate = hoje 23:59 |
| **Última Semana** | Últimos 7 dias      | startDate = hoje - 7 dias, endDate = hoje    |
| **Último Mês**    | Últimos 30 dias     | startDate = hoje - 30 dias, endDate = hoje   |
| **Trimestre**     | Últimos 90 dias     | startDate = hoje - 90 dias, endDate = hoje   |
| **Ano**           | Últimos 365 dias    | startDate = hoje - 365 dias, endDate = hoje  |
| **Personalizado** | Período customizado | Exibe date pickers                           |

#### Componentes de Data

**Start Date**:

- Input type date
- Label: "Data Inicial"
- Validação: não pode ser maior que endDate
- Default: hoje - 30 dias

**End Date**:

- Input type date
- Label: "Data Final"
- Validação: não pode ser menor que startDate
- Default: hoje

### 4. Filtros Adicionais

- **Status**: Radio buttons (Todos / Ativos / Inativos)
- **Situação Estoque**: Radio buttons (Todos / Com Estoque / Sem Estoque / Críticos)
- **Busca**: Input text para busca por nome/código/referência

### Layout dos Filtros

```
┌────────────────────────────────────────────────────────┐
│  🔍 Filtros                                      [✕]   │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Grupos:  [Select Multiple ▼]                         │
│  Locais:  [Select Multiple ▼]                         │
│                                                        │
│  Período:                                              │
│  [Hoje] [Semana] [Mês] [Trimestre] [Ano] [Custom]    │
│                                                        │
│  ┌───────────────┬───────────────┐                   │
│  │ Data Inicial  │ Data Final    │                    │
│  │ [2025-01-01]  │ [2025-01-13]  │                    │
│  └───────────────┴───────────────┘                    │
│                                                        │
│  Status:     ( ) Todos (•) Ativos ( ) Inativos       │
│  Estoque:    (•) Todos ( ) Com ( ) Sem ( ) Críticos  │
│                                                        │
│  Busca: [___________________________________] 🔍       │
│                                                        │
│  [Limpar Filtros]  [Aplicar]                          │
└────────────────────────────────────────────────────────┘
```

## 🏗️ Arquitetura

### State Management

```typescript
interface DashboardFilters {
  grupos: number[]; // IDs dos grupos selecionados
  locais: number[]; // IDs dos locais selecionados
  periodoPreset: PeriodoPreset;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: 'all' | 'active' | 'inactive';
  estoqueStatus: 'all' | 'com' | 'sem' | 'critico';
  search: string;
}

type PeriodoPreset = 'hoje' | 'semana' | 'mes' | 'trimestre' | 'ano' | 'custom';
```

### Hooks Necessários

1. `useDashboardKpis(filters)` - Busca KPIs com filtros aplicados
2. `useGruposList()` - Lista todos os grupos
3. `useLocaisList()` - Lista todos os locais
4. `useDashboardFilters()` - Gerencia estado dos filtros (Zustand)

### Componentes a Criar

1. `<KpiCard />` - Card de KPI individual (já existe)
2. `<FilterPanel />` - Painel lateral de filtros
3. `<PeriodoToggle />` - Toggle buttons de presets de período
4. `<DateRangePicker />` - Seletor de intervalo de datas
5. `<MultiSelectFilter />` - Select múltiplo reutilizável
6. `<StatusRadioGroup />` - Grupo de radio buttons

## 📝 Tasks de Implementação

### Fase 1: Estrutura Base e KPIs (Alta Prioridade)

- [ ] **TASK-001**: Criar store Zustand para filtros do dashboard
  - Arquivo: `src/stores/dashboard-filters-store.ts`
  - Estado inicial com valores default
  - Actions para atualizar cada filtro
  - Persistência em localStorage (opcional)

- [ ] **TASK-002**: Melhorar hook `useDashboardKpis`
  - Aceitar parâmetro `filters`
  - Buscar dados agregados baseado nos filtros
  - Implementar cálculos client-side (quando necessário)
  - Adicionar loading states por card

- [ ] **TASK-003**: Expandir KPI Cards no dashboard
  - Adicionar cards: "Qtd em Estoque", "Sem Estoque", "Ticket Médio"
  - Implementar tooltips explicativos
  - Adicionar indicadores de tendência (↑↓)
  - Melhorar responsividade mobile

- [ ] **TASK-004**: Criar componente `<KpiCardSkeleton />`
  - Loading state individual por card
  - Animação de shimmer
  - Mesmas dimensões do card real

### Fase 2: Filtros Básicos (Alta Prioridade)

- [ ] **TASK-005**: Criar componente `<MultiSelectFilter />`
  - Props: options, value, onChange, label, placeholder
  - Busca incremental
  - Badge com quantidade selecionada
  - "Selecionar Todos" / "Limpar"
  - Usar Shadcn/ui components (Command + Popover)

- [ ] **TASK-006**: Implementar filtro por Grupos
  - Hook `useGruposList()` para buscar grupos
  - Integrar com `<MultiSelectFilter />`
  - Salvar seleção no store de filtros
  - Exibir badge no painel de filtros ativos

- [ ] **TASK-007**: Implementar filtro por Locais
  - Hook `useLocaisList()` para buscar locais
  - Integrar com `<MultiSelectFilter />`
  - Salvar seleção no store de filtros
  - Exibir badge no painel de filtros ativos

- [ ] **TASK-008**: Criar componente `<StatusRadioGroup />`
  - Radio buttons para Status (Todos/Ativos/Inativos)
  - Radio buttons para Estoque (Todos/Com/Sem/Críticos)
  - Integrar com store de filtros

### Fase 3: Filtros de Período (Média Prioridade)

- [ ] **TASK-009**: Criar componente `<PeriodoToggle />`
  - Toggle buttons para presets (Hoje, Semana, Mês, etc.)
  - Visual feedback do preset ativo
  - Calcular datas automaticamente ao clicar
  - Atualizar store de filtros

- [ ] **TASK-010**: Criar componente `<DateRangePicker />`
  - Dois inputs de data (startDate, endDate)
  - Validações de período
  - Integrar com date-fns para formatação
  - Exibir apenas quando preset = "custom"

- [ ] **TASK-011**: Implementar lógica de cálculo de datas
  - Util function `calculatePresetDates(preset)`
  - Retornar { startDate, endDate } em ISO format
  - Considerar timezone local
  - Testes unitários

### Fase 4: Painel de Filtros (Média Prioridade)

- [ ] **TASK-012**: Criar componente `<FilterPanel />`
  - Layout lateral (Sheet do Shadcn/ui)
  - Responsivo (drawer no mobile)
  - Seções colapsáveis
  - Botões "Aplicar" e "Limpar Filtros"

- [ ] **TASK-013**: Implementar busca textual
  - Input com debounce (300ms)
  - Buscar em: descrprod, referencia, codprod
  - Highlight de resultados (opcional)
  - Salvar no store de filtros

- [ ] **TASK-014**: Criar componente `<ActiveFilters />`
  - Chips/badges mostrando filtros ativos
  - Botão X para remover filtro individual
  - Badge com contagem total de filtros
  - Posicionar acima da tabela/grid

### Fase 5: Integração Backend (Alta Prioridade)

- [ ] **TASK-015**: Adaptar endpoint `/sankhya/dashboards/produtos/resumo`
  - Aceitar query params: grupos, locais, startDate, endDate
  - Filtrar produtos antes de agregar
  - Retornar KPIs filtrados

- [ ] **TASK-016**: Criar endpoint `/sankhya/dashboards/produtos/aggregate`
  - Retornar agregações customizadas
  - Aceitar todos os filtros do frontend
  - Otimizar queries SQL (indexes)
  - Implementar cache (5 minutos)

- [ ] **TASK-017**: Implementar filtro de período no backend
  - Buscar movimentações em `TGFITE` por data
  - Agregar produtos com movimento no período
  - Retornar KPIs do período (entradas, saídas, saldo)

### Fase 6: UX e Polimento (Baixa Prioridade)

- [ ] **TASK-018**: Adicionar indicadores de tendência nos cards
  - Comparar com período anterior
  - Mostrar % de variação
  - Ícones de ↑ (positivo) ↓ (negativo)
  - Cores semânticas (verde/vermelho)

- [ ] **TASK-019**: Implementar exportação de dados
  - Botão "Exportar" no dashboard
  - Formato Excel (.xlsx)
  - Incluir dados dos KPIs e filtros aplicados
  - Usar biblioteca `xlsx`

- [ ] **TASK-020**: Adicionar gráficos de visualização
  - Gráfico de pizza: Distribuição por Grupo
  - Gráfico de barras: Top 10 por Valor
  - Gráfico de linha: Evolução do estoque (período)
  - Usar biblioteca `recharts`

- [ ] **TASK-021**: Implementar tooltips informativos
  - Explicar cada KPI ao passar o mouse
  - Mostrar fórmula de cálculo
  - Adicionar links para documentação

- [ ] **TASK-022**: Criar testes automatizados
  - Testes unitários para store de filtros
  - Testes de integração para hooks
  - Testes E2E para fluxo de filtros
  - Usar Vitest + React Testing Library

### Fase 7: Performance (Baixa Prioridade)

- [ ] **TASK-023**: Implementar paginação virtual
  - Usar `@tanstack/react-virtual`
  - Renderizar apenas itens visíveis
  - Melhorar performance com muitos produtos

- [ ] **TASK-024**: Adicionar cache de queries
  - Configurar React Query cache strategies
  - Cache de 5 minutos para KPIs
  - Invalidação ao aplicar filtros

- [ ] **TASK-025**: Otimizar bundle size
  - Code splitting por rota
  - Lazy loading de componentes pesados
  - Tree shaking de bibliotecas
  - Analisar com `vite-bundle-visualizer`

## 🎨 Design System

### Cores dos KPI Cards

- **Verde** (#10b981): KPIs positivos (Total, Ativos, Valor)
- **Amarelo** (#f59e0b): KPIs de atenção (Críticos, Ticket Médio)
- **Vermelho** (#ef4444): KPIs negativos (Sem Estoque, Inativos)
- **Azul** (#3b82f6): KPIs informativos (Grupos, Locais)

### Responsividade

- **Desktop (>1024px)**: 4 cards por linha, filtros em sidebar
- **Tablet (768-1024px)**: 2 cards por linha, filtros em drawer
- **Mobile (<768px)**: 1 card por linha, filtros em bottom sheet

## 📊 Métricas de Sucesso

1. **Tempo de carregamento**: < 2s para KPIs
2. **Usabilidade**: 3 cliques no máximo para aplicar filtros
3. **Performance**: 60 FPS durante interações
4. **Dados precisos**: 100% de correspondência com backend

## 🚀 Roadmap de Entrega

### Sprint 1 (1 semana)

- TASK-001 a TASK-004 (Estrutura base e KPIs)
- TASK-005 (Componente MultiSelect)

### Sprint 2 (1 semana)

- TASK-006 a TASK-008 (Filtros básicos)
- TASK-015 (Adaptação backend)

### Sprint 3 (1 semana)

- TASK-009 a TASK-011 (Filtros de período)
- TASK-012 a TASK-014 (Painel de filtros)

### Sprint 4 (1 semana)

- TASK-016 a TASK-017 (Backend avançado)
- TASK-018 a TASK-019 (UX e exportação)

### Backlog Futuro

- TASK-020 a TASK-025 (Gráficos, testes, performance)

## 📚 Referências Técnicas

- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Charts**: [Recharts](https://recharts.org/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Export**: [SheetJS (xlsx)](https://sheetjs.com/)

## 🔗 Links Úteis

- Documentação Sankhya API: `/api` (Swagger)
- Design Figma: [A ser criado]
- Board Kanban: [A ser criado]

---

**Versão**: 1.0  
**Data**: 2025-01-13  
**Autor**: Equipe Produtos Sankhya
