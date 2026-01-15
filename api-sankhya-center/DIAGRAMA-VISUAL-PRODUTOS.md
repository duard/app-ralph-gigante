# 🗺️ DIAGRAMA VISUAL: Modelo de Dados de Produtos

**Data**: 15/01/2026
**Foco**: TGFPRO (Produtos) e todos os relacionamentos

---

## 📊 Visão Geral - Diagrama Principal

```
                                   ┌─────────────────────┐
                                   │      TGFGRU         │
                                   │   (Grupos)          │
                                   │                     │
                                   │ PK: CODGRUPOPROD    │
                                   │     DESCRGRUPOPROD  │
                                   │     ATIVO           │
                                   └──────────┬──────────┘
                                              │
                                              │ n:1
                                              │
┌─────────────────────┐            ┌──────────▼──────────┐            ┌─────────────────────┐
│      TGFVOL         │            │      TGFPRO         │            │      TGFLOC         │
│   (Unidades)        │            │    (PRODUTOS)       │            │     (Locais)        │
│                     │            │                     │            │                     │
│ PK: CODVOL          │◄───────────┤ PK: CODPROD         ├───────────►│ PK: CODLOCAL        │
│     DESCRVOL        │    n:1     │     DESCRPROD       │    n:1     │     DESCRLOCAL      │
│     ATIVO           │            │     MARCA           │            │     ATIVO           │
└─────────────────────┘            │     REFERENCIA      │            └──────────┬──────────┘
                                   │     NCM             │                       │
                                   │ FK: CODGRUPOPROD    │                       │
                                   │     CODVOL          │                       │
                                   │     CODLOCALPADRAO  │                       │
                                   │ ⭐ TIPCONTEST       │                       │
                                   │     LISCONTEST      │                       │
                                   │     ESTMIN/ESTMAX   │                       │
                                   └──────────┬──────────┘                       │
                                              │                                  │
                                              │ 1:n                              │
                                              │                                  │
                        ┌─────────────────────┼──────────────────────┬──────────┘
                        │                     │                      │
                        │                     │                      │
              ┌─────────▼──────────┐ ┌────────▼──────────┐  ┌────────▼──────────┐
              │      TGFEST        │ │      TGFITE       │  │  (Local Padrão)   │
              │    (ESTOQUE)       │ │  (Itens Nota)     │  │                   │
              │                    │ │                   │  └───────────────────┘
              │ PK: CODEMP         │ │ PK: NUNOTA        │
              │     CODPROD ───────┼─┼────►SEQUENCIA     │
              │     CODLOCAL       │ │ FK: CODPROD ──────┼──────┐
              │ ⭐ CONTROLE        │ │ ⭐ CONTROLE        │      │
              │     CODPARC        │ │     QTDNEG        │      │
              │     TIPO           │ │ ⭐ VLRUNIT (PREÇO)│      │
              │                    │ │     VLRTOT        │      │
              │     ESTOQUE        │ │ ⭐ ATUALESTOQUE   │      │
              │     ESTMIN/MAX     │ │     RESERVA       │      │
              └────────────────────┘ └─────────┬─────────┘      │
                                               │                │
                                               │ n:1            │
                                               │                │
                                      ┌────────▼─────────┐      │
                                      │     TGFCAB       │      │
                                      │  (Cabeçalho)     │      │
                                      │                  │      │
                                      │ PK: NUNOTA       │      │
                                      │     NUMNOTA      │      │
                                      │ ⭐ DTNEG (DATA)  │      │
                                      │ ⭐ TIPMOV        │      │ (C/V/Q)
                                      │     STATUSNOTA   │      │
                                      │ FK: CODTIPOPER   │      │
                                      │     CODPARC      │      │
                                      │     CODUSUINC    │      │
                                      └────┬────┬────┬───┘      │
                                           │    │    │          │
                     ┌─────────────────────┘    │    └──────────┼─────────────┐
                     │                          │               │             │
              ┌──────▼──────┐          ┌────────▼────────┐ ┌───▼───────┐ ┌───▼───────┐
              │   TGFTOP    │          │    TGFPAR       │ │  TSIUSU   │ │ (CODPROD) │
              │(Tipo Oper)  │          │  (Parceiros)    │ │ (Usuários)│ │           │
              │             │          │                 │ │           │ └───────────┘
              │PK:CODTIPOPER│          │ PK: CODPARC     │ │PK:CODUSU  │
              │   DHALTER   │          │     NOMEPARC    │ │  NOMEUSU  │
              │DESCROPER    │          │     CGC_CPF     │◄┤FK:CODPARC │
              │⭐TIPMOV     │          │     ATIVO       │ │  CODGRUPO │
              │  ATUALEST   │          └─────────────────┘ │FK:CODFUNC │
              └─────────────┘                              │   CODEMP  │
                                                           └─────┬─────┘
                                                                 │
                                                                 │ n:1 (chave composta!)
                                                                 │
                                                           ┌─────▼─────┐
                                                           │  TFPFUN   │
                                                           │(Funcionár)│
                                                           │           │
                                                           │PK:CODFUNC │
                                                           │   CODEMP  │
                                                           │  NOMEFUNC │
                                                           │FK:CODDEP  │
                                                           └─────┬─────┘
                                                                 │
                                                                 │ n:1
                                                                 │
                                                           ┌─────▼─────┐
                                                           │  TFPDEP   │
                                                           │(Departam) │
                                                           │           │
                                                           │PK:CODDEP  │
                                                           │  DESCRDEP │
                                                           │  ATIVO    │
                                                           └───────────┘
```

---

## 🔍 Detalhamento: CONTROLE de Produtos

### Como CONTROLE Funciona

```
TGFPRO (Produto Master)
│
├─ TIPCONTEST = 'N' (Sem controle)
│  │
│  ├─ TGFEST: 1 registro por CODLOCAL
│  │          CONTROLE = NULL ou vazio
│  │
│  └─ TGFITE: CONTROLE = NULL ou vazio
│             Análise de preço: Agrupar por CODPROD apenas ✅
│
│
├─ TIPCONTEST = 'S' (Lista - Tamanhos/Cores)
│  │
│  ├─ LISCONTEST = "BRANCA;CRISTAL;DOURADA"
│  │
│  ├─ TGFEST: MÚLTIPLOS registros por CODLOCAL
│  │          ├─ CONTROLE = 'BRANCA'   → ESTOQUE = 100
│  │          ├─ CONTROLE = 'CRISTAL'  → ESTOQUE = 50
│  │          └─ CONTROLE = 'DOURADA'  → ESTOQUE = 25
│  │
│  └─ TGFITE: Cada compra/consumo especifica:
│             ├─ CONTROLE = 'BRANCA'   → VLRUNIT = 12.00
│             ├─ CONTROLE = 'CRISTAL'  → VLRUNIT = 15.00
│             └─ CONTROLE = 'DOURADA'  → VLRUNIT = 18.00
│             Análise de preço: Agrupar por CODPROD + CONTROLE ⚠️
│
│
├─ TIPCONTEST = 'E' (Série - Equipamentos)
│  │
│  ├─ Cada unidade tem número único
│  │
│  ├─ TGFEST: MÚLTIPLOS registros
│  │          ├─ CONTROLE = 'XG (11)'  → ESTOQUE = 25
│  │          ├─ CONTROLE = 'GG (10)'  → ESTOQUE = 1
│  │          └─ CONTROLE = 'M (8)'    → ESTOQUE = 0
│  │
│  └─ TGFITE: Cada tamanho pode ter preço diferente:
│             ├─ CONTROLE = 'XG (11)'  → VLRUNIT = 81.25
│             ├─ CONTROLE = 'GG (10)'  → VLRUNIT = 4165.74 ⚠️
│             └─ CONTROLE = 'M (8)'    → VLRUNIT = ???
│             Análise de preço: Agrupar por CODPROD + CONTROLE ⚠️
│
│
└─ TIPCONTEST = 'L' (Lote - Rastreabilidade)
   │
   ├─ Medicamentos, alimentos
   │
   ├─ TGFEST: MÚLTIPLOS registros
   │          ├─ CONTROLE = 'LOTE2024-01'  → ESTOQUE = 100
   │          ├─ CONTROLE = 'LOTE2024-02'  → ESTOQUE = 150
   │          └─ CONTROLE = 'LOTE2024-03'  → ESTOQUE = 75
   │
   └─ TGFITE: Cada lote pode ter preço diferente (data compra):
              ├─ CONTROLE = 'LOTE2024-01'  → VLRUNIT = 50.00 (Jan)
              ├─ CONTROLE = 'LOTE2024-02'  → VLRUNIT = 55.00 (Mar)
              └─ CONTROLE = 'LOTE2024-03'  → VLRUNIT = 52.00 (Jun)
              Análise de preço: Agrupar por CODPROD + CONTROLE ⚠️
```

---

## 💰 Fluxo de Análise de Preço

### Produto SEM Controle (TIPCONTEST='N')

```
┌────────────────────────────────────────────────────────────────┐
│ Produto 3680 - PAPEL SULFITE A4 500 FOLHAS                     │
│ TIPCONTEST = 'N' (Sem controle)                                │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│ Query para Análise de Preço:                                   │
│                                                                 │
│ SELECT DTNEG, VLRUNIT, QTDNEG, VLRTOT                          │
│ FROM TGFITE ITE                                                │
│ JOIN TGFCAB CAB ON CAB.NUNOTA = ITE.NUNOTA                    │
│ WHERE ITE.CODPROD = 3680                                       │
│   AND CAB.DTNEG >= '2025-08-01'                                │
│   AND CAB.DTNEG <= '2026-01-31'                                │
│   AND CAB.TIPMOV = 'C'        -- Apenas COMPRAS                │
│   AND ITE.ATUALESTOQUE > 0    -- Apenas ENTRADAS               │
│ GROUP BY CODPROD              -- ✅ Sem CONTROLE               │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│ Resultado:                                                      │
│                                                                 │
│ 27/08/2025 → R$ 23,16 (100 un)                                 │
│ 29/10/2025 → R$ 22,70 (100 un)                                 │
│ 30/12/2025 → R$ 22,46 (100 un)                                 │
│                                                                 │
│ Preço Médio Ponderado: R$ 22,77                                │
│ Tendência: QUEDA (-3,01%)                                      │
└────────────────────────────────────────────────────────────────┘
```

### Produto COM Controle (TIPCONTEST='E')

```
┌────────────────────────────────────────────────────────────────┐
│ Produto 3867 - LUVA VAQUETA PROTECAO ANTI IMPACTO              │
│ TIPCONTEST = 'E' (Série - Tamanhos)                            │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│ Query para Análise de Preço (ADAPTADA!):                       │
│                                                                 │
│ SELECT CONTROLE, DTNEG, VLRUNIT, QTDNEG, VLRTOT                │
│ FROM TGFITE ITE                                                │
│ JOIN TGFCAB CAB ON CAB.NUNOTA = ITE.NUNOTA                    │
│ WHERE ITE.CODPROD = 3867                                       │
│   AND CAB.DTNEG >= '2026-01-01'                                │
│   AND CAB.DTNEG <= '2026-01-31'                                │
│   AND CAB.TIPMOV = 'C'                                         │
│   AND ITE.ATUALESTOQUE > 0                                     │
│ GROUP BY CODPROD, CONTROLE    -- ⚠️ COM CONTROLE!              │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│ Resultado POR CONTROLE:                                         │
│                                                                 │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ CONTROLE: 'XG (11)'                                      │   │
│ │ 15/01/2026 → R$ 81,25 (100 un)                           │   │
│ │ 15/01/2026 → R$ 81,25 (100 un)                           │   │
│ │ 15/01/2026 → R$ 81,25 (100 un)                           │   │
│ │ Preço Médio: R$ 81,25                                    │   │
│ │ Tendência: ESTAVEL (0%)                                  │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ CONTROLE: 'GG (10)'                                      │   │
│ │ 15/01/2026 → R$ 4.165,74 (1 un) ⚠️                       │   │
│ │ Preço Médio: R$ 4.165,74                                 │   │
│ │ Tendência: ESTAVEL (apenas 1 compra)                     │   │
│ │ ⚠️ ALERTA: Preço muito diferente do XG!                  │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│ Análise Geral (TODOS os controles):                            │
│   Preço Médio Ponderado: R$ 1.352,41 (⚠️ INÚTIL!)              │
│   Variação: 5024% (⚠️ ABSURDO!)                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 📈 Fluxo de Consumo

```
USUÁRIO FAZ REQUISIÇÃO
        │
        ▼
┌─────────────────┐
│    TGFCAB       │  ← Cria cabeçalho
│ NUNOTA: 123456  │
│ TIPMOV: 'Q'     │  (Requisição)
│ CODPARC: 3618   │  (DANUBIA.O)
│ CODUSUINC: 308  │  (DANUBIA.O)
│ DTNEG: hoje     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    TGFITE       │  ← Adiciona item
│ NUNOTA: 123456  │
│ CODPROD: 3680   │  (PAPEL SULFITE)
│ CONTROLE: NULL  │  (produto sem controle)
│ QTDNEG: 5       │
│ VLRUNIT: 23.69  │
│ ATUALESTOQUE: -1│  (CONSUMO - diminui estoque)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    TGFEST       │  ← Atualiza estoque
│ CODPROD: 3680   │
│ CODLOCAL: 105002│
│ CONTROLE: NULL  │
│ ESTOQUE: 153 → 148  (diminui 5 unidades)
└─────────────────┘
```

---

## 🎯 Estatísticas Reais do Sistema

### Distribuição de Produtos

```
Total: 13.281 produtos ativos

Por TIPCONTEST:
┌────┬─────────────────────┬─────────┬──────┐
│ N  │ Sem controle        │ 10.874  │ 82%  │
├────┼─────────────────────┼─────────┼──────┤
│ S  │ Lista (variações)   │  1.938  │ 15%  │
├────┼─────────────────────┼─────────┼──────┤
│ E  │ Série (equipament.) │    461  │  3%  │
├────┼─────────────────────┼─────────┼──────┤
│ L  │ Lote (rastreio)     │      7  │ <1%  │
├────┼─────────────────────┼─────────┼──────┤
│ P  │ Parceiro            │      1  │ <1%  │
└────┴─────────────────────┴─────────┴──────┘

⚠️ 2.407 produtos (18%) precisam análise POR CONTROLE!
```

### Top 5 Grupos

```
┌────────┬─────────────────────────┬─────────┐
│ 20102  │ MECANICA                │  7.261  │
├────────┼─────────────────────────┼─────────┤
│ 20101  │ ELETRICA AUTOMOTIVA     │  1.903  │
├────────┼─────────────────────────┼─────────┤
│ 10101  │ APOIO MECANICO          │    447  │
├────────┼─────────────────────────┼─────────┤
│ 20303  │ MATERIAL ESCRITORIO     │    335  │
├────────┼─────────────────────────┼─────────┤
│ 20600  │ FERRAMENTAS             │    266  │
└────────┴─────────────────────────┴─────────┘
```

### Top 5 Locais de Estoque

```
┌────────┬─────────────────────────┬──────────┬───────────┐
│ 101001 │ ALMOX PECAS             │  3.443   │ 121.595   │
├────────┼─────────────────────────┼──────────┼───────────┤
│ 0      │ SEM LOCAL               │    627   │  17.626   │
├────────┼─────────────────────────┼──────────┼───────────┤
│ 101005 │ FERRAMENTARIA           │    272   │   1.476   │
├────────┼─────────────────────────┼──────────┼───────────┤
│ 103001 │ ALMOX LOGISTICA         │    164   │  22.229   │
├────────┼─────────────────────────┼──────────┼───────────┤
│ 106003 │ GIGANTAO (DESCARTADOS)  │    138   │   7.451   │
└────────┴─────────────────────────┴──────────┴───────────┘
        (produtos)                (produtos)  (unidades)
```

---

## 🔑 Campos Críticos

### Para Análise de Preço

| Campo | Tabela | Importância | Uso |
|-------|--------|-------------|-----|
| **CODPROD** | TGFPRO/TGFITE | ⭐⭐⭐⭐⭐ | Identificação do produto |
| **TIPCONTEST** | TGFPRO | ⭐⭐⭐⭐⭐ | Define se tem controle |
| **CONTROLE** | TGFITE/TGFEST | ⭐⭐⭐⭐⭐ | Variação do produto |
| **VLRUNIT** | TGFITE | ⭐⭐⭐⭐⭐ | Preço unitário |
| **DTNEG** | TGFCAB | ⭐⭐⭐⭐⭐ | Data da compra |
| **TIPMOV** | TGFCAB/TGFTOP | ⭐⭐⭐⭐ | Tipo (C=Compra) |
| **ATUALESTOQUE** | TGFITE | ⭐⭐⭐⭐ | +1=Entrada, -1=Saída |
| **QTDNEG** | TGFITE | ⭐⭐⭐⭐ | Quantidade |

### Para Análise de Consumo

| Campo | Tabela | Importância | Uso |
|-------|--------|-------------|-----|
| **CODUSUINC** | TGFCAB | ⭐⭐⭐⭐ | Quem requisitou |
| **CODPARC** | TGFCAB | ⭐⭐⭐⭐ | Para quem foi |
| **CODGRUPO** | TSIUSU | ⭐⭐⭐ | Grupo do usuário |
| **CODFUNC** | TSIUSU | ⭐⭐⭐ | Funcionário |
| **CODDEP** | TFPFUN | ⭐⭐⭐ | Departamento |

---

## ✅ Conclusão

Este diagrama mostra que:

1. **CONTROLE** é campo CRÍTICO em TGFEST e TGFITE
2. **18% dos produtos** (2.407) têm variações que precisam análise separada
3. **Preços podem variar** por CONTROLE (ex: tamanho XG vs GG)
4. **Análise atual** só funciona para produtos simples (TIPCONTEST='N')
5. **Necessário implementar** análise adaptativa (com/sem controle)

**Próximo passo**: Implementar análise por CONTROLE para produtos S/E/L/P

---

**Arquivo JSON para DrawDB**: `DATABASE-DIAGRAM-PRODUTOS.ddb.json`
**Importar em**: https://www.drawdb.app/
