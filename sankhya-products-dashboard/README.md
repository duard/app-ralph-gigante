# Sankhya Products Dashboard

Dashboard de produtos para o sistema Sankhya Center. Uma aplicação React moderna construída com Vite, TypeScript e Tailwind CSS para gerenciamento e visualização de produtos.

## Stack Tecnológica

- **Framework**: React 19 com Vite 7
- **Linguagem**: TypeScript 5.9
- **Estilização**: Tailwind CSS 4
- **Componentes UI**: shadcn/ui baseado em Radix UI
- **Gerenciamento de Estado**: Zustand 5
- **Roteamento**: React Router v7
- **Formulários**: React Hook Form + Zod
- **Tabelas**: TanStack Table v8
- **Gráficos**: Recharts 3.6
- **HTTP Client**: Axios
- **Notificações**: Sonner

## Funcionalidades

- Dashboard com métricas e gráficos
- Listagem de produtos com filtros avançados
- CRUD completo de produtos
- Busca de produtos com autocomplete
- Autenticação e autorização
- Dark/Light mode
- Design responsivo

## Scripts Disponíveis

```bash
# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Preview do build de produção
pnpm preview

# Lint do código
pnpm lint
```

## Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local` e configure as variáveis necessárias:

```bash
cp .env.example .env.local
```

## Estrutura do Projeto

```
sankhya-products-dashboard/
├── src/
│   ├── app/              # Páginas da aplicação
│   ├── components/       # Componentes reutilizáveis
│   ├── config/           # Arquivos de configuração
│   ├── hooks/            # Hooks customizados
│   ├── lib/              # Utilitários e helpers
│   ├── stores/           # Estado global (Zustand)
│   ├── types/            # Definições de tipos TypeScript
│   └── utils/            # Funções utilitárias
└── public/               # Arquivos estáticos
```

## Desenvolvimento

O projeto utiliza o padrão de componentes baseado no shadcn/ui. Todos os componentes UI ficam em `src/components/ui`.

Para adicionar novos componentes do shadcn/ui:

```bash
npx shadcn@latest add [nome-do-componente]
```

## API

A aplicação se conecta à API do Sankhya Center para:

- Autenticação de usuários
- CRUD de produtos
- Busca e filtros de produtos
- Métricas e relatórios

## Licença

Este projeto é privado e propriedade da empresa.
