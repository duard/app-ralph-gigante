-- ==================================================================
-- SQL refatorada: Estoque por locais
-- Objetivo: remover placeholder de relatório ($P{P0}) que causa erro em execução
--           e aplicar formato semelhante a docs/sqls/compras-pendentes.refatorado.sql
-- Observações:
--  - Em relatórios (JasperReports) mantenha $P{P0} no JRXML e passe o parâmetro ao executar o relatório.
--  - Ao executar diretamente no SQL Server, use o parâmetro @codLocal (declarado abaixo).
-- ==================================================================

-- Defina o valor de @codLocal antes de executar ou passe-o como parâmetro na aplicação
DECLARE @codLocal INT = 123;
-- ajustar conforme necessário

SELECT DISTINCT
  LOC.DESCRLOCAL AS "Descrição_do_Local",
  EST.CODEMP AS "Cod_Empresa",
  PRO.CODPROD AS "CódProduto",
  PRO.DESCRPROD AS "Descrição_Produto",
  ISNULL(PRO.COMPLDESC, ' ') AS "Complento",
  EST.CONTROLE AS "Controle",
  PRO.CODVOL AS "Unidade",
  ISNULL(EST.ESTOQUE, 0) AS "Estoque"
FROM [SANKHYA].[TGFPRO] PRO
  JOIN [SANKHYA].[TGFEST] EST ON PRO.CODPROD = EST.CODPROD
  JOIN [SANKHYA].[TGFLOC] LOC ON EST.CODLOCAL = LOC.CODLOCAL
WHERE EST.CODPARC = 0
  AND ISNULL(EST.ESTOQUE, 0) <> 0
  -- AND EST.CODLOCAL = @codLocal
  AND PRO.ATIVO = 'S'
ORDER BY "Descrição_Produto";

