# 📋 API de Consumo - Response Detalhado

## Endpoint

```
GET /tgfpro2/produtos/:codprod/consumo/analise
```

## Parâmetros Obrigatórios

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `codprod` | number | Código do produto (na URL) | 3680 |
| `dataInicio` | string | Data inicial (YYYY-MM-DD) | 2025-01-01 |
| `dataFim` | string | Data final (YYYY-MM-DD) | 2025-01-31 |

## Parâmetros Opcionais

| Parâmetro | Tipo | Valores | Descrição |
|-----------|------|---------|-----------|
| `groupBy` | string | `usuario`, `grupo`, `parceiro`, `mes`, `tipooper`, `none` | Tipo de agrupamento |
| `page` | number | 1, 2, 3... | Número da página (padrão: 1) |
| `perPage` | number | 10, 20, 50... | Itens por página (padrão: 20) |

## Response Completo

```json
{
  "produto": {
    "codprod": 3680,
    "descrprod": "PAPEL SULFITE A4 500 FOLHAS",
    "ativo": "S"
  },
  "periodo": {
    "inicio": "2025-01-01",
    "fim": "2025-01-31",
    "dias": 31
  },
  "resumo": {
    "totalMovimentacoes": 16,
    "totalLinhas": 16,
    "quantidadeConsumo": 24,
    "valorConsumo": 576.48,
    "quantidadeEntrada": 100,
    "valorEntrada": 2386.17,
    "mediaDiariaConsumo": 0.77,
    "mediaPorMovimentacao": 1.5,

    "saldoInicialQuantidade": 12,
    "saldoInicialValor": 290.10,
    "saldoFinalQuantidade": 88,
    "saldoFinalValor": 2099.79
  },
  "movimentacoes": {
    "data": [...],
    "page": 1,
    "perPage": 20,
    "total": 16,
    "lastPage": 1
  }
}
```

## Campos do Resumo (FOCO DO GESTOR)

### ✅ Novos Campos Implementados

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| **saldoInicialQuantidade** | number | Quantidade em estoque no INÍCIO do período | 12 |
| **saldoInicialValor** | number | Valor R$ do estoque no INÍCIO | 290.10 |
| **saldoFinalQuantidade** | number | Quantidade em estoque no FINAL do período | 88 |
| **saldoFinalValor** | number | Valor R$ do estoque no FINAL | 2099.79 |

### 📊 Campos Existentes (Mantidos)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| totalMovimentacoes | number | Total de notas fiscais |
| totalLinhas | number | Total de linhas de itens |
| quantidadeConsumo | number | Quantidade total consumida |
| valorConsumo | number | Valor R$ total consumido |
| quantidadeEntrada | number | Quantidade total de entradas |
| valorEntrada | number | Valor R$ total de entradas |
| mediaDiariaConsumo | number | Média de consumo por dia |
| mediaPorMovimentacao | number | Média de consumo por nota |

## Validação de Dados

### ✅ Fórmula de Conciliação

```
Saldo Final = Saldo Inicial + Entradas - Consumo
```

### Exemplo Real - Janeiro/2025

```
Saldo Inicial:  12 unidades
Entradas:      100 unidades
Consumo:        24 unidades
─────────────────────────────
Saldo Final:    88 unidades ✓ (12 + 100 - 24 = 88)
```

### Exemplo Real - Dezembro/2025

```
Saldo Inicial: 104 unidades
Entradas:      100 unidades
Consumo:        37 unidades
─────────────────────────────
Saldo Final:   167 unidades ✓ (104 + 100 - 37 = 167)
```

## Comparação: Antes vs Depois

### ❌ ANTES (Problema)

```json
{
  "resumo": {
    "quantidadeConsumo": 24,
    "valorConsumo": 576.48,
    "quantidadeEntrada": 100,
    "valorEntrada": 2386.17
    // SEM saldo inicial
    // SEM saldo final
  }
}
```

**Problema**: Impossível saber o estoque no início e fim do período!

### ✅ DEPOIS (Solução)

```json
{
  "resumo": {
    "saldoInicialQuantidade": 12,      // ✓ Estoque em 01/01/2025
    "saldoInicialValor": 290.10,       // ✓ Valor em R$
    "quantidadeEntrada": 100,
    "valorEntrada": 2386.17,
    "quantidadeConsumo": 24,
    "valorConsumo": 576.48,
    "saldoFinalQuantidade": 88,        // ✓ Estoque em 31/01/2025
    "saldoFinalValor": 2099.79         // ✓ Valor em R$
  }
}
```

**Solução**: Dados completos para conciliação e análise!

## Exemplo de Requisição

### Com cURL

```bash
# 1. Fazer login
curl -X POST "http://localhost:3100/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "CONVIDADO", "password": "guest123"}'

# Resposta:
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600
}

# 2. Consultar consumo
curl -X GET "http://localhost:3100/tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-01-01&dataFim=2025-01-31" \
  -H "Authorization: Bearer eyJhbGc..."
```

### Com JavaScript/Fetch

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:3100/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'CONVIDADO',
    password: 'guest123'
  })
});
const { access_token } = await loginResponse.json();

// 2. Consultar consumo
const consumoResponse = await fetch(
  'http://localhost:3100/tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-01-01&dataFim=2025-01-31',
  {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  }
);
const data = await consumoResponse.json();

console.log('Saldo Inicial:', data.resumo.saldoInicialQuantidade);
console.log('Saldo Final:', data.resumo.saldoFinalQuantidade);
```

## Casos de Uso

### 1. Consulta Mensal
```
GET /tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-01-01&dataFim=2025-01-31
```

### 2. Consulta Trimestral
```
GET /tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-01-01&dataFim=2025-03-31
```

### 3. Consulta Anual
```
GET /tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-01-01&dataFim=2025-12-31
```

### 4. Com Agrupamento por Usuário
```
GET /tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-01-01&dataFim=2025-01-31&groupBy=usuario
```

## Status Codes

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso - Dados retornados |
| 401 | Não autorizado - Token inválido ou expirado |
| 403 | Proibido - Sem permissão |
| 404 | Produto não encontrado |
| 500 | Erro interno do servidor |

## Observações Importantes

1. **Token Expira em 1 hora**: Fazer novo login se necessário
2. **Saldos são dinâmicos**: Mudam conforme o período selecionado
3. **Valorização**: Baseada no preço da última compra antes do período
4. **Performance**: Queries otimizadas com índices
5. **Dados em tempo real**: Sempre refletem o estado atual do banco

---

**Data**: 15/01/2026
**Versão**: 1.1.0
**Status**: ✅ EM PRODUÇÃO
