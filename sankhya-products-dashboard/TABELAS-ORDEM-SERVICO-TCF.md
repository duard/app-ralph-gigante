# Tabelas de Ordem de Serviço - Módulo TCF (Sankhya)

**Data:** 2026-01-15
**Módulo:** TCF - Ordem de Serviço e Manutenção
**Diferença:** TCF (Ordem Serviço) vs TGF (Comercial/Fiscal)

---

## 📋 TABELAS PRINCIPAIS DO MÓDULO TCF

### **TCFOSE** - Ordem de Serviço (Cabeçalho)
**Descrição:** Tabela principal de cabeçalho das Ordens de Serviço

**Campos Principais:**
- `NUMOSE` - Número da Ordem de Serviço (PK)
- `CODPARC` - Código do Parceiro/Cliente
- `DTABERTURA` - Data de Abertura da OS
- `DTPREVENTREGA` - Data Prevista de Entrega
- `DTENCERRAMENTO` - Data de Encerramento
- `STATUS` - Status da OS (Aberta, Em Andamento, Concluída, Cancelada)
- `CODEQUIP` - Código do Equipamento (se aplicável)
- `DEFEITO` - Descrição do Defeito/Problema
- `SOLUCAO` - Solução Aplicada
- `OBSERVACAO` - Observações Gerais
- `CODTEC` - Código do Técnico Responsável
- `PRIORIDADE` - Prioridade da OS (Baixa, Média, Alta, Urgente)
- `TIPO` - Tipo de OS (Manutenção Preventiva, Corretiva, Instalação, etc.)
- `VLRTOTAL` - Valor Total da OS
- `CODUSU` - Código do Usuário que Criou
- `DTINCLUSAO` - Data/Hora de Inclusão

**Relacionamentos:**
- → `TGFPAR` (Parceiros/Clientes)
- → `TSIUSU` (Usuários/Técnicos)
- → `TCFEQU` (Equipamentos - se existir)

---

### **TCFITE** - Itens da Ordem de Serviço
**Descrição:** Produtos/Serviços utilizados na OS

**Campos Principais:**
- `NUMOSE` - Número da OS (FK → TCFOSE)
- `SEQUENCIA` - Sequência do Item
- `CODPROD` - Código do Produto/Serviço
- `QTDNEG` - Quantidade Utilizada
- `VLRUNIT` - Valor Unitário
- `VLRTOTAL` - Valor Total do Item
- `TIPO` - Tipo do Item (Produto, Serviço, Mão de Obra)
- `OBSERVACAO` - Observação do Item

**Relacionamentos:**
- → `TCFOSE` (Cabeçalho da OS)
- → `TGFPRO` (Produtos)

---

### **TCFMOV** - Movimentações da OS
**Descrição:** Histórico de movimentações e alterações de status

**Campos Principais:**
- `NUMMOV` - Número da Movimentação (PK)
- `NUMOSE` - Número da OS (FK → TCFOSE)
- `DTMOV` - Data/Hora da Movimentação
- `CODUSUMOV` - Usuário que Movimentou
- `STATUSANT` - Status Anterior
- `STATUSNOVO` - Status Novo
- `OBSERVACAO` - Observação da Movimentação

---

### **TCFEQU** - Equipamentos/Ativos
**Descrição:** Cadastro de equipamentos para manutenção

**Campos Principais:**
- `CODEQUIP` - Código do Equipamento (PK)
- `DESCRICAO` - Descrição do Equipamento
- `NUMSERIE` - Número de Série
- `MODELO` - Modelo
- `FABRICANTE` - Fabricante
- `CODPARC` - Cliente Proprietário
- `DTAQUISICAO` - Data de Aquisição
- `STATUS` - Status do Equipamento (Ativo, Manutenção, Inativo)
- `LOCALIZACAO` - Localização Física

---

### **TCFSER** - Serviços (Catálogo)
**Descrição:** Catálogo de serviços disponíveis

**Campos Principais:**
- `CODSER` - Código do Serviço (PK)
- `DESCRSER` - Descrição do Serviço
- `VLRPADRAO` - Valor Padrão
- `TEMPOMEDIO` - Tempo Médio de Execução (minutos)
- `ATIVO` - Ativo (S/N)

---

### **TCFTEC** - Técnicos
**Descrição:** Cadastro de técnicos (pode ser link para TSIUSU)

**Campos Principais:**
- `CODTEC` - Código do Técnico (PK ou FK → TSIUSU)
- `NOMETEC` - Nome do Técnico
- `ESPECIALIDADE` - Especialidade
- `STATUS` - Status (Ativo, Férias, Afastado)

---

## 🔍 QUERIES ÚTEIS

### 1. Listar Ordens de Serviço Abertas
```sql
SELECT
  OS.NUMOSE,
  OS.DTABERTURA,
  OS.DTPREVENTREGA,
  P.NOMEPARC AS CLIENTE,
  OS.DEFEITO,
  OS.STATUS,
  OS.PRIORIDADE,
  U.NOMEUSU AS TECNICO,
  OS.VLRTOTAL
FROM TCFOSE OS WITH(NOLOCK)
LEFT JOIN TGFPAR P WITH(NOLOCK) ON P.CODPARC = OS.CODPARC
LEFT JOIN TSIUSU U WITH(NOLOCK) ON U.CODUSU = OS.CODTEC
WHERE OS.STATUS IN ('A', 'E') -- A=Aberta, E=Em Andamento
ORDER BY OS.PRIORIDADE DESC, OS.DTABERTURA ASC;
```

### 2. Detalhes de uma OS Específica
```sql
-- Cabeçalho
SELECT
  OS.*,
  P.NOMEPARC,
  P.TELEFONE,
  P.EMAIL,
  T.NOMEUSU AS TECNICO,
  U.NOMEUSU AS USUARIO_CRIACAO
FROM TCFOSE OS WITH(NOLOCK)
LEFT JOIN TGFPAR P WITH(NOLOCK) ON P.CODPARC = OS.CODPARC
LEFT JOIN TSIUSU T WITH(NOLOCK) ON T.CODUSU = OS.CODTEC
LEFT JOIN TSIUSU U WITH(NOLOCK) ON U.CODUSU = OS.CODUSU
WHERE OS.NUMOSE = 123456;

-- Itens
SELECT
  I.SEQUENCIA,
  I.CODPROD,
  PR.DESCRPROD,
  I.QTDNEG,
  I.VLRUNIT,
  I.VLRTOTAL,
  I.TIPO
FROM TCFITE I WITH(NOLOCK)
LEFT JOIN TGFPRO PR WITH(NOLOCK) ON PR.CODPROD = I.CODPROD
WHERE I.NUMOSE = 123456
ORDER BY I.SEQUENCIA;

-- Histórico de Movimentações
SELECT
  M.DTMOV,
  U.NOMEUSU AS USUARIO,
  M.STATUSANT,
  M.STATUSNOVO,
  M.OBSERVACAO
FROM TCFMOV M WITH(NOLOCK)
LEFT JOIN TSIUSU U WITH(NOLOCK) ON U.CODUSU = M.CODUSUMOV
WHERE M.NUMOSE = 123456
ORDER BY M.DTMOV DESC;
```

### 3. OS por Período com Estatísticas
```sql
SELECT
  OS.STATUS,
  COUNT(*) AS TOTAL_OS,
  SUM(OS.VLRTOTAL) AS VALOR_TOTAL,
  AVG(DATEDIFF(DAY, OS.DTABERTURA,
    COALESCE(OS.DTENCERRAMENTO, GETDATE()))) AS TEMPO_MEDIO_DIAS
FROM TCFOSE OS WITH(NOLOCK)
WHERE OS.DTABERTURA BETWEEN '2025-01-01' AND '2025-12-31'
GROUP BY OS.STATUS
ORDER BY TOTAL_OS DESC;
```

### 4. Top Produtos/Serviços Utilizados
```sql
SELECT TOP 10
  I.CODPROD,
  P.DESCRPROD,
  COUNT(DISTINCT I.NUMOSE) AS QTD_OS,
  SUM(I.QTDNEG) AS QTD_TOTAL,
  SUM(I.VLRTOTAL) AS VALOR_TOTAL
FROM TCFITE I WITH(NOLOCK)
INNER JOIN TCFOSE OS WITH(NOLOCK) ON OS.NUMOSE = I.NUMOSE
LEFT JOIN TGFPRO P WITH(NOLOCK) ON P.CODPROD = I.CODPROD
WHERE OS.DTABERTURA >= DATEADD(MONTH, -6, GETDATE())
GROUP BY I.CODPROD, P.DESCRPROD
ORDER BY QTD_OS DESC;
```

### 5. Performance de Técnicos
```sql
SELECT
  T.CODTEC,
  U.NOMEUSU AS TECNICO,
  COUNT(*) AS TOTAL_OS,
  SUM(CASE WHEN OS.STATUS = 'C' THEN 1 ELSE 0 END) AS OS_CONCLUIDAS,
  SUM(CASE WHEN OS.STATUS IN ('A','E') THEN 1 ELSE 0 END) AS OS_PENDENTES,
  AVG(CASE
    WHEN OS.DTENCERRAMENTO IS NOT NULL
    THEN DATEDIFF(DAY, OS.DTABERTURA, OS.DTENCERRAMENTO)
  END) AS TEMPO_MEDIO_CONCLUSAO_DIAS,
  SUM(OS.VLRTOTAL) AS VALOR_TOTAL_SERVICOS
FROM TCFOSE OS WITH(NOLOCK)
INNER JOIN TSIUSU U WITH(NOLOCK) ON U.CODUSU = OS.CODTEC
WHERE OS.DTABERTURA >= DATEADD(MONTH, -3, GETDATE())
GROUP BY OS.CODTEC, U.NOMEUSU
ORDER BY OS_CONCLUIDAS DESC;
```

### 6. Equipamentos com Mais Manutenções
```sql
SELECT
  E.CODEQUIP,
  E.DESCRICAO AS EQUIPAMENTO,
  E.MODELO,
  E.NUMSERIE,
  P.NOMEPARC AS CLIENTE,
  COUNT(*) AS TOTAL_MANUTENCOES,
  MAX(OS.DTABERTURA) AS ULTIMA_MANUTENCAO
FROM TCFOSE OS WITH(NOLOCK)
INNER JOIN TCFEQU E WITH(NOLOCK) ON E.CODEQUIP = OS.CODEQUIP
LEFT JOIN TGFPAR P WITH(NOLOCK) ON P.CODPARC = E.CODPARC
WHERE OS.DTABERTURA >= DATEADD(YEAR, -1, GETDATE())
GROUP BY E.CODEQUIP, E.DESCRICAO, E.MODELO, E.NUMSERIE, P.NOMEPARC
ORDER BY TOTAL_MANUTENCOES DESC;
```

---

## 📊 STATUS COMUNS

| Código | Descrição | Cor Sugerida |
|--------|-----------|--------------|
| A | Aberta | 🔵 Azul |
| E | Em Andamento | 🟡 Amarelo |
| C | Concluída | 🟢 Verde |
| X | Cancelada | 🔴 Vermelho |
| P | Pausada | 🟠 Laranja |
| G | Aguardando Peças | ⚪ Cinza |

---

## 📊 PRIORIDADES

| Código | Descrição | Cor |
|--------|-----------|-----|
| 1 | Baixa | 🟢 Verde |
| 2 | Média | 🟡 Amarelo |
| 3 | Alta | 🟠 Laranja |
| 4 | Urgente | 🔴 Vermelho |

---

## 🎯 PRÓXIMOS PASSOS PARA IMPLEMENTAÇÃO

### Backend (NestJS)
1. ✅ Criar módulo `src/sankhya/tcfose/`
2. ✅ Criar DTOs:
   - `OrdemServicoDto`
   - `OrdemServicoDetalhadaDto`
   - `CreateOrdemServicoDto`
   - `UpdateOrdemServicoDto`
3. ✅ Criar endpoints:
   - `GET /tcfose` - Listar OS
   - `GET /tcfose/:numose` - Detalhes da OS
   - `POST /tcfose` - Criar OS
   - `PUT /tcfose/:numose` - Atualizar OS
   - `GET /tcfose/:numose/itens` - Itens da OS
   - `GET /tcfose/:numose/historico` - Histórico
   - `GET /tcfose/stats` - Estatísticas

### Frontend (React)
1. ✅ Criar rota `/ordens-servico`
2. ✅ Páginas:
   - Lista de OS (com filtros)
   - Detalhes da OS
   - Criar/Editar OS
   - Dashboard de OS
3. ✅ Adicionar ao command menu

---

## ⚠️ VALIDAÇÃO NECESSÁRIA

**IMPORTANTE:** Essas tabelas são baseadas no padrão Sankhya para módulo de Ordem de Serviço. É necessário **verificar na base de dados real** se:

1. ✅ As tabelas TCF* existem nesta instalação
2. ✅ Os nomes de campos estão corretos
3. ✅ Há campos customizados (AD_*)
4. ✅ Os códigos de status/prioridade usados pela empresa

Execute a query de verificação:
```sql
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME LIKE 'TCF%'
ORDER BY TABLE_NAME;
```

---

**Diferença TGF vs TCF:**
- **TGF** = Módulo Comercial/Fiscal (Vendas, Compras, Notas Fiscais)
- **TCF** = Módulo de Ordem de Serviço/Manutenção (Serviços, OS, Equipamentos)
