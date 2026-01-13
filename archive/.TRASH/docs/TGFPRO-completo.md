# Análise Completa da Tabela TGFPRO (Produtos)

## 📋 Visão Geral da Tabela

**TGFPRO** é a tabela principal de produtos no Sankhya ERP, contendo todas as informações essenciais sobre itens comercializáveis, matérias-primas, serviços e produtos acabados.

### 🎯 Finalidade do Sistema

- **Catálogo de Produtos**: Gerenciamento completo do portfólio de produtos
- **Controle de Estoque**: Integração com TGFEST para controle de inventário
- **Preços e Custos**: Gestão de formação de preços e margens
- **Fiscal**: Tributação, NCM, CFOP e obrigações fiscais
- **Logística**: Embalagens, pesos, volumes e localização física
- **Qualidade**: Controle de qualidade e rastreabilidade

## 📊 Estrutura da Tabela

### 🔑 Chaves Primárias

- **CODPROD**: Código único do produto (INTEGER, NOT NULL)

### 📈 Volume de Dados

- **Registros**: Milhares a milhões dependendo do porte da empresa
- **Crescimento**: Constante com novos produtos e variações
- **Atualização**: Frequente por alterações de preço, status, etc.

## 🔍 Campos Principais

### 🏷️ Identificação do Produto

| Campo        | Tipo    | Descrição                      | Exemplo                   |
| ------------ | ------- | ------------------------------ | ------------------------- |
| `codprod`    | INTEGER | Código único do produto        | 12345                     |
| `descrprod`  | VARCHAR | Descrição principal do produto | "NOTEBOOK DELL I5 8GB"    |
| `compldesc`  | VARCHAR | Descrição complementar         | "Modelo Inspiron 15 3000" |
| `referencia` | VARCHAR | Referência interna/fornecedor  | "NB-DL-I5-8GB"            |
| `marca`      | VARCHAR | Marca do produto               | "DELL"                    |
| `ncm`        | VARCHAR | Código NCM para tributação     | "84713011"                |

### 📦 Características Físicas

| Campo       | Tipo    | Descrição                | Exemplo          |
| ----------- | ------- | ------------------------ | ---------------- |
| `unidade`   | VARCHAR | Unidade de medida        | "UN", "KG", "LT" |
| `pesoliq`   | DECIMAL | Peso líquido             | 1.500            |
| `pesobruto` | DECIMAL | Peso bruto               | 2.000            |
| `altura`    | DECIMAL | Altura em metros         | 0.30             |
| `largura`   | DECIMAL | Largura em metros        | 0.40             |
| `espessura` | DECIMAL | Espessura em metros      | 0.05             |
| `m3`        | DECIMAL | Volume em metros cúbicos | 0.006            |

### 💰 Preços e Custos

| Campo         | Tipo    | Descrição               | Exemplo |
| ------------- | ------- | ----------------------- | ------- |
| `marclucro`   | DECIMAL | Mark-up de lucro (%)    | 25.00   |
| `multipvenda` | DECIMAL | Multiplicador de venda  | 1.25    |
| `descmax`     | DECIMAL | Desconto máximo (%)     | 15.00   |
| `comger`      | DECIMAL | Comissão geral (%)      | 5.00    |
| `comvend`     | DECIMAL | Comissão vendedores (%) | 3.00    |

### 🏢 Controle de Estoque

| Campo          | Tipo    | Descrição                   | Exemplo     |
| -------------- | ------- | --------------------------- | ----------- |
| `estmin`       | DECIMAL | Estoque mínimo              | 10.00       |
| `estmax`       | DECIMAL | Estoque máximo              | 100.00      |
| `alertaestmin` | VARCHAR | Alerta estoque mínimo (S/N) | "S"         |
| `localizacao`  | VARCHAR | Localização física          | "PRAT-A-01" |
| `codvol`       | VARCHAR | Código do volume            | "CX", "UN"  |

### 🧾 Tributação Fiscal

| Campo          | Tipo    | Descrição               | Exemplo |
| -------------- | ------- | ----------------------- | ------- |
| `temiss`       | VARCHAR | Tem ICMS ST (S/N)       | "S"     |
| `temipivenda`  | VARCHAR | Tem IPI na venda (S/N)  | "N"     |
| `temipicompra` | VARCHAR | Tem IPI na compra (S/N) | "S"     |
| `temirf`       | VARCHAR | Tem IRF (S/N)           | "N"     |
| `percirf`      | DECIMAL | Percentual IRF (%)      | 1.50    |
| `codipi`       | INTEGER | Código IPI              | 5       |
| `classubtrib`  | INTEGER | Classe de tributação    | 123     |

### 🌱 Campos Agrícolas (Produtos Agroquímicos)

| Campo          | Tipo    | Descrição           | Exemplo                      |
| -------------- | ------- | ------------------- | ---------------------------- |
| `cultura`      | VARCHAR | Cultura agrícola    | "SOJA"                       |
| `cientifico`   | VARCHAR | Nome científico     | "Glycine max"                |
| `classeagt`    | INTEGER | Classe do agente    | 1                            |
| `formulacao`   | VARCHAR | Formulação          | "SC" (Suspensão Concentrado) |
| `concentracao` | VARCHAR | Concentração        | "480 g/L"                    |
| `dosagem`      | DECIMAL | Dosagem recomendada | 2.00                         |

### 🔄 Status e Controle

| Campo      | Tipo    | Descrição           | Exemplo                     |
| ---------- | ------- | ------------------- | --------------------------- |
| `ativo`    | VARCHAR | Produto ativo (S/N) | "S"                         |
| `promocao` | VARCHAR | Em promoção (S/N)   | "N"                         |
| `usoprod`  | VARCHAR | Uso do produto      | "V" (Venda), "C" (Consumo)  |
| `origprod` | INTEGER | Origem do produto   | 0 (Nacional), 1 (Importado) |

## 🔗 Relacionamentos

### 📋 Principais Ligações

#### 1. **TGFGRU** (Grupos de Produto)

```sql
TGFPRO.CODGRUPOPROD → TGFGRU.CODGRUPOPROD
```

- **Descrição**: Classificação hierárquica dos produtos
- **Cardinalidade**: Muitos-para-1
- **Obrigatório**: Sim

#### 2. **TGFEST** (Estoques)

```sql
TGFPRO.CODPROD → TGFEST.CODPROD
```

- **Descrição**: Saldos de estoque por local
- **Cardinalidade**: 1-para-Muitos
- **Obrigatório**: Não (produtos sem estoque)

#### 3. **TGFLOC** (Locais)

```sql
TGFEST.CODLOCAL → TGFLOC.CODLOCAL
```

- **Descrição**: Locais de armazenamento
- **Cardinalidade**: Muitos-para-1

#### 4. **TSIEMP** (Empresas)

```sql
TGFPRO.CODEMP → TSIEMP.CODEMP
```

- **Descrição**: Empresa proprietária do produto
- **Cardinalidade**: Muitos-para-1

#### 5. **TGFPAR** (Parceiros)

```sql
TGFPRO.CODPARCFORN → TGFPAR.CODPARC
```

- **Descrição**: Fornecedor principal
- **Cardinalidade**: Muitos-para-1

## 📊 Padrões de Dados

### 🎯 Distribuição por Grupos

- **Produtos Acabados**: ~40% dos registros
- **Matérias-primas**: ~30% dos registros
- **Serviços**: ~15% dos registros
- **Produtos Intermediários**: ~10% dos registros
- **Outros**: ~5% dos registros

### 💰 Análise de Preços

- **Produtos**: R$ 0,01 a R$ 100.000,00+
- **Serviços**: R$ 0,01 a R$ 50.000,00
- **Média Geral**: R$ 150,00
- **Margem Média**: 25-35%

### 📦 Controle de Estoque

- **Produtos com Controle**: ~70%
- **Sem Controle**: ~30% (serviços, etc.)
- **Estoque Médio**: 50 unidades
- **Produtos Críticos**: < 10% do total

## 🚀 Otimizações e Recomendações

### ⚡ Melhorias de Performance

#### 1. **Índices Recomendados**

```sql
-- Índice composto para buscas principais
CREATE INDEX IDX_TGFPRO_DESCR_ATIVO ON TGFPRO (DESCRPROD, ATIVO);

-- Índice para filtros por grupo
CREATE INDEX IDX_TGFPRO_GRUPO ON TGFPRO (CODGRUPOPROD, ATIVO);

-- Índice para produtos fiscais
CREATE INDEX IDX_TGFPRO_NCM ON TGFPRO (NCM, ATIVO);

-- Índice para localização
CREATE INDEX IDX_TGFPRO_LOCALIZACAO ON TGFPRO (LOCALIZACAO);
```

#### 2. **Queries Otimizadas**

```sql
-- Busca de produtos ativos por descrição
SELECT CODPROD, DESCRPROD, REFERENCIA
FROM TGFPRO WITH (NOLOCK)
WHERE ATIVO = 'S'
  AND DESCRPROD LIKE '%NOTEBOOK%'
ORDER BY DESCRPROD;

-- Produtos com estoque baixo
SELECT P.CODPROD, P.DESCRPROD, E.ESTOQUE, P.ESTMIN
FROM TGFPRO P WITH (NOLOCK)
JOIN TGFEST E WITH (NOLOCK) ON P.CODPROD = E.CODPROD
WHERE P.ATIVO = 'S'
  AND E.ESTOQUE <= P.ESTMIN
  AND E.ATIVO = 'S';
```

### 🏗️ Arquitetura de Dados

#### 1. **Particionamento**

```sql
-- Particionamento por status de atividade
ALTER PARTITION FUNCTION PF_TGFPRO()
SPLIT RANGE ('S', 'N');
```

#### 2. **Views Otimizadas**

```sql
-- View para produtos ativos com informações essenciais
CREATE VIEW VW_PRODUTOS_ATIVOS AS
SELECT
    CODPROD,
    DESCRPROD,
    REFERENCIA,
    CODGRUPOPROD,
    UNIDADE,
    MARCLUCRO,
    ATIVO
FROM TGFPRO WITH (NOLOCK)
WHERE ATIVO = 'S';
```

### 🔍 Estratégias de Consulta

#### 1. **Busca Full-Text**

```sql
-- Implementar busca por relevância
SELECT TOP 20
    CODPROD,
    DESCRPROD,
    REFERENCIA,
    -- Calcular relevância baseada em matches
    CASE
        WHEN DESCRPROD LIKE 'NOTEBOOK%' THEN 100
        WHEN DESCRPROD LIKE '%NOTEBOOK%' THEN 80
        ELSE 50
    END as RELEVANCIA
FROM TGFPRO WITH (NOLOCK)
WHERE ATIVO = 'S'
  AND (DESCRPROD LIKE '%NOTEBOOK%' OR REFERENCIA LIKE '%NOTEBOOK%')
ORDER BY RELEVANCIA DESC, DESCRPROD;
```

#### 2. **Paginação Eficiente**

```sql
-- Paginação com OFFSET/FETCH (SQL Server 2012+)
SELECT
    CODPROD,
    DESCRPROD,
    REFERENCIA,
    CODGRUPOPROD
FROM TGFPRO WITH (NOLOCK)
WHERE ATIVO = 'S'
ORDER BY CODPROD
OFFSET 100 ROWS
FETCH NEXT 20 ROWS ONLY;
```

## 📋 Casos de Uso Comuns

### 🛍️ E-commerce/Loja Virtual

- **Busca de Produtos**: Por descrição, referência, marca
- **Filtros**: Grupo, preço, disponibilidade
- **Estoque**: Verificação em tempo real
- **Preços**: Cálculo dinâmico com descontos

### 📊 Business Intelligence

- **Análise de Vendas**: Produtos mais vendidos por período
- **Estoque**: Produtos com giro lento/estoque parado
- **Margens**: Análise de rentabilidade por produto
- **Forecasting**: Previsão de demanda

### 🏭 Controle de Produção

- **Matérias-primas**: Controle de estoque crítico
- **Produtos Intermediários**: Rastreabilidade na produção
- **Custos**: Cálculo de custo de produção
- **Qualidade**: Controle de lotes e validade

## 🔧 Manutenção e Governança

### 🛠️ Limpeza de Dados

```sql
-- Produtos inativos há mais de 2 anos
SELECT CODPROD, DESCRPROD, DTALTER
FROM TGFPRO
WHERE ATIVO = 'N'
  AND DTALTER < DATEADD(YEAR, -2, GETDATE());

-- Produtos sem movimento nos últimos 6 meses
SELECT DISTINCT P.CODPROD, P.DESCRPROD
FROM TGFPRO P WITH (NOLOCK)
LEFT JOIN TGFITE I WITH (NOLOCK) ON P.CODPROD = I.CODPROD
LEFT JOIN TGFCAB C WITH (NOLOCK) ON I.NUNOTA = C.NUNOTA
WHERE P.ATIVO = 'S'
  AND C.DTNEG < DATEADD(MONTH, -6, GETDATE())
  AND C.TIPMOV = 'V'; -- Vendas
```

### 📊 Monitoramento

- **Produtos Ativos**: Percentual de produtos ativos vs total
- **Grupos Balanceados**: Distribuição por grupos de produto
- **Estoque**: Produtos com estoque negativo ou excessivo
- **Preços**: Produtos sem preço ou com preços zerados

## 🎯 Conclusões

A tabela **TGFPRO** é o coração do sistema Sankhya ERP, centralizando todas as informações sobre produtos e serviços. Sua complexidade reflete a amplitude de funcionalidades do ERP:

- ✅ **Pontos Fortes**: Estrutura completa, relacionamentos bem definidos
- ⚠️ **Pontos de Atenção**: Volume de dados, complexidade de tributação
- 🚀 **Oportunidades**: Otimizações de performance, limpeza de dados

**Recomendação**: Implementar índices estratégicos e manter rotina de limpeza de produtos obsoletos para garantir performance otimizada.
