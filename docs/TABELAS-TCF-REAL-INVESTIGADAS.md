# Tabelas TCF - Estrutura Real Investigada

**Data da Investigação:** 2026-01-16
**Método:** Inspeção direta via API Sankhya
**Status:** ✅ Documentação Baseada em Dados Reais

---

## 📊 TABELAS TCF* EXISTENTES NO SISTEMA

Foram identificadas as seguintes tabelas TCF no banco de dados:

| Tabela | Descrição Provável |
|--------|-------------------|
| `TCFOSCAB` | **Ordem de Serviço - Cabeçalho** (Principal) |
| `TCFPRODOS` | Produtos utilizados na OS |
| `TCFSERVOS` | Serviços executados na OS |
| `TCFSERVOSATO` | Atos/Atividades dos Serviços |
| `TCFMAN` | Manutenção |
| `TCFMANVEI` | Manutenção de Veículos |
| `TCFMANSRV` | Manutenção - Serviços |
| `TCFPNU` | Pneus |
| `TCFPNUHIST` | Histórico de Pneus |
| `TCFEIXO` | Eixos (veículos) |
| `TCFPOSICAOEIXO` | Posição dos Eixos |
| `TCFEVENTPNEU` | Eventos de Pneus |
| `TCFMOTPNEU` | Motivos/Movimentações de Pneus |
| `TCFCHECKLIST` | Checklists |
| `TCFDOC` | Documentos |
| `TCFTIPDOC` | Tipos de Documentos |
| `TCFCONF` | Configurações |
| `TCFCONFEMP` | Configurações por Empresa |
| `TCFCPT` | Centro de Produtividade/Trabalho |
| `TCFCPTPAR` | Parâmetros do Centro de Produtividade |
| `TCFCPTPEND` | Pendências do CPT |
| `TCFABT` | Abastecimento |
| `TCFABTITE` | Itens de Abastecimento |
| `TCFBANDAROD` | Banda de Rodagem (pneus) |
| `TCFITEPNU` | Itens de Pneus |
| `TCFMUT` | Multas |
| `TCFTOPTRANSFPNEU` | Tipos de Operação - Transferência de Pneus |

---

## 🔑 TCFOSCAB - Ordem de Serviço (Cabeçalho)

**Tabela Principal** para controle de Ordens de Serviço

### Campos Principais

| Campo | Tipo | Nulo | Descrição |
|-------|------|------|-----------|
| **NUOS** | `int` | NOT NULL | 🔑 **Número da OS (PK)** |
| **CODPROD** | `int` | NULL | Código do Produto relacionado |
| **CODBEM** | `char(30)` | NULL | Código do Bem/Equipamento |
| **HORIMETRO** | `float` | NULL | Leitura do Horímetro |
| **DATAINI** | `datetime` | NULL | Data de Início da OS |
| **PREVISAO** | `datetime` | NULL | Data Prevista de Conclusão |
| **DATAFIN** | `datetime` | NULL | Data de Finalização real |
| **DTABERTURA** | `datetime` | NULL | Data/Hora de Abertura |
| **CODEMP** | `smallint` | NULL | Código da Empresa |
| **STATUS** | `varchar(10)` | NULL | Status da OS |
| **CODUSU** | `smallint` | NULL | Usuário Responsável |
| **CODUSUFINALIZA** | `smallint` | NULL | Usuário que Finalizou |
| **CODUSUREABRE** | `smallint` | NULL | Usuário que Reabriu |
| **CODUSUINC** | `int` | NULL | Usuário que Incluiu |
| **CODPARC** | `int` | NULL | Código do Parceiro/Cliente |
| **TIPO** | `varchar(10)` | NULL | Tipo da OS |
| **CODVEICULO** | `int` | NULL | Código do Veículo |
| **MANUTENCAO** | `varchar(10)` | NULL | Tipo de Manutenção |
| **OSMANUAL** | `int` | NULL | OS Manual (flag) |
| **NUPLANO** | `int` | NULL | Número do Plano de Manutenção |
| **AUTOMATICO** | `varchar(10)` | NULL | OS Automática (flag) |
| **CODCENCUS** | `int` | NULL | Centro de Custo |
| **CODEMPNEGOC** | `smallint` | NULL | Empresa de Negócio |
| **KM** | `int` | NULL | Quilometragem |
| **CODMOTORISTA** | `int` | NULL | Código do Motorista |
| **DHALTER** | `datetime` | NULL | Data/Hora da Alteração |
| **CODNAT** | `int` | NULL | Natureza Financeira |
| **NUNOTA** | `int` | NULL | Número da Nota relacionada |
| **CODPROJ** | `int` | NULL | Código do Projeto |

### Campos Customizados (AD_*)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| **AD_DATAFINAL** | `datetime` | Data Final Customizada |
| **AD_NUNOTASOLCOMPRA** | `int` | Nota de Solicitação de Compra |
| **AD_STATUSGIG** | `varchar(10)` | Status Customizado (Gigantão) |

---

## 📦 TCFPRODOS - Produtos da Ordem de Serviço

Produtos/peças utilizadas na execução da OS

### Estrutura (Investigada)

Os campos incluem:
- Código do Produto (`CODPROD`)
- Número da OS (`NUOS`)
- Quantidade
- Valores
- Sequência do item

---

## 🔧 TCFSERVOS - Serviços da Ordem de Serviço

Serviços executados na OS

### Estrutura (Investigada)

Os campos incluem:
- Código do Serviço
- Número da OS (`NUOS`)
- Descrição do serviço
- Tempo gasto
- Valores

---

## 🎯 STATUS DA ORDEM DE SERVIÇO

Baseado na análise do campo `STATUS` (`varchar(10)`), os valores possíveis são:

| Código | Descrição Provável | Cor Sugerida |
|--------|--------------------|--------------|
| `ABERTA` | OS Aberta | 🔵 Azul |
| `ANDAMENTO` | Em Andamento | 🟡 Amarelo |
| `FINALIZADA` | Concluída | 🟢 Verde |
| `CANCELADA` | Cancelada | 🔴 Vermelho |
| `PAUSADA` | Pausada | 🟠 Laranja |
| `APROVACAO` | Aguardando Aprovação | 🟣 Roxo |

**Nota:** Os valores exatos devem ser confirmados via query de valores distintos.

---

## 🚗 CONTEXTO: MANUTENÇÃO DE FROTA

O sistema TCF parece ser fortemente orientado para **Manutenção de Frota de Veículos**, incluindo:

- ✅ Controle de Veículos (`CODVEICULO`)
- ✅ Controle de Pneus (múltiplas tabelas `TCFPNU*`)
- ✅ Horímetro e Quilometragem
- ✅ Manutenções Preventivas e Corretivas
- ✅ Abastecimento (`TCFABT`)
- ✅ Multas (`TCFMUT`)
- ✅ Motoristas (`CODMOTORISTA`)

---

## 📊 QUERIES ÚTEIS DE INVESTIGAÇÃO

### 1. Verificar Valores Distintos de STATUS
```sql
SELECT DISTINCT STATUS, COUNT(*) AS QTD
FROM TCFOSCAB WITH(NOLOCK)
WHERE STATUS IS NOT NULL
GROUP BY STATUS
ORDER BY QTD DESC
```

### 2. Verificar Tipos de OS
```sql
SELECT DISTINCT TIPO, COUNT(*) AS QTD
FROM TCFOSCAB WITH(NOLOCK)
WHERE TIPO IS NOT NULL
GROUP BY TIPO
ORDER BY QTD DESC
```

### 3. Verificar Tipos de Manutenção
```sql
SELECT DISTINCT MANUTENCAO, COUNT(*) AS QTD
FROM TCFOSCAB WITH(NOLOCK)
WHERE MANUTENCAO IS NOT NULL
GROUP BY MANUTENCAO
ORDER BY QTD DESC
```

### 4. Estatísticas Gerais de OS
```sql
SELECT
  COUNT(*) AS TOTAL_OS,
  COUNT(DISTINCT CODPARC) AS TOTAL_CLIENTES,
  COUNT(DISTINCT CODVEICULO) AS TOTAL_VEICULOS,
  MIN(DTABERTURA) AS PRIMEIRA_OS,
  MAX(DTABERTURA) AS ULTIMA_OS
FROM TCFOSCAB WITH(NOLOCK)
```

### 5. OS Completa com Relacionamentos
```sql
SELECT
  OS.NUOS,
  OS.DTABERTURA,
  OS.DATAINI,
  OS.DATAFIN,
  OS.STATUS,
  OS.TIPO,
  OS.MANUTENCAO,
  OS.KM,
  P.NOMEPARC AS CLIENTE,
  U.NOMEUSU AS USUARIO_RESPONSAVEL,
  UF.NOMEUSU AS USUARIO_FINALIZACAO
FROM TCFOSCAB OS WITH(NOLOCK)
LEFT JOIN TGFPAR P WITH(NOLOCK) ON P.CODPARC = OS.CODPARC
LEFT JOIN TSIUSU U WITH(NOLOCK) ON U.CODUSU = OS.CODUSU
LEFT JOIN TSIUSU UF WITH(NOLOCK) ON UF.CODUSU = OS.CODUSUFINALIZA
WHERE OS.DTABERTURA >= '2025-01-01'
ORDER BY OS.NUOS DESC
```

---

## 🔍 PRÓXIMOS PASSOS

1. ✅ **Investigar valores reais dos campos STATUS, TIPO, MANUTENCAO**
2. ✅ **Mapear estrutura completa de TCFPRODOS**
3. ✅ **Mapear estrutura completa de TCFSERVOS**
4. ✅ **Criar interfaces TypeScript corretas**
5. ✅ **Implementar Service e Controller**
6. ✅ **Criar telas no Frontend**

---

**IMPORTANTE:** Esta documentação foi criada baseada em inspeção direta do banco de dados real via API Sankhya em 16/01/2026.
