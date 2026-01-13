# Análise de Giro de Estoque - Sankhya ERP

**Data da Análise:** 2025-01-01  
**Versão:** 1.0  
**Status:** Documentação Técnica Completa

---

## 1. Introdução

Este documento detalha a estrutura, análise e implementação do módulo de giro de estoque para uma empresa de **serviços de veículos**, que compra peças e materiais para manutenção automotiva.

### 1.1 Contexto da Empresa

- **Atuação:** Serviços de manutenção de veículos (frota própria e terceiros)
- **Fluxo:** Compra de peças → Estoque → Consumo em manutenções
- **Necessidade:** Planejar giro de estoque para otimizar capital de giro e evitar rupturas

### 1.2 Definições Importantes

- **Giro de Estoque:** Quantas vezes o estoque é renovado em determinado período
- **Fórmula:** `Giro = Consumo no Período / Estoque Médio`
- **Objetivo:** Identificar produtos parados, alto giro e prevenir rupturas em manutenções

---

## 2. Estrutura do Sankhya para Giro de Estoque

### 2.1 Tabelas Principais

| Tabela     | Função              | Campos Chave                                           |
| ---------- | ------------------- | ------------------------------------------------------ |
| **TGFTOP** | Tipos de Operação   | CODTIPOPER, TIPMOV, ATUALEST, DESCROPER, GRUPO         |
| **TGFCAB** | Cabeçalhos de Notas | NUNOTA, CODEMP, CODTIPOPER, DTMOV, STATUSNOTA, CODPARC |
| **TGFITE** | Itens das Notas     | CODPROD, QTDNEG, VLRTOT, NUNOTA                        |
| **TGFEST** | Saldo de Estoque    | CODPROD, CODLOCAL, ESTOQUE, ESTMIN, ESTMAX             |
| **TGFPRO** | Produtos            | CODPROD, DESCRPROD, CODPROD, CODPROD                   |
| **TGFGRU** | Grupos de Produtos  | CODPROD, DESCRGRUPOPROD                                |

### 2.2 Conceito de ATUALEST (Regra de Ouro)

> **O que define se entra ou sai do estoque é o TOP (TGFTOP), não o tipo de nota.**

| Valor ATUALEST | Significado  | Efeito no Estoque             |
| -------------- | ------------ | ----------------------------- |
| **'E'**        | Entrada      | Aumenta estoque (Compras)     |
| **'B'**        | Baixa/Saída  | Diminui estoque (Requisições) |
| **'S'**        | Atualiza     | Pode ser entrada ou saída     |
| **'N'**        | Não atualiza | Apenas registro/sem estoque   |

### 2.3 Tipos de Movimento (TIPMOV)

| TIPMOV | Significado          | Uso Típico                        |
| ------ | -------------------- | --------------------------------- |
| 'O'    | Pedido de Compra     | Apenas pedido (não entra estoque) |
| 'C'    | Compra               | Entrada de mercadorias            |
| 'Q'    | Requisição           | Saída para consumo interno        |
| 'V'    | Venda                | Saída para cliente                |
| 'T'    | Transferência        | Movimentação entre locais         |
| 'L'    | Devolução Requisição | Retorno de consumo                |

---

## 3. Análise dos Tipos de Operação (TOPS)

### 3.1 ENTRADAS - Compras que Afetam Estoque (ATUALEST='E')

| CODTIPOPER | DESCROPER                              | GRUPO          | Uso                            |
| ---------- | -------------------------------------- | -------------- | ------------------------------ |
| **200**    | COMPRA - REVENDA                       | Compras        | Revenda                        |
| **201**    | COMPRA - USO/CONSUMO - COM MOV ESTOQUE | Compras        | **Principal para manutenções** |
| **202**    | COMPRA - SERVIÇO PJ                    | Compras        | Serviços PJ                    |
| **203**    | COMPRA - NACIONALIZAÇÃO                | Compras        | Importação                     |
| **204**    | COMPRA - MD-E                          | Compras        | MD-E                           |
| **205**    | COMPRA POR XML                         | Compras        | Via XML                        |
| **206**    | COMPRA - CT-E                          | Compras        | Frete                          |
| **207**    | COMPRA - ENERGIA ELÉTRICA              | Compras        | Energia                        |
| **208**    | COMPRA - TELECOMUNICAÇÕES              | Compras        | Telecom                        |
| **209**    | COMPRA - IMOBILIZADO                   | Compras        | Imobilizado                    |
| **214**    | COMPRA - MATÉRIA PRIMA                 | Compras        | MP                             |
| **222**    | COMPRA PECAS (GF) COM ESTOQUE          | Compras        | **Peças para estoque**         |
| **223**    | COMPRA COMBUSTIVEL (GF)                | Compras        | Combustível                    |
| **224**    | COMPRA PNEU                            | Compras        | Pneus                          |
| **231**    | COMPRAS - FECHAMENTO ROMANEIO (MENSAL) | Compras Mensal | Romaneio                       |

### 3.2 SAÍDAS - Requisições que Afetam Estoque (ATUALEST='B')

| CODTIPOPER | DESCROPER                               | GRUPO         | Observação       |
| ---------- | --------------------------------------- | ------------- | ---------------- |
| **501**    | REQUISIÇÃO MATERIAIS ESTOQUE ALMOX (GF) | Requisição    | **Almoxarifado** |
| **502**    | REQUISIÇÃO SERVICO (GF)                 | Requisição    | **Serviços GF**  |
| **505**    | ENTREGA DE PRODUTOS (EMPENHADOS)        | Controle EPIs | EPIs             |
| **509**    | REQUISIÇÃO MATERIAIS ESTOQUE LOGISTICA  | Requisição    | Logística        |
| **700**    | TRANSFERÊNCIA ENTRE LOCAIS              | Transferência | Neutro           |
| **1113**   | SIMPLES REMESSA                         | Remessas      | Venda/Saída      |

### 3.3 NÃO AFETAM ESTOQUE (Planejamento/Serviços - ATUALEST='N')

| CODTIPOPER | DESCROPER                               | GRUPO         | Motivo               |
| ---------- | --------------------------------------- | ------------- | -------------------- |
| **53**     | REQUISIÇÃO MARMITEX                     | Marmitex      | Não registra estoque |
| **54**     | REQUISIÇÃO ABASTECIMENTO                | -             | Não afeta            |
| **56**     | REQUISIÇÃO DE COMPRA POR AMOSTRAGEM(GF) | -             | Apenas amostragem    |
| **57**     | INTENÇÃO COMPRAS PRÓPRIAS MANUTENÇÃO    | -             | Apenas intenção      |
| **109**    | PEDIDO DE COMPRA MATERIAIS MANUT. (GF)  | Pedido Compra | Apenas pedido        |
| **113**    | PEDIDO DE COMPRA DE MARMITEX            | Marmitex      | Apenas pedido        |
| **202**    | COMPRA - SERVIÇO PJ                     | Compras       | Sem estoque          |
| **221**    | COMPRA - USO/CONSUMO - SEM MOV ESTOQUE  | Compras       | Sem entrada          |
| **227**    | COMPRA PECAS (GF) SEM ESTOQUE           | Compras       | Sem estoque          |
| **504**    | INTENÇÃO COMPRA MANUTENÇÃO (GF)         | Requisição    | Apenas intenção      |
| **506**    | INTENÇÃO COMPRA USO/CONSUMO             | Requisição    | Apenas intenção      |

### 3.4 RESERVA (ATUALEST='R')

| CODTIPOPER | DESCROPER                      | GRUPO         | Motivo         |
| ---------- | ------------------------------ | ------------- | -------------- |
| **101**    | PEDIDO DE COMPRA - USO/CONSUMO | Pedido Compra | Reserva apenas |
| **401**    | PEDIDO DE REQUISIÇÃO (GF)      | Requisição    | Reserva apenas |

---

## 4. Classificação para Cálculo de Giro

### 4.1 Filtros Obrigatórios

```sql
WHERE TGFTOP.ATUALEST IN ('E', 'B')  -- Afeta estoque
  AND TGFCAB.STATUSNOTA = 'L'         -- Liberadas
```

### 4.2 ENTRADAS (Compras)

```sql
WHERE TGFCAB.CODTIPOPER IN (200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 214, 222, 223, 224, 231)
  AND TGFTOP.ATUALEST = 'E'
```

### 4.3 SAÍDAS (Consumo Interno)

```sql
WHERE TGFCAB.CODTIPOPER IN (501, 502, 505, 509, 1113)
  AND TGFTOP.ATUALEST = 'B'
  AND TGFCAB.CODPARC = 1  -- Consumo interno (empresa)
```

### 4.4 EXCLUSÕES

```sql
WHERE TGFTOP.ATUALEST NOT IN ('E', 'B')  -- Não afetam estoque
  AND TGFCAB.CODTIPOPER NOT IN (700)     -- Transferências são neutras
```

---

## 5. Grupos de Produtos (TGFGRU) - Análise para Serviços de Veículos

### 5.1 Hierarquia de Grupos

#### **GRUPOS DE SERVIÇOS (10000-10999)**

| Código      | Descrição                    | Relevância para Giro |
| ----------- | ---------------------------- | -------------------- |
| 10000       | SERVIÇOS                     | Baixa                |
| 10100-10123 | Manutenção de Equipamentos   | Baixa (serviços)     |
| 10200-10202 | Tecnologia                   | Baixa (serviços)     |
| 10300-10304 | Transporte                   | Baixa (serviços)     |
| 10400-10407 | Institucional                | Baixa (serviços)     |
| 10500-10504 | Locação e Prestação Serviços | Baixa (serviços)     |
| 10600-10601 | Alimentação                  | Média (consumo)      |
| 10700-10704 | Engenharia                   | Baixa (serviços)     |
| 10800       | SERVIÇOS TOMADOS             | Baixa                |
| 10900-10907 | Despesas Administrativa      | Baixa                |

#### **GRUPOS DE PRODUTOS (20000-21000)** ← **MAIS RELEVANTES**

| Código          | Descrição                 | Relevância para Giro            |
| --------------- | ------------------------- | ------------------------------- |
| **20000**       | **PRODUTOS**              | **Alta** - Principal            |
| **20100-20108** | **MANUTENÇÃO AUTOMOTIVA** | **Alta** - Peças veículos       |
| 20200-20202     | Equipamentos              | Média                           |
| **20300-20313** | **USO E CONSUMO**         | **Alta** - Materiais rápidos    |
| 20400-20402     | Logística                 | Média                           |
| 20500           | Abastecimento             | Média                           |
| **20600**       | **FERRAMENTAS**           | **Alta** - Estoque ferramentas  |
| 20700           | Compras Diretoria         | Baixa                           |
| **20900**       | **AMOSTRAGEM**            | **Alta** - Produtos específicos |
| 21000           | Manutenção Predial        | Baixa                           |

### 5.2 Grupos Prioritários para Análise de Giro

| Prioridade | Código    | Descrição                 | Justificativa               |
| ---------- | --------- | ------------------------- | --------------------------- |
| 🔴 **1**   | **20100** | **MANUTENÇÃO AUTOMOTIVA** | Raiz das compras da empresa |
| 🔴 **2**   | **20000** | PRODUTOS                  | Principal grupo geral       |
| 🟡 **3**   | 20600     | FERRAMENTAS               | Estoque de ferramentas      |
| 🟡 **4**   | 20300     | USO E CONSUMO             | Materiais de consumo rápido |
| 🟢 **5**   | 20900     | AMOSTRAGEM                | Produtos específicos        |

### 5.3 Análise do Grupo 20100 (MANUTENÇÃO AUTOMOTIVA)

Este é o **grupo raiz** mais importante para a análise:

| Código | Descrição             |
| ------ | --------------------- |
| 20100  | MANUTENCAO AUTOMOTIVA |
| 20101  | ELETRICA AUTOMOTIVA   |
| 20102  | MECANICA              |
| 20103  | HIDRAULICA            |
| 20104  | CALDEIRARIA           |
| 20105  | PINTURA AUTOMOTIVA    |
| 20106  | RODAGEM               |
| 20107  | LAVADOR               |
| 20108  | BORRACHARIA           |

---

## 6. Queries de Referência

### 6.1 Resumo de Movimentações por Período

```sql
SELECT
    TGFTOP.DESCROPER as tipo_operacao,
    TGFTOP.TIPMOV,
    TGFTOP.ATUALEST,
    COUNT(DISTINCT TGFCAB.NUNOTA) as notas,
    SUM(TGFITE.QTDNEG) as quantidade,
    SUM(TGFITE.VLRTOT) as valor
FROM TGFCAB
JOIN TGFITE ON TGFCAB.NUNOTA = TGFITE.NUNOTA
JOIN TGFTOP ON TGFCAB.CODTIPOPER = TGFTOP.CODTIPOPER
WHERE TGFCAB.DTMOV BETWEEN @dataInicial AND @dataFinal
  AND TGFCAB.STATUSNOTA = 'L'
GROUP BY TGFTOP.DESCROPER, TGFTOP.TIPMOV, TGFTOP.ATUALEST
ORDER BY TGFTOP.ATUALEST, SUM(TGFITE.VLRTOT) DESC
```

### 6.2 Resumo por Grupo de Produtos

```sql
SELECT
    GRU.CODGRUPOPROD,
    GRU.DESCRGRUPOPROD,
    COUNT(DISTINCT PRO.CODPROD) as total_produtos,
    SUM(EST.ESTOQUE) as estoque_atual,
    SUM(EST.ESTOQUE * ISNULL(PRO.PRECOBASE, 0)) as valor_estoque,
    AVG(EST.ESTMIN) as avg_estmin,
    AVG(EST.ESTMAX) as avg_estmax,
    SUM(CASE WHEN EST.ESTOQUE <= EST.ESTMIN AND EST.ESTMIN > 0 THEN 1 ELSE 0 END) as abaixo_minimo,
    SUM(CASE WHEN EST.ESTOQUE <= 0 THEN 1 ELSE 0 END) as sem_estoque
FROM TGFGRU GRU
LEFT JOIN TGFPRO PRO ON GRU.CODGRUPOPROD = PRO.CODGRUPOPROD
LEFT JOIN TGFEST EST ON PRO.CODPROD = EST.CODPROD
WHERE EST.ATIVO = 'S'
  AND GRU.CODGRUPOPROD = @codgrupoprod
GROUP BY GRU.CODGRUPOPROD, GRU.DESCRGRUPOPROD
ORDER BY valor_estoque DESC
```

### 6.3 Movimentações por Grupo (Entradas vs Saídas)

```sql
SELECT
    GRU.CODGRUPOPROD,
    GRU.DESCRGRUPOPROD,

    SUM(CASE WHEN TGFTOP.ATUALEST = 'E' THEN TGFITE.QTDNEG ELSE 0 END) as entradas_qtd,
    SUM(CASE WHEN TGFTOP.ATUALEST = 'E' THEN TGFITE.VLRTOT ELSE 0 END) as entradas_valor,
    COUNT(DISTINCT CASE WHEN TGFTOP.ATUALEST = 'E' THEN TGFCAB.NUNOTA END) as entradas_notas,

    SUM(CASE WHEN TGFTOP.ATUALEST = 'B' AND TGFCAB.CODPARC = 1 THEN TGFITE.QTDNEG ELSE 0 END) as saidas_qtd,
    SUM(CASE WHEN TGFTOP.ATUALEST = 'B' AND TGFCAB.CODPARC = 1 THEN TGFITE.VLRTOT ELSE 0 END) as saidas_valor,
    COUNT(DISTINCT CASE WHEN TGFTOP.ATUALEST = 'B' AND TGFCAB.CODPARC = 1 THEN TGFCAB.NUNOTA END) as saidas_notas

FROM TGFGRU GRU
LEFT JOIN TGFPRO PRO ON GRU.CODGRUPOPROD = PRO.CODGRUPOPROD
LEFT JOIN TGFITE ITE ON PRO.CODPROD = ITE.CODPROD
LEFT JOIN TGFCAB CAB ON ITE.NUNOTA = CAB.NUNOTA
LEFT JOIN TGFTOP TOP ON CAB.CODTIPOPER = TOP.CODTIPOPER
WHERE CAB.DTMOV BETWEEN @dataInicial AND @dataFinal
  AND CAB.STATUSNOTA = 'L'
  AND GRU.CODGRUPOPROD = @codgrupoprod
GROUP BY GRU.CODGRUPOPROD, GRU.DESCRGRUPOPROD
ORDER BY (entradas_valor + saidas_valor) DESC
```

### 6.4 Cálculo de Giro por Produto (Grupo 20100)

```sql
SELECT
    PRO.CODPROD,
    PRO.DESCRPROD,
    GRU.DESCRGRUPOPROD,
    MAX(EST.ESTOQUE) as estoque_atual,
    MAX(EST.ESTMIN) as estoque_minimo,
    MAX(EST.ESTMAX) as estoque_maximo,

    SUM(CASE WHEN TOP.ATUALEST = 'B' AND CAB.CODPARC = 1 THEN ITE.QTDNEG ELSE 0 END) as consumo_qtd,
    SUM(CASE WHEN TOP.ATUALEST = 'B' AND CAB.CODPARC = 1 THEN ITE.VLRTOT ELSE 0 END) as consumo_valor,
    SUM(CASE WHEN TOP.ATUALEST = 'E' THEN ITE.QTDNEG ELSE 0 END) as entradas_qtd,

    CASE
        WHEN AVG(EST.ESTOQUE) > 0
        THEN SUM(CASE WHEN TOP.ATUALEST = 'B' AND CAB.CODPARC = 1 THEN ITE.QTDNEG ELSE 0 END) / AVG(EST.ESTOQUE)
        ELSE 0
    END as giro,

    CASE
        WHEN SUM(CASE WHEN TOP.ATUALEST = 'B' AND CAB.CODPARC = 1 THEN ITE.QTDNEG ELSE 0 END) > 0
        THEN MAX(EST.ESTOQUE) / (SUM(CASE WHEN TOP.ATUALEST = 'B' AND CAB.CODPARC = 1 THEN ITE.QTDNEG ELSE 0 END) / 30.0)
        ELSE NULL
    END as dias_estoque

FROM TGFPRO PRO
LEFT JOIN TGFGRU GRU ON PRO.CODGRUPOPROD = GRU.CODGRUPOPROD
LEFT JOIN TGFEST EST ON PRO.CODPROD = EST.CODPROD
LEFT JOIN TGFITE ITE ON PRO.CODPROD = ITE.CODPROD
LEFT JOIN TGFCAB CAB ON ITE.NUNOTA = CAB.NUNOTA
LEFT JOIN TGFTOP TOP ON CAB.CODTIPOPER = TOP.CODTIPOPER
WHERE PRO.CODGRUPOPROD = 20100
  AND CAB.DTMOV BETWEEN DATEADD(MONTH, -12, GETDATE()) AND GETDATE()
  AND CAB.STATUSNOTA = 'L'
GROUP BY PRO.CODPROD, PRO.DESCRPROD, GRU.DESCRGRUPOPROD
ORDER BY giro DESC, consumo_qtd DESC
```

---

## 7. Classificação de Giro por Produto

| Giro Mensal | Status        | Cor      | Ação Recomendada           |
| ----------- | ------------- | -------- | -------------------------- |
| 0           | 🚨 **PARADO** | Vermelho | Analisar obsolescência     |
| 0.1 - 0.9   | ⚠️ **BAIXO**  | Amarelo  | Reduzir lote de compra     |
| 1 - 2       | ✅ **NORMAL** | Verde    | Manter política atual      |
| > 2         | 💰 **ALTO**   | Azul     | Verificar risco de ruptura |

### 7.1 Análises Cruzadas

| Situação                      | Problema         | Ação             |
| ----------------------------- | ---------------- | ---------------- |
| Giro ALTO + Estoque < ESTMIN  | Risco de ruptura | Aumentar compra  |
| Giro BAIXO + Estoque > ESTMAX | Excesso          | Reduzir compra   |
| Giro ZERO + Estoque > 0       | Obsolescência    | Avaliar descarte |
| Giro ALTO + Estoque = 0       | Falha crítica    | Priorizar compra |

---

## 8. Endpoints do Módulo (Propostos)

### 8.1 Estrutura de Filtros (todos opcionais)

```typescript
interface EstoqueGiroQuery {
  dataInicial?: string // Formato: YYYY-MM-DD (padrão: 12 meses atrás)
  dataFinal?: string // Formato: YYYY-MM-DD (padrão: hoje)
  codemp?: number // Empresa
  codlocal?: number // Local/Depósito
  codgrupoprod?: number // Grupo de produto
  codprod?: number // Produto específico
}
```

### 8.2 Endpoints Propostos

| Endpoint                             | Método | Descrição                  |
| ------------------------------------ | ------ | -------------------------- |
| `/estoque-giro/grupos/resumo`        | GET    | Resumo por grupo           |
| `/estoque-giro/grupos/movimentacoes` | GET    | Movimentações por grupo    |
| `/estoque-giro/grupos/giro`          | GET    | Métricas de giro por grupo |
| `/estoque-giro/produtos/resumo`      | GET    | Resumo por produto         |
| `/estoque-giro/produtos/giro`        | GET    | Giro por produto           |
| `/estoque-giro/alertas`              | GET    | Alertas de giro            |

---

## 9. Próximos Passos

### Fase 1: Documentação e Análise (CONCLUÍDA)

- [x] Analisar TOPS utilizados
- [x] Classificar ENTRADAS vs SAÍDAS
- [x] Documentar regras de negócio
- [x] Listar grupos de produtos
- [x] Selecionar grupo piloto (20100 - MANUTENÇÃO AUTOMOTIVA)

### Fase 2: Validação com Grupo Piloto (20100 - Manutenção Automotiva)

- [ ] Executar queries no grupo 20100
- [ ] Validar dados com equipe operacional
- [ ] Ajustar queries se necessário

### Fase 3: Implementação

- [ ] Criar módulo `estoque-giro`
- [ ] Implementar endpoints
- [ ] Testes unitários
- [ ] Documentação de API

### Fase 4: Deploy e Monitoramento

- [ ] Deploy em homologação
- [ ] Validação com dados reais
- [ ] Ajustes finais
- [ ] Deploy em produção

---

## 10. Histórico de Alterações

| Versão | Data       | Autor   | Descrição                              |
| ------ | ---------- | ------- | -------------------------------------- |
| 1.0    | 2025-01-01 | Sistema | Versão inicial - Documentação completa |

---

_Documento gerado para análise de giro deestoque - Sankhya ERP_
_Empresa de Serviços de Veículos - Manutenção Automotiva_
