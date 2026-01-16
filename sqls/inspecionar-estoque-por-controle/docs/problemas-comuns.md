# 📋 Problemas Comuns em Estoque por Controle

## 🎯 Lista de Problemas e Soluções

### 1. ❌ Controle Não Encontrado

**Sintomas**: Erro CORE_E04794 - Estoque insuficiente mesmo existindo estoque

**Causas**:
- Controle informado na nota fiscal não existe na tabela TGFEST
- Erro de digitação no código do controle
- Controle com caracteres especiais (aspas, espaços extras)
- Controle inativo (ATIVO = 'N')

**Diagnóstico**:
```sql
-- Verificar se o controle existe
SELECT COUNT(*) AS EXISTE 
FROM TGFEST 
WHERE CODPROD = [CODPROD] 
  AND CODEMP = 1 
  AND CODLOCAL = [CODLOCAL] 
  AND CODPARC = 0 
  AND CONTROLE = '[CONTROLE]';
```

**Soluções**:
- Corrigir o controle na nota fiscal
- Criar o controle faltante na TGFEST
- Verificar digitação de caracteres especiais
- Ativar registro inativo

---

### 2. 🔤 Caracteres Especiais no Controle

**Sintomas**: Sistema não encontra controle apesar de existir

**Caracteres Problemáticos**:
- Aspas duplas (`"`) no meio do texto
- Aspas simples no início ou fim (`'produto'`)
- Espaços em branco (`' produto'`)
- Caracteres invisíveis (tab, quebra de linha)
- Barras invertidas (`'` vs `"`)

**Exemplos Problemáticos**:
```sql
-- ❌ Incorreto
'9/16" X 10'

-- ✅ Correto
'9/16" X 10'
'9/16" X 10'
'9/16" X10'

-- ✅ Padrões aceitos
'9/16 X 10'
'12X5"'
'UNICO'
'SEM CONTROLE'
```

**Diagnóstico**:
```sql
-- Analisar caracteres do controle
SELECT 
    CONTROLE,
    LEN(CONTROLE) AS TAMANHO,
    CHARINDEX('"', CONTROLE) AS TEM_ASPAS_SIMPLES,
    CHARINDEX('"', CONTROLE) AS TEM_ASPAS_DUPLAS,
    CHARINDEX(' ', CONTROLE) AS TEM_ESPACOS,
    REPLACE(REPLACE(CONTROLE, '"', ''), ' ', '') AS SEM_ESPACOS_ASPAS,
    CASE 
        WHEN LEN(CONTROLE) = 0 THEN '🔴 VAZIO'
        WHEN CHARINDEX('"', CONTROLE) > 0 AND CHARINDEX('"', CONTROLE) = LEN(CONTROLE) - 1 THEN '🟡 DUPLA'
        WHEN CHARINDEX(' ', CONTROLE) > 0 THEN '🟡 COM ESPAÇO'
        ELSE '🟢 NORMAL'
    END AS TIPO_CONTROLE
FROM TGFEST 
WHERE CODPROD = [CODPROD];
```

**Soluções**:
- Usar REPLACE para remover aspas: `REPLACE(controle, '"', '')`
- Usar TRIM para remover espaços: `TRIM(controle)`
- Padronizar controles (sem espaços, sem caracteres especiais)

---

### 3. 💾 Estoque Dividido em Múltiplos Controles

**Sintomas**: Produto tem estoque total suficiente mas individualmente os controles não atendem

**Cenário Comum**:
- Controle A: 2 unidades
- Controle B: 1 unidade  
- Controle C: 3 unidades
- Nota solicita: 4 unidades do controle A

**Diagnóstico**:
```sql
-- Verificar distribuição por controle
SELECT 
    CONTROLE,
    ESTOQUE,
    RESERVADO,
    (ESTOQUE - RESERVADO) AS DISPONIVEL,
    CASE 
        WHEN (ESTOQUE - RESERVADO) >= 4 THEN '✅ SUFICIENTE'
        WHEN (ESTOQUE - RESERVADO) > 0 THEN '⚠️ LIMITADO'
        ELSE '❌ ZERADO'
    END AS STATUS
FROM TGFEST 
WHERE CODPROD = [CODPROD] 
  AND CODEMP = 1 
  AND CODLOCAL = [CODLOCAL] 
  AND CODPARC = 0
ORDER BY (ESTOQUE - RESERVADO) DESC;
```

**Soluções**:
- Usar controle com maior disponibilidade
- Solicitar transferência entre controles
- Configurar sistema para somar estoque de múltiplos controles

---

### 4. 🔄 Movimentação de Estoque Não Sincronizada

**Sintomas**: TGFEST mostra saldo mas TGFITE ou notas fiscais usam controle diferente

**Causas**:
- Nota fiscal criada com controle X
- Sistema WMS usa controle Y
- Usuário manual usa controle Z
- Sem sincronização entre os controles

**Diagnóstico**:
```sql
-- Verificar última movimentação
SELECT TOP 10
    H.DTALTER,
    H.CODLOCAL,
    H.CONTROLE,
    H.HISTORICO,
    H.ESTOQUE_ANT AS ANTES,
    H.ESTOQUE_ATU AS DEPOIS,
    H.QTDMOV,
    H.CODUSU
FROM TGFHES H WITH (NOLOCK)
WHERE H.CODPROD = [CODPROD] 
  AND H.CODLOCAL = [CODLOCAL]
ORDER BY H.DTALTER DESC;

-- Comparar com notas fiscais
SELECT TOP 5
    I.NUNOTA,
    I.CONTROLE AS CONTROLE_NOTA,
    I.QTDNEG,
    I.DTALTER
FROM TGFITE I WITH (NOLOCK)
WHERE I.CODPROD = [CODPROD]
ORDER BY I.DTALTER DESC;
```

**Soluções**:
- Padronizar uso de controles
- Implementar sincronização WMS
- Treinar usuários sobre uso correto de controles

---

### 5. 🚫 Reservas Excessivas ou "Fantas"

**Sintomas**: Estoque disponível mas reservas impedem movimentação

**Causas**:
- Notas fiscais antigas com reservas não liquidadas
- Erros de sistema criando reservas automáticas
- Reservas manuais esquecidas
- Bug no cálculo de reservas

**Diagnóstico**:
```sql
-- Verificar reservas ativas
SELECT 
    I.NUNOTA,
    I.QTDNEG,
    I.RESERVA,
    (I.QTDNEG - I.QTDENTREGUE) AS PENDENTE,
    I.DTALTER,
    CASE 
        WHEN I.STATUSNOTA = 'L' THEN '✅ LIBERADA'
        WHEN I.STATUSNOTA = 'P' THEN '📝 PENDENTE'
        ELSE '📋 ' + I.STATUSNOTA
    END AS STATUS
FROM TGFITE I WITH (NOLOCK)
WHERE I.CODPROD = [CODPROD] 
  AND I.RESERVA > 0
ORDER BY I.DTALTER DESC;

-- Verificar reservas totais por produto
SELECT 
    SUM(RESERVA) AS TOTAL_RESERVADO,
    COUNT(*) AS QTD_NOTAS_COM_RESERVA
FROM TGFITE I WITH (NOLOCK)
WHERE I.CODPROD = [CODPROD]
  AND I.RESERVA > 0;
```

**Soluções**:
- Liberar reservas antigas
- Cancelar reservas indevidas
- Revisar lógica de cálculo de reservas
- Implementar validação de reservas excessivas

---

### 6. 📉 Estoque Negativo ou Zerado

**Sintomas**: CORE_E04794 mesmo com estoque físico positivo

**Causas**:
- Erros de ajuste de estoque (saídas não registradas)
- Devoluções não processadas
- Transferências incorretas
- Bugs no sistema de movimentação

**Diagnóstico**:
```sql
-- Verificar saldos negativos
SELECT 
    CONTROLE,
    ESTOQUE,
    RESERVADO,
    (ESTOQUE - RESERVADO) AS DISPONIVEL,
    ESTOQUE - RESERVADO - ISNULL(WMSBLOQUEADO, 0) AS DISPONIVEL_REAL
FROM TGFEST 
WHERE CODPROD = [CODPROD] 
  AND (ESTOQUE < 0 OR (ESTOQUE - RESERVADO - ISNULL(WMSBLOQUEADO, 0)) < 0);

-- Verificar histórico de problemas
SELECT TOP 20
    H.DTALTER,
    H.HISTORICO,
    H.ESTOQUE_ANT,
    H.ESTOQUE_ATU,
    H.QTDMOV,
    H.CODUSU
FROM TGFHES H WITH (NOLOCK)
WHERE H.CODPROD = [CODPROD] 
  AND (H.ESTOQUE_ATU < H.ESTOQUE_ANT)
ORDER BY H.DTALTER DESC;
```

**Soluções**:
- Investigar causas do saldo negativo
- Corrigir movimentações erradas
- Implementar validações de estoque mínimo
- Revisar processos de ajuste

---

## 📊 Padrões de Solução

### Para Cada Problema:

1. **Controle Inexistente**: Verificar → Corrigir → Validar
2. **Caracteres Especiais**: Identificar → Normalizar → Validar
3. **Estoque Fragmentado**: Consolidar → Transferir → Validar
4. **Não Sincronizado**: Padronizar → Sincronizar → Treinar
5. **Reservas Excessivas**: Analisar → Liberar → Prevenir
6. **Estoque Negativo**: Investigar → Corrigir → Prevenir

---

## 🛠️ Scripts Rápidos de Emergência

### Diagnóstico Imediato
```sql
-- Verificação rápida para problema de estoque por controle
DECLARE @CODPROD INT = [CODPROD];

SELECT 
    COUNT(*) AS QTD_CONTROLES,
    SUM(ESTOQUE) AS ESTOQUE_TOTAL,
    SUM(RESERVADO) AS RESERVADO_TOTAL,
    SUM(ESTOQUE - RESERVADO) AS DISPONIVEL
FROM TGFEST 
WHERE CODPROD = @CODPROD 
  AND CODEMP = 1 
  AND CODPARC = 0;

-- Verificar controles com problemas
SELECT 
    CONTROLE,
    ESTOQUE,
    RESERVADO,
    (ESTOQUE - RESERVADO) AS DISPONIVEL,
    ATIVO,
    CASE 
        WHEN ESTOQUE < 0 THEN '❌ NEGATIVO'
        WHEN ESTOQUE = 0 THEN '⚠️ ZERADO'
        WHEN (ESTOQUE - RESERVADO) <= 0 THEN '❌ INDISPONÍVEL'
        ELSE '✅ OK'
    END AS STATUS
FROM TGFEST 
WHERE CODPROD = @CODPROD 
  AND CODEMP = 1 
  AND CODPARC = 0
ORDER BY (ESTOQUE - RESERVADO);
```

---

**Última atualização**: 2026-01-16  
**Versão**: 1.0  
**Autor**: Equipe de Manutenção Sankhya