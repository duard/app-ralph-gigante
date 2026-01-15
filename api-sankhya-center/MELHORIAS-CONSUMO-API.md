# Melhorias na API de Consumo de Produtos

## Problema Identificado

O endpoint de análise de consumo (`/tgfpro2/produtos/:codprod/consumo/analise`) estava retornando apenas informações de consumo e entradas do período, **SEM calcular os saldos inicial e final** específicos do período selecionado.

Isso causava confusão para os gestores, pois:
- ❌ Não era possível saber o saldo real no início do período
- ❌ Não era possível saber o saldo real no final do período
- ❌ Impossível fazer conciliação de estoque por período

## Solução Implementada

### 1. Adicionados Campos ao Resumo de Consumo

Foram adicionados 4 novos campos ao `ResumoConsumoDto`:

```typescript
saldoInicialQuantidade?: number      // Quantidade em estoque no INÍCIO do período
saldoInicialValor?: number           // Valor do estoque no INÍCIO do período
saldoFinalQuantidade?: number        // Quantidade em estoque no FINAL do período
saldoFinalValor?: number             // Valor do estoque no FINAL do período
```

### 2. Cálculo Correto de Saldos

#### Saldo Inicial
- **Quantidade**: Soma acumulada de todas as movimentações ANTES da data de início
- **Valor**: Quantidade × Valor unitário da última compra antes do período

#### Saldo Final
- **Quantidade**: Saldo Inicial + Entradas do Período - Consumo do Período
- **Valor**: Saldo Inicial (valor) + Entradas (valor) - Consumo (valor)

### 3. Queries SQL Otimizadas

#### Query de Saldo Anterior
```sql
SELECT COALESCE(SUM(CASE WHEN ITE.ATUALESTOQUE<0 THEN -ITE.QTDNEG ELSE ITE.QTDNEG END),0) AS SALDO
FROM TGFITE ITE WITH(NOLOCK)
JOIN TGFCAB CAB WITH(NOLOCK) ON CAB.NUNOTA=ITE.NUNOTA
WHERE ITE.CODPROD=:codprod
  AND CAB.DTNEG<:dataInicio
  AND CAB.STATUSNOTA='L'
  AND ITE.ATUALESTOQUE<>0
  AND ITE.RESERVA='N'
```

#### Query de Valor Unitário de Referência
```sql
SELECT TOP 1 ITE.VLRUNIT
FROM TGFITE ITE WITH(NOLOCK)
JOIN TGFCAB CAB WITH(NOLOCK) ON CAB.NUNOTA=ITE.NUNOTA
WHERE ITE.CODPROD=:codprod
  AND CAB.TIPMOV='C'
  AND CAB.STATUSNOTA='L'
  AND ITE.ATUALESTOQUE>0
  AND CAB.DTNEG<:dataInicio
ORDER BY CAB.DTNEG DESC, CAB.NUNOTA DESC
```

## Exemplo de Uso

### Endpoint
```
GET /tgfpro2/produtos/:codprod/consumo/analise
```

### Parâmetros
- `dataInicio` (obrigatório): Data inicial no formato YYYY-MM-DD
- `dataFim` (obrigatório): Data final no formato YYYY-MM-DD
- `groupBy` (opcional): usuario, grupo, parceiro, mes, tipooper, none

### Exemplo de Requisição

```bash
curl -X GET "http://localhost:3100/tgfpro2/produtos/3680/consumo/analise?dataInicio=2025-01-01&dataFim=2025-01-31" \
  -H "Authorization: Bearer {seu_token}" \
  -H "Content-Type: application/json"
```

### Exemplo de Resposta

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

## Comparação: Diferentes Períodos

### Janeiro/2025
- **Saldo Inicial**: 12 unidades (R$ 290,10)
- **Entradas**: 100 unidades (R$ 2.386,17)
- **Consumo**: 24 unidades (R$ 576,48)
- **Saldo Final**: 88 unidades (R$ 2.099,79)

### Dezembro/2025
- **Saldo Inicial**: 104 unidades (R$ 2.360,29)
- **Entradas**: 100 unidades (R$ 2.246,24)
- **Consumo**: 37 unidades (R$ 876,53)
- **Saldo Final**: 167 unidades (R$ 3.730,00)

## Benefícios para Gestores

✅ **Visibilidade Total**: Saldo inicial e final de qualquer período selecionado
✅ **Conciliação Facilitada**: Validar movimentações com saldos contábeis
✅ **Tomada de Decisão**: Dados precisos para gestão de estoque
✅ **Rastreabilidade**: Histórico completo de movimentações
✅ **Flexibilidade**: Consultar qualquer período (dia, semana, mês, ano)

## Autenticação

Todos os endpoints requerem autenticação via Bearer Token:

```bash
# 1. Obter token
curl -X POST "http://localhost:3100/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "SEU_USUARIO", "password": "SUA_SENHA"}'

# Resposta:
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600
}

# 2. Usar token nas requisições
curl -X GET "http://localhost:3100/tgfpro2/produtos/3680/consumo/analise?..." \
  -H "Authorization: Bearer eyJhbGc..."
```

## Próximos Passos Sugeridos

### 1. Relatórios em PDF (A4)
- Endpoint para gerar relatórios formatados
- Layout profissional para impressão
- Gráficos e tabelas de análise

### 2. Dashboard de Consumo
- Interface visual para análise
- Filtros interativos
- Exportação para Excel/PDF

### 3. Alertas Automáticos
- Notificações de consumo anormal
- Alertas de estoque mínimo
- Previsão de reposição

## Arquivos Modificados

- `src/sankhya/tgfpro2/dtos/produto-consumo-analise-response.dto.ts` - Adicionado campos de saldo
- `src/sankhya/tgfpro2/tgfpro2.service.ts` - Implementado cálculo de saldos

## Compatibilidade

✅ Totalmente retrocompatível - os campos novos são opcionais
✅ Não quebra integrações existentes
✅ Performance otimizada com queries indexadas

---

**Data da Implementação**: 15/01/2026
**Versão**: 1.1.0
**Status**: ✅ Em Produção
