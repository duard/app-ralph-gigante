# 📊 PROPOSTA: Análise de Preço ao Longo do Tempo

**Data**: 15/01/2026
**Objetivo**: Tornar os dados "ricos" com análise de variação de preço no período

---

## 🎯 Problema Identificado

### Situação Atual

A API retorna apenas:
- **Preço de Referência**: Última compra ANTES do período
- **Valor Total de Consumo**: Soma dos valores no período
- **Saldo Inicial/Final**: Valorados com preço de referência fixo

### Limitação

**O gestor NÃO vê**:
- ❌ Se o produto ficou mais caro/barato durante o período
- ❌ Preço médio das compras no período
- ❌ Última compra DENTRO do período
- ❌ Variação percentual de preço
- ❌ Histórico de preços para gráficos

### Exemplo Real

**Período**: Janeiro a Dezembro/2025 (anual)

```
Compra Agosto:  R$ 20,00/un  ← Preço usado atualmente
Compra Outubro: R$ 22,50/un  ← IGNORADO
Compra Dezembro: R$ 25,00/un ← IGNORADO
```

**Problema**: Gestor não sabe que o produto subiu 25% no ano!

---

## 💡 Solução Proposta

### 1. Novos Campos no DTO `ResumoConsumoDto`

```typescript
export class ResumoConsumoDto {
  // ... campos existentes ...

  // ========== NOVOS CAMPOS: ANÁLISE DE PREÇO ==========

  @ApiProperty({
    example: 23.50,
    description: 'Preço médio ponderado das compras no período',
  })
  precoMedioPonderado?: number

  @ApiProperty({
    example: 25.00,
    description: 'Preço da última compra DENTRO do período',
  })
  precoUltimaCompra?: number

  @ApiProperty({
    example: 20.00,
    description: 'Menor preço de compra no período',
  })
  precoMinimo?: number

  @ApiProperty({
    example: 25.00,
    description: 'Maior preço de compra no período',
  })
  precoMaximo?: number

  @ApiProperty({
    example: 25.0,
    description: 'Variação percentual do preço (%) no período',
  })
  variacaoPrecoPercentual?: number

  @ApiProperty({
    example: 'AUMENTO',
    description: 'Tendência de preço: AUMENTO, QUEDA, ESTAVEL',
  })
  tendenciaPreco?: 'AUMENTO' | 'QUEDA' | 'ESTAVEL'

  @ApiProperty({
    type: [HistoricoPrecoDto],
    description: 'Histórico de preços de compra no período',
  })
  historicoPrecos?: HistoricoPrecoDto[]
}
```

### 2. Novo DTO `HistoricoPrecoDto`

```typescript
export class HistoricoPrecoDto {
  @ApiProperty({ example: '2025-12-15' })
  data: string

  @ApiProperty({ example: 123456 })
  nunota: number

  @ApiProperty({ example: 25.00 })
  precoUnitario: number

  @ApiProperty({ example: 100 })
  quantidadeComprada: number

  @ApiProperty({ example: 2500.00 })
  valorTotal: number
}
```

### 3. Nova Query SQL

```sql
-- Análise de Preços de Compra no Período
SELECT
  CAB.DTNEG AS DATA_COMPRA,
  ITE.NUNOTA,
  ITE.VLRUNIT AS PRECO_UNITARIO,
  ITE.QTDNEG AS QUANTIDADE,
  ITE.VLRTOT AS VALOR_TOTAL,
  -- Cálculos agregados
  MIN(ITE.VLRUNIT) AS PRECO_MIN,
  MAX(ITE.VLRUNIT) AS PRECO_MAX,
  AVG(ITE.VLRUNIT) AS PRECO_MEDIO_SIMPLES,
  SUM(ITE.VLRTOT) / SUM(ITE.QTDNEG) AS PRECO_MEDIO_PONDERADO
FROM TGFITE ITE WITH(NOLOCK)
JOIN TGFCAB CAB WITH(NOLOCK) ON CAB.NUNOTA = ITE.NUNOTA
WHERE ITE.CODPROD = {codprod}
  AND CAB.DTNEG >= '{dataInicio}'
  AND CAB.DTNEG <= '{dataFim}'
  AND CAB.STATUSNOTA = 'L'
  AND CAB.TIPMOV = 'C'              -- Apenas COMPRAS
  AND ITE.ATUALESTOQUE > 0          -- Apenas ENTRADAS
ORDER BY CAB.DTNEG ASC
```

### 4. Implementação no Service

```typescript
/**
 * Busca análise de preços do produto no período
 */
private async buscarAnalisePrecos(
  codprod: number,
  dataInicio: string,
  dataFim: string,
): Promise<{
  precoMedioPonderado: number
  precoUltimaCompra: number
  precoMinimo: number
  precoMaximo: number
  variacaoPercentual: number
  tendencia: 'AUMENTO' | 'QUEDA' | 'ESTAVEL'
  historicoPrecos: HistoricoPrecoDto[]
}> {
  // Query para histórico completo
  const query = `
    SELECT
      CAB.DTNEG,
      ITE.NUNOTA,
      ITE.VLRUNIT,
      ITE.QTDNEG,
      ITE.VLRTOT
    FROM TGFITE ITE WITH(NOLOCK)
    JOIN TGFCAB CAB WITH(NOLOCK) ON CAB.NUNOTA = ITE.NUNOTA
    WHERE ITE.CODPROD = ${codprod}
      AND CAB.DTNEG >= '${dataInicio}'
      AND CAB.DTNEG <= '${dataFim}'
      AND CAB.STATUSNOTA = 'L'
      AND CAB.TIPMOV = 'C'
      AND ITE.ATUALESTOQUE > 0
    ORDER BY CAB.DTNEG ASC
  `

  const result = await this.sankhyaApiService.executeQuery(query, [])

  if (!result || result.length === 0) {
    // Sem compras no período - usar preço de referência anterior
    return {
      precoMedioPonderado: 0,
      precoUltimaCompra: 0,
      precoMinimo: 0,
      precoMaximo: 0,
      variacaoPercentual: 0,
      tendencia: 'ESTAVEL',
      historicoPrecos: [],
    }
  }

  // Mapear histórico
  const historicoPrecos = result.map(item => ({
    data: item.DTNEG,
    nunota: Number(item.NUNOTA),
    precoUnitario: Number(item.VLRUNIT),
    quantidadeComprada: Number(item.QTDNEG),
    valorTotal: Number(item.VLRTOT),
  }))

  // Calcular agregados
  const precos = historicoPrecos.map(h => h.precoUnitario)
  const precoMinimo = Math.min(...precos)
  const precoMaximo = Math.max(...precos)
  const precoUltimaCompra = historicoPrecos[historicoPrecos.length - 1].precoUnitario
  const primeiroPreco = historicoPrecos[0].precoUnitario

  // Preço médio ponderado por quantidade
  const totalValor = historicoPrecos.reduce((sum, h) => sum + h.valorTotal, 0)
  const totalQuantidade = historicoPrecos.reduce((sum, h) => sum + h.quantidadeComprada, 0)
  const precoMedioPonderado = totalQuantidade > 0 ? totalValor / totalQuantidade : 0

  // Variação percentual (primeiro vs último)
  const variacaoPercentual = primeiroPreco > 0
    ? ((precoUltimaCompra - primeiroPreco) / primeiroPreco) * 100
    : 0

  // Tendência
  let tendencia: 'AUMENTO' | 'QUEDA' | 'ESTAVEL'
  if (Math.abs(variacaoPercentual) < 2) {
    tendencia = 'ESTAVEL'  // Variação < 2%
  } else if (variacaoPercentual > 0) {
    tendencia = 'AUMENTO'
  } else {
    tendencia = 'QUEDA'
  }

  return {
    precoMedioPonderado,
    precoUltimaCompra,
    precoMinimo,
    precoMaximo,
    variacaoPercentual,
    tendencia,
    historicoPrecos,
  }
}
```

### 5. Integração no `getResumoConsumo()`

```typescript
private async getResumoConsumo(
  codprod: number,
  dataInicio: string,
  dataFim: string,
  dias: number,
): Promise<ResumoConsumoDto> {
  // ... código existente ...

  // NOVO: Buscar análise de preços
  const analisePrecos = await this.buscarAnalisePrecos(codprod, dataInicio, dataFim)

  return {
    // ... campos existentes ...

    // Adicionar novos campos
    precoMedioPonderado: analisePrecos.precoMedioPonderado,
    precoUltimaCompra: analisePrecos.precoUltimaCompra,
    precoMinimo: analisePrecos.precoMinimo,
    precoMaximo: analisePrecos.precoMaximo,
    variacaoPrecoPercentual: analisePrecos.variacaoPercentual,
    tendenciaPreco: analisePrecos.tendencia,
    historicoPrecos: analisePrecos.historicoPrecos,
  }
}
```

---

## 📊 Exemplo de Response "Rico"

### Request
```
GET /tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-08-01&dataFim=2026-01-31
```

### Response
```json
{
  "produto": {
    "codprod": 3680,
    "descrprod": "PAPEL SULFITE A4 500 FOLHAS",
    "ativo": "S"
  },
  "periodo": {
    "inicio": "2025-08-01",
    "fim": "2026-01-31",
    "dias": 184
  },
  "resumo": {
    "totalMovimentacoes": 22,
    "quantidadeConsumo": 285,
    "valorConsumo": 6750.75,

    "saldoInicialQuantidade": 202,
    "saldoFinalQuantidade": 153,

    // ========== DADOS RICOS DE PREÇO ==========

    "precoMedioPonderado": 22.35,
    "precoUltimaCompra": 25.00,
    "precoMinimo": 20.00,
    "precoMaximo": 25.00,
    "variacaoPrecoPercentual": 25.0,
    "tendenciaPreco": "AUMENTO",

    "historicoPrecos": [
      {
        "data": "2025-08-15",
        "nunota": 123456,
        "precoUnitario": 20.00,
        "quantidadeComprada": 100,
        "valorTotal": 2000.00
      },
      {
        "data": "2025-10-20",
        "nunota": 234567,
        "precoUnitario": 22.50,
        "precoUnitario": 100,
        "valorTotal": 2250.00
      },
      {
        "data": "2025-12-10",
        "nunota": 345678,
        "precoUnitario": 25.00,
        "quantidadeComprada": 100,
        "valorTotal": 2500.00
      }
    ]
  }
}
```

---

## 📈 Benefícios para o Gestor

### 1. Visão de Custos Real

✅ **Antes**: "Gastei R$ 6.750,75 com papel"
✅ **Agora**: "Gastei R$ 6.750,75 com papel, mas o preço subiu 25% no período!"

### 2. Alertas Automáticos

```
⚠️ ALERTA: Preço do produto aumentou 25% no período
   - Primeiro preço: R$ 20,00
   - Último preço: R$ 25,00
   - Recomendação: Negociar com fornecedor ou buscar alternativas
```

### 3. Planejamento Orçamentário

```
Projeção para próximo período (assumindo última compra):
- Consumo médio: 47,5 un/mês
- Preço atual: R$ 25,00
- Custo estimado/mês: R$ 1.187,50
```

### 4. Gráficos no Frontend

**Gráfico de Linha**: Evolução do Preço
```
R$ 25 ┤                    ●
R$ 24 ┤                  ╱
R$ 23 ┤              ●
R$ 22 ┤            ╱
R$ 21 ┤          ╱
R$ 20 ┤    ●
      └─────────────────────
       Ago  Out  Dez
```

---

## 🔄 Comparação: Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Preço** | Fixo (ref. anterior) | Múltiplos pontos no tempo |
| **Variação** | Não visível | Percentual + Tendência |
| **Planejamento** | Difícil | Baseado em dados reais |
| **Alertas** | Nenhum | Automático (>10% variação) |
| **Gráficos** | Impossível | Histórico completo |
| **Decisões** | Subjetivas | Data-driven |

---

## ⚡ Otimização de Performance

### Query Otimizada (<450 chars)

```sql
-- Versão compacta para análise de preços
SELECT CAB.DTNEG AS D,ITE.NUNOTA AS N,ITE.VLRUNIT AS P,ITE.QTDNEG AS Q,ITE.VLRTOT AS V FROM TGFITE ITE WITH(NOLOCK)JOIN TGFCAB CAB WITH(NOLOCK)ON CAB.NUNOTA=ITE.NUNOTA WHERE ITE.CODPROD={codprod} AND CAB.DTNEG>='{dataInicio}'AND CAB.DTNEG<='{dataFim}'AND CAB.STATUSNOTA='L'AND CAB.TIPMOV='C'AND ITE.ATUALESTOQUE>0 ORDER BY CAB.DTNEG
```

### Caching Opcional

```typescript
// Cache de 5 minutos para análise de preços
@Cacheable({ ttl: 300 })
private async buscarAnalisePrecos(...) { ... }
```

---

## ✅ Checklist de Implementação

- [ ] Criar `HistoricoPrecoDto`
- [ ] Atualizar `ResumoConsumoDto` com novos campos
- [ ] Implementar `buscarAnalisePrecos()` no service
- [ ] Integrar no `getResumoConsumo()`
- [ ] Testar com produto 3680 (6 meses de dados)
- [ ] Validar cálculos:
  - [ ] Preço médio ponderado
  - [ ] Variação percentual
  - [ ] Tendência (AUMENTO/QUEDA/ESTAVEL)
- [ ] Documentar no Swagger
- [ ] Adicionar testes unitários

---

## 🎯 Critério de Sucesso

**Gestor deve poder responder**:

1. ✅ "Quanto o produto variou de preço este ano?"
2. ✅ "Qual foi o preço da última compra?"
3. ✅ "Estou pagando mais ou menos que a média?"
4. ✅ "Em quais meses o preço estava mais baixo?"
5. ✅ "Qual a tendência: subindo ou caindo?"

**Dados RICOS = Decisões INTELIGENTES** 🚀

---

**Status**: Proposta Pronta para Aprovação
**Próximo Passo**: Aguardando confirmação do gestor para implementar
