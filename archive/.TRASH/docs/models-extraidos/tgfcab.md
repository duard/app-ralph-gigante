# TGFCAB – Cabeçalho de Documentos

## Lista Completa de Campos

| Nome         | Tipo      | Nullable | PK | FK |
|--------------|-----------|----------|----|----|
| NUNOTA       | int       | Não      | Sim|    |
| CODEMP       | smallint  | Não      |    |    |
| CODCENCUS    | int       | Não      |    |    |
| NUMNOTA      | int       | Não      |    |    |
| SERIENOTA    | char(3)   | Sim      |    |    |
| ...          | ...       | ...      |    |    |
| (Total: 436 campos, incluindo VLRNOTA, VLRDESCTOT, VLRFRETE, VLRICMS, VLRIPI, VLRISS, STATUSNOTA, OBSERVACAO, etc.) |

- **PK**: Chave primária (Primary Key)
- **FK**: Chave estrangeira (Foreign Key)
- Os campos possuem tipos como int, smallint, char, varchar, float, datetime, text, numeric, etc.
- Campos como SERIENOTA, OBSERVACAO, e outros podem ser nulos (nullable).

## Chave Primária

- **NUNOTA** (int): Chave primária da tabela.

## Relações (Joins)

| Tabela Relacionada         | Campo na Tabela Relacionada | Campo em TGFCAB | Tipo de Relação | FK/PK |
|---------------------------|-----------------------------|-----------------|-----------------|-------|
| AD_GERAOSCOM              | NUNOTA                      | NUNOTA          | 1:N             | FK    |
| GFRATENDIMENTOCLIENTE     | NUNOTA                      | NUNOTA          | 1:N             | FK    |
| GFRMODNOTADAVEMP          | NUNOTA                      | NUNOTA          | 1:N             | FK    |
| TCBIRPJNFRET              | NUNOTA                      | NUNOTA          | 1:N             | FK    |
| ...                       | ...                         | ...             | ...             | ...   |

- Relações do tipo 1:N: TGFCAB é referenciada por outras tabelas via NUNOTA.
- Ações de integridade referencial: geralmente NO_ACTION para delete/update.

---

Se desejar a lista completa dos 436 campos ou detalhes de cada relação, posso gerar uma tabela expandida conforme necessário.
