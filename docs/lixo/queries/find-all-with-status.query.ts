export const findAllWithStatusQuery = `
DECLARE @DataRef DATETIME = ISNULL(@refDate, GETDATE());

SELECT
    v.CODVEICULO,
    v.PLACA,
    LTRIM(RTRIM(v.MARCAMODELO)) AS Nome,
    LTRIM(RTRIM(ISNULL(v.ESPECIETIPO, ''))) AS Tipo,
    LTRIM(RTRIM(ISNULL(v.AD_TIPOEQPTO, v.CATEGORIA))) AS Categoria,
    LTRIM(RTRIM(ISNULL(v.AD_CAPACIDADE, ''))) AS Capacidade,
    LTRIM(RTRIM(ISNULL(v.AD_FABRICANTE, ''))) AS Fabricante,
    v.ANOFABRIC,
    v.ANOMOD,
    v.CHASSIS,
    v.RENAVAM,
    v.COMBUSTIVEL,
    v.CODMOTORISTA,
    v.ATIVO,
    v.BLOQUEADO,
    
    -- ========== STATUS CALCULADO COM BASE EM DATAS ==========
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
        
        -- 3. EM_USO (Alugado): Tem OS comercial em execução
        --    (INICEXEC preenchido e TERMEXEC nulo OU data de referência dentro do período)
        WHEN EXISTS (
            SELECT 1 FROM SANKHYA.TCSITE i
            INNER JOIN SANKHYA.TCSOSE o ON o.NUMOS = i.NUMOS
            WHERE i.AD_CODVEICULO = v.CODVEICULO
            AND o.SITUACAO = 'P'
            AND o.DTFECHAMENTO IS NULL
            AND (
                -- Em execução real (INICEXEC preenchido, TERMEXEC nulo)
                (i.INICEXEC IS NOT NULL AND i.TERMEXEC IS NULL)
                OR
                -- OU data/hora prevista <= agora (deveria ter iniciado)
                (i.DHPREVISTA <= @DataRef AND i.TERMEXEC IS NULL)
            )
        ) THEN 'EM_USO'
        
        -- 4. AGENDADO: Tem OS futura (ainda não iniciou)
        WHEN EXISTS (
            SELECT 1 FROM SANKHYA.TCSITE i
            INNER JOIN SANKHYA.TCSOSE o ON o.NUMOS = i.NUMOS
            WHERE i.AD_CODVEICULO = v.CODVEICULO
            AND o.SITUACAO = 'P'
            AND o.DTFECHAMENTO IS NULL
            AND i.DHPREVISTA > @DataRef
            AND i.INICEXEC IS NULL
        ) THEN 'AGENDADO'
        
        -- 5. LIVRE: Nenhuma das anteriores
        ELSE 'LIVRE'
    END AS Status,
    
    -- Data/hora de referência usada
    @DataRef AS DataReferencia,
    
    -- ========== INFORMAÇÕES DA OS COMERCIAL (ALUGADO) ==========
    -- Localização atual (da OS Pendente)
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
     ORDER BY i.DHPREVISTA ASC
    ) AS LocalAtual,
    
    -- Cliente da OS ativa (código)
    (SELECT TOP 1 o.CODPARC
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     ORDER BY i.DHPREVISTA ASC
    ) AS CodParcOS,
    
    -- Cliente da OS ativa (nome)
    (SELECT TOP 1 LTRIM(RTRIM(p.RAZAOSOCIAL))
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     INNER JOIN SANKHYA.TGFPAR p ON p.CODPARC = o.CODPARC
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     ORDER BY i.DHPREVISTA ASC
    ) AS ClienteNome,
    
    -- Número da OS ativa/agendada
    (SELECT TOP 1 o.NUMOS
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     ORDER BY i.DHPREVISTA ASC
    ) AS NumOSAtiva,
    
    -- Data/hora prevista do item (para agendamento)
    (SELECT TOP 1 i.DHPREVISTA
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     ORDER BY i.DHPREVISTA ASC
    ) AS DataPrevista,
    
    -- Data/hora real de início da execução (quando alugado)
    (SELECT TOP 1 i.INICEXEC
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     AND i.INICEXEC IS NOT NULL
     ORDER BY i.INICEXEC DESC
    ) AS DataInicioExecucao,
    
    -- Próximo agendamento futuro (para equipamentos livres ou alugados)
    (SELECT TOP 1 i.DHPREVISTA
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     AND i.DHPREVISTA > @DataRef
     AND i.INICEXEC IS NULL
     ORDER BY i.DHPREVISTA ASC
    ) AS ProximoAgendamento,
    
    -- Número de OS do próximo agendamento
    (SELECT TOP 1 o.NUMOS
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     AND i.DHPREVISTA > @DataRef
     AND i.INICEXEC IS NULL
     ORDER BY i.DHPREVISTA ASC
    ) AS NumOSAgendada,
    
    -- Cliente do próximo agendamento
    (SELECT TOP 1 LTRIM(RTRIM(p.RAZAOSOCIAL))
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     INNER JOIN SANKHYA.TGFPAR p ON p.CODPARC = o.CODPARC
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     AND i.DHPREVISTA > @DataRef
     AND i.INICEXEC IS NULL
     ORDER BY i.DHPREVISTA ASC
    ) AS ClienteAgendado,
    
    -- Data início da OS comercial (chamada original)
    (SELECT TOP 1 o.DHCHAMADA
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     ORDER BY i.DHPREVISTA ASC
    ) AS DataInicioOS,
    
    -- Operador/Motorista da OS (funcionário vinculado ao item da OS) - OPERADOR DA MÁQUINA
    (SELECT TOP 1 LTRIM(RTRIM(ISNULL(f.NOMEFUNC, u.NOMEUSU)))
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     LEFT JOIN SANKHYA.TSIUSU u ON u.CODUSU = i.CODUSU
     LEFT JOIN SANKHYA.TFPFUN f ON f.CODFUNC = u.CODFUNC
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     ORDER BY o.DHCHAMADA DESC
    ) AS OperadorMaquina,
    
    -- Operador HOMEM (via NUMOSRELACIONADA - busca na OS relacionada)
    (SELECT TOP 1 LTRIM(RTRIM(ISNULL(f.NOMEFUNC, u.NOMEUSU)))
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     -- Buscar a OS relacionada (do operador/homem)
     LEFT JOIN SANKHYA.TCSOSE oRel ON oRel.NUMOS = o.NUMOSRELACIONADA
     LEFT JOIN SANKHYA.TCSITE iRel ON iRel.NUMOS = oRel.NUMOS
     LEFT JOIN SANKHYA.TSIUSU u ON u.CODUSU = ISNULL(iRel.CODUSU, i.CODUSU)
     LEFT JOIN SANKHYA.TFPFUN f ON f.CODFUNC = u.CODFUNC
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     AND o.NUMOSRELACIONADA IS NOT NULL
     ORDER BY o.DHCHAMADA DESC
    ) AS OperadorHomem,
    
    -- Nome do operador para exibição (preferência: Homem, fallback: Máquina)
    (SELECT TOP 1
        COALESCE(
            -- Primeiro tenta pegar da OS relacionada (operador homem)
            (SELECT TOP 1 LTRIM(RTRIM(ISNULL(f2.NOMEFUNC, u2.NOMEUSU)))
             FROM SANKHYA.TCSOSE oRel
             INNER JOIN SANKHYA.TCSITE iRel ON iRel.NUMOS = oRel.NUMOS
             LEFT JOIN SANKHYA.TSIUSU u2 ON u2.CODUSU = iRel.CODUSU
             LEFT JOIN SANKHYA.TFPFUN f2 ON f2.CODFUNC = u2.CODFUNC
             WHERE oRel.NUMOS = o.NUMOSRELACIONADA
             AND iRel.CODUSU IS NOT NULL
            ),
            -- Fallback: operador da própria OS (máquina)
            LTRIM(RTRIM(ISNULL(f.NOMEFUNC, u.NOMEUSU)))
        )
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     LEFT JOIN SANKHYA.TSIUSU u ON u.CODUSU = i.CODUSU
     LEFT JOIN SANKHYA.TFPFUN f ON f.CODFUNC = u.CODFUNC
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     ORDER BY o.DHCHAMADA DESC
    ) AS OperadorNome,
    
    -- Código do operador
    (SELECT TOP 1 i.CODUSU
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     ORDER BY o.DHCHAMADA DESC
    ) AS CodOperador,
    
    -- Ajudantes (lista concatenada - até 3)
    (SELECT TOP 1
        STUFF((
            SELECT ', ' + LTRIM(RTRIM(ISNULL(f2.NOMEFUNC, u2.NOMEUSU)))
            FROM SANKHYA.TCSITE i2
            LEFT JOIN SANKHYA.TSIUSU u2 ON u2.CODUSU = i2.CODUSU
            LEFT JOIN SANKHYA.TFPFUN f2 ON f2.CODFUNC = u2.CODFUNC
            WHERE i2.NUMOS = o.NUMOS
            AND i2.AD_CODVEICULO IS NULL
            AND i2.CODUSU IS NOT NULL
            FOR XML PATH('')
        ), 1, 2, '')
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     ORDER BY o.DHCHAMADA DESC
    ) AS Ajudantes,
    
    -- ========== INFORMAÇÕES DA MANUTENÇÃO ==========
    -- Horímetro (última leitura)
    (SELECT TOP 1 m.HORIMETRO
     FROM SANKHYA.TCFOSCAB m
     WHERE m.CODVEICULO = v.CODVEICULO
     AND m.HORIMETRO IS NOT NULL
     ORDER BY m.DATAINI DESC
    ) AS Horimetro,
    
    -- KM acumulado
    v.KMACUM,
    
    -- Última manutenção
    (SELECT TOP 1 m.DATAFIN
     FROM SANKHYA.TCFOSCAB m
     WHERE m.CODVEICULO = v.CODVEICULO
     AND m.DATAFIN IS NOT NULL
     ORDER BY m.DATAFIN DESC
    ) AS UltimaManutencao,
    
    -- OS de manutenção ativa
    (SELECT TOP 1 m.NUOS
     FROM SANKHYA.TCFOSCAB m
     WHERE m.CODVEICULO = v.CODVEICULO
     AND m.STATUS IN ('A', 'E')
     AND m.DATAFIN IS NULL
    ) AS NumOSManutencao,
    
    -- Tipo de manutenção (C=Corretiva, P=Preventiva, O=Outros)
    (SELECT TOP 1
        CASE m.MANUTENCAO
            WHEN 'C' THEN 'Corretiva'
            WHEN 'P' THEN 'Preventiva'
            WHEN 'O' THEN 'Outros'
            ELSE m.MANUTENCAO
        END
     FROM SANKHYA.TCFOSCAB m
     WHERE m.CODVEICULO = v.CODVEICULO
     AND m.STATUS IN ('A', 'E')
     AND m.DATAFIN IS NULL
    ) AS TipoManutencao,
    
    -- Status da manutenção (A=Aberta, E=Em Execução)
    (SELECT TOP 1
        CASE m.STATUS
            WHEN 'A' THEN 'Aguardando'
            WHEN 'E' THEN 'Em Execução'
            ELSE m.STATUS
        END
     FROM SANKHYA.TCFOSCAB m
     WHERE m.CODVEICULO = v.CODVEICULO
     AND m.STATUS IN ('A', 'E')
     AND m.DATAFIN IS NULL
    ) AS StatusManutencao,
    
    -- Data início da manutenção
    (SELECT TOP 1 m.DATAINI
     FROM SANKHYA.TCFOSCAB m
     WHERE m.CODVEICULO = v.CODVEICULO
     AND m.STATUS IN ('A', 'E')
     AND m.DATAFIN IS NULL
    ) AS DataInicioManutencao,
    
    -- Previsão de término
    (SELECT TOP 1 m.PREVISAO
     FROM SANKHYA.TCFOSCAB m
     WHERE m.CODVEICULO = v.CODVEICULO
     AND m.STATUS IN ('A', 'E')
     AND m.DATAFIN IS NULL
    ) AS PrevisaoManutencao,
    
    -- Mecânico responsável (da tabela AD_TCFEXEC ou TCFSERVOSATO)
    (SELECT TOP 1 LTRIM(RTRIM(ISNULL(f.NOMEFUNC, u.NOMEUSU)))
     FROM SANKHYA.TCFOSCAB m
     LEFT JOIN SANKHYA.AD_TCFEXEC e ON e.NUOS = m.NUOS
     LEFT JOIN SANKHYA.TSIUSU u ON u.CODUSU = ISNULL(e.CODUSUEXEC, e.CODUSU)
     LEFT JOIN SANKHYA.TFPFUN f ON f.CODFUNC = u.CODFUNC
     WHERE m.CODVEICULO = v.CODVEICULO
     AND m.STATUS IN ('A', 'E')
     AND m.DATAFIN IS NULL
     AND (e.CODUSUEXEC IS NOT NULL OR e.CODUSU IS NOT NULL)
     ORDER BY e.DTINI DESC
    ) AS MecanicoNome,
    
    -- Serviço atual sendo executado
    (SELECT TOP 1 LTRIM(RTRIM(p.DESCRPROD))
     FROM SANKHYA.TCFOSCAB m
     INNER JOIN SANKHYA.TCFSERVOS s ON s.NUOS = m.NUOS
     INNER JOIN SANKHYA.TGFPRO p ON p.CODPROD = s.CODPROD
     WHERE m.CODVEICULO = v.CODVEICULO
     AND m.STATUS IN ('A', 'E')
     AND m.DATAFIN IS NULL
     AND s.STATUS = 'E'
     ORDER BY s.DATAINI DESC
    ) AS ServicoAtual,
    
    -- Quantidade de serviços na OS de manutenção
    (SELECT COUNT(*)
     FROM SANKHYA.TCFOSCAB m
     INNER JOIN SANKHYA.TCFSERVOS s ON s.NUOS = m.NUOS
     WHERE m.CODVEICULO = v.CODVEICULO
     AND m.STATUS IN ('A', 'E')
     AND m.DATAFIN IS NULL
    ) AS QtdServicosManutencao,
    
    -- Serviços finalizados
    (SELECT COUNT(*)
     FROM SANKHYA.TCFOSCAB m
     INNER JOIN SANKHYA.TCFSERVOS s ON s.NUOS = m.NUOS
     WHERE m.CODVEICULO = v.CODVEICULO
     AND m.STATUS IN ('A', 'E')
     AND m.DATAFIN IS NULL
     AND s.STATUS = 'F'
    ) AS ServicosFinalizados,
    
    -- ========== INFORMAÇÕES ADICIONAIS DA OS COMERCIAL ==========
    -- Quantidade de diárias (total de itens da OS para este veículo EXCLUINDO CANCELADAS)
    -- Cancelada = HRINICIAL=0 AND HRFINAL=0 AND NÃO CONFORMIDADE (COBRAR='N' AND RETRABALHO='S')
    (SELECT COUNT(*)
     FROM SANKHYA.TCSITE i
     INNER JOIN SANKHYA.TCSOSE o ON o.NUMOS = i.NUMOS
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     -- Excluir diárias canceladas (não conforme com horas zeradas)
     AND NOT (
         ISNULL(i.HRINICIAL, 0) = 0 
         AND ISNULL(i.HRFINAL, 0) = 0 
         AND i.COBRAR = 'N' 
         AND i.RETRABALHO = 'S'
     )
    ) AS QtdDiarias,
    
    -- Tem agendamento futuro? (para veículos LIVRE que tem OS futura)
    CASE WHEN EXISTS (
        SELECT 1 FROM SANKHYA.TCSITE i
        INNER JOIN SANKHYA.TCSOSE o ON o.NUMOS = i.NUMOS
        WHERE i.AD_CODVEICULO = v.CODVEICULO
        AND o.SITUACAO = 'P'
        AND o.DTFECHAMENTO IS NULL
        AND i.DHPREVISTA > @DataRef
        AND i.INICEXEC IS NULL
    ) THEN 1 ELSE 0 END AS TemAgendamentoFuturo,
    
    -- Descrição da OS
    (SELECT TOP 1 CAST(o.DESCRICAO AS VARCHAR(500))
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     ORDER BY i.DHPREVISTA ASC
    ) AS DescricaoOS,
    
    -- Contato do cliente
    (SELECT TOP 1 LTRIM(RTRIM(o.NOMECONTATO))
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     ORDER BY i.DHPREVISTA ASC
    ) AS ContatoCliente,
    
    -- Telefone do contato
    (SELECT TOP 1 LTRIM(RTRIM(o.TELCONTATO))
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     ORDER BY i.DHPREVISTA ASC
    ) AS TelefoneContato,
    
    -- Endereço do serviço
    (SELECT TOP 1 LTRIM(RTRIM(o.ENDERECO))
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     ORDER BY i.DHPREVISTA ASC
    ) AS EnderecoOS,
    
    -- Bairro do serviço
    (SELECT TOP 1 LTRIM(RTRIM(o.BAIRRO))
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     ORDER BY i.DHPREVISTA ASC
    ) AS BairroOS,
    
    -- Data de previsão de fim (última diária)
    (SELECT TOP 1 i.DHPREVISTA
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     ORDER BY i.NUMITEM DESC
    ) AS DataPrevisaoFim,
    
    -- Número da OS relacionada (operador homem)
    (SELECT TOP 1 o.NUMOSRELACIONADA
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     ORDER BY i.DHPREVISTA ASC
    ) AS NumOSRelacionada,
    
    -- Tipo de Serviço calculado:
    -- CONFORMIDADE (C), NÃO CONFORMIDADE (N), SERVIÇOS COMPLEMENTARES (S), IRREGULAR (I)
    -- Se HRINICIAL e HRFINAL = 0 e NÃO CONFORMIDADE = CANCELADA
    (SELECT TOP 1
        CASE
            -- Se HRINICIAL e HRFINAL são 0 e é NÃO CONFORMIDADE, está CANCELADA
            WHEN ISNULL(i.HRINICIAL, 0) = 0 AND ISNULL(i.HRFINAL, 0) = 0
                 AND (CASE WHEN i.COBRAR = 'N' THEN
                        (CASE WHEN i.RETRABALHO = 'N' THEN 'C' ELSE 'N' END)
                      WHEN i.RETRABALHO = 'N' THEN 'S'
                      ELSE 'I' END) = 'N'
            THEN 'CANCELADA'
            -- Conformidade
            WHEN i.COBRAR = 'N' AND i.RETRABALHO = 'N' THEN 'CONFORMIDADE'
            -- Não Conformidade
            WHEN i.COBRAR = 'N' AND i.RETRABALHO = 'S' THEN 'NAO_CONFORMIDADE'
            -- Serviços Complementares
            WHEN i.COBRAR = 'S' AND i.RETRABALHO = 'N' THEN 'SERVICO_COMPLEMENTAR'
            -- Irregular
            ELSE 'IRREGULAR'
        END
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     ORDER BY i.DHPREVISTA ASC
    ) AS TipoServico,
    
    -- Código do tipo de serviço (C, N, S, I, X=Cancelada)
    (SELECT TOP 1
        CASE
            WHEN ISNULL(i.HRINICIAL, 0) = 0 AND ISNULL(i.HRFINAL, 0) = 0
                 AND (CASE WHEN i.COBRAR = 'N' THEN
                        (CASE WHEN i.RETRABALHO = 'N' THEN 'C' ELSE 'N' END)
                      WHEN i.RETRABALHO = 'N' THEN 'S'
                      ELSE 'I' END) = 'N'
            THEN 'X'
            ELSE (CASE WHEN i.COBRAR = 'N' THEN
                    (CASE WHEN i.RETRABALHO = 'N' THEN 'C' ELSE 'N' END)
                  WHEN i.RETRABALHO = 'N' THEN 'S'
                  ELSE 'I' END)
        END
     FROM SANKHYA.TCSOSE o
     INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
     WHERE i.AD_CODVEICULO = v.CODVEICULO
     AND o.SITUACAO = 'P'
     AND o.DTFECHAMENTO IS NULL
     ORDER BY i.DHPREVISTA ASC
    ) AS CodTipoServico
    
FROM SANKHYA.TGFVEI v
WHERE v.AD_EXIBEDASH = 'S'
   OR (v.AD_EXIBEDASH IS NULL AND v.ATIVO = 'S' AND v.CATEGORIA = 'ALUGUEL')
ORDER BY
    CASE
        WHEN ISNULL(v.AD_TIPOEQPTO, '') LIKE '%GUINDAUTO%' THEN 1
        WHEN ISNULL(v.AD_TIPOEQPTO, '') LIKE '%GUINDASTE%' THEN 2
        WHEN ISNULL(v.AD_TIPOEQPTO, '') LIKE '%CAVALO%' OR ISNULL(v.AD_TIPOEQPTO, '') LIKE '%CARRETA%' THEN 3
        WHEN ISNULL(v.AD_TIPOEQPTO, '') LIKE '%CARRO%' OR ISNULL(v.AD_TIPOEQPTO, '') LIKE '%VAN%' OR ISNULL(v.AD_TIPOEQPTO, '') LIKE '%PICKUP%' THEN 4
        WHEN ISNULL(v.AD_TIPOEQPTO, '') LIKE '%EMPILHA%' THEN 5
        ELSE 6
    END,
    v.MARCAMODELO
`;
