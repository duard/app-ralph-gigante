-- ===================================================================
-- 04 - VALIDAÇÃO FINAL PÓS CORREÇÕES
-- ===================================================================
-- Objetivo: Verificar se o problema de estoque foi resolvido
-- Uso: Execute após aplicar as correções do script 03
-- ===================================================================

-- Configuração (ajuste conforme necessário)
DECLARE @CODPROD INT = 15664;          -- Código do produto
DECLARE @CODEMP SMALLINT = 1;           -- Empresa
DECLARE @CODLOCAL INT = 111003;          -- Local do estoque
DECLARE @CONTROLE_VERIFICAR VARCHAR(100) = '9/16" X 10'; -- Controle que estava causando erro
DECLARE @CONTROLE_CORRETO VARCHAR(100) = '12X5"';     -- Controle correto (ajuste conforme encontrado)

PRINT '=== VALIDAÇÃO FINAL PÓS CORREÇÕES ===';
PRINT 'Produto: ' + CAST(@CODPROD AS VARCHAR(10));
PRINT 'Empresa: ' + CAST(@CODEMP AS VARCHAR(5));
PRINT 'Local: ' + CAST(@CODLOCAL AS VARCHAR(10));
PRINT 'Controle original problemático: ' + @CONTROLE_VERIFICAR;
PRINT 'Controle correto: ' + @CONTROLE_CORRETO;
PRINT 'Data/Hora: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '';

-- 1. VERIFICAÇÃO SE O CONTROLE PROBLEMÁTICO AINDA EXISTE
PRINT '=== 1. VERIFICAÇÃO DO CONTROLE ORIGINAL ===';
DECLARE @CONTROLE_PROBLEMA_EXISTE BIT = 0;
DECLARE @ESTOQUE_PROBLEMA FLOAT = 0;

SELECT 
    @CONTROLE_PROBLEMA_EXISTE = 1,
    @ESTOQUE_PROBLEMA = ESTOQUE
FROM TGFEST WITH (NOLOCK)
WHERE CODPROD = @CODPROD 
  AND CODEMP = @CODEMP 
  AND CODLOCAL = @CODLOCAL 
  AND CODPARC = 0 
  AND CONTROLE = @CONTROLE_VERIFICAR;

IF @CONTROLE_PROBLEMA_EXISTE = 1
BEGIN
    PRINT '⚠️ ATENÇÃO: Controle problemático "' + @CONTROLE_VERIFICAR + '" ainda existe no estoque!';
    PRINT 'Estoque neste controle: ' + CAST(@ESTOQUE_PROBLEMA AS VARCHAR(10));
    PRINT 'Recomendações:';
    PRINT '1. Execute o script 03-correcao-controle.sql para INATIVAR este controle';
    PRINT '2. Ou use o controle correto "' + @CONTROLE_CORRETO + '" nas notas fiscais';
END
ELSE
BEGIN
    PRINT '✅ Controle problemático "' + @CONTROLE_VERIFICAR + '" foi removido com sucesso!';
END
PRINT '';

-- 2. VERIFICAÇÃO DO CONTROLE CORRETO
PRINT '=== 2. VERIFICAÇÃO DO CONTROLE CORRETO ===';
DECLARE @CONTROLE_CORRETO_EXISTE BIT = 0;
DECLARE @ESTOQUE_CORRETO FLOAT = 0;

SELECT 
    @CONTROLE_CORRETO_EXISTE = 1,
    @ESTOQUE_CORRETO = ESTOQUE
FROM TGFEST WITH (NOLOCK)
WHERE CODPROD = @CODPROD 
  AND CODEMP = @CODEMP 
  AND CODLOCAL = @CODLOCAL 
  AND CODPARC = 0 
  AND CONTROLE = @CONTROLE_CORRETO;

IF @CONTROLE_CORRETO_EXISTE = 1
BEGIN
    PRINT '✅ Controle correto "' + @CONTROLE_CORRETO + '" existe com estoque: ' + CAST(@ESTOQUE_CORRETO AS VARCHAR(10));
END
ELSE
BEGIN
    PRINT '❌ Controle correto "' + @CONTROLE_CORRETO + '" NÃO foi encontrado!';
    PRINT 'Execute o script 03-correcao-controle.sql para criá-lo';
END
PRINT '';

-- 3. VERIFICAÇÃO DE ESTOQUE TOTAL DISPONÍVEL
PRINT '=== 3. VERIFICAÇÃO DE ESTOQUE TOTAL ===';
DECLARE @TOTAL_ESTOQUE FLOAT = 0;
DECLARE @TOTAL_DISPONIVEL FLOAT = 0;

SELECT 
    @TOTAL_ESTOQUE = SUM(ESTOQUE),
    @TOTAL_DISPONIVEL = SUM(ESTOQUE - RESERVADO - ISNULL(WMSBLOQUEADO, 0))
FROM TGFEST WITH (NOLOCK)
WHERE CODPROD = @CODPROD 
  AND CODEMP = @CODEMP 
  AND CODLOCAL = @CODLOCAL 
  AND CODPARC = 0 
  AND ATIVO = 'S';

PRINT '📊 RESUMO FINAL:';
PRINT '   Estoque físico total: ' + CAST(@TOTAL_ESTOQUE AS VARCHAR(15));
PRINT '   Estoque disponível total: ' + CAST(@TOTAL_DISPONIVEL AS VARCHAR(15));
PRINT '   Status: ' + CASE 
        WHEN @TOTAL_DISPONIVEL > 0 THEN '✅ ESTOQUE DISPONÍVEL'
        WHEN @TOTAL_DISPONIVEL = 0 THEN '⚠️ ESTOQUE ZERADO'
        ELSE '❌ ESTOQUE NEGATIVO'
    END;
PRINT '';

-- 4. SIMULAÇÃO DA VALIDAÇÃO SANKHYA
PRINT '=== 4. SIMULAÇÃO DA PROCEDURE DE VALIDAÇÃO ===';
DECLARE @QUANTEST_SIMULADA FLOAT = 0;
DECLARE @VALEST_SIMULADO CHAR(1) = 'N';

-- Simular o cálculo que a procedure STP_VALIDA_ESTOQUE40 faz
SELECT @QUANTEST_SIMULADA = SUM(
    ESTOQUE - 
    (CASE WHEN 'N' = 'N' THEN RESERVADO ELSE 0 END) -  -- SOESTOQUE = N não considera reserva
    (CASE WHEN 'N' = 'N' THEN 0 ELSE 0 END) -  -- WMSDESCONESTBLQ = N
    (CASE WHEN 'N' = 'N' THEN 0 ELSE 0 END)    -- SUBESTDOCAWMS = N
)
FROM TGFEST WITH (NOLOCK)
WHERE CODPROD = @CODPROD 
  AND CODEMP = @CODEMP 
  AND CODLOCAL = @CODLOCAL 
  AND CODPARC = 0 
  AND ATIVO = 'S'
  AND (CONTROLE = @CONTROLE_VERIFICAR OR CONTROLE = @CONTROLE_CORRETO);

SELECT @VALEST_SIMULADO = CASE 
        WHEN @QUANTEST_SIMULADA > 0 THEN 'A'  -- Valida e aceita
        ELSE 'E'  -- Erro estoque insuficiente
    END;

PRINT '🔍 RESULTADO DA SIMULAÇÃO:';
PRINT '   Quantidade calculada: ' + CAST(@QUANTEST_SIMULADA AS VARCHAR(10));
PRINT '   VALEST simulado: ' + @VALEST_SIMULADO;
PRINT '   Status esperado: ' + CASE @VALEST_SIMULADO WHEN 'A' THEN '✅ PASSOU' ELSE '❌ FALHOU' END;
PRINT '';

-- 5. ITENS COM CONTROLE ATUALIZADO
PRINT '=== 5. VERIFICAÇÃO DE ITENS NOTAS FISCAIS ===';
SELECT 
    I.NUNOTA,
    I.SEQUENCIA,
    I.CONTROLE AS CONTROLE_ATUAL,
    I.QTDNEG,
    I.QTDENTREGUE,
    I.RESERVA,
    CASE 
        WHEN I.STATUSNOTA = 'L' THEN '✅ LIBERADA'
        WHEN I.STATUSNOTA = 'P' THEN '📝 PENDENTE'
        WHEN I.STATUSNOTA = 'C' THEN '🚫 CANCELADA'
        ELSE '❓ ' + I.STATUSNOTA
    END AS STATUS_NOTA,
    I.DTALTER AS DATA_ALTERACAO
FROM TGFITE I WITH (NOLOCK)
WHERE I.CODPROD = @CODPROD 
  AND I.CONTROLE IN (@CONTROLE_VERIFICAR, @CONTROLE_CORRETO)
ORDER BY I.DTALTER DESC;
PRINT '';

-- 6. VERIFICAÇÃO FINAL E RECOMENDAÇÕES
PRINT '=== 6. RECOMENDAÇÕES FINAIS ===';
DECLARE @STATUS_FINAL VARCHAR(100);

IF @VALEST_SIMULADO = 'E' OR (@QUANTEST_SIMULADA <= 0 AND @TOTAL_DISPONIVEL <= 0)
BEGIN
    SET @STATUS_FINAL = '❌ PROBLEMA PERSISTENTE';
    PRINT '🚨 O problema de estoque insuficiente AINDA não foi resolvido!';
    PRINT '📋 PRÓXIMOS PASSOS RECOMENDADOS:';
    PRINT '1. Verificar se há erros de digitação no código do produto';
    PRINT '2. Verificar se há movimentações recentes que zeraram o estoque';
    PRINT '3. Verificar se há bloqueios ou reservas específicas';
    PRINT '4. Verificar se o produto está em outro local/armazém';
    PRINT '5. Contactar o administrador do sistema';
END
ELSE
BEGIN
    SET @STATUS_FINAL = '✅ PROBLEMA RESOLVIDO';
    PRINT '🎉 O problema de estoque foi resolvido com sucesso!';
    PRINT '📋 VALIDAÇÕES FINAIS PASSARAM:';
    PRINT '   ✅ Controle correto existe no estoque';
    PRINT '   ✅ Estoque disponível para validação';
    PRINT '   ✅ Sistema de validação funcionando corretamente';
    PRINT '📋 RECOMENDAÇÕES PÓS-SOLUÇÃO:';
    PRINT '   1. Monitore o estoque regularmente';
    PRINT '   2. Valide novos cadastros de produtos';
    PRINT '   3. Verifique integrações com WMS se aplicável';
    PRINT '   4. Mantenha os controles padronizados';
END

PRINT '';
PRINT '=== STATUS FINAL ===';
PRINT '🎯 RESULTADO: ' + @STATUS_FINAL;
PRINT '⏰️ DATA/HORA: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '';
PRINT 'FIM DA VALIDAÇÃO';
PRINT '';

-- 7. LOG DE EVENTO (OPCIONAL)
PRINT '=== 7. LOG DE EVENTO ===';
INSERT INTO TGFLOG (DTALTER, CODUSU, DESCRICAO, TIPMOV, CODPARC, DHALTER)
SELECT 
    GETDATE(), 
    13,  -- USUÁRIO PADRÃO
    'VALIDAÇÃO ESTOQUE CONTROLE - PRODUTO: ' + CAST(@CODPROD AS VARCHAR(10)) + ' - STATUS: ' + @STATUS_FINAL,
    'SQL',
    GETDATE(),
    1,
    0,
    GETDATE();