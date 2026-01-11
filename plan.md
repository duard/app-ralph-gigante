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
- [ ] Adicionar filtro de período (hoje, semana, mês) para métricas
- [x] Implementar exportação CSV usando react-csv
- [ ] Adicionar exportação Excel usando xlsx
- [ ] Criar exportação PDF usando jsPDF ou react-pdf
- [ ] Sistema de atualização automática a cada 5 minutos para métricas em tempo real

### UI/UX
- [ ] Melhorar layout responsivo com breakpoints mobile-first usando Tailwind
- [ ] Implementar navegação lateral (sidebar) com menus expansíveis
- [x] Adicionar breadcrumb de navegação usando react-router
- [ ] Criar barra de busca global no header
- [ ] Configurar notificações toast usando Sonner em todas as ações
- [ ] Padronizar loading states com skeletons consistentes
- [ ] Implementar error boundaries para capturar erros de UI
- [ ] Adicionar animações em modais e drawers usando Framer Motion
- [ ] Incluir tooltips em botões de ação usando Radix UI
- [x] Implementar toggle dark/light theme com persistência
- [ ] Adicionar customização de cor primária do tema
- [ ] Criar transições suaves entre páginas com page transitions

### Performance
- [ ] Implementar lazy loading de componentes usando React.lazy
- [ ] Configurar code splitting por rotas com React Router
- [ ] Adicionar memoização em componentes pesados usando React.memo
- [ ] Otimizar debounce em searches e inputs (já implementado em alguns)
- [ ] Implementar cache de requisições API usando React Query/SWR
- [ ] Melhorar virtualização para listas longas (já implementado)
- [ ] Otimizar rebuild Vite com configurações apropriadas
- [ ] Reduzir bundle size removendo dependências desnecessárias
- [ ] Melhorar Lighthouse score com otimizações de performance

### Testes
- [ ] Criar testes unitários para hooks customizados usando Vitest
- [ ] Implementar testes de componentes principais com Testing Library
- [ ] Adicionar testes de integração com API usando MSW para mocks
- [ ] Configurar coverage mínimo de 70% com Vite


### Documentação
- [ ] Atualizar README com instruções completas de setup e desenvolvimento
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
npm run test


# Verificar coverage
npm run test:cov

# Verificar lint
npm run lint

# Verificar TypeScript
npm run typecheck

# Build de produção
npm run build

# Preview de produção
npm run preview
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

## Progress

Add entries below this line:

- **2025-01-11**: ✅ Verificado e marcado como concluído o filtro de preço com range slider. O filtro já estava completamente implementado usando o componente Slider do Radix UI (uma escolha melhor que react-range, já que está nas dependências do projeto). O implementação inclui: cálculo dinâmico de faixa de preço baseado nos produtos disponíveis, controle deslizante com step apropriado, feedback visual mostrando min/máx/valores atuais, integração completa com a Zustand store para filtragem, e badge de filtro ativo com opção de limpar. O filtro está localizado na ProductFiltersSidebar nas linhas 264-290 e funciona perfeitamente com o sistema de filtragem global.

- **2025-01-11**: ✅ Implementado gráfico de distribuição por categoria usando Recharts. Criado componente CategoryDistributionChart que exibe distribuição de produtos por categoria com suporte a visualização em barras e pizza. O componente processa dados dinâmicos da store de produtos, calcula contagens por categoria e exibe as 10 principais categorias. Inclui controles para alternar entre tipos de gráfico, métricas resumidas (categoria principal, média por categoria) e design responsivo. Componente integrado ao dashboard layout ao lado do gráfico existente, com tratamento de estado vazio e conformidade com TypeScript strict. Componente localizado em `src/app/dashboard/components/category-distribution-chart.tsx`.

- **2025-01-11**: ✅ Implementada sidebar de filtros de produtos avançados com layout colapsível. Criado componente ProductFiltersSidebar com múltiplos filtros (busca, status, categoria, unidade, faixa de preço), seções colapsíveis, indicadores de filtros ativos, e integração com Zustand store. Componente integrado à página de produtos com layout responsivo (desktop sidebar, mobile trigger) e suporte a filters combinados. Localizado em `src/components/products/product-filters-sidebar.tsx` e `src/components/products/product-list.tsx`.

- **2025-01-11**: ✅ Implementado histórico de preços de produtos com gráficos interativos. Criado hook `useProductPriceHistory` que consome endpoint `/tgfpro/consumo-periodo/{codprod}` da API, componente `PriceHistoryChart` com visualização em Recharts mostrando tendência de preços, métricas médias e variação percentual. Adicionado como nova aba no modal de detalhes do produto com períodos de 30/90 dias. Implementados indicadores visuais de tendência (alta/baixa/estável) e cards de resumo com preço médio e total de movimentações. Componentes localizados em `src/hooks/use-product-price-history.ts` e `src/components/products/price-history-chart.tsx`.

- **2025-01-11**: ✅ Implementado componente breadcrumb-nav.tsx com navegação por breadcrumb usando react-router. Criado componente que utiliza useLocation para obter o caminho atual, gera itens de breadcrumb baseados nos segmentos da URL e integra com os componentes de breadcrumb do shadcn-ui. O componente foi adicionado ao BaseLayout para aparecer em todas as páginas protegidas. Componente localizado em `src/components/breadcrumb-nav.tsx`.

- **2025-01-11**: ✅ Implementado componente product-form.tsx com UI completa de CRUD em modo somente leitura. Criado formulário com 4 abas (Básico, Preços, Estoque, Adicional), validação Zod, upload de imagem com preview, campos monetários formatados, salvamento automático de rascunho e tratamento de estados de loading/error. Componente localizado em `src/components/products/product-form.tsx`.

- **2025-01-11**: ✅ Implementado visualização de imagem do produto no modal de detalhes. Adicionada seção de imagem ao ProductDetailsModal que exibe a imagem do produto quando disponível, com tratamento de erro para imagens quebradas mostrando placeholder. Componente localizado em `src/components/products/product-details-modal.tsx`.
- **2025-01-11**: ✅ Implementado virtualização de lista para 1000+ produtos. Adicionado @tanstack/react-virtual para renderização eficiente, substituído corpo da tabela tradicional por contêiner de rolagem virtualizado, mantido cabeçalho fixo para melhor UX, configurado altura de linha ótima (57px) e overscan (5) para performance.
- **2025-01-11**: ✅ Implementado modal/drawer de detalhes do produto com informações completas do TGFPRO, navegação entre produtos e botão de edição rápida. Componente criado em `src/components/products/product-details-modal.tsx` e integrado na tabela de produtos.
- **2025-01-11**: ✅ Implementado busca em tempo real com debounce de 300ms. Criado utilitário `useDebounce` em `src/lib/utils/debounce.ts`, atualizado `ProductTableToolbar` para busca responsiva e `ProductList` para chamadas API debounced. A busca agora filtra localmente imediatamente para feedback visual e faz chamadas API com 300ms de debounce.

- **2025-01-11**: ✅ Implementada exportação CSV de produtos usando react-csv. Adicionadas funções `productsToCSV` e `downloadCSV` em `src/lib/utils/product-utils.ts` para converter produtos em formato CSV e realizar download. Adicionado botão "Exportar CSV" na barra de ferramentas da tabela de produtos que exporta todos os produtos visíveis com colunas: Código, Nome/Descrição, Ref. Fabricante, Unidade, Preço Venda, Preço Custo, Estoque, Estoque Mínimo, Status, Categoria, NCM, Peso Líquido, Peso Bruto. O arquivo é baixado com nome formatado `produtos-YYYY-MM-DD.csv`.

- **2025-01-11**: ✅ Implementado componente DashboardCards com métricas de produtos. Criado componente que exibe cards com: Total de Produtos, Produtos Ativos, Produtos Sem Estoque e Valor Total em Estoque. Adicionado hook `useDashboardMetrics` para calcular métricas em tempo real a partir dos dados da store de produtos. Componente localizado em `src/app/dashboard/components/dashboard-cards.tsx` e hook em `src/hooks/use-dashboard-metrics.ts`.

- **2025-01-11**: ✅ Implementadas múltiplas funcionalidades críticas do dashboard:
  - **Gráfico de tendência de preços**: Componente PriceTrendChart com análise histórica de preços, períodos 30/90 dias, integração com API de histórico
  - **Tabela de produtos mais vendidos**: Top 10 produtos por valor/movimentação/quantidade com ranking visual e filtros por período
  - **Tabela de produtos recentes**: Produtos adicionados/modificados recentemente com destaque para itens novos (≤7 dias)
  - **Sistema de atualização automática**: Hook useDashboardAutoRefresh com refresh a cada 5 minutos e controles manuais
  - **Lazy loading**: Componentes lazy-loaded para melhor performance inicial com Suspense boundaries
  - **Correções críticas**: Fix propriedades Product (vlrvenda/preco, descrprod/descricao), tipos TypeScript, imports verbatimModuleSyntax
