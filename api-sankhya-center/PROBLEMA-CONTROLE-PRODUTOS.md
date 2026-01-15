# ⚠️ PROBLEMA CRÍTICO: Análise de Preço Ignora CONTROLE de Produtos

**Data**: 15/01/2026
**Severidade**: 🔴 **ALTA** - Resultados incorretos para 2.407 produtos

---

## 🎯 Problema Identificado

### Situação Atual

A análise de preço implementada agrupa apenas por `CODPROD`:

```sql
SELECT ... FROM TGFITE
WHERE CODPROD = 3867
GROUP BY CODPROD  -- ❌ ERRADO para produtos com controle!
```

### Impacto Real - Dados do Sistema

**Produto 3867 - LUVA VAQUETA PROTECAO ANTI IMPACTO**

| Data | Controle | Preço | Problema |
|------|----------|-------|----------|
| 2026-01-15 | `GG (10)` | R$ **4.165,74** | 😱 |
| 2026-01-15 | `XG (11)` | R$ 81,25 | ✓ |

**Análise Atual (ERRADA)**:
```json
{
  "precoMedioPonderado": 1352.41,  // ❌ Média inútil!
  "precoMinimo": 81.25,
  "precoMaximo": 4165.74,
  "variacaoPrecoPercentual": 5024%  // ❌ Absurdo!
}
```

**Problema**: Está comparando tamanhos DIFERENTES como se fossem o mesmo produto!

---

## 📊 Escala do Problema

### Distribuição no Sistema (Produtos Ativos)

| TIPCONTEST | Descrição | Quantidade | Status Análise |
|------------|-----------|------------|----------------|
| **N** | Sem controle | 10.874 | ✅ OK |
| **S** | Lista (tamanhos/cores) | 1.938 | ❌ ERRADO |
| **E** | Série (equipamentos) | 461 | ❌ ERRADO |
| **L** | Lote (medicamentos) | 7 | ❌ ERRADO |
| **P** | Parceiro | 1 | ❌ ERRADO |
| **TOTAL** | | 13.281 | |

**Impacto**: 18% dos produtos têm análise de preço **INCORRETA**!

---

## 🔍 Exemplos Reais de Produtos COM Controle

### 1. Tipo `S` - Lista (Variações de Tamanho/Cor)

**Produto 15626 - GARFO FORTE DESCARTAVEL**
- LISCONTEST: `BRANCA`, `CRISTAL`, `DOURADA`
- Cada cor pode ter preço diferente
- Análise atual: mistura todas as cores

**Produto 15625 - FACA FORTE DESCARTAVEL**
- LISCONTEST: `BRANCA`, `CRISTAL`, `DOURADA`

**Produto 15624 - COLHER FORTE DESCARTAVEL**
- LISCONTEST: `BRANCA`, `CRISTAL`, `DOURADA`

### 2. Tipo `E` - Série (Equipamentos Únicos)

**Produto 3867 - LUVA VAQUETA**
- Controles: `GG (10)`, `XG (11)`, `M (8)`, etc.
- Cada tamanho = produto diferente com preço diferente

### 3. Tipo `L` - Lote (Rastreabilidade)

**7 produtos** com controle por lote
- Ex: Medicamentos, alimentos
- Lotes diferentes podem ter custos diferentes (data de compra, fornecedor)

---

## 💡 Solução Proposta

### Estratégia: Análise Adaptativa

```typescript
if (produto.tipcontest IN ['S', 'E', 'L', 'P']) {
  // Produto COM controle → Agrupar por CODPROD + CONTROLE
  return analisePorControle()
} else {
  // Produto SIMPLES → Agrupar apenas por CODPROD
  return analiseSimples()  // Implementação atual
}
```

### Implementação

#### 1. Buscar TIPCONTEST do Produto

```typescript
private async getTipContest(codprod: number): Promise<string> {
  const query = `SELECT TIPCONTEST FROM TGFPRO WHERE CODPROD=${codprod}`
  const result = await this.sankhyaApiService.executeQuery(query, [])
  return result[0]?.TIPCONTEST || 'N'
}
```

#### 2. Análise Por Controle (Produtos Complexos)

```typescript
private async buscarAnalisePrecosComControle(
  codprod: number,
  dataInicio: string,
  dataFim: string,
): Promise<{
  analiseGeral: AnalisePrecoDto
  analisePorControle: AnalisePrecoControleDto[]
}> {
  // Query agrupando por CONTROLE
  const query = `
    SELECT
      ITE.CONTROLE,
      CAB.DTNEG,
      ITE.NUNOTA,
      ITE.VLRUNIT,
      ITE.QTDNEG,
      ITE.VLRTOT
    FROM TGFITE ITE WITH(NOLOCK)
    JOIN TGFCAB CAB WITH(NOLOCK) ON CAB.NUNOTA=ITE.NUNOTA
    WHERE ITE.CODPROD = ${codprod}
      AND CAB.DTNEG >= '${dataInicio}'
      AND CAB.DTNEG <= '${dataFim}'
      AND CAB.STATUSNOTA = 'L'
      AND CAB.TIPMOV = 'C'
      AND ITE.ATUALESTOQUE > 0
    ORDER BY ITE.CONTROLE, CAB.DTNEG ASC
  `

  const result = await this.sankhyaApiService.executeQuery(query, [])

  // Agrupar por CONTROLE
  const porControle = {}
  result.forEach(item => {
    const controle = item.CONTROLE || 'SEM CONTROLE'
    if (!porControle[controle]) {
      porControle[controle] = []
    }
    porControle[controle].push(item)
  })

  // Calcular análise para CADA controle
  const analisePorControle = Object.entries(porControle).map(([controle, compras]) => {
    return {
      controle,
      ...this.calcularEstatisticasPreco(compras)
    }
  })

  // Análise geral (todos os controles juntos)
  const analiseGeral = this.calcularEstatisticasPreco(result)

  return {
    analiseGeral,
    analisePorControle
  }
}
```

#### 3. Novo DTO para Resposta

```typescript
export class AnalisePrecoControleDto {
  @ApiProperty({ example: 'XG (11)', description: 'Valor do controle' })
  controle: string

  @ApiProperty({ example: 81.25 })
  precoMedioPonderado: number

  @ApiProperty({ example: 81.25 })
  precoUltimaCompra: number

  @ApiProperty({ example: 81.25 })
  precoMinimo: number

  @ApiProperty({ example: 81.25 })
  precoMaximo: number

  @ApiProperty({ example: 0 })
  variacaoPrecoPercentual: number

  @ApiProperty({ example: 'ESTAVEL' })
  tendenciaPreco: 'AUMENTO' | 'QUEDA' | 'ESTAVEL'

  @ApiProperty({ type: [HistoricoPrecoDto] })
  historicoPrecos: HistoricoPrecoDto[]

  @ApiProperty({ example: 150 })
  quantidadeTotalComprada: number

  @ApiProperty({ example: 3 })
  numeroCompras: number
}

// Estender ResumoConsumoDto
export class ResumoConsumoDto {
  // ... campos existentes ...

  @ApiProperty({
    example: 'S',
    description: 'Tipo de controle do produto (N/S/E/L/P)',
  })
  tipcontest?: string

  @ApiProperty({
    type: [AnalisePrecoControleDto],
    description: 'Análise de preço por controle (se produto tiver controle)',
  })
  analisePorControle?: AnalisePrecoControleDto[]
}
```

---

## 📊 Exemplo de Response Correta

### Request
```
GET /tgfpro2/produtos/3867/consumo/analise?dataInicio=2026-01-01&dataFim=2026-01-31
```

### Response (Produto COM Controle)
```json
{
  "produto": {
    "codprod": 3867,
    "descrprod": "LUVA VAQUETA PROTECAO ANTI IMPACTO",
    "ativo": "S"
  },
  "resumo": {
    "tipcontest": "E",  // ← Indica que tem controle

    // Análise GERAL (todos os controles juntos)
    "precoMedioPonderado": 1352.41,
    "precoMinimo": 81.25,
    "precoMaximo": 4165.74,

    // ⭐ NOVO: Análise POR CONTROLE
    "analisePorControle": [
      {
        "controle": "XG (11)",
        "precoMedioPonderado": 81.25,
        "precoUltimaCompra": 81.25,
        "precoMinimo": 81.25,
        "precoMaximo": 81.25,
        "variacaoPrecoPercentual": 0,
        "tendenciaPreco": "ESTAVEL",
        "quantidadeTotalComprada": 300,
        "numeroCompras": 3,
        "historicoPrecos": [
          {"data": "2026-01-15", "precoUnitario": 81.25, "quantidade": 100}
        ]
      },
      {
        "controle": "GG (10)",
        "precoMedioPonderado": 4165.74,
        "precoUltimaCompra": 4165.74,
        "precoMinimo": 4165.74,
        "precoMaximo": 4165.74,
        "variacaoPrecoPercentual": 0,
        "tendenciaPreco": "ESTAVEL",
        "quantidadeTotalComprada": 1,
        "numeroCompras": 1,
        "historicoPrecos": [
          {"data": "2026-01-15", "precoUnitario": 4165.74, "quantidade": 1}
        ]
      }
    ]
  }
}
```

---

## ✅ Benefícios da Solução

### Antes (Atual)
```
❌ Produto 3867:
   - Preço médio: R$ 1.352,41 (INÚTIL - mistura XG com GG!)
   - Variação: 5024% (ABSURDO)
   - Gestor não sabe quanto custa cada tamanho
```

### Depois (Proposto)
```
✅ Produto 3867:
   - Tamanho XG (11): R$ 81,25 (estável)
   - Tamanho GG (10): R$ 4.165,74 (estável)
   - Gestor vê preço CORRETO de cada variação
   - Pode planejar compras por tamanho
```

---

## 🎯 Casos de Uso

### 1. Talheres Descartáveis (Tipo S - Lista)

**Produto 15626 - GARFO FORTE**
- Branca: R$ 12,00 / pacote
- Cristal: R$ 15,00 / pacote
- Dourada: R$ 18,00 / pacote

**Gestor pode**:
- Ver qual cor tem melhor custo-benefício
- Planejar compras por cor
- Negociar preços específicos

### 2. EPIs com Tamanhos (Tipo E - Série)

**Produto 3867 - LUVA**
- P: R$ 65,00
- M: R$ 70,00
- G: R$ 75,00
- GG: R$ 80,00 (ou R$ 4.165,74 se for modelo especial)

**Gestor pode**:
- Orçar corretamente por tamanho
- Identificar se GG está com preço errado
- Planejar estoque por tamanho

### 3. Lotes de Medicamentos (Tipo L)

**Produto com controle por lote**
- LOTE2024-01: R$ 50,00 (comprado em Jan)
- LOTE2024-02: R$ 55,00 (comprado em Mar - preço subiu)
- LOTE2024-03: R$ 52,00 (comprado em Jun - negociação)

**Gestor pode**:
- Ver variação de preço ao longo do tempo
- Identificar lotes mais caros/baratos
- FIFO correto (primeiro que vence, primeiro que sai)

---

## 🔧 Checklist de Implementação

- [ ] Criar `AnalisePrecoControleDto`
- [ ] Adicionar `tipcontest` e `analisePorControle[]` ao `ResumoConsumoDto`
- [ ] Implementar `getTipContest(codprod)`
- [ ] Implementar `buscarAnalisePrecosComControle()`
- [ ] Modificar `getResumoConsumo()` para detectar controle
- [ ] Testar com produto 3867 (tem controle)
- [ ] Testar com produto 3680 (sem controle - deve funcionar igual)
- [ ] Validar com produtos tipo S, E, L
- [ ] Documentar no Swagger
- [ ] Criar testes unitários

---

## ⚠️ Prioridade

**CRÍTICO**: 2.407 produtos (18%) têm análise incorreta
**Impacto**: Gestores tomando decisões com dados ERRADOS
**Urgência**: ALTA - implementar antes de usar análise em produção

---

**Status**: ⚠️ IDENTIFICADO - Aguardando Implementação
**Próximo Passo**: Implementar análise adaptativa (com/sem controle)
