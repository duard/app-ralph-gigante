# 📘 Guia Completo do Projeto - Sistema de Produtos Sankhya

> **Última atualização:** 12 de Janeiro de 2026  
> **Versão:** 1.0.0

---

## 🎯 Visão Geral do Projeto

Sistema full-stack para gestão de produtos do ERP Sankhya, com dashboard moderno em React e API robusta em NestJS.

### Objetivo Principal

Criar interface moderna e eficiente para consulta e visualização de produtos (TGFPRO) do sistema Sankhya, com foco em:

- ✅ Performance (carregamento < 2s)
- ✅ UX moderna (mobile-first, dark mode)
- ✅ Dados em tempo real
- ✅ Controle de estoque por local

### O que o sistema faz?

- 📦 Lista produtos com paginação e filtros avançados
- 🔍 Busca inteligente multi-campo
- 📊 Dashboard com métricas e gráficos
- 🏢 Controle de estoque por local (depósitos)
- 📈 Histórico de consumo e movimentações
- 🔐 Autenticação JWT segura

### O que o sistema NÃO faz?

- ❌ Não edita produtos (somente leitura)
- ❌ Não cria produtos novos
- ❌ Não exclui produtos
- ❌ Não gerencia vendas/compras

---

## 📂 Estrutura do Projeto

```
projeto-produtos-sankhya/
├── api-sankhya-center/           # Backend NestJS
│   ├── src/
│   │   ├── sankhya/
│   │   │   ├── tgfpro/          # Módulo de Produtos
│   │   │   │   ├── tgfpro.controller.ts
│   │   │   │   ├── tgfpro.service.ts
│   │   │   │   ├── models/      # DTOs e Interfaces
│   │   │   │   └── consumo/     # Submódulo de consumo
│   │   │   ├── tgfloc/          # Módulo de Locais de Estoque
│   │   │   │   ├── tgfloc.controller.ts
│   │   │   │   └── tgfloc.service.ts
│   │   │   ├── tgfgru/          # Módulo de Grupos
│   │   │   ├── auth/            # Autenticação
│   │   │   └── shared/          # Serviços compartilhados
│   │   ├── common/              # Utils, DTOs, Guards
│   │   └── main.ts
│   └── package.json
│
├── sankhya-products-dashboard/   # Frontend React
│   ├── src/
│   │   ├── app/                 # Páginas (rotas)
│   │   │   ├── dashboard/       # Dashboard principal
│   │   │   ├── produtos/        # Listagem de produtos
│   │   │   └── bem-vindo/       # Página inicial
│   │   ├── components/
│   │   │   ├── products/        # Componentes de produtos
│   │   │   │   ├── product-list.tsx
│   │   │   │   ├── product-details-modal.tsx
│   │   │   │   └── product-filters-sidebar.tsx
│   │   │   ├── layout/          # Layout base
│   │   │   └── ui/              # shadcn/ui components
│   │   ├── hooks/               # Hooks customizados
│   │   │   ├── use-products.ts
│   │   │   └── use-dashboard-metrics.ts
│   │   ├── stores/              # Zustand stores
│   │   │   └── products-store.ts
│   │   └── lib/                 # API clients, utils
│   └── package.json
│
├── plano-completo-produtos-sankhya.md      # Plano de implementação
├── plano-remodelacao-listagem-produtos.md  # Plano de remodelação
└── TEAM-GUIDE.md                           # Este documento
```

---

## 🏗️ Arquitetura

### Backend (API)

```
┌─────────────────────────────────────────────────────────────┐
│                     NestJS API Server                       │
│                    (api-sankhya-center)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   TGFPRO     │  │   TGFLOC     │  │   TGFGRU     │     │
│  │  (Produtos)  │  │   (Locais)   │  │   (Grupos)   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                           │                                  │
│                  ┌────────▼────────┐                        │
│                  │ SankhyaApiService│                       │
│                  │  (HTTP Client)   │                       │
│                  └────────┬─────────┘                       │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  Sankhya ERP    │
                   │  (SQL Server)   │
                   └─────────────────┘
```

### Frontend (Dashboard)

```
┌─────────────────────────────────────────────────────────────┐
│                    React + Vite App                         │
│               (sankhya-products-dashboard)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Dashboard   │  │   Produtos   │  │  Bem-Vindo   │     │
│  │    Page      │  │     Page     │  │     Page     │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                           │                                  │
│         ┌─────────────────┴─────────────────┐               │
│         │                                    │               │
│    ┌────▼────┐                        ┌─────▼─────┐        │
│    │ Hooks   │                        │  Stores   │        │
│    │(React   │                        │ (Zustand) │        │
│    │ Query)  │                        └─────┬─────┘        │
│    └────┬────┘                              │               │
│         │                                    │               │
│         └─────────────┬──────────────────────┘               │
│                       │                                      │
│                  ┌────▼─────┐                               │
│                  │ API Client│                              │
│                  │  (Axios)  │                              │
│                  └────┬──────┘                              │
│                       │                                      │
└───────────────────────┼──────────────────────────────────────┘
                        │
                        ▼
               ┌─────────────────┐
               │  API NestJS     │
               │ (localhost:3000)│
               └─────────────────┘
```

---

## 🗄️ Principais Tabelas do Sankhya

### TGFPRO - Produtos

**Descrição:** Tabela principal de produtos  
**Campos principais:**

- `CODPROD` (PK) - Código do produto
- `DESCRPROD` - Descrição
- `REFERENCIA` - Referência/código interno
- `ATIVO` - Status (S/N)
- `CODGRUPOPROD` (FK) - Grupo do produto
- `TIPCONTEST` - Tipo de controle (LOTE, SÉRIE, etc)
- `LISCONTEST` - Lista de controles possíveis
- `NCM` - Código NCM fiscal
- `MARCA` - Marca

### TGFEST - Estoque

**Descrição:** Controla estoque por local  
**Campos principais:**

- `CODPROD` (FK) - Produto
- `CODLOCAL` (FK) - Local de estoque
- `ESTOQUE` - Quantidade em estoque
- `ESTMIN` - Estoque mínimo
- `ESTMAX` - Estoque máximo
- `CONTROLE` - Número de controle (lote/série)
- `CODPARC` - Parceiro (0 = estoque próprio)

### TGFLOC - Locais de Estoque

**Descrição:** Depósitos/locais onde produtos ficam armazenados  
**Campos principais:**

- `CODLOCAL` (PK) - Código do local
- `DESCRLOCAL` - Nome do local
- `ATIVO` - Status (S/N)

### TGFGRU - Grupos de Produtos

**Descrição:** Categorias/grupos de produtos  
**Campos principais:**

- `CODGRUPOPROD` (PK) - Código do grupo
- `DESCRGRUPOPROD` - Descrição do grupo
- `ATIVO` - Status (S/N)

---

## 🚀 Stack Tecnológico

### Backend

| Tecnologia | Versão | Uso                      |
| ---------- | ------ | ------------------------ |
| NestJS     | 10.x   | Framework base           |
| TypeScript | 5.x    | Linguagem                |
| Axios      | 1.x    | HTTP client para Sankhya |
| JWT        | -      | Autenticação             |
| Swagger    | -      | Documentação API         |
| RxJS       | 7.x    | Programação reativa      |

### Frontend

| Tecnologia   | Versão | Uso             |
| ------------ | ------ | --------------- |
| React        | 19.2.3 | Framework UI    |
| Vite         | 7.3.0  | Build tool      |
| TypeScript   | 5.9.3  | Linguagem       |
| Tailwind CSS | 4.1.18 | Estilização     |
| shadcn/ui    | latest | Componentes     |
| React Router | 7.11.0 | Roteamento      |
| Zustand      | 5.0.9  | Estado global   |
| React Query  | -      | Cache e queries |
| Recharts     | 3.6.0  | Gráficos        |
| Axios        | latest | HTTP client     |

---

## 📡 API Endpoints (Backend)

### Autenticação

```
POST /auth/login
Body: { username, password }
Response: { access_token, refresh_token, user }

GET /auth/me
Headers: Authorization: Bearer {token}
Response: { id, username, nome }
```

### Produtos (TGFPRO)

#### 1. Listar Produtos

```
GET /tgfpro?page=1&perPage=10&search=parafuso&ativo=S
Query params:
  - page: número da página
  - perPage: itens por página
  - search: busca global
  - ativo: S/N
  - codgrupoprod: filtro por grupo
  - marca: filtro por marca
  - tipcontest: tipo de controle
  - liscontest: lista de controle

Response: {
  data: Product[],
  total: number,
  page: number,
  perPage: number,
  lastPage: number,
  hasMore: boolean
}
```

#### 2. Buscar Produto por ID

```
GET /tgfpro/:codprod

Response: Product
```

#### 3. Produtos com Estoque

```
GET /tgfpro/with-stock/all?page=1&perPage=10

Response: {
  data: Product[], (com campo estoque agregado)
  ...
}
```

#### 4. Busca Avançada

```
GET /tgfpro/search/:termo?limit=50

Response: {
  data: Product[] (ordenado por relevância)
}
```

#### 5. Ultra Search (Filtros Completos)

```
GET /tgfpro/ultra-search?search=...&marca=...&codgrupoprod=...

Response: PaginatedResult<Product>
```

#### 6. Consumo por Período

```
GET /tgfpro/consumo-periodo/:codprod?dataInicio=2025-01-01&dataFim=2025-12-31

Response: {
  codprod: number,
  movimentacoes: Movimentacao[],
  saldoAnterior: { qtd, valor },
  saldoAtual: { qtd, valor }
}
```

### Locais (TGFLOC)

#### 1. Listar Locais

```
GET /tgfloc

Response: Tgfloc[]
```

#### 2. Buscar Local por ID

```
GET /tgfloc/:codlocal

Response: Tgfloc
```

#### 3. Locais com Estoque de Produto

```
GET /tgfloc/with-stock/:codprod

Response: LocalEstoque[] (locais que tem o produto)
```

#### 4. Locais com Contagem de Produtos

```
GET /tgfloc/with-product-count

Response: {
  codlocal,
  descrlocal,
  totalProdutos,
  produtosAtivos,
  estoqueTotal,
  produtosAbaixoMinimo
}[]
```

#### 5. Estatísticas de Local

```
GET /tgfloc/:codlocal/statistics

Response: {
  codlocal,
  totalProdutos,
  estoqueTotal,
  produtosAbaixoMinimo,
  ...
}
```

### Grupos (TGFGRU)

```
GET /tgfgru
GET /tgfgru/:codgrupoprod
```

---

## 🎨 Frontend - Páginas e Componentes

### Páginas Principais

#### 1. `/bem-vindo` - Página Inicial

- Tela de boas-vindas
- Links rápidos para seções

#### 2. `/dashboard` - Dashboard de Métricas

**Componentes:**

- `DashboardCards` - Cards com métricas (total produtos, ativos, etc)
- `CategoryDistributionChart` - Gráfico pizza de distribuição
- `PriceTrendChart` - Gráfico de tendência de preços
- `SectionCards` - Cards de produtos mais vendidos/recentes

**Hooks usados:**

- `useDashboardMetrics()` - Busca métricas do dashboard

#### 3. `/produtos` - Listagem de Produtos

**Componentes principais:**

- `ProductList` - Tabela de produtos com paginação
- `ProductFiltersSidebar` - Sidebar com filtros
- `ProductDetailsModal` - Modal de detalhes
- `ProductTableToolbar` - Toolbar de ações

**Hooks usados:**

- `useProducts()` - Busca produtos paginados
- `useProductsWithCache()` - Produtos com cache React Query

**Estado (Zustand):**

- `useProductsStore` - Filtros, paginação, produtos selecionados

### Componentes de Produtos

#### ProductList

```tsx
// src/components/products/product-list.tsx
<ProductList
  products={data}
  isLoading={isLoading}
  onProductClick={handleClick}
/>
```

**Props:**

- `products`: Array de produtos
- `isLoading`: Estado de carregamento
- `onProductClick`: Callback ao clicar em produto

**Features:**

- Virtualização para listas grandes (react-virtual)
- Ordenação por colunas
- Seleção múltipla
- Ações em lote

#### ProductDetailsModal

```tsx
// src/components/products/product-details-modal.tsx
<ProductDetailsModal
  product={selectedProduct}
  isOpen={isOpen}
  onClose={handleClose}
/>
```

**Abas:**

1. Informações Gerais
2. Estoque e Preços
3. Histórico de Movimentações (planejado)
4. Locais de Estoque (planejado)

#### ProductFiltersSidebar

```tsx
// src/components/products/product-filters-sidebar.tsx
<ProductFiltersSidebar
  filters={filters}
  onFilterChange={handleFilterChange}
  onClearFilters={handleClear}
/>
```

**Filtros disponíveis:**

- Busca por nome/código
- Status (Ativo/Inativo)
- Grupo de produtos
- Faixa de preço
- Marca
- Tipo de controle

---

## 🔧 Configuração do Ambiente

### Pré-requisitos

- Node.js 18+
- pnpm (recomendado) ou npm
- Git

### Setup Backend

1. **Navegar para pasta:**

```bash
cd api-sankhya-center
```

2. **Instalar dependências:**

```bash
pnpm install
```

3. **Configurar variáveis de ambiente:**
   Criar arquivo `.env`:

```env
PORT=3000
JWT_SECRET=seu-jwt-secret-aqui
SANKHYA_URL=https://api.sankhya.com
SANKHYA_USERNAME=CONVIDADO
SANKHYA_PASSWORD=guest123
```

4. **Iniciar desenvolvimento:**

```bash
pnpm run start:dev
```

API estará em: `http://localhost:3000`  
Swagger em: `http://localhost:3000/api`

### Setup Frontend

1. **Navegar para pasta:**

```bash
cd sankhya-products-dashboard
```

2. **Instalar dependências:**

```bash
pnpm install
```

3. **Configurar variáveis de ambiente:**
   Criar arquivo `.env.local`:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Sankhya Center
```

4. **Iniciar desenvolvimento:**

```bash
pnpm dev
```

App estará em: `http://localhost:5173`

### Credenciais de Acesso

- **Usuário:** CONVIDADO
- **Senha:** guest123

---

## 🧪 Testes

### Backend

```bash
cd api-sankhya-center

# Testes unitários
pnpm test

# Testes com coverage
pnpm test:cov

# Testes e2e
pnpm test:e2e

# Watch mode
pnpm test:watch
```

### Frontend

```bash
cd sankhya-products-dashboard

# Todos os testes
pnpm test

# Com coverage
pnpm test:coverage

# Watch mode
pnpm test:watch

# UI interativa
pnpm test:ui
```

---

## 📋 Roadmap e Status Atual

### ✅ Implementado (Backend)

- [x] Autenticação JWT
- [x] Módulo TGFPRO completo
- [x] Módulo TGFLOC completo
- [x] Módulo TGFGRU
- [x] Busca avançada de produtos
- [x] Consumo por período
- [x] Documentação Swagger
- [x] Guards de autenticação

### ✅ Implementado (Frontend)

- [x] Dashboard principal com métricas
- [x] Listagem de produtos com paginação
- [x] Filtros avançados (sidebar)
- [x] Modal de detalhes
- [x] Busca em tempo real
- [x] Gráficos (Recharts)
- [x] Dark/Light mode
- [x] Layout responsivo

### 🔄 Em Progresso

- [ ] **Backend:** Endpoint `/tgfpro/with-stock-locations` (produtos com array de locais)
- [ ] **Backend:** Filtros `comControle`/`semControle` no ultraSearch
- [ ] **Backend:** Filtro `codlocal` no TgfproFindAllDto
- [ ] **Frontend:** Toolbar horizontal moderna (substituir sidebar)
- [ ] **Frontend:** Coluna "Locais c/ Estoque" na tabela
- [ ] **Frontend:** Aba de "Locais de Estoque" no modal de detalhes

### 📅 Planejado (Próximas Sprints)

- [ ] Testes automatizados (70%+ coverage)
- [ ] Exportação (CSV, Excel, PDF)
- [ ] Visão de comparação de produtos
- [ ] Visão de histórico e tendências
- [ ] Análise por categoria
- [ ] Dashboard de produto individual (360°)
- [ ] Pesquisa avançada com builder
- [ ] CI/CD pipeline
- [ ] Storybook para componentes

---

## 🐛 Troubleshooting Comum

### Problema: API não conecta ao Sankhya

**Sintoma:** Erros 500 ao buscar produtos  
**Solução:**

1. Verificar `.env` do backend
2. Testar credenciais no Postman
3. Verificar URL do Sankhya

### Problema: Token inválido no frontend

**Sintoma:** Erro 401 ao fazer requests  
**Solução:**

1. Fazer logout e login novamente
2. Limpar localStorage: `localStorage.clear()`
3. Verificar se token está sendo enviado no header

### Problema: Produtos não carregam

**Sintoma:** Lista vazia ou loading infinito  
**Solução:**

1. Abrir DevTools → Network
2. Verificar se request `/tgfpro` retorna 200
3. Verificar response body
4. Limpar cache React Query

### Problema: Build frontend falha

**Sintoma:** Erro ao rodar `pnpm build`  
**Solução:**

```bash
# Limpar node_modules e reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Verificar erros TypeScript
pnpm typecheck

# Verificar lint
pnpm lint
```

### Problema: Porta 3000 em uso

**Sintoma:** `Error: listen EADDRINUSE: address already in use :::3000`  
**Solução:**

```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Ou alterar porta no .env
PORT=3001
```

---

## 📚 Documentos Relacionados

- **[plano-completo-produtos-sankhya.md](./plano-completo-produtos-sankhya.md)** - Plano completo de implementação
- **[plano-remodelacao-listagem-produtos.md](./plano-remodelacao-listagem-produtos.md)** - Plano de remodelação da UI
- **[README.md](./README.md)** - Instruções de setup
- **[prd-app-produtos-sankhya.md](./prd-app-produtos-sankhya.md)** - PRD original

---

## 🤝 Como Contribuir

### Fluxo de Trabalho

1. **Pegar uma task da lista:**
   - Verificar [plano-completo-produtos-sankhya.md](./plano-completo-produtos-sankhya.md)
   - Escolher task com status 🔄 A fazer

2. **Criar branch:**

```bash
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-fix
```

3. **Desenvolver:**
   - Seguir padrões do projeto
   - Adicionar testes
   - Documentar código

4. **Testar:**

```bash
# Backend
cd api-sankhya-center
pnpm test
pnpm lint

# Frontend
cd sankhya-products-dashboard
pnpm test
pnpm typecheck
pnpm lint
```

5. **Commit:**

```bash
git add .
git commit -m "feat: adiciona filtro por local de estoque"
# ou
git commit -m "fix: corrige bug na paginação"
```

**Convenção de commits:**

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Manutenção

6. **Push e Pull Request:**

```bash
git push origin feature/nome-da-feature
```

Abrir PR no GitHub/GitLab

### Padrões de Código

#### Backend (NestJS)

```typescript
// Sempre usar tipos explícitos
async findAll(dto: TgfproFindAllDto): Promise<PaginatedResult<Tgfpro>> {
  // ...
}

// Usar Logger do NestJS
private readonly logger = new Logger(TgfproService.name);
this.logger.log('Buscando produtos...');

// Documentar endpoints com Swagger
@ApiOperation({ summary: 'Listar produtos' })
@ApiResponse({ status: 200, description: 'Lista de produtos' })
```

#### Frontend (React)

```typescript
// Componentes em PascalCase
export function ProductList({ products, isLoading }: Props) {
  // ...
}

// Hooks em camelCase com "use"
export function useProducts() {
  // ...
}

// Props sempre tipadas
interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  onProductClick: (product: Product) => void;
}

// Usar hooks do React Query para dados
const { data, isLoading } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => productService.getAll(filters),
});
```

---

## 📞 Contatos e Suporte

### Equipe

- **Tech Lead:** [Nome]
- **Backend:** [Nome]
- **Frontend:** [Nome]
- **QA:** [Nome]

### Canais

- **Slack:** #projeto-sankhya
- **Email:** team@empresa.com
- **Reuniões:** Segundas 10h (Daily)

---

## 📊 Métricas do Projeto

### Backend

- **Linhas de código:** ~15.000
- **Endpoints:** 30+
- **Módulos:** 8
- **Testes:** 40% coverage (meta: 70%)

### Frontend

- **Linhas de código:** ~12.000
- **Componentes:** 50+
- **Páginas:** 10
- **Testes:** 40% coverage (meta: 70%)

### Performance

- **API Response Time:** < 500ms (média)
- **Frontend Load Time:** < 2s
- **Bundle Size:** ~400KB (gzipped)
- **Lighthouse Score:** 88/100

---

## 🎓 Recursos de Aprendizado

### Documentação Oficial

- [NestJS Docs](https://docs.nestjs.com/)
- [React Docs](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)

### Tutoriais Internos

- [Como criar um novo endpoint](docs/new-endpoint.md) (TODO)
- [Como adicionar um novo filtro](docs/new-filter.md) (TODO)
- [Como criar um componente](docs/new-component.md) (TODO)

---

**📝 Nota:** Este documento é vivo e deve ser atualizado conforme o projeto evolui.

---

**Desenvolvido com ❤️ pela equipe Sankhya Center**
