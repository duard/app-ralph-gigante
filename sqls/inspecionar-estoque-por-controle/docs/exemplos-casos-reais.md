# 📚 Exemplos de Casos Reais Resolvidos

## 🎯 Índice de Casos

1. [Caso 01: Produto 15664 - FEIXE DE MOLAS TRASEIRO](#caso-01-produto-15664-feixe-de-molas-traseiro.md)
2. [Caso 02: Produto 25847 - PNEU 245/65R15](#caso-02-produto-25847-pneu-245-65r15.md)
3. [Caso 03: Produto 33210 - LUBRIFICANTE 450ML](#caso-03-produto-33210-lubrificante-450ml.md)
4. [Caso 04: Produto 98765 - Kit Componentes](#caso-04-produto-98765-kit-componentes.md)
5. [Caso 05: Produto 33210 - Com Volume](#caso-05-produto-33210-com-volume.md)

---

## 🎯 Caso 01: Produto 15664 - FEIXE DE MOLAS TRASEIRO

### ❌ Problema Original
- **Produto**: 15664 - FEIXE DE MOLAS TRASEIRO
- **Erro**: CORE_E04794 - Estoque insuficiente
- **Nota**: 277893
- **Local**: 111003
- **Controle informado**: "9/16" X 10"

### 🔍 Diagnóstico

#### 1. Verificação do Produto
```sql
SELECT 
    CODPROD, DESCRPROD, CODGRUPOPROD, USOPROD, ATIVO
FROM TGFPRO WITH (NOLOCK)
WHERE CODPROD = 15664;
```

**Resultado**:
```
CODPROD    | DESCRPROD                | CODGRUPOPROD | USOPROD | ATIVO
15664       | FEIXE DE MOLAS TRASEIRO | 20102          | C        | S
```

#### 2. Verificação do Grupo
```sql
SELECT 
    VALEST, PEDIRLIB, AGRUPALOCVALEST
FROM TGFGRU WITH (NOLOCK)
WHERE CODGRUPOPROD = 20102;
```

**Resultado**:
```
VALEST | PEDIRLIB | AGRUPALOCVALEST
L      | N          | N
```

#### 3. Verificação de Estoque por Controle
```sql
SELECT 
    CONTROLE, ESTOQUE, RESERVADO, ATIVO,
    (ESTOQUE - RESERVADO) AS DISPONIVEL
FROM TGFEST WITH (NOLOCK)
WHERE CODPROD = 15664 
  AND CODEMP = 1 
  AND CODLOCAL = 111003 
  AND CODPARC = 0
ORDER BY CONTROLE;
```

**Resultado**:
```
CONTROLE    | ESTOQUE | RESERVADO | ATIVO | DISPONIVEL
12X5"     | 3        | 0        | S      | 3
```

### 🚨 Identificação do Problema

O controle "9/16" X 10" **não existe** na tabela `TGFEST`. Porém, existe o controle "12X5"" com 3 unidades disponíveis.

### ✅ Solução Aplicada

**Ação**: Alterar o item da nota fiscal para usar o controle existente

```sql
-- Comandos SQL para correção
UPDATE TGFITE 
SET CONTROLE = '12X5"'
WHERE NUNOTA = 277893 
  AND SEQUENCIA = 1
  AND CODPROD = 15664;
GO

-- Verificação
SELECT CONTROLE, QTDNEG, DTALTER
FROM TGFITE 
WHERE NUNOTA = 277893 
  AND SEQUENCIA = 1
  AND CODPROD = 15664;
```

**Resultado**:
```
CONTROLE | QTDNEG | DTALTER
12X5"    | 1     | 2025-03-19 14:27
```

### 📊 Validação Final
```sql
-- Simular a validação do Sankhya
DECLARE @QUANTEST FLOAT, @VALEST CHAR(1);

SELECT @QUANTEST = SUM(
    ESTOQUE - 
    (CASE WHEN 'N' = 'N' THEN RESERVADO ELSE 0 END)  -- SOESTOQUE = N não considera reserva
    - (CASE WHEN 'N' = 'N' THEN 0 ELSE 0 END)      -- WMS não habilitado
    - (CASE WHEN 'N' = 'N' THEN 0 ELSE 0 END)      -- SubestocaWMS não habilitado
)
FROM TGFEST WITH (NOLOCK)
WHERE CODPROD = 15664 
  AND CODEMP = 1 
  AND CODLOCAL = 111003 
  AND CODPARC = 0
  AND CONTROLE = '12X5';

SELECT @VALEST = CASE 
    WHEN @QUANTEST > 0 THEN 'A'  -- Validação passou
    ELSE 'E'  -- Erro estoque insuficiente
END;
```

**Resultado**:
```
QUANTEST | VALEST
3           | A
```

### 🎯 Resultado Final

- ✅ **Nota confirmada com sucesso**
- ✅ **Sem erros CORE_E04794**
- ✅ **Estoque validado corretamente**
- ✅ **Sistema funcionando normalmente**

---

## 📋 Lições Aprendidas

### 1. Padronização de Controles
- Evitar caracteres especiais (aspas, espaços no início/fim)
- Usar maiúsculas (padrão: `SEM CONTROLE`, `UNICO`, `BLOQUEADO`)
- Manter consistência na nomenclatura

### 2. Validação em Múltiplos Etapas
- **Verificar** → **Analisar** → **Corrigir** → **Validar**
- Sempre executar correções sem diagnóstico completo
- Fazer backup antes de alterações em produção

### 3. Comunicação com Usuários
- Explicar claramente qual o problema encontrado
- Documentar a solução aplicada
- Fornecer treinamento sobre o uso correto dos controles

### 4. Monitoramento
- Implementar alerts para controles problemáticos
- Criar dashboard de acompanhamento
- Revisar periodicamente os casos resolvidos

---

## 🔗 Scripts de Diagnóstico e Solução

Esta ferramenta contém scripts SQL para identificar e resolver problemas rapidamente:

1. **Diagnóstico Rápido** (`01-diagnostico-rapido.sql`)
2. **Análise Completa** (`02-inspecao-completa.sql`)
3. **Correção de Problemas** (`03-correcao-controle.sql`)
4. **Validação Final** (`04-validacao-final.sql`)

---

## 📞 Contato e Suporte

Para dúvidas sobre a ferramenta ou problemas ao usar:

1. Execute primeiro o diagnóstico rápido
2. Analise os resultados com cuidado
3. Siga as recomendações dos scripts
4. Documente os casos resolvidos para conhecimento futuro

---

**Versão**: 1.0  
**Atualizado**: 2026-01-16  
**Autor**: Equipe de Manutenção Sankhya  
**Email**: suporte.estoque@sankhya.com.br