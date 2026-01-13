# TGFPRO – Produtos

## Campos
- CODPROD (int, PK)
- DESCRPROD (char)
- CODGRUPOPROD (int, FK)
- CODVOL (char)
- REFERENCIA (varchar)
- MARCA (varchar)
- MODELO (varchar)
- USOPROD (char)
- PESOLIQ (float)
- PESOBRUTO (float)
- ATIVO (char)
- DTINCLUSAO (datetime)
- ... (outros campos)

## Relações
- Referenciada por:
  - AD_ACESSORIOS (CODITEM, FK → TGFPRO.CODPROD)
  - AD_APONTSOL (CODPROD, FK → TGFPRO.CODPROD)
  - AD_CADHABSER (CODSERV, FK → TGFPRO.CODPROD)
  - AD_CONSUMOVEICULOS (CODPROD, FK → TGFPRO.CODPROD)
  - ... (outras)
- Relações do tipo: 1:N (TGFPRO é referenciada por outras tabelas via CODPROD)
