# Documentação de Inspeção - Tabela AD_GIG_LOG

## Overview

A tabela `AD_GIG_LOG` é uma tabela de auditoria/registros de log do sistema Sankhya, utilizada para rastrear operações e alterações em diversas tabelas do sistema.

## Estrutura da Tabela

### Schema da Tabela

```json
{
  "tableName": "AD_GIG_LOG",
  "columns": [
    {
      "COLUMN_NAME": "ID",
      "DATA_TYPE": "int",
      "IS_NULLABLE": "NO",
      "COLUMN_DEFAULT": null,
      "CHARACTER_MAXIMUM_LENGTH": null,
      "NUMERIC_PRECISION": 10,
      "NUMERIC_SCALE": 0,
      "ORDINAL_POSITION": 1
    },
    {
      "COLUMN_NAME": "ACAO",
      "DATA_TYPE": "varchar",
      "IS_NULLABLE": "YES",
      "COLUMN_DEFAULT": null,
      "CHARACTER_MAXIMUM_LENGTH": 50,
      "NUMERIC_PRECISION": null,
      "NUMERIC_SCALE": null,
      "ORDINAL_POSITION": 2
    },
    {
      "COLUMN_NAME": "TABELA",
      "DATA_TYPE": "varchar",
      "IS_NULLABLE": "YES",
      "COLUMN_DEFAULT": null,
      "CHARACTER_MAXIMUM_LENGTH": 50,
      "NUMERIC_PRECISION": null,
      "NUMERIC_SCALE": null,
      "ORDINAL_POSITION": 3
    },
    {
      "COLUMN_NAME": "CODUSU",
      "DATA_TYPE": "int",
      "IS_NULLABLE": "YES",
      "COLUMN_DEFAULT": null,
      "CHARACTER_MAXIMUM_LENGTH": null,
      "NUMERIC_PRECISION": 10,
      "NUMERIC_SCALE": 0,
      "ORDINAL_POSITION": 4
    },
    {
      "COLUMN_NAME": "NOMEUSU",
      "DATA_TYPE": "varchar",
      "IS_NULLABLE": "YES",
      "COLUMN_DEFAULT": null,
      "CHARACTER_MAXIMUM_LENGTH": 50,
      "NUMERIC_PRECISION": null,
      "NUMERIC_SCALE": null,
      "ORDINAL_POSITION": 5
    },
    {
      "COLUMN_NAME": "CAMPOS_ALTERADOS",
      "DATA_TYPE": "nvarchar",
      "IS_NULLABLE": "YES",
      "COLUMN_DEFAULT": null,
      "CHARACTER_MAXIMUM_LENGTH": -1,
      "NUMERIC_PRECISION": null,
      "NUMERIC_SCALE": null,
      "ORDINAL_POSITION": 6
    },
    {
      "COLUMN_NAME": "VERSAO_NOVA",
      "DATA_TYPE": "nvarchar",
      "IS_NULLABLE": "YES",
      "COLUMN_DEFAULT": null,
      "CHARACTER_MAXIMUM_LENGTH": -1,
      "NUMERIC_PRECISION": null,
      "NUMERIC_SCALE": null,
      "ORDINAL_POSITION": 7
    },
    {
      "COLUMN_NAME": "VERSAO_ANTIGA",
      "DATA_TYPE": "nvarchar",
      "IS_NULLABLE": "YES",
      "COLUMN_DEFAULT": null,
      "CHARACTER_MAXIMUM_LENGTH": -1,
      "NUMERIC_PRECISION": null,
      "NUMERIC_SCALE": null,
      "ORDINAL_POSITION": 8
    },
    {
      "COLUMN_NAME": "DTCREATED",
      "DATA_TYPE": "datetime",
      "IS_NULLABLE": "YES",
      "COLUMN_DEFAULT": "(getdate())",
      "CHARACTER_MAXIMUM_LENGTH": null,
      "NUMERIC_PRECISION": null,
      "NUMERIC_SCALE": null,
      "ORDINAL_POSITION": 9
    }
  ],
  "totalColumns": 9
}
```

### Chaves Primárias

```json
{
  "tableName": "AD_GIG_LOG",
  "primaryKeys": [
    {
      "TABLE_NAME": "AD_GIG_LOG",
      "COLUMN_NAME": "ID",
      "ORDINAL_POSITION": 1,
      "CONSTRAINT_NAME": "PK__AD_GIG_L__3214EC2799E2AA5D"
    }
  ],
  "totalPrimaryKeys": 1
}
```

### Relações

A tabela `AD_GIG_LOG` não possui relações definidas (foreign keys).

## Endpoints da API de Inspeção

### 1. Autenticação

```bash
curl -X 'POST' \
  'https://api-dbexplorer-nestjs-production.gigantao.net/auth/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "CONVIDADO",
    "password": "guest123"
  }'
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Obter Schema da Tabela

```bash
curl -X 'GET' \
  'https://api-dbexplorer-nestjs-production.gigantao.net/inspection/table-schema?tableName=AD_GIG_LOG' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer {TOKEN}'
```

### 3. Obter Chaves Primárias

```bash
curl -X 'GET' \
  'https://api-dbexplorer-nestjs-production.gigantao.net/inspection/primary-keys/AD_GIG_LOG' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer {TOKEN}'
```

### 4. Obter Relações da Tabela

```bash
curl -X 'GET' \
  'https://api-dbexplorer-nestjs-production.gigantao.net/inspection/table-relations?tableName=AD_GIG_LOG' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer {TOKEN}'
```

### 5. Executar Query Personalizada

```bash
curl -X 'POST' \
  'https://api-dbexplorer-nestjs-production.gigantao.net/inspection/query' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer {TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "SELECT TOP 10 * FROM AD_GIG_LOG ORDER BY DTCREATED DESC",
    "params": []
  }'
```

## Estrutura de Campos Detalhada

| Campo            | Tipo         | Nulo? | Default   | Descrição                                       |
| ---------------- | ------------ | ----- | --------- | ----------------------------------------------- |
| ID               | int          | NO    | -         | Chave primária sequencial                       |
| ACAO             | varchar(50)  | YES   | -         | Tipo de ação executada (INSERT, UPDATE, DELETE) |
| TABELA           | varchar(50)  | YES   | -         | Nome da tabela que sofreu alteração             |
| CODUSU           | int          | YES   | -         | Código do usuário que executou a ação           |
| NOMEUSU          | varchar(50)  | YES   | -         | Nome do usuário que executou a ação             |
| CAMPOS_ALTERADOS | nvarchar(-1) | YES   | -         | JSON com campos alterados                       |
| VERSAO_NOVA      | nvarchar(-1) | YES   | -         | Valores novos dos registros                     |
| VERSAO_ANTIGA    | nvarchar(-1) | YES   | -         | Valores antigos dos registros                   |
| DTCREATED        | datetime     | YES   | getdate() | Data/hora da criação do registro                |

## Padrões de Uso Comuns

### 1. Consultar Logs por Tabela

```sql
SELECT * FROM AD_GIG_LOG
WHERE TABELA = 'TFPFUN'
ORDER BY DTCREATED DESC
```

### 2. Consultar Logs por Período

```sql
SELECT * FROM AD_GIG_LOG
WHERE DTCREATED BETWEEN '2025-01-01' AND '2025-01-31'
ORDER BY DTCREATED DESC
```

### 3. Consultar Logs por Usuário

```sql
SELECT * FROM AD_GIG_LOG
WHERE CODUSU = 292
ORDER BY DTCREATED DESC
```

### 4. Consultar Logs por Ação

```sql
SELECT * FROM AD_GIG_LOG
WHERE ACAO = 'UPDATE'
ORDER BY DTCREATED DESC
```

## Próximos Passos

Com base na estrutura da tabela, vamos criar o módulo completo para `AD_GIG_LOG` seguindo os padrões do projeto:

1. Entity TypeORM mapeada corretamente
2. Interface TypeScript com tipos adequados
3. DTOs para consulta com filtros
4. Service com métodos de busca
5. Controller com endpoints REST
6. Module para integração
7. Documentação Swagger completa
