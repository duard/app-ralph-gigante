# Valor em Estoque por Período

Esta pasta contém queries para calcular quanto, em valor monetário, das compras feitas em um período (pedidos aprovados) permanece atualmente em estoque.

Arquivos:

- `valor-estoque-por-periodo.sql` — versão canônica (por produto).
- `valor-estoque-por-periodo.test.sql` — script de teste (TOP 100 + checagens agregadas) para executar via extensão SQL Server no VS Code.
- `valor-estoque-por-periodo.by-local.sql` — variante que agrega por `CODEMP/CODLOCAL`.
- `valor-estoque-por-periodo.avgcost.sql` — variante que calcula valor usando custo médio ponderado até `dtFim`.
- `validation_checks.sql` — queries de verificação/sanity checks para validar resultados.

Como usar:

1. Abra o arquivo `valor-estoque-por-periodo.test.sql` na extensão SQL Server e ajuste os parâmetros `@dtInicio, @dtFim, @CODEMP, @CODLOCAL` no topo do arquivo.
2. Execute o arquivo e cole os resultados (TOP 100 + checagens agregadas) aqui para revisão.
3. Para análises por local, execute `valor-estoque-por-periodo.by-local.sql`.
4. Para análise via custo médio acumulado, execute `valor-estoque-por-periodo.avgcost.sql` (ajustar `@dtFim`).

Notas técnicas:

- Utilizamos `TGFCAB` (TIPMOV='O' e STATUSNOTA='L') como pedidos aprovados. Quantidades tomadas de `TGFITE.QTDNEG`.
- Preço do pedido: `TGFITE.VLRUNIT`. Se ausente, usamos o último `VLRUNIT` de compras confirmadas (TIPMOV='C').
- Sem rastreamento por lote: valor remanescente é uma aproximação via `min(estoque_atual, qtd_comprada)`.

Se quiser, eu executo um teste de amostra com os parâmetros que preferir (você precisa rodar a query na sua conexão e enviar resultados para eu analisar).
