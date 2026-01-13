# TGFGRU – Grupo de Produtos

## Campos
- CODGRUPOPROD (int, PK)
- DESCRGRUPOPROD (char)
- CODGRUPAI (int, FK)
- ATIVO (char)
- ... (outros campos)

## Relações
- Referenciada por:
  - AD_SOLCOMPRAOS (CODGRUPOPROD, FK → TGFGRU.CODGRUPOPROD)
  - AD_TCFEXEC (CODGRUPOPROD, FK → TGFGRU.CODGRUPOPROD)
  - GFRCATEGCOMIS (CODGRUPOPROD, FK → TGFGRU.CODGRUPOPROD)
  - ... (outras)
- Relações do tipo: 1:N (TGFGRU é referenciada por outras tabelas via CODGRUPOPROD)
