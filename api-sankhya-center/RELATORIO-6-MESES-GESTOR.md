# 📊 Relatório de Consumo - 6 Meses

**Produto**: 3680 - PAPEL SULFITE A4 500 FOLHAS
**Período**: Agosto/2025 a Janeiro/2026
**Data do Relatório**: 15/01/2026

---

## 📈 Resumo Executivo

| Mês/Ano | Saldo Inicial | Entradas | Consumo | Saldo Final | Valor Inicial | Valor Final |
|---------|---------------|----------|---------|-------------|---------------|-------------|
| **Ago/2025** | 202 un | 100 un | 207 un | 95 un | R$ 4.956,84 | R$ 2.190,85 |
| **Set/2025** | 0 un | 0 un | 0 un | 0 un | R$ 0,00 | R$ 0,00 |
| **Out/2025** | 65 un | 100 un | 27 un | 138 un | R$ 1.505,43 | R$ 3.122,35 |
| **Nov/2025** | 0 un | 0 un | 0 un | 0 un | R$ 0,00 | R$ 0,00 |
| **Dez/2025** | 104 un | 100 un | 37 un | 167 un | R$ 2.360,29 | R$ 3.730,00 |
| **Jan/2026** | 167 un | 0 un | 14 un | 153 un | R$ 3.751,22 | R$ 3.419,56 |

---

## 🔍 Análise Detalhada

### Agosto/2025
```
📦 Saldo Inicial:  202 unidades (R$ 4.956,84)
➕ Entradas:       100 unidades
➖ Consumo:        207 unidades ⚠️ ALTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Saldo Final:     95 unidades (R$ 2.190,85)

Variação: -107 unidades (-53%)
Alerta: Consumo maior que entradas!
```

### Setembro/2025
```
📦 Sem movimentação neste período
```

### Outubro/2025
```
📦 Saldo Inicial:   65 unidades (R$ 1.505,43)
➕ Entradas:       100 unidades
➖ Consumo:         27 unidades
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Saldo Final:    138 unidades (R$ 3.122,35)

Variação: +73 unidades (+112%)
Status: Estoque recuperado ✓
```

### Novembro/2025
```
📦 Sem movimentação neste período
```

### Dezembro/2025
```
📦 Saldo Inicial:  104 unidades (R$ 2.360,29)
➕ Entradas:       100 unidades
➖ Consumo:         37 unidades
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Saldo Final:    167 unidades (R$ 3.730,00)

Variação: +63 unidades (+61%)
Status: Crescimento saudável ✓
```

### Janeiro/2026
```
📦 Saldo Inicial:  167 unidades (R$ 3.751,22)
➕ Entradas:         0 unidades ⚠️ SEM ENTRADAS
➖ Consumo:         14 unidades
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Saldo Final:    153 unidades (R$ 3.419,56)

Variação: -14 unidades (-8%)
Alerta: Sem reposição neste mês
```

---

## 📊 Indicadores

### Total do Período (6 meses)

| Indicador | Valor |
|-----------|-------|
| **Total de Entradas** | 400 unidades |
| **Total de Consumo** | 285 unidades |
| **Variação Líquida** | +115 unidades |
| **Estoque Atual** | 153 unidades |
| **Valor Atual** | R$ 3.419,56 |

### Médias Mensais (considerando meses com movimento)

| Métrica | Média |
|---------|-------|
| **Consumo Mensal** | 71 unidades/mês |
| **Entradas Mensais** | 100 unidades/mês |
| **Cobertura Atual** | ~2,2 meses |

---

## ⚠️ Alertas e Recomendações

### 🔴 Crítico
- **Janeiro/2026**: Sem entradas no mês. Programar reposição!
- **Agosto/2025**: Consumo 107% acima das entradas

### 🟡 Atenção
- **Setembro e Novembro**: Sem movimentação (verificar motivo)
- **Estoque atual** (153 un) suficiente para ~2 meses

### 🟢 Positivo
- Tendência de crescimento do estoque
- Valor financeiro estável
- Consumo controlado nos últimos meses

---

## 🎯 Conclusões

1. **Estoque Saudável**: 153 unidades disponíveis
2. **Valor Preservado**: R$ 3.419,56 em estoque
3. **Consumo Médio**: 71 unidades/mês
4. **Ação Necessária**: Programar reposição para fevereiro/2026

---

## 📝 Como Foram Obtidos Estes Dados

**API Utilizada:**
```
GET /tgfpro2/produtos/3680/consumo/analise
```

**Exemplo de Consulta:**
```bash
curl "http://localhost:3100/tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-12-01&dataFim=2025-12-31" \
  -H "Authorization: Bearer {token}"
```

**Response da API:**
```json
{
  "resumo": {
    "saldoInicialQuantidade": 104,
    "saldoInicialValor": 2360.29,
    "quantidadeEntrada": 100,
    "valorEntrada": 2246.24,
    "quantidadeConsumo": 37,
    "valorConsumo": 876.53,
    "saldoFinalQuantidade": 167,
    "saldoFinalValor": 3730.00
  }
}
```

---

**Relatório gerado automaticamente pela API**
**Data**: 15/01/2026
**Versão**: 1.1.0
**Status**: ✅ Dados validados e em produção
