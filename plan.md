# Tasks Detalhadas - App React Vite - Dashboard de Produtos Sankhya Center

## FASE 1: Configuração Inicial do Projeto

### 1.1 Setup do Projeto Base
- [x] Criar novo diretório para o projeto: `mkdir sankhya-products-dashboard && cd sankhya-products-dashboard`
- [x] Copiar estrutura base do shadcn-dashboard-landing-template/vite-version
- [x] Atualizar package.json com novo nome e versão
- [x] Configurar .gitignore personalizado
- [x] Criar estrutura de diretórios inicial
- [x] Configurar .env.example com variáveis necessárias
- [x] Configurar .env.local com valores de desenvolvimento
- [x] Atualizar README.md com descrição do projeto

### 1.2 Configuração TypeScript
- [x] Configurar tsconfig.json com strict mode
- [x] Configurar tsconfig.app.json
- [x] Configurar tsconfig.node.json
- [x] Criar types globais em src/types/global.d.ts
- [x] Criar tipos para API responses
- [x] Criar tipos para componentes React
- [x] Configurar path aliases (@/*)

### 1.3 Configuração Vite
- [x] Configurar vite.config.ts
- [x] Configurar proxy para API Sankhya (localhost:3000)
- [x] Configurar build optimizations
- [x] Configurar source maps para desenvolvimento
- [x] Configurar HMR (Hot Module Replacement)
- [x] Otimizar configuração de assets

### 1.4 Configuração ESLint e Prettier
- [x] Configurar eslint.config.js
- [x] Configurar plugins React e TypeScript
- [x] Configurar regras de linting personalizadas
- [x] Configurar .prettierrc
- [x] Configurar .prettierignore
- [x] Adicionar scripts no package.json para lint e format

### 1.5 Configuração Git e Hooks
- [x] Inicializar repositório Git
- [x] Configurar .gitignore
- [x] Instalar e configurar Husky
- [x] Configurar pre-commit hook (lint-staged)
- [x] Configurar commit-msg hook (commitlint)
- [x] Criar template de commit message

### 1.6 Setup de CI/CD
- [x] Criar arquivo .github/workflows/ci.yml
- [x] Configurar pipeline de testes
- [x] Configurar pipeline de build
- [x] Configurar pipeline de lint
- [x] Configurar pipeline de typecheck
- [x] Criar arquivo .github/workflows/deploy.yml (opcional)

## FASE 2: Infraestrutura e Configurações

### 2.1 Configuração de Rotas
- [x] Configurar React Router v7
- [x] Criar estrutura de rotas em src/config/routes.tsx
- [x] Criar layout público (sem autenticação)
- [x] Criar layout protegido (com autenticação)
- [x] Criar layout de dashboard (com sidebar)
- [x] Configurar fallback routes (404)
- [x] Configurar rota de redirecionamento raiz

### 2.2 Configuração de Tema
- [x] Configurar next-themes (dark/light mode)
- [x] Criar ThemeProvider
- [x] Criar hook useTheme
- [x] Configurar variáveis CSS para temas
- [x] Criar ThemeToggle component (já existe em mode-toggle.tsx)
- [x] Configurar persistência de tema no localStorage

### 2.3 Configuração de Tailwind CSS
- [x] Configurar tailwind.config.ts (usando Tailwind v4 com @tailwindcss/vite)
- [x] Configurar tema customizado (cores, fontes, espaçamentos)
- [x] Configurar plugins tailwind (tw-animate-css)
- [x] Criar utilitários customizados
- [x] Configurar animações customizadas
- [x] Configurar breakpoints customizados

### 2.4 Configuração de Componentes shadcn-ui
- [x] Configurar components.json do shadcn-ui
- [x] Instalar componentes base necessários:
  - [x] button
  - [x] input
  - [x] label
  - [x] select
  - [x] dialog
  - [x] dropdown-menu
  - [x] popover
  - [x] separator
  - [x] scroll-area
  - [x] table
  - [x] tabs
  - [x] toggle
  - [x] tooltip
  - [x] card
  - [x] avatar
  - [x] badge
  - [x] progress
  - [x] checkbox
  - [x] switch
  - [x] slider
  - [x] command
  - [x] form
- [x] Criar aliases para componentes
- [x] Configurar temas dos componentes

### 2.5 Configuração de Axios
- [x] Criar instância Axios base
- [x] Configurar baseURL da API Sankhya
- [x] Configurar interceptors de request (adicionar token)
- [x] Configurar interceptors de response (tratar erros)
- [x] Configurar retry em falhas
- [x] Configurar timeout padrão
- [x] Criar tipos para API requests/responses

### 2.6 Configuração de State Management (Zustand)
- [x] Criar estrutura de stores
- [x] Criar authStore
- [x] Criar productsStore
- [x] Criar uiStore
- [x] Criar filtersStore (integrado no productsStore)
- [x] Configurar persistência de stores (middleware)

### 2.7 Configuração de Notificações
- [x] Configurar Sonner (toasts)
- [x] Criar hook useNotifications (integrado no API client)
- [x] Criar tipos de notificações (success, error, warning, info)
- [x] Configurar posicionamento e duração
- [x] Criar utilitários para disparar notificações

### 2.8 Configuração de Formulários
- [x] Configurar React Hook Form
- [x] Configurar Zod para validação
- [x] Criar schemas de validação base (auth-schemas.ts, product-schemas.ts)
- [x] Criar utilitários de form
- [x] Configurar resolvers (Zod)

## FASE 3: Autenticação

### 3.1 Criar Tipos de Autenticação
- [x] Criar interface LoginRequest
- [x] Criar interface LoginResponse
- [x] Criar interface RefreshRequest
- [x] Criar interface RefreshResponse
- [x] Criar interface User
- [x] Criar interface AuthState

### 3.2 Criar API Client de Autenticação
- [x] Criar authService em lib/api/authService.ts
- [x] Criar função login
- [x] Criar função refreshToken
- [x] Criar função logout
- [x] Criar função getMe
- [x] Criar função checkAuth

### 3.3 Criar Hook de Autenticação
- [x] Criar hook useAuth
- [x] Implementar login mutation
- [x] Implementar logout mutation
- [x] Implementar refresh token logic
- [x] Implementar checkAuth interval
- [x] Implementar persistência de tokens
- [x] Tratar erros de autenticação

### 3.4 Criar Store de Autenticação
- [x] Criar authStore com Zustand
- [x] Adicionar estado: user, token, refreshToken, isAuthenticated
- [x] Adicionar actions: setUser, setToken, clearAuth
- [x] Adicionar persistência no localStorage
- [x] Adicionar middleware para refresh automático

### 3.5 Criar Página de Login
- [x] Criar rota /login (já existe em /auth/sign-in)
- [x] Criar componente LoginForm
- [x] Implementar campos: username, password
- [x] Implementar validação de formulário
- [x] Implementar loading states
- [x] Implementar feedback visual de erro/sucesso
- [x] Adicionar opção "Lembrar-me"
- [x] Adicionar link para recuperação de senha (placeholder)
- [x] Adicionar link para registro (placeholder)

### 3.6 Criar Interceptores de Autenticação
- [x] Implementar interceptor para adicionar Bearer token
- [x] Implementar interceptor para tratar 401 (unauthorized)
- [x] Implementar lógica de refresh token em 401
- [x] Implementar logout em falha de refresh
- [x] Implementar tratamento de erros globais

### 3.7 Criar Componentes de Autenticação
- [x] Criar ProtectedRoute component (wrapper)
- [x] Criar AuthProvider component
- [x] Criar AuthGuard component
- [x] Criar RequireAuth component (integrado no ProtectedRoute)
- [ ] Criar UserMenu dropdown
- [ ] Criar UserAvatar component
- [x] Criar LogoutButton component

### 3.8 Testar Autenticação
- [ ] Testar login com credenciais válidas
- [ ] Testar login com credenciais inválidas
- [ ] Testar persistência de sessão
- [ ] Testar refresh de token
- [ ] Testar logout
- [ ] Testar redirecionamento em rotas protegidas
- [ ] Testar expiração de token

## FASE 4: Tipos e Interfaces de Produtos

### 4.1 Criar Tipos Base de Produtos
- [x] Criar interface Product
- [x] Criar interface ProductListResponse
- [x] Criar interface ProductFilters
- [x] Criar interface ProductPagination
- [x] Criar interface ProductSearchParams
- [x] Criar interface ProductFormData
- [x] Criar interface ProductWithRelations

### 4.2 Criar Zod Schemas de Produtos
- [x] Criar schema ProductSchema
- [x] Criar schema ProductFiltersSchema
- [x] Criar schema ProductFormSchema
- [x] Criar schema ProductSearchParamsSchema
- [x] Criar mensagens de erro customizadas

### 4.3 Criar Constantes de Produtos
- [x] Criar constantes de colunas da tabela
- [x] Criar constantes de opções de ordenação
- [x] Criar constantes de opções de filtro
- [x] Criar constantes de status de produto
- [x] Criar constantes de unidades de medida

### 4.4 Criar Utilitários de Produtos
- [x] Criar formatProductCode
- [x] Criar formatProductName
- [x] Criar formatProductPrice
- [x] Criar formatProductStatus
- [x] Criar formatProductUnit
- [x] Criar getInitials
- [x] Criar slugify
- [x] Criar formatDate

## FASE 5: API de Produtos

### 5.1 Criar API Client de Produtos
- [ ] Criar productService em lib/api/productService.ts
- [ ] Criar função getProducts
- [ ] Criar função getProductById
- [ ] Criar função createProduct
- [ ] Criar função updateProduct
- [ ] Criar função deleteProduct
- [ ] Criar função searchProducts
- [ ] Criar função getProductsByFilters
- [ ] Criar função getProductsByCategory

### 5.2 Criar Hooks de Produtos
- [ ] Criar hook useProducts
- [ ] Criar hook useProduct
- [ ] Criar hook useCreateProduct
- [ ] Criar hook useUpdateProduct
- [ ] Criar hook useDeleteProduct
- [ ] Criar hook useSearchProducts
- [ ] Criar hook useProductFilters
- [ ] Implementar cache queries
- [ ] Implementar refetch automático
- [ ] Implementar optimistic updates

### 5.3 Criar Store de Produtos
- [ ] Criar productsStore com Zustand
- [ ] Adicionar estado: products, product, filters, pagination
- [ ] Adicionar actions: setProducts, setProduct, setFilters
- [ ] Adicionar computed: filteredProducts, sortedProducts
- [ ] Adicionar persistência de filtros
- [ ] Otimizar seletores com shallow

## FASE 6: Componentes de UI

### 6.1 Criar Componentes de Layout
- [ ] Criar AppLayout component
- [ ] Criar DashboardLayout component
- [ ] Criar Sidebar component
- [ ] Criar SidebarItem component
- [ ] Criar SidebarHeader component
- [ ] Criar SidebarFooter component
- [ ] Criar Header component
- [ ] Criar Breadcrumb component
- [ ] Criar MainContent component
- [ ] Criar Footer component

### 6.2 Criar Componentes de Tabela
- [ ] Criar DataTable component base
- [ ] Criar ProductTable component
- [ ] Criar TableColumn component
- [ ] Criar TableHeader component
- [ ] Criar TableBody component
- [ ] Criar TableCell component
- [ ] Criar TablePagination component
- [ ] Criar TableEmpty component
- [ ] Criar TableLoading component
- [ ] Criar TableActions component

### 6.3 Criar Componentes de Filtros
- [ ] Criar FiltersPanel component
- [ ] Criar FiltersHeader component
- [ ] Criar FilterSection component
- [ ] Criar SearchInput component
- [ ] Criar FilterSelect component
- [ ] Criar FilterRange component
- [ ] Criar FilterCheckbox component
- [ ] Criar FilterTag component
- [ ] Criar ClearFiltersButton component

### 6.4 Criar Componentes de Formulários
- [ ] Criar FormField component wrapper
- [ ] Criar FormInput component
- [ ] Criar FormSelect component
- [ ] Criar FormNumber component
- [ ] Criar FormDate component
- [ ] Criar FormCheckbox component
- [ ] Criar FormSwitch component
- [ ] Criar FormSlider component
- [ ] Criar FormTextarea component
- [ ] Criar FormUpload component

### 6.5 Criar Componentes de Cards
- [ ] Criar MetricCard component
- [ ] Criar StatCard component
- [ ] Criar InfoCard component
- [ ] Criar ActionCard component
- [ ] Criar ProductCard component

### 6.6 Criar Componentes de Modais
- [ ] Criar Modal component base
- [ ] Criar ProductDetailsModal component
- [ ] Criar ProductFormModal component
- [ ] Criar ConfirmModal component
- [ ] Criar ImagePreviewModal component

### 6.7 Criar Componentes de Loading e Estados
- [ ] Criar Skeleton component
- [ ] Criar LoadingSpinner component
- [ ] Criar EmptyState component
- [ ] Criar ErrorState component
- [ ] Criar PageLoading component
- [ ] Criar PageError component

### 6.8 Criar Componentes de Botões e Ações
- [ ] Criar ActionButton component
- [ ] Criar IconButton component
- [ ] Criar ButtonWithTooltip component
- [ ] Criar FloatingActionButton component
- [ ] Criar BulkActionsToolbar component

## FASE 7: Página de Produtos (Listagem)

### 7.1 Criar Rota e Layout de Produtos
- [ ] Criar rota /produtos
- [ ] Criar página src/app/produtos/page.tsx
- [ ] Criar layout específico de produtos
- [ ] Configurar meta tags e SEO

### 7.2 Implementar Listagem de Produtos
- [ ] Criar ProductList component
- [ ] Implementar tabela de produtos
- [ ] Configurar colunas da tabela
- [ ] Implementar ordenação de colunas
- [ ] Implementar paginação
- [ ] Implementar estado de loading
- [ ] Implementar estado vazio
- [ ] Implementar estado de erro
- [ ] Implementar refetch manual

### 7.3 Implementar Filtros de Produtos
- [ ] Criar ProductFilters component
- [ ] Implementar filtro de busca (nome/código)
- [ ] Implementar filtro de preço (range)
- [ ] Implementar filtro de status (ativo/inativo)
- [ ] Implementar filtro de categoria
- [ ] Implementar filtro de unidade
- [ ] Implementar combinação de filtros
- [ ] Implementar contagem de resultados
- [ ] Implementar presets de filtros
- [ ] Implementar limpar filtros

### 7.4 Implementar Busca de Produtos
- [ ] Criar ProductSearch component
- [ ] Implementar input de busca com debounce
- [ ] Implementar sugestões de busca
- [ ] Implementar highlight de termos
- [ ] Implementar histórico de buscas

### 7.5 Implementar Ações de Tabela
- [ ] Adicionar botão de visualizar detalhes
- [ ] Adicionar botão de editar
- [ ] Adicionar botão de excluir
- [ ] Adicionar menu de ações
- [ ] Implementar seleção múltipla
- [ ] Implementar ações em lote
- [ ] Implementar exportar dados

### 7.6 Implementar Colunas da Tabela
- [ ] Criar coluna de código
- [ ] Criar coluna de nome/descrição
- [ ] Criar coluna de preço
- [ ] Criar coluna de estoque
- [ ] Criar coluna de status
- [ ] Criar coluna de categoria
- [ ] Criar coluna de unidade
- [ ] Criar coluna de ações
- [ ] Criar coluna de checkbox (seleção)

### 7.7 Implementar Ordenação
- [ ] Criar SortButton component
- [ ] Implementar ordenação ascendente/descendente
- [ ] Implementar múltiplas colunas de ordenação
- [ ] Implementar indicadores visuais de ordenação
- [ ] Persistir ordenação no store

### 7.8 Implementar Paginação
- [ ] Criar Pagination component
- [ ] Implementar navegação página anterior/próxima
- [ ] Implementar seleção de items per page
- [ ] Implementar info de paginação (1-10 de 100)
- [ ] Implementar jump para primeira/última página
- [ ] Persistir paginação no store

### 7.9 Otimizações de Performance
- [ ] Implementar virtualização da lista
- [ ] Implementar memoização de componentes
- [ ] Implementar lazy loading de imagens
- [ ] Implementar infinite scroll (opcional)
- [ ] Otimizar renders com useCallback/useMemo

## FASE 8: Detalhes do Produto

### 8.1 Criar Modal de Detalhes
- [ ] Criar ProductDetailsModal component
- [ ] Implementar layout de modal
- [ ] Adicionar animações de entrada/saída
- [ ] Implementar close com ESC
- [ ] Implementar close clicando fora

### 8.2 Implementar Seções de Detalhes
- [ ] Criar seção de informações básicas
- [ ] Criar seção de preços
- [ ] Criar seção de estoque
- [ ] Criar seção de categorização
- [ ] Criar seção de imagem
- [ ] Criar seção de metadados
- [ ] Criar seção de histórico

### 8.3 Implementar Informações do Produto
- [ ] Exibir código do produto
- [ ] Exibir nome/descrição
- [ ] Exibir preço atual
- [ ] Exibir preço de custo
- [ ] Exibir preço de venda
- [ ] Exibir estoque disponível
- [ ] Exibir status
- [ ] Exibir unidade de medida
- [ ] Exibir categoria/grupo
- [ ] Exibir data de cadastro
- [ ] Exibir última atualização

### 8.4 Implementar Imagem do Produto
- [ ] Criar ProductImage component
- [ ] Implementar preview de imagem
- [ ] Implementar lightbox de imagem
- [ ] Implementar upload de imagem
- [ ] Implementar crop de imagem (opcional)
- [ ] Implementar fallback para imagem não disponível

### 8.5 Implementar Navegação entre Produtos
- [ ] Criar PreviousProductButton
- [ ] Criar NextProductButton
- [ ] Implementar navegação com setas do teclado
- [ ] Implementar carregamento do produto adjacente

### 8.6 Implementar Ações do Modal
- [ ] Criar botão de editar
- [ ] Criar botão de duplicar
- [ ] Criar botão de excluir
- [ ] Criar botão de compartilhar
- [ ] Criar botão de imprimir

## FASE 9: Formulário de Produto (CRUD)

### 9.1 Criar Modal de Formulário
- [ ] Criar ProductFormModal component
- [ ] Implementar layout de formulário
- [ ] Configurar tabs para seções
- [ ] Implementar validação em tempo real
- [ ] Implementar salvamento automático (draft)
- [ ] Implementar confirmação de saída sem salvar

### 9.2 Criar Campos do Formulário
- [ ] Criar campo código (somente leitura em edição)
- [ ] Criar campo nome/descrição
- [ ] Criar campo preço de custo
- [ ] Criar campo preço de venda
- [ ] Criar campo estoque
- [ ] Criar campo status (select)
- [ ] Criar campo unidade (select)
- [ ] Criar campo categoria/grupo (select)
- [ ] Criar campo observações (textarea)
- [ ] Criar campo imagem (upload)
- [ ] Criar campo de código de barras
- [ ] Criar campo NCM (opcional)
- [ ] Criar campo CEST (opcional)
- [ ] Criar campo peso líquido
- [ ] Criar campo peso bruto

### 9.3 Implementar Validação
- [ ] Validar campos obrigatórios
- [ ] Validar formato de preços
- [ ] Validar valores numéricos
- [ ] Validar imagem (tamanho, formato)
- [ ] Exibir mensagens de erro
- [ ] Implementar validação cruzada (preço venda > custo)

### 9.4 Implementar Upload de Imagem
- [ ] Criar ImageUpload component
- [ ] Implementar drag & drop
- [ ] Implementar preview antes de upload
- [ ] Implementar validação de tamanho
- [ ] Implementar validação de formato
- [ ] Implementar crop de imagem
- [ ] Implementar remoção de imagem

### 9.5 Implementar Salvar/Cancelar
- [ ] Criar botão salvar
- [ ] Criar botão salvar e continuar
- [ ] Criar botão cancelar
- [ ] Implementar loading state
- [ ] Implementar feedback de sucesso/erro
- [ ] Implementar confirmação de descarte de alterações

### 9.6 Implementar Exclusão
- [ ] Criar ConfirmModal para exclusão
- [ ] Implementar mensagem de confirmação
- [ ] Implementar loading de exclusão
- [ ] Implementar feedback de exclusão

### 9.7 Implementar Ações em Lote
- [ ] Criar BulkActions component
- [ ] Implementar seleção múltipla
- [ ] Implementar excluir em lote
- [ ] Implementar alterar status em lote
- [ ] Implementar exportar selecionados
- [ ] Implementar contador de selecionados

## FASE 10: Dashboard e Métricas

### 10.1 Criar Página de Dashboard
- [ ] Criar rota /
- [ ] Criar página src/app/dashboard/page.tsx
- [ ] Configurar layout de dashboard
- [ ] Implementar loading inicial

### 10.2 Criar Cards de Métricas
- [ ] Criar MetricCard component
- [ ] Implementar card total de produtos
- [ ] Implementar card produtos ativos
- [ ] Implementar card produtos inativos
- [ ] Implementar card produtos sem estoque
- [ ] Implementar card valor em estoque
- [ ] Implementar card novos produtos (últimos 30 dias)
- [ ] Implementar card produtos com alerta de estoque

### 10.3 Criar Gráficos
- [ ] Criar ChartsContainer component
- [ ] Implementar gráfico de distribuição por categoria
- [ ] Implementar gráfico de tendência de preços
- [ ] Implementar gráfico de estoque por categoria
- [ ] Implementar gráfico de produtos por status
- [ ] Implementar gráfico de novos produtos por mês

### 10.4 Criar Tabelas de Destaque
- [ ] Criar TopProductsTable component
- [ ] Implementar tabela de produtos mais vendidos
- [ ] Implementar tabela de produtos recentes
- [ ] Implementar tabela de produtos com menor estoque
- [ ] Implementar tabela de produtos mais caros

### 10.5 Implementar Filtro de Período
- [ ] Criar PeriodFilter component
- [ ] Implementar filtro por período (7d, 30d, 90d, 1y)
- [ ] Implementar filtro por data customizada
- [ ] Atualizar métricas ao alterar período

### 10.6 Implementar Exportação
- [ ] Criar ExportButton component
- [ ] Implementar exportação CSV
- [ ] Implementar exportação Excel
- [ ] Implementar exportação PDF
- [ ] Implementar exportação JSON
- [ ] Permitir seleção de colunas

### 10.7 Implementar Atualização em Tempo Real
- [ ] Configurar polling para atualizar dados
- [ ] Implementar indicador de atualização
- [ ] Implementar botão refresh manual
- [ ] Configurar intervalo de refresh

## FASE 11: UX/UI e Polimento

### 11.1 Implementar Dark/Light Mode
- [ ] Criar ThemeToggle component
- [ ] Implementar alternância de tema
- [ ] Configurar persistência de tema
- [ ] Ajustar componentes para ambos temas
- [ ] Testar em ambos temas

### 11.2 Implementar Animações
- [ ] Adicionar transições de página
- [ ] Adicionar animações de entrada de componentes
- [ ] Adicionar animações de hover
- [ ] Adicionar animações de loading
- [ ] Adicionar animações de modal
- [ ] Adicionar animações de toast

### 11.3 Implementar Loading States
- [ ] Criar PageLoading component
- [ ] Criar TableSkeleton component
- [ ] Criar CardSkeleton component
- [ ] Criar FormSkeleton component
- [ ] Implementar loading overlays

### 11.4 Implementar Empty States
- [ ] Criar GenericEmpty component
- [ ] Criar EmptyProducts component
- [ ] Criar EmptySearch component
- [ ] Criar EmptyFilters component
- [ ] Adicionar CTAs relevantes

### 11.5 Implementar Error States
- [ ] Criar ErrorPage component
- [ ] Criar ErrorBoundary component
- [ ] Criar RetryButton component
- [ ] Implementar tratamento de erros globais
- [ ] Implementar feedback de erro em forms

### 11.6 Implementar Notificações
- [ ] Criar NotificationProvider
- [ ] Criar NotificationContainer
- [ ] Implementar toast de sucesso
- [ ] Implementar toast de erro
- [ ] Implementar toast de aviso
- [ ] Implementar toast de info
- [ ] Implementar notificações em lote

### 11.7 Implementar Responsividade
- [ ] Testar em mobile (320px+)
- [ ] Testar em tablet (768px+)
- [ ] Testar em desktop (1024px+)
- [ ] Ajustar sidebar para mobile (drawer)
- [ ] Ajustar tabela para mobile (horizontal scroll)
- [ ] Ajustar formulários para mobile
- [ ] Ajustar dashboard para mobile

### 11.8 Implementar Acessibilidade
- [ ] Adicionar ARIA labels
- [ ] Implementar navegação por teclado
- [ ] Implementar focus management
- [ ] Adicionar alt text em imagens
- [ ] Testar com leitor de tela
- [ ] Verificar contraste de cores
- [ ] Implementar skip links
- [ ] Ajustar font sizes para legibilidade

## FASE 12: Testes

### 12.1 Configurar Ambiente de Testes
- [ ] Configurar Vitest
- [ ] Configurar Testing Library
- [ ] Configurar Mock Service Worker (MSW)
- [ ] Criar mocks da API Sankhya
- [ ] Configurar coverage (istanbul)

### 12.2 Testes Unitários - Hooks
- [ ] Testar useAuth hook
- [ ] Testar useProducts hook
- [ ] Testar useProduct hook
- [ ] Testar useTheme hook
- [ ] Testar hooks customizados

### 12.3 Testes Unitários - Stores
- [ ] Testar authStore
- [ ] Testar productsStore
- [ ] Testar uiStore
- [ ] Testar filtersStore

### 12.4 Testes de Componentes - UI
- [ ] Testar Button component
- [ ] Testar Input component
- [ ] Testar Select component
- [ ] Testar Dialog component
- [ ] Testar Table component
- [ ] Testar Card component

### 12.5 Testes de Componentes - Negócio
- [ ] Testar ProductTable
- [ ] Testar ProductFilters
- [ ] Testar ProductForm
- [ ] Testar ProductDetailsModal
- [ ] Testar MetricCard
- [ ] Testar Charts

### 12.6 Testes de Integração - Autenticação
- [ ] Testar fluxo de login completo
- [ ] Testar fluxo de logout
- [ ] Testar refresh de token
- [ ] Testar rotas protegidas
- [ ] Testar persistência de sessão

### 12.7 Testes de Integração - Produtos
- [ ] Testar listagem de produtos
- [ ] Testar filtros de produtos
- [ ] Testar busca de produtos
- [ ] Testar criação de produto
- [ ] Testar edição de produto
- [ ] Testar exclusão de produto

### 12.8 Testes E2E
- [ ] Configurar Playwright ou Cypress
- [ ] Testar login e logout
- [ ] Testar navegação
- [ ] Testar listagem de produtos
- [ ] Testar filtros
- [ ] Testar CRUD de produto
- [ ] Testar dashboard
- [ ] Testar responsividade

### 12.9 Cobertura
- [ ] Verificar coverage total (>70%)
- [ ] Verificar coverage de components
- [ ] Verificar coverage de hooks
- [ ] Verificar coverage de stores
- [ ] Verificar coverage de services

## FASE 13: Performance e Otimização

### 13.1 Otimizações de Build
- [ ] Configurar code splitting
- [ ] Configurar lazy loading de rotas
- [ ] Configurar tree shaking
- [ ] Configurar minificação
- [ ] Configurar compression (gzip/brotli)
- [ ] Analisar bundle size

### 13.2 Otimizações de Runtime
- [ ] Implementar memoização de componentes (React.memo)
- [ ] Implementar useMemo para cálculos
- [ ] Implementar useCallback para handlers
- [ ] Implementar virtualização de listas longas
- [ ] Implementar lazy loading de imagens
- [ ] Implementar debounce em inputs

### 13.3 Otimizações de API
- [ ] Implementar cache de requests
- [ ] Implementar request deduplication
- [ ] Implementar prefetch de dados
- [ ] Implementar optimistic updates
- [ ] Configurar polling inteligente

### 13.4 Análise de Performance
- [ ] Analisar Lighthouse score
- [ ] Analisar Web Vitals
- [ ] Otimizar Core Web Vitals (LCP, FID, CLS)
- [ ] Otimizar Time to Interactive
- [ ] Otimizar First Contentful Paint

### 13.5 Otimizações de Assets
- [ ] Otimizar imagens (WebP, lazy load)
- [ ] Otimizar fontes (subset, preload)
- [ ] Otimizar ícones (SVG)
- [ ] Remover assets não utilizados

## FASE 14: Documentação

### 14.1 Documentação de Projeto
- [ ] Criar/atualizar README.md
- [ ] Adicionar instruções de setup
- [ ] Adicionar instruções de desenvolvimento
- [ ] Adicionar instruções de build
- [ ] Adicionar instruções de deploy
- [ ] Adicionar diagrama de arquitetura

### 14.2 Documentação de API Client
- [ ] Documentar authService
- [ ] Documentar productService
- [ ] Documentar interfaces
- [ ] Documentar exemplos de uso
- [ ] Documentar tratamento de erros

### 14.3 Documentação de Componentes
- [ ] Criar Storybook
- [ ] Documentar componentes base
- [ [ ] Documentar componentes de negócio
- [ ] Adicionar exemplos de uso
- [ ] Adicionar documentação de props
- [ ] Adicionar documentação de variantes

### 14.4 Documentação de Hooks
- [ ] Documentar useAuth
- [ ] Documentar useProducts
- [ ] Documentar hooks customizados
- [ ] Adicionar exemplos de uso
- [ ] Adicionar notas de performance

### 14.5 Documentação de Stores
- [ ] Documentar authStore
- [ ] Documentar productsStore
- [ ] Documentar api de stores
- [ ] Adicionar exemplos de uso

### 14.6 Documentação de Estilos
- [ ] Criar Style Guide
- [ ] Documentar tokens de design
- [ ] Documentar paleta de cores
- [ ] Documentar tipografia
- [ ] Documentar espaçamentos
- [ ] Documentar animações

### 14.7 Documentação de Contribuição
- [ ] Criar CONTRIBUTING.md
- [ ] Documentar código de conduta
- [ ] Documentar padrões de commit
- [ ] Documentar processo de PR
- [ ] Documentar review process

### 14.8 Documentação de Deployment
- [ ] Criar DEPLOYMENT.md
- [ ] Documentar configuração de ambiente
- [ ] Documentar pipeline de CI/CD
- [ ] Documentar rollback procedures
- [ ] Documentar monitoring

## FASE 15: Deploy e Monitoramento

### 15.1 Configuração de Ambiente
- [ ] Configurar variáveis de produção (.env.production)
- [ ] Configurar CORS para produção
- [ ] Configurar security headers
- [ ] Configurar CSP (Content Security Policy)
- [ ] Configurar rate limiting

### 15.2 Build de Produção
- [ ] Executar build de produção
- [ ] Verificar bundle size
- [ ] Verificar linting
- [ ] Verificar typecheck
- [ ] Testar build localmente

### 15.3 Deploy
- [ ] Configurar Vercel/Netlify/outra plataforma
- [ ] Configurar domínio customizado
- [ ] Configurar SSL
- [ ] Configurar redirect (www para non-www)
- [ ] Deploy inicial

### 15.4 Monitoramento
- [ ] Configurar analytics (Google Analytics ou similar)
- [ ] Configurar error tracking (Sentry)
- [ ] Configurar performance monitoring
- [ ] Configurar uptime monitoring
- [ ] Configurar alertas

### 15.5 Backup e Recovery
- [ ] Configurar backups automáticos
- [ ] Configurar disaster recovery
- [ ] Documentar restore procedures
- [ ] Testar restore procedures

### 15.6 Pós-Deploy
- [ ] Verificar funcionalidades críticas
- [ ] Verificar performance
- [ ] Verificar erros no console
- [ ] Verificar analytics
- [ ] Criar checklist de verificação pós-deploy

## FASE 16: Extras e Melhorias Futuras

### 16.1 Funcionalidades Avançadas (Opcional)
- [ ] Implementar favoritos de produtos
- [ ] Implementar histórico de visualizações
- [ ] Implementar comparação de produtos
- [ ] Implementar export de relatórios customizados
- [ ] Implementar import em massa (CSV/Excel)
- [ ] Implementar webhook notifications

### 16.2 Melhorias de UX (Opcional)
- [ ] Implementar keyboard shortcuts
- [ ] Implementar comandos (Cmd/Ctrl + K)
- [ ] Implementar onboarding tour
- [ ] Implementar search avançado com filtros
- [ ] Implementar drag & drop para reordenar

### 16.3 Melhorias Técnicas (Opcional)
- [ ] Implementar PWA capabilities
- [ ] Implementar offline mode
- [ ] Implementar service worker
- [ ] Implementar background sync
- [ ] Implementar push notifications

### 16.4 Integrações Adicionais (Opcional)
- [ ] Integração com sistema de estoque em tempo real
- [ ] Integração com sistema de vendas
- [ ] Integração com sistema de e-commerce
- [ ] Integração com sistema ERP

### 16.5 Ferramentas de Admin (Opcional)
- [ ] Criar painel de administração
- [ ] Criar logs de atividades
- [ ] Criar auditoria de mudanças
- [ ] Criar relatórios de uso

---

## Resumo de Tasks por Fase

- **Fase 1 (Setup Inicial)**: ~25 tasks
- **Fase 2 (Infraestrutura)**: ~48 tasks
- **Fase 3 (Autenticação)**: ~24 tasks
- **Fase 4 (Tipos de Produtos)**: ~15 tasks
- **Fase 5 (API de Produtos)**: ~24 tasks
- **Fase 6 (Componentes de UI)**: ~40 tasks
- **Fase 7 (Página de Produtos)**: ~40 tasks
- **Fase 8 (Detalhes do Produto)**: ~18 tasks
- **Fase 9 (Formulário CRUD)**: ~30 tasks
- **Fase 10 (Dashboard)**: ~20 tasks
- **Fase 11 (UX/UI)**: ~30 tasks
- **Fase 12 (Testes)**: ~40 tasks
- **Fase 13 (Performance)**: ~25 tasks
- **Fase 14 (Documentação)**: ~24 tasks
- **Fase 15 (Deploy)**: ~18 tasks
- **Fase 16 (Extras)**: ~20 tasks

**Total estimado**: ~441 tasks detalhadas divididas em 16 fases
