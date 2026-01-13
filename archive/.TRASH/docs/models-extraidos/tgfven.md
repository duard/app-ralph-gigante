# TGFVEN – Vendedores

## Campos
- CODVEND (smallint, PK)
- APELIDO (char)
- NOMEVEND (char)
- COMISSAO (float)
- ATIVO (char)
- ... (outros campos)

## Relações
- Referenciada por:
  - GFRATENDIMENTOCLIENTE (CODVEND, FK → TGFVEN.CODVEND)
  - GFRVEND (CODVEND, FK → TGFVEN.CODVEND)
  - TCSAGF (CODVEND, FK → TGFVEN.CODVEND)
  - TCSCNV (CODVEND, FK → TGFVEN.CODVEND)
  - ... (outras)
- Relações do tipo: 1:N (TGFVEN é referenciada por outras tabelas via CODVEND)
