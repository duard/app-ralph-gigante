# Produtos Simples - Frontend

## Visão Geral

Página leve e rápida para listagem de produtos com foco em organização por localização, grupo e controle. Ideal para consultas rápidas e gestão de estoque.

## Rota

```
/produtos-simples
```

## Funcionalidades

### Abas (Tabs)

| Aba           | Descrição                                   |
| ------------- | ------------------------------------------- |
| **Com Local** | Produtos com localização definida (default) |
| **Sem Local** | Produtos sem localização cadastrada         |
| **Todos**     | Todos os produtos                           |

### Colunas da Tabela

| Coluna    | Ordenável | Descrição                               |
| --------- | --------- | --------------------------------------- |
| Código    | ✅        | CODPROD - clique para ordenar           |
| Descrição | ✅        | DESCRPROD - texto truncado com tooltip  |
| Grupo     | ✅        | DESCRGRUPOPROD do TGFGRU                |
| Local     | ✅        | LOCALIZACAO física do produto           |
| Controle  | ✅        | TIPCONTEST com badge                    |
| Estoque   | ❌        | Quantidade atual com indicadores de cor |
| Ativo     | ✅        | Status S/N com badge                    |

### Indicadores de Estoque

- 🔴 **Vermelho** - Estoque abaixo do mínimo (estoque ≤ estmin)
- 🟢 **Verde** - Estoque acima do máximo (estoque ≥ estmax)
- ⚪ **Normal** - Estoque dentro dos limites

### Filtros

- **Busca** - Pesquisa por descrição, referência ou marca (debounce 300ms)
- **Limpar** - Botão para resetar filtros

### Paginação

- Seletor de itens por página: 20, 30, 50, 100
- Navegação: primeira, anterior, próxima, última página
- Indicador de página atual e total

## Estado via URL (Full URL State)

Todos os parâmetros são persistidos na URL para compartilhamento e navegação:

| Parâmetro | Valores                                                               | Default     |
| --------- | --------------------------------------------------------------------- | ----------- |
| `tab`     | `com-local`, `sem-local`, `todos`                                     | `com-local` |
| `search`  | string                                                                | -           |
| `sortCol` | `codprod`, `descrprod`, `grupo`, `localizacao`, `tipcontest`, `ativo` | `codprod`   |
| `sortDir` | `asc`, `desc`                                                         | `desc`      |
| `page`    | number                                                                | 1           |
| `perPage` | number                                                                | 30          |

### Exemplo de URL

```
/produtos-simples?tab=com-local&search=parafuso&sortCol=descrprod&sortDir=asc&page=2&perPage=50
```

## Cache (React Query)

- **staleTime**: 2 minutos - dados considerados frescos
- **gcTime**: 5 minutos - tempo de garbage collection

## Arquivos

```
src/
├── app/produtos-simples/
│   ├── page.tsx                    # Wrapper com BaseLayout
│   └── produtos-simples-container.tsx  # Componente principal
├── hooks/
│   └── use-products-simplified.ts  # Hook TanStack Query
└── config/
    └── routes.tsx                  # Rota registrada
```

## Componentes Utilizados (shadcn/ui)

- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`
- `Input`
- `Button`
- `Badge`
- `Skeleton`
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`

## Ícones (Lucide)

- `Search` - Campo de busca
- `X` - Limpar filtros
- `ArrowUpDown`, `ArrowUp`, `ArrowDown` - Indicadores de ordenação
- `MapPin`, `MapPinOff` - Abas com/sem local
- `ChevronLeft`, `ChevronRight`, `ChevronsLeft`, `ChevronsRight` - Paginação

## API Consumida

```
GET /tgfpro/simplified
```

Parâmetros enviados:

- `search` - termo de busca
- `page`, `perPage` - paginação
- `sort` - ordenação (ex: `codprod desc`)
- `comLocal` / `semLocal` - filtro de localização

## Menu Sidebar

Acessível via menu lateral:

- **Produtos > Produtos (Rápido)** - ícone ⚡ (Zap)

## Próximos Passos (TODO)

- [ ] Filtro por grupo (select com grupos)
- [ ] Filtro por tipo de controle
- [ ] Exportação CSV/Excel
- [ ] Detalhes do produto em modal/drawer
- [ ] Expansão de controles (LISCONTEST)
