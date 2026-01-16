# Sistema Completo de Ordens de Serviço de Manutenção

**Data:** 2026-01-16
**Status:** ✅ Documentação baseada em investigação real do banco de dados
**Baseado em:** SQL `/home/carloshome/z-ralph-code/sql/os-homem-hora.sql`

---

## 📊 VISÃO GERAL DO SISTEMA

O sistema de Ordens de Serviço (TCF) é orientado para **Manutenção de Frota de Veículos** com controle avançado de:

- ✅ Apontamentos de horas trabalhadas (homem-hora)
- ✅ Múltiplos executores/ajudantes por serviço
- ✅ Controle de intervalos
- ✅ Produtos e serviços utilizados
- ✅ Integração com veículos e equipamentos
- ✅ Rastreamento completo de tempo e produtividade

### Estatísticas do Sistema

- **12.837** Ordens de Serviço registradas
- **220** Veículos em manutenção
- **12.784** OS finalizadas
- Dados desde **09/02/2022**

---

## 🗂️ ARQUITETURA DE TABELAS

### Hierarquia das Tabelas TCF

```
TCFOSCAB (Cabeçalho da OS)
    ├── TCFSERVOS (Serviços/Atividades)
    │   └── TCFSERVOSATO (Apontamentos de Tempo)
    │       └── Executores + Intervalos + Horas
    └── TCFPRODOS (Produtos/Peças Utilizadas)
```

---

## 🔑 TABELA: TCFOSCAB (Cabeçalho da OS)

### Campos Principais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| **NUOS** | `int` | 🔑 Número da OS (PK) |
| **DTABERTURA** | `datetime` | Data/Hora de Abertura |
| **DATAINI** | `datetime` | Data de Início dos Trabalhos |
| **DATAFIN** | `datetime` | Data de Finalização |
| **PREVISAO** | `datetime` | Previsão de Conclusão |
| **STATUS** | `varchar(10)` | Status da OS |
| **TIPO** | `varchar(10)` | Tipo da OS (I=Interna, E=Externa) |
| **MANUTENCAO** | `varchar(10)` | Tipo de Manutenção |
| **CODVEICULO** | `int` | FK → TGFVEI (Veículo) |
| **CODPARC** | `int` | FK → TGFPAR (Cliente/Fornecedor) |
| **CODUSUINC** | `int` | Usuário que Criou |
| **CODUSU** | `smallint` | Usuário Responsável |
| **CODUSUFINALIZA** | `smallint` | Usuário que Finalizou |
| **CODUSUREABRE** | `smallint` | Usuário que Reabriu |
| **KM** | `int` | Quilometragem |
| **HORIMETRO** | `float` | Horímetro |
| **CODCENCUS** | `int` | Centro de Custo |
| **NUNOTA** | `int` | Nota Fiscal Relacionada |

### STATUS (Valores Reais)

| Código | Quantidade | Descrição |
|--------|------------|-----------|
| **F** | 12.784 | ✅ Finalizada |
| **E** | 31 | 🔧 Em Execução |
| **A** | 20 | 📋 Aberta |
| **R** | 2 | 🔄 Reaberta |

### TIPO (Valores Reais)

| Código | Quantidade | Descrição |
|--------|------------|-----------|
| **I** | 8.750 | Interna |
| **E** | 3.998 | Externa |

### MANUTENÇÃO (Valores Reais)

| Código | Quantidade | Descrição |
|--------|------------|-----------|
| **C** | 7.239 | Corretiva |
| **P** | 3.825 | Preventiva |
| **O** | 1.198 | Outros |
| **CP** | - | Corretiva Programada |
| **PG** | - | Preventiva de Garantia |
| **L** | - | Logística |
| **R** | 22 | Reforma |
| **S** | 89 | Socorro |
| **T** | - | Retorno |
| **I** | - | Inventário |

---

## 🔧 TABELA: TCFSERVOS (Serviços da OS)

Serviços/atividades executadas em cada OS.

### Campos Principais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| **NUOS** | `int` | FK → TCFOSCAB |
| **SEQUENCIA** | `int` | Sequência do Serviço (PK composta) |
| **CODPROD** | `int` | FK → TGFPRO (Serviço cadastrado) |
| **QTD** | `float` | Quantidade |
| **VLRUNIT** | `float` | Valor Unitário |
| **VLRTOT** | `float` | Valor Total |
| **DATAINI** | `datetime` | Data Início do Serviço |
| **DATAFIN** | `datetime` | Data Fim do Serviço |
| **TEMPO** | `float` | Tempo Estimado (horas) |
| **STATUS** | `varchar(10)` | Status do Serviço |
| **OBSERVACAO** | `varchar(1000)` | Observações |
| **NUNOTA** | `int` | Nota Relacionada |
| **CODPARC** | `int` | Fornecedor do Serviço |
| **CONTROLE** | `varchar(100)` | Controle Específico |

### STATUS do Serviço

| Código | Descrição |
|--------|-----------|
| **F** | Finalizado |
| **E** | Em Execução |
| **A** | Aberto |
| **R** | Reaberto |

---

## ⏱️ TABELA: TCFSERVOSATO (Apontamentos de Tempo)

**Tabela crucial** para controle de horas trabalhadas. Permite múltiplos apontamentos por serviço (múltiplos executores).

### Campos Principais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| **NUOS** | `int` | FK → TCFOSCAB |
| **ID** | `int` | ID do Apontamento (PK) |
| **SEQUENCIA** | `int` | FK → TCFSERVOS.SEQUENCIA |
| **CODEXEC** | `smallint` | FK → TSIUSU (Executor/Colaborador) |
| **DHINI** | `datetime` | ⏰ Data/Hora Início |
| **DHFIN** | `datetime` | ⏰ Data/Hora Fim |
| **INTERVALO** | `int` | Intervalo em minutos ou formato HHMM |
| **STATUS** | `varchar(10)` | Status do Apontamento |
| **DHAPONT** | `datetime` | Data/Hora do Apontamento |
| **AD_DESCR** | `text` | Descrição/Observação Customizada |

### Cálculo de Homem-Hora

```sql
-- Minutos Trabalhados
DATEDIFF(MINUTE, DHINI, DHFIN)

-- Intervalo em Minutos (lógica especial)
CASE
  WHEN INTERVALO IS NULL THEN 0
  WHEN INTERVALO >= 100 AND (INTERVALO % 100) < 60
    THEN (INTERVALO / 100) * 60 + (INTERVALO % 100)  -- Formato HHMM
  ELSE INTERVALO  -- Já em minutos
END

-- Minutos Líquidos
MinutosTrabalhados - IntervaloMinutos

-- Hora-Homem (considerando múltiplos executores)
SUM(MinutosLiquidos * QtdExecutores)
```

---

## 📦 TABELA: TCFPRODOS (Produtos/Peças da OS)

Produtos e peças utilizadas na execução da OS.

### Campos Principais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| **NUOS** | `int` | FK → TCFOSCAB |
| **SEQUENCIA** | `int` | Sequência do Produto (PK composta) |
| **CODPROD** | `int` | FK → TGFPRO |
| **CODLOCAL** | `int` | Local de Estoque |
| **CODVOL** | `varchar(100)` | Unidade de Medida |
| **CONTROLE** | `varchar(100)` | Lote/Série |
| **QTDNEG** | `float` | Quantidade Utilizada |
| **VLRUNIT** | `float` | Valor Unitário |
| **VLRTOT** | `float` | Valor Total |
| **OBSERVACAO** | `varchar(1000)` | Observações |
| **NUNOTA** | `int` | Nota de Saída |
| **CODPARC** | `int` | Fornecedor |

### Campos Customizados Importantes

| Campo | Descrição |
|-------|-----------|
| **AD_CODGRUPOPROD** | Grupo do Produto |
| **AD_NUNOTASOL** | Nota de Solicitação |
| **AD_NUNOTAREQ** | Nota de Requisição |
| **AD_DTINICIOGARANT** | Início da Garantia |
| **AD_DTIFIMGARANT** | Fim da Garantia |
| **AD_DTENVIO** | Data de Envio |
| **AD_DTRETORNO** | Data de Retorno |

---

## 📊 QUERIES ESSENCIAIS

### 1. OS Completa com Serviços e Apontamentos

```sql
SELECT
    cab.NUOS,
    cab.DTABERTURA,
    cab.STATUS AS StatusOS,
    cab.TIPO,
    cab.MANUTENCAO,

    -- Veículo
    vei.PLACA,
    vei.MARCAMODELO,
    cab.KM,

    -- Serviço
    serv.SEQUENCIA AS SeqServico,
    p.DESCRPROD AS DescricaoServico,
    serv.STATUS AS StatusServico,
    serv.OBSERVACAO,

    -- Apontamento
    ato.ID AS IdApontamento,
    usu.NOMEUSU AS Executor,
    ato.DHINI AS InicioTrabalho,
    ato.DHFIN AS FimTrabalho,
    DATEDIFF(MINUTE, ato.DHINI, ato.DHFIN) AS MinutosTrabalhados,
    ato.INTERVALO,
    ato.AD_DESCR AS DescricaoApontamento

FROM TCFOSCAB cab WITH(NOLOCK)
LEFT JOIN TCFSERVOS serv WITH(NOLOCK) ON cab.NUOS = serv.NUOS
LEFT JOIN TCFSERVOSATO ato WITH(NOLOCK) ON serv.NUOS = ato.NUOS
    AND serv.SEQUENCIA = ato.SEQUENCIA
LEFT JOIN TGFPRO p WITH(NOLOCK) ON serv.CODPROD = p.CODPROD
LEFT JOIN TGFVEI vei WITH(NOLOCK) ON cab.CODVEICULO = vei.CODVEICULO
LEFT JOIN TSIUSU usu WITH(NOLOCK) ON ato.CODEXEC = usu.CODUSU

WHERE cab.NUOS = :numOS
ORDER BY serv.SEQUENCIA, ato.DHINI
```

### 2. Produtividade por Executante

```sql
SELECT
    ato.CODEXEC,
    usu.NOMEUSU AS Executor,
    COUNT(DISTINCT cab.NUOS) AS TotalOS,
    COUNT(DISTINCT ato.ID) AS TotalApontamentos,
    SUM(DATEDIFF(MINUTE, ato.DHINI, ato.DHFIN)) AS MinutosTotais,
    SUM(DATEDIFF(MINUTE, ato.DHINI, ato.DHFIN)) / 60.0 AS HorasTotais,
    AVG(DATEDIFF(MINUTE, ato.DHINI, ato.DHFIN)) AS MediaMinutosPorApontamento

FROM TCFSERVOSATO ato WITH(NOLOCK)
JOIN TCFOSCAB cab WITH(NOLOCK) ON ato.NUOS = cab.NUOS
JOIN TSIUSU usu WITH(NOLOCK) ON ato.CODEXEC = usu.CODUSU

WHERE ato.DHINI >= DATEADD(MONTH, -1, GETDATE())
    AND ato.DHFIN IS NOT NULL
    AND cab.STATUS = 'F'

GROUP BY ato.CODEXEC, usu.NOMEUSU
ORDER BY HorasTotais DESC
```

### 3. Produtos Mais Utilizados em Manutenção

```sql
SELECT TOP 20
    prod.CODPROD,
    pr.DESCRPROD,
    pr.REFERENCIA,
    COUNT(DISTINCT prod.NUOS) AS QtdOS,
    SUM(prod.QTDNEG) AS QtdTotal,
    SUM(prod.VLRTOT) AS ValorTotal,
    AVG(prod.VLRUNIT) AS ValorMedio

FROM TCFPRODOS prod WITH(NOLOCK)
JOIN TGFPRO pr WITH(NOLOCK) ON prod.CODPROD = pr.CODPROD
JOIN TCFOSCAB cab WITH(NOLOCK) ON prod.NUOS = cab.NUOS

WHERE cab.DTABERTURA >= DATEADD(MONTH, -6, GETDATE())

GROUP BY prod.CODPROD, pr.DESCRPROD, pr.REFERENCIA
ORDER BY ValorTotal DESC
```

### 4. Dashboard de OS

```sql
SELECT
    -- Por Status
    SUM(CASE WHEN STATUS = 'F' THEN 1 ELSE 0 END) AS Finalizadas,
    SUM(CASE WHEN STATUS = 'E' THEN 1 ELSE 0 END) AS EmExecucao,
    SUM(CASE WHEN STATUS = 'A' THEN 1 ELSE 0 END) AS Abertas,
    SUM(CASE WHEN STATUS = 'R' THEN 1 ELSE 0 END) AS Reabertas,

    -- Por Tipo de Manutenção
    SUM(CASE WHEN MANUTENCAO = 'P' THEN 1 ELSE 0 END) AS Preventivas,
    SUM(CASE WHEN MANUTENCAO = 'C' THEN 1 ELSE 0 END) AS Corretivas,
    SUM(CASE WHEN MANUTENCAO = 'O' THEN 1 ELSE 0 END) AS Outras,

    -- Tempos Médios
    AVG(DATEDIFF(DAY, DTABERTURA, ISNULL(DATAFIN, GETDATE()))) AS TempoMedioDias,

    -- Totais
    COUNT(*) AS TotalOS,
    COUNT(DISTINCT CODVEICULO) AS TotalVeiculos

FROM TCFOSCAB WITH(NOLOCK)
WHERE DTABERTURA >= DATEADD(MONTH, -3, GETDATE())
```

---

## 🎯 ENDPOINTS NECESSÁRIOS (Backend NestJS)

### Módulo: `tcfoscab`

#### Ordens de Serviço

- `GET /tcfoscab` - Listar OS com filtros
- `GET /tcfoscab/:nuos` - Detalhes da OS
- `GET /tcfoscab/:nuos/servicos` - Serviços da OS
- `GET /tcfoscab/:nuos/produtos` - Produtos da OS
- `GET /tcfoscab/:nuos/apontamentos` - Apontamentos de tempo
- `GET /tcfoscab/:nuos/timeline` - Timeline completa da OS

#### Estatísticas e Dashboards

- `GET /tcfoscab/stats/geral` - Estatísticas gerais
- `GET /tcfoscab/stats/por-status` - Agrupado por status
- `GET /tcfoscab/stats/por-tipo-manutencao` - Agrupado por tipo
- `GET /tcfoscab/stats/produtividade` - Produtividade por executor
- `GET /tcfoscab/stats/produtos-mais-usados` - Produtos mais utilizados
- `GET /tcfoscab/stats/veiculos` - Estatísticas por veículo

#### Relatórios

- `GET /tcfoscab/relatorio/homem-hora` - Relatório de homem-hora
- `GET /tcfoscab/relatorio/produtividade` - Produtividade detalhada
- `GET /tcfoscab/export/excel` - Exportar para Excel

---

## 🎨 TELAS NECESSÁRIAS (Frontend React)

### 1. Dashboard de OS
- Cards com totais por status
- Gráfico de pizza: tipos de manutenção
- Gráfico de linha: OS ao longo do tempo
- Top 5 executores por produtividade
- Top 5 veículos com mais manutenções

### 2. Listagem de OS
- Tabela com filtros avançados
- Busca por número, veículo, executor
- Filtros: status, tipo, data, veículo
- Paginação
- Ações: ver detalhes, editar, imprimir

### 3. Detalhes da OS
- Informações gerais (cabeçalho)
- Timeline de eventos
- Lista de serviços com apontamentos
- Lista de produtos utilizados
- Total de horas trabalhadas
- Total de custos

### 4. Apontamento de Horas
- Form para registrar início/fim de trabalho
- Controle de intervalos
- Seleção de executor
- Descrição da atividade

### 5. Relatório de Produtividade
- Filtros por período, executor, veículo
- Tabela com homem-hora líquido
- Gráficos de produtividade
- Exportar para Excel/PDF

---

## 📁 ESTRUTURA DE ARQUIVOS

```
backend/src/sankhya/tcfoscab/
├── models/
│   ├── tcfoscab.interface.ts       # Interfaces principais
│   ├── tcfservos.interface.ts
│   ├── tcfservosato.interface.ts
│   ├── tcfprodos.interface.ts
│   └── tcfoscab.dto.ts             # DTOs
├── tcfoscab.module.ts
├── tcfoscab.controller.ts
├── tcfoscab.service.ts
└── relatorios/
    ├── homem-hora.service.ts
    └── produtividade.service.ts

frontend/src/app/ordens-servico/
├── page.tsx                        # Lista de OS
├── [nuos]/
│   ├── page.tsx                    # Detalhes da OS
│   └── apontamentos/
│       └── page.tsx                # Apontamentos
├── dashboard/
│   └── page.tsx                    # Dashboard
├── components/
│   ├── os-list.tsx
│   ├── os-details-card.tsx
│   ├── os-timeline.tsx
│   ├── os-servicos-table.tsx
│   ├── os-produtos-table.tsx
│   ├── apontamento-form.tsx
│   └── os-stats-cards.tsx
└── relatorios/
    └── produtividade/
        └── page.tsx
```

---

**Próximos Passos:** Implementar backend completo e criar telas no frontend!
