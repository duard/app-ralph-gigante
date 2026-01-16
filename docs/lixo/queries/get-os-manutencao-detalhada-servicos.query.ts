export const getOSManutencaoDetalhadaServicosQuery = `
SELECT
    s.NUOS,
    s.SEQUENCIA,
    s.CODPROD,
    LTRIM(RTRIM(p.DESCRPROD)) AS SERVICO,
    s.QTD,
    s.VLRUNIT,
    s.VLRTOT,
    s.STATUS,
    CASE s.STATUS
        WHEN 'E' THEN 'Em Execução'
        WHEN 'F' THEN 'Finalizado'
        WHEN 'R' THEN 'Rejeitado'
        ELSE s.STATUS
    END AS STATUS_DESCRICAO,
    s.DATAINI,
    s.DATAFIN,
    s.TEMPO,
    s.OBSERVACAO
FROM SANKHYA.TCFSERVOS s
LEFT JOIN SANKHYA.TGFPRO p ON p.CODPROD = s.CODPROD
WHERE s.NUOS = @nuos
ORDER BY s.SEQUENCIA
`;
