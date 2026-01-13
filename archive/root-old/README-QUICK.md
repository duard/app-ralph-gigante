# Resumo Rápido - App React Vite Dashboard de Produtos

## 🎯 Objetivo

Criar um aplicativo React + Vite baseado no template **shadcn-dashboard-landing-template** (versão vite) consumindo o módulo de produtos (**TGFPRO**) da API **api-sankhya-center**.

## 📋 Arquivos Criados

| Arquivo                         | Descrição                                 |
| ------------------------------- | ----------------------------------------- |
| `prd-app-produtos-sankhya.md`   | PRD principal para o Ralph Loop           |
| `tasks-app-produtos-sankhya.md` | Lista detalhada de ~441 tasks em 16 fases |
| `ralph-loop-guide.md`           | Guia completo para executar o Ralph Loop  |

## 🚀 Como Começar (Método 1: Automático com Ralph Loop)

### 1. Instalar o comando /ralph (se ainda não instalado)

```bash
npx shadcn@latest add https://brennanmceachran.github.io/agent-utils/ralph-loop-opencode.json
```

### 2. Reiniciar o OpenCode

### 3. Iniciar a API Sankhya

```bash
cd /home/carloshome/z-ralph-code/api-sankhya-center
npm run start:dev
```

### 4. Mudar para agente Ralph no OpenCode e executar

```bash
/ralph @prd-app-produtos-sankhya.md 50
```

## 🚀 Como Começar (Método 2: Manual)

### 1. Copiar template base

```bash
cd /home/carloshome/z-ralph-code
cp -r shadcn-dashboard-landing-template/vite-version sankhya-products-dashboard
cd sankhya-products-dashboard
```

### 2. Instalar dependências

```bash
pnpm install
# ou
npm install
```

### 3. Configurar .env

```bash
VITE_API_URL=http://localhost:3000
```

### 4. Seguir as tasks em ordem

Consulte `tasks-app-produtos-sankhya.md` para seguir as ~441 tasks organizadas em 16 fases.

## 📚 Referências

- **PRD Completo**: `prd-app-produtos-sankhya.md`
- **Tasks Detalhadas**: `tasks-app-produtos-sankhya.md`
- **Guia do Ralph Loop**: `ralph-loop-guide.md`
- **API Sankhya**: `/home/carloshome/z-ralph-code/api-sankhya-center/API_DOCUMENTATION.md`

## 🔧 Tech Stack

- **Frontend**: React 19.2.3, Vite 7.3.0, TypeScript 5.9.3
- **UI Library**: shadcn-ui, Tailwind CSS 4.1.18
- **Routing**: React Router 7.11.0
- **State Management**: Zustand 5.0.9
- **Forms**: React Hook Form 7.69.0 + Zod 4.3.2
- **Tables**: TanStack React Table 8.21.3
- **Charts**: Recharts 3.6.0
- **Icons**: Lucide React 0.562.0
- **Notifications**: Sonner 2.0.7

## 📦 API Endpoints Principais

- **Auth**: `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`
- **Produtos**: `GET /tgfpro`, `GET /tgfpro/:codprod`
- **Base URL**: `http://localhost:3000`

## ✅ Principais Funcionalidades

1. **Autenticação** - Login com JWT, refresh automático, persistência de sessão
2. **Listagem de Produtos** - Tabela paginada, ordenação, filtros avançados
3. **Busca** - Busca em tempo real com debounce
4. **Detalhes do Produto** - Modal com informações completas
5. **CRUD** - Criar, editar, excluir produtos
6. **Dashboard** - Métricas, gráficos, tabelas de destaque
7. **Exportação** - CSV, Excel, PDF
8. **Tema** - Dark/light mode
9. **Responsividade** - Mobile-first
10. **Acessibilidade** - WCAG 2.1 AA

## 🎨 Design System

- **Fonte**: Inter (padrão shadcn)
- **Cores**: Primária customizável (padrão: blue-600)
- **Espaçamento**: 4px grid system
- **Border radius**: 0.5rem (8px)
- **Shadows**: Sistema de sombras do Tailwind

## 📊 Estrutura do App

```
src/
├── app/
│   ├── auth/
│   ├── dashboard/
│   ├── produtos/
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

## 🎯 Fases de Desenvolvimento

| Fase      | Descrição                  | Tasks Estimadas |
| --------- | -------------------------- | --------------- |
| 1         | Setup Inicial              | 25              |
| 2         | Infraestrutura             | 48              |
| 3         | Autenticação               | 24              |
| 4         | Tipos de Produtos          | 15              |
| 5         | API de Produtos            | 24              |
| 6         | Componentes de UI          | 40              |
| 7         | Página de Produtos         | 40              |
| 8         | Detalhes do Produto        | 18              |
| 9         | Formulário CRUD            | 30              |
| 10        | Dashboard                  | 20              |
| 11        | UX/UI e Polimento          | 30              |
| 12        | Testes                     | 40              |
| 13        | Performance e Otimização   | 25              |
| 14        | Documentação               | 24              |
| 15        | Deploy e Monitoramento     | 18              |
| 16        | Extras e Melhorias Futuras | 20              |
| **Total** |                            | **~441 tasks**  |

## ✅ Acceptance Criteria Resumidos

- [x] Autenticação funcional com JWT
- [x] Listagem de produtos com paginação
- [x] Filtros avançados
- [x] Busca em tempo real
- [x] Detalhes do produto
- [x] CRUD completo
- [x] Dashboard com métricas
- [x] Exportação de dados
- [x] Dark/light mode
- [x] Responsividade completa
- [x] Acessibilidade (WCAG 2.1 AA)
- [x] Performance aceitável
- [x] Testes > 70% coverage
- [x] Documentação completa

## 🚀 Scripts Disponíveis

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest",
  "test:e2e": "playwright test"
}
```

## 📖 Mais Informações

Para detalhes completos, consulte:

1. **PRD**: `prd-app-produtos-sankhya.md`
2. **Tasks**: `tasks-app-produtos-sankhya.md`
3. **Guia Ralph Loop**: `ralph-loop-guide.md`
