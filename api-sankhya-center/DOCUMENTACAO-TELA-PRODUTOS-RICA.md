# 📦 DOCUMENTAÇÃO COMPLETA: Tela RICA de Produtos

**Data**: 15/01/2026
**Objetivo**: Criar interface completa para visualização de produtos com TODOS os dados e navegação para consumo

---

## 🎯 Visão Geral

Uma tela RICA de produtos deve mostrar **TUDO** sobre cada produto:
- ✅ Dados básicos (nome, marca, referência, grupo)
- ✅ Controles (tipo de controle, variações)
- ✅ Estoque (total, por local, status)
- ✅ Preços (histórico, tendências)
- ✅ Consumo (quem usa, quanto, quando)
- ✅ Classificações fiscais (NCM, origem)

**Fluxo**: Lista de produtos → Clique no produto → Detalhes completos + Consumo

---

## 📊 Dados do Sistema (Real)

### Produtos Ativos: **13.281**

#### Por Tipo de Controle (TIPCONTEST)
| Tipo | Descrição | Quantidade | % |
|------|-----------|------------|---|
| **N** | Sem controle adicional | 10.874 | 82% |
| **S** | Lista (tamanhos/cores) | 1.938 | 15% |
| **E** | Série (equipamentos) | 461 | 3% |
| **L** | Lote (rastreabilidade) | 7 | <1% |
| **P** | Parceiro | 1 | <1% |

#### Por Situação de Estoque
| Situação | Quantidade | % |
|----------|------------|---|
| **COM estoque** | 4.928 | 37% |
| **SEM estoque** | 8.353 | 63% |

#### Top 10 Marcas
| Marca | Produtos |
|-------|----------|
| GENERICO | 4.790 |
| MERCEDES B | 377 |
| VOLKSWAGEN | 303 |
| XCMG | 267 |
| HYSTER | 261 |
| TECFIL | 233 |
| BOSCH | 195 |
| WEGA | 195 |
| MANN FILT | 182 |
| SABO | 170 |

#### Top 10 Grupos
| Código | Grupo | Produtos |
|--------|-------|----------|
| 20102 | MECANICA | 7.261 |
| 20101 | ELETRICA AUTOMOTIVA | 1.903 |
| 10101 | APOIO MECANICO | 447 |
| 20303 | MATERIAL ESCRITORIO | 335 |
| 20600 | FERRAMENTAS | 266 |

#### Top 10 Locais de Estoque
| Código | Local | Produtos | Unidades |
|--------|-------|----------|----------|
| 101001 | ALMOX PECAS | 3.443 | 121.595 |
| 0 | SEM LOCAL | 627 | 17.626 |
| 101005 | FERRAMENTARIA | 272 | 1.476 |
| 103001 | ALMOX LOGISTICA GIGANTAO | 164 | 22.229 |

---

## 🎨 Estrutura da Tela

### 1. LISTA DE PRODUTOS (Página Principal)

#### Layout Sugerido

```
┌────────────────────────────────────────────────────────────────────────┐
│  🔍 Buscar produtos...                    [Filtros ▼] [Exportar CSV]  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Filtros Ativos:                                                      │
│  [x] Com Estoque  [x] Marca: BOSCH  [ Limpar Filtros ]               │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│  Mostrando 1-20 de 13.281 produtos                  [< 1 2 3 ... >]  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ [3680] PAPEL SULFITE A4 500 FOLHAS                    🟢 153 │   │
│  │ Marca: GENERICO  |  Grupo: MATERIAL ESCRITORIO              │   │
│  │ Ref: 3680  |  NCM: 48025610  |  Local: MATERIAL ESCRITORIO  │   │
│  │                                                               │   │
│  │ 📊 Estoque: 153 un  |  💰 Última compra: R$ 22,46           │   │
│  │ 📈 Ver Consumo →                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ [3867] LUVA VAQUETA PROTECAO ANTI IMPACTO          🔴 0      │   │
│  │ Marca: GENERICO  |  Grupo: SEGURANCA                        │   │
│  │ ⚠️ PRODUTO COM CONTROLE (Série - Tamanhos)                   │   │
│  │                                                               │   │
│  │ Variações: XG (11) • GG (10) • M (8) • P (7)                │   │
│  │ 📊 Estoque: 0 un  |  💰 Preços: R$ 81,25 - R$ 4.165,74      │   │
│  │ 📈 Ver Consumo →                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ [15658] USINAR PINO                                  ⚪ 0     │   │
│  │ ⚠️ DADOS INCOMPLETOS                                          │   │
│  │ Marca: ❌ NÃO CADASTRADA  |  Ref: ❌ NÃO CADASTRADA          │   │
│  │                                                               │   │
│  │ 📊 Estoque: 0 un  |  💰 Sem histórico de compras             │   │
│  │ 📈 Ver Consumo →                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### Badges de Status

**Estoque:**
- 🟢 Verde: Estoque OK (>= ESTMIN)
- 🟡 Amarelo: Estoque baixo (< ESTMIN)
- 🔴 Vermelho: Sem estoque (= 0)
- ⚪ Cinza: Produto sem movimentação

**Qualidade de Dados:**
- ✅ Completo: Tem marca, ref, grupo, NCM
- ⚠️ Incompleto: Falta algum dado importante
- ❌ Crítico: Falta NCM (problema fiscal)

**Controle:**
- 🏷️ Sem controle (N)
- 📋 Lista (S) - mostra variações
- 🔢 Série (E) - mostra tamanhos/modelos
- 📦 Lote (L) - mostra controle de lote
- 👤 Parceiro (P)

---

### 2. FILTROS DISPONÍVEIS

#### Filtros Básicos (Sidebar ou Modal)

```
┌─────────────────────────────────────┐
│  🔍 FILTROS                         │
├─────────────────────────────────────┤
│                                     │
│  📝 Busca Rápida                    │
│  [Digite nome, código ou ref...]   │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  📊 Estoque                         │
│  [ ] Apenas com estoque             │
│  [ ] Apenas sem estoque             │
│  [ ] Estoque baixo (< mínimo)       │
│  [ ] Estoque crítico (= 0)          │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  🏷️ Marca                            │
│  [Selecionar marca... ▼]           │
│  Top marcas:                        │
│  [ ] GENERICO (4.790)               │
│  [ ] MERCEDES B (377)               │
│  [ ] VOLKSWAGEN (303)               │
│  [ ] BOSCH (195)                    │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  📁 Grupo de Produtos               │
│  [Selecionar grupo... ▼]           │
│  Top grupos:                        │
│  [ ] MECANICA (7.261)               │
│  [ ] ELETRICA AUTOMOTIVA (1.903)    │
│  [ ] MATERIAL ESCRITORIO (335)      │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  📍 Local de Estoque                │
│  [Selecionar local... ▼]           │
│  Top locais:                        │
│  [ ] ALMOX PECAS (3.443)            │
│  [ ] FERRAMENTARIA (272)            │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  🎛️ Tipo de Controle                │
│  [ ] Sem controle (N) - 10.874      │
│  [ ] Lista (S) - 1.938              │
│  [ ] Série (E) - 461                │
│  [ ] Lote (L) - 7                   │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  ⚠️ Qualidade de Dados              │
│  [ ] Sem NCM (problema fiscal)      │
│  [ ] Sem marca                      │
│  [ ] Sem referência                 │
│  [ ] Dados completos                │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  [Aplicar Filtros]  [Limpar Tudo]  │
│                                     │
└─────────────────────────────────────┘
```

---

### 3. DETALHES DO PRODUTO (Ao Clicar)

#### Layout Completo

```
┌────────────────────────────────────────────────────────────────────────┐
│  ← Voltar para lista                                                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [3680] PAPEL SULFITE A4 500 FOLHAS                         🟢 ATIVO  │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  📋 INFORMAÇÕES BÁSICAS                                         │  │
│  ├─────────────────────────────────────────────────────────────────┤  │
│  │  Descrição Completa: PACOTE C/ 500 FOLHAS                       │  │
│  │  Características: MARCA SUGERIDA MAGNUM DIGITAL - CAIXA VEM     │  │
│  │                   COM 10 PACOTE DE 500 FOLHAS EM CADA CAIXA     │  │
│  │                                                                  │  │
│  │  Código: 3680                  Referência: 3680                 │  │
│  │  Ref. Fornecedor: 7891191004594                                 │  │
│  │  Marca: GENERICO               Grupo: MATERIAL ESCRITORIO       │  │
│  │  Unidade: UN (UNIDADE)         Uso: C (Consumo)                 │  │
│  │  Origem: 0 (Nacional)          NCM: 48025610                    │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  🎛️ CONTROLE                                                     │  │
│  ├─────────────────────────────────────────────────────────────────┤  │
│  │  Tipo: N (Sem controle adicional)                               │  │
│  │  ✅ Produto simples - sem variações                              │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  📦 ESTOQUE                                                      │  │
│  ├─────────────────────────────────────────────────────────────────┤  │
│  │  Total Geral: 153 unidades                                       │  │
│  │  Estoque Mínimo: 10 un   |   Estoque Máximo: 50 un              │  │
│  │  Status: 🟢 EXCESSO (acima do máximo)                            │  │
│  │  Alerta Estoque Mínimo: SIM                                      │  │
│  │                                                                  │  │
│  │  Por Local:                                                      │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │ [105002] MATERIAL ESCRITORIO          153 un   🟢 100%   │   │  │
│  │  │ Min: 0  |  Max: 0  |  Status: EXCESSO                    │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  💰 PREÇOS                                                       │  │
│  ├─────────────────────────────────────────────────────────────────┤  │
│  │  Última Compra: R$ 22,46 (30/12/2025)                           │  │
│  │  Preço Médio Ponderado: R$ 22,77                                │  │
│  │  Faixa de Preço: R$ 22,46 - R$ 23,16                            │  │
│  │  Tendência: QUEDA (-3,01% nos últimos 6 meses)                  │  │
│  │                                                                  │  │
│  │  Histórico de Compras (6 meses):                                │  │
│  │  27/08/2025 → R$ 23,16 (100 un)                                 │  │
│  │  29/10/2025 → R$ 22,70 (100 un)                                 │  │
│  │  30/12/2025 → R$ 22,46 (100 un) ✅ ÚLTIMA                        │  │
│  │                                                                  │  │
│  │  [Ver Gráfico de Evolução →]                                    │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  📈 CONSUMO (Últimos 6 meses)                                    │  │
│  ├─────────────────────────────────────────────────────────────────┤  │
│  │  Total Consumido: 285 unidades                                   │  │
│  │  Valor Total: R$ 6.750,75                                        │  │
│  │  Média Diária: 1,55 un/dia                                       │  │
│  │  Média Mensal: 47,5 un/mês                                       │  │
│  │                                                                  │  │
│  │  Top 5 Usuários:                                                 │  │
│  │  1. MICHELLE.DUARTE     10 un (27%)                              │  │
│  │  2. DANUBIA.O            6 un (16%)                              │  │
│  │  3. ANA.SENA             5 un (14%)                              │  │
│  │  4. PATRICIA.OLIVEIRA    4 un (11%)                              │  │
│  │  5. ELIANE.SANTOS        4 un (11%)                              │  │
│  │                                                                  │  │
│  │  [📊 Ver Análise Completa de Consumo →]                          │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 4. PRODUTO COM CONTROLE (Exemplo: Luva 3867)

```
┌────────────────────────────────────────────────────────────────────────┐
│  [3867] LUVA VAQUETA PROTECAO ANTI IMPACTO                  🟢 ATIVO  │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  🎛️ CONTROLE                                                     │  │
│  ├─────────────────────────────────────────────────────────────────┤  │
│  │  Tipo: E (Série - Equipamentos/Tamanhos)                        │  │
│  │  ⚠️ Produto com VARIAÇÕES - Cada tamanho tem estoque e preço    │  │
│  │      próprios!                                                   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  📦 ESTOQUE POR VARIAÇÃO                                         │  │
│  ├─────────────────────────────────────────────────────────────────┤  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │ 👕 Tamanho XG (11)                                       │   │  │
│  │  │ Estoque: 25 un  |  Última compra: R$ 81,25              │   │  │
│  │  │ [Ver Consumo deste tamanho →]                            │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │ 👕 Tamanho GG (10)                                       │   │  │
│  │  │ Estoque: 1 un  |  Última compra: R$ 4.165,74 ⚠️          │   │  │
│  │  │ 🔴 ALERTA: Preço muito diferente! Verificar se correto   │   │  │
│  │  │ [Ver Consumo deste tamanho →]                            │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │ 👕 Tamanho M (8)                                         │   │  │
│  │  │ Estoque: 0 un  |  Sem compras recentes                   │   │  │
│  │  │ [Ver Consumo deste tamanho →]                            │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │                                                                  │  │
│  │  Total Geral: 26 unidades (todos os tamanhos)                   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  💰 PREÇOS POR VARIAÇÃO                                          │  │
│  ├─────────────────────────────────────────────────────────────────┤  │
│  │  XG (11): R$ 81,25 (estável)                                     │  │
│  │  GG (10): R$ 4.165,74 ⚠️ (verificar - muito diferente!)          │  │
│  │  M (8):   Sem dados de compra                                    │  │
│  │                                                                  │  │
│  │  ⚠️ ATENÇÃO: Variações com preços muito diferentes!              │  │
│  │     GG pode estar com erro de cadastro.                          │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints Necessários

### 1. Listagem de Produtos (com filtros)

```
GET /tgfpro2/produtos?page=1&perPage=20&search=papel&marca=GENERICO
    &comEstoque=true&grupo=20303&local=105002&tipcontest=N
    &semNCM=false&sort=DESCRPROD ASC

Response:
{
  "data": [
    {
      "codprod": 3680,
      "descrprod": "PAPEL SULFITE A4 500 FOLHAS",
      "marca": "GENERICO",
      "referencia": "3680",
      "codgrupoprod": 20303,
      "descrgrupoprod": "MATERIAL ESCRITORIO",
      "tipcontest": "N",
      "ativo": "S",
      "ncm": "48025610",

      // Resumo de estoque
      "estoqueTotal": 153,
      "estoqueStatus": "EXCESSO",

      // Resumo de preço
      "precoUltimaCompra": 22.46,
      "precoMedioPonderado": 22.77,

      // Qualidade de dados
      "dadosCompletos": true,
      "semNCM": false,
      "semMarca": false
    }
  ],
  "total": 13281,
  "page": 1,
  "perPage": 20,
  "lastPage": 665
}
```

### 2. Detalhes Completos do Produto

```
GET /tgfpro2/produtos/3680?includeEstoque=true&includeEstoqueLocais=true
    &includePrecos=true&includeConsumoResumo=true

Response:
{
  // Dados básicos
  "codprod": 3680,
  "descrprod": "PAPEL SULFITE A4 500 FOLHAS",
  "compldesc": "PACOTE C/ 500 FOLHAS",
  "caracteristicas": "...",
  "marca": "GENERICO",
  "referencia": "3680",
  "refforn": "7891191004594",
  "ncm": "48025610",
  "tipcontest": "N",
  "ativo": "S",

  // Grupo
  "tgfgru": {
    "codgrupoprod": 20303,
    "descrgrupoprod": "MATERIAL ESCRITORIO"
  },

  // Estoque
  "estoque": {
    "totalGeral": 153,
    "totalMin": 10,
    "totalMax": 50,
    "statusGeral": "EXCESSO"
  },
  "estoqueLocais": [
    {
      "codlocal": 105002,
      "descrlocal": "MATERIAL ESCRITORIO",
      "quantidade": 153,
      "statusLocal": "EXCESSO"
    }
  ],

  // Preços (NOVO - já implementado!)
  "precos": {
    "precoMedioPonderado": 22.77,
    "precoUltimaCompra": 22.46,
    "precoMinimo": 22.46,
    "precoMaximo": 23.16,
    "variacaoPrecoPercentual": -3.01,
    "tendenciaPreco": "QUEDA",
    "historicoPrecos": [...]
  },

  // Consumo resumido
  "consumoResumo": {
    "total6Meses": 285,
    "mediaMensal": 47.5,
    "topUsuarios": [
      {"nome": "MICHELLE.DUARTE", "quantidade": 10}
    ]
  }
}
```

### 3. Consumo Detalhado (Link da tela)

```
GET /tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-08-01
    &dataFim=2026-01-31&groupBy=usuario

Response:
{
  // JÁ IMPLEMENTADO!
  "produto": {...},
  "periodo": {...},
  "resumo": {
    "quantidadeConsumo": 285,
    "valorConsumo": 6750.75,
    "precoMedioPonderado": 22.77,  // ✨ RICO!
    "tendenciaPreco": "QUEDA",     // ✨ RICO!
    ...
  },
  "agrupamento": {
    "tipo": "usuario",
    "dados": [...]
  }
}
```

### 4. Filtros Disponíveis (Para preencher dropdowns)

```
GET /tgfpro2/filtros

Response:
{
  "marcas": [
    {"marca": "GENERICO", "quantidade": 4790},
    {"marca": "MERCEDES B", "quantidade": 377},
    ...
  ],
  "grupos": [
    {"codgrupoprod": 20102, "descrgrupoprod": "MECANICA", "quantidade": 7261},
    ...
  ],
  "locais": [
    {"codlocal": 101001, "descrlocal": "ALMOX PECAS", "produtos": 3443},
    ...
  ],
  "tiposControle": [
    {"tipo": "N", "descricao": "Sem controle", "quantidade": 10874},
    {"tipo": "S", "descricao": "Lista", "quantidade": 1938},
    ...
  ]
}
```

---

## 📱 Fluxo de Navegação

### Caminho do Usuário

```
1. LISTA DE PRODUTOS
   ↓ (filtrar por marca, grupo, estoque, etc)
   │
2. LISTA FILTRADA
   ↓ (clicar em um produto)
   │
3. DETALHES DO PRODUTO
   │ - Ver informações completas
   │ - Ver estoque por local
   │ - Ver histórico de preços
   ↓ (clicar em "Ver Consumo")
   │
4. ANÁLISE DE CONSUMO DETALHADA
   │ - Período personalizável
   │ - Agrupamentos (usuário, grupo, mês, etc)
   │ - Histórico de movimentações
   │ - Análise de preço ao longo do tempo ✨ RICO!
   │
   ↓ (voltar)
   │
3. DETALHES DO PRODUTO
   ↓ (voltar)
   │
1. LISTA DE PRODUTOS
```

### Produtos COM Controle (Fluxo Especial)

```
1. LISTA DE PRODUTOS
   ↓ (clicar em produto com TIPCONTEST='S','E','L')
   │
2. DETALHES DO PRODUTO COM CONTROLE
   │ - Mostra TODAS as variações
   │ - Cada variação tem:
   │   - Estoque próprio
   │   - Preço próprio
   │   - Link para consumo próprio
   │
   ↓ (clicar em "Ver Consumo do tamanho XG")
   │
3. ANÁLISE DE CONSUMO DESTA VARIAÇÃO
   │ - Filtrado por CODPROD + CONTROLE
   │ - Análise específica deste tamanho/lote/série
   │ - Preços específicos desta variação
```

---

## 🎯 Indicadores Visuais (Cards/Badges)

### Status de Estoque

```typescript
function getEstoqueStatus(estoque, estmin, estmax) {
  if (estoque === 0) return {
    cor: 'vermelho',
    icone: '🔴',
    texto: 'SEM ESTOQUE'
  }
  if (estoque < estmin) return {
    cor: 'amarelo',
    icone: '🟡',
    texto: 'ESTOQUE BAIXO'
  }
  if (estoque > estmax) return {
    cor: 'azul',
    icone: '🔵',
    texto: 'EXCESSO'
  }
  return {
    cor: 'verde',
    icone: '🟢',
    texto: 'OK'
  }
}
```

### Qualidade de Dados

```typescript
function getQualidadeDados(produto) {
  const problemas = []

  if (!produto.ncm || produto.ncm.trim() === '') {
    problemas.push('❌ SEM NCM - PROBLEMA FISCAL!')
  }
  if (!produto.marca || produto.marca.trim() === '') {
    problemas.push('⚠️ Sem marca')
  }
  if (!produto.referencia || produto.referencia.trim() === '') {
    problemas.push('⚠️ Sem referência')
  }

  if (problemas.length === 0) return {
    badge: '✅ COMPLETO',
    cor: 'verde'
  }
  if (problemas.includes('❌ SEM NCM - PROBLEMA FISCAL!')) return {
    badge: '❌ CRÍTICO',
    cor: 'vermelho',
    problemas
  }
  return {
    badge: '⚠️ INCOMPLETO',
    cor: 'amarelo',
    problemas
  }
}
```

### Tendência de Preço

```typescript
function getTendenciaPrecoDisplay(tendencia, variacao) {
  if (tendencia === 'AUMENTO') return {
    icone: '📈',
    cor: 'vermelho',
    texto: `SUBINDO ${variacao.toFixed(2)}%`
  }
  if (tendencia === 'QUEDA') return {
    icone: '📉',
    cor: 'verde',
    texto: `CAINDO ${Math.abs(variacao).toFixed(2)}%`
  }
  return {
    icone: '➡️',
    cor: 'cinza',
    texto: 'ESTÁVEL'
  }
}
```

---

## 🔍 Casos de Uso da Tela

### 1. Gestor quer saber quais produtos estão em falta

**Filtros**:
- ✅ Estoque = "Sem estoque"
- ✅ Alerta estoque mínimo = "Sim"

**Resultado**: Lista de produtos críticos para reposição

---

### 2. Gestor quer ver produtos da marca BOSCH

**Filtros**:
- ✅ Marca = "BOSCH"

**Resultado**: 195 produtos BOSCH

**Detalhes ao clicar**:
- Estoque total
- Preços e tendências
- Consumo mensal
- Link para análise completa

---

### 3. Gestor quer produtos com dados incompletos (problema fiscal)

**Filtros**:
- ✅ Qualidade = "Sem NCM"

**Resultado**: Lista de produtos que precisam de NCM cadastrado

**Ação**: Corrigir cadastros

---

### 4. Gestor quer saber consumo de papel sulfite

**Passo 1**: Buscar "papel sulfite" ou código "3680"
**Passo 2**: Clicar no produto
**Passo 3**: Ver resumo de consumo (285 un em 6 meses)
**Passo 4**: Clicar em "Ver Análise Completa"
**Resultado**:
- Consumo detalhado por usuário
- Preços ao longo do tempo
- Tendência de gasto
- Projeções

---

### 5. Gestor quer comprar luvas mas não sabe qual tamanho

**Passo 1**: Buscar "luva" ou código "3867"
**Passo 2**: Clicar no produto
**Passo 3**: Ver que é produto COM CONTROLE
**Passo 4**: Ver variações:
- XG (11): 25 unidades, R$ 81,25
- GG (10): 1 unidade, R$ 4.165,74 ⚠️
- M (8): 0 unidades

**Passo 5**: Clicar em "Ver Consumo do XG"
**Resultado**: Ver quem mais usa tamanho XG

**Decisão**: Comprar mais XG e investigar preço do GG

---

## 📊 Métricas e KPIs da Tela

### Dashboard de Produtos (Topo da tela)

```
┌─────────────────────────────────────────────────────────────────────┐
│  📊 VISÃO GERAL DE PRODUTOS                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Total Ativos │  │ Com Estoque  │  │ Sem Estoque  │             │
│  │   13.281     │  │    4.928     │  │    8.353     │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Sem NCM      │  │ Com Controle │  │ Estoque      │             │
│  │   ❌ XXX     │  │    2.407     │  │  Crítico     │             │
│  │   CRÍTICO!   │  │   (18%)      │  │   ⚠️ XXX     │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Implementação

### Backend (API)

- [ ] Endpoint de listagem com filtros completos
- [ ] Endpoint de detalhes com include params
- [ ] Endpoint de consumo detalhado (✅ JÁ FEITO!)
- [ ] Endpoint de filtros disponíveis
- [ ] Análise por controle (para produtos S/E/L/P)
- [ ] Paginação otimizada (lazy loading)
- [ ] Cache de dados agregados

### Frontend

- [ ] Tela de listagem com filtros
- [ ] Cards de produto (layout rico)
- [ ] Modal/página de detalhes
- [ ] Badges de status (estoque, qualidade, controle)
- [ ] Navegação para análise de consumo
- [ ] Gráficos de preço
- [ ] Exportação para CSV/Excel
- [ ] Responsivo (mobile-friendly)

### UX/UI

- [ ] Design dos filtros (sidebar vs modal)
- [ ] Cores e ícones dos badges
- [ ] Animações de transição
- [ ] Loading states
- [ ] Empty states (sem resultados)
- [ ] Tooltips explicativos
- [ ] Breadcrumbs de navegação

---

## 🎉 Resultado Final

Uma tela COMPLETA que permite ao gestor:

1. ✅ **VER TUDO** sobre produtos
2. ✅ **FILTRAR** por qualquer critério
3. ✅ **NAVEGAR** para consumo detalhado
4. ✅ **IDENTIFICAR** problemas (sem estoque, sem NCM, preços estranhos)
5. ✅ **ANALISAR** tendências (preços, consumo, variações)
6. ✅ **DECIDIR** com dados RICOS e contextualizados

**Dados RICOS = Decisões INTELIGENTES** 🚀

---

**Status**: 📋 Documentação Completa
**Próximo Passo**: Implementar análise por controle + criar frontend
