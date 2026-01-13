# 🎯 TIPCONTEST e CONTROLE - Estudo Completo

**Data**: 10/01/2026  
**Criticidade**: ⭐⭐⭐⭐⭐ MUITO IMPORTANTE

---

## 📋 O que é TIPCONTEST?

Campo em **TGFPRO** que define o **TIPO de controle** que o produto possui.

### Valores Possíveis:

| Valor | Significado           | Quantidade | %      |
| ----- | --------------------- | ---------- | ------ |
| **N** | Nenhum (sem controle) | 10.849     | ~83%   |
| **S** | Série/Variação        | 1.937      | ~15%   |
| **E** | Endereço/Localização  | 461        | ~4%    |
| **L** | Lote                  | 7          | ~0.05% |
| **P** | ? (a investigar)      | 1          | ~0.01% |

---

## 🔗 Ligação: TGFPRO.TIPCONTEST ↔ TGFEST.CONTROLE

### 📌 Regra Fundamental:

**CONTROLE** (campo em TGFEST e TGFITE) armazena o **VALOR específico** do controle definido por TIPCONTEST.

---

## 🎨 TIPCONTEST = 'N' (Nenhum)

**Comportamento:**

- Produto SEM controle
- Campo CONTROLE geralmente vazio ou NULL
- **1 linha por produto no TGFEST** (por local)

**Exemplo:**

```sql
CODPROD: 3680
DESCRPROD: "PAPEL SULFITE A4 500 FOLHAS"
TIPCONTEST: "N"
CONTROLE: "" (vazio)
ESTOQUE: 153
```

---

## 🎨 TIPCONTEST = 'S' (Série/Variação)

**Comportamento:**

- Produto com VARIAÇÕES (tamanho, embalagem, modelo, condição, etc)
- Campo CONTROLE armazena a VARIAÇÃO específica
- **MÚLTIPLAS linhas por produto no TGFEST** (uma para cada variação)

**Exemplos Reais:**

### Exemplo 1: Detergente (1980)

```sql
CODPROD: 1980
DESCRPROD: "DETERGENTE LIQUIDO"
TIPCONTEST: "S"

Linhas no TGFEST:
├─ CONTROLE: "500ML" → ESTOQUE: 70
└─ CONTROLE: "5LTS"  → ESTOQUE: 29
```

### Exemplo 2: Papel Higiênico (1983)

```sql
CODPROD: 1983
DESCRPROD: "PAPEL HIGIENICO FOLHA DUPLA"
TIPCONTEST: "S"

Linhas no TGFEST:
├─ CONTROLE: "12 UN" → ESTOQUE: 252
├─ CONTROLE: "64 UN" → ESTOQUE: 768
└─ CONTROLE: "8 UN"  → ESTOQUE: 2
```

### Exemplo 3: Anel ORing (2520) - CASO EXTREMO

```sql
CODPROD: 2520
DESCRPROD: "ANEL ORING DIVERSOS"
TIPCONTEST: "S"

Linhas no TGFEST: 99 variações diferentes!
ESTOQUE_TOTAL: 1.250
```

### Outros Exemplos de CONTROLE Tipo S:

- **Tamanhos**: "M(8/9)", "GG (10)", "6\""
- **Dimensões**: "12X12X120", "18-6"
- **Embalagens**: "100GRAMAS", "20GRAMAS"
- **Condição**: "NOVO", "USADO"
- **Tipo**: "DIESEL S10", "PVT22"
- **Modelos**: Códigos específicos de peças

---

## 🎨 TIPCONTEST = 'E' (Endereço)

**Comportamento:**

- Produto com controle por ENDEREÇO/LOCALIZAÇÃO
- Campo CONTROLE geralmente VAZIO (o endereço é o CODLOCAL)
- **MÚLTIPLAS linhas no TGFEST** (uma por localização física)

**Exemplo: Catraca de Amarração (2664)**

```sql
CODPROD: 2664
DESCRPROD: "CATRACA DE AMARRACAO DE CARGA"
TIPCONTEST: "E"

Linhas no TGFEST (por local):
├─ CODLOCAL: 101001 "ALMOX LOGISTICA GIGANTAO" → ESTOQUE: 454
├─ CODLOCAL: 102001 "CAIXA 001 - JOSE.NEWTON"  → ESTOQUE: 11
├─ CODLOCAL: 102002 "CAIXA 002 - ELVYS.FERREIRA" → ESTOQUE: 6
├─ CODLOCAL: 102003 "CAIXA 003 - NILTON.RIBEIRO" → ESTOQUE: 10
└─ ... (múltiplos locais)

CONTROLE: "" (vazio em todos)
```

**Observação**: Para este tipo, o controle real é feito pelo CODLOCAL, não pelo campo CONTROLE.

---

## 🎨 TIPCONTEST = 'L' (Lote)

**Comportamento:**

- Produto com controle por LOTE de fabricação
- Campo CONTROLE armazena o número/código do LOTE
- **MÚLTIPLAS linhas no TGFEST** (uma por lote)

**Exemplos:**

```sql
Produtos com TIPCONTEST='L':
- 3034: FILTRO HIDRAULICO DONALDSON P566990
- 3035: FILTRO HIDRAULICO DONALDSON P566991
- 4201: TIRANTE LIG CIL DIREÇAO/MANGA EIXO YALE
- 6631: MOITAO DE GUINDASTE 30TON
- 6635: MOITAO DE GUINDASTE 60TON

(Não encontrados em estoque no momento)
```

---

## 🎨 TIPCONTEST = 'P' (?)

**Comportamento**: Ainda não investigado (apenas 1 produto no sistema)

---

## ⚠️ IMPLICAÇÕES CRÍTICAS

### 1. Cálculo de Estoque

**❌ ERRADO** (ignora controle):

```sql
SELECT SUM(ESTOQUE)
FROM TGFEST
WHERE CODPROD = 1980
-- Resultado: 99 (soma de todas as variações)
```

**✅ CORRETO** (considera controle):

```sql
-- Para produtos com TIPCONTEST='S', deve especificar o CONTROLE:
SELECT ESTOQUE
FROM TGFEST
WHERE CODPROD = 1980
  AND CONTROLE = '500ML'
-- Resultado: 70

-- Ou listar todas as variações:
SELECT CONTROLE, ESTOQUE
FROM TGFEST
WHERE CODPROD = 1980
-- 500ML: 70
-- 5LTS: 29
```

### 2. Movimentações (TGFITE)

**Importante**: O campo CONTROLE em TGFITE deve bater com o CONTROLE do TGFEST

```sql
-- Movimentação específica de uma variação
SELECT c.NUNOTA, i.CODPROD, i.CONTROLE, i.QTDNEG
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
WHERE i.CODPROD = 1980
  AND i.CONTROLE = '500ML'
```

### 3. Consumo por Período

Para produtos com TIPCONTEST <> 'N', o relatório deve:

- **Opção A**: Agrupar todas as variações (mostrar total)
- **Opção B**: Separar por variação (mostrar cada CONTROLE)

**Recomendação**: Opção B (mais detalhado e correto)

---

## 📊 Queries Importantes

### Query 1: Listar produtos com múltiplas variações

```sql
SELECT
    p.CODPROD,
    p.DESCRPROD,
    p.TIPCONTEST,
    COUNT(DISTINCT e.CONTROLE) as QTD_VARIACOES,
    SUM(e.ESTOQUE) as ESTOQUE_TOTAL
FROM TGFPRO p
JOIN TGFEST e ON e.CODPROD = p.CODPROD
WHERE p.TIPCONTEST = 'S'
  AND e.CODPARC = 0
  AND e.ATIVO = 'S'
  AND e.ESTOQUE > 0
GROUP BY p.CODPROD, p.DESCRPROD, p.TIPCONTEST
HAVING COUNT(DISTINCT e.CONTROLE) > 1
ORDER BY QTD_VARIACOES DESC
```

### Query 2: Estoque detalhado por variação

```sql
SELECT
    p.CODPROD,
    p.DESCRPROD,
    p.TIPCONTEST,
    e.CONTROLE,
    l.DESCRLOCAL,
    e.ESTOQUE
FROM TGFPRO p
JOIN TGFEST e ON e.CODPROD = p.CODPROD
LEFT JOIN TGFLOC l ON l.CODLOCAL = e.CODLOCAL
WHERE p.CODPROD = @CODPROD
  AND e.CODPARC = 0
  AND e.ATIVO = 'S'
ORDER BY e.CONTROLE, e.CODLOCAL
```

### Query 3: Movimentações com controle

```sql
SELECT
    c.NUNOTA,
    c.TIPMOV,
    p.CODPROD,
    p.DESCRPROD,
    p.TIPCONTEST,
    i.CONTROLE,
    i.QTDNEG,
    i.VLRTOT
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
JOIN TGFPRO p ON p.CODPROD = i.CODPROD
WHERE p.CODPROD = @CODPROD
  AND c.STATUSNOTA = 'L'
  AND i.ATUALESTOQUE <> 0
ORDER BY c.DTNEG DESC, i.CONTROLE
```

---

## 🎯 Recomendações para Implementação

### Para Endpoint de Consumo V2:

1. **Sempre incluir TIPCONTEST** na resposta do produto
2. **Sempre incluir CONTROLE** nas movimentações e localizações
3. **Agrupar ou separar** conforme TIPCONTEST:
   - Se 'N': Apresentar normalmente
   - Se 'S': Listar variações separadamente
   - Se 'E': Listar por localização
   - Se 'L': Listar por lote

4. **Exemplo de resposta:**

```json
{
  "produto": {
    "codprod": 1980,
    "descrprod": "DETERGENTE LIQUIDO",
    "tipcontest": "S",
    "temVariacoes": true
  },
  "saldoAtual": {
    "localizacoes": [
      {
        "codlocal": 0,
        "descricao": "<SEM LOCAL>",
        "controle": "500ML",
        "estoque": 70
      },
      {
        "codlocal": 0,
        "descricao": "<SEM LOCAL>",
        "controle": "5LTS",
        "estoque": 29
      }
    ]
  }
}
```

---

## 📝 Checklist de Validação

Ao trabalhar com estoque/movimentações:

- [ ] Verificar se produto tem TIPCONTEST diferente de 'N'
- [ ] Se TIPCONTEST = 'S', incluir filtro por CONTROLE
- [ ] Se TIPCONTEST = 'E', considerar múltiplos LOCAIs
- [ ] Se TIPCONTEST = 'L', incluir filtro por LOTE (CONTROLE)
- [ ] Sempre incluir CONTROLE nas queries de TGFEST
- [ ] Sempre incluir CONTROLE nas queries de TGFITE
- [ ] Nunca somar estoques sem considerar CONTROLE

---

## ⚠️ ATENÇÃO ESPECIAL

**Produtos como ANEL ORING (2520) têm até 99 variações!**

Isso significa que:

- Consultas precisam estar otimizadas
- UI precisa suportar muitas variações
- Relatórios devem ter opção de agrupamento
- Paginação é essencial

---

**Conclusão**: TIPCONTEST e CONTROLE são fundamentais para gestão correta de estoque no Sankhya. Ignorá-los pode resultar em dados incorretos e problemas operacionais graves!
