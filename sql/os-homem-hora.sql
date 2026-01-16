-- =====================================================================================================================
-- RELATÓRIO DE PRODUTIVIDADE - MANUTENÇÃO COM APONTAMENTOS
--
-- Descrição: Analisa o tempo gasto pelos colaboradores para finalizar manutenções/serviços
--            Inclui controle de intervalos e cálculo de homem-hora
-- Objetivo: Medir eficiência e produtividade da equipe de manutenção com maior precisão
--
-- Data de Criação: 11/08/2025
-- Autor: Gabriel Henrique
-- Última Modificação: 18/08/2025
-- =====================================================================================================================

-- =====================================================================================================================
-- CTE (Common Table Expression) para organizar os dados principais
-- =====================================================================================================================
WITH Dados AS (
    SELECT
        -- ===== IDENTIFICAÇÃO DA ORDEM DE SERVIÇO =====
        cab.NUOS AS Nuos,

        -- ===== INFORMAÇÕES DO EXECUTANTE PRINCIPAL =====
        CAST(servsato.CODEXEC AS VARCHAR(10)) + ' - ' + usuexe.NOMEUSU AS NomeExecutante,
        servsato.CODEXEC,

        -- ===== INFORMAÇÕES DO SOLICITANTE =====
        cab.CODUSUINC AS CodSolicitante,
        CAST(cab.CODUSUINC AS VARCHAR(10)) + ' - ' + usu.NOMEUSU AS NomeSolicitante,

        -- ===== DADOS DO EQUIPAMENTO/VEÍCULO =====
        vei.AD_TIPOEQPTO,              -- Tipo de equipamento (campo customizado)
        cab.MANUTENCAO,                -- Código do tipo de manutenção

        -- ===== INFORMAÇÕES DOS AJUDANTES/EXECUTORES =====
        servsato.CODEXEC AS AJUNDANDE, -- Código do colaborador
        CAST(servsato.CODEXEC AS VARCHAR(10)) + ' - ' + usuaju.NOMEUSU AS NomeAJU,

        -- ===== DATAS E HORÁRIOS DE EXECUÇÃO =====
        servsato.DHINI AS DATA_INIC,   -- Data/hora início do apontamento
        servsato.DHFIN AS DATA_FIM,    -- Data/hora fim do apontamento

        -- ===== DADOS DO SERVIÇO =====
        serv.CODPROD AS CodigoServico,
        p.DESCRPROD AS DescricaoServico,
        CAST(serv.CODPROD AS VARCHAR) + ' - ' + serv.OBSERVACAO AS Atividade,

        -- ===== DADOS DO VEÍCULO =====
        CAST(cab.CODVEICULO AS VARCHAR(10)) + ' - ' + vei.PLACA AS Veiculo,
        vei.MARCAMODELO,
        servsato.AD_DESCR,

        -- ===== STATUS DA ORDEM DE SERVIÇO (CABEÇALHO) =====
        CASE cab.STATUS
            WHEN 'A' THEN 'Em Aberto'
            WHEN 'F' THEN 'Finalizada'
            WHEN 'E' THEN 'Em Execucao'
            WHEN 'P' THEN 'Aguardando Peca'
            WHEN 'R' THEN 'Reaberta'
            ELSE cab.STATUS
        END AS StatusOS,
        cab.STATUS AS CodStatusOS,

        -- ===== STATUS DO SERVIÇO (ITEM) =====
        CASE serv.STATUS
            WHEN 'E' THEN 'Em Execucao'
            WHEN 'A' THEN 'Em Aberto'
            WHEN 'F' THEN 'Finalizado'
            WHEN 'R' THEN 'Reaberto'
            ELSE serv.STATUS
        END AS StatusServico,
        serv.STATUS AS CodStatusServ,

        -- ===== TIPO DE MANUTENÇÃO =====
        CASE cab.MANUTENCAO
            WHEN 'C'  THEN 'Corretiva'
            WHEN 'CP' THEN 'Corretiva Programada'
            WHEN 'P'  THEN 'Preventiva'
            WHEN 'PG' THEN 'Preventiva de Garantia'
            WHEN 'L'  THEN 'Logistica'
            WHEN 'R'  THEN 'Reforma'
            WHEN 'S'  THEN 'Socorro'
            WHEN 'T'  THEN 'Retorno'
            WHEN 'I'  THEN 'Inventario'
            WHEN 'O'  THEN 'Outros'
            ELSE cab.MANUTENCAO
        END AS TipManu,

        -- =====================================================================================================================
        -- CÁLCULO DE INTERVALOS
        -- O campo INTERVALO pode estar em formato HHMM ou em minutos
        -- =====================================================================================================================

        -- INTERVALO EM MINUTOS
        CAST(
            CASE
                WHEN servsato.INTERVALO IS NULL THEN 0
                WHEN servsato.INTERVALO >= 100 AND (servsato.INTERVALO % 100) < 60
                    THEN (servsato.INTERVALO / 100) * 60 + (servsato.INTERVALO % 100)
                ELSE servsato.INTERVALO
            END
        AS INT) AS IntervaloMinutos,

        -- INTERVALO FORMATADO HH:MM
        RIGHT('0' + CAST(
            (CASE
                WHEN servsato.INTERVALO IS NULL THEN 0
                WHEN servsato.INTERVALO >= 100 AND (servsato.INTERVALO % 100) < 60
                    THEN (servsato.INTERVALO / 100) * 60 + (servsato.INTERVALO % 100)
                ELSE servsato.INTERVALO
             END) / 60 AS VARCHAR), 2)
        + ':' +
        RIGHT('0' + CAST(
            (CASE
                WHEN servsato.INTERVALO IS NULL THEN 0
                WHEN servsato.INTERVALO >= 100 AND (servsato.INTERVALO % 100) < 60
                    THEN (servsato.INTERVALO / 100) * 60 + (servsato.INTERVALO % 100)
                ELSE servsato.INTERVALO
             END) % 60 AS VARCHAR), 2) AS IntervaloFormatado,

        -- =====================================================================================================================
        -- CÁLCULOS DE TEMPO TRABALHADO
        -- =====================================================================================================================

        DATEDIFF(MINUTE, servsato.DHINI, servsato.DHFIN) AS MinutosTrabalhados,

        DATEDIFF(MINUTE, servsato.DHINI, servsato.DHFIN)
        - CAST(
            CASE
                WHEN servsato.INTERVALO IS NULL THEN 0
                WHEN servsato.INTERVALO >= 100 AND (servsato.INTERVALO % 100) < 60
                    THEN (servsato.INTERVALO / 100) * 60 + (servsato.INTERVALO % 100)
                ELSE servsato.INTERVALO
            END
        AS INT) AS MinutosLiquidos,

        RIGHT('0' + CAST(DATEDIFF(MINUTE, servsato.DHINI, servsato.DHFIN) / 60 AS VARCHAR), 2)
        + ':' +
        RIGHT('0' + CAST(DATEDIFF(MINUTE, servsato.DHINI, servsato.DHFIN) % 60 AS VARCHAR), 2) AS HorasBrutas,

        RIGHT('0' + CAST((
            DATEDIFF(MINUTE, servsato.DHINI, servsato.DHFIN)
            - CAST(
                CASE
                    WHEN servsato.INTERVALO IS NULL THEN 0
                    WHEN servsato.INTERVALO >= 100 AND (servsato.INTERVALO % 100) < 60
                        THEN (servsato.INTERVALO / 100) * 60 + (servsato.INTERVALO % 100)
                    ELSE servsato.INTERVALO
                END
            AS INT)
        ) / 60 AS VARCHAR), 2)
        + ':' +
        RIGHT('0' + CAST((
            DATEDIFF(MINUTE, servsato.DHINI, servsato.DHFIN)
            - CAST(
                CASE
                    WHEN servsato.INTERVALO IS NULL THEN 0
                    WHEN servsato.INTERVALO >= 100 AND (servsato.INTERVALO % 100) < 60
                        THEN (servsato.INTERVALO / 100) * 60 + (servsato.INTERVALO % 100)
                    ELSE servsato.INTERVALO
                END
            AS INT)
        ) % 60 AS VARCHAR), 2) AS HorasLiquidas,

        COUNT(servsato.CODEXEC) OVER (PARTITION BY servsato.NUOS) AS QtdAjudantes,

        (
            SELECT USU2.NOMEUSU
            FROM [SANKHYA].[TSIULG] USULOG
            JOIN [SANKHYA].[TSIUSU] USU2 ON USU2.CODUSU = USULOG.CODUSU
            WHERE SPID = @@SPID
        ) AS usuLogado

    FROM TCFOSCAB cab
    LEFT JOIN TCFSERVOS serv ON cab.NUOS = serv.NUOS
    LEFT JOIN TCFSERVOSATO servsato ON serv.NUOS = servsato.NUOS
        --AND serv.SEQUENCIA = servsato.SEQUENCIA
        AND servsato.DHINI IS NOT NULL
        AND servsato.DHFIN IS NOT NULL
    LEFT JOIN TSIUSU usu ON cab.CODUSUINC = usu.CODUSU
    LEFT JOIN TSIUSU usuexe ON usuexe.CODUSU = servsato.CODEXEC
    LEFT JOIN TGFPRO p ON serv.CODPROD = p.CODPROD
    LEFT JOIN TGFVEI vei ON cab.CODVEICULO = vei.CODVEICULO
    LEFT JOIN TSIUSU usuaju ON usuaju.CODUSU = servsato.CODEXEC

    WHERE
        (
            ($P{P_DATA_REQ_INI} IS NOT NULL AND $P{P_DATA_REQ_FIN} IS NOT NULL
             AND serv.DATAINI BETWEEN $P{P_DATA_REQ_INI} AND $P{P_DATA_REQ_FIN})
            OR ($P{P_DATA_REQ_INI} IS NULL AND $P{P_DATA_REQ_FIN} IS NULL
                AND serv.DATAINI >= DATEADD(DAY, -30, GETDATE()))
        )
        AND ($P{P_CODUSU} IS NULL OR servsato.CODEXEC = $P{P_CODUSU})
        AND ($P{P_NUOS} IS NULL OR cab.NUOS = $P{P_NUOS})
        AND (
            (cab.STATUS = 'E' AND $P{P_CAB_EXECUCAO} = 1) OR
            (cab.STATUS = 'A' AND $P{P_CAB_ABERTO} = 1) OR
            (cab.STATUS = 'F' AND $P{P_CAB_FINALIZADO} = 1) OR
            (cab.STATUS = 'R' AND $P{P_CAB_REABERTO} = 1) OR
            (cab.STATUS = 'P' AND $P{P_CAB_PECA} = 1) OR
            (serv.STATUS = 'E' AND $P{P_SERV_EXECUCAO} = 1) OR
            (serv.STATUS = 'A' AND $P{P_SERV_ABERTO} = 1) OR
            (serv.STATUS = 'F' AND $P{P_SERV_FINALIZADO} = 1) OR
            (serv.STATUS = 'R' AND $P{P_SERV_REABERTO} = 1) OR
            (
                $P{P_CAB_EXECUCAO} = 0 AND $P{P_CAB_ABERTO} = 0 AND $P{P_CAB_FINALIZADO} = 0
                AND $P{P_CAB_REABERTO} = 0 AND $P{P_CAB_PECA} = 0
                AND $P{P_SERV_EXECUCAO} = 0 AND $P{P_SERV_ABERTO} = 0
                AND $P{P_SERV_FINALIZADO} = 0 AND $P{P_SERV_REABERTO} = 0
            )
        )
)

SELECT
    *,

    -- =====================================================================================================================
    -- TOTAIS POR OS (já existentes)
    -- =====================================================================================================================
    SUM(MinutosTrabalhados) OVER(PARTITION BY NUOS) AS TotalMinutosTrabalhados,
    SUM(MinutosLiquidos)    OVER(PARTITION BY NUOS) AS TotalMinutosLiquidos,
    SUM(IntervaloMinutos)   OVER(PARTITION BY NUOS) AS TotalIntervaloMinutos,

    RIGHT('0' + CAST(MinutosTrabalhados / 60 AS VARCHAR), 2) + ':' +
    RIGHT('0' + CAST(MinutosTrabalhados % 60 AS VARCHAR), 2) AS HoraHomem,

    RIGHT('0' + CAST(MinutosLiquidos / 60 AS VARCHAR), 2) + ':' +
    RIGHT('0' + CAST(MinutosLiquidos % 60 AS VARCHAR), 2) AS HoraHomemLiquida,

    -- =====================================================================================================================
    -- TOTAIS GERAIS (TODAS AS LINHAS) USANDO WINDOW FUNCTIONS
    -- =====================================================================================================================
    SUM(MinutosTrabalhados) OVER() AS TotalGeralMinutosBrutos,
    SUM(MinutosLiquidos)    OVER() AS TotalGeralMinutosLiquidos,
    SUM(IntervaloMinutos)   OVER() AS TotalGeralIntervaloMinutos,

    -- TOTAL GERAL HORA-HOMEM BRUTO (minutos trabalhados * qtd ajudantes)
    SUM(MinutosTrabalhados * QtdAjudantes) OVER() AS TotalGeralMinutosHoraHomem,
    RIGHT('0' + CAST((SUM(MinutosTrabalhados * QtdAjudantes) OVER()) / 60 AS VARCHAR), 2) + ':' +
    RIGHT('0' + CAST((SUM(MinutosTrabalhados * QtdAjudantes) OVER()) % 60 AS VARCHAR), 2) AS TotalGeralHorasHoraHomem,

   -- TOTAL GERAL HORA-HOMEM LÍQUIDO (minutos líquidos * qtd ajudantes)
    SUM(MinutosLiquidos * QtdAjudantes) OVER() AS TotalGeralMinutosHoraHomemLiquido,
    RIGHT('0' + CAST((SUM(MinutosLiquidos * QtdAjudantes) OVER()) / 60 AS VARCHAR), 2) + ':' +
    RIGHT('0' + CAST((SUM(MinutosLiquidos * QtdAjudantes) OVER()) % 60 AS VARCHAR), 2) AS TotalGeralHorasHoraHomemLiquido,

    -- Formatação HH:MM para TOTAL GERAL de Horas Brutas
    RIGHT('0' + CAST((SUM(MinutosTrabalhados) OVER()) / 60 AS VARCHAR), 2) + ':' +
    RIGHT('0' + CAST((SUM(MinutosTrabalhados) OVER()) % 60 AS VARCHAR), 2) AS TotalGeralHorasBrutas,

    -- Formatação HH:MM para TOTAL GERAL de Horas Líquidas
    RIGHT('0' + CAST((SUM(MinutosLiquidos) OVER()) / 60 AS VARCHAR), 2) + ':' +
    RIGHT('0' + CAST((SUM(MinutosLiquidos) OVER()) % 60 AS VARCHAR), 2) AS TotalGeralHorasLiquidas

FROM Dados
ORDER BY Nuos DESC, CodigoServico DESC,NomeExecutante, DATA_INIC DESC;