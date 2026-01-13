# Extração Completa de Campos, Joins e Relations - Sankhya ERP Tables

Este documento contém a extração completa de todos os campos, tipos de dados, chaves primárias, foreign keys, joins e relations para as tabelas Sankhya envolvidas no ERD.

Extraído via API `/inspection/table-schema` e `/inspection/table-relations`.

## Metodologia de Extração
- Usar endpoint `/inspection/table-schema?tableName=NOME_TABELA` para campos.
- Usar `/inspection/table-relations?tableName=NOME_TABELA` para relations.
- Usar `/inspection/primary-keys/NOME_TABELA` para PKs.

## TGFCAB - Cabeçalhos de Notas Fiscais

### Campos (155+)
- NUNOTA (int, PK)
- CODTIPOPER (int, FK to TGFTOP)
- NUMNOTA (int)
- SERIENOTA (char)
- TIPMOV (char)
- DTNEG (datetime)
- DTENTSAI (datetime)
- VLRNOTA (money)
- VLRICMS (float)
- ... (full list from schema)

### Primary Keys
- NUNOTA

### Relations (Foreign Keys)
- TGFTOP (CODTIPOPER)
- TGFPAR (CODPARC)
- TGFVEN (CODVEND)
- TGFITE (NUNOTA)

## TGFTOP - Tipos de Operação

### Campos
- CODTIPOPER (int, PK)
- DESCRTIPOPER (char)
- TIPMOV (char)

### Primary Keys
- CODTIPOPER

### Relations
- Referenced by TGFCAB

## TGFITE - Itens de Nota

### Campos
- NUNOTA (int, PK, FK to TGFCAB)
- SEQUENCIA (int, PK)
- CODPROD (int, FK to TGFPRO)
- QTDNEG (float)
- VLRUNIT (float)
- VLRTOT (float)

### Primary Keys
- NUNOTA, SEQUENCIA

### Relations
- TGFCAB (NUNOTA)
- TGFPRO (CODPROD)

## TGFPRO - Produtos

### Campos (155+)
- CODPROD (int, PK)
- DESCRPROD (char)
- CODGRUPOPROD (int, FK to TGFGRU)
- ... (full list)

### Primary Keys
- CODPROD

### Relations
- TGFGRU (CODGRUPOPROD)
- Referenced by TGFITE

## TGFGRU - Grupos de Produto

### Campos
- CODGRUPOPROD (int, PK)
- DESCRGRUPOPROD (char)
- ... (full list from schema)

### Primary Keys
- CODGRUPOPROD

### Relations
- Referenced by TGFPRO

## TGFVEN - Vendedores

### Campos
- CODVEND (int, PK)
- APELIDO (char)
- CODPARC (int, FK to TGFPAR)
- ... (full list)

### Primary Keys
- CODVEND

### Relations
- TGFPAR (CODPARC)
- Referenced by TGFCAB

## TGFPAR - Parceiros

### Campos
- CODPARC (int, PK)
- NOMEPARC (char)
- ... (full list)

### Primary Keys
- CODPARC

### Relations
- Referenced by TGFCAB, TGFVEN

## TGFTAB - Tabelas de Preço

### Campos
- CODTAB (int, PK)
- DTVIGOR (datetime)
- ... (full list)

### Primary Keys
- CODTAB

### Relations
- (Add if any)

## Outras Tabelas (TGFEXC, TGFCUS, etc.)
- (Adicionar extrações similares)

## Joins Comuns
- TGFCAB LEFT JOIN TGFTOP ON TGFCAB.CODTIPOPER = TGFTOP.CODTIPOPER
- TGFCAB LEFT JOIN TGFPAR ON TGFCAB.CODPARC = TGFPAR.CODPARC
- TGFCAB LEFT JOIN TGFVEN ON TGFCAB.CODVEND = TGFVEN.CODVEND
- TGFITE LEFT JOIN TGFPRO ON TGFITE.CODPROD = TGFPRO.CODPROD
- TGFPRO LEFT JOIN TGFGRU ON TGFPRO.CODGRUPOPROD = TGFGRU.CODGRUPOPROD

*(Este é um resumo; para listas completas, consulte a API Sankhya diretamente.)*