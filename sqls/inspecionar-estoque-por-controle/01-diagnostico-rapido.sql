-- ===================================================================
-- 01 - DIAGNÓSTICO RÁPIDO DE ESTOQUE POR CONTROLE
-- ===================================================================
-- Objetivo: Responder às perguntas básicas sobre o problema de estoque
-- Uso: Execute este SQL primeiro para entender o cenário
-- ===================================================================

-- Configuração para análise (ajuste conforme necessário)
DECLARE @CODPROD INT = 15664;          -- Código do produto com problema
DECLARE @CODEMP SMALLINT = 1;           -- Empresa (normalmente 1)
DECLARE @CODLOCAL INT = 111003;          -- Local do estoque
DECLARE @CONTROLE VARCHAR(100) = NULL;   -- Deixe NULL para ver todos ou informe o controle problemático

PRINT '=== DIAGNÓSTICO RÁPIDO DE ESTOQUE ===';
PRINT 'Produto: ' + CAST(@CODPROD AS VARCHAR(10));
PRINT 'Empresa: ' + CAST(@CODEMP AS VARCHAR(5));
PRINT 'Local: ' + CAST(@CODLOCAL AS VARCHAR(10));
PRINT 'Controle: ' + ISNULL(@CONTROLE, 'TODOS');
PRINT 'Data/Hora: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '';

-- 1. INFORMAÇÕES BÁSICAS DO PRODUTO
PRINT '=== 1. INFORMAÇÕES DO PRODUTO ===';
SELECT 
    P.CODPROD,
    P.DESCRPROD,
    P.CODGRUPOPROD,
    P.ATIVO AS PRODUTO_ATIVO,
    P.USOPROD AS USA_CONTROLE_ESPECIAL,
    G.VALEST AS TIPO_VALIDACAO_ESTOQUE,
    G.PEDIRLIB AS PERMITE_LIBERACAO,
    G.AGRUPALOCVALEST AS AGRUPA_LOCAIS_VALEST
FROM TGFPRO P WITH (NOLOCK)
INNER JOIN TGFGRU G WITH (NOLOCK) ON P.CODGRUPOPROD = G.CODGRUPOPROD
WHERE P.CODPROD = @CODPROD;
PRINT '';

-- 2. ESTOQUE DISPONÍVEL POR CONTROLE
PRINT '=== 2. ESTOQUE DISPONÍVEL POR CONTROLE ===';
SELECT 
    E.CODEMP,
    E.CODLOCAL,
    L.DESCLOCAL AS NOME_LOCAL,
    E.CODPROD,
    E.CONTROLE,
    E.STATUSLOTE,
    E.ESTOQUE AS ESTOQUE_FISICO,
    E.RESERVADO AS ESTOQUE_RESERVADO,
    ISNULL(E.WMSBLOQUEADO, 0) AS ESTOQUE_BLOQUEADO_WMS,
    E.ATIVO AS REGISTRO_ATIVO,
    (E.ESTOQUE - E.RESERVADO - ISNULL(E.WMSBLOQUEADO, 0)) AS DISPONIVEL_SIMPLES,
    CASE 
        WHEN E.ATIVO = 'N' THEN '❌ INATIVO'
        WHEN E.ESTOQUE <= 0 THEN '❌ SEM ESTOQUE'
        WHEN E.ESTOQUE - E.RESERVADO - ISNULL(E.WMSBLOQUEADO, 0) <= 0 THEN '❌ SEM DISPONÍVEL'
        ELSE '✅ OK'
    END AS STATUS
FROM TGFEST E WITH (NOLOCK)
LEFT JOIN TGFLOC L WITH (NOLOCK) ON E.CODLOCAL = L.CODLOCAL
WHERE E.CODPROD = @CODPROD 
  AND E.CODEMP = @CODEMP 
  AND E.CODLOCAL = @CODLOCAL 
  AND E.CODPARC = 0
  AND (@CONTROLE IS NULL OR E.CONTROLE = @CONTROLE)
ORDER BY 
    CASE WHEN E.CONTROLE = @CONTROLE THEN 0 ELSE 1 END,
    E.CONTROLE;
PRINT '';

-- 3. VERIFICAÇÃO SE CONTROLE ESPECÍFICO EXISTE
PRINT '=== 3. VERIFICAÇÃO DE CONTROLE ESPECÍFICO ===';
IF @CONTROLE IS NOT NULL
BEGIN
    IF EXISTS(
        SELECT 1 FROM TGFEST WITH (NOLOCK)
        WHERE CODPROD = @CODPROD 
          AND CODEMP = @CODEMP 
          AND CODLOCAL = @CODLOCAL 
          AND CODPARC = 0 
          AND CONTROLE = @CONTROLE
    )
    BEGIN
        PRINT '✅ Controle "' + @CONTROLE + '" existe no estoque';
    END
    ELSE
    BEGIN
        PRINT '❌ Controle "' + @CONTROLE + '" NÃO existe no estoque';
        PRINT '';
        PRINT 'Controles disponíveis para este produto:';
        SELECT CONTROLE, ESTOQUE, (ESTOQUE - RESERVADO) AS DISPONIVEL
        FROM TGFEST WITH (NOLOCK)
        WHERE CODPROD = @CODPROD 
          AND CODEMP = @CODEMP 
          AND CODLOCAL = @CODLOCAL 
          AND CODPARC = 0
        ORDER BY CONTROLE;
    END
END
ELSE
BEGIN
    PRINT '📋 Todos os controles listados acima';
END
PRINT '';

-- 4. PARÂMETROS DO SISTEMA RELACIONADOS
PRINT '=== 4. PARÂMETROS DO SISTEMA ===';
SELECT 
    CHAVE,
    LOGICO,
    CASE 
        WHEN LOGICO = 'S' THEN '✅ ATIVO'
        WHEN LOGICO = 'N' THEN '❌ INATIVO'
        ELSE '❓ NÃO DEFINIDO'
    END AS STATUS
FROM TSIPAR WITH (NOLOCK)
WHERE CHAVE IN (
    'SOESTOQUE',           -- Considera reserva na validação
    'WMSDESCONESTBLQ',     -- Desconsidera bloqueio WMS na faturação
    'SUBESTDOCAWMS',      -- Considera estoque em decomposição WMS
    'ATUALESTSERV',       -- Atualiza estoque de serviço
    'BLOQESTVENC'         -- Bloqueia venda de estoque vencido
);
PRINT '';

-- 5. ITENS COM RESERVA ATIVA
PRINT '=== 5. RESERVAS ATIVAS DO PRODUTO ===';
SELECT 
    I.NUNOTA AS NOTA,
    I.SEQUENCIA AS SEQUENCIA,
    I.CONTROLE AS CONTROLE_ITEM,
    I.QTDNEG AS QUANTIDADE_NEGOCIADA,
    I.QTDENTREGUE AS QUANTIDADE_ENTREGUE,
    I.RESERVA AS QUANTIDADE_RESERVADA,
    (I.QTDNEG - I.QTDENTREGUE) AS PENDENTE,
    C.DESCRCAB AS DESC_TIPO_OPERACAO,
    I.DTALTER AS DATA_ALTERACAO,
    CASE 
        WHEN I.STATUSNOTA = 'P' THEN '📝 PENDENTE'
        WHEN I.STATUSNOTA = 'L' THEN '✅ LIBERADA'
        WHEN I.STATUSNOTA = 'C' THEN '🚫 CANCELADA'
        ELSE '❓ ' + I.STATUSNOTA
    END AS STATUS_NOTA
FROM TGFITE I WITH (NOLOCK)
LEFT JOIN TGFCAB C WITH (NOLOCK) ON I.NUNOTA = C.NUNOTA
LEFT JOIN TGFTOP T WITH (NOLOCK) ON C.CODTIPOPER = T.CODTIPOPER AND C.DHTIPOPER = T.DHALTER
WHERE I.CODPROD = @CODPROD 
  AND I.RESERVA > 0
ORDER BY I.DTALTER DESC;
PRINT '';

-- 6. RESUMO E RECOMENDAÇÕES
PRINT '=== 6. RESUMO E RECOMENDAÇÕES ===';
DECLARE @TOTAL_ESTOQUE FLOAT = 0;
DECLARE @TOTAL_RESERVADO FLOAT = 0;
DECLARE @TOTAL_DISPONIVEL FLOAT = 0;
DECLARE @QTD_CONTROLES INT = 0;

SELECT 
    @TOTAL_ESTOQUE = SUM(E.ESTOQUE),
    @TOTAL_RESERVADO = SUM(E.RESERVADO),
    @TOTAL_DISPONIVEL = SUM(E.ESTOQUE - E.RESERVADO - ISNULL(E.WMSBLOQUEADO, 0)),
    @QTD_CONTROLES = COUNT(DISTINCT E.CONTROLE)
FROM TGFEST E WITH (NOLOCK)
WHERE E.CODPROD = @CODPROD 
  AND E.CODEMP = @CODEMP 
  AND E.CODLOCAL = @CODLOCAL 
  AND E.CODPARC = 0
  AND E.ATIVO = 'S';

PRINT '📊 RESUMO GERAL:';
PRINT '   Total de controles: ' + CAST(@QTD_CONTROLES AS VARCHAR(10));
PRINT '   Estoque físico total: ' + CAST(@TOTAL_ESTOQUE AS VARCHAR(15));
PRINT '   Estoque reservado total: ' + CAST(@TOTAL_RESERVADO AS VARCHAR(15));
PRINT '   Estoque disponível total: ' + CAST(@TOTAL_DISPONIVEL AS VARCHAR(15));
PRINT '';

IF @TOTAL_DISPONIVEL <= 0
BEGIN
    PRINT '❌ PROBLEMA IDENTIFICADO: Estoque disponível total é zero ou negativo';
    PRINT '   🔧 RECOMENDAÇÕES:';
    PRINT '   1. Verificar se há erro de digitação no código do produto';
    PRINT '   2. Verificar se o produto está com estoque em outro local';
    PRINT '   3. Verificar se há movimentações recentes que zeraram o estoque';
    PRINT '   4. Execute o script 02-inspecao-completa.sql para análise detalhada';
END
ELSE IF @QTD_CONTROLES = 0
BEGIN
    PRINT '❌ PROBLEMA IDENTIFICADO: Nenhum controle de estoque encontrado';
    PRINT '   🔧 RECOMENDAÇÕES:';
    PRINT '   1. Verificar se o local está correto';
    PRINT '   2. Verificar se o produto está cadastrado corretamente';
    PRINT '   3. Executar o script 02-inspecao-completa.sql';
END
ELSE
BEGIN
    PRINT '✅ ESTOQUE DISPONÍVEL ENCONTRADO';
    PRINT '   🔧 RECOMENDAÇÕES:';
    PRINT '   1. Se o problema persiste, verifique o controle específico utilizado';
    PRINT '   2. Execute o script 02-inspecao-completa.sql para análise detalhada';
    PRINT '   3. Verifique se há bloqueios ou reservas específicas do controle';
END

PRINT '';
PRINT '=== FIM DO DIAGNÓSTICO ===';
PRINT 'Próximo passo: Execute 02-inspecao-completa.sql para análise detalhada';
PRINT '';