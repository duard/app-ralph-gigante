# Especificação Técnica: Consumo por Produto (Refinada)

## Introdução

Esta funcionalidade fornece um extrato detalhado de movimentações de estoque, garantindo precisão através de filtros baseados no comportamento da TOP (Tipo de Operação) e cálculos robustos em TypeScript.

## Fluxo de Dados e Algoritmo

### 1. Coleta de Dados Primários

As queries foram simplificadas para garantir compatibilidade com a inspeção da API Sankhya.

#### A. Saldo Inicial (`S0`)

Busca o estado do estoque exatamente antes do início do período (`dataInicio`).

- **SQL**:
  ```sql
  SELECT
    SUM(CASE WHEN I.ATUALESTOQUE < 0 THEN -I.QTDNEG ELSE I.QTDNEG END) as QTD,
    SUM(CASE WHEN I.ATUALESTOQUE < 0 THEN -I.VLRTOT ELSE I.VLRTOT END) as VALOR
  FROM TGFITE I
  JOIN TGFCAB C ON I.NUNOTA = C.NUNOTA
  JOIN TGFTOP T ON T.CODTIPOPER = C.CODTIPOPER AND T.DHTIPOPER = C.DHTIPOPER
  WHERE I.CODPROD = ?
    AND C.STATUSNOTA = 'L'
    AND T.ATUALEST IN ('B', 'E')
    AND COALESCE(C.DTENTSAI, C.DTNEG) < ?
  ```

#### B. Movimentações (`M`)

Lista cronológica de eventos filtrada por impacto no estoque.

- **Campos**: `data_referencia` (DTENTSAI/DTNEG), `NUNOTA`, `TIPMOV`, `NOMEPARC`, `quantidade_mov` (QTDNEG), `valor_mov` (VLRTOT).
- **Filtro**: `TGFTOP.ATUALEST IN ('B', 'E')`.
- **Ordenação**: `data_referencia ASC, NUNOTA ASC`.

### 2. ConsumoCalculatorUtils

Uma nova camada de lógica isolada para garantir que os cálculos sejam puros e testáveis.

```typescript
export class ConsumoCalculatorUtils {
  static processExtrato(saldoInicial: number, movs: any[]) {
    // Lógica de iteração para calcular saldo_anterior e saldo_final
    // Cálculo de PMM (Preço Médio Móvel)
  }
}
```

### 3. Campos do Response (Paridade com SQL de Acerto)

O JSON final deve espelhar as colunas do `sql-com-mais-acerto.sql`:

- `tipo_registro`
- `data_referencia`
- `nunota`
- `tipmov`
- `codparc`
- `nome_parceiro`
- `usuario`
- `quantidade_mov`
- `valor_mov`
- `saldo_qtd_anterior`
- `saldo_qtd_final`
- `saldo_valor_anterior`
- `saldo_valor_final`

## Guia de Testes e Autenticação

Para garantir que os testes funcionem sem problemas de expiração de token, siga este procedimento:

### 1. Login

```bash
curl -s -X POST 'http://localhost:3000/auth/login' \
 -H 'accept: application/json' \
 -H 'Content-Type: application/json' \
 -d '{"username":"CONVIDADO","password":"guest123"}'
```

### 2. Query de Inspeção (Exemplo)

```bash
curl -s -X POST 'http://localhost:3000/inspection/query' \
 -H "accept: application/json" \
 -H "Authorization: Bearer $TOKEN" \
 -H 'Content-Type: application/json' \
 -d '{"query":"SELECT TOP 10 ID, ACAO, TABELA, NOMEUSU FROM AD_GIG_LOG ORDER BY ID DESC","params": []}'
```

## Próximos Passos

1. Implementar `ConsumoCalculatorUtils`.
2. Refatorar `ConsumoService` para utilizar os novos filtros e a nova utilidade.
3. Atualizar Swagger com os novos DTOs.
