# Guia Completo de Inspeção do Database Sankhya

## 📚 Índice

1. [Visão Geral](#visão-geral)
2. [Ferramentas Disponíveis](#ferramentas-disponíveis)
3. [Dicionário de Dados](#dicionário-de-dados)
4. [Como Inspecionar Tabelas](#como-inspecionar-tabelas)
5. [Como Inspecionar Campos](#como-inspecionar-campos)
6. [Como Descobrir Relacionamentos](#como-descobrir-relacionamentos)
7. [Como Descobrir Valores Válidos](#como-descobrir-valores-válidos)
8. [Workflow Completo](#workflow-completo)
9. [Exemplos Práticos](#exemplos-práticos)

---

## Visão Geral

Este guia ensina como inspecionar e entender QUALQUER tabela, campo, relacionamento ou estrutura no database Sankhya usando:

- **Dicionário de Dados**: Metadados sobre tabelas e campos
- **Inspection Query API**: Executor de queries SQL direto no banco

### Objetivo

Permitir que você construa queries SQL otimizadas e seguras para qualquer necessidade, sem precisar adivinhar nomes de campos ou estruturas.

---

## Ferramentas Disponíveis

### 1. Inspection Query API

**Endpoint**: `POST http://localhost:3100/inspection/query`

**Autenticação**: Bearer Token (obtido via `/auth/login`)

**Payload**:
```json
{
  "query": "SELECT ... FROM ... WHERE ..."
}
```

**Limitações de Segurança**:
- ❌ Não permite `SELECT *` - deve especificar campos explicitamente
- ❌ Não permite campos binários (IMAGEM, etc)
- ❌ Não permite comandos destrutivos (UPDATE, DELETE, DROP, etc)
- ❌ CTEs (WITH) não funcionam via API externa
- ✅ Permite WITH (NOLOCK) para performance
- ✅ Permite TOP N para limitar resultados
- ✅ Permite JOINS, subqueries, OUTER APPLY

### 2. Dicionário de Dados API

**Endpoints**:
- `GET /dicionario/tabelas` - Lista todas as tabelas
- `GET /dicionario/tabelas/:nome` - Detalhes de uma tabela
- `GET /dicionario/campos/tabela/:nome` - Lista campos de uma tabela

---

## Dicionário de Dados

### Tabelas do Dicionário

O Sankhya possui 4 tabelas principais de metadados:

#### 1. **TDDTAB** - Tabelas do Sistema

Armazena informações sobre todas as tabelas do database.

**Campos importantes**:
```sql
NOMETAB          VARCHAR   -- Nome da tabela (ex: TGFPRO, TGFCAB)
DESCRTAB         VARCHAR   -- Descrição da tabela
TIPONUMERACAO    CHAR      -- Tipo de numeração
NUCAMPONUMERACAO INT       -- Campo de numeração
ADICIONAL        CHAR      -- Tabela adicional (S/N)
CONTROLE         INT       -- Controle
DOMAIN           VARCHAR   -- Domínio
```

**Exemplo de uso**:
```sql
-- Buscar tabelas relacionadas a produtos
SELECT NOMETAB, DESCRTAB
FROM TDDTAB WITH (NOLOCK)
WHERE NOMETAB LIKE '%PRO%'
ORDER BY NOMETAB;
```

#### 2. **TDDCAM** - Campos das Tabelas

Armazena informações sobre todos os campos de todas as tabelas.

**Campos importantes**:
```sql
NUCAMPO              INT       -- Chave única do campo
NOMETAB              VARCHAR   -- Nome da tabela
NOMECAMPO            VARCHAR   -- Nome do campo
DESCRCAMPO           VARCHAR   -- Descrição do campo
TIPCAMPO             CHAR      -- Tipo do campo (I/S/F/H/B/C)
TAMANHO              INT       -- Tamanho do campo
MASCARA              VARCHAR   -- Máscara de formatação
PERMITEPESQUISA      CHAR      -- Permite pesquisa (S/N)
CALCULADO            CHAR      -- Campo calculado (S/N)
PERMITEPADRAO        CHAR      -- Permite valor padrão (S/N)
APRESENTACAO         VARCHAR   -- Forma de apresentação
ORDEM                INT       -- Ordem de apresentação
VISIVELGRIDPESQUISA  CHAR      -- Visível em grid (S/N)
TIPOAPRESENTACAO     CHAR      -- Tipo de apresentação
SISTEMA              CHAR      -- Campo de sistema (S/N)
ADICIONAL            CHAR      -- Campo adicional (S/N)
CONTROLE             INT       -- Controle
DOMAIN               VARCHAR   -- Domínio
```

**Tipos de Campo (TIPCAMPO)**:
- `I` = Integer (Inteiro)
- `S` = String (Texto/Varchar)
- `F` = Float (Decimal/Numérico)
- `H` = DateTime (Data e Hora)
- `B` = Binary (Binário - imagens, arquivos)
- `C` = Character (Caractere único)

**Exemplo de uso**:
```sql
-- Listar todos os campos da tabela TGFPRO
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
WHERE NOMETAB = 'TGFPRO'
ORDER BY ORDEM;
```

#### 3. **TDDOPC** - Opções de Campos

Armazena valores válidos para campos que possuem lista de opções (enums/lookups).

**Campos importantes**:
```sql
NUCAMPO    INT       -- Referência ao campo (FK para TDDCAM.NUCAMPO)
VALOR      VARCHAR   -- Valor armazenado no banco
OPCAO      VARCHAR   -- Descrição legível da opção
```

**Exemplo de uso**:
```sql
-- Descobrir valores válidos para TGFPRO.ATIVO
SELECT
    C.NOMECAMPO,
    C.DESCRCAMPO,
    O.VALOR,
    O.OPCAO
FROM TDDCAM C WITH (NOLOCK)
JOIN TDDOPC O WITH (NOLOCK) ON O.NUCAMPO = C.NUCAMPO
WHERE C.NOMETAB = 'TGFPRO'
  AND C.NOMECAMPO = 'ATIVO'
ORDER BY O.OPCAO;

-- Resultado:
-- NOMECAMPO | DESCRCAMPO | VALOR | OPCAO
-- ATIVO     | Ativo      | N     | Não
-- ATIVO     | Ativo      | S     | Sim
```

#### 4. **TDDPCO** - Propriedades de Campos

Armazena propriedades adicionais dos campos (metadados estendidos).

**Campos importantes**:
```sql
NUCAMPO    INT       -- Referência ao campo (FK para TDDCAM.NUCAMPO)
NOME       VARCHAR   -- Nome da propriedade
VALOR      TEXT      -- Valor da propriedade
```

**Propriedades comuns**:
- `hidden` = Campo oculto (S/N)
- `required` = Campo obrigatório (S/N)
- `readonly` = Somente leitura (S/N)
- `default` = Valor padrão

**Exemplo de uso**:
```sql
-- Buscar campos ocultos de TGFPRO
SELECT
    C.NOMECAMPO,
    C.DESCRCAMPO,
    PCO.NOME AS PROPRIEDADE,
    RTRIM(CONVERT(VARCHAR(4000), PCO.VALOR)) AS VALOR
FROM TDDCAM C WITH (NOLOCK)
JOIN TDDPCO PCO WITH (NOLOCK) ON PCO.NUCAMPO = C.NUCAMPO
WHERE C.NOMETAB = 'TGFPRO'
  AND PCO.NOME = 'hidden'
  AND RTRIM(CONVERT(VARCHAR(4000), PCO.VALOR)) = 'S';
```

---

## Como Inspecionar Tabelas

### 1. Listar Todas as Tabelas

```sql
-- Via API Dicionário
GET /dicionario/tabelas

-- Via Inspection Query
SELECT TOP 100
    NOMETAB,
    DESCRTAB,
    ADICIONAL
FROM TDDTAB WITH (NOLOCK)
ORDER BY NOMETAB;
```

### 2. Buscar Tabelas por Nome/Descrição

```sql
-- Buscar tabelas relacionadas a "PRODUTO"
SELECT
    NOMETAB,
    DESCRTAB
FROM TDDTAB WITH (NOLOCK)
WHERE NOMETAB LIKE '%PRO%'
   OR DESCRTAB LIKE '%PRODUTO%'
ORDER BY NOMETAB;
```

### 3. Obter Detalhes de uma Tabela Específica

```sql
-- Via API Dicionário
GET /dicionario/tabelas/TGFPRO

-- Via Inspection Query
SELECT
    NOMETAB,
    DESCRTAB,
    TIPONUMERACAO,
    NUCAMPONUMERACAO,
    ADICIONAL,
    CONTROLE,
    DOMAIN
FROM TDDTAB WITH (NOLOCK)
WHERE NOMETAB = 'TGFPRO';
```

---

## Como Inspecionar Campos

### 1. Listar Todos os Campos de uma Tabela

```sql
-- Via API Dicionário
GET /dicionario/campos/tabela/TGFPRO

-- Via Inspection Query
SELECT
    NOMECAMPO,
    DESCRCAMPO,
    TIPCAMPO,
    TAMANHO,
    ORDEM,
    CALCULADO,
    SISTEMA
FROM TDDCAM WITH (NOLOCK)
WHERE NOMETAB = 'TGFPRO'
ORDER BY ORDEM;
```

### 2. Buscar Campos por Nome/Descrição

```sql
-- Buscar campos relacionados a "PRECO" em TGFPRO
SELECT
    NOMECAMPO,
    DESCRCAMPO,
    TIPCAMPO
FROM TDDCAM WITH (NOLOCK)
WHERE NOMETAB = 'TGFPRO'
  AND (NOMECAMPO LIKE '%PRECO%' OR DESCRCAMPO LIKE '%PREÇO%')
ORDER BY ORDEM;
```

### 3. Filtrar Campos por Tipo

```sql
-- Buscar apenas campos numéricos (para cálculos)
SELECT
    NOMECAMPO,
    DESCRCAMPO
FROM TDDCAM WITH (NOLOCK)
WHERE NOMETAB = 'TGFPRO'
  AND TIPCAMPO IN ('I', 'F')  -- Integer ou Float
ORDER BY ORDEM;

-- Buscar apenas campos de data
SELECT
    NOMECAMPO,
    DESCRCAMPO
FROM TDDCAM WITH (NOLOCK)
WHERE NOMETAB = 'TGFCAB'
  AND TIPCAMPO = 'H'  -- DateTime
ORDER BY ORDEM;
```

### 4. Excluir Campos Ocultos ou de Sistema

```sql
-- Buscar campos visíveis e não-sistema
SELECT
    C.NOMECAMPO,
    C.DESCRCAMPO,
    C.TIPCAMPO
FROM TDDCAM C WITH (NOLOCK)
WHERE C.NOMETAB = 'TGFPRO'
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

---

## Como Descobrir Relacionamentos

### 1. Descobrir Chaves Estrangeiras (FK) via Nomenclatura

No Sankhya, campos que começam com `COD` geralmente são FKs:

```sql
-- Listar possíveis FKs de TGFPRO
SELECT
    NOMECAMPO,
    DESCRCAMPO
FROM TDDCAM WITH (NOLOCK)
WHERE NOMETAB = 'TGFPRO'
  AND NOMECAMPO LIKE 'COD%'
  AND TIPCAMPO = 'I'  -- Geralmente são integers
ORDER BY NOMECAMPO;

-- Exemplo de resultado:
-- CODGRUPOPROD -> FK para TGFGRU.CODGRUPOPROD
-- CODPARCFORN  -> FK para TGFPAR.CODPARC
-- CODCAT       -> FK para TGFCAT.CODCAT
```

### 2. Descobrir Tabelas Relacionadas por Prefixo

Tabelas com mesmo prefixo geralmente estão relacionadas:

```sql
-- Tabelas relacionadas a movimentações (TGF*)
SELECT NOMETAB, DESCRTAB
FROM TDDTAB WITH (NOLOCK)
WHERE NOMETAB LIKE 'TGF%'
ORDER BY NOMETAB;

-- TGF = Tabelas Gerais de Faturamento
-- TGFCAB = Cabeçalho de notas
-- TGFITE = Itens de notas
-- TGFPRO = Produtos
-- TGFEST = Estoque
-- TGFLOC = Locais
```

### 3. Descobrir Relacionamentos Comuns

**Padrão CAB-ITE (Cabeçalho-Item)**:
```sql
-- TGFCAB (Cabeçalho) <-> TGFITE (Itens)
-- Chave: NUNOTA

SELECT
    CAB.NUNOTA,
    CAB.DTMOV,
    ITE.CODPROD,
    ITE.QTDNEG
FROM TGFCAB CAB WITH (NOLOCK)
JOIN TGFITE ITE WITH (NOLOCK) ON ITE.NUNOTA = CAB.NUNOTA
WHERE CAB.NUNOTA = 123456;
```

**Padrão Produto-Estoque-Local**:
```sql
-- TGFPRO (Produto) <-> TGFEST (Estoque) <-> TGFLOC (Local)

SELECT
    PRO.CODPROD,
    PRO.DESCRPROD,
    EST.ESTOQUE,
    LOC.DESCRLOCAL
FROM TGFPRO PRO WITH (NOLOCK)
JOIN TGFEST EST WITH (NOLOCK) ON EST.CODPROD = PRO.CODPROD
JOIN TGFLOC LOC WITH (NOLOCK) ON LOC.CODLOCAL = EST.CODLOCAL
WHERE PRO.CODPROD = 3680;
```

### 4. Descobrir Campos em Comum Entre Tabelas

```sql
-- Descobrir campos que existem em ambas TGFPRO e TGFEST
SELECT
    C1.NOMECAMPO,
    C1.DESCRCAMPO AS DESCR_TGFPRO,
    C2.DESCRCAMPO AS DESCR_TGFEST
FROM TDDCAM C1 WITH (NOLOCK)
JOIN TDDCAM C2 WITH (NOLOCK) ON C2.NOMECAMPO = C1.NOMECAMPO
WHERE C1.NOMETAB = 'TGFPRO'
  AND C2.NOMETAB = 'TGFEST'
ORDER BY C1.NOMECAMPO;

-- Resultado comum:
-- CODPROD (chave de relacionamento)
-- ATIVO
```

---

## Como Descobrir Valores Válidos

### 1. Campos com Opções Definidas (TDDOPC)

```sql
-- Descobrir TODOS os campos com opções válidas de uma tabela
SELECT DISTINCT
    C.NOMECAMPO,
    C.DESCRCAMPO
FROM TDDCAM C WITH (NOLOCK)
WHERE C.NOMETAB = 'TGFPRO'
  AND EXISTS (
      SELECT 1
      FROM TDDOPC O WITH (NOLOCK)
      WHERE O.NUCAMPO = C.NUCAMPO
  )
ORDER BY C.NOMECAMPO;
```

```sql
-- Obter valores válidos de um campo específico
SELECT
    C.NOMECAMPO,
    C.DESCRCAMPO,
    O.VALOR,
    O.OPCAO
FROM TDDCAM C WITH (NOLOCK)
JOIN TDDOPC O WITH (NOLOCK) ON O.NUCAMPO = C.NUCAMPO
WHERE C.NOMETAB = 'TGFPRO'
  AND C.NOMECAMPO = 'USOPROD'
ORDER BY O.OPCAO;

-- Resultado:
-- USOPROD | Usado como | C | Consumo
-- USOPROD | Usado como | R | Revenda
-- USOPROD | Usado como | V | Venda
-- ...
```

### 2. Campos sem Opções (Descobrir por Dados Reais)

Quando TDDOPC não tem valores, consulte a tabela real:

```sql
-- Descobrir valores distintos de TGFCAB.TIPMOV
SELECT DISTINCT
    TIPMOV,
    COUNT(*) AS QUANTIDADE
FROM TGFCAB WITH (NOLOCK)
GROUP BY TIPMOV
ORDER BY QUANTIDADE DESC;

-- Resultado:
-- TIPMOV | QUANTIDADE
-- O      | 25000  (Pedido)
-- C      | 5000   (Compra)
-- ...
```

### 3. Descobrir Faixas de Valores Numéricos

```sql
-- Descobrir faixa de valores para campos numéricos
SELECT
    MIN(VLRUNIT) AS MENOR_PRECO,
    MAX(VLRUNIT) AS MAIOR_PRECO,
    AVG(VLRUNIT) AS PRECO_MEDIO
FROM TGFPRO WITH (NOLOCK)
WHERE ATIVO = 'S'
  AND VLRUNIT > 0;
```

---

## Workflow Completo

### Cenário: Quero entender a tabela TGFVEN (Vendedores)

#### Passo 1: Descobrir se a tabela existe

```sql
SELECT NOMETAB, DESCRTAB
FROM TDDTAB WITH (NOLOCK)
WHERE NOMETAB LIKE '%VEN%'
ORDER BY NOMETAB;
```

#### Passo 2: Listar todos os campos

```sql
SELECT
    NOMECAMPO,
    DESCRCAMPO,
    TIPCAMPO,
    ORDEM
FROM TDDCAM WITH (NOLOCK)
WHERE NOMETAB = 'TGFVEN'
ORDER BY ORDEM;
```

#### Passo 3: Identificar a chave primária

```sql
-- Geralmente é o primeiro campo (ORDEM = 0)
SELECT
    NOMECAMPO,
    DESCRCAMPO
FROM TDDCAM WITH (NOLOCK)
WHERE NOMETAB = 'TGFVEN'
  AND ORDEM = 0;

-- Ou buscar por nome
SELECT
    NOMECAMPO,
    DESCRCAMPO
FROM TDDCAM WITH (NOLOCK)
WHERE NOMETAB = 'TGFVEN'
  AND NOMECAMPO LIKE 'COD%'
  AND NOMECAMPO = 'CODVEND';  -- Geralmente COD + nome da tabela
```

#### Passo 4: Descobrir campos com opções

```sql
SELECT
    C.NOMECAMPO,
    C.DESCRCAMPO,
    O.VALOR,
    O.OPCAO
FROM TDDCAM C WITH (NOLOCK)
JOIN TDDOPC O WITH (NOLOCK) ON O.NUCAMPO = C.NUCAMPO
WHERE C.NOMETAB = 'TGFVEN'
ORDER BY C.NOMECAMPO, O.OPCAO;
```

#### Passo 5: Descobrir relacionamentos

```sql
-- Buscar campos que começam com COD (possíveis FKs)
SELECT
    NOMECAMPO,
    DESCRCAMPO
FROM TDDCAM WITH (NOLOCK)
WHERE NOMETAB = 'TGFVEN'
  AND NOMECAMPO LIKE 'COD%'
  AND TIPCAMPO = 'I'
ORDER BY NOMECAMPO;
```

#### Passo 6: Testar query com dados reais

```sql
SELECT TOP 10
    CODVEND,
    NOME,
    ATIVO
FROM TGFVEN WITH (NOLOCK)
ORDER BY CODVEND DESC;
```

---

## Exemplos Práticos

### Exemplo 1: Descobrir estrutura de TGFCAB

```bash
# 1. Obter token
TOKEN=$(curl -s -X POST http://localhost:3100/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"CONVIDADO","password":"guest123"}' \
  | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# 2. Listar campos de TGFCAB
curl -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT NOMECAMPO, DESCRCAMPO, TIPCAMPO FROM TDDCAM WITH (NOLOCK) WHERE NOMETAB = '\''TGFCAB'\'' ORDER BY ORDEM"
  }'
```

### Exemplo 2: Descobrir valores válidos de STATUSNOTA

```bash
curl -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT C.NOMECAMPO, O.VALOR, O.OPCAO FROM TDDCAM C WITH (NOLOCK) JOIN TDDOPC O WITH (NOLOCK) ON O.NUCAMPO = C.NUCAMPO WHERE C.NOMETAB = '\''TGFCAB'\'' AND C.NOMECAMPO = '\''STATUSNOTA'\'' ORDER BY O.OPCAO"
  }'
```

### Exemplo 3: Entender relacionamento CAB-ITE-PRO

```sql
-- Descobrir campos de ligação
SELECT
    C1.NOMECAMPO AS CAMPO_TGFCAB,
    C2.NOMECAMPO AS CAMPO_TGFITE
FROM TDDCAM C1 WITH (NOLOCK)
JOIN TDDCAM C2 WITH (NOLOCK) ON C2.NOMECAMPO = C1.NOMECAMPO
WHERE C1.NOMETAB = 'TGFCAB'
  AND C2.NOMETAB = 'TGFITE';

-- Resultado: NUNOTA é o campo comum

-- Query completa com relacionamentos
SELECT TOP 10
    CAB.NUNOTA,
    CAB.DTMOV,
    CAB.TIPMOV,
    ITE.CODPROD,
    PRO.DESCRPROD,
    ITE.QTDNEG,
    ITE.VLRUNIT
FROM TGFCAB CAB WITH (NOLOCK)
JOIN TGFITE ITE WITH (NOLOCK) ON ITE.NUNOTA = CAB.NUNOTA
JOIN TGFPRO PRO WITH (NOLOCK) ON PRO.CODPROD = ITE.CODPROD
WHERE CAB.STATUSNOTA = 'L'
ORDER BY CAB.DTMOV DESC;
```

---

## Dicas e Melhores Práticas

### 1. Performance

- ✅ Sempre use `WITH (NOLOCK)` em queries de leitura
- ✅ Use `TOP N` para limitar resultados
- ✅ Especifique campos explicitamente (nunca `SELECT *`)
- ✅ Crie índices WHERE quando possível

### 2. Segurança

- ✅ Sempre filtre por `ATIVO = 'S'` quando disponível
- ✅ Use `STATUSNOTA = 'L'` para movimentações aprovadas
- ✅ Evite campos binários (IMAGEM, etc)

### 3. Organização

- ✅ Documente campos descobertos em comentários SQL
- ✅ Crie queries reutilizáveis para relacionamentos comuns
- ✅ Mantenha lista de valores válidos documentada

### 4. Naming Conventions Sankhya

- `TGF*` = Tabelas Gerais de Faturamento
- `TDD*` = Tabelas de Dicionário de Dados
- `CAB` = Cabeçalho
- `ITE` = Item
- `COD*` = Código (geralmente FK)
- `DESCR*` = Descrição
- `DT*` = Data
- `VLR*` = Valor
- `QTD*` = Quantidade
- `NU*` = Número único

---

## Referências

- [TEST-API-GUIDE.md](../archive/api-old/TEST-API-GUIDE.md) - Como testar queries
- [TGFPRO2-IMPLEMENTATION-GUIDE.md](../TGFPRO2-IMPLEMENTATION-GUIDE.md) - Exemplo de implementação
- `/dicionario/*` - API endpoints do dicionário

---

**Última atualização**: 2026-01-13
