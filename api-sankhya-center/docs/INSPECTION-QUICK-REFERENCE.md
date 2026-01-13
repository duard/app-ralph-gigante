# Quick Reference - Inspeção de Database

## 🚀 Queries Prontas para Copiar e Usar

### Autenticação

```bash
# Obter token de acesso
TOKEN=$(curl -s -X POST http://localhost:3100/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"CONVIDADO","password":"guest123"}' \
  | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

echo $TOKEN
```

---

## Tabelas do Dicionário

### Listar todas as tabelas

```sql
SELECT TOP 100
    NOMETAB,
    DESCRTAB,
    ADICIONAL
FROM TDDTAB WITH (NOLOCK)
ORDER BY NOMETAB;
```

### Buscar tabela por nome

```sql
SELECT NOMETAB, DESCRTAB
FROM TDDTAB WITH (NOLOCK)
WHERE NOMETAB LIKE '%{PALAVRA}%'
   OR DESCRTAB LIKE '%{PALAVRA}%'
ORDER BY NOMETAB;
```

### Tabelas por prefixo

```sql
-- TGF = Tabelas Gerais de Faturamento
SELECT NOMETAB, DESCRTAB
FROM TDDTAB WITH (NOLOCK)
WHERE NOMETAB LIKE 'TGF%'
ORDER BY NOMETAB;

-- TDD = Tabelas de Dicionário
SELECT NOMETAB, DESCRTAB
FROM TDDTAB WITH (NOLOCK)
WHERE NOMETAB LIKE 'TDD%'
ORDER BY NOMETAB;
```

---

## Campos de uma Tabela

### Listar todos os campos

```sql
SELECT
    NOMECAMPO,
    DESCRCAMPO,
    CASE TIPCAMPO
        WHEN 'I' THEN 'Integer'
        WHEN 'S' THEN 'String'
        WHEN 'F' THEN 'Float'
        WHEN 'H' THEN 'DateTime'
        WHEN 'B' THEN 'Binary'
        WHEN 'C' THEN 'Character'
    END AS TIPO,
    ORDEM
FROM TDDCAM WITH (NOLOCK)
WHERE NOMETAB = '{TABELA}'
ORDER BY ORDEM;
```

### Campos não-ocultos e não-sistema

```sql
SELECT
    C.NOMECAMPO,
    C.DESCRCAMPO,
    C.TIPCAMPO
FROM TDDCAM C WITH (NOLOCK)
WHERE C.NOMETAB = '{TABELA}'
  AND C.SISTEMA = 'N'
  AND NOT EXISTS (
      SELECT 1
      FROM TDDPCO PCO WITH (NOLOCK)
      WHERE PCO.NUCAMPO = C.NUCAMPO
        AND PCO.NOME = 'hidden'
        AND RTRIM(CONVERT(VARCHAR(4000), PCO.VALOR)) = 'S'
  )
ORDER BY C.ORDEM;
```

### Buscar campo por nome/descrição

```sql
SELECT
    NOMECAMPO,
    DESCRCAMPO,
    TIPCAMPO
FROM TDDCAM WITH (NOLOCK)
WHERE NOMETAB = '{TABELA}'
  AND (NOMECAMPO LIKE '%{PALAVRA}%' OR DESCRCAMPO LIKE '%{PALAVRA}%')
ORDER BY ORDEM;
```

### Campos numéricos (para cálculos)

```sql
SELECT
    NOMECAMPO,
    DESCRCAMPO,
    TIPCAMPO
FROM TDDCAM WITH (NOLOCK)
WHERE NOMETAB = '{TABELA}'
  AND TIPCAMPO IN ('I', 'F')
ORDER BY ORDEM;
```

### Campos de data

```sql
SELECT
    NOMECAMPO,
    DESCRCAMPO
FROM TDDCAM WITH (NOLOCK)
WHERE NOMETAB = '{TABELA}'
  AND TIPCAMPO = 'H'
ORDER BY ORDEM;
```

### Possíveis chaves estrangeiras

```sql
SELECT
    NOMECAMPO,
    DESCRCAMPO
FROM TDDCAM WITH (NOLOCK)
WHERE NOMETAB = '{TABELA}'
  AND NOMECAMPO LIKE 'COD%'
  AND TIPCAMPO = 'I'
ORDER BY NOMECAMPO;
```

---

## Valores Válidos (TDDOPC)

### Listar campos com opções definidas

```sql
SELECT DISTINCT
    C.NOMECAMPO,
    C.DESCRCAMPO
FROM TDDCAM C WITH (NOLOCK)
WHERE C.NOMETAB = '{TABELA}'
  AND EXISTS (
      SELECT 1
      FROM TDDOPC O WITH (NOLOCK)
      WHERE O.NUCAMPO = C.NUCAMPO
  )
ORDER BY C.NOMECAMPO;
```

### Obter opções de um campo específico

```sql
SELECT
    C.NOMECAMPO,
    C.DESCRCAMPO,
    O.VALOR,
    O.OPCAO
FROM TDDCAM C WITH (NOLOCK)
JOIN TDDOPC O WITH (NOLOCK) ON O.NUCAMPO = C.NUCAMPO
WHERE C.NOMETAB = '{TABELA}'
  AND C.NOMECAMPO = '{CAMPO}'
ORDER BY O.OPCAO;
```

### Obter todas as opções de múltiplos campos

```sql
SELECT
    C.NOMECAMPO,
    C.DESCRCAMPO,
    O.VALOR,
    O.OPCAO
FROM TDDCAM C WITH (NOLOCK)
JOIN TDDOPC O WITH (NOLOCK) ON O.NUCAMPO = C.NUCAMPO
WHERE C.NOMETAB = '{TABELA}'
  AND C.NOMECAMPO IN ('{CAMPO1}', '{CAMPO2}', '{CAMPO3}')
ORDER BY C.NOMECAMPO, O.OPCAO;
```

---

## Relacionamentos

### Descobrir campos em comum entre tabelas

```sql
SELECT
    C1.NOMECAMPO,
    C1.DESCRCAMPO AS DESCR_TABELA1,
    C2.DESCRCAMPO AS DESCR_TABELA2
FROM TDDCAM C1 WITH (NOLOCK)
JOIN TDDCAM C2 WITH (NOLOCK) ON C2.NOMECAMPO = C1.NOMECAMPO
WHERE C1.NOMETAB = '{TABELA1}'
  AND C2.NOMETAB = '{TABELA2}'
ORDER BY C1.NOMECAMPO;
```

---

## Propriedades de Campos (TDDPCO)

### Campos ocultos

```sql
SELECT
    C.NOMECAMPO,
    C.DESCRCAMPO
FROM TDDCAM C WITH (NOLOCK)
JOIN TDDPCO PCO WITH (NOLOCK) ON PCO.NUCAMPO = C.NUCAMPO
WHERE C.NOMETAB = '{TABELA}'
  AND PCO.NOME = 'hidden'
  AND RTRIM(CONVERT(VARCHAR(4000), PCO.VALOR)) = 'S';
```

### Todas as propriedades de um campo

```sql
SELECT
    C.NOMECAMPO,
    C.DESCRCAMPO,
    PCO.NOME AS PROPRIEDADE,
    RTRIM(CONVERT(VARCHAR(4000), PCO.VALOR)) AS VALOR
FROM TDDCAM C WITH (NOLOCK)
JOIN TDDPCO PCO WITH (NOLOCK) ON PCO.NUCAMPO = C.NUCAMPO
WHERE C.NOMETAB = '{TABELA}'
  AND C.NOMECAMPO = '{CAMPO}'
ORDER BY PCO.NOME;
```

---

## Dados Reais

### Valores distintos em um campo

```sql
SELECT DISTINCT TOP 20
    {CAMPO},
    COUNT(*) AS QUANTIDADE
FROM {TABELA} WITH (NOLOCK)
GROUP BY {CAMPO}
ORDER BY QUANTIDADE DESC;
```

### Amostra de registros

```sql
SELECT TOP 10
    {CAMPO1},
    {CAMPO2},
    {CAMPO3}
FROM {TABELA} WITH (NOLOCK)
ORDER BY {CAMPO_PRIMARIO} DESC;
```

### Faixa de valores numéricos

```sql
SELECT
    MIN({CAMPO}) AS MINIMO,
    MAX({CAMPO}) AS MAXIMO,
    AVG({CAMPO}) AS MEDIA,
    COUNT(*) AS TOTAL
FROM {TABELA} WITH (NOLOCK)
WHERE {CAMPO} IS NOT NULL;
```

### Contagem por status/tipo

```sql
SELECT
    {CAMPO},
    COUNT(*) AS QUANTIDADE,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() AS PERCENTUAL
FROM {TABELA} WITH (NOLOCK)
GROUP BY {CAMPO}
ORDER BY QUANTIDADE DESC;
```

---

## Queries Comuns por Tabela

### TGFPRO (Produtos)

```sql
-- Produtos ativos de consumo
SELECT TOP 100
    CODPROD,
    DESCRPROD,
    ATIVO,
    USOPROD,
    CODGRUPOPROD,
    VLRUNIT,
    VLRULTCOMPRA
FROM TGFPRO WITH (NOLOCK)
WHERE ATIVO = 'S'
  AND USOPROD = 'C'
ORDER BY CODPROD DESC;
```

### TGFCAB (Cabeçalho Notas)

```sql
-- Pedidos aprovados recentes
SELECT TOP 100
    NUNOTA,
    DTMOV,
    DTNEG,
    TIPMOV,
    STATUSNOTA,
    CODPARC
FROM TGFCAB WITH (NOLOCK)
WHERE TIPMOV = 'O'
  AND STATUSNOTA = 'L'
ORDER BY DTMOV DESC;
```

### TGFITE (Itens de Nota)

```sql
-- Itens de uma nota
SELECT
    NUNOTA,
    SEQUENCIA,
    CODPROD,
    QTDNEG,
    VLRUNIT,
    VLRTOT
FROM TGFITE WITH (NOLOCK)
WHERE NUNOTA = {NUMERO_NOTA}
ORDER BY SEQUENCIA;
```

### TGFEST (Estoque)

```sql
-- Estoque por local
SELECT
    CODPROD,
    CODLOCAL,
    ESTOQUE,
    ESTMIN,
    ESTMAX,
    ATIVO,
    CONTROLE
FROM TGFEST WITH (NOLOCK)
WHERE CODPROD = {CODIGO_PRODUTO}
  AND ATIVO = 'S';
```

### TGFLOC (Locais)

```sql
-- Locais ativos
SELECT
    CODLOCAL,
    DESCRLOCAL,
    ATIVO
FROM TGFLOC WITH (NOLOCK)
WHERE ATIVO = 'S'
ORDER BY DESCRLOCAL;
```

### TGFGRU (Grupos de Produtos)

```sql
-- Grupos com contagem de produtos
SELECT
    G.CODGRUPOPROD,
    G.DESCRGRUPOPROD,
    COUNT(P.CODPROD) AS QTD_PRODUTOS
FROM TGFGRU G WITH (NOLOCK)
LEFT JOIN TGFPRO P WITH (NOLOCK) ON P.CODGRUPOPROD = G.CODGRUPOPROD AND P.ATIVO = 'S'
GROUP BY G.CODGRUPOPROD, G.DESCRGRUPOPROD
ORDER BY QTD_PRODUTOS DESC;
```

---

## Templates de Query Complexa

### JOIN 3 tabelas: CAB-ITE-PRO

```sql
SELECT TOP 100
    CAB.NUNOTA,
    CAB.DTMOV,
    CAB.TIPMOV,
    CAB.STATUSNOTA,
    ITE.SEQUENCIA,
    ITE.CODPROD,
    PRO.DESCRPROD,
    ITE.QTDNEG,
    ITE.VLRUNIT,
    ITE.VLRTOT
FROM TGFCAB CAB WITH (NOLOCK)
JOIN TGFITE ITE WITH (NOLOCK) ON ITE.NUNOTA = CAB.NUNOTA
JOIN TGFPRO PRO WITH (NOLOCK) ON PRO.CODPROD = ITE.CODPROD
WHERE CAB.STATUSNOTA = 'L'
  AND CAB.TIPMOV = 'O'
ORDER BY CAB.DTMOV DESC;
```

### JOIN 4 tabelas: PRO-EST-LOC-GRU

```sql
SELECT TOP 100
    PRO.CODPROD,
    PRO.DESCRPROD,
    GRU.DESCRGRUPOPROD,
    EST.ESTOQUE,
    LOC.DESCRLOCAL,
    EST.ESTMIN,
    EST.ESTMAX
FROM TGFPRO PRO WITH (NOLOCK)
LEFT JOIN TGFGRU GRU WITH (NOLOCK) ON GRU.CODGRUPOPROD = PRO.CODGRUPOPROD
JOIN TGFEST EST WITH (NOLOCK) ON EST.CODPROD = PRO.CODPROD
JOIN TGFLOC LOC WITH (NOLOCK) ON LOC.CODLOCAL = EST.CODLOCAL
WHERE PRO.ATIVO = 'S'
  AND EST.ATIVO = 'S'
  AND EST.ESTOQUE > 0
ORDER BY PRO.CODPROD;
```

### OUTER APPLY para última compra

```sql
SELECT TOP 100
    PRO.CODPROD,
    PRO.DESCRPROD,
    PRO.VLRULTCOMPRA,
    ULT.DTMOV AS DT_ULTIMA_COMPRA,
    ULT.VLRUNIT AS VLR_ULT_PEDIDO,
    ULT.QTDNEG AS QTD_ULT_PEDIDO
FROM TGFPRO PRO WITH (NOLOCK)
OUTER APPLY (
    SELECT TOP 1
        C.DTMOV,
        I.VLRUNIT,
        I.QTDNEG
    FROM TGFCAB C WITH (NOLOCK)
    JOIN TGFITE I WITH (NOLOCK) ON I.NUNOTA = C.NUNOTA
    WHERE I.CODPROD = PRO.CODPROD
      AND C.TIPMOV = 'O'
      AND C.STATUSNOTA = 'L'
    ORDER BY C.DTMOV DESC
) ULT
WHERE PRO.ATIVO = 'S'
ORDER BY PRO.CODPROD;
```

---

## Curl Templates

### Template básico

```bash
curl -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT ... FROM ... WHERE ..."
  }'
```

### Com formatação JSON (jq)

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT ... FROM ... WHERE ..."
  }' | jq '.'
```

### Salvar resultado em arquivo

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT ... FROM ... WHERE ..."
  }' > resultado.json
```

---

## Checklist de Descoberta

Ao explorar uma nova tabela, siga esta ordem:

- [ ] 1. Verificar se tabela existe (TDDTAB)
- [ ] 2. Listar todos os campos (TDDCAM)
- [ ] 3. Identificar chave primária (ORDEM=0 ou COD*)
- [ ] 4. Descobrir campos com opções (TDDOPC)
- [ ] 5. Identificar possíveis FKs (COD*)
- [ ] 6. Buscar campos ocultos (TDDPCO)
- [ ] 7. Testar query com TOP 10
- [ ] 8. Documentar descobertas

---

**Última atualização**: 2026-01-13
