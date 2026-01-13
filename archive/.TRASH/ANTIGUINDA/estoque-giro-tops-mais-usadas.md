# Análise das TOs Mais Usadas (Últimos 3 Meses)

**Data da Análise:** 2025-01-01  
**Período Analisado:** Últimos 3 meses  
**Versão:** 1.0  
**Objetivo:** Identificar as TOs mais relevantes para cálculo de giro de estoque

---

## 1. Resumo Executivo

### 1.1 Total de TOs Identificadas

| Métrica                          | Valor |
| -------------------------------- | ----- |
| Total de TOs únicas              | 30    |
| TOs que afetam estoque (E/B)     | 18    |
| TOs que não afetam estoque (N/R) | 12    |

### 1.2 TOs Mais Usadas (Top 10)

| Ranking | TOP  | Descrição                               | Grupo         | Notas | ATUALEST |
| ------- | ---- | --------------------------------------- | ------------- | ----- | -------- |
| 1       | 605  | DEVOLUÇÃO DE PRODUTOS (EMPENHADOS)      | Controle EPIs | 3.424 | **E**    |
| 2       | 700  | TRANSFERÊNCIA ENTRE LOCAIS              | Transferência | 3.423 | **B**    |
| 3       | 505  | ENTREGA DE PRODUTOS (EMPENHADOS)        | Controle EPIs | 2.538 | **B**    |
| 4       | 109  | PEDIDO DE COMPRA MATERIAIS MANUT. (GF)  | Pedido Compra | 1.592 | **N**    |
| 5       | 113  | PEDIDO DE COMPRA DE MARMITEX            | Marmitex      | 1.518 | **N**    |
| 6       | 53   | REQUISIÇÃO MARMITEX                     | Marmitex      | 1.518 | **N**    |
| 7       | 504  | INTENÇÃO COMPRA MANUTENÇÃO (GF)         | Requisição    | 1.295 | **N**    |
| 8       | 501  | REQUISIÇÃO MATERIAIS ESTOQUE ALMOX (GF) | Requisição    | 851   | **B**    |
| 9       | 401  | PEDIDO DE REQUISIÇÃO (GF)               | Requisição    | 662   | **R**    |
| 10      | 1113 | SIMPLES REMESSA                         | Remessas      | 638   | **B**    |

---

## 2. Análise Detalhada por TO

### 2.1 TOs de ENTRADA (ATUALEST='E')

| TOP     | DESCROPER                               | GRUPO          | TIPMOV | Notas | Relevância |
| ------- | --------------------------------------- | -------------- | ------ | ----- | ---------- |
| **605** | DEVOLUÇÃO DE PRODUTOS (EMPENHADOS)      | Controle EPIs  | L      | 3.424 | 🔴 Alta    |
| **222** | COMPRA PECAS (GF) COM ESTOQUE           | Compras        | C      | 587   | 🔴 Alta    |
| **227** | COMPRA PECAS (GF) SEM ESTOQUE           | Compras        | C      | 355   | 🟡 Média   |
| **201** | COMPRA - USO/CONSUMO - COM MOV ESTOQUE  | Compras        | C      | 272   | 🔴 Alta    |
| **231** | COMPRAS - FECHAMENTO ROMANEIO (MENSAL)  | Compras Mensal | C      | 210   | 🟡 Média   |
| **205** | COMPRA POR XML                          | Compras        | C      | 150   | 🟢 Baixa   |
| **133** | ENTRADA POR ROMANEIO C/ESTOQUE (MENSAL) | Compras Mensal | C      | 384   | 🟡 Média   |

**Análise de ENTRADA:**

- A TO **605** (Devolução de EPIs) é a mais usada, mas representa devolução, não compra nova
- As TO **222** e **201** são as principais compras que entram no estoque
- A TO **227** (COMPRA SEM ESTOQUE) tem ATUALEST='E', o que é interessante investigar

### 2.2 TOs de SAÍDA (ATUALEST='B')

| TOP      | DESCROPER                               | GRUPO         | TIPMOV | Notas | Relevância |
| -------- | --------------------------------------- | ------------- | ------ | ----- | ---------- |
| **700**  | TRANSFERÊNCIA ENTRE LOCAIS              | Transferência | T      | 3.423 | 🟡 Média   |
| **505**  | ENTREGA DE PRODUTOS (EMPENHADOS)        | Controle EPIs | Q      | 2.538 | 🔴 Alta    |
| **501**  | REQUISIÇÃO MATERIAIS ESTOQUE ALMOX (GF) | Requisição    | Q      | 851   | 🔴 Alta    |
| **1113** | SIMPLES REMESSA                         | Remessas      | V      | 638   | 🟡 Média   |
| **704**  | TRANSFERÊNCIA SAÍDA                     | Transferência | T      | 356   | 🟡 Média   |
| **509**  | REQUISIÇÃO MATERIAIS ESTOQUE LOGISTICA  | Requisição    | Q      | 298   | 🟡 Média   |

**Análise de SAÍDA:**

- A TO **700** (Transferência) é a 2ª mais usada, mas é neutra (entrada=saída)
- A TO **505** (Entrega de EPIs) é a principal saída de materiais
- A TO **501** (Requisição Almoxarifado) é a principal saída para consumo interno

### 2.3 TOs que NÃO AFETAM ESTOQUE (ATUALEST='N')

| TOP      | DESCROPER                                | GRUPO           | TIPMOV | Notas | Motivo          |
| -------- | ---------------------------------------- | --------------- | ------ | ----- | --------------- |
| **109**  | PEDIDO DE COMPRA MATERIAIS MANUT. (GF)   | Pedido Compra   | O      | 1.592 | Apenas pedido   |
| **113**  | PEDIDO DE COMPRA DE MARMITEX             | Marmitex        | O      | 1.518 | Apenas pedido   |
| **53**   | REQUISIÇÃO MARMITEX                      | Marmitex        | Q      | 1.518 | Não registra    |
| **504**  | INTENÇÃO COMPRA MANUTENÇÃO (GF)          | Requisição      | Q      | 1.295 | Apenas intenção |
| **506**  | INTENÇÃO COMPRA USO/CONSUMO              | Requisição      | Q      | 516   | Apenas intenção |
| **202**  | COMPRA - SERVIÇO PJ                      | Compras         | C      | 542   | Não tem estoque |
| **132**  | ENTRADA POR ROMANEIO S/ ESTOQUE (MENSAL) | Compras Mensal  | C      | 236   | Sem estoque     |
| **1004** | PEDIDO DE VENDA - SERVIÇO                | Prest. Servico  | P      | 349   | Apenas pedido   |
| **54**   | REQUISIÇÃO ABASTECIMENTO                 | -               | Q      | 281   | Não afeta       |
| **2798** | PRÉ NOTA (FAT. SERVIÇOS)\_1              | Prest. Servico  | V      | 218   | Não afeta       |
| **1100** | PEDIDO DE VENDA                          | Pedido de Venda | P      | 180   | Apenas pedido   |
| **503**  | REQUISIÇÃO INTERNA DE SERV TERC          | Prest. Servico  | Q      | 114   | Não afeta       |

**Análise:** Estas TOs devem ser **EXCLUÍDAS** do cálculo de giro de estoque.

### 2.4 TOs com ATUALEST='R' (Reserva)

| TOP      | DESCROPER                          | GRUPO         | TIPMOV | Notas | Significado    |
| -------- | ---------------------------------- | ------------- | ------ | ----- | -------------- |
| **401**  | PEDIDO DE REQUISIÇÃO (GF)          | Requisição    | J      | 662   | Reserva apenas |
| **101**  | PEDIDO DE COMPRA - USO/CONSUMO     | Pedido Compra | O      | 518   | Reserva apenas |
| **102**  | PEDIDO DE COMPRA - SERVIÇO         | Pedido Compra | O      | 311   | Reserva apenas |
| **111**  | PEDIDO DE COMPRA COMBUSTIVEL (GF)  | Pedido Compra | O      | 247   | Reserva apenas |
| **2800** | PD COMPRA - SERVIÇO E PEÇA EXTERNO | Pedido Compra | O      | 341   | Reserva apenas |

**Análise:** ATUALEST='R' indica reserva, não movimentação efetiva de estoque.

---

## 3. Classificação para Cálculo de Giro

### 3.1 TOPS de ENTRADA para GIRO (Compras efetivas)

| TOP     | DESCROPER                               | Uso                | Prioridade |
| ------- | --------------------------------------- | ------------------ | ---------- |
| **201** | COMPRA - USO/CONSUMO - COM MOV ESTOQUE  | Principal entrada  | 🔴 Alta    |
| **222** | COMPRA PECAS (GF) COM ESTOQUE           | Peças para estoque | 🔴 Alta    |
| **227** | COMPRA PECAS (GF) SEM ESTOQUE           | Verificar se entra | 🟡 Média   |
| **231** | COMPRAS - FECHAMENTO ROMANEIO (MENSAL)  | Romaneio           | 🟡 Média   |
| **133** | ENTRADA POR ROMANEIO C/ESTOQUE (MENSAL) | Romaneio           | 🟡 Média   |
| **205** | COMPRA POR XML                          | Via XML            | 🟢 Baixa   |

**Importante:** A TO **605** (Devolução) deve ser tratada separadamente, pois não é compra nova.

### 3.2 TOPS de SAÍDA para GIRO (Consumo efetivo)

| TOP      | DESCROPER                               | Uso           | Prioridade |
| -------- | --------------------------------------- | ------------- | ---------- |
| **501**  | REQUISIÇÃO MATERIAIS ESTOQUE ALMOX (GF) | Almoxarifado  | 🔴 Alta    |
| **505**  | ENTREGA DE PRODUTOS (EMPENHADOS)        | EPIs          | 🔴 Alta    |
| **509**  | REQUISIÇÃO MATERIAIS ESTOQUE LOGISTICA  | Logística     | 🟡 Média   |
| **1113** | SIMPLES REMESSA                         | Venda/Remessa | 🟡 Média   |

**Nota:** A TO **700** (Transferência) deve ser excluída, pois é neutra.

### 3.3 TOPS a EXCLUIR do Cálculo

| TOP  | DESCROPER                            | Motivo               |
| ---- | ------------------------------------ | -------------------- |
| 53   | REQUISIÇÃO MARMITEX                  | Não afeta estoque    |
| 54   | REQUISIÇÃO ABASTECIMENTO             | Não afeta estoque    |
| 56   | REQUISIÇÃO DE COMPRA POR AMOSTRAGEM  | Apenas amostragem    |
| 57   | INTENÇÃO COMPRAS PRÓPRIAS MANUTENÇÃO | Apenas intenção      |
| 109  | PEDIDO DE COMPRA MATERIAIS MANUT.    | Apenas pedido        |
| 113  | PEDIDO DE COMPRA DE MARMITEX         | Apenas pedido        |
| 132  | ENTRADA POR ROMANEIO S/ ESTOQUE      | Não entra no estoque |
| 202  | COMPRA - SERVIÇO PJ                  | Não tem estoque      |
| 401  | PEDIDO DE REQUISIÇÃO                 | Reserva apenas       |
| 503  | REQUISIÇÃO INTERNA DE SERV TERC      | Não afeta            |
| 504  | INTENÇÃO COMPRA MANUTENÇÃO           | Apenas intenção      |
| 506  | INTENÇÃO COMPRA USO/CONSUMO          | Apenas intenção      |
| 1004 | PEDIDO DE VENDA - SERVIÇO            | Apenas pedido        |
| 1100 | PEDIDO DE VENDA                      | Apenas pedido        |

---

## 4. Filtros Recomendados

### 4.1 Query para ENTRADAS (Compras que afetam estoque)

```sql
SELECT
    CAB.CODTIPOPER,
    TGFTOP.DESCROPER,
    TGFTOP.ATUALEST,
    COUNT(DISTINCT CAB.NUNOTA) as total_notas,
    SUM(TGFITE.QTDNEG) as total_qtd,
    SUM(TGFITE.VLRTOT) as total_valor
FROM TGFCAB CAB
JOIN TGFITE ON CAB.NUNOTA = TGFITE.NUNOTA
JOIN TGFTOP ON CAB.CODTIPOPER = TGFTOP.CODTIPOPER
WHERE CAB.DTMOV BETWEEN DATEADD(MONTH, -3, GETDATE()) AND GETDATE()
  AND CAB.STATUSNOTA = 'L'
  AND TGFTOP.ATUALEST = 'E'
  AND CAB.CODTIPOPER IN (201, 222, 227, 231, 133, 205)
GROUP BY CAB.CODTIPOPER, TGFTOP.DESCROPER, TGFTOP.ATUALEST
ORDER BY total_notas DESC
```

### 4.2 Query para SAÍDAS (Consumo interno)

```sql
SELECT
    CAB.CODTIPOPER,
    TGFTOP.DESCROPER,
    TGFTOP.ATUALEST,
    COUNT(DISTINCT CAB.NUNOTA) as total_notas,
    SUM(TGFITE.QTDNEG) as total_qtd,
    SUM(TGFITE.VLRTOT) as total_valor
FROM TGFCAB CAB
JOIN TGFITE ON CAB.NUNOTA = TGFITE.NUNOTA
JOIN TGFTOP ON CAB.CODTIPOPER = TGFTOP.CODTIPOPER
WHERE CAB.DTMOV BETWEEN DATEADD(MONTH, -3, GETDATE()) AND GETDATE()
  AND CAB.STATUSNOTA = 'L'
  AND TGFTOP.ATUALEST = 'B'
  AND CAB.CODPARC = 1
  AND CAB.CODTIPOPER NOT IN (700, 704)
GROUP BY CAB.CODTIPOPER, TGFTOP.DESCROPER, TGFTOP.ATUALEST
ORDER BY total_notas DESC
```

---

## 5. Tabela Completa de TOs Mais Usadas

| TOP  | DESCROPER                                | GRUPO           | TIPMOV | ATUALEST | Notas | Efeito  |
| ---- | ---------------------------------------- | --------------- | ------ | -------- | ----- | ------- |
| 605  | DEVOLUÇÃO DE PRODUTOS (EMPENHADOS)       | Controle EPIs   | L      | E        | 3.424 | ENTRADA |
| 700  | TRANSFERÊNCIA ENTRE LOCAIS               | Transferência   | T      | B        | 3.423 | NEUTRO  |
| 505  | ENTREGA DE PRODUTOS (EMPENHADOS)         | Controle EPIs   | Q      | B        | 2.538 | SAÍDA   |
| 109  | PEDIDO DE COMPRA MATERIAIS MANUT. (GF)   | Pedido Compra   | O      | N        | 1.592 | IGNORAR |
| 113  | PEDIDO DE COMPRA DE MARMITEX             | Marmitex        | O      | N        | 1.518 | IGNORAR |
| 53   | REQUISIÇÃO MARMITEX                      | Marmitex        | Q      | N        | 1.518 | IGNORAR |
| 504  | INTENÇÃO COMPRA MANUTENÇÃO (GF)          | Requisição      | Q      | N        | 1.295 | IGNORAR |
| 501  | REQUISIÇÃO MATERIAIS ESTOQUE ALMOX (GF)  | Requisição      | Q      | B        | 851   | SAÍDA   |
| 401  | PEDIDO DE REQUISIÇÃO (GF)                | Requisição      | J      | R        | 662   | RESERVA |
| 1113 | SIMPLES REMESSA                          | Remessas        | V      | B        | 638   | SAÍDA   |
| 222  | COMPRA PECAS (GF) COM ESTOQUE            | Compras         | C      | E        | 587   | ENTRADA |
| 202  | COMPRA - SERVIÇO PJ                      | Compras         | C      | N        | 542   | IGNORAR |
| 101  | PEDIDO DE COMPRA - USO/CONSUMO           | Pedido Compra   | O      | R        | 518   | RESERVA |
| 506  | INTENÇÃO COMPRA USO/CONSUMO              | Requisição      | Q      | N        | 516   | IGNORAR |
| 133  | ENTRADA POR ROMANEIO C/ESTOQUE (MENSAL)  | Compras Mensal  | C      | E        | 384   | ENTRADA |
| 704  | TRANSFERÊNCIA SAÍDA                      | Transferência   | T      | B        | 356   | SAÍDA   |
| 227  | COMPRA PECAS (GF) SEM ESTOQUE            | Compras         | C      | E        | 355   | ENTRADA |
| 1004 | PEDIDO DE VENDA - SERVIÇO                | Prest. Servico  | P      | N        | 349   | IGNORAR |
| 2800 | PD COMPRA - SERVIÇO E PEÇA EXTERNO       | Pedido Compra   | O      | N        | 341   | IGNORAR |
| 102  | PEDIDO DE COMPRA - SERVIÇO               | Pedido Compra   | O      | R        | 311   | RESERVA |
| 509  | REQUISIÇÃO MATERIAIS ESTOQUE LOGISTICA   | Requisição      | Q      | B        | 298   | SAÍDA   |
| 54   | REQUISIÇÃO ABASTECIMENTO                 | -               | Q      | N        | 281   | IGNORAR |
| 201  | COMPRA - USO/CONSUMO - COM MOV ESTOQUE   | Compras         | C      | E        | 272   | ENTRADA |
| 111  | PEDIDO DE COMPRA COMBUSTIVEL (GF)        | Pedido Compra   | O      | R        | 247   | RESERVA |
| 132  | ENTRADA POR ROMANEIO S/ ESTOQUE (MENSAL) | Compras Mensal  | C      | N        | 236   | IGNORAR |
| 2798 | PRÉ NOTA (FAT. SERVIÇOS)\_1              | Prest. Servico  | V      | N        | 218   | IGNORAR |
| 231  | COMPRAS - FECHAMENTO ROMANEIO (MENSAL)   | Compras Mensal  | C      | E        | 210   | ENTRADA |
| 1100 | PEDIDO DE VENDA                          | Pedido de Venda | P      | N        | 180   | IGNORAR |
| 205  | COMPRA POR XML                           | Compras         | C      | E        | 150   | ENTRADA |
| 503  | REQUISIÇÃO INTERNA DE SERV TERC          | Prest. Servico  | Q      | N        | 114   | IGNORAR |

---

## 6. Legenda de ATUALEST

| Valor | Significado  | Ação no Cálculo                           |
| ----- | ------------ | ----------------------------------------- |
| **E** | Entrada      | INCLUIR como entrada                      |
| **B** | Baixa        | INCLUIR como saída (exceto transferência) |
| **S** | Atualiza     | Analisar caso a caso                      |
| **N** | Não atualiza | EXCLUIR                                   |
| **R** | Reserva      | EXCLUIR                                   |

---

## 7. Análise para Serviços de Veículos

### 7.1 TOPS Relacionadas a Manutenção Automotiva

| TOP     | DESCROPER                               | ATUALEST | Uso para Giro |
| ------- | --------------------------------------- | -------- | ------------- |
| **201** | COMPRA - USO/CONSUMO - COM MOV ESTOQUE  | E        | ✅ SIM        |
| **222** | COMPRA PECAS (GF) COM ESTOQUE           | E        | ✅ SIM        |
| **501** | REQUISIÇÃO MATERIAIS ESTOQUE ALMOX (GF) | B        | ✅ SIM        |
| **505** | ENTREGA DE PRODUTOS (EMPENHADOS)        | B        | ✅ SIM        |

### 7.2 Observações Importantes

1. **TO 605 (Devolução EPIs):** Alta frequência, mas é devolução, não compra nova
2. **TO 700 (Transferência):** Neutra, não afeta o giro total
3. **TO 222 (Compra Peças):** Principal entrada de peças para estoque
4. **TO 501 (Requisição Almoxarifado):** Principal saída para consumo

---

## 8. Próximos Passos

### Fase 1: Validação

- [ ] Executar queries específicas por grupo de produtos
- [ ] Validar com equipe operacional
- [ ] Ajustar filtros se necessário

### Fase 2: Implementação

- [ ] Criar módulo de giro de estoque
- [ ] Implementar filtros baseados nesta análise
- [ ] Testes unitários

### Fase 3: Monitoramento

- [ ] Deploy em homologação
- [ ] Validação com dados reais
- [ ] Ajustes finais

---

## 9. Histórico de Alterações

| Versão | Data       | Autor   | Descrição                                   |
| ------ | ---------- | ------- | ------------------------------------------- |
| 1.0    | 2025-01-01 | Sistema | Versão inicial - Análise de TOs mais usadas |

---

_Documento complementar para análise de giro deestoque - Sankhya ERP_
_Empresa de Serviços de Veículos_
