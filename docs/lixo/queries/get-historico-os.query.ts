export const getHistoricoOSQuery = `
SELECT TOP (@limit) * FROM (
    SELECT
        'COMERCIAL' AS TipoOS,
        o.NUMOS AS NumOS,
        o.DHCHAMADA AS DataInicio,
        o.DTFECHAMENTO AS DataFim,
        o.SITUACAO,
        LTRIM(RTRIM(ISNULL(o.CIDADE, ''))) AS Local,
        'OS Comercial' AS Descricao
    FROM SANKHYA.TCSOSE o
    INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
    WHERE i.AD_CODVEICULO = @codVeiculo
    
    UNION ALL
    
    SELECT
        'MANUTENCAO' AS TipoOS,
        m.NUOS AS NumOS,
        m.DATAINI AS DataInicio,
        m.DATAFIN AS DataFim,
        m.STATUS AS SITUACAO,
        'Oficina' AS Local,
        ISNULL(CAST(m.TIPO AS VARCHAR(100)), 'Manutenção') AS Descricao
    FROM SANKHYA.TCFOSCAB m
    WHERE m.CODVEICULO = @codVeiculo
) AS Historico
ORDER BY DataInicio DESC
`;
