# 🚀 Melhorias Propostas para o Endpoint de Consumo

## 📋 Status Atual

✅ Endpoint funcional  
✅ Saldo anterior corrigido  
✅ Cálculo de PMM implementado  
✅ Paginação funcionando

---

## 🎯 Melhorias Prioritárias

### 1. ⭐ **Adicionar TGFTOP (Tipo de Operação) e sua Descrição**

#### 📌 Problema Atual:

- Retornamos apenas `tipmov` (C, V, Q, etc.)
- Não temos a descrição do tipo de operação (ex: "Requisição ao Almoxarifado")
- Falta o `CODTIPOPER` para rastreabilidade

#### ✅ Solução:

```sql
SELECT
    COALESCE(c.DTENTSAI, c.DTNEG) AS data_mov,
    c.NUNOTA,
    c.TIPMOV,
    c.CODTIPOPER,              -- NOVO
    t.DESCROPER,                -- NOVO (Descrição da operação)
    t.ATUALEST,                 -- NOVO (B, E, N, R)
    c.CODPARC,
    par.NOMEPARC AS nome_parceiro,
    u.NOMEUSU AS usuario,
    CASE WHEN i.ATUALESTOQUE < 0 THEN -i.QTDNEG ELSE i.QTDNEG END AS qtd_mov,
    CASE WHEN i.ATUALESTOQUE < 0 THEN -i.VLRTOT ELSE i.VLRTOT END AS valor_mov
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
JOIN TGFTOP t ON t.CODTIPOPER = c.CODTIPOPER AND t.DHTIPOPER = c.DHTIPOPER  -- NOVO JOIN
LEFT JOIN TGFPAR par ON par.CODPARC = c.CODPARC
LEFT JOIN TSIUSU u ON u.CODUSU = c.CODUSUINC
WHERE ...
```

#### 📊 Resposta Melhorada:

```json
{
  "tipo_registro": "MOVIMENTACAO",
  "nunota": 268536,
  "tipmov": "Q",
  "codtipoper": 502, // NOVO
  "descricao_operacao": "Requisição ao Almoxarifado", // NOVO
  "atualiza_estoque": "B", // NOVO
  "quantidade_mov": -5
}
```

---

### 2. ⭐ **Adicionar Informações do Produto**

#### 📌 Justificativa:

- Facilita debug e conferências
- Não precisa consultar outro endpoint para ver o nome do produto

#### ✅ Solução:

```json
{
  "produto": {
    // NOVO
    "codprod": 3680,
    "descrprod": "PAPEL SULFITE A4 500 FOLHAS",
    "unidade": "UN",
    "ativo": "S"
  },
  "dataInicio": "2025-12-01",
  "dataFim": "2025-12-31"
}
```

```sql
SELECT
    p.CODPROD,
    p.DESCRPROD,
    p.CODUND AS unidade,
    p.ATIVO
FROM TGFPRO p
WHERE p.CODPROD = 3680
```

---

### 3. ⭐ **Melhorar Métricas com Totalizadores**

#### 📌 Adicionar:

```json
{
  "metrics": {
    "valor_medio_periodo": -23.69,
    "valor_medio_entradas": 0,
    "total_consumo_baixas": 37,

    // NOVOS
    "total_entradas_qtd": 0,
    "total_saidas_qtd": 37,
    "total_entradas_valor": 0,
    "total_saidas_valor": -876.53,
    "percentual_consumo": 35.58, // (37/104)*100
    "dias_estoque_disponivel": 10.8, // 104/37 * 30 dias
    "media_consumo_dia": 1.23 // 37/30 dias
  }
}
```

---

### 4. ⭐ **Adicionar Centro de Custo (Se Aplicável)**

#### 📌 Para Requisições:

```sql
SELECT
    c.CODCENCUS,
    cc.DESCRCENCUS
FROM TGFCAB c
LEFT JOIN TSICUS cc ON cc.CODCENCUS = c.CODCENCUS
```

```json
{
  "tipo_registro": "MOVIMENTACAO",
  "tipmov": "Q",
  "centro_custo": {
    // NOVO
    "codigo": 101,
    "descricao": "MANUTENÇÃO"
  }
}
```

---

### 5. ⭐ **Adicionar Observações da Nota**

#### 📌 Justificativa:

- Importante para entender o contexto da movimentação
- Ajuda em auditorias

```sql
SELECT
    c.OBSERVACAO,
    i.OBSERVACAO AS obs_item
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
```

```json
{
  "nunota": 268536,
  "observacao": "Requisição urgente para manutenção preventiva", // NOVO
  "obs_item": null // NOVO
}
```

---

### 6. ⭐ **Adicionar Filtros Opcionais na Query**

#### 📌 Novos Parâmetros:

```typescript
@Query('tipmov') tipmov?: string,          // Filtrar por tipo (C, V, Q)
@Query('codtipoper') codtipoper?: number,  // Filtrar por operação específica
@Query('codparc') codparc?: number,        // Filtrar por parceiro
@Query('incluirReservas') incluirReservas?: boolean // Incluir movimentos de reserva
```

---

### 7. ⭐ **Adicionar Data de Movimentação vs Data de Negociação**

#### 📌 Problema:

- Atualmente usamos `COALESCE(c.DTENTSAI, c.DTNEG)`
- Pode gerar confusão sobre qual data é qual

#### ✅ Solução:

```json
{
  "data_referencia": "2025-12-08T00:00:00.000Z",
  "dtneg": "2025-12-07T00:00:00.000Z", // NOVO (Data negociação)
  "dtentsai": "2025-12-08T00:00:00.000Z", // NOVO (Data entrada/saída)
  "data_efetiva": "2025-12-08T00:00:00.000Z" // NOVO (a que foi usada)
}
```

---

### 8. ⭐ **Adicionar Link/Referência para Documento Origem**

#### 📌 Para Rastreabilidade:

```json
{
  "nunota": 268536,
  "nunotaorig": 267123, // NOVO (Nota origem, se houver)
  "nuremorca": null, // NOVO (Remessa/Orca origem)
  "ad_nunotareqorig": null // NOVO (Requisição origem)
}
```

---

### 9. ⭐ **Adicionar Status de Conclusão/Pendência**

#### 📌 Para Requisições e Pedidos:

```sql
SELECT
    i.QTDNEG,
    i.QTDENTREGUE,
    i.PENDENTE,
    (i.QTDNEG - i.QTDENTREGUE) AS qtd_pendente
FROM TGFITE i
```

```json
{
  "qtd_negociada": 10, // NOVO
  "qtd_entregue": 10, // NOVO
  "qtd_pendente": 0, // NOVO
  "status_pendente": "N" // NOVO
}
```

---

### 10. ⭐ **Adicionar Validações e Tratamento de Erros**

#### 📌 Validações:

```typescript
// Validar produto existe
if (produto não encontrado) {
  throw new NotFoundException(`Produto ${codprod} não encontrado`)
}

// Validar datas
if (dataFim < dataInicio) {
  throw new BadRequestException('Data fim deve ser maior que data início')
}

// Validar período máximo (ex: 1 ano)
if (dias > 365) {
  throw new BadRequestException('Período máximo: 365 dias')
}
```

---

### 11. ⭐ **Adicionar Cache para Consultas Repetidas**

#### 📌 Implementação:

```typescript
@UseInterceptors(CacheInterceptor)
@CacheTTL(300) // 5 minutos
async consultarConsumoPeriodo(...) {
  // Cache por: codprod + dataInicio + dataFim
}
```

---

### 12. ⭐ **Adicionar Exportação para Excel/CSV**

#### 📌 Novo Endpoint:

```
GET /tgfpro/consumo-periodo/:codprod/export?format=xlsx&dataInicio=...
```

---

### 13. ⭐ **Adicionar Comparação com Período Anterior**

#### 📌 Resposta:

```json
{
  "periodo_atual": {
    "dataInicio": "2025-12-01",
    "dataFim": "2025-12-31",
    "total_consumo": 37
  },
  "periodo_anterior": {
    // NOVO
    "dataInicio": "2025-11-01",
    "dataFim": "2025-11-30",
    "total_consumo": 42,
    "variacao_percentual": -11.9 // (37-42)/42 * 100
  }
}
```

---

### 14. ⭐ **Adicionar Localização (TGFEST)**

#### 📌 Para Saber Onde Está o Estoque:

```json
{
  "saldoAtual": {
    "tipo_registro": "SALDO_ATUAL",
    "saldo_qtd_final": 153,
    "localizacoes": [
      // NOVO
      {
        "codlocal": 1,
        "descricao": "ALMOXARIFADO PRINCIPAL",
        "estoque": 100
      },
      {
        "codlocal": 5,
        "descricao": "ALMOXARIFADO MANUTENÇÃO",
        "estoque": 53
      }
    ]
  }
}
```

```sql
SELECT
    e.CODLOCAL,
    l.DESCRLOCAL,
    e.ESTOQUE
FROM TGFEST e
JOIN TGFLOC l ON l.CODLOCAL = e.CODLOCAL
WHERE e.CODPROD = 3680
    AND e.ATIVO = 'S'
    AND e.ESTOQUE > 0
```

---

## 📊 Priorização Sugerida

### 🔴 Alta Prioridade (Implementar Agora):

1. ✅ **TGFTOP + Descrição da Operação** (mais informativo)
2. ✅ **Informações do Produto** (facilita uso)
3. ✅ **Validações de Entrada** (evita erros)
4. ✅ **Observações da Nota** (contexto importante)

### 🟡 Média Prioridade (Próxima Fase):

5. ⏳ Métricas Expandidas
6. ⏳ Centro de Custo
7. ⏳ Status de Pendência
8. ⏳ Localizações de Estoque

### 🟢 Baixa Prioridade (Futuro):

9. ⏳ Cache
10. ⏳ Exportação Excel
11. ⏳ Comparação com Período Anterior
12. ⏳ Filtros Avançados

---

## 🎯 Implementação Rápida - Top 4

Vamos implementar as 4 melhorias de alta prioridade que agregam mais valor imediato?

1. **TGFTOP** - 15 min
2. **Info Produto** - 10 min
3. **Validações** - 20 min
4. **Observações** - 10 min

**Total: ~55 minutos para um endpoint muito mais completo!**

---

## 📝 Exemplo de Resposta Final com Todas as Melhorias:

```json
{
  "produto": {
    "codprod": 3680,
    "descrprod": "PAPEL SULFITE A4 500 FOLHAS",
    "unidade": "UN"
  },
  "periodo": {
    "dataInicio": "2025-12-01",
    "dataFim": "2025-12-31",
    "totalDias": 31
  },
  "saldoAnterior": {
    "tipo_registro": "SALDO_ANTERIOR",
    "saldo_qtd": 104,
    "saldo_valor": 2360.29,
    "valor_unitario_referencia": 22.6951
  },
  "movimentacoes": [
    {
      "tipo_registro": "MOVIMENTACAO",
      "data_referencia": "2025-12-08T00:00:00.000Z",
      "dtneg": "2025-12-07T00:00:00.000Z",
      "dtentsai": "2025-12-08T00:00:00.000Z",
      "nunota": 268536,
      "tipmov": "Q",
      "codtipoper": 502,
      "descricao_operacao": "Requisição ao Almoxarifado",
      "atualiza_estoque": "B",
      "codparc": 100048,
      "nome_parceiro": "ANA MARCIA SENA",
      "centro_custo": {
        "codigo": 101,
        "descricao": "MANUTENÇÃO"
      },
      "usuario": "ELLEN.SOUZA",
      "observacao": "Material para manutenção preventiva",
      "quantidade_mov": -5,
      "valor_mov": -118.45,
      "valor_unitario": 23.69,
      "pmm": -309.54,
      "saldo_qtd_final": 99,
      "saldo_valor_final": -30644.38
    }
  ],
  "metrics": {
    "valor_medio_periodo": -23.69,
    "total_entradas_qtd": 0,
    "total_saidas_qtd": 37,
    "total_consumo_baixas": 37,
    "percentual_consumo": 35.58,
    "media_consumo_dia": 1.19
  },
  "saldoAtual": {
    "tipo_registro": "SALDO_ATUAL",
    "saldo_qtd_final": 153,
    "saldo_valor_final": 1483.76,
    "localizacoes": [
      {
        "codlocal": 1,
        "descricao": "ALMOXARIFADO PRINCIPAL",
        "estoque": 100
      },
      {
        "codlocal": 5,
        "descricao": "ALMOXARIFADO MANUTENÇÃO",
        "estoque": 53
      }
    ]
  }
}
```

---

**Deseja que eu implemente as 4 melhorias prioritárias agora? 🚀**
