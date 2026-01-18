# 📊 Inspeção de Estoque por Controle - Ferramentas de Diagnóstico

## 🎯 Objetivo

Este conjunto de SQLs foi criado para diagnosticar problemas de estoque por controle no Sankhya, especialmente quando ocorrem erros como **CORE_E04794 - Estoque insuficiente** mesmo existindo estoque físico.

## 📋 Problemas Comuns Diagnosticados

1. **Controle não encontrado** - O controle informado na nota fiscal não existe na tabela TGFEST
2. **Controle com caracteres especiais** - Aspas, espaços extras, caracteres invisíveis
3. **Estoque em múltiplos controles** - Produto dividido entre diferentes controles
4. **Controle inativo** - Registro existe mas está com ATIVO = 'N'
5. **Estoque negativo ou zerado** - Saldo insuficiente no controle específico

## 🔧 Como Usar

### 1. Diagnóstico Rápido
```sql
-- Execute o arquivo 01-diagnostico-rapido.sql
-- Responde as perguntas básicas sobre o problema
```

### 2. Inspeção Detalhada
```sql
-- Execute o arquivo 02-inspecao-completa.sql
-- Análise completa do produto e todos os seus controles
```

### 3. Correção de Controle
```sql
-- Execute o arquivo 03-correcao-controle.sql
-- Scripts para corrigir problemas encontrados
```

### 4. Validação Pós-Correção
```sql
-- Execute o arquivo 04-validacao-final.sql
-- Confirma que o problema foi resolvido
```

## 📁 Estrutura dos Arquivos

```
inspecionar-estoque-por-controle/
├── README.md                     # Este arquivo
├── 01-diagnostico-rapido.sql      # Diagnóstico inicial rápido
├── 02-inspecao-completa.sql        # Análise detalhada
├── 03-correcao-controle.sql         # Scripts de correção
├── 04-validacao-final.sql           # Validação pós-correção
└── docs/                           # Documentação detalhada
    ├── problemas-comuns.md          # Lista de problemas e soluções
    ├── parametros-sistema.md        # Explicação dos parâmetros
    └── exemplos-casos-reais.md      # Casos reais resolvidos
```

## ⚠️ Importante

- **Sempre use WITH (NOLOCK)** para evitar locks durante a análise
- **Faça backup** antes de executar scripts de correção
- **Teste em ambiente de homologação** antes de produção
- **Documente** as alterações realizadas

## 🎯 Caso de Uso Real

O problema que motivou esta ferramenta:
- **Produto**: 15664 - FEIXE DE MOLAS TRASEIRO
- **Erro**: CORE_E04794 - Estoque insuficiente
- **Causa**: Controle "9/16" X 10" não existia, mas "12X5"" existia com 3 unidades
- **Solução**: Alterar o controle do item na nota para usar "12X5""

## 📞 Suporte

Para dúvidas ou problemas:
1. Execute o diagnóstico rápido primeiro
2. Verifique o log de resultados
3. Consulte a documentação detalhada
4. Analise os exemplos de casos reais

---

**Versão**: 1.0  
**Atualizado**: 2026-01-16  
**Autor**: Sankhya Estoque Inspector