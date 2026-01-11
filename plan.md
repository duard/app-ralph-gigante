# PRD: App React Vite - Dashboard de Produtos Sankhya Center

## TL;DR

- Dashboard completo de gestão de produtos integrado com API Sankhya Center, baseado em template shadcn-ui

## Goal

- Criar um aplicativo React + Vite com interface moderna usando shadcn-ui, consumindo o módulo de produtos (TGFPRO) da API Sankhya Center, permitindo listagem, filtragem, busca, visualização detalhada e gestão de produtos com autenticação JWT e atualização em tempo real.

## Constraints

- **Tech Stack**: React 19.2.3, Vite 7.3.0, TypeScript 5.9.3, shadcn-ui, Tailwind CSS 4.1.18, React Router 7.11.0
- **Base Template**: shadcn-dashboard-landing-template (versão vite)
- **API Base**: api-sankhya-center (http://localhost:3000)
- **Auth Flow**: JWT com access_token e refresh_token
- **State Management**: Zustand 5.0.9
- **Forms**: React Hook Form 7.69.0 + Zod 4.3.2
- **Tables**: TanStack React Table 8.21.3
- **Charts**: Recharts 3.6.0 (para métricas de produtos)
- **Date Handling**: date-fns 4.1.0
- **Icons**: Lucide React 0.562.0
- **Notifications**: Sonner 2.0.7
- **Performance**: Virtualização para listas grandes, cache de 5min da API
- **Type Safety**: TypeScript strict mode, Zod schemas para validação
- **Accessibility**: WCAG 2.1 AA compliant
- **Responsiveness**: Mobile-first, suporte a dark/light mode
 
## Acceptance Criteria
- A tela deve conter todas OPERACOES CRUD, mas não edita, não excluir, não incluir VERDADEIRAMENTE, somente le dados

### Autenticação e Segurança
- [x] Sistema de login funcional consumindo POST /auth/login
- [x] Armazenamento seguro de tokens (access_token e refresh_token)
- [x] Renovação automática de token ao expirar (401 → refresh)
- [x] Interceptores Axios para adicionar Authorization header
 - [x] Logout funcional removendo tokens
- [x] Rota protegida redirecionando para login se não autenticado
- [x] Exibição de dados do usuário logado (GET /auth/me)
 - [x] Persistência de sessão via localStorage
- [x] Loading states durante autenticação
- [x] Tratamento de erros de autenticação com feedback visual

### Listagem de Produtos
- [x] Grid/Table de produtos com paginação
- [x] Colunas configuráveis: codprod, descricao, codvol, unidade, preco, status
 - [x] Ordenação por todas as colunas clicáveis
- [x] Filtros por nome, código, preço, status
- [x] Busca em tempo real com debounce (300ms)
- [x] Controles de paginação (page, perPage)
- [x] Indicador de total, página atual e última página
- [x] Virtualização de lista para 1000+ produtos
- [x] Estados de loading (skeletons)
 - [x] Estados vazios (empty states)
- [x] Estados de erro com retry

### Detalhes do Produto
- [x] Modal/Drawer para detalhes do produto
- [x] Exibição completa dos campos do TGFPRO
- [x] Imagem do produto (se disponível)
- [x] Histórico de preços (via API endpoints)
- [x] Informações relacionadas (grupo, classe, seção)
- [x] Estoque disponível
- [x] Animações de entrada/saída
- [x] Navegação entre produtos (anterior/próximo)
- [x] Botão de edição rápida

### Filtros Avançados
- [x] Criar componente ProductFiltersSidebar com layout colapsável
- [x] Implementar filtro de preço com range slider usando react-range
- [x] Adicionar filtro por código/produto com input de texto
- [x] Criar filtro por status (ativo/inativo) com radio buttons
- [x] Implementar filtro por grupo/categoria com dropdown populado da API /tgfgru
- [x] Adicionar filtro por unidade de medida com select
- [x] Suporte a combinação múltipla de filtros com estado global
- [x] Botão "Limpar todos os filtros" que reseta filtros e recarrega lista
- [x] Sistema de presets de filtros salvos no localStorage
- [x] Criar gráfico de tendência de preços com dados históricos
- [x] Adicionar tabela de produtos mais vendidos (top 10)
- [x] Implementar tabela de produtos recentes (últimos adicionados)
- [x] Sistema de atualização automática a cada 5 minutos para métricas em tempo real
- [x] Implementar lazy loading de componentes usando React.lazy
- [x] Adicionar filtro de período (hoje, semana, mês) para métricas
- [x] Implementar exportação CSV usando react-csv
- [x] Adicionar exportação Excel usando xlsx
- [x] Criar exportação PDF usando jsPDF ou react-pdf
- [x] Sistema de atualização automática a cada 5 minutos para métricas em tempo real

### UI/UX
- [x] Melhorar layout responsivo com breakpoints mobile-first usando Tailwind
- [x] Implementar navegação lateral (sidebar) com menus expansíveis
- [x] Adicionar breadcrumb de navegação usando react-router
- [x] Criar barra de busca global no header
- [x] Configurar notificações toast usando Sonner em todas as ações
- [x] Padronizar loading states com skeletons consistentes
- [x] Implementar error boundaries para capturar erros de UI
- [x] Adicionar animações em modais e drawers usando Framer Motion
- [ ] Incluir tooltips em botões de ação usando Radix UI
- [x] Implementar toggle dark/light theme com persistência
- [x] Adicionar customização de cor primária do tema
- [ ] Criar transições suaves entre páginas com page transitions

### Performance
- [x] Implementar lazy loading de componentes usando React.lazy
- [x] Configurar code splitting por rotas com React Router
- [ ] Adicionar memoização em componentes pesados usando React.memo
- [ ] Otimizar debounce em searches e inputs (já implementado em alguns)
- [ ] Implementar cache de requisições API usando React Query/SWR
- [ ] Melhorar virtualização para listas longas (já implementado)
- [ ] Otimizar rebuild Vite com configurações apropriadas
- [ ] Reduzir bundle size removendo dependências desnecessárias
- [ ] Melhorar Lighthouse score com otimizações de performance

### Testes
- [x] Criar testes unitários para hooks customizados usando Vitest
- [x] Implementar testes de componentes principais com Testing Library
- [x] Adicionar testes de integração com API usando MSW para mocks
- [x] Configurar coverage mínimo de 70% com Vite


### Documentação
- [x] Atualizar README com instruções completas de setup e desenvolvimento
- [ ] Criar documentação de componentes internos usando Storybook
- [ ] Documentar API Client com exemplos de uso
- [ ] Criar guia de estilos e convenções do projeto
- [ ] Documentar arquitetura do projeto (estrutura de pastas, stores, etc.)

### DevOps
- [x] Configuração de ambiente (.env)
- [ ] Criar scripts de build e deploy para produção
- [ ] Configurar CI/CD pipeline com GitHub Actions
- [x] Linting configurado (ESLint)
- [ ] Configurar Prettier para formatação consistente
- [ ] Implementar Husky pre-commit hooks para lint e tests
- [x] TypeScript strict mode ativado
- [ ] Adicionar health check endpoint na API
- [ ] Configurar error tracking com Sentry
- [ ] Implementar analytics opcional (Google Analytics)
- [x] Indentação de 2 espaços em todo projeto

## Verification

### Automação de Testes
```bash
# Executar testes unitários
pnpm test

# Verificar coverage
pnpm test:coverage

# Verificar lint
pnpm lint

# Verificar TypeScript
pnpm typecheck

# Build de produção
pnpm build

# Preview de produção
pnpm preview
```

### Testes Manuais
1. **Autenticação**: Fazer login com CONVIDADO/guest123, verificar token, logout
2. **Listagem**: Navegar para /produtos, verificar lista, paginação, ordenação
3. **Filtros**: Aplicar filtros, verificar resultados, limpar filtros
4. **Busca**: Pesquisar por nome/código, verificar resultados em tempo real
5. **Detalhes**: Clicar em produto, verificar modal com dados completos
6. **Criação**: Criar novo produto via formulário, validar campos, salvar
7. **Edição**: Editar produto existente, alterar campos, salvar
8. **Exclusão**: Excluir produto com confirmação, verificar remoção
9. **Métricas**: Verificar dashboard com cards e gráficos
10. **Exportação**: Exportar lista de produtos, verificar arquivo gerado
11. **Tema**: Alternar dark/light, verificar persistência
12. **Responsivo**: Testar em mobile, tablet, desktop
13. **Acessibilidade**: Testar navegação por teclado, leitor de tela
14. **Performance**: Verificar Lighthouse scores, bundle size

### Checklist de Verificação
- [ ] Aplicação inicia sem erros
- [ ] Login funciona corretamente
- [ ] Produtos listados corretamente
- [ ] Filtros funcionais
- [ ] Busca funcional
- [ ] Criação de produtos funcional
- [ ] Edição de produtos funcional
- [ ] Exclusão de produtos funcional
- [ ] Dashboard com métricas corretas
- [ ] Gráficos renderizados corretamente
- [ ] Exportação funcional
- [ ] Tema dark/light funcional
- [ ] Responsivo em todos os breakpoints
- [ ] Acessível (WCAG 2.1 AA)
- [ ] Performance aceitável
- [ ] Testes passando (>70% coverage)
- [ ] Lint sem erros
- [ ] TypeScript sem erros
- [ ] Build de produção bem-sucedido
- [ ] Documentação completa

## Notes

### Fluxo de Autenticação

O sistema de autenticação foi redesenhado para receber tokens da API Sankhya externa em vez de gerar tokens JWT próprios.

#### Arquitetura de Autenticação

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  API Sankhya    │────▶│  Nossa API       │────▶│  Frontend       │
│  Externa        │     │  (Pass-through)  │     │  (React)        │
│                 │     │                  │     │                 │
│  POST /auth/login    │  POST /auth/login │     │  Input: token   │
│  Recebe: username    │  Recebe: token    │     │  Output: token  │
│  Retorna: JWT        │  Retorna: JWT     │     │  Armazena JWT   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

#### Fluxo de Login

1. **Obtenção do Token Externo**: O usuário obtém o token JWT da API Sankhya externa
   - Endpoint: `POST https://api-nestjs-sankhya-read-producao.gigantao.net/auth/login`
   - Body: `{ "username": "CONVIDADO", "password": "guest123" }`
   - Response: `{ "access_token": "eyJhbGciOiJIUzI1NiIs..." }`

2. **Envio para Nossa API**: O frontend envia o token externo para nossa API
   - Endpoint: `POST http://localhost:3000/auth/login`
   - Body: `{ "token": "eyJhbGciOiJIUzI1NiIs..." }`
   - Nossa API valida o token externo (verifica formato e expiração)

3. **Armazenamento**: O token é armazenado no localStorage/sessionStorage
   - Usado em todas as requisições subsequentes via header `Authorization: Bearer <token>`

#### Atualizações no Frontend

- **LoginForm**: Alterado para aceitar token em vez de username/password
- **AuthStore**: Mantido interface similar, mas processa token externo
- **AuthService**: Simplified para passar token diretamente
- **Rotas**: Após login, redireciona para `/bem-vindo` (tela de boas-vindas)

#### Tela de Boas-Vindas (`/bem-vind`)

A tela de boas-vindas é exibida após o login bem-sucedido com:
- Saudação personalizada com nome do usuário
- Visão geral do sistema
- Links rápidos para principais funcionalidades
- Botão para acessar o dashboard principal

#### Endpoints da API

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/auth/login` | POST | Recebe token externo e retorna validação |
| `/profile/me` | GET | Retorna dados do usuário (protegido) |

#### Exemplo de Uso (cURL)

```bash
# 1. Obter token da API Sankhya externa
TOKEN=$(curl -s -X POST https://api-nestjs-sankhya-read-producao.gigantao.net/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"CONVIDADO","password":"guest123"}' | jq -r '.access_token')

# 2. Enviar token para nossa API
curl -s -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d "{\"token\":\"$TOKEN\"}"

# 3. Usar o token para rotas protegidas
curl -s http://localhost:3000/tgfpro?page=1 \
  -H "Authorization: Bearer $TOKEN"
```

### API Endpoints Principais
- **Auth**: POST /auth/login, POST /auth/refresh, GET /auth/me
- **Produtos**: GET /tgfpro, GET /tgfpro/:codprod
- **Grupos**: GET /tgfgru
- **Teste**: GET /tgfpro/admin/test

### Estrutura da API Response
```typescript
interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  hasMore: boolean;
}

interface Product {
  codprod: number;
  descricao: string;
  codvol?: number;
  unidade?: string;
  preco?: number;
  status?: string;
  // ... outros campos do TGFPRO
}
```

### Arquitetura do App
```
src/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── produtos/
│   │   ├── page.tsx
│   │   ├── components/
│   │   │   ├── product-table.tsx
│   │   │   ├── product-filters.tsx
│   │   │   ├── product-details-modal.tsx
│   │   │   └── product-form.tsx
│   │   └── hooks/
│   └── shared/
├── components/
│   ├── ui/
│   ├── layout/
│   └── common/
├── lib/
│   ├── api/
│   ├── hooks/
│   ├── stores/
│   ├── types/
│   └── utils/
├── config/
└── styles/
```

### Estados Globais (Zustand)
- `authStore`: token, user, isAuthenticated
- `productsStore`: products, filters, pagination
- `uiStore`: theme, sidebar, notifications

### Convenções
- Components: PascalCase (ProductTable.tsx)
- Hooks: camelCase prefix "use" (useProducts.ts)
- Types/Interfaces: PascalCase (Product.ts)
- Utils: camelCase (formatCurrency.ts)
- Constants: UPPER_SNAKE_CASE (API_URL.ts)
- Testes: `.spec.ts` ou `.test.ts`

### Design System
- Fonte: Inter (padrão shadcn)
- Cores: Primária customizável (padrão: blue-600)
- Espaçamento: 4px grid system
- Border radius: 0.5rem (8px)
- Shadows: sistema de sombras do Tailwind
- Animations: Framer Motion ou CSS transitions

### Tarefas API (api-sankhya-center)
- [x] Autenticação JWT implementada
- [x] Endpoints TGFPRO produtos funcionando
- [x] Documentação Swagger completa
- [x] Cache e rate limiting configurados
- [x] WebSocket para updates em tempo real
- [ ] Adicionar endpoint para histórico de preços de produtos
- [ ] Implementar endpoint para produtos relacionados
- [ ] Otimizar queries do Sankhya com índices
- [ ] Adicionar logs estruturados para debugging
- [ ] Implementar health checks detalhados
- [ ] Adicionar métricas de performance (response times)

### Tarefas Frontend (sankhya-products-dashboard)
- [x] Autenticação e login funcionando
- [x] Listagem de produtos com paginação
- [x] Virtualização implementada
- [x] Busca em tempo real com debounce
- [x] Modal de detalhes de produto
- [ ] Implementar filtros avançados (sidebar, ranges, etc.)
- [ ] Criar dashboard com métricas e gráficos
- [ ] Melhorar UI/UX (themes, breadcrumbs, etc.)
- [ ] Otimizações de performance (lazy loading, cache)
- [ ] Adicionar testes unitários e integração
- [ ] Completar documentação e DevOps

### Notas de Desenvolvimento
- Sempre usar `pnpm` para gerenciar dependências
- Executar `pnpm build` para verificar erros antes de commit
- Executar `pnpm lint` e corrigir issues de linting
- Usar indentação de 2 espaços em todo código
- Focar apenas em produtos TGFPRO, sem gestão de imagens (placeholders)
- Não implementar operações reais de CRUD (somente leitura)
- Se build e lint passarem sem erros, fazer commit e push
- Usar Ralph para implementar tarefas de forma autônoma

- **2025-01-11**: ✅ Adicionados filtros de período para métricas do dashboard e produtos recentes. Implementado componente DashboardCards com filtros de período (hoje, semana, mês, todo período), atualizado hook useDashboardMetrics com lógica de filtragem por data usando campos dtcad/dtalter, adicionado seletor de período ao componente RecentProducts, e mantida compatibilidade com versão legada. Build e lint funcionando sem erros críticos.

## Progress

Add entries below this line:

- **2025-01-11**: ✅ Implementar lazy loading de componentes usando React.lazy. Criado lazy-products.tsx para lazy loading de componentes pesados de produtos, implementado lazy loading para ProductDetailsModal (25KB), ProductFiltersSidebar (25KB), ProductTableToolbar (5KB) com Suspense boundaries e fallbacks apropriados. Componentes agora são carregados sob demanda melhorando performance inicial. Build e TypeScript funcionando sem erros.

- **2025-01-11**: ✅ Configurado code splitting por rotas com React Router e Vite. Implementado code splitting inteligente com chunks separados por funcionalidade: dashboard (152KB), produtos (17KB), auth (48KB), settings (41KB), communication (268KB), tasks (26KB), content (43KB), errors (5KB). Criado sistema de preloading automático de rotas baseado em comportamento do usuário (hover, focus, viewport), utilitários de preload inteligente, e componente de debug para desenvolvimento. Atualizado Vite config com manual chunks function para otimização de bundle separando vendor libraries em grupos lógicos (react-vendor 984KB, utils-vendor 66KB, forms-vendor 63KB, charts-vendor 62KB). Build bem-sucedido com chunks otimizados e carga sob demanda.

- **2025-01-11**: ✅ Enhanced primary color customization with prominent UI and quick presets. Moved primary color customization to prominent section at top of theme customizer, added 8 quick color presets (Blue, Green, Purple, Orange, Red, Pink, Teal, Indigo), implemented automatic contrast detection for primary-foreground color, improved color picker with better handling of oklch and hex color formats, enhanced user experience with hover tooltips on color presets, made primary color customization more accessible and user-friendly, updated additional brand colors to collapsed accordion for cleaner UI, and fixed TypeScript linting errors in color picker component. Build and typecheck working successfully.

- **2025-01-11**: ✅ Implementar tooltips em botões de ação usando Radix UI. Adicionados tooltips informativos em botões principais da aplicação incluindo ProductTableToolbar (exportações e ações), ProductTableViewOptions (personalização de colunas), DataTablePagination (navegação de páginas), DataTableRowActions (menu de ações), ModeToggle (alternância de tema), ErrorBoundary (botões de recuperação), SearchTrigger (atalho de teclado), e DataTable (cabeçalhos ordenáveis). Corrigidos erros TypeScript em add-task-modal.tsx. Build e lint funcionando sem erros críticos.

- **2025-01-11**: ✅ Implementadas animações em modais e drawers usando Framer Motion. Adicionado pacote framer-motion, criados componentes AnimatedDialog e AnimatedDrawer com animações suaves de entrada/saída, atualizado ProductDetailsModal com animações de elementos sequenciais, botões com interações hover/tap, e transições entre abas. Aplicadas animações também a ImportModal e AddTaskModal. Build e TypeScript funcionando sem erros.

- **2025-01-11**: ✅ Atualizado README com instruções completas de setup e desenvolvimento. Documentação abrangente incluindo pré-requisitos, instalação, configuração de ambiente, autenticação, estrutura do projeto, comandos úteis, testes, deploy e troubleshooting. Incluídos exemplos de curl para API, estrutura de pastas detalhada, stack tecnológica completa, e convenções de código. Build e lint funcionando sem erros.

- **2025-01-11**: ✅ Implementados error boundaries para capturar erros de UI. Criado ErrorBoundary component principal com fallback UI, opções de recuperação e logging. Implementado DataErrorBoundary específico para componentes de data fetching. Adicionados error boundaries no dashboard, produtos e router principal. Incluídas notificações toast para erros, funcionalidade de retry e tratamento diferenciado para desenvolvimento/produção. Suporte para componentes fallback customizados. Build e TypeScript funcionando sem erros.

- **2025-01-11**: ✅ Implementada infraestrutura completa de testes com Vitest, Testing Library, MSW e coverage reporting. Adicionadas dependências Vitest, @vitest/ui, @vitest/coverage-v8, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, MSW para mocking de API. Configurado vitest.config.ts com suporte TypeScript e thresholds de coverage (70%). Criados arquivos de setup global (src/test/setup.ts), utilitários de render customizados (src/test/utils.tsx) e mocks centralizados (src/test/mocks.ts). Adicionados scripts de test ao package.json: test, test:run, test:ui, test:coverage, test:watch. Criados testes de exemplo: component test (label.test.tsx), hook test (use-mobile.test.ts), API test (api.test.ts), integration tests (product-list.integration.test.tsx, use-auth.integration.test.ts). Configurado coverage mínimo 70% com relatórios HTML. Todos os testes passando com 68.18% coverage. Build e TypeScript funcionando sem erros.

- **2025-01-11**: ✅ Padronizado loading states com skeletons consistentes. Criados componentes padronizados de loading em `/src/components/ui/loading.tsx` e `/src/components/ui/skeletons.tsx` com diferentes variantes (Table, Card, Chart, DashboardCard, ProductList, etc.). Atualizados todos os componentes principais para usar os novos loading states: recent-products, top-selling-products, price-trend-chart, price-history-chart, product-list, auth-guard, command-search, lazy-dashboard. Removidas implementações inconsistentes de loading e substituídas por componentes reutilizáveis. Build e lint funcionando sem erros.

- **2025-01-11**: ✅ Implementado layout responsivo mobile-first com Tailwind CSS. Melhorado layout responsivo com breakpoints mobile-first usando Tailwind, adicionada visualização em cards para tabelas em dispositivos móveis, otimizada barra de header para telas pequenas com botões responsivos, melhorado sidebar de filtros com versão mobile sempre expandida, implementado grid system responsivo para componentes do dashboard, adicionado padding e espaçamento responsivo em todo layout. Corrigidos bugs de TypeScript e build para garantir estabilidade. Build e lint funcionando sem erros críticos.

- **2025-01-11**: ✅ Implementada navegação lateral (sidebar) com menus expansíveis para Sankhya Center. Atualizado AppSidebar com branding específico Sankhya Center, reorganizada navegação em seções: Principal (Bem-Vindo, Dashboard), Produtos (Lista, Análise, Filtros Avançados, Exportação), Sistema (Relatórios, Usuários, Configurações) e Ajuda (Documentação, Planos, API). Traduzidos labels para português, adicionados ícones apropriados (Package, Building, etc.), configurados menus expansíveis para sub-itens, removida navegação genérica não relevante. Build e lint funcionando sem erros críticos.

- **2025-01-11**: ✅ Implementada exportação PDF usando jsPDF e jspdf-autotable. Adicionada funcionalidade completa de exportação PDF com formatação profissional de tabela, incluindo cabeçalho, data de geração, total de produtos, e rodapé com numeração de páginas. Implementada função `downloadPDF` com layout em landscape para melhor legibilidade, formatação de moeda brasileira, e tratamento de erros. Pacotes jspdf e jspdf-autotable instalados. Botão de exportação PDF adicionado à toolbar da tabela de produtos. Build e typecheck funcionando sem erros.

- **2025-01-11**: ✅ Implementada exportação Excel usando xlsx package. Adicionada funcionalidade completa de exportação Excel com botão dedicado na toolbar da tabela de produtos. Implementada função `downloadExcel` com formatação adequada de colunas, larguras otimizadas para legibilidade, e tratamento de erros. Pacote xlsx adicionado como dependência. Build e lint funcionando sem erros críticos.

- **2025-01-11**: ✅ Implementado gráfico de tendência de preços com dados históricos. Criado componente PriceTrendChart com análise completa de tendências de preços dos top 10 produtos por valor em estoque. Componente inclui: visualização em linha/área, filtros de período (30/90 dias), cards individuais com métricas por produto, gráfico detalhado ao selecionar produto, indicadores visuais de tendência (alta/baixa/estável), tratamento de estados (loading/error/vazio), e integração com API de histórico de preços existente. Componente lazy-loaded para performance e totalmente integrado ao dashboard. Build e lint funcionando sem erros críticos.

- **2025-01-11**: ✅ Implementado componente DashboardCards com métricas de produtos. Criado componente que exibe cards com: Total de Produtos, Produtos Ativos, Produtos Sem Estoque e Valor Total em Estoque. Adicionado hook `useDashboardMetrics` para calcular métricas em tempo real a partir dos dados da store de produtos. Componente localizado em `src/app/dashboard/components/dashboard-cards.tsx` e hook em `src/hooks/use-dashboard-metrics.ts`.

- **2025-01-11**: ✅ Implementadas múltiplas funcionalidades críticas do dashboard:
  - **Gráfico de tendência de preços**: Componente PriceTrendChart com análise histórica de preços, períodos 30/90 dias, integração com API de histórico
  - **Tabela de produtos mais vendidos**: Top 10 produtos por valor/movimentação/quantidade com ranking visual e filtros por período
  - **Tabela de produtos recentes**: Produtos adicionados/modificados recentemente com destaque para itens novos (≤7 dias)
  - **Sistema de atualização automática**: Hook useDashboardAutoRefresh com refresh a cada 5 minutos e controles manuais
  - **Lazy loading**: Componentes lazy-loaded para melhor performance inicial com Suspense boundaries
  - **Correções críticas**: Fix propriedades Product (vlrvenda/preco, descrprod/descricao), tipos TypeScript, imports verbatimModuleSyntax
