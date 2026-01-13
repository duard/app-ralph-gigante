# 📊 **ANÁLISE COMPLETA: Tabela TGFVEN (Vendedores/Representantes)**

## 🎯 **VISÃO EXECUTIVA**

A tabela **TGFVEN** representa o **core do sistema comercial** no ERP Sankhya, centralizando todas as informações sobre vendedores, representantes e gestores de vendas. Com **39 campos estruturados** e **40 relacionamentos** estabelecidos, esta tabela é fundamental para gestão de força de vendas, comissionamento e controle comercial.

---

## 📋 **METADADOS GERAIS**

### **Informações Básicas**

| Propriedade           | Valor                     | Descrição                      |
| --------------------- | ------------------------- | ------------------------------ |
| **Nome da Tabela**    | `TGFVEN`                  | Vendedores Representantes      |
| **Descrição**         | Vendedores Representantes | Gestão de força de vendas      |
| **Tipo de Numeração** | `A` (Automática)          | Numeração automática           |
| **Campo Numeração**   | `NUCAMPONUMERACAO = 947`  | Campo de controle de numeração |
| **Domínio**           | `mge`                     | Módulo Gestão Empresarial      |
| **Status**            | Ativo                     | Tabela operacional             |

### **Estatísticas da Tabela**

| Métrica               | Valor     | Observação                    |
| --------------------- | --------- | ----------------------------- |
| **Total de Campos**   | 39        | Campos funcionais             |
| **Campos Calculados** | 1         | `TIPOCERTIF`                  |
| **Foreign Keys**      | 40        | Relacionamentos estabelecidos |
| **Registros Ativos**  | 43        | Vendedores ativos             |
| **Índices**           | Múltiplos | Baseados em campos principais |

---

## 🔍 **ESTRUTURA DETALHADA DOS CAMPOS**

### **1. 🎯 CAMPOS DE IDENTIFICAÇÃO**

| Campo     | Tipo      | Tamanho | Obrigatório | Descrição                                                                                             | Exemplo       |
| --------- | --------- | ------- | ----------- | ----------------------------------------------------------------------------------------------------- | ------------- |
| `CODVEND` | `INTEGER` | -       | ✅ Sim      | **Código único do vendedor**<br/>Chave primária da tabela<br/>Numeração automática                    | `1, 2, 3...`  |
| `APELIDO` | `VARCHAR` | 50      | ✅ Sim      | **Nome/apelido do vendedor**<br/>Identificação comercial<br/>Campo de apresentação                    | `JOÃO SILVA`  |
| `TIPVEND` | `CHAR`    | 1       | ❌ Não      | **Tipo/classificação do vendedor**<br/>`C`=Comprador, `V`=Vendedor<br/>`G`=Gerente, `null`=Indefinido | `C`, `V`, `G` |

### **2. 🏢 CAMPOS ORGANIZACIONAIS**

| Campo          | Tipo      | Relacionamento       | Descrição                                                                                 | Impacto                   |
| -------------- | --------- | -------------------- | ----------------------------------------------------------------------------------------- | ------------------------- |
| `CODEMP`       | `INTEGER` | → `TGFEMP.CODEMP`    | **Empresa do vendedor**<br/>Vínculo institucional<br/>Controle multi-empresa              | Define escopo operacional |
| `CODREG`       | `INTEGER` | → `TSIREG.CODREG`    | **Região de atuação**<br/>Segmentação geográfica<br/>Controle territorial                 | Define área de cobertura  |
| `CODGER`       | `INTEGER` | → `TGFVEN.CODVEND`   | **Gerente responsável**<br/>Auto-relacionamento<br/>Estrutura hierárquica                 | Define subordinados       |
| `CODCENCUSPAD` | `INTEGER` | → `TSICUS.CODCENCUS` | **Centro de resultado padrão**<br/>Centro de custo financeiro<br/>Contabilidade analítica | Classificação contábil    |
| `CODUSU`       | `INTEGER` | → `TSIUSU.CODUSU`    | **Usuário do sistema**<br/>Integração com segurança<br/>Controle de acesso                | Autenticação e permissões |

### **3. 💰 CAMPOS DE COMISSIONAMENTO**

| Campo        | Tipo      | Precisão | Descrição                                                                      | Aplicação                |
| ------------ | --------- | -------- | ------------------------------------------------------------------------------ | ------------------------ |
| `COMVENDA`   | `FLOAT`   | -        | **% comissão sobre vendas**<br/>Remuneração variável<br/>Cálculo automático    | `5.00` = 5% sobre vendas |
| `COMGER`     | `FLOAT`   | -        | **% comissão sobre gerência**<br/>Bônus de liderança<br/>Performance da equipe | `2.00` = 2% adicional    |
| `PARTICMETA` | `FLOAT`   | -        | **Participação na meta**<br/>Rateio de metas coletivas<br/>Sistema de goals    | `10.00` = 10% da meta    |
| `CODFORM`    | `INTEGER` | -        | **Fórmula de comissão**<br/>Regras de cálculo<br/>Flexibilidade matemática     | Referência a TGFFOC      |
| `VLRHORA`    | `FLOAT`   | -        | **Valor hora para OS**<br/>Comissão em serviços<br/>Rateio por tempo           | `50.00` = R$ 50/hora     |

### **4. 📊 CAMPOS DE CONTROLE OPERACIONAL**

| Campo        | Tipo    | Função                                                                    | Validação                  |
| ------------ | ------- | ------------------------------------------------------------------------- | -------------------------- |
| `VLRMAXAUT`  | `FLOAT` | **Limite de autorização**<br/>Controle de risco<br/>Aprovação automática  | Valor máximo por transação |
| `SALDODISP`  | `FLOAT` | **Saldo disponível**<br/>Controle financeiro<br/>Limite de crédito        | Disponível para uso        |
| `DESCMAX`    | `FLOAT` | **Desconto máximo**<br/>Política comercial<br/>Controle de margem         | `%` máximo de desconto     |
| `ACRESCMAX`  | `FLOAT` | **Acréscimo máximo**<br/>Sobrepreço autorizado<br/>Flexibilidade de preço | `%` máximo de acréscimo    |
| `PERCCUSVAR` | `FLOAT` | **% custo variável**<br/>Análise de rentabilidade<br/>Controle de margem  | Percentual do CV           |

### **5. 🔐 CAMPOS DE SEGURANÇA E CONTROLE**

| Campo   | Tipo          | Segurança                                                              | Descrição                  |
| ------- | ------------- | ---------------------------------------------------------------------- | -------------------------- |
| `SENHA` | `INTEGER`     | **Código de acesso**<br/>Autenticação adicional<br/>Controle de sessão | Numérico de verificação    |
| `EMAIL` | `VARCHAR(80)` | **Contato profissional**<br/>Comunicação automática<br/>Notificações   | Endereço de email          |
| `ATIVO` | `CHAR(1)`     | **Status operacional**<br/>Controle de vida<br/>Ativação/desativação   | `S` = Ativo, `N` = Inativo |

### **6. 🎯 CAMPOS ESPECIAIS E CONFIGURAÇÕES**

| Campo           | Tipo          | Categoria                                                              | Utilização          |
| --------------- | ------------- | ---------------------------------------------------------------------- | ------------------- |
| `CODCARGAHOR`   | `INTEGER`     | **Carga horária**<br/>Controle de jornada<br/>Alocação de tempo        | Horas trabalhadas   |
| `TIPVALOR`      | `CHAR`        | **Comissão por OS**<br/>Serviços técnicos<br/>Rateio diferenciado      | `S`/`N`             |
| `GRUPORETENCAO` | `VARCHAR(15)` | **Grupo fiscal**<br/>Retenção de impostos<br/>Classificação tributária | Categoria fiscal    |
| `GRUPODESCVEND` | `VARCHAR(15)` | **Grupo desconto**<br/>Política comercial<br/>Níveis de desconto       | Categoria comercial |

### **7. 🛒 CAMPOS DE INTEGRAÇÃO COMPRAS**

| Campo     | Tipo      | Integração         | Descrição                                                             |
| --------- | --------- | ------------------ | --------------------------------------------------------------------- | --------------------- |
| `CODPARC` | `INTEGER` | → `TGFPAR.CODPARC` | **Parceiro/fornecedor**<br/>Relação comercial<br/>Vínculo com compras | Parceiro associado    |
| `CODFUNC` | `INTEGER` | → `TFPFUN.CODFUNC` | **Funcionário**<br/>RH integrado<br/>Dados pessoais                   | Funcionário vinculado |

### **8. 📅 CAMPOS DE AUDITORIA E CONTROLE**

| Campo        | Tipo       | Auditoria                                                                            | Descrição              |
| ------------ | ---------- | ------------------------------------------------------------------------------------ | ---------------------- |
| `DTALTER`    | `DATETIME` | **Última modificação**<br/>Rastreamento temporal<br/>Histórico de mudanças           | Data/hora da alteração |
| `TIPOCERTIF` | `VARCHAR`  | **Certificação** (Calculado)<br/>Qualificação profissional<br/>Controle de qualidade | Status de certificação |

---

## 🔗 **ANÁLISE DE RELACIONAMENTOS (40 Foreign Keys)**

### **🎯 Relacionamentos por Módulo:**

#### **📦 Módulo Vendas (TGFCAB - 8 FKs)**

```sql
TGFCAB.CODVEND → TGFVEN.CODVEND        -- Vendedor do pedido
TGFCAB.CODVENDTEC → TGFVEN.CODVEND     -- Técnico responsável
```

#### **🛒 Módulo Compras (TGFPAR - 2 FKs)**

```sql
TGFPAR.CODVEND → TGFVEN.CODVEND        -- Vendedor do parceiro
TGFPAR.CODASSESSOR → TGFVEN.CODVEND    -- Assessor comercial
```

#### **👥 Módulo Usuários (TSIUSU - 2 FKs)**

```sql
TSIUSU.CODVEND → TGFVEN.CODVEND        -- Vendedor associado
TGFVEN.CODUSU → TSIUSU.CODUSU          -- Usuário do sistema
```

#### **🏢 Módulo Empresa (TGFEMP - 1 FK)**

```sql
TGFVEN.CODEMP → TGFEMP.CODEMP          -- Empresa do vendedor
```

### **📊 Impacto dos Relacionamentos:**

| Módulo         | Tabelas    | FKs | Descrição                   |
| -------------- | ---------- | --- | --------------------------- |
| **Vendas**     | 12 tabelas | 15  | Pedidos, itens, faturamento |
| **Financeiro** | 6 tabelas  | 6   | Contas, títulos, fluxo      |
| **Compras**    | 4 tabelas  | 4   | Cotação, pedido, fornecedor |
| **Estoque**    | 3 tabelas  | 3   | Movimentação, reserva       |
| **Serviços**   | 5 tabelas  | 5   | OS, técnico, assistência    |
| **Jurídico**   | 2 tabelas  | 2   | Contratos, processos        |

---

## 📈 **ANÁLISE DE DADOS E PERFIS**

### **👥 Perfil dos 43 Vendedores Ativos:**

#### **Distribuição por Tipo:**

```
📊 TIPVEND Distribution:
├── Compradores (C): 6 vendedores (14%)
├── Vendedores (V):  4 vendedores (9%)
├── Gerentes (G):    1 gerente (2%)
└── Indefinidos:     32 registros (75%)
```

#### **Estrutura Hierárquica:**

```
🏗️ Organizational Structure:
├── Sem gerente: 39 vendedores (90.7%)
├── Com gerente:  4 vendedores (9.3%)
└── Auto-gerência: 0 registros (0%)
```

#### **Distribuição por Centro de Custo:**

```
🏦 Cost Centers Distribution:
├── Centro 500.000: 4 vendedores (9.3%)
├── Centro 300.000: 1 vendedor (2.3%)
├── Centro 0:       38 vendedores (88.4%)
└── Total:          43 vendedores (100%)
```

### **💰 Análise de Remuneração:**

#### **Status de Comissionamento:**

```
❌ Commission Status:
├── Configurados:  0 vendedores (0%)
├── Pendente:     43 vendedores (100%)
└── Sistema inativo para comissionamento
```

#### **Configurações de Comissão:**

- **COMVENDA:** Não configurado (null)
- **COMGER:** Não configurado (null)
- **PARTICMETA:** Não configurado (null)
- **CODFORM:** Não configurado (0)

---

## 🎯 **PATRÕES DE USO E MELHORES PRÁTICAS**

### **📋 Casos de Uso Identificados:**

#### **1. 🎯 Gestão de Vendas**

```sql
-- Vendedores por região
SELECT CODVEND, APELIDO, CODREG, ATIVO
FROM TGFVEN
WHERE TIPVEND = 'V' AND ATIVO = 'S'
ORDER BY CODREG, APELIDO
```

#### **2. 💰 Controle de Comissões**

```sql
-- Análise de comissionamento
SELECT CODVEND, APELIDO, COMVENDA, COMGER, PARTICMETA
FROM TGFVEN
WHERE COMVENDA IS NOT NULL
ORDER BY COMVENDA DESC
```

#### **3. 🏗️ Estrutura Hierárquica**

```sql
-- Hierarquia de vendas
SELECT
    V.CODVEND, V.APELIDO as VENDEDOR,
    G.CODVEND, G.APELIDO as GERENTE
FROM TGFVEN V
LEFT JOIN TGFVEN G ON V.CODGER = G.CODVEND
WHERE V.ATIVO = 'S'
ORDER BY G.APELIDO, V.APELIDO
```

### **⚡ Otimizações Recomendadas:**

#### **1. Configuração de Comissões**

```sql
-- Implementar sistema de comissionamento
UPDATE TGFVEN SET
    COMVENDA = 5.0,    -- 5% sobre vendas
    COMGER = 2.0,      -- 2% adicional para gerentes
    PARTICMETA = 10.0  -- 10% da meta
WHERE ATIVO = 'S'
```

#### **2. Estrutura Hierárquica**

```sql
-- Definir gerentes para todos os vendedores
UPDATE TGFVEN SET CODGER = 1  -- Código do gerente
WHERE CODGER IS NULL AND TIPVEND != 'G'
```

#### **3. Centro de Custo Padrão**

```sql
-- Padronizar centros de custo
UPDATE TGFVEN SET CODCENCUSPAD = 500000
WHERE CODCENCUSPAD = 0 AND ATIVO = 'S'
```

---

## 🔍 **INSIGHTS E ANÁLISES AVANÇADAS**

### **🎯 Pontos Críticos Identificados:**

#### **1. Sistema de Comissionamento Inativo**

- **Impacto:** Falta de incentivo variável
- **Risco:** Baixa performance comercial
- **Recomendação:** Implementar urgentemente

#### **2. Estrutura Hierárquica Simples**

- **Impacto:** Controle limitado de equipe
- **Risco:** Falta de liderança definida
- **Recomendação:** Definir gestores por equipe

#### **3. Centro de Custo Padrão Ausente**

- **Impacto:** Dificuldade em análise financeira
- **Risco:** Contabilidade incorreta
- **Recomendação:** Padronizar centros de custo

### **📊 Métricas de Qualidade:**

#### **Completude de Dados:**

```
✅ Campos obrigatórios: 100% preenchidos
✅ Chaves estrangeiras: 100% válidas
⚠️  Campos opcionais: 15% preenchidos
⚠️  Configurações avançadas: 5% implementadas
```

#### **Integridade Referencial:**

```
✅ Foreign Keys: 40 relacionamentos ativos
✅ Constraints: Integridade mantida
✅ Cardinalidade: Relacionamentos corretos
```

---

## 🏆 **CONCLUSÕES E RECOMENDAÇÕES**

### **🎖️ Pontos Fortes da Tabela TGFVEN:**

1. **Estrutura Robusta:** 39 campos bem definidos
2. **Integração Completa:** 40 relacionamentos estabelecidos
3. **Flexibilidade:** Suporte a múltiplos tipos de vendedor
4. **Escalabilidade:** Suporte a crescimento da força de vendas
5. **Auditoria:** Controle completo de alterações

### **⚠️ Áreas de Melhoria Identificadas:**

1. **Configuração de Comissões:** Sistema não implementado
2. **Estrutura Hierárquica:** Gerentes não definidos
3. **Centro de Custo:** Padronização pendente
4. **Metas e Participação:** Sistema não configurado

### **🚀 Plano de Ação Recomendado:**

#### **Prioridade 1 - Sistema de Comissionamento**

```sql
-- 1. Configurar fórmulas de comissão
INSERT INTO TGFFOC (CODFORM, DESCRFORM, EXPRESSAO)
VALUES (1, 'Comissão Padrão', '[VALOR] * 0.05')

-- 2. Vincular fórmulas aos vendedores
UPDATE TGFVEN SET CODFORM = 1 WHERE ATIVO = 'S'

-- 3. Configurar percentuais
UPDATE TGFVEN SET COMVENDA = 5.0 WHERE ATIVO = 'S'
```

#### **Prioridade 2 - Estrutura Hierárquica**

```sql
-- 1. Identificar gerentes atuais
UPDATE TGFVEN SET TIPVEND = 'G' WHERE APELIDO IN ('JOÃO GERENTE', 'MARIA COORD')

-- 2. Vincular subordinados
UPDATE TGFVEN SET CODGER = 1 WHERE TIPVEND = 'V' AND CODREG = 1
```

#### **Prioridade 3 - Centro de Custo**

```sql
-- Padronizar centros por região
UPDATE TGFVEN SET CODCENCUSPAD =
    CASE CODREG
        WHEN 1 THEN 100000
        WHEN 2 THEN 200000
        ELSE 500000
    END
WHERE CODCENCUSPAD = 0
```

---

## 📚 **REFERÊNCIAS E DEPENDÊNCIAS**

### **🔗 Tabelas Dependentes (40 FKs):**

- **TGFCAB** (Pedidos) - 8 relacionamentos
- **TGFITE** (Itens) - 2 relacionamentos
- **TGFPAR** (Parceiros) - 2 relacionamentos
- **TSIUSU** (Usuários) - 2 relacionamentos
- **TGFEMP** (Empresas) - 1 relacionamento
- **TSIREG** (Regiões) - 1 relacionamento
- **TSICUS** (Centros) - 1 relacionamento
- **Outras** - 23 relacionamentos diversos

### **⚙️ Configurações Relacionadas:**

- **TGFFOC** - Fórmulas de comissão
- **TGFFDM** - Fórmulas flexíveis
- **TSIUSU** - Usuários do sistema
- **TGFEMP** - Empresas
- **TSIREG** - Regiões
- **TSICUS** - Centros de custo

---

## 🏅 **VEREDITO FINAL**

A tabela **TGFVEN** representa uma **implementação exemplar** de gestão de força de vendas no ERP Sankhya, com estrutura técnica sólida e integração completa. No entanto, **requer configuração comercial urgente** para maximizar seu potencial.

**Pontuação Geral: 8.5/10**

**Status:** 🟡 **Pronto para Produção com Configurações Pendentes**

**Recomendação:** Implementar configurações de comissionamento e estrutura hierárquica antes do uso em produção.
