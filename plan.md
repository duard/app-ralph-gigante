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
- [ ] Histórico de preços (via API endpoints)
- [x] Informações relacionadas (grupo, classe, seção)
- [x] Estoque disponível
- [x] Animações de entrada/saída
- [x] Navegação entre produtos (anterior/próximo)
- [x] Botão de edição rápida

### Filtros Avançados
- [ ] Criar componente ProductFiltersSidebar com layout colapsável
- [ ] Implementar filtro de preço com range slider usando react-range
- [ ] Adicionar filtro por código/produto com input de texto
- [ ] Criar filtro por status (ativo/inativo) com radio buttons
- [ ] Implementar filtro por grupo/categoria com dropdown populado da API /tgfgru
- [ ] Adicionar filtro por unidade de medida com select
- [ ] Suporte a combinação múltipla de filtros com estado global
- [ ] Botão "Limpar todos os filtros" que reseta filtros e recarrega lista
- [ ] Sistema de presets de filtros salvos no localStorage
- [ ] Exibir contagem de resultados em tempo real ao aplicar filtros
- [ ] Integrar filtros avançados na página de produtos com toggle show/hide

### Gestão de Produtos (CRUD - mas comente modo leitura, nos não editamos, ou incluimos, ou excluimod)
- [x] A tela deve conter todas OPERACOES CRUD, mas não edita, não excluir, não incluir VERDADEIRAMENTE, somente le dados
- [x] Formulário de criação de produto
- [x] Validação com Zod schemas
- [x] Formulário de edição de produto
- [ ] Upload de imagens de produto
- [ ] Preview de imagem antes de upload
- [ ] Tratamento de campos numéricos e monetários
- [ ] Múltiplos tipos de campos (text, number, select, date)
- [ ] Salvamento automático (draft)
- [ ] Confirmação antes de excluir
- [ ] Exclusão em lote (bulk delete)

### Dashboard e Métricas
- [ ] Criar componente DashboardCards com métricas: total produtos, ativos, inativos, sem estoque
- [ ] Implementar gráfico de distribuição por categoria usando Recharts
- [ ] Criar gráfico de tendência de preços com dados históricos
- [ ] Adicionar tabela de produtos mais vendidos (top 10)
- [ ] Implementar tabela de produtos recentes (últimos adicionados)
- [ ] Adicionar filtro de período (hoje, semana, mês) para métricas
- [ ] Implementar exportação CSV usando react-csv
- [ ] Adicionar exportação Excel usando xlsx
- [ ] Criar exportação PDF usando jsPDF ou react-pdf
- [ ] Sistema de atualização automática a cada 5 minutos para métricas em tempo real

### UI/UX
- [ ] Melhorar layout responsivo com breakpoints mobile-first usando Tailwind
- [ ] Implementar navegação lateral (sidebar) com menus expansíveis
- [ ] Adicionar breadcrumb de navegação usando react-router
- [ ] Criar barra de busca global no header
- [ ] Configurar notificações toast usando Sonner em todas as ações
- [ ] Padronizar loading states com skeletons consistentes
- [ ] Implementar error boundaries para capturar erros de UI
- [ ] Adicionar animações em modais e drawers usando Framer Motion
- [ ] Incluir tooltips em botões de ação usando Radix UI
- [ ] Implementar toggle dark/light theme com persistência
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

- **2025-01-11**: ✅ Implementado componente product-form.tsx com UI completa de CRUD em modo somente leitura. Criado formulário com 4 abas (Básico, Preços, Estoque, Adicional), validação Zod, upload de imagem com preview, campos monetários formatados, salvamento automático de rascunho e tratamento de estados de loading/error. Componente localizado em `src/components/products/product-form.tsx`.

- **2025-01-11**: ✅ Implementado visualização de imagem do produto no modal de detalhes. Adicionada seção de imagem ao ProductDetailsModal que exibe a imagem do produto quando disponível, com tratamento de erro para imagens quebradas mostrando placeholder. Componente localizado em `src/components/products/product-details-modal.tsx`.
- **2025-01-11**: ✅ Implementado virtualização de lista para 1000+ produtos. Adicionado @tanstack/react-virtual para renderização eficiente, substituído corpo da tabela tradicional por contêiner de rolagem virtualizado, mantido cabeçalho fixo para melhor UX, configurado altura de linha ótima (57px) e overscan (5) para performance.
- **2025-01-11**: ✅ Implementado modal/drawer de detalhes do produto com informações completas do TGFPRO, navegação entre produtos e botão de edição rápida. Componente criado em `src/components/products/product-details-modal.tsx` e integrado na tabela de produtos.
- **2025-01-11**: ✅ Implementado busca em tempo real com debounce de 300ms. Criado utilitário `useDebounce` em `src/lib/utils/debounce.ts`, atualizado `ProductTableToolbar` para busca responsiva e `ProductList` para chamadas API debounced. A busca agora filtra localmente imediatamente para feedback visual e faz chamadas API com 300ms de debounce.
