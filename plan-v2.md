# 📋 Produtos V2 - Plano de Tarefas Detalhado

> Status: 🚧 Em Progresso  
> Última atualização: 2026-01-12

---

## Fase 1: Infraestrutura API

### 1.1 Criar módulo produtos-v2
- [x] Criar pasta `api-sankhya-center/src/sankhya/produtos-v2/`
- [x] Criar arquivo `produtos-v2.module.ts` com imports SharedModule
- [x] Criar arquivo `produtos-v2.service.ts` com injeção SankhyaApiService
- [x] Criar arquivo `produtos-v2.controller.ts` com decorators ApiTags e UseGuards
- [x] Criar pasta `models/` para interfaces e DTOs
- [x] Criar arquivo `models/index.ts` para exports
- [x] Registrar ProdutosV2Module em `sankhya.module.ts`
- [x] Testar build do NestJS

### 1.2 Interfaces e DTOs base
- [x] Criar `models/dashboard-kpis.interface.ts`
- [x] Criar `models/produto-v2.interface.ts`
- [x] Criar `models/grupo-resumo.interface.ts` (em filtro-opcao.interface.ts)
- [x] Criar `models/local-resumo.interface.ts` (em filtro-opcao.interface.ts)
- [x] Criar `models/filtro-opcao.interface.ts`
- [x] Criar `models/produto-v2-find-all.dto.ts`

### 1.3 Endpoint GET /produtos-v2/dashboard/kpis
- [x] Adicionar método `getDashboardKpis()` no service
- [x] SQL: COUNT produtos ativos
- [x] SQL: COUNT grupos distintos com produtos
- [x] SQL: COUNT locais distintos com estoque
- [x] SQL: COUNT produtos com estoque < estmin
- [x] SQL: COUNT produtos sem movimento 90 dias (JOIN TGFITE)
- [x] SQL: SUM valor total estoque (estoque * custo médio)
- [x] Adicionar endpoint no controller com Swagger docs
- [ ] Testar endpoint via curl/Swagger

### 1.4 Endpoint GET /produtos-v2/listagem
- [x] Adicionar método `findAll(dto)` no service
- [x] Implementar filtro: search (DESCRPROD, REFERENCIA, MARCA)
- [x] Implementar filtro: grupos[] (IN clause)
- [x] Implementar filtro: locais[] (IN clause com TGFEST)
- [x] Implementar filtro: controles[] (TIPCONTEST IN)
- [x] Implementar filtro: marcas[] (IN clause)
- [x] Implementar filtro: ativo (S/N)
- [x] Implementar filtro: estoqueMin/estoqueMax
- [x] Implementar filtro: comEstoque/semEstoque
- [x] Implementar ordenação dinâmica com whitelist
- [x] Implementar paginação (page, perPage, offset)
- [x] JOIN TGFGRU para nome do grupo
- [x] JOIN TGFEST (subquery) para estoque agregado
- [x] Adicionar endpoint no controller com todos @ApiQuery
- [ ] Testar endpoint com diferentes combinações

### 1.5 Endpoints de filtros (agregações)
- [x] Adicionar método `getGruposComContagem()` no service
- [x] SQL: SELECT CODGRUPOPROD, DESCRGRUPOPROD, COUNT(*) FROM TGFPRO GROUP BY
- [x] Adicionar endpoint GET /produtos-v2/filtros/grupos
- [x] Adicionar método `getLocaisComContagem()` no service
- [x] SQL: SELECT CODLOCAL, COUNT(DISTINCT CODPROD) FROM TGFEST GROUP BY
- [x] Adicionar endpoint GET /produtos-v2/filtros/locais
- [x] Adicionar método `getControlesComContagem()` no service
- [x] SQL: SELECT TIPCONTEST, COUNT(*) FROM TGFPRO WHERE TIPCONTEST IS NOT NULL GROUP BY
- [x] Adicionar endpoint GET /produtos-v2/filtros/controles
- [x] Adicionar método `getMarcasComContagem()` no service
- [x] SQL: SELECT MARCA, COUNT(*) FROM TGFPRO WHERE MARCA IS NOT NULL GROUP BY
- [x] Adicionar endpoint GET /produtos-v2/filtros/marcas

### 1.6 Endpoints de vista por grupo
- [x] Adicionar método `getGrupoResumo(codgrupoprod)` no service
- [x] SQL: Dados do grupo + contagens + valor estoque
- [x] Adicionar endpoint GET /produtos-v2/grupo/:codgrupoprod/resumo
- [x] Adicionar método `getProdutosPorGrupo(codgrupoprod, dto)` no service
- [x] Reutilizar lógica de findAll com filtro fixo
- [x] Adicionar endpoint GET /produtos-v2/grupo/:codgrupoprod/produtos

### 1.7 Endpoints de vista por local
- [x] Adicionar método `getLocalResumo(codlocal)` no service
- [x] SQL: Dados do local + contagens + valor estoque
- [ ] Adicionar endpoint GET /produtos-v2/local/:codlocal/resumo
- [ ] Adicionar método `getProdutosPorLocal(codlocal, dto)` no service
- [ ] SQL: JOIN TGFEST para produtos neste local
- [ ] Adicionar endpoint GET /produtos-v2/local/:codlocal/produtos

### 1.8 Endpoints de detalhe do produto
- [ ] Adicionar método `getProdutoCompleto(codprod)` no service
- [ ] SQL: Todos campos TGFPRO + joins
- [ ] Adicionar endpoint GET /produtos-v2/:codprod/completo
- [ ] Adicionar método `getEstoquePorLocal(codprod)` no service
- [ ] SQL: SELECT de TGFEST com JOIN TGFLOC
- [ ] Adicionar endpoint GET /produtos-v2/:codprod/estoque-por-local
- [ ] Adicionar método `getConsumoMensal(codprod)` no service
- [ ] SQL: Agregação de TGFITE por mês (últimos 12 meses)
- [ ] Adicionar endpoint GET /produtos-v2/:codprod/consumo-mensal

---

## Fase 2: Dashboard Frontend

### 2.1 Estrutura base
- [ ] Criar pasta `sankhya-products-dashboard/src/app/produtos-v2/`
- [ ] Criar arquivo `page.tsx` com BaseLayout
- [ ] Criar arquivo `dashboard-container.tsx`
- [ ] Adicionar lazy import em `config/routes.tsx`
- [ ] Adicionar rota `/produtos-v2` em routes array
- [ ] Adicionar item "Produtos V2" no sidebar com ícone

### 2.2 Hook de dashboard
- [ ] Criar arquivo `hooks/use-produtos-v2-dashboard.ts`
- [ ] Interface para DashboardKpis response
- [ ] useQuery para GET /produtos-v2/dashboard/kpis
- [ ] staleTime 5 minutos

### 2.3 Componente KPI Card
- [ ] Criar pasta `components/produtos-v2/`
- [ ] Criar arquivo `kpi-card.tsx`
- [ ] Props: title, value, icon, href, trend?, loading?
- [ ] Usar Link do react-router-dom
- [ ] Estilo hover com scale e shadow
- [ ] Skeleton quando loading

### 2.4 Dashboard container
- [ ] Importar hook de dashboard
- [ ] Grid responsivo 5 colunas (lg) / 3 (md) / 2 (sm)
- [ ] KPI: Total Produtos → /produtos-v2/listagem
- [ ] KPI: Grupos → /produtos-v2/listagem?view=grupos
- [ ] KPI: Locais → /produtos-v2/listagem?view=locais
- [ ] KPI: Críticos → /produtos-v2/listagem?critico=true
- [ ] KPI: Valor Total (sem link, apenas info)
- [ ] Loading state com skeletons
- [ ] Error state com retry

---

## Fase 3: Listagem Universal Frontend

### 3.1 Estrutura da página
- [ ] Criar pasta `src/app/produtos-v2/listagem/`
- [ ] Criar arquivo `page.tsx` com BaseLayout
- [ ] Criar arquivo `listagem-container.tsx`
- [ ] Adicionar rota `/produtos-v2/listagem`

### 3.2 Hooks de dados
- [ ] Criar arquivo `hooks/use-produtos-v2-listagem.ts`
- [ ] Interface para params (todos os filtros)
- [ ] useQuery com queryKey incluindo todos params
- [ ] Criar arquivo `hooks/use-produtos-v2-filtros.ts`
- [ ] useQuery para grupos (GET /produtos-v2/filtros/grupos)
- [ ] useQuery para locais (GET /produtos-v2/filtros/locais)
- [ ] useQuery para controles
- [ ] useQuery para marcas

### 3.3 Componente tabela
- [ ] Criar arquivo `components/produtos-v2/produto-table.tsx`
- [ ] Props: data, loading, onSort, sortCol, sortDir
- [ ] Coluna Código - ordenável, link para detalhe
- [ ] Coluna Descrição - ordenável, link para detalhe
- [ ] Coluna Grupo - ordenável, link para /grupo/:id
- [ ] Coluna Local - ordenável, link para /local/:id
- [ ] Coluna Controle - ordenável, badge
- [ ] Coluna Estoque - ordenável, cor por status
- [ ] Coluna Ativo - ordenável, badge
- [ ] Header clicável para ordenação
- [ ] Ícones de ordenação (up/down/neutral)

### 3.4 Componente filtros
- [ ] Criar arquivo `components/produtos-v2/filter-panel.tsx`
- [ ] Input de busca com debounce
- [ ] Multi-select para grupos (com busca)
- [ ] Multi-select para locais (com busca)
- [ ] Multi-select para controles
- [ ] Multi-select para marcas
- [ ] Checkbox: Com estoque / Sem estoque
- [ ] Checkbox: Estoque crítico
- [ ] Botão limpar todos filtros
- [ ] Badge com contagem de filtros ativos

### 3.5 Componente paginação
- [ ] Criar arquivo `components/produtos-v2/pagination.tsx`
- [ ] Props: page, perPage, total, onPageChange, onPerPageChange
- [ ] Botões: primeiro, anterior, próximo, último
- [ ] Select para itens por página (20, 50, 100)
- [ ] Texto: "Mostrando X a Y de Z"

### 3.6 Listagem container
- [ ] Layout: filtros à esquerda (collapsible), tabela à direita
- [ ] URL state para todos os filtros
- [ ] URL state para ordenação
- [ ] URL state para paginação
- [ ] Breadcrumb: Dashboard > Listagem
- [ ] Integrar todos os componentes

---

## Fase 4: Vistas Contextuais Frontend

### 4.1 Vista por grupo
- [ ] Criar pasta `src/app/produtos-v2/grupo/[codgrupoprod]/`
- [ ] Criar arquivo `page.tsx`
- [ ] Criar arquivo `grupo-container.tsx`
- [ ] Adicionar rota `/produtos-v2/grupo/:codgrupoprod`
- [ ] Criar hook `use-grupo-resumo.ts`
- [ ] Header: nome do grupo, total produtos, valor
- [ ] Reutilizar produto-table com filtro fixo
- [ ] Breadcrumb: Dashboard > Grupos > {Nome}

### 4.2 Vista por local
- [ ] Criar pasta `src/app/produtos-v2/local/[codlocal]/`
- [ ] Criar arquivo `page.tsx`
- [ ] Criar arquivo `local-container.tsx`
- [ ] Adicionar rota `/produtos-v2/local/:codlocal`
- [ ] Criar hook `use-local-resumo.ts`
- [ ] Header: código e descrição, total produtos, valor
- [ ] Reutilizar produto-table com filtro fixo
- [ ] Breadcrumb: Dashboard > Locais > {Código}

### 4.3 Breadcrumb dinâmico
- [ ] Criar arquivo `components/produtos-v2/breadcrumb.tsx`
- [ ] Props: items array [{label, href}]
- [ ] Usar componente Breadcrumb do shadcn
- [ ] Último item sem link (página atual)

---

## Fase 5: Detalhe do Produto Frontend

### 5.1 Estrutura da página
- [ ] Criar pasta `src/app/produtos-v2/[codprod]/`
- [ ] Criar arquivo `page.tsx`
- [ ] Criar arquivo `detalhe-container.tsx`
- [ ] Adicionar rota `/produtos-v2/:codprod`

### 5.2 Hooks de detalhe
- [ ] Criar arquivo `hooks/use-produto-v2-detalhe.ts`
- [ ] useQuery para GET /produtos-v2/:codprod/completo
- [ ] Criar arquivo `hooks/use-produto-v2-estoque.ts`
- [ ] useQuery para GET /produtos-v2/:codprod/estoque-por-local
- [ ] Criar arquivo `hooks/use-produto-v2-consumo.ts`
- [ ] useQuery para GET /produtos-v2/:codprod/consumo-mensal

### 5.3 Header do produto
- [ ] Criar arquivo `components/produtos-v2/produto-header.tsx`
- [ ] Código e descrição em destaque
- [ ] Badge grupo (linkável)
- [ ] Badge local principal (linkável)
- [ ] Badge status ativo
- [ ] Cards: Estoque Total, Valor, Consumo Médio Mensal

### 5.4 Tabs do produto
- [ ] Usar Tabs do shadcn
- [ ] Tab Geral: dados cadastrais em grid
- [ ] Tab Estoque: tabela por local com links
- [ ] Tab Consumo: gráfico + tabela de movimentos
- [ ] Cada tab como componente separado

### 5.5 Tab Geral
- [ ] Criar arquivo `components/produtos-v2/tab-geral.tsx`
- [ ] Grid 2 colunas com campos
- [ ] Campos: referência, marca, NCM, volume, peso, etc

### 5.6 Tab Estoque
- [ ] Criar arquivo `components/produtos-v2/tab-estoque.tsx`
- [ ] Tabela: Local (link), Estoque, Mínimo, Máximo, Status
- [ ] Cores para status (crítico, ok, excesso)

### 5.7 Tab Consumo
- [ ] Criar arquivo `components/produtos-v2/tab-consumo.tsx`
- [ ] Gráfico de barras: consumo por mês (Recharts)
- [ ] Tabela: últimas 20 movimentações

---

## Fase 6: Polish & Performance

### 6.1 Loading states
- [ ] Skeleton em dashboard KPIs
- [ ] Skeleton em tabela de listagem
- [ ] Skeleton em detalhe do produto
- [ ] Spinner em ações de filtro

### 6.2 Error handling
- [ ] Error boundary em cada página
- [ ] Toast para erros de API
- [ ] Retry button em erros
- [ ] Fallback UI amigável

### 6.3 Cache e prefetch
- [ ] Prefetch ao hover em links de grupo
- [ ] Prefetch ao hover em links de local
- [ ] Invalidação após navegação de volta
- [ ] staleTime apropriado por tipo de dado

### 6.4 Documentação
- [ ] README em api-sankhya-center/docs/produtos-v2/
- [ ] README em sankhya-products-dashboard/docs/produtos-v2/
- [ ] Swagger completo com exemplos
- [ ] Comentários em interfaces complexas

---

## 📊 Progresso

| Fase | Tarefas | Concluídas | % |
|------|---------|------------|---|
| 1. API | 58 | 52 | 90% |
| 2. Dashboard FE | 20 | 0 | 0% |
| 3. Listagem FE | 35 | 0 | 0% |
| 4. Vistas FE | 18 | 0 | 0% |
| 5. Detalhe FE | 22 | 0 | 0% |
| 6. Polish | 13 | 0 | 0% |
| **TOTAL** | **166** | **52** | **31%** |

---

## 🎯 Próxima Tarefa

**Fase 2.1** - Criar estrutura base do Dashboard Frontend
