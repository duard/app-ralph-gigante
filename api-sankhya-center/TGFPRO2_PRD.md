# TGFPRO2 Module - Product Requirements Document (PRD)

## Visão Geral
O módulo TGFPRO2 fornece endpoints estratégicos para gestão de produtos com foco em análise de estoque, qualidade de dados e movimentação. Este PRD documenta endpoints existentes e planejados para suportar todas as necessidades do frontend.

---

## 1. ENDPOINTS EXISTENTES (Implementados)

### 1.1 Produtos Base
- **GET /tgfpro2/produtos** - Lista produtos com filtros avançados
- **GET /tgfpro2/produtos/:codprod** - Detalhes de produto específico
- **GET /tgfpro2/produtos/:codprod/locais** - Estoque por local do produto

### 1.2 Rotas Nested (Grupos)
- **GET /tgfpro2/grupos** - Lista grupos com contagem de produtos
- **GET /tgfpro2/grupos/:codgrupoprod/produtos** - Produtos de um grupo específico

### 1.3 Rotas Nested (Locais)
- **GET /tgfpro2/locais** - Lista locais com contagem de produtos
- **GET /tgfpro2/locais/:codlocal/produtos** - Produtos de um local específico

---

## 2. NOVOS ENDPOINTS - ANÁLISE DE ESTOQUE

### 2.1 Status de Estoque

#### **GET /tgfpro2/estoque/status**
Lista produtos agrupados por status de estoque.

**Query Parameters:**
- `status`: 'COM_ESTOQUE' | 'SEM_ESTOQUE' | 'CRITICO' | 'BAIXO' | 'NORMAL' | 'EXCESSO'
- `page`: número da página (default: 1)
- `perPage`: itens por página (default: 10)
- `includeEstoqueLocais`: incluir detalhes por local (default: false)

**Lógica de Status:**
```typescript
SEM_ESTOQUE: SUM(ESTOQUE) = 0 or IS NULL
CRITICO: SUM(ESTOQUE) <= SUM(ESTMIN) * 0.5 AND ESTMIN > 0
BAIXO: SUM(ESTOQUE) <= SUM(ESTMIN) AND ESTMIN > 0
EXCESSO: SUM(ESTOQUE) > SUM(ESTMAX) AND ESTMAX > 0
NORMAL: demais casos
COM_ESTOQUE: SUM(ESTOQUE) > 0
```

**Response:**
```json
{
  "data": [
    {
      "codprod": 3680,
      "descrprod": "FOLHAS A4",
      "estoque": {
        "totalGeral": 50,
        "totalMin": 100,
        "totalMax": 500,
        "qtdeLocais": 2,
        "statusGeral": "CRITICO",
        "deficit": 50,
        "percOcupacao": 10.0
      }
    }
  ],
  "total": 150,
  "page": 1,
  "perPage": 10
}
```

---

#### **GET /tgfpro2/estoque/sem-estoque**
Lista produtos completamente sem estoque (total = 0 em todos os locais).

**Query Parameters:**
- `page`, `perPage`
- `includeGrupo`: incluir informações do grupo (default: true)
- `ativosApenas`: filtrar apenas ativos (default: true)

**Use Case Frontend:**
- Dashboard: card "Produtos Sem Estoque"
- Alertas de reabastecimento urgente
- Planejamento de compras

---

#### **GET /tgfpro2/estoque/critico**
Lista produtos com estoque crítico (<= 50% do mínimo).

**Query Parameters:**
- `page`, `perPage`
- `ordenacao`: 'deficit_desc' | 'perc_ocupacao_asc' | 'produto_asc'
- `codlocal`: filtrar por local específico (opcional)

**Response inclui:**
- `deficit`: diferença entre mínimo e atual
- `percOcupacao`: percentual do estoque em relação ao máximo
- `diasEstimados`: estimativa de dias até zerar (baseado em média de movimentação)

**Use Case Frontend:**
- Dashboard: card "Estoque Crítico"
- Lista prioritária para compras
- Alertas em tempo real

---

#### **GET /tgfpro2/estoque/baixo**
Lista produtos com estoque baixo (> 50% do mínimo e <= mínimo).

**Similar ao /critico mas com threshold diferente**

---

#### **GET /tgfpro2/estoque/excesso**
Lista produtos com estoque acima do máximo.

**Response inclui:**
- `excesso`: quantidade acima do máximo
- `percExcesso`: percentual de excesso
- `valorEstimado`: valor financeiro do excesso (baseado em último preço de compra)

**Use Case Frontend:**
- Identificar produtos parados
- Planejamento de promoções
- Análise de capital imobilizado

---

### 2.2 Análise de Min/Max

#### **GET /tgfpro2/estoque/sem-minmax**
Lista produtos sem estoque mínimo ou máximo configurado.

**Query Parameters:**
- `tipo`: 'SEM_MIN' | 'SEM_MAX' | 'SEM_AMBOS'
- `page`, `perPage`

**Use Case Frontend:**
- Qualidade de dados
- Setup inicial de produtos novos
- Auditoria de configuração

---

#### **GET /tgfpro2/estoque/minmax-inconsistente**
Lista produtos onde MIN >= MAX (configuração inconsistente).

**Response:**
```json
{
  "data": [
    {
      "codprod": 1234,
      "descrprod": "PRODUTO X",
      "estmin": 100,
      "estmax": 80,
      "problema": "ESTMIN_MAIOR_QUE_ESTMAX"
    }
  ]
}
```

---

### 2.3 Estoque por Local

#### **GET /tgfpro2/estoque/multi-local**
Lista produtos distribuídos em múltiplos locais.

**Query Parameters:**
- `minLocais`: número mínimo de locais (default: 2)
- `page`, `perPage`

**Response inclui:**
- Array de locais com quantidades
- Sugestões de redistribuição (se um local está crítico e outro com excesso)

**Use Case Frontend:**
- Gestão de transferências
- Balanceamento de estoque
- Visão de distribuição

---

#### **GET /tgfpro2/estoque/local-unico**
Lista produtos concentrados em um único local.

**Use Case Frontend:**
- Identificar riscos de centralização
- Planejamento de distribuição

---

## 3. NOVOS ENDPOINTS - QUALIDADE DE DADOS

### 3.1 Validação de NCM

#### **GET /tgfpro2/qualidade/sem-ncm**
Lista produtos sem NCM cadastrado.

**Query Parameters:**
- `page`, `perPage`
- `comEstoque`: filtrar apenas produtos com estoque (default: true)

**Response:**
```json
{
  "data": [
    {
      "codprod": 3680,
      "descrprod": "FOLHAS A4",
      "ncm": null,
      "ativo": "S",
      "estoqueTotal": 100,
      "criticidade": "ALTA"
    }
  ],
  "total": 45,
  "percentualAcervo": 12.5
}
```

**Criticidade:**
- ALTA: produto ativo com estoque > 0
- MEDIA: produto ativo sem estoque
- BAIXA: produto inativo

**Use Case Frontend:**
- Compliance fiscal
- Qualidade de cadastro
- Auditoria para NFe

---

### 3.2 Validação de Campos Essenciais

#### **GET /tgfpro2/qualidade/campos-incompletos**
Lista produtos com campos essenciais não preenchidos.

**Query Parameters:**
- `campos`: array de campos para validar (default: ['referencia', 'marca', 'ncm', 'codgrupoprod'])
- `page`, `perPage`

**Response:**
```json
{
  "data": [
    {
      "codprod": 1234,
      "descrprod": "PRODUTO X",
      "camposFaltantes": ["referencia", "ncm"],
      "percentualCompletude": 60.0,
      "ativo": "S"
    }
  ]
}
```

---

#### **GET /tgfpro2/qualidade/sem-referencia**
Lista produtos sem referência.

---

#### **GET /tgfpro2/qualidade/sem-marca**
Lista produtos sem marca.

---

#### **GET /tgfpro2/qualidade/sem-grupo**
Lista produtos sem grupo ou com grupo inválido (CODGRUPOPROD = 0 or NULL).

---

### 3.3 Validação de Configuração

#### **GET /tgfpro2/qualidade/sem-unidade-compra**
Lista produtos onde unidade de compra difere da venda mas CODVOLCOMPRA não está preenchido.

---

#### **GET /tgfpro2/qualidade/inativos-com-estoque**
Lista produtos inativos que ainda possuem estoque.

**Response inclui:**
- Valor estimado do estoque parado
- Tempo desde inativação
- Sugestão de ação (transferir, dar baixa, reativar)

---

## 4. NOVOS ENDPOINTS - MOVIMENTAÇÃO E HISTÓRICO

### 4.1 Últimas Movimentações

#### **GET /tgfpro2/movimentacao/ultimas**
Lista últimas movimentações de produtos (compras, vendas, transferências).

**Query Parameters:**
- `codprod`: filtrar por produto específico (opcional)
- `tipoMov`: 'C' | 'V' | 'T' | 'ALL' (default: 'ALL')
- `dataInicio`: data inicial (formato: YYYY-MM-DD)
- `dataFim`: data final
- `page`, `perPage`

**Response:**
```json
{
  "data": [
    {
      "nunota": 123456,
      "codprod": 3680,
      "descrprod": "FOLHAS A4",
      "tipmov": "C",
      "tipoMovDescr": "Compra",
      "dtneg": "2026-01-10",
      "qtdneg": 500,
      "vlrunit": 25.50,
      "vlrtot": 12750.00,
      "codparc": 1001,
      "nomeparc": "FORNECEDOR X",
      "codlocal": 101001,
      "descrlocal": "ALMOX PRINCIPAL"
    }
  ]
}
```

---

#### **GET /tgfpro2/movimentacao/sem-movimento**
Lista produtos sem movimentação há N dias.

**Query Parameters:**
- `dias`: número de dias sem movimento (default: 90)
- `comEstoque`: filtrar apenas com estoque (default: true)
- `page`, `perPage`

**Response inclui:**
- `diasSemMovimento`: dias desde última movimentação
- `ultimaMovimentacao`: { data, tipo, quantidade }
- `estoqueAtual`: quantidade parada
- `valorEstimado`: valor do estoque parado

**Use Case Frontend:**
- Identificar produtos obsoletos
- Planejamento de promoções
- Análise de giro de estoque

---

#### **GET /tgfpro2/movimentacao/ultimas-compras**
Lista últimas compras de produtos.

**Response inclui:**
- Informações do fornecedor
- Preço da última compra
- Quantidade comprada
- Data da compra
- Histórico de preços (últimas 5 compras)

**Use Case Frontend:**
- Análise de preços
- Sugestão de fornecedores
- Planejamento de compras

---

#### **GET /tgfpro2/movimentacao/ultimas-vendas**
Lista últimas vendas de produtos.

**Response inclui:**
- Informações do cliente
- Preço de venda
- Quantidade vendida
- Vendedor responsável
- Margem de contribuição

---

### 4.2 Produtos Mais/Menos Movimentados

#### **GET /tgfpro2/movimentacao/mais-vendidos**
Lista produtos mais vendidos em um período.

**Query Parameters:**
- `periodo`: 'SEMANA' | 'MES' | 'TRIMESTRE' | 'ANO' | 'CUSTOMIZADO'
- `dataInicio`, `dataFim`: para período customizado
- `top`: quantidade de produtos (default: 10)

**Response:**
```json
{
  "data": [
    {
      "codprod": 3680,
      "descrprod": "FOLHAS A4",
      "qtdVendida": 5000,
      "vlrTotalVendas": 127500.00,
      "ticketMedio": 25.50,
      "qtdNotas": 45,
      "tendencia": "CRESCENTE"
    }
  ]
}
```

---

#### **GET /tgfpro2/movimentacao/menos-vendidos**
Produtos com menor giro de vendas.

---

### 4.3 Análise de Giro

#### **GET /tgfpro2/movimentacao/curva-abc**
Análise de curva ABC dos produtos (baseado em vendas/movimentação).

**Response:**
```json
{
  "curvaA": {
    "produtos": [...],
    "percentualProdutos": 20,
    "percentualFaturamento": 80
  },
  "curvaB": {
    "produtos": [...],
    "percentualProdutos": 30,
    "percentualFaturamento": 15
  },
  "curvaC": {
    "produtos": [...],
    "percentualProdutos": 50,
    "percentualFaturamento": 5
  }
}
```

---

## 5. NOVOS ENDPOINTS - AUDITORIA E TRACKING

### 5.1 Histórico de Alterações

#### **GET /tgfpro2/auditoria/:codprod/historico**
Histórico completo de alterações de um produto (via AD_GIG_LOG).

**Response:**
```json
{
  "data": [
    {
      "id": 12345,
      "acao": "UPDATE",
      "dtcreated": "2026-01-10T10:30:00",
      "codusu": 311,
      "nomeusu": "CONVIDADE",
      "camposAlterados": ["ESTMIN", "ESTMAX"],
      "versaoAntiga": "{\"ESTMIN\":50,\"ESTMAX\":200}",
      "versaoNova": "{\"ESTMIN\":100,\"ESTMAX\":500}"
    }
  ]
}
```

---

#### **GET /tgfpro2/auditoria/ultimas-alteracoes**
Últimas alterações em produtos (geral).

**Query Parameters:**
- `dias`: período de análise (default: 7)
- `acao`: 'INSERT' | 'UPDATE' | 'DELETE' (opcional)
- `codusu`: filtrar por usuário (opcional)

---

#### **GET /tgfpro2/auditoria/produtos-criados**
Lista produtos criados recentemente.

**Query Parameters:**
- `dias`: período (default: 30)
- `page`, `perPage`

**Response inclui:**
- Data de criação
- Usuário que criou
- Status de completude do cadastro
- Se já teve movimentação

---

#### **GET /tgfpro2/auditoria/produtos-editados**
Lista produtos editados recentemente.

**Response inclui:**
- Quantidade de edições
- Última edição
- Usuários que editaram
- Campos mais alterados

---

## 6. ENDPOINTS DE DASHBOARD E KPIs

### 6.1 Dashboard Geral

#### **GET /tgfpro2/dashboard/overview**
KPIs gerais de produtos e estoque.

**Response:**
```json
{
  "produtos": {
    "total": 1500,
    "ativos": 1200,
    "inativos": 300,
    "novosUltimos30Dias": 45
  },
  "estoque": {
    "totalProdutosComEstoque": 980,
    "totalProdutosSemEstoque": 220,
    "criticos": 85,
    "baixos": 150,
    "normais": 600,
    "excesso": 145
  },
  "qualidade": {
    "semNCM": 120,
    "semReferencia": 80,
    "semMinMax": 200,
    "percentualCompletude": 75.5
  },
  "movimentacao": {
    "produtosSemMov30Dias": 180,
    "produtosSemMov90Dias": 320,
    "ticketMedioMes": 125.50,
    "giroMedioEstoque": 4.2
  }
}
```

**Use Case Frontend:**
- Dashboard principal
- Cards de resumo
- Indicadores de saúde do estoque

---

#### **GET /tgfpro2/dashboard/produto/:codprod**
KPIs específicos de um produto.

**Response:**
```json
{
  "produto": {
    "codprod": 3680,
    "descrprod": "FOLHAS A4",
    "ativo": "S"
  },
  "estoque": {
    "totalGeral": 500,
    "locais": [...],
    "status": "NORMAL",
    "diasEstimados": 45
  },
  "movimentacao": {
    "ultimaCompra": {...},
    "ultimaVenda": {...},
    "mediaVendasMes": 100,
    "giroMensal": 2.5
  },
  "historico": {
    "totalAlteracoes": 15,
    "ultimaAlteracao": {...},
    "criadoEm": "2025-01-15",
    "criadoPor": "ADMIN"
  },
  "qualidade": {
    "completude": 95.0,
    "camposFaltantes": ["refforn"]
  }
}
```

---

### 6.2 Dashboard de Estoque

#### **GET /tgfpro2/dashboard/estoque**
KPIs focados em estoque.

**Response inclui:**
- Gráfico de distribuição de status
- Top 10 produtos críticos
- Evolução de estoque (últimos 30 dias)
- Valor total de estoque por status

---

### 6.3 Dashboard de Qualidade

#### **GET /tgfpro2/dashboard/qualidade**
KPIs focados em qualidade de dados.

**Response inclui:**
- Percentual de completude por campo
- Top campos com mais problemas
- Produtos novos sem validação
- Score geral de qualidade

---

## 7. ENDPOINTS DE FILTROS AVANÇADOS

### 7.1 Busca Avançada

#### **GET /tgfpro2/busca/avancada**
Busca com múltiplos filtros combinados.

**Query Parameters:**
```typescript
{
  search?: string              // Busca em descrição, referência, marca
  codgrupoprod?: number        // Filtro por grupo
  codlocal?: number            // Filtro por local
  statusEstoque?: string[]     // Array de status
  ativo?: 'S' | 'N' | 'TODOS'
  comNCM?: boolean             // true = apenas com NCM, false = apenas sem
  minEstoque?: number          // Estoque mínimo
  maxEstoque?: number          // Estoque máximo
  semMovimentoDias?: number    // Sem movimento há X dias
  ordenacao?: string           // Campo de ordenação
  page?: number
  perPage?: number
}
```

**Use Case Frontend:**
- Filtros avançados na listagem
- Busca personalizada
- Exportação customizada

---

## 8. PRIORIZAÇÃO DE IMPLEMENTAÇÃO

### FASE 1 - CRÍTICA (Implementar Primeiro)
Endpoints essenciais para operação diária:

1. **GET /tgfpro2/estoque/status** - Status geral de estoque
2. **GET /tgfpro2/estoque/critico** - Estoque crítico
3. **GET /tgfpro2/estoque/sem-estoque** - Produtos sem estoque
4. **GET /tgfpro2/dashboard/overview** - Dashboard principal
5. **GET /tgfpro2/qualidade/sem-ncm** - Produtos sem NCM

**Impacto:** ALTO | Complexidade: MÉDIA | Tempo estimado: 2-3 dias

---

### FASE 2 - IMPORTANTE (Implementar em Seguida)
Endpoints para análise e planejamento:

1. **GET /tgfpro2/estoque/baixo** - Estoque baixo
2. **GET /tgfpro2/estoque/excesso** - Estoque em excesso
3. **GET /tgfpro2/movimentacao/sem-movimento** - Produtos parados
4. **GET /tgfpro2/movimentacao/mais-vendidos** - Produtos mais vendidos
5. **GET /tgfpro2/qualidade/campos-incompletos** - Qualidade de dados
6. **GET /tgfpro2/dashboard/produto/:codprod** - Dashboard do produto

**Impacto:** ALTO | Complexidade: MÉDIA | Tempo estimado: 3-4 dias

---

### FASE 3 - DESEJÁVEL (Implementar Depois)
Endpoints para análises avançadas:

1. **GET /tgfpro2/movimentacao/ultimas** - Histórico de movimentações
2. **GET /tgfpro2/movimentacao/ultimas-compras** - Análise de compras
3. **GET /tgfpro2/movimentacao/ultimas-vendas** - Análise de vendas
4. **GET /tgfpro2/movimentacao/curva-abc** - Curva ABC
5. **GET /tgfpro2/auditoria/:codprod/historico** - Auditoria de produto
6. **GET /tgfpro2/busca/avancada** - Busca avançada

**Impacto:** MÉDIO | Complexidade: ALTA | Tempo estimado: 4-5 dias

---

### FASE 4 - OPCIONAL (Implementar Se Necessário)
Endpoints para casos específicos:

1. Demais endpoints de qualidade específicos
2. Dashboards adicionais
3. Relatórios customizados
4. Exportações especiais

**Impacto:** BAIXO | Complexidade: VARIÁVEL | Tempo estimado: 2-3 dias

---

## 9. ESTIMATIVA TOTAL

- **Fase 1:** 5 endpoints - 2-3 dias
- **Fase 2:** 6 endpoints - 3-4 dias
- **Fase 3:** 6 endpoints - 4-5 dias
- **Fase 4:** ~10 endpoints - 2-3 dias

**Total:** ~27 novos endpoints | **Tempo total:** 11-15 dias de desenvolvimento

---

## 10. OBSERVAÇÕES TÉCNICAS

### SQL Server 2016
- Usar `WITH (NOLOCK)` em todas as queries
- `OFFSET/FETCH NEXT` para paginação
- Funções de data: `DATEADD()`, `DATEDIFF()`, `GETDATE()`

### Sankhya API
- NÃO usar placeholders SQL
- Usar concatenação direta com escape: `str.replace(/'/g, "''")`
- Sempre passar array vazio: `executeQuery(query, [])`

### Performance
- Sempre separar COUNT query de SELECT query
- Paginar primeiro, enriquecer depois
- Usar `Promise.all()` para queries paralelas
- Cache em endpoints de dashboard (considerar)

### Padrões de Response
```typescript
// Lista paginada
PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  lastPage: number
  hasMore: boolean
}

// Dashboard/KPIs
DashboardResponse {
  [categoria: string]: {
    [metrica: string]: number | string | object
  }
}
```

---

## 11. PRÓXIMOS PASSOS

1. Revisar este PRD com equipe/usuário
2. Validar priorização das fases
3. Criar issues/tasks para cada endpoint
4. Implementar Fase 1 primeiro
5. Testar com dados reais
6. Documentar no Swagger
7. Iterar baseado em feedback
