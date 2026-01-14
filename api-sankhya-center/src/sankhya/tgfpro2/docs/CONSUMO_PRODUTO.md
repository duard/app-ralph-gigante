# Análise de Consumo de Produtos

## Visão Geral

Este endpoint fornece análise detalhada do consumo de produtos por período, com múltiplas visões para gestão:

- **Por Usuário**: Quem está consumindo o produto
- **Por Grupo**: Qual departamento (FINANCEIRO, COMPRAS, RH, etc.) está consumindo
- **Por Parceiro**: Quais fornecedores/clientes estão relacionados ao consumo
- **Por Mês**: Tendência de consumo ao longo do tempo
- **Por Tipo de Operação**: Quais tipos de movimentação geram consumo

## Endpoint

```
GET /tgfpro2/produtos/:codprod/consumo/analise
```

### Parâmetros

#### Path Parameters
- `codprod` (number, required): Código do produto

#### Query Parameters
- `dataInicio` (string, required): Data inicial do período (formato: YYYY-MM-DD)
- `dataFim` (string, required): Data final do período (formato: YYYY-MM-DD)
- `groupBy` (string, optional): Tipo de agrupamento
  - `none` (default): Sem agrupamento, apenas movimentações
  - `usuario`: Agrupa por usuário que gerou a movimentação
  - `grupo`: Agrupa por grupo de usuário (departamento)
  - `parceiro`: Agrupa por parceiro (fornecedor/cliente)
  - `mes`: Agrupa por mês
  - `tipooper`: Agrupa por tipo de operação
- `page` (number, optional): Página para paginação (default: 1)
- `perPage` (number, optional): Itens por página (default: 20, max: 100)

### Exemplo de Requisição

```bash
GET /tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-12-01&dataFim=2025-12-31&groupBy=usuario
```

### Resposta

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
    "quantidadeEntrada": 342,
    "valorEntrada": 7954.22,
    "mediaDiariaConsumo": 1.19,
    "mediaPorMovimentacao": 1.68
  },
  "agrupamento": {
    "tipo": "usuario",
    "total": 3,
    "dados": [
      {
        "codigo": 311,
        "nome": "ELLEN.SOUZA",
        "codigoGrupo": 16,
        "nomeGrupo": "FINANCEIRO",
        "movimentacoes": 22,
        "quantidadeConsumo": 37,
        "valorConsumo": 876.53,
        "percentual": 100
      }
    ]
  },
  "movimentacoes": {
    "data": [
      {
        "data": "2025-12-15T10:30:00",
        "nunota": 123456,
        "numnota": 1234,
        "codtipoper": 500,
        "atualestoque": -1,
        "tipoMovimento": "CONSUMO",
        "codusuinc": 311,
        "nomeusuinc": "ELLEN.SOUZA",
        "codparc": 1234,
        "nomeparc": "FORNECEDOR XYZ",
        "quantidade": 5,
        "valorUnitario": 23.65,
        "valorTotal": 118.25
      }
    ],
    "page": 1,
    "perPage": 20,
    "total": 22,
    "lastPage": 2
  }
}
```

## Conceitos Importantes

### Quem Consumiu vs Quem Incluiu

**IMPORTANTE**: Este endpoint identifica corretamente **quem consumiu** o produto:

- **CODPARC** (Parceiro): Identifica quem realmente consumiu
- **CODUSUINC** (Usuário Incluinte): Identifica quem lançou/criou a nota (ex: ELLEN entrega para MICHELLE)

**Agrupamentos de Consumo:**
- `groupBy=usuario`: Mostra usuários que **consumiram** (via TSIUSU.CODPARC = CAB.CODPARC)
- `groupBy=grupo`: Mostra grupos dos usuários que **consumiram** (via TSIUSU.CODPARC)
- `groupBy=parceiro`: Mostra parceiros que consumiram (direto do CAB.CODPARC)

### ATUALESTOQUE

Indica como o estoque é afetado pela movimentação:

- **< 0 (negativo)**: CONSUMO - Reduz o estoque (saída)
- **> 0 (positivo)**: ENTRADA - Aumenta o estoque (entrada)
- **= 0**: NEUTRO - Não afeta o estoque

### STATUSNOTA

Apenas notas com `STATUSNOTA = 'L'` (Liberada) são consideradas nas análises.

### Cálculos de Consumo

```sql
-- Quantidade consumida
SUM(CASE WHEN ITE.ATUALESTOQUE < 0 THEN ITE.QTDNEG ELSE 0 END)

-- Valor consumido
SUM(CASE WHEN ITE.ATUALESTOQUE < 0 THEN ITE.VLRTOT ELSE 0 END)
```

## Limitações Técnicas

### Query Length Limit
- **Limite**: ~450 caracteres por query SQL
- **Motivo**: Limitação da API externa Sankhya
- **Impacto**: Queries são otimizadas para ficar dentro deste limite

### Campo CODDEP Bloqueado
- O campo `TGFCAB.CODDEP` está bloqueado pela API externa
- Não é possível agrupar por departamento usando TGFCAB
- **Alternativa**: Usar agrupamento por GRUPO (via TSIUSU.CODGRUPO)

## Casos de Uso

### 1. Gestor quer ver consumo mensal de papel
```
GET /tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-12-01&dataFim=2025-12-31&groupBy=none
```

### 2. Gestor quer saber qual departamento mais consome
```
GET /tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-12-01&dataFim=2025-12-31&groupBy=grupo
```

### 3. Gestor quer ver evolução ao longo dos últimos 6 meses
```
GET /tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-07-01&dataFim=2025-12-31&groupBy=mes
```

### 4. Gestor quer identificar quem mais consome
```
GET /tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-12-01&dataFim=2025-12-31&groupBy=usuario
```

### 5. Gestor quer ver consumo por fornecedor
```
GET /tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-12-01&dataFim=2025-12-31&groupBy=parceiro
```

## Estrutura de Dados

### Tabelas Utilizadas

- **TGFPRO**: Cadastro de produtos
- **TGFITE**: Itens das notas fiscais
- **TGFCAB**: Cabeçalho das notas fiscais
- **TSIUSU**: Usuários do sistema
- **TSIGRU**: Grupos de usuários
- **TGFPAR**: Parceiros (fornecedores/clientes)

### Relacionamentos

```
TGFPRO
  └─ TGFITE (CODPROD)
      └─ TGFCAB (NUNOTA)
          ├─ TSIUSU (CODUSUINC)
          │   └─ TSIGRU (CODGRUPO)
          └─ TGFPAR (CODPARC)
```

## Métricas Calculadas

### Resumo
- **totalMovimentacoes**: Quantidade de notas fiscais únicas
- **totalLinhas**: Quantidade de linhas de itens
- **quantidadeConsumo**: Soma de QTDNEG onde ATUALESTOQUE < 0
- **valorConsumo**: Soma de VLRTOT onde ATUALESTOQUE < 0
- **quantidadeEntrada**: Soma de QTDNEG onde ATUALESTOQUE > 0
- **valorEntrada**: Soma de VLRTOT onde ATUALESTOQUE > 0
- **mediaDiariaConsumo**: quantidadeConsumo / dias do período
- **mediaPorMovimentacao**: quantidadeConsumo / totalMovimentacoes

### Agrupamento
- **movimentacoes**: COUNT(DISTINCT NUNOTA)
- **quantidadeConsumo**: SUM(QTDNEG) onde ATUALESTOQUE < 0
- **valorConsumo**: SUM(VLRTOT) onde ATUALESTOQUE < 0
- **percentual**: (valorConsumo do grupo / valorConsumo total) * 100

## Produto de Teste

**Código**: 3680
**Descrição**: PAPEL SULFITE A4 500 FOLHAS
**Dados de Dezembro 2025**:
- 22 movimentações
- 37 unidades consumidas
- R$ 876,53 em consumo

**Quem Consumiu (correto):**
- MICHELLE.DUARTE (Grupo 4): 27% - 10 unidades
- DANUBIA.O (Grupo 20): 16% - 6 unidades
- ANA.SENA (Grupo 8): 14% - 5 unidades
- Outros usuários: 43% - 16 unidades

**Por Grupo:**
- Grupo 4: 38% - 14 unidades
- Grupo 8: 30% - 11 unidades
- Grupo 20: 16% - 6 unidades

**Quem Entregou/Incluiu:** ELLEN.SOUZA (Grupo 16) - responsável por lançar as notas
