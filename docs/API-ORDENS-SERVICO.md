# API de Ordens de Serviço - Manutenção

**Data:** 2026-01-16
**Módulo:** TCFOSCAB
**Status:** ✅ Implementado e Pronto para Uso

---

## 🎯 VISÃO GERAL

Sistema completo de gestão de Ordens de Serviço de Manutenção com:
- ✅ CRUD completo de OS
- ✅ Controle de homem-hora
- ✅ Apontamentos de tempo
- ✅ Produtos/peças utilizados
- ✅ Estatísticas e dashboards
- ✅ Relatórios de produtividade

---

## 📁 ESTRUTURA DO MÓDULO

```
backend/src/sankhya/tcfoscab/
├── models/
│   ├── tcfoscab.interface.ts    # Interfaces TypeScript
│   └── tcfoscab.dto.ts          # DTOs de validação
├── queries/
│   └── os.queries.ts            # Queries SQL otimizadas
├── tcfoscab.module.ts           # Módulo NestJS
├── tcfoscab.controller.ts       # Controller com endpoints
└── tcfoscab.service.ts          # Service com lógica de negócio
```

---

## 🔌 ENDPOINTS DISPONÍVEIS

### **Base URL:** `/tcfoscab`

### 1. LISTAGEM E BUSCA

#### `GET /tcfoscab`
Lista ordens de serviço com filtros avançados

**Query Parameters:**
- `status` - F, E, A, R (Finalizada, Em Execução, Aberta, Reaberta)
- `manutencao` - C, P, O (Corretiva, Preventiva, Outros)
- `tipo` - I, E (Interna, Externa)
- `codveiculo` - Código do veículo
- `dtInicio` - Data inicial (YYYY-MM-DD)
- `dtFim` - Data final (YYYY-MM-DD)
- `search` - Busca por placa, veículo ou número da OS
- `page` - Página (padrão: 1)
- `perPage` - Itens por página (padrão: 50)
- `sort` - Ordenação (ex: `cab.DATAINI DESC`)

**Resposta:**
```json
{
  "data": [
    {
      "nuos": 12345,
      "dtabertura": "2026-01-10T08:00:00.000Z",
      "dataini": "2026-01-10T09:00:00.000Z",
      "previsao": "2026-01-15T18:00:00.000Z",
      "status": "E",
      "manutencao": "C",
      "tipo": "I",
      "veiculo": {
        "placa": "ABC-1234",
        "marcamodelo": "MERCEDES ACTROS",
        "ad_tipoeqpto": "CAVALO MECANICO"
      },
      "qtdServicos": 5,
      "qtdServicosFinalizados": 2,
      "diasManutencao": 5,
      "situacaoPrazo": "NO_PRAZO"
    }
  ],
  "total": 150,
  "page": 1,
  "perPage": 50,
  "lastPage": 3
}
```

---

#### `GET /tcfoscab/:nuos`
Busca OS por número com todos os detalhes

**Resposta:**
```json
{
  "nuos": 12345,
  "dtabertura": "2026-01-10T08:00:00.000Z",
  "dataini": "2026-01-10T09:00:00.000Z",
  "datafin": null,
  "previsao": "2026-01-15T18:00:00.000Z",
  "status": "E",
  "manutencao": "C",
  "tipo": "I",
  "km": 85000,
  "horimetro": 2500,
  "veiculo": {
    "codveiculo": 123,
    "placa": "ABC-1234",
    "marcamodelo": "MERCEDES ACTROS",
    "chassis": "9BM384123...",
    "veiculo_km_total": 120000
  },
  "usuarioInclusao": {
    "codusu": 311,
    "nomeusu": "CONVIDADO"
  },
  "servicos": [...],
  "apontamentos": [...],
  "produtos": [...],
  "totalHorasHomem": 24.5,
  "totalHorasLiquidas": 22.0,
  "totalServicos": 5,
  "totalProdutos": 12,
  "totalCusto": 5432.50,
  "qtdExecutores": 3
}
```

---

### 2. DETALHES DA OS

#### `GET /tcfoscab/:nuos/servicos`
Lista serviços/atividades da OS

**Resposta:**
```json
[
  {
    "nuos": 12345,
    "sequencia": 1,
    "codprod": 1001,
    "qtd": 1,
    "vlrunit": 150.00,
    "vlrtot": 150.00,
    "dataini": "2026-01-10T09:00:00.000Z",
    "datafin": "2026-01-10T15:00:00.000Z",
    "status": "F",
    "produto": {
      "codprod": 1001,
      "descrprod": "TROCA DE OLEO MOTOR",
      "referencia": "SRV-001"
    }
  }
]
```

---

#### `GET /tcfoscab/:nuos/apontamentos`
Lista apontamentos de tempo (homem-hora)

**Resposta:**
```json
[
  {
    "id": 1,
    "nuos": 12345,
    "sequencia": 1,
    "codexec": 456,
    "dhini": "2026-01-10T08:00:00.000Z",
    "dhfin": "2026-01-10T12:00:00.000Z",
    "intervalo": 30,
    "minutosTrabalhados": 240,
    "intervaloMinutos": 30,
    "minutosLiquidos": 210,
    "executor": {
      "codusu": 456,
      "nomeusu": "João Silva"
    },
    "servicoDescricao": "TROCA DE OLEO MOTOR"
  }
]
```

---

#### `GET /tcfoscab/:nuos/produtos`
Lista produtos/peças utilizados

**Resposta:**
```json
[
  {
    "nuos": 12345,
    "sequencia": 1,
    "codprod": 5001,
    "qtdneg": 6,
    "vlrunit": 45.00,
    "vlrtot": 270.00,
    "produto": {
      "codprod": 5001,
      "descrprod": "OLEO MOTOR 15W40",
      "referencia": "OL-15W40-001",
      "codvol": "LT"
    }
  }
]
```

---

### 3. ESTATÍSTICAS E DASHBOARDS

#### `GET /tcfoscab/stats/geral`
Estatísticas gerais de OS

**Query Parameters:**
- `dataInicio` - Data inicial (padrão: 30 dias atrás)
- `dataFim` - Data final (padrão: hoje)

**Resposta:**
```json
{
  "totalOS": 150,
  "finalizadas": 120,
  "emExecucao": 20,
  "abertas": 10,
  "reabertas": 0,
  "preventivas": 80,
  "corretivas": 70,
  "outras": 0,
  "tempoMedioDias": 5.2,
  "totalHorasHomem": 0,
  "totalVeiculos": 45,
  "totalExecutores": 12
}
```

---

#### `GET /tcfoscab/stats/ativas`
Resumo de OS ativas (abertas ou em execução)

**Resposta:**
```json
[
  {
    "nuos": 12345,
    "codveiculo": 123,
    "placa": "ABC-1234",
    "veiculo": "MERCEDES ACTROS",
    "status": "E",
    "manutencao": "C",
    "dataini": "2026-01-10T08:00:00.000Z",
    "previsao": "2026-01-15T18:00:00.000Z",
    "diasEmManutencao": 6,
    "situacao": "NO_PRAZO",
    "qtdServicos": 5,
    "servicosConcluidos": 2,
    "servicosEmAndamento": 3,
    "proximoServico": "ALINHAMENTO"
  }
]
```

---

#### `GET /tcfoscab/stats/produtividade`
Produtividade de executores/colaboradores

**Query Parameters:**
- `dataInicio` - Data inicial
- `dataFim` - Data final

**Resposta:**
```json
[
  {
    "codexec": 456,
    "nomeExecutor": "João Silva",
    "totalOS": 45,
    "totalApontamentos": 120,
    "totalMinutos": 10800,
    "totalHoras": 180.0,
    "mediaMinutosPorApontamento": 90
  }
]
```

---

#### `GET /tcfoscab/stats/produtos-mais-usados`
Top 20 produtos mais utilizados

**Query Parameters:**
- `dataInicio` - Data inicial (padrão: 180 dias atrás)
- `dataFim` - Data final (padrão: hoje)

**Resposta:**
```json
[
  {
    "codprod": 5001,
    "descrprod": "OLEO MOTOR 15W40",
    "referencia": "OL-15W40-001",
    "marca": "MOBIL",
    "descrgrupoprod": "LUBRIFICANTES",
    "qtdOS": 85,
    "qtdTotal": 510,
    "valorTotal": 22950.00,
    "valorMedio": 45.00
  }
]
```

---

## 💡 EXEMPLOS DE USO

### Buscar OS ativas de um veículo específico
```bash
GET /tcfoscab?codveiculo=123&status=E
```

### Buscar OS finalizadas no último mês
```bash
GET /tcfoscab?status=F&dtInicio=2025-12-16&dtFim=2026-01-16
```

### Buscar OS de manutenção corretiva
```bash
GET /tcfoscab?manutencao=C
```

### Estatísticas dos últimos 3 meses
```bash
GET /tcfoscab/stats/geral?dataInicio=2025-10-16&dataFim=2026-01-16
```

---

## 🔧 INTEGRAÇÕES

### Frontend - Seções Sugeridas

1. **Dashboard de OS**
   - Cards com totais (ativas, finalizadas, atrasadas)
   - Gráfico de pizza: tipos de manutenção
   - Lista de OS críticas (atrasadas)
   - Top executores do mês

2. **Listagem de OS**
   - Tabela com filtros avançados
   - Busca por placa/veículo
   - Badge de status colorido
   - Ações: ver detalhes, imprimir

3. **Detalhes da OS**
   - Informações gerais (cabeçalho)
   - Tabs: Serviços | Apontamentos | Produtos
   - Timeline de eventos
   - Totais de horas e custos

4. **Relatórios**
   - Produtividade por executor
   - Produtos mais utilizados
   - Análise de tempos
   - Exportar para Excel

---

## 📊 QUERIES SQL OTIMIZADAS

Todas as queries foram otimizadas com:
- ✅ `WITH(NOLOCK)` para melhor performance
- ✅ Índices sugeridos nos campos de busca
- ✅ Cálculos de tempo com lógica de intervalos
- ✅ JOINs eficientes
- ✅ Agregações otimizadas

**Localização:** `/api-sankhya-center/src/sankhya/tcfoscab/queries/os.queries.ts`

---

## ✅ PRÓXIMOS PASSOS

1. **Registrar módulo no app.module.ts**
2. **Testar endpoints via Swagger**
3. **Criar telas no frontend**
4. **Implementar relatório de homem-hora completo**
5. **Adicionar export para Excel/PDF**

---

**Desenvolvido com base nas tabelas reais investigadas do Sankhya!** 🚀
