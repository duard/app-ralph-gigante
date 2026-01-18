-- ===================================================================
-- 03 - CORREÇÃO DE CONTROLE DE ESTOQUE
-- ===================================================================
-- Objetivo: Scripts para corrigir problemas encontrados na inspeção
-- IMPORTANTE: FAÇA BACKUP ANTES DE EXECUTAR QUALQUER ALTERAÇÃO
-- ===================================================================

-- Configuração (ajuste conforme necessário)
DECLARE @CODPROD INT = 15664;          -- Código do produto
DECLARE @CODEMP SMALLINT = 1;           -- Empresa
DECLARE @CODLOCAL INT = 111003;          -- Local do estoque
DECLARE @CONTROLE_ANTIGO VARCHAR(100) = '9/16" X 10'; -- Controle incorreto
DECLARE @CONTROLE_NOVO VARCHAR(100) = '12X5"';      -- Controle correto
DECLARE @NUNOTA_ALTERAR INT = NULL;         -- Número da nota para alterar
DECLARE @SEQUENCIA_ALTERAR INT = NULL;      -- Sequência do item para alterar

PRINT '=== CORREÇÃO DE CONTROLE DE ESTOQUE ===';
PRINT 'Produto: ' + CAST(@CODPROD AS VARCHAR(10));
PRINT 'Controle antigo: ' + @CONTROLE_ANTIGO;
PRINT 'Controle novo: ' + @CONTROLE_NOVO;
PRINT 'ATENÇÃO: Execute o script 02-inspecao-completa.sql primeiro para validar!';
PRINT '';
PRINT 'Ações disponíveis:';
PRINT '1. Atualizar controle em nota fiscal específica';
PRINT '2. Criar novo registro de estoque com controle correto';
PRINT '3. Transferir estoque entre controles';
PRINT '4. Inativar controle incorreto e ativar correto';
PRINT '';
PRINT '================================================================';
PRINT '';

-- Opção 1: ATUALIZAR CONTROLE EM NOTA FISCAL ESPECÍFICA
PRINT '=== OPÇÃO 1: ATUALIZAR CONTROLE EM NOTA FISCAL ===';
PRINT 'Use esta opção quando você sabe a nota e sequência exata';

-- Exemplo de comando para atualizar (ajuste os valores):
PRINT 'UPDATE TGFITE';
PRINT 'SET CONTROLE = ''' + @CONTROLE_NOVO + '''';
PRINT 'WHERE NUNOTA = [INFORME_O_NUNOTA] AND SEQUENCIA = [INFORME_A_SEQUENCIA];';
PRINT 'GO';
PRINT '';

-- Opção 2: CRIAR NOVO REGISTRO DE ESTOQUE
PRINT '=== OPÇÃO 2: CRIAR NOVO REGISTRO DE ESTOQUE ===';
PRINT 'Use esta opção para criar um novo registro com o controle correto';

-- Verificar se já existe o controle novo
DECLARE @EXISTE_CONTROLE_NOVO BIT = 0;
SELECT @EXISTE_CONTROLE_NOVO = COUNT(*)
FROM TGFEST WITH (NOLOCK)
WHERE CODPROD = @CODPROD 
  AND CODEMP = @CODEMP 
  AND CODLOCAL = @CODLOCAL 
  AND CODPARC = 0 
  AND CONTROLE = @CONTROLE_NOVO;

IF @EXISTE_CONTROLE_NOVO = 0
BEGIN
    PRINT '✅ Controle "' + @CONTROLE_NOVO + '" não existe. Pode ser criado novo registro.';
    PRINT '';
    PRINT 'Exemplo de INSERT:';
    PRINT 'INSERT INTO TGFEST (CODEMP, CODLOCAL, CODPROD, CONTROLE, ESTOQUE, RESERVADO, STATUSLOTE, ATIVO, DTALTER, CODUSU)';
    PRINT 'VALUES (' + CAST(@CODEMP AS VARCHAR) + ', ' + CAST(@CODLOCAL AS VARCHAR) + ', ' + CAST(@CODPROD AS VARCHAR) + ', ''' + @CONTROLE_NOVO + ''', 0, 0, ''N'', ''S'', GETDATE(), [CODUSU]);';
    PRINT 'GO';
END
ELSE
BEGIN
    PRINT '⚠️ Controle "' + @CONTROLE_NOVO + '" JÁ EXISTE com estoque:';
    SELECT ESTOQUE, RESERVADO, (ESTOQUE - RESERVADO) AS DISPONIVEL
    FROM TGFEST WITH (NOLOCK)
    WHERE CODPROD = @CODPROD 
      AND CODEMP = @CODEMP 
      AND CODLOCAL = @CODLOCAL 
      AND CODPARC = 0 
      AND CONTROLE = @CONTROLE_NOVO;
    PRINT '';
    PRINT 'Considere usar a opção 1 (atualizar nota) ou 3 (transferir estoque).';
END
PRINT '';

-- Opção 3: TRANSFERIR ESTOQUE ENTRE CONTROLES
PRINT '=== OPÇÃO 3: TRANSFERIR ESTOQUE ENTRE CONTROLES ===';
PRINT 'Use esta opção para mover estoque do controle antigo para o novo';

-- Verificar estoque disponível no controle antigo
DECLARE @QTD_CONTROLE_ANTIGO FLOAT = 0;
SELECT @QTD_CONTROLE_ANTIGO = ESTOQUE - RESERVADO - ISNULL(WMSBLOQUEADO, 0)
FROM TGFEST WITH (NOLOCK)
WHERE CODPROD = @CODPROD 
  AND CODEMP = @CODEMP 
  AND CODLOCAL = @CODLOCAL 
  AND CODPARC = 0 
  AND CONTROLE = @CONTROLE_ANTIGO;

IF @QTD_CONTROLE_ANTIGO > 0 AND @EXISTE_CONTROLE_NOVO = 0
BEGIN
    PRINT '✅ Transferência possível: ' + CAST(@QTD_CONTROLE_ANTIGO AS VARCHAR(10)) + ' unidades disponíveis no controle antigo';
    PRINT '';
    PRINT 'Exemplo de transferência:';
    PRINT 'BEGIN TRANSACTION;';
    PRINT 'UPDATE TGFEST SET ESTOQUE = ESTOQUE - ' + CAST(@QTD_CONTROLE_ANTIGO AS VARCHAR(10)) + ' WHERE CONTROLE = ''' + @CONTROLE_ANTIGO + ''';';
    PRINT 'UPDATE TGFEST SET ESTOQUE = ESTOQUE + ' + CAST(@QTD_CONTROLE_ANTIGO AS VARCHAR(10)) + ' WHERE CONTROLE = ''' + @CONTROLE_NOVO + ''' AND CODPROD = ' + CAST(@CODPROD AS VARCHAR(10)) + ';';
    PRINT 'COMMIT TRANSACTION;';
    PRINT 'GO';
END
ELSE IF @QTD_CONTROLE_ANTIGO = 0
BEGIN
    PRINT '❌ Controle antigo não tem estoque disponível para transferência.';
END
ELSE IF @EXISTE_CONTROLE_NOVO = 1
BEGIN
    PRINT '⚠️ Controle novo já existe. Use a opção 1 para atualizar nota.';
END
PRINT '';

-- Opção 4: INATIVAR CONTROLE INCORRETO E ATIVAR CORRETO
PRINT '=== OPÇÃO 4: INATIVAR CONTROLE INCORRETO E ATIVAR CORRETO ===';
PRINT 'Use esta opção quando o controle antigo tem problemas';

PRINT 'Comandos para correção:';
PRINT '-- Inativar controle incorreto:';
PRINT 'UPDATE TGFEST SET ATIVO = ''N'' WHERE CODPROD = ' + CAST(@CODPROD AS VARCHAR(10)) + ' AND CODEMP = ' + CAST(@CODEMP AS VARCHAR) + ' AND CODLOCAL = ' + CAST(@CODLOCAL AS VARCHAR) + ' AND CODPARC = 0 AND CONTROLE = ''' + @CONTROLE_ANTIGO + ''';';
PRINT 'GO';
PRINT '';
PRINT '-- Ativar controle correto (se necessário):';
PRINT 'UPDATE TGFEST SET ATIVO = ''S'' WHERE CODPROD = ' + CAST(@CODPROD AS VARCHAR(10)) + ' AND CODEMP = ' + CAST(@CODEMP AS VARCHAR) + ' AND CODLOCAL = ' + CAST(@CODLOCAL AS VARCHAR) + ' AND CODPARC = 0 AND CONTROLE = ''' + @CONTROLE_NOVO + ''';';
PRINT 'GO';
PRINT '';

-- Opção 5: VERIFICAÇÃO DE INTEGRIDADE
PRINT '=== OPÇÃO 5: VERIFICAÇÃO DE INTEGRIDADE ===';
PRINT 'Execute este bloco para validar se as correções funcionaram:';

PRINT 'Soma total de estoque por produto (todos controles):';
SELECT SUM(ESTOQUE - RESERVADO - ISNULL(WMSBLOQUEADO, 0)) AS TOTAL_DISPONIVEL
FROM TGFEST WITH (NOLOCK)
WHERE CODPROD = @CODPROD 
  AND CODEMP = @CODEMP 
  AND CODLOCAL = @CODLOCAL 
  AND CODPARC = 0
  AND ATIVO = 'S';
PRINT '';

PRINT 'Verificação de controle específico:';
SELECT 
    CONTROLE,
    ESTOQUE,
    RESERVADO,
    (ESTOQUE - RESERVADO - ISNULL(WMSBLOQUEADO, 0)) AS DISPONIVEL,
    ATIVO
FROM TGFEST WITH (NOLOCK)
WHERE CODPROD = @CODPROD 
  AND CODEMP = @CODEMP 
  AND CODLOCAL = @CODLOCAL 
  AND CODPARC = 0
  AND CONTROLE IN (@CONTROLE_ANTIGO, @CONTROLE_NOVO)
ORDER BY CONTROLE;
PRINT '';

PRINT '';
PRINT '=== FIM DAS OPÇÕES DE CORREÇÃO ===';
PRINT 'IMPORTANTE: Teste sempre em ambiente de homologação antes de produção!';
PRINT '';