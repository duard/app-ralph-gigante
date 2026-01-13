# Exemplos Práticos de Inspeção

## 📋 Casos de Uso Reais

Este documento mostra exemplos práticos passo-a-passo de como usar o dicionário de dados e inspection queries para descobrir estruturas do database.

---

## Exemplo 1: Descobrir como funciona TGFPRO (Produtos)

### Objetivo
Entender completamente a estrutura da tabela de produtos.

### Passo 1: Obter autenticação

```bash
TOKEN=$(curl -s -X POST http://localhost:3100/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"CONVIDADO","password":"guest123"}' \
  | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
```

### Passo 2: Verificar detalhes da tabela

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT NOMETAB, DESCRTAB FROM TDDTAB WITH (NOLOCK) WHERE NOMETAB = '\''TGFPRO'\''"
  }'
```

**Resultado**:
```json
[
  {
    "NOMETAB": "TGFPRO",
    "DESCRTAB": "Produto"
  }
]
```

### Passo 3: Listar campos essenciais

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT TOP 20 NOMECAMPO, DESCRCAMPO, TIPCAMPO, ORDEM FROM TDDCAM WITH (NOLOCK) WHERE NOMETAB = '\''TGFPRO'\'' ORDER BY ORDEM"
  }'
```

**Resultado** (primeiros 20 campos):
```json
[
  {"NOMECAMPO": "CODPROD", "DESCRCAMPO": "Código", "TIPCAMPO": "I", "ORDEM": 0},
  {"NOMECAMPO": "DESCRPROD", "DESCRCAMPO": "Descrição", "TIPCAMPO": "S", "ORDEM": 9},
  {"NOMECAMPO": "ATIVO", "DESCRCAMPO": "Ativo", "TIPCAMPO": "S", "ORDEM": 13},
  {"NOMECAMPO": "CODGRUPOPROD", "DESCRCAMPO": "Grupo", "TIPCAMPO": "I", "ORDEM": 21},
  ...
]
```

### Passo 4: Descobrir valores válidos de ATIVO

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT O.VALOR, O.OPCAO FROM TDDCAM C WITH (NOLOCK) JOIN TDDOPC O WITH (NOLOCK) ON O.NUCAMPO = C.NUCAMPO WHERE C.NOMETAB = '\''TGFPRO'\'' AND C.NOMECAMPO = '\''ATIVO'\'' ORDER BY O.OPCAO"
  }'
```

**Resultado**:
```json
[
  {"VALOR": "N", "OPCAO": "Não"},
  {"VALOR": "S", "OPCAO": "Sim"}
]
```

**Conclusão**: Sempre filtrar por `ATIVO = 'S'` para produtos ativos.

### Passo 5: Descobrir valores válidos de USOPROD

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT O.VALOR, O.OPCAO FROM TDDCAM C WITH (NOLOCK) JOIN TDDOPC O WITH (NOLOCK) ON O.NUCAMPO = C.NUCAMPO WHERE C.NOMETAB = '\''TGFPRO'\'' AND C.NOMECAMPO = '\''USOPROD'\'' ORDER BY O.OPCAO"
  }'
```

**Resultado parcial**:
```json
[
  {"VALOR": "C", "OPCAO": "Consumo"},
  {"VALOR": "R", "OPCAO": "Revenda"},
  {"VALOR": "V", "OPCAO": "Venda (fabricação própria)"},
  ...
]
```

**Conclusão**: Para nosso caso (consumo), usar `USOPROD = 'C'`.

### Passo 6: Testar query com dados reais

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT TOP 5 CODPROD, DESCRPROD, ATIVO, USOPROD FROM TGFPRO WITH (NOLOCK) WHERE ATIVO = '\''S'\'' AND USOPROD = '\''C'\'' ORDER BY CODPROD DESC"
  }'
```

---

## Exemplo 2: Descobrir relacionamento entre TGFCAB e TGFITE

### Objetivo
Entender como cabeçalhos de notas se relacionam com itens.

### Passo 1: Descobrir campos em comum

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT C1.NOMECAMPO, C1.DESCRCAMPO AS DESCR_CAB, C2.DESCRCAMPO AS DESCR_ITE FROM TDDCAM C1 WITH (NOLOCK) JOIN TDDCAM C2 WITH (NOLOCK) ON C2.NOMECAMPO = C1.NOMECAMPO WHERE C1.NOMETAB = '\''TGFCAB'\'' AND C2.NOMETAB = '\''TGFITE'\''"
  }'
```

**Resultado**:
```json
[
  {
    "NOMECAMPO": "NUNOTA",
    "DESCR_CAB": "Número Único",
    "DESCR_ITE": "Número Único"
  }
]
```

**Conclusão**: `NUNOTA` é a chave de relacionamento.

### Passo 2: Descobrir campos importantes de TGFCAB

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT NOMECAMPO, DESCRCAMPO FROM TDDCAM WITH (NOLOCK) WHERE NOMETAB = '\''TGFCAB'\'' AND NOMECAMPO IN ('\''NUNOTA'\'', '\''DTMOV'\'', '\''TIPMOV'\'', '\''STATUSNOTA'\'', '\''CODPARC'\'')"
  }'
```

### Passo 3: Descobrir valores de TIPMOV

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT DISTINCT TIPMOV, COUNT(*) AS QTD FROM TGFCAB WITH (NOLOCK) GROUP BY TIPMOV ORDER BY QTD DESC"
  }'
```

**Resultado**:
```json
[
  {"TIPMOV": "O", "QTD": 25000},
  {"TIPMOV": "C", "QTD": 5000},
  {"TIPMOV": "D", "QTD": 3000}
]
```

### Passo 4: Descobrir valores de STATUSNOTA

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT O.VALOR, O.OPCAO FROM TDDCAM C WITH (NOLOCK) JOIN TDDOPC O WITH (NOLOCK) ON O.NUCAMPO = C.NUCAMPO WHERE C.NOMETAB = '\''TGFCAB'\'' AND C.NOMECAMPO = '\''STATUSNOTA'\''"
  }'
```

**Resultado**:
```json
[
  {"VALOR": "A", "OPCAO": "Aberto"},
  {"VALOR": "L", "OPCAO": "Liberado"},
  {"VALOR": "P", "OPCAO": "Pendente"}
]
```

**Conclusão**: Usar `STATUSNOTA = 'L'` para notas aprovadas.

### Passo 5: Testar JOIN CAB-ITE

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT TOP 5 CAB.NUNOTA, CAB.DTMOV, CAB.TIPMOV, ITE.SEQUENCIA, ITE.CODPROD, ITE.QTDNEG FROM TGFCAB CAB WITH (NOLOCK) JOIN TGFITE ITE WITH (NOLOCK) ON ITE.NUNOTA = CAB.NUNOTA WHERE CAB.STATUSNOTA = '\''L'\'' ORDER BY CAB.DTMOV DESC"
  }'
```

---

## Exemplo 3: Descobrir estrutura de estoque (TGFEST)

### Objetivo
Entender como funciona o controle de estoque por produto e local.

### Passo 1: Listar campos de TGFEST

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT NOMECAMPO, DESCRCAMPO, TIPCAMPO FROM TDDCAM WITH (NOLOCK) WHERE NOMETAB = '\''TGFEST'\'' ORDER BY ORDEM"
  }'
```

**Resultado**:
```json
[
  {"NOMECAMPO": "CODPROD", "DESCRCAMPO": "Código", "TIPCAMPO": "I"},
  {"NOMECAMPO": "CODLOCAL", "DESCRCAMPO": "Local", "TIPCAMPO": "I"},
  {"NOMECAMPO": "ESTOQUE", "DESCRCAMPO": "Estoque", "TIPCAMPO": "F"},
  {"NOMECAMPO": "ESTMIN", "DESCRCAMPO": "Estoque Mínimo", "TIPCAMPO": "F"},
  {"NOMECAMPO": "ESTMAX", "DESCRCAMPO": "Estoque Máximo", "TIPCAMPO": "F"},
  {"NOMECAMPO": "ATIVO", "DESCRCAMPO": "Ativo", "TIPCAMPO": "S"},
  {"NOMECAMPO": "CONTROLE", "DESCRCAMPO": "Controle", "TIPCAMPO": "S"}
]
```

**Conclusão**:
- Chave composta: `CODPROD` + `CODLOCAL`
- Um produto pode ter estoque em múltiplos locais

### Passo 2: Descobrir relacionamento com TGFLOC

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT C1.NOMECAMPO FROM TDDCAM C1 WITH (NOLOCK) JOIN TDDCAM C2 WITH (NOLOCK) ON C2.NOMECAMPO = C1.NOMECAMPO WHERE C1.NOMETAB = '\''TGFEST'\'' AND C2.NOMETAB = '\''TGFLOC'\''"
  }'
```

**Resultado**:
```json
[
  {"NOMECAMPO": "CODLOCAL"}
]
```

### Passo 3: Testar query completa PRO-EST-LOC

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT TOP 5 P.CODPROD, P.DESCRPROD, E.CODLOCAL, L.DESCRLOCAL, E.ESTOQUE FROM TGFPRO P WITH (NOLOCK) JOIN TGFEST E WITH (NOLOCK) ON E.CODPROD = P.CODPROD LEFT JOIN TGFLOC L WITH (NOLOCK) ON L.CODLOCAL = E.CODLOCAL WHERE P.ATIVO = '\''S'\'' AND E.ATIVO = '\''S'\'' AND E.ESTOQUE > 0 ORDER BY P.CODPROD"
  }'
```

---

## Exemplo 4: Calcular preço médio de um produto

### Objetivo
Descobrir como obter o preço médio ponderado das últimas compras.

### Passo 1: Identificar campos de preço em TGFPRO

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT NOMECAMPO, DESCRCAMPO FROM TDDCAM WITH (NOLOCK) WHERE NOMETAB = '\''TGFPRO'\'' AND (NOMECAMPO LIKE '\''%VLR%'\'' OR NOMECAMPO LIKE '\''%PRECO%'\'' OR NOMECAMPO LIKE '\''%CUSTO%'\'') ORDER BY NOMECAMPO"
  }'
```

**Resultado**:
```json
[
  {"NOMECAMPO": "CUSTO", "DESCRCAMPO": "Custo"},
  {"NOMECAMPO": "CUSTOCONT", "DESCRCAMPO": "Custo contábil"},
  {"NOMECAMPO": "CUSTOFIN", "DESCRCAMPO": "Custo financeiro"},
  {"NOMECAMPO": "PRECOVENDA", "DESCRCAMPO": "Preço de venda"},
  {"NOMECAMPO": "VLRULTCOMPRA", "DESCRCAMPO": "Valor última compra"},
  {"NOMECAMPO": "VLRUNIT", "DESCRCAMPO": "Valor unitário"}
]
```

### Passo 2: Identificar campos de preço em TGFITE

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT NOMECAMPO, DESCRCAMPO FROM TDDCAM WITH (NOLOCK) WHERE NOMETAB = '\''TGFITE'\'' AND (NOMECAMPO LIKE '\''%VLR%'\'' OR NOMECAMPO LIKE '\''%QTD%'\'') ORDER BY NOMECAMPO"
  }'
```

**Resultado**:
```json
[
  {"NOMECAMPO": "QTDNEG", "DESCRCAMPO": "Quantidade negociada"},
  {"NOMECAMPO": "VLRUNIT", "DESCRCAMPO": "Valor unitário"},
  {"NOMECAMPO": "VLRTOT", "DESCRCAMPO": "Valor total"}
]
```

### Passo 3: Obter última compra de um produto

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT TOP 1 C.DTMOV, I.VLRUNIT, I.QTDNEG, I.VLRTOT FROM TGFCAB C WITH (NOLOCK) JOIN TGFITE I WITH (NOLOCK) ON I.NUNOTA = C.NUNOTA WHERE I.CODPROD = 3680 AND C.TIPMOV = '\''O'\'' AND C.STATUSNOTA = '\''L'\'' ORDER BY C.DTMOV DESC"
  }'
```

**Resultado**:
```json
[
  {
    "DTMOV": "2025-12-30T00:00:00",
    "VLRUNIT": 23.44,
    "QTDNEG": 10.0,
    "VLRTOT": 234.40
  }
]
```

### Passo 4: Calcular preço médio ponderado (últimas 10 compras)

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT SUM(COMPRAS.VLRTOT) / NULLIF(SUM(COMPRAS.QTDNEG), 0) AS PRECO_MEDIO FROM (SELECT TOP 10 I.VLRTOT, I.QTDNEG FROM TGFCAB C WITH (NOLOCK) JOIN TGFITE I WITH (NOLOCK) ON I.NUNOTA = C.NUNOTA WHERE I.CODPROD = 3680 AND C.TIPMOV = '\''O'\'' AND C.STATUSNOTA = '\''L'\'' ORDER BY C.DTMOV DESC) COMPRAS"
  }'
```

**Resultado**:
```json
[
  {"PRECO_MEDIO": 24.07}
]
```

---

## Exemplo 5: Descobrir grupos de produtos

### Objetivo
Entender a estrutura de grupos e quantos produtos cada grupo tem.

### Passo 1: Descobrir tabela de grupos

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT NOMETAB, DESCRTAB FROM TDDTAB WITH (NOLOCK) WHERE NOMETAB LIKE '\''%GRU%'\'' OR DESCRTAB LIKE '\''%GRUPO%'\''"
  }'
```

**Resultado**:
```json
[
  {"NOMETAB": "TGFGRU", "DESCRTAB": "Grupo de Produtos"}
]
```

### Passo 2: Listar campos de TGFGRU

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT NOMECAMPO, DESCRCAMPO FROM TDDCAM WITH (NOLOCK) WHERE NOMETAB = '\''TGFGRU'\'' ORDER BY ORDEM"
  }'
```

**Resultado**:
```json
[
  {"NOMECAMPO": "CODGRUPOPROD", "DESCRCAMPO": "Código"},
  {"NOMECAMPO": "DESCRGRUPOPROD", "DESCRCAMPO": "Descrição"},
  {"NOMECAMPO": "ATIVO", "DESCRCAMPO": "Ativo"}
]
```

### Passo 3: Contar produtos por grupo

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT TOP 10 G.CODGRUPOPROD, G.DESCRGRUPOPROD, COUNT(P.CODPROD) AS QTD_PRODUTOS FROM TGFGRU G WITH (NOLOCK) LEFT JOIN TGFPRO P WITH (NOLOCK) ON P.CODGRUPOPROD = G.CODGRUPOPROD AND P.ATIVO = '\''S'\'' GROUP BY G.CODGRUPOPROD, G.DESCRGRUPOPROD ORDER BY QTD_PRODUTOS DESC"
  }'
```

---

## Exemplo 6: Descobrir tabelas adicionais de um módulo

### Objetivo
Descobrir todas as tabelas relacionadas a produtos (TGF*PRO*).

### Query

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT NOMETAB, DESCRTAB FROM TDDTAB WITH (NOLOCK) WHERE NOMETAB LIKE '\''%PRO%'\'' ORDER BY NOMETAB"
  }'
```

**Resultado**:
```json
[
  {"NOMETAB": "TGFPRO", "DESCRTAB": "Produto"},
  {"NOMETAB": "TGFPRODEC", "DESCRTAB": "Declaração de Produto"},
  {"NOMETAB": "TGFPROC", "DESCRTAB": "Processo"},
  ...
]
```

---

## Checklist de Descoberta Completa

Para qualquer tabela nova, siga este workflow:

### ✅ 1. Verificação Básica
- [ ] Tabela existe?
- [ ] Qual a descrição?
- [ ] É tabela adicional?

### ✅ 2. Estrutura de Campos
- [ ] Listar todos os campos
- [ ] Identificar chave primária
- [ ] Identificar campos obrigatórios
- [ ] Listar campos numéricos (para cálculos)
- [ ] Listar campos de data

### ✅ 3. Valores Válidos
- [ ] Quais campos têm opções em TDDOPC?
- [ ] Documentar todas as opções
- [ ] Testar valores com dados reais

### ✅ 4. Relacionamentos
- [ ] Identificar possíveis FKs (COD*)
- [ ] Descobrir campos em comum com outras tabelas
- [ ] Testar JOINs

### ✅ 5. Propriedades Especiais
- [ ] Verificar campos ocultos
- [ ] Verificar campos calculados
- [ ] Verificar campos de sistema

### ✅ 6. Teste com Dados Reais
- [ ] Query simples (TOP 10)
- [ ] Query com filtros
- [ ] Query com JOINs
- [ ] Query com agregações

### ✅ 7. Documentação
- [ ] Documentar descobertas
- [ ] Criar queries reutilizáveis
- [ ] Adicionar exemplos

---

**Última atualização**: 2026-01-13
