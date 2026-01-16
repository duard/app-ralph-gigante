export const getOSManutencaoDetalhadaCabQuery = `
SELECT
    cab.NUOS,
    cab.CODVEICULO,
    v.PLACA,
    LTRIM(RTRIM(v.MARCAMODELO)) AS VEICULO,
    cab.STATUS,
    CASE cab.STATUS
        WHEN 'A' THEN 'Aberta'
        WHEN 'E' THEN 'Em Execução'
        WHEN 'F' THEN 'Finalizada'
        WHEN 'C' THEN 'Cancelada'
        ELSE cab.STATUS
    END AS STATUS_DESCRICAO,
    cab.TIPO,
    CASE cab.TIPO
        WHEN 'I' THEN 'Interna'
        WHEN 'E' THEN 'Externa'
        ELSE cab.TIPO
    END AS TIPO_DESCRICAO,
    cab.MANUTENCAO,
    CASE cab.MANUTENCAO
        WHEN 'C' THEN 'Corretiva'
        WHEN 'P' THEN 'Preventiva'
        WHEN 'O' THEN 'Outros'
        ELSE cab.MANUTENCAO
    END AS MANUTENCAO_DESCRICAO,
    cab.DATAINI,
    cab.PREVISAO,
    cab.DATAFIN,
    cab.KM,
    cab.HORIMETRO,
    cab.CODEMP,
    cab.CODPARC,
    p.RAZAOSOCIAL AS PARCEIRO_NOME,
    cab.DTABERTURA,
    u.NOMEUSU AS USUARIO_ABERTURA,
    cab.AD_LOCALMANUTENCAO,
    cab.AD_STATUSGIG
FROM SANKHYA.TCFOSCAB cab
LEFT JOIN SANKHYA.TGFVEI v ON v.CODVEICULO = cab.CODVEICULO
LEFT JOIN SANKHYA.TGFPAR p ON p.CODPARC = cab.CODPARC
LEFT JOIN SANKHYA.TSIUSU u ON u.CODUSU = cab.CODUSU
WHERE cab.NUOS = @nuos
`;
