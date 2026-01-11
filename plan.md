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
- [ ] Filtros por nome, código, preço, status
- [ ] Busca em tempo real com debounce (300ms)
- [x] Controles de paginação (page, perPage)
- [x] Indicador de total, página atual e última página
- [ ] Virtualização de lista para 1000+ produtos
- [x] Estados de loading (skeletons)
 - [x] Estados vazios (empty states)
- [x] Estados de erro com retry

### Detalhes do Produto
- [x] Modal/Drawer para detalhes do produto
- [x] Exibição completa dos campos do TGFPRO
- [ ] Imagem do produto (se disponível)
- [ ] Histórico de preços (via API endpoints)
- [x] Informações relacionadas (grupo, classe, seção)
- [x] Estoque disponível
- [x] Animações de entrada/saída
- [x] Navegação entre produtos (anterior/próximo)
- [x] Botão de edição rápida

### Filtros Avançados
- [ ] Sidebar de filtros colapsável
- [ ] Filtro por preço (range slider)
- [ ] Filtro por código/nome (search input)
- [ ] Filtro por status (ativo/inativo)
- [ ] Filtro por grupo/categoria (dropdown)
- [ ] Filtro por unidade de medida
- [ ] Combinação múltipla de filtros
- [ ] Limpar todos os filtros
- [ ] Salvar filtros como presets
- [ ] Contagem de resultados ao aplicar filtros

### Gestão de Produtos (CRUD - mas comente modo leitura, nos não editamos, ou incluimos, ou excluimod)
- [ ] A tela deve conter todas OPERACOES CRUD, mas não edita, não excluir, não incluir VERDADEIRAMENTE, somente le dados
- [ ] Formulário de criação de produto
- [ ] Validação com Zod schemas
- [ ] Formulário de edição de produto
- [ ] Upload de imagens de produto
- [ ] Preview de imagem antes de upload
- [ ] Tratamento de campos numéricos e monetários
- [ ] Múltiplos tipos de campos (text, number, select, date)
- [ ] Salvamento automático (draft)
- [ ] Confirmação antes de excluir
- [ ] Exclusão em lote (bulk delete)

### Dashboard e Métricas
- [ ] Cards de métricas principais (total produtos, ativos, inativos, sem estoque)
- [ ] Gráfico de distribuição por categoria
- [ ] Gráfico de tendência de preços
- [ ] Tabela de produtos mais vendidos
- [ ] Tabela de produtos recentes
- [ ] Filtro de período para métricas
- [ ] Exportação de dados (CSV, Excel, PDF)
- [ ] Atualização automática em tempo real

### UI/UX
- [ ] Layout responsivo mobile-first
- [ ] Navegação lateral (sidebar) com menus
- [ ] Breadcrumb de navegação
- [ ] Barra de busca global
- [ ] Notificações toast (Sonner)
- [ ] Loading states consistentes
- [ ] Error boundaries
- [ ] Modais e drawers animados
- [ ] Tooltip em ações
- [ ] Dark/Light theme toggle
- [ ] Customização de tema (cor primária)
- [ ] Transições suaves entre páginas

### Performance
- [ ] Lazy loading de componentes
- [ ] Code splitting por rotas
- [ ] Memoização de componentes pesados
- [ ] Debounce em searches e inputs
- [ ] Cache de requisições API
- [ ] Virtualização para listas longas
- [ ] Otimize rebuild Vite (< 5s)
- [ ] Bundle size otimizado (< 500KB gzipped)
- [ ] Lighthouse score > 90

### Testes
- [ ] Testes unitários de hooks customizados
- [ ] Testes de componentes principais
- [ ] Testes de integração com API (mockada)
- [ ] Coverage > 70%


### Documentação
- [ ] README com instruções de setup
- [ ] Documentação de componentes internos
- [ ] API Client documentado
- [ ] Guia de estilos
- [ ] Arquitetura do projeto

### DevOps
- [x] Configuração de ambiente (.env)
- [ ] Scripts de build e deploy
- [ ] CI/CD pipeline configurado
- [x] Linting configurado (ESLint)
- [ ] Prettier configurado
- [ ] Husky pre-commit hooks
- [ ] TypeScript strict mode
- [ ] Health check endpoint
- [ ] Error tracking (Sentry ou similar)
- [ ] Analytics (opcional)
- [ ] full project identation 2 tab

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

## Progress

Add entries below this line:

- **2025-01-11**: ✅ Implementado modal/drawer de detalhes do produto com informações completas do TGFPRO, navegação entre produtos e botão de edição rápida. Componente criado em `src/components/products/product-details-modal.tsx` e integrado na tabela de produtos.
