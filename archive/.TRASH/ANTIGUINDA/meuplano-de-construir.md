# Plano de Construção: Análise de Giro de Estoque - Grupo 20100 (Manutenção Automotiva)

**Data de Criação:** 2025-01-01  
**Versão:** 1.0  
**Status:** Em Construção

---

## 1. Contexto

Este documento detalha o plano de construção para análise profunda do giro de estoque do grupo de **Manutenção Automotiva (20100)** no sistema Sankhya.

### 1.1 Objetivo

Investigar profundamente todos os produtos do grupo 20100, analisando:

- Estoque atual por produto
- Movimentações de entrada e saída
- Cálculo de giro por período
- Classificação de produtos (parados, baixo giro, normal, alto giro)

### 1.2 Grupos Analisados

| Código | Descrição             | Nível |
| ------ | --------------------- | ----- |
| 20100  | MANUTENCAO AUTOMOTIVA | Pai   |
| 20101  | ELETRICA AUTOMOTIVA   | Filho |
| 20102  | MECANICA              | Filho |
| 20103  | HIDRAULICA            | Filho |
| 20104  | CALDEIRARIA           | Filho |
| 20105  | PINTURA AUTOMOTIVA    | Filho |
| 20106  | RODAGEM               | Filho |
| 20107  | LAVADOR               | Filho |
| 20108  | BORRACHARIA           | Filho |

---

## 2. Fases de Construção

### Fase 1: Inventário do Grupo 20100

- [ ] Contar produtos ativos por subgrupo
- [ ] Listar valor total em estoque por subgrupo
- [ ] Identificar produtos sem estoque
- [ ] Identificar produtos sem movimentação

### Fase 2: Análise Multi-Período

- [ ] 12 meses (visão anual)
- [ ] 6 meses (visão semestral)
- [ ] 3 meses (visão trimestral)
- [ ] 30 dias (visão mensal)
- [ ] 7 dias (visão semanal)

### Fase 3: TOP 50 Produtos Detalhados

- [ ] Por valor em estoque
- [ ] Por volume de saída
- [ ] Por giro (maior e menor)
- [ ] Por frequência de movimentação

### Fase 4: Análise Específica 20102 (Mecânica)

- [ ] Repetir Fases 1-3 para subgrupo 20102
- [ ] Identificar produtos específicos da mecânica

### Fase 5: Classificação de Giro

- [ ] Produtos PARADOS (giro = 0)
- [ ] Produtos GIRO BAIXO (0.1-0.9)
- [ ] Produtos GIRO NORMAL (1-2)
- [ ] Produtos GIRO ALTO (>2)

### Fase 6: Filtros por Local

- [ ] Estoque por local/depósito
- [ ] Movimentações por local
- [ ] Análise consolidada por local

---

## 3. Documentos a Serem Gerados

### 3.1 Documento Principal

| Arquivo                    | Descrição                     |
| -------------------------- | ----------------------------- |
| `meuplano-de-construir.md` | Este documento - planejamento |

### 3.2 Documentos de Análise

| Arquivo                                  | Descrição                      | Status     |
| ---------------------------------------- | ------------------------------ | ---------- |
| `estoque-giro-20100-inventario.md`       | Inventário geral do grupo      | 🔲 A fazer |
| `estoque-giro-20100-top50.md`            | TOP 50 produtos detalhados     | 🔲 A fazer |
| `estoque-giro-20102-mecanica.md`         | Análise específica de Mecânica | 🔲 A fazer |
| `estoque-giro-20100-analise-completa.md` | Relatório executivo completo   | 🔲 A fazer |

### 3.3 Documentos de TOs (Já Criados)

| Arquivo                                  | Descrição                  |
| ---------------------------------------- | -------------------------- |
| `docs/estoque-giro-analise.md`           | Análise principal completa |
| `docs/estoque-giro-tops-mais-usadas.md`  | TOs mais usadas (resumo)   |
| `docs/tgftops-mais-usadas-em-tgfcabs.md` | TOs completas com dados    |
| `docs/plano-giro-de-caixa.md`            | Plano original             |

---

## 4. Estrutura dos Dados

### 4.1 Campos por Produto no TOP 50

| Campo          | Descrição                   | Tipo   |
| -------------- | --------------------------- | ------ |
| CODPROD        | Código do produto           | number |
| DESCRPROD      | Descrição do produto        | string |
| CODPROD        | Código do subgrupo          | number |
| DESCRGRUPOPROD | Descrição do subgrupo       | string |
| ESTOQUE_ATUAL  | Quantidade em estoque       | number |
| ESTOQUE_MINIMO | Estoque mínimo (ESTMIN)     | number |
| ESTOQUE_MAXIMO | Estoque máximo (ESTMAX)     | number |
| VALOR_ESTOQUE  | R$ em estoque               | number |
| ENTRADAS_12M   | Qtd entradas (12 meses)     | number |
| SAIDAS_12M     | Qtd saídas (12 meses)       | number |
| ENTRADAS_6M    | Qtd entradas (6 meses)      | number |
| SAIDAS_6M      | Qtd saídas (6 meses)        | number |
| ENTRADAS_3M    | Qtd entradas (3 meses)      | number |
| SAIDAS_3M      | Qtd saídas (3 meses)        | number |
| GIRO_12M       | Consumo / Estoque Médio     | number |
| DIAS_ESTOQUE   | Dias restantes de estoque   | number |
| STATUS_GIRO    | PARADO/BAIXO/NORMAL/ALTO    | string |
| ULTIMA_MOV     | Data da última movimentação | date   |
| DIAS_SEM_MOV   | Dias sem movimentação       | number |
| CODLOCAL       | Código do local             | number |
| NOMELOCAL      | Nome do local               | string |

### 4.2 Classificação de Giro

| Giro Mensal | Status    | Cor      | Ação              |
| ----------- | --------- | -------- | ----------------- |
| 0           | 🚨 PARADO | Vermelho | Analisar descarte |
| 0.1 - 0.9   | ⚠️ BAIXO  | Amarelo  | Reduzir compra    |
| 1 - 2       | ✅ NORMAL | Verde    | Manter política   |
| > 2         | 💰 ALTO   | Azul     | Verificar ruptura |

---

## 5. TOPS Críticas para Análise

### 5.1 ENTRADAS (Compras que afetam estoque)

| TOP | Descrição                              | Prioridade |
| --- | -------------------------------------- | ---------- |
| 201 | COMPRA - USO/CONSUMO - COM MOV ESTOQUE | 🔴 Alta    |
| 222 | COMPRA PECAS (GF) COM ESTOQUE          | 🔴 Alta    |
| 227 | COMPRA PECAS (GF) SEM ESTOQUE          | 🟡 Média   |
| 231 | COMPRAS - FECHAMENTO ROMANEIO          | 🟡 Média   |

### 5.2 SAÍDAS (Consumo interno)

| TOP | Descrição                               | Prioridade |
| --- | --------------------------------------- | ---------- |
| 501 | REQUISIÇÃO MATERIAIS ESTOQUE ALMOX (GF) | 🔴 Alta    |
| 505 | ENTREGA DE PRODUTOS (EMPENHADOS)        | 🔴 Alta    |
| 509 | REQUISIÇÃO MATERIAIS ESTOQUE LOGISTICA  | 🟡 Média   |

---

## 6. Filtros Aplicados

### 6.1 Filtros Obrigatórios

- STATUSNOTA = 'L' (Liberadas)
- ATUALEST IN ('E', 'B') (Afetam estoque)
- CODPARC = 1 (Consumo interno - para saídas)

### 6.2 Filtros Opcionais

- CODLOCAL (por local/depósito)
- CODPROD (por produto específico)
- CODPROD (por subgrupo)

---

## 7. Próximos Passos

### 7.1 Imediatos

- [ ] Criar documento de inventário (estoque-giro-20100-inventario.md)
- [ ] Executar queries de análise
- [ ] Coletar dados por período

### 7.2 Curt prazo

- [ ] Gerar TOP 50 produtos
- [ ] Analisar subgrupo 20102 (Mecânica)
- [ ] Classificar produtos por giro

### 7.3 Médio prazo

- [ ] Criar documento de análise completa
- [ ] Validar dados com equipe operacional
- [ ] Implementar módulo de giro de estoque

---

## 8. Histórico de Alterações

| Versão | Data       | Autor   | Descrição               |
| ------ | ---------- | ------- | ----------------------- |
| 1.0    | 2025-01-01 | Sistema | Versão inicial do plano |

---

_Documento de planejamento para análise de giro de estoque - Manutenção Automotiva_
