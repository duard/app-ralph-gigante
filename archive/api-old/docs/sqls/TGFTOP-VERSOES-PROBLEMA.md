# ⚠️ TGFTOP - Problema de Múltiplas Versões

## 📋 Problema Identificado

**TGFTOP tem múltiplas linhas por CODTIPOPER** representando versões ao longo do tempo.

### Exemplo:

```sql
SELECT CODTIPOPER, COUNT(*) FROM TGFTOP
WHERE CODTIPOPER IN (500, 502, 504)
GROUP BY CODTIPOPER

Resultado:
- CODTIPOPER 500: 12 versões
- CODTIPOPER 502: 7 versões
- CODTIPOPER 504: 4 versões
```

### Campo de Versionamento:

- **DHALTER** (DATETIME) - Data/hora da alteração

---

## 🎯 Solução Ideal (NÃO FUNCIONA no Sankhya)

```sql
-- JOIN com data do movimento
SELECT ...
FROM TGFCAB c
JOIN TGFTOP t ON t.CODTIPOPER = c.CODTIPOPER
    AND t.DHALTER <= c.DTNEG  -- Versão vigente na data
    AND t.DHALTER = (
        SELECT MAX(DHALTER)
        FROM TGFTOP
        WHERE CODTIPOPER = c.CODTIPOPER
          AND DHALTER <= c.DTNEG
    )
```

**Problema**: Causa "Internal server error" no Sankhya

---

## ✅ Solução Implementada (FUNCIONA)

### Abordagem: TOP 1 + Cache

```typescript
// 1. Query simples SEM TGFTOP JOIN
const sql = `
  SELECT
    c.NUNOTA,
    c.CODTIPOPER,
    ...
  FROM TGFCAB c
  JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
  WHERE ...
`

// 2. Buscar TGFTOP separadamente com cache
async fetchTipoOperacao(codtipoper: number) {
  if (this.tgftopCache.has(codtipoper)) {
    return this.tgftopCache.get(codtipoper)
  }

  const sql = `
    SELECT TOP 1 CODTIPOPER, DESCROPER, ATUALEST
    FROM TGFTOP
    WHERE CODTIPOPER = ${codtipoper}
    ORDER BY DHALTER DESC  -- Versão mais recente
  `

  const res = await this.executeQuery(sql)
  this.tgftopCache.set(codtipoper, res[0])
  return res[0]
}
```

### Vantagens:

1. ✅ **Funciona** (não causa erro no Sankhya)
2. ✅ **Performático** (cache em memória)
3. ✅ **Simples** (evita JOINs complexos)
4. ✅ **Suficiente** para 99% dos casos (TGFTOP muda raramente)

### Limitação:

- ⚠️ Usa sempre a versão mais recente do TGFTOP
- ⚠️ Para movimentações antigas, pode não ser a versão exata da época
- ⚠️ Na prática, isso raramente importa (ATUALEST e DESCROPER não mudam muito)

---

## 📊 Quando a Versão Importa?

**Raramente importa porque:**

1. ATUALEST (B/E/N/R) raramente muda
2. DESCROPER muda apenas para correções de texto
3. Mudanças estruturais criam novo CODTIPOPER

**Poderia importar se:**

- ATUALEST mudou ao longo do tempo para mesmo CODTIPOPER
- Fazendo análise histórica de longo prazo (anos)

---

## 🎯 Recomendação

**Usar solução implementada (TOP 1 + Cache)** porque:

- ✅ Funcional
- ✅ Performática
- ✅ Suficientemente precisa
- ✅ Evita complexidade desnecessária

Se precisão histórica for crítica, considerar:

- Armazenar DHALTER do TGFTOP usado
- Criar tabela de auditoria local
- Buscar versão específica quando necessário

---

## 📝 Nota Técnica

Tentativas que **NÃO funcionaram** no Sankhya:

1. ❌ `JOIN TGFTOP ... AND DHALTER <= c.DTNEG`
2. ❌ `LEFT JOIN TGFTOP ... AND DTALTER = c.DTALTER`
3. ❌ Subquery com `WHERE DHALTER <= c.DTNEG`
4. ❌ `JOIN TGFTOP ... AND DHTIPOPER = c.DHTIPOPER`

Todas causam: "Internal server error"

**Solução que FUNCIONA:**

- Query separada com `SELECT TOP 1 ... ORDER BY DHALTER DESC`
- Cache em memória para performance
