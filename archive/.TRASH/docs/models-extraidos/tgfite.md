# TGFITE – Itens do Documento

## Campos
- NUNOTA (int, PK, FK)
- SEQUENCIA (smallint, PK)
- CODEMP (smallint)
- CODPROD (int)
- CODLOCALORIG (int)
- CODLOCALDEST (int)
- CODVOL (char)
- CODCENCUS (int)
- QTDNEG (float)
- QTDENTREGUE (float)
- VLRUNIT (float)
- VLRTOT (float)
- VLRDESC (float)
- VLRICMS (float)
- VLRIPI (float)
- ALIQICMS (float)
- ALIQIPI (float)
- PESOBRUTO (float)
- PESOLIQ (float)
- ... (total: 233 campos)

## Relações
- Referenciada por:
  - TCIIBE (NUNOTA, SEQUENCIA, FK → TGFITE.NUNOTA, TGFITE.SEQUENCIA)
  - TCSACE (NUNOTA, SEQUENCIA, FK → TGFITE.NUNOTA, TGFITE.SEQUENCIA)
  - TCSAVE (NUNOTA, SEQUENCIA, FK → TGFITE.NUNOTA, TGFITE.SEQUENCIA)
  - ... (outras)
- Relações do tipo: 1:N (TGFITE é referenciada por outras tabelas via NUNOTA, SEQUENCIA)
