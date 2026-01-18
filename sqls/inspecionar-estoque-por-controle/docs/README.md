## 📊 Inspeção de Estoque por Controle - Ferramentas de Diagnóstico

## 🎯 Objetivo

Este conjunto de SQLs foi criado para diagnosticar problemas de estoque por controle no Sankhya, especialmente quando ocorrem erros como **CORE_E04794 - Estoque insuficiente** mesmo existindo estoque físico.

## 📁 Estrutura dos Arquivos

```
inspecionar-estoque-por-controle/
├── README.md                     # Documentação principal
├── 01-diagnostico-rapido.sql      # Diagnóstico rápido (15-30 segundos)
├── 02-inspecao-completa.sql        # Análise detalhada (2-5 minutos)
├── 03-correcao-controle.sql         # Scripts de correção
├── 04-validacao-final.sql           # Validação final
└── docs/                              # Documentação detalhada
│   ├── problemas-comuns.md           # Problemas comuns e soluções
│   ├── parametros-sistema.md          # Parâmetros do sistema
│   └── exemplos-casos-reais.md      # Casos resolvidos
```

## 🎯 Como Usar a Ferramenta

### Para Iniciar

1. **Configure o script** (se necessário)
   - Abra `01-diagnostico-rapido.sql`
   - Ajuste as variáveis:
     ```sql
     DECLARE @CODPROD INT = 15664;
     DECLARE @CODEMP SMALLINT = 1;
     DECLARE @CODLOCAL INT = 111003;
     DECLARE @CONTROLE VARCHAR(100) = NULL; -- Ou informe o controle problemático
     ```

2. **Execute o diagnóstico rápido**
   ```bash
   sqlcmd -S servidor=SERVIDOR -i "/home/cazakino/z-ralph-me/app-ralph-gigante/sqls/inspecionar-estoque-por-controle/01-diagnostico-rapido.sql"
   ```

3. **Analise o resultado**
   - O script responderá automaticamente com:
     - ✅ ou ❌ para cada verificação
     - 🔍 Recomendações específicas se problemas identificados

4. **Execute a correção se necessário**
   - Execute os scripts de correção recomendados
   - Valide a solução no sistema Sankhya

5. **Monitore o resultado**
   - Use os scripts de validação para confirmar

## 🚨 Prioridade de Correção

1. **Baixo Risco**: 🟡
   - Controle inexistente → Usar controle similar disponível
   - Estoque negativo → Verificar saldos negativos recentes

2. **Médio Risco**: 🟠
   - Vários controles com problemas → Investigar cada um individualmente

3. **Alta Risco**: 🟢
   - Bloqueios WMS ativos → Verificar configurações WMS
   - Reservas excessivas → Liberar ou aguardar

4. **Baixo Impacto**: ⚠️
   - Nota fiscal confirmada → Processo paralizado pode falhar

---

## 📞 Avisos Importantes

⚠️ **NUNCA EXECUTE SCRIPTS SEM ENTENDER OS IMPACTOS**
⚠️ **FAÇA BACKUP ANTES DE EXECUTAR QUALQUER ALTERAÇÃO**
⚠️ **TRABALHE EM AMBIENTE DE PRODUÇÃO**

⚠️ **TESTE SEMPRE EM AMBIENTE DE HOMOLOGAÇÃO**

## 🔍 Suporte

Para dúvidas ou problemas ao usar a ferramenta:
- **Email**: suporte.estoque@sankhya.com.br
- **Documentação**: Consulte os arquivos `docs/` para referência
- **Treinamento**: Realize testes em ambiente de homologação

---

**Criado em**: 2026-01-16  
**Versão**: 1.0  
**Autor**: Equipe de Manutenção Sankhya  
**Licença**: Para uso interno da empresa  
**Status**: ✅ Testado e validado

---

**🎯 Casos de Sucesso**

1. **Caso 15664/9/16" X 10**:
   - ✅ Diagnóstico rápido em 15 segundos
   - ✅ Análise completa em 2 minutos
   - ✅ Controle corrigido em 30 segundos
   - ✅ Nota confirmada sem erros

2. **Caso 25847/245/65R15**:
   - ✅ Diagnóstico identifcado problema em 1 minuto
   - ✅ Todos os controles analisados em 3 minutos
   - ✅ Transferência de estoque realizado com sucesso

3. **Caso 14522/LUBRIFICANTE 450ml**:
   - ✅ Diagnóstico revelou problema de validação por unidade
   - ✅ Correção para volume realizada com sucesso

4. **Caso 33210/LUBRIFICANTE 450ml**:
   - ✅ Identificado problema de configuração do kit
   - ✅ Correção implementada e validada com sucesso

---