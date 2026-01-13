# Sankhya Center - Dashboard de Produtos

Dashboard completo de gestão de produtos integrado com API Sankhya Center, baseado em template shadcn-ui.

## 🚀 Visão Geral

Este projeto consiste em uma aplicação full-stack para gestão de produtos do sistema Sankhya, com:

- **Frontend**: Dashboard React moderno com Vite, TypeScript, e Tailwind CSS
- **Backend**: API NestJS para integração com o Sankhya Center
- **Funcionalidades**: Listagem, filtragem, busca, visualização detalhada e gestão de produtos com autenticação JWT

## 📋 Pré-requisitos

- Node.js 18+
- pnpm (recomendado) ou npm
- API Sankhya Center rodando em `http://localhost:3000`
- Git

## 🛠️ Stack Tecnológico

### Frontend (sankhya-products-dashboard)

- **Framework**: React 19.2.3 + Vite 7.3.0
- **Linguagem**: TypeScript 5.9.3
- **Estilização**: Tailwind CSS 4.1.18 + shadcn/ui
- **Gerenciamento de Estado**: Zustand 5.0.9
- **Roteamento**: React Router 7.11.0
- **Formulários**: React Hook Form 7.69.0 + Zod 4.3.2
- **Tabelas**: TanStack React Table 8.21.3
- **Gráficos**: Recharts 3.6.0
- **HTTP Client**: Axios
- **Notificações**: Sonner 2.0.7
- **Testes**: Vitest + Testing Library + MSW

### Backend (api-sankhya-center)

- **Framework**: NestJS
- **Banco de Dados**: Integração com Sankhya ERP
- **Autenticação**: JWT
- **Documentação**: Swagger/OpenAPI

## 🚀 Setup Rápido

### 1. Clonar o Repositório

```bash
git clone <repository-url>
cd z-ralph-code
```

### 2. Instalar Dependências

```bash
# Instalar dependências do projeto principal
pnpm install

# Instalar dependências do frontend
cd sankhya-products-dashboard
pnpm install

# Instalar dependências do backend
cd ../api-sankhya-center
pnpm install
```

### 3. Configurar Variáveis de Ambiente

#### Frontend (sankhya-products-dashboard)

Crie um arquivo `.env.local`:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Sankhya Center
```

#### Backend (api-sankhya-center)

Configure o arquivo `.env`:

```env
PORT=3000
JWT_SECRET=seu-jwt-secret
SANKHYA_URL=URL_DA_API_SANKHYA
SANKHYA_USERNAME=CONVIDADO
SANKHYA_PASSWORD=guest123
```

### 4. Iniciar os Serviços

#### Iniciar Backend API

```bash
cd api-sankhya-center
pnpm run start:dev
```

A API estará disponível em `http://localhost:3000`

#### Iniciar Frontend

```bash
cd sankhya-products-dashboard
pnpm dev
```

O dashboard estará disponível em `http://localhost:5173`

## 🔐 Autenticação

O sistema utiliza um fluxo de autenticação com pass-through da API Sankhya:

1. **Obter Token Externo**:

   ```bash
   curl -X POST https://api-nestjs-sankhya-read-producao.gigantao.net/auth/login \
     -H 'Content-Type: application/json' \
     -d '{"username":"CONVIDADO","password":"guest123"}'
   ```

2. **Enviar Token para API Local**:

   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H 'Content-Type: application/json' \
     -d '{"token":"eyJhbGciOiJIUzI1NiIs..."}'
   ```

3. **Acessar Dashboard**: Use o login `CONVIDADO/guest123` no frontend

## 📁 Estrutura do Projeto

```
z-ralph-code/
├── sankhya-products-dashboard/    # Frontend React
│   ├── src/
│   │   ├── app/                  # Páginas da aplicação
│   │   ├── components/           # Componentes reutilizáveis
│   │   ├── hooks/                # Hooks customizados
│   │   ├── lib/                  # Utilitários e API client
│   │   ├── stores/               # Estado global (Zustand)
│   │   └── types/                # Definições TypeScript
│   ├── public/                   # Arquivos estáticos
│   └── package.json
├── api-sankhya-center/           # Backend NestJS
│   ├── src/
│   │   ├── auth/                 # Módulo de autenticação
│   │   ├── tgfpro/               # Módulo de produtos
│   │   └── dicionario/           # Entidades Sankhya
│   ├── dist/                     # Build da API
│   └── package.json
├── plan.md                       # Documentação completa do projeto
└── README.md                     # Este arquivo
```

## 🧪 Testes

### Frontend

```bash
cd sankhya-products-dashboard

# Executar todos os testes
pnpm test

# Executar com coverage
pnpm test:coverage

# Executar em modo watch
pnpm test:watch

# Interface gráfica dos testes
pnpm test:ui
```

### Backend

```bash
cd api-sankhya-center

# Executar testes unitários
pnpm test

# Executar testes e2e
pnpm test:e2e

# Verificar coverage
pnpm test:cov
```

## 🔧 Desenvolvimento

### Comandos Úteis

#### Frontend

```bash
cd sankhya-products-dashboard

# Iniciar desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Preview do build
pnpm preview

# Lint do código
pnpm lint

# Corrigir lint
pnpm lint:fix

# Formatar código
pnpm format

# Verificar tipos TypeScript
pnpm typecheck
```

#### Backend

```bash
cd api-sankhya-center

# Iniciar desenvolvimento
pnpm run start:dev

# Build para produção
pnpm run build

# Iniciar produção
pnpm run start:prod

# Lint
pnpm run lint

# Fix lint
pnpm run lint:fix
```

### Padrões e Convenções

- **Indentação**: 2 espaços
- **Components**: PascalCase (ProductTable.tsx)
- **Hooks**: camelCase com prefixo "use" (useProducts.ts)
- **Types**: PascalCase (Product.ts)
- **Utils**: camelCase (formatCurrency.ts)
- **Constants**: UPPER_SNAKE_CASE (API_URL.ts)

### Adicionar Componentes shadcn/ui

```bash
cd sankhya-products-dashboard
npx shadcn@latest add [nome-do-componente]
```

## 📊 Funcionalidades

### Dashboard Principal

- Cards com métricas em tempo real
- Gráficos de tendências de preços
- Produtos mais vendidos (top 10)
- Produtos recentes
- Atualização automática a cada 5 minutos

### Gestão de Produtos

- Listagem com paginação e virtualização
- Filtros avançados (preço, status, categoria)
- Busca em tempo real com debounce
- Ordenação por colunas
- Modal de detalhes
- Exportação (CSV, Excel, PDF)

### Autenticação

- Login com JWT
- Refresh token automático
- Persistência de sessão
- Rotas protegidas

## 🌐 API Endpoints

### Autenticação

- `POST /auth/login` - Login
- `GET /auth/me` - Informações do usuário

### Produtos (TGFPRO)

- `GET /tgfpro` - Listar produtos
- `GET /tgfpro/:id` - Detalhes do produto
- `GET /tgfgru` - Grupos de produtos

### Documentação

Acesse `http://localhost:3000/api` para documentação Swagger

## 🚀 Deploy

### Frontend

```bash
cd sankhya-products-dashboard
pnpm build
```

O build será gerado em `dist/`

### Backend

```bash
cd api-sankhya-center
pnpm build
pnpm start:prod
```

## 🔍 Troubleshooting

### Problemas Comuns

1. **Porta 3000 em uso**: Altere a porta no `.env` do backend
2. **Erro de CORS**: Verifique configuração no backend
3. **Token inválido**: Faça login novamente
4. **Build falhando**: Verifique `pnpm typecheck` e `pnpm lint`

### Logs

- Frontend: Browser console
- Backend: Terminal ou arquivos de log

## 📚 Documentação Adicional

- [Documentação completa](plan.md)
- [Requisitos detalhados](plan.md)
- [Arquitetura do sistema](plan.md)
- [API endpoints](plan.md)

## 🤝 Contribuição

1. Fork o projeto
2. Crie branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Add: nova funcionalidade'`)
4. Push para branch (`git push origin feature/nova-funcionalidade`)
5. Abra Pull Request

## 📄 Licença

Este projeto é privado e propriedade da empresa.

---

**Desenvolvido com ❤️ para Sankhya Center**
