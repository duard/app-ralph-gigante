# ⚙️ Parâmetros do Sistema Relacionados à Validação de Estoque

## 📋 Visão Geral

O Sankhya possui diversos parâmetros que afetam como a validação de estoque é realizada. Compreender esses parâmetros é essencial para diagnosticar e resolver problemas de CORE_E04794.

---

## 🔧 Parâmetros Principais

### 1. 📊 VALEST (TGFGRU)

Controla o tipo de validação de estoque para o grupo de produtos.

| Valor | Descrição | Impacto na Validação |
|------|-------------|---------------------|
| **N** | Não valida | ✅ Sempre passa |
| **A** | Valida e aceita | ⚠️ Verifica disponibilidade |
| **L** | Valida e libera reserva | ⚠️ Verifica disponibilidade e pede liberação |
| **E** | Valida como Estoque Empresa | 🏢 Verifica em todos os locais da empresa |
| **G** | Valida como Estoque Geral | 🌐 Verifica em todos os locais e empresas relacionadas |
| **S** | Valida como Estoque Soma | ➕️ Verifica soma de empresas relacionadas |

**SQL para consulta**:
```sql
SELECT CODGRUPOPROD, VALEST, PEDIRLIB, AGRUPALOCVALEST
FROM TGFGRU WHERE CODGRUPOPROD = [CODGRUPOPROD];
```

---

### 2. 🏭️ SOESTOQUE (TSIPAR)

Define se a validação deve considerar reservas de estoque.

| Valor | Descrição | Impacto |
|------|-------------|---------|
| **N** | Considera reservas | ⚠️ Estoque disponível = Estoque - Reservas |
| **S** | Ignora reservas | ✅ Estoque disponível = Estoque físico |

**SQL para consulta**:
```sql
SELECT LOGICO FROM TSIPAR WHERE CHAVE = 'SOESTOQUE';
```

---

### 3. 🔒 WMSDESCONESTBLQ (TSIPAR)

Controla se o sistema deve desconsiderar estoque bloqueado pelo WMS na faturação.

| Valor | Descrição | Impacto |
|------|-------------|---------|
| **N** | Não desconsidera bloqueio | ✅ Bloqueio WMS não afeta validação |
| **S** | Desconsidera bloqueio se habilitado | 🔒 Pode reduzir disponibilidade |

**SQL para consulta**:
```sql
SELECT LOGICO FROM TSIPAR WHERE CHAVE = 'WMSDESCONESTBLQ';
```

---

### 4. 🧪 SUBESTDOCAWMS (TSIPAR)

Controla se o sistema deve considerar estoque em decomposição pelo WMS.

| Valor | Descrição | Impacto |
|------|-------------|---------|
| **N** | Não considera decomposição | ✅ Usa apenas estoque físico |
| **S** | Considera decomposição | 📦 Pode reduzir disponibilidade significativamente |

**SQL para consulta**:
```sql
SELECT LOGICO FROM TSIPAR WHERE CHAVE = 'SUBESTDOCAWMS';
```

---

## 🎯 Como os Parâmetros Afetam a Procedure STP_VALIDA_ESTOQUE40

A procedure `STP_VALIDA_ESTOQUE40` usa os seguintes parâmetros para calcular o estoque disponível:

### Fórmula do Cálculo

```sql
ESTOQUE_DISPONÍVEL = SUM(
    ESTOQUE 
    - (CASE WHEN @P_SOESTOQUE = 'N' THEN RESERVADO ELSE 0 END)    -- Considera reservas
    - (CASE WHEN @P_WMSDESCONESTBLQ = 'S' AND @VALEST_BLOQWMS_FAT = 'S' THEN ISNULL(WMSBLOQUEADO, 0) ELSE 0 END)  -- Considera bloqueio WMS
    - (CASE WHEN @P_SUBESTDOCAWMS = 'S' THEN 0 ELSE 0 END)  -- Considera decomposição WMS
)
)
```

### Influência dos Parâmetros

| Parâmetro | Efeito na Fórmula | Quando Afeta |
|-----------|-------------------|-------------|
| **VALEST** | N (1) | A (2), E (3), G (4), S (5) |
| **SOESTOQUE** | N | Se N, não subtrai reservas |
| **WMSDESCONESTBLQ** | S | Se N e VALEST_BLOQWMS_FAT = S | 
| **SUBESTDOCAWMS** | S | Se S, subtrai valor de função WMS |

---

## 📊 Prioridade dos Parâmetros

Os parâmetros são avaliados na seguinte ordem (com base nos códigos da procedure):

1. **Verificação de estoque ativo** → `ATIVO = 'N'` (bloqueia validação)
2. **Aplicação de Fórmula Base** → Cálculo simples: `ESTOQUE - RESERVADO`
3. **Ajuste WMS** → Subtrai `WMSBLOQUEADO` se aplicável
4. **Ajuste Decomposição** → Chama função `F_WMS_GETESTOQUEDOCA`
5. **Agrupamento de Locais** → Filtra por `VALESTINDEP` do local

---

## 🔍 Como Investigar Parâmetros do Sistema

### Verificar Configuração Atual
```sql
-- Verificar todos os parâmetros relacionados
SELECT CHAVE, LOGICO, DESCRICAO
FROM TSIPAR 
WHERE CHAVE IN (
    'SOESTOQUE', 
    'WMSDESCONESTBLQ', 
    'SUBESTDOCAWMS',
    'ATUALESTSERV',
    'VALEST_BLOQWMS_FAT',
    'AGRUPALOCVALEST'
)
ORDER BY CHAVE;
```

### Verificar Configuração por Empresa
```sql
-- Verificar configuração por empresa
SELECT 
    E.CODEMP,
    E.TIPOEMPRESA,
    E.TIPORESERVA,
    E.VALEST_BLOQWMS_FAT,
    E.AGRUPALOCVALEST
FROM TSIULG E WITH (NOLOCK)
WHERE E.CODEMP IN (1, 2, 3, 4, 5);  -- Empresas ativas
```

### Verificar Configuração por Usuário
```sql
-- Verificar configuração por usuário da sessão atual
SELECT 
    E.CODUSU,
    E.TIPOEMPRESA,
    E.TIPORESERVA,
    E.VALEST_BLOQWMS_FAT,
    E.AGRUPALOCVALEST,
    U.NOMEUSU
FROM TSIULG E WITH (NOLOCK)
INNER JOIN TSIUSU U WITH (NOLOCK) ON E.CODUSU = U.CODUSU
WHERE E.CODUSU IN (
    SELECT CODUSU FROM TSIUSU WHERE USUARIO = SYSTEM_USER
);
```

---

## ⚙️ Impactos Comuns

### 1. Mudança de SOESTOQUE para "S"
- **Problema**: Usuários começam a ver estoque insuficiente
- **Causa**: Parâmetro mudou sem conhecimento prévio
- **Solução**: Reverter parâmetro e comunicar mudanças

### 2. Ativação de WMSDESCONESTBLQ
- **Problema**: Sistemas com WMS começam a dar erro de estoque
- **Causa**: Novo recurso habilitado sem preparo
- **Solução**: Desabilitar temporariamente ou implementar WMS corretamente

### 3. Ativação de SUBESTDOCAWMS
- **Problema**: Sistemas WMS reportam estoque negativo mesmo com estoque físico
- **Causa**: Sistema subtrai estoque em decomposição sem estar configurado
- **Solução**: Verificar configuração da função WMS e estoques em decomposição

---

## 🛠️ Solução de Problemas

### Diagnóstico
1. Execute o script `01-diagnostico-rapido.sql` para identificar o problema
2. Verifique os parâmetros atuais no sistema
3. Compare com o comportamento esperado
4. Identifique qual parâmetro está causando o comportamento inesperado

### Correção
1. **AJUSTE PARÂMETROS**: Altere os parâmetros conforme necessidade
2. **TREINAMENTO**: Explique as mudanças e os motivos
3. **TESTE**: Valide em ambiente de homologação antes de produção
4. **MONITORAMENTO**: Acompanhe os efeitos das mudanças

---

## 📚 Scripts Úteis

### Verificação Rápida de Parâmetros
```sql
-- Verificação completa de parâmetros de estoque
DECLARE @CODPROD INT = [CODPROD];

-- Verificar configuração do grupo
SELECT 
    G.VALEST,
    G.PEDIRLIB,
    G.AGRUPALOCVALEST,
    P.USOPROD
FROM TGFGRU G WITH (NOLOCK)
INNER JOIN TGFPRO P WITH (NOLOCK) ON G.CODGRUPOPROD = P.CODGRUPOPROD
WHERE P.CODPROD = @CODPROD;

-- Verificar configurações do sistema
SELECT 
    P_SOESTOQUE = ISNULL((SELECT LOGICO FROM TSIPAR WHERE CHAVE = 'SOESTOQUE'), 'N'),
    P_WMSDESCONESTBLQ = ISNULL((SELECT LOGICO FROM TSIPAR WHERE CHAVE = 'WMSDESCONESTBLQ'), 'N'),
    P_SUBESTDOCAWMS = ISNULL((SELECT LOGICO FROM TSIPAR WHERE CHAVE = 'SUBESTDOCAWMS'), 'N'),
    P_VALEST_BLOQWMS_FAT = ISNULL((SELECT VALEST_BLOQWMS_FAT FROM TSIULG WHERE SPID = @@SPID), 'N');

PRINT 'Parâmetros atuais:';
PRINT '  SOESTOQUE: ' + P_SOESTOQUE;
PRINT '  WMSDESCONESTBLQ: ' + P_WMSDESCONESTBLQ;
PRINT '  SUBESTDOCAWMS: ' + P_SUBESTDOCAWMS;
PRINT '  VALEST_BLOQWMS_FAT: ' + P_VALEST_BLOQWMS_FAT;
```

---

**Última atualização**: 2026-01-16  
**Versão**: 1.0  
**Autor**: Equipe Especialista em Estoque Sankhya