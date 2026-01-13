# Produtos Simples - API

## Visão Geral

Endpoint leve e rápido para listagem de produtos TGFPRO com informações essenciais, incluindo dados de estoque (TGFEST) e grupo (TGFGRU).

## Endpoint

```
GET /tgfpro/simplified
```

**Autenticação:** Bearer Token (JWT)

## Parâmetros de Query

| Parâmetro        | Tipo    | Descrição                                       |
| ---------------- | ------- | ----------------------------------------------- |
| `search`         | string  | Busca em DESCRPROD, REFERENCIA, MARCA           |
| `ativo`          | string  | Filtro de status (S/N)                          |
| `codgrupoprod`   | number  | Filtrar por código do grupo                     |
| `localizacao`    | string  | Filtrar por localização (LIKE)                  |
| `tipcontest`     | string  | Filtrar por tipo de controle (LIKE)             |
| `comLocal`       | boolean | Apenas produtos COM localização                 |
| `semLocal`       | boolean | Apenas produtos SEM localização                 |
| `sort`           | string  | Ordenação (ex: `codprod desc`, `descrprod asc`) |
| `expandControle` | boolean | Expandir linhas por item de LISCONTEST          |
| `page`           | number  | Página (padrão: 1)                              |
| `perPage`        | number  | Itens por página (padrão: 50, máximo: 200)      |

### Colunas de Ordenação Válidas

- `codprod` - Código do produto (padrão DESC)
- `descrprod` - Descrição
- `grupo` - Nome do grupo (DESCRGRUPOPROD)
- `localizacao` - Localização
- `tipcontest` - Tipo de controle
- `ativo` - Status ativo

## Resposta

```json
{
  "data": [
    {
      "codprod": 12345,
      "descrprod": "PARAFUSO CABECA CHATA M6X20",
      "referencia": "PCH-M6X20",
      "marca": "GENERICO",
      "codvol": "UN",
      "ativo": "S",
      "codgrupoprod": 10,
      "descrgrupoprod": "PARAFUSOS E FIXADORES",
      "localizacao": "A1-02-03",
      "tipcontest": "L",
      "liscontest": "LOTE001,LOTE002",
      "estoque": 150,
      "estmin": 50,
      "estmax": 500
    }
  ],
  "total": 5000,
  "page": 1,
  "perPage": 50,
  "lastPage": 100,
  "hasMore": true
}
```

### Campos Retornados

| Campo            | Tipo        | Descrição                      |
| ---------------- | ----------- | ------------------------------ |
| `codprod`        | number      | Código do produto              |
| `descrprod`      | string      | Descrição do produto           |
| `referencia`     | string/null | Referência/código fabricante   |
| `marca`          | string/null | Marca                          |
| `codvol`         | string/null | Código da unidade de volume    |
| `ativo`          | string      | Status ativo (S/N)             |
| `codgrupoprod`   | number      | Código do grupo                |
| `descrgrupoprod` | string/null | Nome do grupo (JOIN TGFGRU)    |
| `localizacao`    | string/null | Localização física             |
| `tipcontest`     | string/null | Tipo de controle               |
| `liscontest`     | string/null | Lista de controles             |
| `estoque`        | number/null | Estoque atual (SUM de TGFEST)  |
| `estmin`         | number/null | Estoque mínimo (SUM de TGFEST) |
| `estmax`         | number/null | Estoque máximo (SUM de TGFEST) |

### Campos Adicionais (quando `expandControle=true`)

| Campo            | Tipo        | Descrição                     |
| ---------------- | ----------- | ----------------------------- |
| `controleItem`   | string/null | Item individual do LISCONTEST |
| `controleIndex`  | number      | Índice do item (1-based)      |
| `totalControles` | number      | Total de itens no LISCONTEST  |

## SQL Executado

```sql
SELECT TOP {perPage + offset}
  P.CODPROD, P.DESCRPROD, P.REFERENCIA, P.MARCA, P.CODVOL, P.ATIVO,
  P.CODGRUPOPROD, G.DESCRGRUPOPROD, P.LOCALIZACAO, P.TIPCONTEST, P.LISCONTEST,
  E.ESTOQUE, E.ESTMIN, E.ESTMAX
FROM TGFPRO P WITH (NOLOCK)
LEFT JOIN TGFGRU G WITH (NOLOCK) ON P.CODGRUPOPROD = G.CODGRUPOPROD
LEFT JOIN (
  SELECT CODPROD, SUM(ESTOQUE) AS ESTOQUE, SUM(ESTMIN) AS ESTMIN, SUM(ESTMAX) AS ESTMAX
  FROM TGFEST WITH (NOLOCK)
  WHERE ATIVO = 'S'
  GROUP BY CODPROD
) E ON P.CODPROD = E.CODPROD
WHERE {filtros}
ORDER BY {sort}
```

## Exemplos de Uso

### Produtos com local, ordenados por descrição

```
GET /tgfpro/simplified?comLocal=true&sort=descrprod asc&perPage=30
```

### Busca com filtro de grupo

```
GET /tgfpro/simplified?search=parafuso&codgrupoprod=10&page=1
```

### Produtos sem local, mostrando controles expandidos

```
GET /tgfpro/simplified?semLocal=true&expandControle=true
```

## Arquivos Relacionados

- `src/sankhya/tgfpro/tgfpro.controller.ts` - Controller
- `src/sankhya/tgfpro/tgfpro.service.ts` - Service (método `findAllSimplified`)
- `src/sankhya/tgfpro/models/tgfpro-simplified.interface.ts` - Interface

## Performance

- Uso de `WITH (NOLOCK)` em todas as tabelas
- Subquery agregada para TGFEST (evita N+1)
- Limite máximo de 200 itens por página
- Ordenação validada contra whitelist de colunas
