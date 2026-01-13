# Análise Completa da Tabela TGFGRU (Grupos de Produto)

## 📋 Visão Geral da Tabela

**TGFGRU** é a tabela responsável pelos grupos de produto no Sankhya ERP, fornecendo a estrutura hierárquica para classificação de produtos e controle de regras comerciais.

### 🎯 Finalidade do Sistema

- **Classificação Hierárquica**: Estrutura de grupos pai/filho para produtos
- **Controle de Vendas**: Curvas ABC, comissionamento e metas
- **Gestão Empresarial**: Integração com natureza, centro de custo e projetos
- **Regras WMS**: Controle de warehouse e logística
- **Apresentação**: Cores, imagens e configurações visuais

## 📊 Estrutura da Tabela

### 🔑 Chaves Primárias

- **CODGRUPOPROD**: Código único do grupo (INTEGER, NOT NULL)

### 📈 Volume de Dados

- **Registros**: Centenas a milhares dependendo da complexidade da classificação
- **Crescimento**: Moderado, baseado na estrutura organizacional
- **Hierarquia**: Grupos podem ter subgrupos (campo CODGRUPAI)

## 🔍 Campos Principais

### 🏷️ Identificação e Hierarquia

| Campo            | Tipo        | Descrição             | Exemplo         |
| ---------------- | ----------- | --------------------- | --------------- |
| `codgrupoprod`   | INTEGER     | Código único do grupo | 123             |
| `descrgrupoprod` | VARCHAR(30) | Descrição do grupo    | "ELETRÔNICOS"   |
| `codgrupai`      | INTEGER     | Código do grupo pai   | 0 (raiz) ou 123 |
| `grau`           | SMALLINT    | Nível hierárquico     | 1, 2, 3...      |

### 💰 Controle de Vendas e Metas

| Campo            | Tipo  | Descrição                    | Exemplo |
| ---------------- | ----- | ---------------------------- | ------- |
| `limcurva_b`     | FLOAT | Limite superior curva B      | 1000.00 |
| `limcurva_c`     | FLOAT | Limite superior curva C      | 5000.00 |
| `comcurva_a`     | FLOAT | Comissão curva A (%)         | 5.00    |
| `comcurva_b`     | FLOAT | Comissão curva B (%)         | 3.00    |
| `comcurva_c`     | FLOAT | Comissão curva C (%)         | 1.00    |
| `particmeta`     | FLOAT | Participação em meta         | 0.15    |
| `metaqtd`        | FLOAT | Meta quantitativa            | 1000.00 |
| `percmetacontrb` | FLOAT | Percentual contribuição meta | 25.00   |

### 🏢 Configurações Empresariais

| Campo       | Tipo    | Descrição                        | Exemplo        |
| ----------- | ------- | -------------------------------- | -------------- |
| `codnat`    | INTEGER | Código da natureza               | 1              |
| `codcencus` | INTEGER | Centro de custo                  | 1              |
| `codproj`   | INTEGER | Projeto                          | 1              |
| `solcompra` | CHAR(1) | Solicitação automática de compra | "S"            |
| `regrawms`  | CHAR(1) | Regra WMS                        | "O" (Outbound) |
| `analitico` | CHAR(1) | Grupo analítico                  | "S"            |

### 🎨 Apresentação Visual

| Campo      | Tipo        | Descrição       | Exemplo   |
| ---------- | ----------- | --------------- | --------- |
| `corfundo` | VARCHAR(20) | Cor de fundo    | "#FFFFFF" |
| `corfonte` | VARCHAR(20) | Cor da fonte    | "#000000" |
| `imagem`   | IMAGE       | Imagem do grupo | [Blob]    |

### ⚙️ Controles Especiais

| Campo               | Tipo    | Descrição                     | Exemplo |
| ------------------- | ------- | ----------------------------- | ------- |
| `ativo`             | CHAR(1) | Grupo ativo                   | "S"     |
| `aprprodvda`        | CHAR(1) | Aprovação automática p/ venda | "S"     |
| `calrupturaestoque` | CHAR(1) | Calcular ruptura de estoque   | "N"     |
| `temflv`            | CHAR(1) | Tem fluxo de valor            | "N"     |

## 🔗 Relacionamentos

### 📋 Relações Principais

#### 1. **Auto-relacionamento (Hierarquia)**

```sql
TGFGRU.CODGRUPAI → TGFGRU.CODGRUPOPROD
```

- **Descrição**: Estrutura pai/filho dos grupos
- **Cardinalidade**: Muitos-para-1 (opcional)
- **Uso**: Grupos raiz têm CODGRUPAI = 0

#### 2. **Produtos (TGFPRO)**

```sql
TGFPRO.CODGRUPOPROD → TGFGRU.CODGRUPOPROD
```

- **Descrição**: Classificação de produtos por grupo
- **Cardinalidade**: Muitos-para-1
- **Obrigatório**: Sim (todo produto deve ter um grupo)

#### 3. **Naturezas (TGFNAT)**

```sql
TGFGRU.CODNAT → TGFNAT.CODNAT
```

- **Descrição**: Classificação fiscal por natureza
- **Cardinalidade**: Muitos-para-1

#### 4. **Centro de Custo (TSICUS)**

```sql
TGFGRU.CODCENCUS → TSICUS.CODCENCUS
```

- **Descrição**: Alocação de custos por centro
- **Cardinalidade**: Muitos-para-1

#### 5. **Projetos (TCSPRJ)**

```sql
TGFGRU.CODPROJ → TCSPRJ.CODPROJ
```

- **Descrição**: Vinculação com projetos específicos
- **Cardinalidade**: Muitos-para-1

## 📊 Padrões de Dados

### 🎯 Estrutura Hierárquica

- **Grupos Raiz**: CODGRUPAI = 0, GRAU = 1
- **Subgrupos**: CODGRUPAI = código do pai, GRAU > 1
- **Grupos Analíticos**: ANALITICO = 'S' (onde produtos são classificados)
- **Grupos Sintéticos**: ANALITICO = 'N' (apenas organizacionais)

### 💼 Curvas ABC

- **Curva A**: Produtos de alto valor (COMCURVA_A mais alta)
- **Curva B**: Produtos de médio valor (entre LIMCURVA_B e LIMCURVA_C)
- **Curva C**: Produtos de baixo valor (acima de LIMCURVA_C)

### 🏭 Integração WMS

- **Regra 'O'**: Outbound (vendas)
- **Regra 'I'**: Inbound (compras/recebimentos)
- **Regra 'M'**: Movimentação interna

## 🚀 Otimizações e Recomendações

### ⚡ Melhorias de Performance

#### 1. **Índices Recomendados**

```sql
-- Índice para hierarquia
CREATE INDEX IDX_TGFGRU_HIERARQUIA ON TGFGRU (CODGRUPAI, GRAU);

-- Índice para filtros comuns
CREATE INDEX IDX_TGFGRU_DESCR_ATIVO ON TGFGRU (DESCRGRUPOPROD, ATIVO);

-- Índice para integrações empresariais
CREATE INDEX IDX_TGFGRU_EMPRESARIAIS ON TGFGRU (CODNAT, CODCENCUS, CODPROJ);
```

#### 2. **Queries Hierárquicas**

```sql
-- Buscar subgrupos de um grupo pai
WITH GruposHierarquia AS (
    SELECT CODGRUPOPROD, DESCRGRUPOPROD, CODGRUPAI, GRAU, 0 as Nivel
    FROM TGFGRU
    WHERE CODGRUPOPROD = @CodGrupoPai

    UNION ALL

    SELECT G.CODGRUPOPROD, G.DESCRGRUPOPROD, G.CODGRUPAI, G.GRAU, GH.Nivel + 1
    FROM TGFGRU G
    INNER JOIN GruposHierarquia GH ON G.CODGRUPAI = GH.CODGRUPOPROD
)
SELECT * FROM GruposHierarquia ORDER BY Nivel, CODGRUPOPROD;
```

### 🏗️ Estrutura de Dados

#### 1. **Views de Hierarquia**

```sql
-- View para navegação hierárquica
CREATE VIEW VW_GRUPOS_HIERARQUIA AS
SELECT
    G.CODGRUPOPROD,
    G.DESCRGRUPOPROD,
    G.CODGRUPAI,
    G.GRAU,
    G.ATIVO,
    PAI.DESCRGRUPOPROD as DESCRGRUPOPAI,
    G.ANALITICO
FROM TGFGRU G
LEFT JOIN TGFGRU PAI ON G.CODGRUPAI = PAI.CODGRUPOPROD
WHERE G.ATIVO = 'S';
```

#### 2. **Função de Caminho Completo**

```sql
-- Função para obter caminho completo do grupo
CREATE FUNCTION dbo.GetGrupoCaminho(@CodGrupo INT)
RETURNS VARCHAR(1000)
AS
BEGIN
    DECLARE @Caminho VARCHAR(1000) = ''
    DECLARE @CodAtual INT = @CodGrupo

    WHILE @CodAtual > 0
    BEGIN
        SELECT @Caminho = DESCRGRUPOPROD + ' > ' + @Caminho,
               @CodAtual = CODGRUPAI
        FROM TGFGRU
        WHERE CODGRUPOPROD = @CodAtual
    END

    RETURN LEFT(@Caminho, LEN(@Caminho) - 3) -- Remove último ' > '
END
```

## 📋 Casos de Uso Comuns

### 🛍️ Classificação de Produtos

- **Estrutura Hierárquica**: Eletrônicos > Celulares > Smartphones
- **Curvas ABC**: Controle de comissionamento por valor
- **Metas**: Participação por grupo em objetivos de venda

### 📊 Business Intelligence

- **Análise de Vendas**: Performance por grupo hierárquico
- **Margem por Grupo**: Rentabilidade por categoria
- **Forecasting**: Previsão baseada em histórico de grupos

### 🏭 Controle de Produção

- **Estrutura de Custos**: Rateio por centro de custo
- **Controle de Qualidade**: Grupos com regras específicas
- **Logística**: Regras WMS por tipo de produto

### 💰 Gestão Comercial

- **Preços e Descontos**: Regras por grupo de produto
- **Comissionamento**: Curvas ABC por categoria
- **Metas de Venda**: Controle por grupo hierárquico

## 🔧 Manutenção e Governança

### 🛠️ Limpeza de Dados

```sql
-- Grupos inativos sem produtos há mais de 1 ano
SELECT G.CODGRUPOPROD, G.DESCRGRUPOPROD, G.DHALTER
FROM TGFGRU G
WHERE G.ATIVO = 'N'
  AND G.DHALTER < DATEADD(YEAR, -1, GETDATE())
  AND NOT EXISTS (
      SELECT 1 FROM TGFPRO P
      WHERE P.CODGRUPOPROD = G.CODGRUPOPROD
  );

-- Grupos sem hierarquia consistente
SELECT CODGRUPOPROD, DESCRGRUPOPROD, CODGRUPAI
FROM TGFGRU G
WHERE CODGRUPAI > 0
  AND NOT EXISTS (
      SELECT 1 FROM TGFGRU PAI
      WHERE PAI.CODGRUPOPROD = G.CODGRUPAI
  );
```

### 📊 Monitoramento

- **Estrutura Hierárquica**: Grupos órfãos ou mal estruturados
- **Grupos Ativos**: Percentual de grupos utilizados vs total
- **Profundidade**: Média de níveis hierárquicos
- **Balanceamento**: Distribuição de produtos por grupo

## 🎯 Conclusões

A tabela **TGFGRU** é fundamental para a organização do catálogo de produtos no Sankhya ERP, fornecendo:

- ✅ **Hierarquia Robusta**: Estrutura pai/filho flexível
- ✅ **Controle Comercial**: Curvas ABC e metadados de venda
- ✅ **Integração Empresarial**: Conexão com natureza, custos e projetos
- ✅ **Flexibilidade Visual**: Cores e imagens para apresentação

**Recomendação**: Manter estrutura hierárquica consistente e utilizar views para navegação eficiente da árvore de grupos.
