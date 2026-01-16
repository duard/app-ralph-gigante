export const getStatusStatsQuery = `
DECLARE @DataRef DATETIME = ISNULL(@refDate, GETDATE());

SELECT
    SUM(CASE WHEN Status = 'LIVRE' THEN 1 ELSE 0 END) AS Livre,
    SUM(CASE WHEN Status = 'EM_USO' THEN 1 ELSE 0 END) AS EmUso,
    SUM(CASE WHEN Status = 'AGENDADO' THEN 1 ELSE 0 END) AS Agendado,
    SUM(CASE WHEN Status = 'MANUTENCAO' THEN 1 ELSE 0 END) AS Manutencao,
    SUM(CASE WHEN Status = 'PARADO' THEN 1 ELSE 0 END) AS Parado,
    COUNT(*) AS Total
FROM (
    SELECT
        v.CODVEICULO,
        CASE
            -- 1. PARADO: Bloqueado ou inativo
            WHEN v.BLOQUEADO = 'S' OR v.ATIVO = 'N' THEN 'PARADO'
            
            -- 2. MANUTENCAO: Tem OS de manutenção ativa
            WHEN EXISTS (
                SELECT 1 FROM SANKHYA.TCFOSCAB m
                WHERE m.CODVEICULO = v.CODVEICULO
                AND m.STATUS IN ('A', 'E')
                AND m.DATAFIN IS NULL
            ) THEN 'MANUTENCAO'
            
            -- 3. EM_USO: Tem OS comercial em execução
            WHEN EXISTS (
                SELECT 1 FROM SANKHYA.TCSITE i
                INNER JOIN SANKHYA.TCSOSE o ON o.NUMOS = i.NUMOS
                WHERE i.AD_CODVEICULO = v.CODVEICULO
                AND o.SITUACAO = 'P'
                AND o.DTFECHAMENTO IS NULL
                AND (
                    (i.INICEXEC IS NOT NULL AND i.TERMEXEC IS NULL)
                    OR
                    (i.DHPREVISTA <= @DataRef AND i.TERMEXEC IS NULL)
                )
            ) THEN 'EM_USO'
            
            -- 4. AGENDADO: Tem OS futura
            WHEN EXISTS (
                SELECT 1 FROM SANKHYA.TCSITE i
                INNER JOIN SANKHYA.TCSOSE o ON o.NUMOS = i.NUMOS
                WHERE i.AD_CODVEICULO = v.CODVEICULO
                AND o.SITUACAO = 'P'
                AND o.DTFECHAMENTO IS NULL
                AND i.DHPREVISTA > @DataRef
                AND i.INICEXEC IS NULL
            ) THEN 'AGENDADO'
            
            -- 5. LIVRE
            ELSE 'LIVRE'
        END AS Status
    FROM SANKHYA.TGFVEI v
    WHERE v.AD_EXIBEDASH = 'S'
       OR (v.AD_EXIBEDASH IS NULL AND v.ATIVO = 'S' AND v.CATEGORIA = 'ALUGUEL')
) AS StatusCalc
`;
