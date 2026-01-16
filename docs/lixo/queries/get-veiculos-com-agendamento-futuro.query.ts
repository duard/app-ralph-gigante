export const getVeiculosComAgendamentoFuturoQuery = `
DECLARE @DataRef DATETIME = ISNULL(@refDate, GETDATE());

SELECT
    v.CODVEICULO,
    v.PLACA,
    LTRIM(RTRIM(v.MARCAMODELO)) AS Nome,
    LTRIM(RTRIM(ISNULL(v.AD_TIPOEQPTO, v.CATEGORIA))) AS Categoria,

    -- Status ATUAL do veículo (sem considerar agendamentos futuros)
    CASE
        WHEN v.BLOQUEADO = 'S' OR v.ATIVO = 'N' THEN 'PARADO'
        WHEN EXISTS (
            SELECT 1 FROM SANKHYA.TCFOSCAB m
            WHERE m.CODVEICULO = v.CODVEICULO
            AND m.STATUS IN ('A', 'E')
            AND m.DATAFIN IS NULL
        ) THEN 'MANUTENCAO'
        WHEN EXISTS (
            SELECT 1 FROM SANKHYA.TCSOSE o
            INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
            WHERE i.AD_CODVEICULO = v.CODVEICULO
            AND o.SITUACAO = 'P' AND o.DTFECHAMENTO IS NULL AND i.TERMEXEC IS NULL
            AND CAST(@DataRef AS DATE) >= (
                SELECT CAST(MIN(i2.DHPREVISTA) AS DATE) FROM SANKHYA.TCSITE i2
                WHERE i2.NUMOS = o.NUMOS AND i2.AD_CODVEICULO = v.CODVEICULO
            )
            AND CAST(@DataRef AS DATE) <= (
                SELECT CAST(MAX(i2.DHPREVISTA) AS DATE) FROM SANKHYA.TCSITE i2
                WHERE i2.NUMOS = o.NUMOS AND i2.AD_CODVEICULO = v.CODVEICULO
            )
        ) THEN 'EM_USO'
        ELSE 'LIVRE'
    END AS StatusAtual,

    -- Próximo agendamento (incluindo hoje e futuro - TODOS os agendados)
    (SELECT TOP 1 i.DHPREVISTA
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     AND i.INICEXEC IS NULL
     ORDER BY i.DHPREVISTA ASC
    ) AS ProximoAgendamento,

    -- Número da OS agendada
    (SELECT TOP 1 o.NUMOS
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     AND i.INICEXEC IS NULL
     ORDER BY i.DHPREVISTA ASC
    ) AS NumOSAgendada,

    -- Cliente do agendamento
    (SELECT TOP 1 LTRIM(RTRIM(p.RAZAOSOCIAL))
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     INNER JOIN SANKHYA.TGFPAR p ON p.CODPARC = o.CODPARC
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     AND i.INICEXEC IS NULL
     ORDER BY i.DHPREVISTA ASC
    ) AS ClienteAgendado,

    -- Local do agendamento
    (SELECT TOP 1
        LTRIM(RTRIM(ISNULL(o.CIDADE, ''))) +
        CASE WHEN o.ENDERECO IS NOT NULL AND LTRIM(RTRIM(o.ENDERECO)) != ''
            THEN ' - ' + LTRIM(RTRIM(o.ENDERECO))
            ELSE ''
        END
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     AND i.INICEXEC IS NULL
     ORDER BY i.DHPREVISTA ASC
    ) AS LocalAgendado,

    -- Quantidade de diárias do agendamento (EXCLUINDO CANCELADAS)
    -- Cancelada = HRINICIAL=0 AND HRFINAL=0 AND NÃO CONFORMIDADE (COBRAR='N' AND RETRABALHO='S')
    (SELECT COUNT(*)
     FROM SANKHYA.TCSITE i2
     WHERE i2.NUMOS = (
         SELECT TOP 1 o.NUMOS
         FROM SANKHYA.TCSOSE o
         INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
         WHERE i.AD_CODVEICULO = v.CODVEICULO
         AND o.SITUACAO = 'P'
         AND o.DTFECHAMENTO IS NULL
         AND i.INICEXEC IS NULL
         ORDER BY i.DHPREVISTA ASC
     )
     AND i2.AD_CODVEICULO = v.CODVEICULO
     -- Excluir diárias canceladas (não conforme com horas zeradas)
     AND NOT (
         ISNULL(i2.HRINICIAL, 0) = 0 
         AND ISNULL(i2.HRFINAL, 0) = 0 
         AND i2.COBRAR = 'N' 
         AND i2.RETRABALHO = 'S'
     )
    ) AS QtdDiarias

FROM SANKHYA.TGFVEI v
WHERE (v.AD_EXIBEDASH = 'S' OR (v.AD_EXIBEDASH IS NULL AND v.ATIVO = 'S' AND v.CATEGORIA = 'ALUGUEL'))
AND EXISTS (
    -- Todos os veículos que TÊM agendamento (incluindo hoje e futuro)
    SELECT 1 FROM SANKHYA.TCSITE i
    INNER JOIN SANKHYA.TCSOSE o ON o.NUMOS = i.NUMOS
    WHERE i.AD_CODVEICULO = v.CODVEICULO
    AND o.SITUACAO = 'P'
    AND o.DTFECHAMENTO IS NULL
    AND i.INICEXEC IS NULL
)
ORDER BY ProximoAgendamento ASC
`;
