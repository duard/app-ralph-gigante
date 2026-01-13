Consumo por produto — template

## Objetivo

Fornecer um template e um script reproduzível para consultar quanto de um produto foi consumido (saídas) em um período.

## Arquivos

- `consumo_produto_template.sql` — SQL parametrizável.
- `run_consumo_produto.sh` — script que obtém token, injeta parâmetros e grava o JSON de resposta em `output_<CODPROD>_<DTSTART>_<DTEND>/`.

## Como usar

1. Torne o script executável (já pronto):
   chmod +x run_consumo_produto.sh
2. Execute:
   ./run_consumo_produto.sh <CODPROD> <DT_START> <DT_END>
   Ex.: `./run_consumo_produto.sh 3680 2025-12-01 2025-12-31`
3. O JSON com todas as queries será gravado no diretório `output_<CODPROD>_<DT_START>_<DT_END>/`.

## Explicação das queries

- Detalhes: lista linhas do item (TGFITE) + cabeçalho da nota (TGFCAB) + operação (TGFTOP) + produto (TGFPRO). Útil para inspeção completa.
- Sumário: linhas, notas distintas, soma de `QTDNEG` (quant. reduzida do estoque) e `QTDENTREGUE`.
- Por comprador: `ROLLUP(USU.NOMEUSU)` para analisar quem solicitou.
- Por mês: trend (ANO_MES) com somas mensais.

## Dicas e validações

- Para contar consumo, filtre `C.TIPMOV <> 'O'` (exclui compras) e `C.STATUSNOTA = 'L'` (liberadas), salvo se quiser incluir status diferentes.
- Para identificar se a operação afeta estoque, ver `TGFTOP.ATUALEST`. Valores como 'B' normalmente representam baixa/saída.

## Exemplos

- Já testado: produto 3680 (nota 271451) mostrou QTDNEG=3 (solicitado e entregue) em 2025-12-18.

Se quiser, eu executo o script para um produto e período específico e salvo os JSONs de saída.
