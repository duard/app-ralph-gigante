export const getOSManutencaoDetalhadaApontamentosQuery = `
SELECT
    a.NUOS,
    a.SEQUENCIA,
    a.ID,
    a.CODEXEC,
    LTRIM(RTRIM(u.NOMEUSU)) AS EXECUTOR,
    a.DHINI,
    a.DHFIN,
    DATEDIFF(MINUTE, a.DHINI, a.DHFIN) AS TEMPO_MINUTOS,
    a.INTERVALO,
    a.STATUS,
    CASE a.STATUS
        WHEN 'START' THEN 'Iniciado'
        WHEN 'PAUSE' THEN 'Pausado'
        WHEN 'STOP' THEN 'Finalizado'
        ELSE a.STATUS
    END AS STATUS_DESCRICAO,
    a.DHAPONT
FROM SANKHYA.TCFSERVOSATO a
LEFT JOIN SANKHYA.TSIUSU u ON u.CODUSU = a.CODEXEC
WHERE a.NUOS = @nuos
ORDER BY a.SEQUENCIA, a.ID
`;
