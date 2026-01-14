# Como Usar a API de Análise de Consumo

## Guia Completo de Uso

Este documento fornece instruções passo a passo para usar a API de análise de consumo de produtos.

---

## 1. Autenticação

### Obter Token de Acesso

Antes de fazer qualquer requisição, você precisa obter um token de autenticação.

**Endpoint:** `POST /auth/login`

**Payload:**
```json
{
  "username": "CONVIDADO",
  "password": "guest123"
}
```

**Exemplo com curl:**
```bash
TOKEN=$(curl -s -X POST http://localhost:3100/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"CONVIDADO","password":"guest123"}' \
  | python3 -c 'import sys, json; data=json.load(sys.stdin); print(data.get("access_token", ""))' 2>/dev/null)

echo "Token obtido: $TOKEN"
```

**Exemplo com JavaScript/TypeScript:**
```typescript
const response = await fetch('http://localhost:3100/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'CONVIDADO',
    password: 'guest123',
  }),
});

const data = await response.json();
const token = data.access_token;
```

---

## 2. Endpoint de Análise de Consumo

### URL Base
```
GET /tgfpro2/produtos/:codprod/consumo/analise
```

### Parâmetros Obrigatórios

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `codprod` | number (path) | Código do produto | 3680 |
| `dataInicio` | string (query) | Data inicial (YYYY-MM-DD) | 2025-12-01 |
| `dataFim` | string (query) | Data final (YYYY-MM-DD) | 2025-12-31 |

### Parâmetros Opcionais

| Parâmetro | Tipo | Valores | Padrão | Descrição |
|-----------|------|---------|--------|-----------|
| `groupBy` | string | usuario, grupo, parceiro, mes, tipooper, none | none | Tipo de agrupamento |
| `page` | number | >= 1 | 1 | Número da página |
| `perPage` | number | 1-100 | 20 | Itens por página |

---

## 3. Exemplos de Uso

### Exemplo 1: Consumo Simples (Sem Agrupamento)

**Objetivo:** Ver todas as movimentações de consumo do produto 3680 em dezembro/2025

```bash
curl -X GET "http://localhost:3100/tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-12-01&dataFim=2025-12-31&groupBy=none" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool
```

**Resposta:**
```json
{
  "produto": {
    "codprod": 3680,
    "descrprod": "PAPEL SULFITE A4 500 FOLHAS",
    "ativo": "S"
  },
  "periodo": {
    "inicio": "2025-12-01",
    "fim": "2025-12-31",
    "dias": 31
  },
  "resumo": {
    "totalMovimentacoes": 22,
    "totalLinhas": 22,
    "quantidadeConsumo": 37,
    "valorConsumo": 876.53,
    "quantidadeEntrada": 100,
    "valorEntrada": 2246.24,
    "mediaDiariaConsumo": 1.19,
    "mediaPorMovimentacao": 1.68
  },
  "movimentacoes": {
    "data": [ ... ],
    "page": 1,
    "perPage": 20,
    "total": 22,
    "lastPage": 2
  }
}
```

---

### Exemplo 2: Consumo por Usuário (Quem Consumiu)

**Objetivo:** Ver quem realmente consumiu o produto

```bash
curl -X GET "http://localhost:3100/tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-12-01&dataFim=2025-12-31&groupBy=usuario" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool
```

**Resposta:**
```json
{
  "produto": { ... },
  "periodo": { ... },
  "resumo": { ... },
  "agrupamento": {
    "tipo": "usuario",
    "total": 8,
    "dados": [
      {
        "codigo": 346,
        "nome": "MICHELLE.DUARTE",
        "codigoGrupo": 4,
        "movimentacoes": 2,
        "quantidadeConsumo": 10,
        "valorConsumo": 236.9,
        "percentual": 27.03
      },
      {
        "codigo": 308,
        "nome": "DANUBIA.O",
        "codigoGrupo": 20,
        "movimentacoes": 3,
        "quantidadeConsumo": 6,
        "valorConsumo": 142.14,
        "percentual": 16.22
      }
    ]
  },
  "movimentacoes": { ... }
}
```

---

### Exemplo 3: Consumo por Grupo de Usuário

**Objetivo:** Ver qual departamento mais consome

```bash
curl -X GET "http://localhost:3100/tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-12-01&dataFim=2025-12-31&groupBy=grupo" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool
```

**Resposta:**
```json
{
  "agrupamento": {
    "tipo": "grupo",
    "total": 7,
    "dados": [
      {
        "codigoGrupo": 4,
        "nomeGrupo": "Grupo 4",
        "movimentacoes": 4,
        "quantidadeConsumo": 14,
        "valorConsumo": 331.66,
        "percentual": 37.84
      },
      {
        "codigoGrupo": 8,
        "nomeGrupo": "Grupo 8",
        "movimentacoes": 7,
        "quantidadeConsumo": 11,
        "valorConsumo": 260.59,
        "percentual": 29.73
      }
    ]
  }
}
```

---

### Exemplo 4: Consumo por Mês (Tendência)

**Objetivo:** Ver evolução do consumo ao longo de 3 meses

```bash
curl -X GET "http://localhost:3100/tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-10-01&dataFim=2025-12-31&groupBy=mes" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool
```

**Resposta:**
```json
{
  "agrupamento": {
    "tipo": "mes",
    "total": 3,
    "dados": [
      {
        "mes": "2025-12",
        "movimentacoes": 22,
        "quantidadeConsumo": 37,
        "valorConsumo": 876.53,
        "percentual": 37.50
      },
      {
        "mes": "2025-11",
        "movimentacoes": 14,
        "quantidadeConsumo": 34,
        "valorConsumo": 808.34,
        "percentual": 34.58
      },
      {
        "mes": "2025-10",
        "movimentacoes": 19,
        "quantidadeConsumo": 27,
        "valorConsumo": 652.59,
        "percentual": 27.92
      }
    ]
  }
}
```

---

### Exemplo 5: Consumo por Tipo de Operação

**Objetivo:** Ver quais tipos de operação geram consumo

```bash
curl -X GET "http://localhost:3100/tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-12-01&dataFim=2025-12-31&groupBy=tipooper" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool
```

**Resposta:**
```json
{
  "agrupamento": {
    "tipo": "tipooper",
    "total": 5,
    "dados": [
      {
        "tipoOperacao": 500,
        "movimentacoes": 9,
        "quantidadeConsumo": 37,
        "valorConsumo": 876.53,
        "percentual": 100.00
      },
      {
        "tipoOperacao": 400,
        "movimentacoes": 10,
        "quantidadeConsumo": 0,
        "valorConsumo": 0,
        "percentual": 0
      }
    ]
  }
}
```

---

## 4. Comparação entre Períodos

### Script Completo para Comparar 2 Períodos

```bash
#!/bin/bash

# 1. Obter token
TOKEN=$(curl -s -X POST http://localhost:3100/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"CONVIDADO","password":"guest123"}' \
  | python3 -c 'import sys, json; data=json.load(sys.stdin); print(data.get("access_token", ""))' 2>/dev/null)

echo "=== PERÍODO 1: Novembro 2025 ==="
curl -s -X GET "http://localhost:3100/tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-11-01&dataFim=2025-11-30&groupBy=usuario" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool | jq '.resumo'

echo -e "\n=== PERÍODO 2: Dezembro 2025 ==="
curl -s -X GET "http://localhost:3100/tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-12-01&dataFim=2025-12-31&groupBy=usuario" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool | jq '.resumo'
```

---

## 5. Integração com Frontend

### React/TypeScript (usando React Query)

```typescript
import { useQuery } from '@tanstack/react-query';

interface ConsumoAnaliseParams {
  codprod: number;
  dataInicio: string;
  dataFim: string;
  groupBy?: string;
}

function useConsumoAnalise(params: ConsumoAnaliseParams) {
  return useQuery({
    queryKey: ['consumo-analise', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        dataInicio: params.dataInicio,
        dataFim: params.dataFim,
        ...(params.groupBy && { groupBy: params.groupBy }),
      });

      const response = await fetch(
        `http://localhost:3100/tgfpro2/produtos/${params.codprod}/consumo/analise?${searchParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.json();
    },
  });
}

// Uso no componente
function ConsumoPage() {
  const { data, isLoading } = useConsumoAnalise({
    codprod: 3680,
    dataInicio: '2025-12-01',
    dataFim: '2025-12-31',
    groupBy: 'usuario',
  });

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <h1>Consumo: {data.produto.descrprod}</h1>
      <p>Quantidade: {data.resumo.quantidadeConsumo}</p>
      <p>Valor: R$ {data.resumo.valorConsumo.toFixed(2)}</p>
    </div>
  );
}
```

---

## 6. Estrutura de Dados Retornada

### Objeto Principal

```typescript
interface ProdutoConsumoAnaliseResponse {
  produto: {
    codprod: number;
    descrprod: string;
    ativo: string;
  };
  periodo: {
    inicio: string; // YYYY-MM-DD
    fim: string;    // YYYY-MM-DD
    dias: number;   // Dias no período
  };
  resumo: {
    totalMovimentacoes: number;      // Qtd de notas
    totalLinhas: number;              // Qtd de linhas
    quantidadeConsumo: number;        // Total consumido
    valorConsumo: number;             // Valor em R$
    quantidadeEntrada: number;        // Total entrada
    valorEntrada: number;             // Valor entrada
    mediaDiariaConsumo: number;       // Média/dia
    mediaPorMovimentacao: number;     // Média/nota
  };
  agrupamento?: {
    tipo: string;                     // usuario, grupo, etc
    total: number;                    // Qtd de grupos
    dados: Array<{
      codigo?: number;
      nome?: string;
      codigoGrupo?: number;
      nomeGrupo?: string;
      mes?: string;
      tipoOperacao?: number;
      movimentacoes: number;
      quantidadeConsumo: number;
      valorConsumo: number;
      percentual: number;
    }>;
  };
  movimentacoes: {
    data: Array<{
      data: string;                   // Data da movimentação
      nunota: number;                 // Número único da nota
      numnota?: number;               // Número da nota
      codtipoper: number;             // Tipo de operação
      atualestoque: number;           // -1=consumo, 1=entrada
      tipoMovimento: string;          // CONSUMO/ENTRADA/NEUTRO
      codusuinc?: number;             // Usuário incluinte
      nomeusuinc?: string;            // Nome do incluinte
      codparc?: number;               // Parceiro (quem consumiu)
      nomeparc?: string;              // Nome do parceiro
      quantidade: number;
      valorUnitario: number;
      valorTotal: number;
    }>;
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
}
```

---

## 7. Conceitos Importantes

### Quem Consumiu vs Quem Incluiu

**IMPORTANTE**: O endpoint mostra corretamente **quem consumiu**:

- **CODPARC** (Parceiro): Identifica quem **realmente consumiu**
- **CODUSUINC** (Usuário Incluinte): Identifica quem **lançou a nota**

**Exemplo Real:**
- ELLEN.SOUZA (CODUSUINC) → Lançou/entregou as notas
- MICHELLE.DUARTE (CODPARC) → Realmente consumiu 10 unidades

### ATUALESTOQUE

- **< 0**: CONSUMO (reduz estoque)
- **> 0**: ENTRADA (aumenta estoque)
- **= 0**: NEUTRO (não afeta estoque)

---

## 8. Solução de Problemas

### Erro 401 - Não Autorizado

**Causa:** Token inválido ou expirado

**Solução:** Obtenha um novo token através do endpoint `/auth/login`

### Erro 404 - Produto não Encontrado

**Causa:** Produto com o código fornecido não existe

**Solução:** Verifique se o `codprod` está correto

### Query Muito Longa (HTTP 500)

**Causa:** Algumas queries podem ultrapassar 450 caracteres

**Solução:** Use agrupamentos simples ou períodos menores

---

## 9. Exemplos Práticos de Negócio

### Caso 1: Gestor quer saber gasto mensal com papel

```bash
# Ver consumo de dezembro
curl -X GET "http://localhost:3100/tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-12-01&dataFim=2025-12-31" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.resumo.valorConsumo'

# Resultado: 876.53
```

### Caso 2: Identificar departamento que mais consome

```bash
# Agrupar por grupo de usuário
curl -X GET "http://localhost:3100/tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-12-01&dataFim=2025-12-31&groupBy=grupo" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.agrupamento.dados[] | {grupo: .nomeGrupo, quantidade: .quantidadeConsumo, percentual: .percentual}'

# Resultado:
# Grupo 4: 14 unidades (38%)
# Grupo 8: 11 unidades (30%)
```

### Caso 3: Tendência de consumo (últimos 6 meses)

```bash
# Agrupar por mês
curl -X GET "http://localhost:3100/tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-07-01&dataFim=2025-12-31&groupBy=mes" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.agrupamento.dados[] | {mes, quantidade: .quantidadeConsumo}'
```

---

## 10. Boas Práticas

1. **Cache**: Use cache para evitar requisições repetidas
2. **Paginação**: Para muitos registros, use `page` e `perPage`
3. **Períodos**: Evite períodos muito longos (> 1 ano)
4. **Agrupamentos**: Escolha o agrupamento adequado ao caso de uso
5. **Token**: Armazene o token de forma segura (nunca no código-fonte)

---

## Contato e Suporte

Para dúvidas ou problemas, consulte:
- Documentação técnica: `/docs/CONSUMO_PRODUTO.md`
- Código-fonte: `/src/sankhya/tgfpro2/`
