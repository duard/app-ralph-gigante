# Análise Completa da Tabela TGFEST (Estoque)

## 📋 Visão Geral da Tabela

**TGFEST** é a tabela central do controle de estoque no Sankhya ERP, armazenando o saldo de cada produto em cada local físico, com controle detalhado de lotes, validade e características específicas.

### 🎯 Finalidade do Sistema

- **Controle de Saldos**: Saldo atual de cada produto por local
- **Gestão de Lotes**: Controle de validade, pureza e características
- **Conferência Física**: Base para inventário e contagem de estoque
- **Controle de Qualidade**: Lotes com características específicas
- **Gestão de Custos**: Base para cálculo de custos e valorização

## 📊 Estrutura da Tabela

### 🔑 Chave Primária Composta (6 campos)

- **CODEMP**: Empresa (SMALLINT, NOT NULL)
- **CODPROD**: Produto (INT, NOT NULL)
- **CODLOCAL**: Local (INT, NOT NULL)
- **CONTROLE**: Controle/Lote (VARCHAR(11), NOT NULL)
- **CODPARC**: Parceiro (INT, NOT NULL)
- **TIPO**: Tipo (CHAR(1), NOT NULL)

### 📈 Volume de Dados

- **Registros**: Centenas de milhares (depende da variedade de produtos e locais)
- **Crescimento**: Contínuo com novos produtos, lotes e locais
- **Atualização**: Constante com movimentações de entrada/saída

## 🔍 Campos Principais

### 🏢 Identificação do Saldo

| Campo      | Tipo        | Descrição              | Exemplo                         |
| ---------- | ----------- | ---------------------- | ------------------------------- |
| `codemp`   | SMALLINT    | Código da empresa      | 1                               |
| `codprod`  | INT         | Código do produto      | 12345                           |
| `codlocal` | INT         | Código do local físico | 101001                          |
| `controle` | VARCHAR(11) | Controle/Lote          | "LOTE001", "180ML"              |
| `codparc`  | INT         | Parceiro (fornecedor)  | 0 (próprio)                     |
| `tipo`     | CHAR(1)     | Tipo de saldo          | "P" (Próprio), "C" (Consignado) |

### 📦 Controle de Quantidade

| Campo           | Tipo  | Descrição              | Exemplo |
| --------------- | ----- | ---------------------- | ------- |
| `estoque`       | FLOAT | Quantidade atual       | 150.50  |
| `reservado`     | FLOAT | Quantidade reservada   | 25.00   |
| `estmin`        | FLOAT | Estoque mínimo         | 10.00   |
| `estmax`        | FLOAT | Estoque máximo         | 200.00  |
| `qtdpedpendest` | FLOAT | Qtde pedidos pendentes | 5.00    |
| `wmsbloqueado`  | FLOAT | Bloqueado pelo WMS     | 0.00    |

### 🧪 Controle de Qualidade

| Campo        | Tipo        | Descrição                | Exemplo                        |
| ------------ | ----------- | ------------------------ | ------------------------------ |
| `percpureza` | FLOAT       | Percentual de pureza     | 98.50                          |
| `percgermin` | FLOAT       | Percentual de germinação | 95.00                          |
| `statuslote` | VARCHAR(1)  | Status do lote           | "N" (Normal), "Q" (Quarentena) |
| `md5paf`     | VARCHAR(32) | Hash PAF-ECF             | [MD5 Hash]                     |

### 📅 Controle de Validade

| Campo          | Tipo     | Descrição          | Exemplo      |
| -------------- | -------- | ------------------ | ------------ |
| `dtval`        | DATETIME | Data de validade   | "2026-12-31" |
| `dtfabricacao` | DATETIME | Data de fabricação | "2024-01-15" |
| `dtentrada`    | DATETIME | Data de entrada    | "2024-06-20" |

### 📋 Outros Controles

| Campo          | Tipo        | Descrição           | Exemplo        |
| -------------- | ----------- | ------------------- | -------------- |
| `codbarra`     | VARCHAR(25) | Código de barras    | "789123456789" |
| `ativo`        | CHAR(1)     | Saldo ativo         | "S"            |
| `codagregacao` | VARCHAR(20) | Código de agregação | "PALLET001"    |
| `percvc`       | FLOAT       | Percentual VC       | 15.00          |

## 🔗 Relacionamentos

### 📋 Relações Principais

#### 1. **TGFPRO** (Produtos)

```sql
TGFEST.CODPROD → TGFPRO.CODPROD
```

- **Descrição**: Produto do saldo
- **Cardinalidade**: Muitos-para-1
- **Obrigatório**: Sim

#### 2. **TGFLOC** (Locais)

```sql
TGFEST.CODLOCAL → TGFLOC.CODLOCAL
```

- **Descrição**: Local físico do estoque
- **Cardinalidade**: Muitos-para-1
- **Obrigatório**: Sim

#### 3. **TGFEMP** (Empresas)

```sql
TGFEST.CODEMP → TGFEMP.CODEMP
```

- **Descrição**: Empresa proprietária
- **Cardinalidade**: Muitos-para-1
- **Obrigatório**: Sim

#### 4. **TGFPAR** (Parceiros)

```sql
TGFEST.CODPARC → TGFPAR.CODPARC
```

- **Descrição**: Parceiro (cliente/fornecedor)
- **Cardinalidade**: Muitos-para-1
- **Obrigatório**: Sim (pode ser 0 para próprio)

## 📊 Padrões de Dados

### 🎯 Distribuição por Tipo

- **Próprio (P)**: ~80% dos registros (estoque da empresa)
- **Consignado (C)**: ~15% dos registros (estoque de terceiros)
- **Outros**: ~5% dos registros

### 📦 Controle de Lotes

- **Produtos com Lote**: ~30% (alimentos, químicos, medicamentos)
- **Produtos sem Lote**: ~70% (pecas, ferramentas)
- **Lotes Ativos**: ~90% dos lotes
- **Lotes em Quarentena**: ~5% dos lotes

### 📍 Distribuição por Local

- **Depósito Principal**: ~50% do valor total
- **Locais de Produção**: ~30% do valor total
- **Filiais**: ~15% do valor total
- **Outros**: ~5% do valor total

## 🚀 Funcionalidades Avançadas

### 📊 Conferência de Estoque

#### 1. **Produtos com Estoque Baixo**

```sql
SELECT * FROM TGFEST
WHERE ATIVO = 'S'
  AND ESTOQUE <= ESTMIN
  AND ESTMIN > 0
ORDER BY (ESTMIN - ESTOQUE) DESC
```

**Propósito**: Identificar produtos que precisam de reposição urgente

#### 2. **Produtos com Estoque Alto**

```sql
SELECT * FROM TGFEST
WHERE ATIVO = 'S'
  AND ESTOQUE > ESTMAX
  AND ESTMAX > 0
ORDER BY (ESTOQUE - ESTMAX) DESC
```

**Propósito**: Identificar excessos para liberar capital de giro

#### 3. **Conferência por Local**

```sql
SELECT * FROM TGFEST
WHERE CODLOCAL = @Local
  AND ATIVO = 'S'
ORDER BY CODPROD, CONTROLE
```

**Propósito**: Inventário físico por local

#### 4. **Estoque por Produto**

```sql
SELECT * FROM TGFEST
WHERE CODPROD = @Produto
  AND ATIVO = 'S'
ORDER BY ESTOQUE DESC
```

**Propósito**: Visão consolidada do estoque de um produto

### 📈 Dashboard de Estoque

#### 1. **Métricas Principais**

- Total de produtos com saldo
- Produtos abaixo do mínimo
- Produtos acima do máximo
- Valor total do estoque
- Número de locais ativos

#### 2. **Alertas Críticos**

```sql
-- Produtos sem estoque
SELECT COUNT(*) FROM TGFEST WHERE ESTOQUE <= 0 AND ATIVO = 'S'

-- Produtos críticos (estoque < 10% do mínimo)
SELECT COUNT(*) FROM TGFEST WHERE ESTOQUE < (ESTMIN * 0.1) AND ESTMIN > 0 AND ATIVO = 'S'
```

### 🔍 Análise de Movimentação

#### 1. **Produtos Parados**

```sql
SELECT * FROM TGFEST E
WHERE E.ATIVO = 'S'
  AND E.ESTOQUE > 0
  AND NOT EXISTS (
    SELECT 1 FROM TGFITE I
    INNER JOIN TGFCAB C ON I.NUNOTA = C.NUNOTA
    WHERE I.CODPROD = E.CODPROD
      AND C.DTNEG > DATEADD(MONTH, -3, GETDATE())
  )
```

**Propósito**: Identificar produtos sem giro para limpeza de estoque

#### 2. **Análise de Giro**

```sql
SELECT
  E.CODPROD,
  P.DESCRPROD,
  E.ESTOQUE,
  COUNT(I.CODPROD) as movimentacoes_ultimos_6_meses,
  E.ESTOQUE / NULLIF(COUNT(I.CODPROD), 0) as indice_giro
FROM TGFEST E
LEFT JOIN TGFPRO P ON E.CODPROD = P.CODPROD
LEFT JOIN TGFITE I ON E.CODPROD = I.CODPROD
LEFT JOIN TGFCAB C ON I.NUNOTA = C.NUNOTA
WHERE E.ATIVO = 'S'
  AND C.DTNEG > DATEADD(MONTH, -6, GETDATE())
GROUP BY E.CODPROD, P.DESCRPROD, E.ESTOQUE
ORDER BY indice_giro ASC
```

## 🏗️ Arquitetura de Dados

### ⚡ Otimizações de Performance

#### 1. **Índices Estratégicos**

```sql
-- Índice composto para consultas principais
CREATE INDEX IDX_TGFEST_PRINCIPAL ON TGFEST (CODEMP, CODPROD, CODLOCAL, ATIVO);

-- Índice para controle de estoque
CREATE INDEX IDX_TGFEST_CONTROLE ON TGFEST (ESTOQUE, ESTMIN, ESTMAX) WHERE ATIVO = 'S';

-- Índice para validade
CREATE INDEX IDX_TGFEST_VALIDADE ON TGFEST (DTVAL) WHERE DTVAL IS NOT NULL;

-- Índice para localização
CREATE INDEX IDX_TGFEST_LOCAL ON TGFEST (CODLOCAL, ATIVO);
```

#### 2. **Particionamento**

```sql
-- Particionamento por empresa
ALTER PARTITION FUNCTION PF_TGFEST()
SPLIT RANGE (2, 3, 4); -- Empresas 2, 3, 4
```

#### 3. **Views Otimizadas**

```sql
-- View para conferência rápida
CREATE VIEW VW_ESTOQUE_CONFERENCIA AS
SELECT
  E.CODEMP,
  E.CODPROD,
  P.DESCRPROD,
  E.CODLOCAL,
  L.NOME as NOME_LOCAL,
  E.CONTROLE,
  E.ESTOQUE,
  E.ESTMIN,
  E.ESTMAX,
  E.ATIVO,
  CASE
    WHEN E.ESTOQUE <= 0 THEN 'SEM ESTOQUE'
    WHEN E.ESTOQUE < E.ESTMIN THEN 'BAIXO'
    WHEN E.ESTOQUE > E.ESTMAX THEN 'ALTO'
    ELSE 'NORMAL'
  END as STATUS_ESTOQUE
FROM TGFEST E
INNER JOIN TGFPRO P ON E.CODPROD = P.CODPROD
INNER JOIN TGFLOC L ON E.CODLOCAL = L.CODLOCAL
WHERE E.ATIVO = 'S';
```

### 🔄 Estratégias de Atualização

#### 1. **Controle de Concorrência**

```sql
-- Usar transações para evitar conflitos
BEGIN TRANSACTION

UPDATE TGFEST
SET ESTOQUE = ESTOQUE - @Quantidade
WHERE CODEMP = @Empresa
  AND CODPROD = @Produto
  AND CODLOCAL = @Local
  AND CONTROLE = @Controle
  AND CODPARC = @Parceiro
  AND TIPO = @Tipo

COMMIT TRANSACTION
```

#### 2. **Auditoria de Movimentações**

- Todas as alterações devem ser registradas em AD_GIG_LOG
- Manter histórico de saldos por período
- Rastreabilidade completa de alterações

## 📋 Casos de Uso Comuns

### 📊 Gestão de Estoque

#### 1. **Inventário Físico**

- Listagem por local para conferência
- Comparação física vs sistema
- Ajustes de inventário
- Relatórios de divergências

#### 2. **Controle de Qualidade**

- Lotes em quarentena
- Produtos vencidos
- Controle de pureza/germinação
- Rastreabilidade por lote

#### 3. **Planejamento de Compras**

- Produtos abaixo do mínimo
- Análise de consumo histórico
- Previsão de demanda
- Sugestão automática de pedidos

### 💰 Gestão Financeira

#### 1. **Valorização de Estoque**

- Cálculo de custo médio
- Valor total por local
- Depreciação por validade
- Impacto no balanço patrimonial

#### 2. **Análise de Giro**

- Produtos de lento movimento
- Identificação de excessos
- Otimização de capital de giro
- Redução de obsolescência

### 🏭 Controle de Produção

#### 1. **Matérias-primas**

- Disponibilidade para produção
- Controle de lotes específicos
- Consumo por ordem de produção
- Rastreabilidade completa

#### 2. **Produtos Intermediários**

- Controle em processo
- Qualidade intermediária
- Custos acumulados
- Eficiência produtiva

## 🔧 Manutenção e Governança

### 🛠️ Limpeza de Dados

#### 1. **Saldos Inativos**

```sql
SELECT * FROM TGFEST
WHERE ATIVO = 'N'
  AND ESTOQUE = 0
  AND DTALTER < DATEADD(YEAR, -1, GETDATE())
```

#### 2. **Lotes Vencidos**

```sql
SELECT * FROM TGFEST
WHERE DTVAL < GETDATE()
  AND DTVAL IS NOT NULL
  AND ATIVO = 'S'
```

#### 3. **Saldos Negativos**

```sql
SELECT * FROM TGFEST
WHERE ESTOQUE < 0
  AND ATIVO = 'S'
```

### 📊 Monitoramento

#### 1. **KPIs de Estoque**

- Taxa de atendimento (Service Level)
- Giro de estoque médio
- Valor médio do estoque
- Precisão do inventário

#### 2. **Alertas Automáticos**

- Produtos sem estoque
- Lotes próximos do vencimento
- Excessos críticos
- Movimentações suspeitas

## 🎯 Conclusões

A tabela **TGFEST** é o coração do controle de estoque no Sankhya ERP, oferecendo:

- ✅ **Controle Granular**: Saldos por produto, local, lote e parceiro
- ✅ **Flexibilidade**: Suporte a consignação e diferentes tipos de controle
- ✅ **Qualidade**: Controle de lotes, validade e características
- ✅ **Performance**: Estrutura otimizada para consultas complexas
- ⚠️ **Complexidade**: Chave composta de 6 campos requer atenção especial

**Recomendação**: Implementar índices estratégicos e manter rotinas de limpeza para garantir performance e precisão dos dados de estoque.
