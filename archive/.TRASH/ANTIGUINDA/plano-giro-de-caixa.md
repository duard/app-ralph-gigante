# Plano de Giro de Caixa

## Definição

O giro de caixa é um indicador financeiro que mede quantas vezes o capital de giro (caixa disponível) é renovado em um determinado período. Para nossa empresa focada em compras, ele mostra a eficiência com que utilizamos os recursos financeiros para realizar aquisições e manter o fluxo de caixa saudável.

## Como Identificar Compras

- **TIPMOV**: 'O' para Pedido de Compra, 'C' para Compra efetivada
- **STATUSNOTA**: 'L' para notas liberadas/aprovadas
- **Tabelas**: TGFCAB (cabeçalhos), TGFITE (itens das notas)

## Fórmula

Giro de Caixa = Compras Totais / Saldo Médio de Caixa

Onde:

- Compras Totais: Valor total das compras realizadas no período (TIPMOV = 'O' ou 'C', STATUSNOTA = 'L')
- Saldo Médio de Caixa: Média do saldo de caixa disponível durante o período

## Objetivo do Plano

Implementar no sistema Sankhya uma funcionalidade para calcular e monitorar o giro de caixa baseado em compras, integrando dados de pedidos de compra, contas a pagar e saldos de caixa.

## Etapas do Plano

### 1. Análise de Dados Necessários

- Identificar tabelas Sankhya relevantes:
  - TGFCAB: Cabeçalhos de compras/pedidos (TIPMOV = 'O', STATUSNOTA = 'L')
  - TGFITE: Itens das notas de compra (valores, quantidades)
  - TGFEST: Estoque e movimentações de entrada
  - TGFPAR: Parceiros (fornecedores)
  - TFPFUN: Funcionários compradores
  - Outras tabelas financeiras para saldos de caixa

### 2. Desenvolvimento da API

- Criar endpoint `/financeiro/giro-caixa` para calcular o indicador
- Implementar serviço para consultar dados históricos
- Adicionar filtros por período, empresa, filial

### 3. Cálculo Automático

- Implementar lógica para:
  - Somar valor total das compras liberadas (TGFCAB + TGFITE)
  - Calcular saldo médio de caixa
  - Aplicar fórmula do giro
  - Considerar apenas compras efetivadas (não apenas pedidos)

### 4. Relatórios e Dashboards

- Gerar relatórios mensais/anuais por comprador
- Criar visualizações para acompanhar tendência do giro
- Alertas quando giro estiver abaixo do ideal
- Comparativos entre compradores e períodos

### 5. Integração com Controle de Estoque

- Correlacionar giro de caixa com giro de estoque
- Identificar produtos que impactam mais o fluxo de caixa
- Análise de compras por item (TGFITE)

## Benefícios Esperados

- Melhor gestão do capital de giro focado em compras
- Otimização do fluxo de caixa para pagamentos
- Redução de custos financeiros em aquisições
- Tomada de decisões mais assertiva sobre compras

## Queries de Referência

### Consulta de Compras por Comprador

```sql
SELECT
	(SELECT USU2.NOMEUSU
	 FROM [SANKHYA].[TSIULG] USULOG
	 JOIN [SANKHYA].[TSIUSU] USU2 ON USU2.CODUSU = USULOG.CODUSU
	 WHERE SPID = @@SPID
	) AS usuLogado,
	USU.CODUSU AS 'Usuário',
	CASE WHEN GROUPING(USU.CODUSU) = 1 THEN 'TOTAL GERAL'
		ELSE MAX(NOMEUSU) END AS Comprador,
	CAR.DESCRCARGO AS 'Cargo',
	COUNT(CAB.NUNOTA) AS 'Pedidos Confirmados',
	COUNT(CAB.NUNOTA) * 1.0 / (SELECT COUNT(*) FROM TGFCAB CAB2
    JOIN TSIUSU USU2 ON USU2.CODUSU = CAB2.CODUSUINC WHERE TIPMOV = 'O' AND STATUSNOTA = 'L' AND DTMOV BETWEEN $P{PDTINICIAL} AND $P{PDTFINAL} AND USU2.CODGRUPO IN (5))
	    AS '% Pedidos Confirmados',
	SUM(CAB.VLRNOTA) AS 'Vlr Total Pedidos',
	SUM(CAB.VLRNOTA) / (SELECT SUM(VLRNOTA) FROM TGFCAB CAB2
    JOIN TSIUSU USU2 ON USU2.CODUSU = CAB2.CODUSUINC WHERE TIPMOV = 'O' AND STATUSNOTA = 'L' AND DTMOV BETWEEN $P{PDTINICIAL} AND $P{PDTFINAL} AND USU2.CODGRUPO IN (5))
	AS '% Valor'
FROM TGFCAB CAB
JOIN TSIUSU USU ON USU.CODUSU = CAB.CODUSUINC
LEFT JOIN TFPFUN FUN ON USU.CODEMP = FUN.CODEMP AND USU.CODFUNC = FUN.CODFUNC
LEFT JOIN TFPCAR CAR ON CAR.CODCARGO = FUN.CODCARGO
WHERE CAB.TIPMOV = 'O'
    AND CAB.STATUSNOTA = 'L'
    AND DTMOV BETWEEN $P{PDTINICIAL} AND $P{PDTFINAL}
    AND USU.CODGRUPO IN (5)
GROUP BY ROLLUP(USU.CODUSU), CAR.DESCRCARGO, USU.CODGRUPO
HAVING GROUPING(USU.CODUSU) = 0
ORDER BY
    CASE WHEN GROUPING(USU.CODUSU) = 1 THEN 1 ELSE 0 END,
    COUNT(CAB.NUNOTA) DESC,
    SUM(CAB.VLRNOTA) DESC
```

### Tipos de Movimentação

```sql
CASE
  WHEN TGFCAB.TIPMOV = 'V' THEN 'Venda'
  WHEN TGFCAB.TIPMOV = 'P' THEN 'Pedido de Venda'
  WHEN TGFCAB.TIPMOV = 'D' THEN 'Devolução de Venda'
  WHEN TGFCAB.TIPMOV = 'A' THEN 'Conhecimento de Transporte (Venda)'
  WHEN TGFCAB.TIPMOV = 'O' THEN 'Pedido de Compra'
  WHEN TGFCAB.TIPMOV = 'C' THEN 'Compra'
  WHEN TGFCAB.TIPMOV = 'E' THEN 'Devolução de Compra'
  WHEN TGFCAB.TIPMOV = 'H' THEN 'Conhecimento de Transporte (Compra)'
  WHEN TGFCAB.TIPMOV = 'T' THEN 'Transferência'
  WHEN TGFCAB.TIPMOV = 'J' THEN 'Pedido de Requisição'
  WHEN TGFCAB.TIPMOV = 'Q' THEN 'Requisição'
  WHEN TGFCAB.TIPMOV = 'L' THEN 'Devolução de Requisição'
  WHEN TGFCAB.TIPMOV = 'F' THEN 'Nota de Produção'
  ELSE 'Outro'
END as tipo_movimentacao
```

## Próximos Passos

1. Revisar documentação das tabelas TGFCAB e TGFITE
2. Implementar query SQL para somatório de compras
3. Desenvolver protótipo do cálculo
4. Testar com dados reais de compras
5. Refinar algoritmo e interface
