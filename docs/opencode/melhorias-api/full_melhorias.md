# Análise e Plano de Melhorias da API - Módulo TGFPRO

**Data**: 17/01/2026  
**Versão**: 1.0  
**Analista**: opencode  

## 📋 Resumo Executivo

Esta análise identifica oportunidades críticas de melhoria na API do módulo TGFPRO (produtos), com foco em performance, correção de bugs e expansão de funcionalidades. O módulo atualmente possui **13.281 produtos ativos** e processa consultas complexas de estoque e consumo.

## 🔍 Problemas Identificados

### 1. ⚠️ BUG CRÍTICO: Análise de Preço Ignora Controles de Produto

**Impacto**: 2.407 produtos (18%) têm análise incorreta  
**Severidade**: 🔴 ALTA  

**Problema**:
- Produtos com `TIPCONTEST` ('S', 'E', 'L', 'P') são agrupados apenas por `CODPROD`
- Mistura variações diferentes (tamanhos, cores, lotes) como se fossem o mesmo produto
- Resultados absurdos: variações de preço de 5000%+ para o mesmo "produto"

**Exemplo Real**:
```json
// Produto 3867 - LUVA VAQUETA (com controle por tamanho)
{
  "precoMedioPonderado": 1352.41,  // ❌ Média inútil!
  "variacaoPrecoPercentual": "5024%"  // ❌ Absurdo!
}
```
**Correto seria**:
- Tamanho XG: R$ 81,25 (estável)
- Tamanho GG: R$ 4.165,74 (estável)

### 2. 🚀 PROBLEMA DE PERFORMANCE: Paginação Ineficiente

**Impacto**: Consultas lentas em listas grandes  
**Severidade**: 🟡 MÉDIA  

**Problema Atual**:
```typescript
// DUAS queries por página!
const query = `SELECT TOP ${perPage + offset} ...`
const countQuery = `SELECT COUNT(*) as total FROM TGFPRO ${where}`
```

**Solução**: Usar `OFFSET FETCH` (SQL Server 2012+) ou cursor-based pagination.

### 3. 🔒 VULNERABILIDADE: SQL Injection Risk

**Impacto**: Segurança comprometida  
**Severidade**: 🔴 ALTA  

**Problema**:
```typescript
whereClauses.push(`TGFPRO.DESCRPROD LIKE '%${dto.descrprod.replace(/'/g, "''")}%'`)
```
Filtros não usam prepared statements adequadamente.

### 4. 📊 LIMITAÇÃO: Acesso ao Departamento Bloqueado

**Impacto**: Gestores não conseguem analisar consumo por departamento  
**Severidade**: 🟡 MÉDIA  

**Problema**: Campo `CODDEP` bloqueado pelo Sankhya.

**Soluções Possíveis**:
- Usar grupo de usuário como proxy
- JOIN via `TSIUSU.CODFUNC` → `TFPFUN.CODDEP`

## 🎯 Plano de Melhorias Prioritárias

### Fase 1: Correções Críticas (Semanas 1-2)

#### 1.1 ✅ Implementar Análise de Preço com Controle
**Prioridade**: CRÍTICA  
**Esforço**: 2 dias  

```typescript
// Estratégia adaptativa
if (produto.tipcontest IN ['S', 'E', 'L', 'P']) {
  return analisePorControle()  // Agrupa por CODPROD + CONTROLE
} else {
  return analiseSimples()      // Agrupa apenas por CODPROD
}
```

**Benefícios**:
- Análise correta para 2.407 produtos
- Dados precisos para tomada de decisão
- Possibilita negociação por variação

#### 1.2 ✅ Corrigir SQL Injection
**Prioridade**: ALTA  
**Esforço**: 1 dia  

```typescript
// Antes (VULNERÁVEL)
`TGFPRO.DESCRPROD LIKE '%${value}%'`

// Depois (SEGURO)
const query = `TGFPRO.DESCRPROD LIKE ?`
const params = [`%${value}%`]
```

#### 1.3 ✅ Otimizar Paginação
**Prioridade**: MÉDIA  
**Esforço**: 1-2 dias  

```sql
-- SQL Server moderno
SELECT ... FROM TGFPRO
WHERE ...
ORDER BY CODPROD
OFFSET @offset ROWS
FETCH NEXT @perPage ROWS ONLY
```

### Fase 2: Melhorias de Performance (Semanas 3-4)

#### 2.1 🚀 Implementar Cache Inteligente
**Prioridade**: ALTA  
**Esforço**: 3 dias  

**Estratégia**:
- Cache produtos mestres (TTL: 1h)
- Cache estatísticas (TTL: 15min)
- Invalidação automática em mudanças

```typescript
@Injectable()
export class CacheService {
  @CacheTTL(3600) // 1 hora
  async getProdutoMestre(codprod: number) {
    // Implementação
  }
}
```

#### 2.2 🚀 Otimizar Queries de Estoque
**Prioridade**: MÉDIA  
**Esforço**: 2 dias  

**Problema**: Múltiplas queries N+1 para agregados de estoque.

**Solução**: Query única com CTEs:
```sql
WITH EstoqueLocais AS (
  SELECT CODPROD, CODLOCAL, SUM(ESTOQUE) as QTD
  FROM TGFEST
  WHERE CODPROD = @codprod
  GROUP BY CODPROD, CODLOCAL
)
SELECT * FROM EstoqueLocais
```

#### 2.3 🚀 Adicionar Índices Sugeridos
**Prioridade**: BAIXA  
**Esforço**: 1 dia  

Baseado na análise de queries:
```sql
CREATE INDEX IX_TGFPRO_ATIVO_DESCR ON TGFPRO(ATIVO, DESCRPROD)
CREATE INDEX IX_TGFPRO_GRUPO_ATIVO ON TGFPRO(CODGRUPOPROD, ATIVO)
CREATE INDEX IX_TGFITE_PROD_DATA ON TGFITE(CODPROD, DTNEG) INCLUDE(QTDNEG, VLRTOT)
```

### Fase 3: Expansão de Funcionalidades (Semanas 5-6)

#### 3.1 📊 Resolver Análise por Departamento
**Prioridade**: MÉDIA  
**Esforço**: 2-3 dias  

**Opção 1**: Mapear Grupos para Departamentos
```typescript
const MAPEAMENTO_DEPARTAMENTOS = {
  4: 'Financeiro',
  8: 'RH',
  20: 'TI',
  // ...
}
```

**Opção 2**: JOIN via Funcionários
```sql
SELECT DEP.DESCRDEP, SUM(CONSUMO) as TOTAL
FROM TGFITE ITE
JOIN TGFCAB CAB ON CAB.NUNOTA = ITE.NUNOTA
JOIN TSIUSU USU ON USU.CODPARC = CAB.CODPARC
LEFT JOIN TFPFUN FUN ON FUN.CODFUNC = USU.CODFUNC
LEFT JOIN TGFDEP DEP ON DEP.CODDEP = FUN.CODDEP
WHERE ITE.CODPROD = @codprod
GROUP BY DEP.CODDEP, DEP.DESCRDEP
```

#### 3.2 📈 Adicionar Métricas de Performance
**Prioridade**: BAIXA  
**Esforço**: 1 dia  

```typescript
@Injectable()
export class MetricsService {
  async trackQueryMetrics(queryName: string, duration: number) {
    // Log para monitoramento
  }
}
```

#### 3.3 🔍 Melhorar Busca Avançada
**Prioridade**: BAIXA  
**Esforço**: 2 dias  

**Adicionar**:
- Busca fuzzy (aproximação)
- Ranking por relevância melhorado
- Sugestões de correção

### Fase 4: Qualidade e Manutenibilidade (Semanas 7-8)

#### 4.1 🧪 Adicionar Testes Unitários
**Prioridade**: MÉDIA  
**Esforço**: 3-4 dias  

```typescript
describe('TgfproService', () => {
  describe('findAll', () => {
    it('should return paginated products', async () => {
      // Testes de paginação, filtros, etc.
    })
  })
})
```

#### 4.2 📚 Melhorar Documentação da API
**Prioridade**: BAIXA  
**Esforço**: 2 dias  

- Exemplos mais ricos no Swagger
- Documentação de casos especiais
- Guias de uso para desenvolvedores

#### 4.3 🔧 Refatorar para Padrões de Design
**Prioridade**: BAIXA  
**Esforço**: 3-4 dias  

- Extrair queries para Query Objects
- Implementar Repository Pattern
- Separar responsabilidades (SOLID)

## 📊 Métricas de Sucesso

### KPIs Técnicos
- **Performance**: Tempo de resposta < 500ms para 95% das queries
- **Correção**: 100% dos produtos com controle analisados corretamente
- **Segurança**: Zero vulnerabilidades de SQL injection
- **Disponibilidade**: 99.9% uptime

### KPIs de Negócio
- **Satisfação**: Redução de 80% em dúvidas sobre análise de preço
- **Eficiência**: Aumento de 50% na velocidade de consultas grandes
- **Precisão**: Dados 100% corretos para produtos com controle

## 🎯 Roadmap de Implementação

| Semana | Atividade | Status | Responsável |
|--------|-----------|--------|-------------|
| 1-2 | Correções Críticas | Planejado | Dev Team |
| 3-4 | Performance | Planejado | Dev Team |
| 5-6 | Novas Funcionalidades | Planejado | Dev Team |
| 7-8 | Qualidade | Planejado | Dev Team |
| 9-10 | Testes & Deploy | Planejado | QA Team |

## ⚠️ Riscos e Mitigação

### Risco 1: Quebra de Compatibilidade
**Mitigação**: Manter endpoints existentes, adicionar novos campos opcionais

### Risco 2: Impacto na Performance Durante Migração
**Mitigação**: Deploy gradual, feature flags, rollback plan

### Risco 3: Dependência do Sankhya
**Mitigação**: Validar queries em ambiente de testes, monitorar logs

## 💰 Estimativa de Esforço

- **Total**: 8 semanas (2 meses)
- **Equipe**: 2 desenvolvedores full-time
- **Custo**: ~32 dias/homem

## ✅ Critérios de Aceitação

- [ ] Análise de preço correta para todos os produtos
- [ ] Performance < 500ms em 95% das consultas
- [ ] Zero vulnerabilidades de segurança
- [ ] Cobertura de testes > 80%
- [ ] Documentação completa da API
- [ ] Validação com usuários finais

---

**Próximos Passos**:
1. ✅ Aprovação do plano pelo gestor
2. ✅ Alocação de recursos
3. ✅ Início da Fase 1 (correções críticas)
4. ✅ Comunicação com stakeholders sobre melhorias

**Contato**: Para dúvidas ou ajustes no plano, contatar a equipe de desenvolvimento.</content>
<parameter name="filePath">docs/opencode/melhorias-api/full_melhorias.md