# PRD - Relatório de Consumo de Produto

## Visão Geral

**Módulo:** API Sankhya Center
**Endpoint:** `GET /relatorios/tgfpro/consumo/:codprod`
**Objetivo:** Gerar relatório PDF completo com histórico de consumo de produto em um período específico.

### Contexto do Negócio

A empresa **NÃO PRODUZ e NÃO VENDE** produtos. O modelo de operação é:
- **Compras:** Aquisição de materiais de fornecedores externos
- **Consumo:** Uso interno dos materiais pelos departamentos/setores

Portanto, no relatório:
- **Entradas** = Compras de fornecedores (NF de compra)
- **Saídas** = Consumo interno (requisições de materiais pelos setores)

---

## 1. Requisitos Funcionais

### 1.1 Endpoint Principal

```
GET /relatorios/tgfpro/consumo/:codprod
```

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Exemplo | Descrição |
|-----------|------|-------------|---------|-----------|
| `dataInicio` | string (ISO8601) | Sim | `2025-12-01` | Data inicial do período |
| `dataFim` | string (ISO8601) | Sim | `2025-12-31` | Data final do período |

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="consumo-produto-{codprod}-{periodo}.pdf"`

---

## 2. Estrutura do Relatório PDF

### 2.1 CABEÇALHO (Header)

```
┌─────────────────────────────────────────────────────────────────────┐
│  LOGO EMPRESA                    RELATÓRIO DE CONSUMO DE PRODUTO   │
│                                                                     │
│  Período: 01/12/2025 a 31/12/2025                                  │
│  Gerado em: 15/01/2026 às 14:30                                    │
│  Usuário: [Nome do usuário logado]                                 │
└─────────────────────────────────────────────────────────────────────┘
```

**Dados do cabeçalho:**
- Logo da empresa (opcional, configurável)
- Título: "RELATÓRIO DE CONSUMO DE PRODUTO"
- Período analisado (formatado dd/MM/yyyy)
- Data/hora de geração
- Usuário que gerou o relatório

---

### 2.2 DADOS DO PRODUTO (Seção 1)

```
┌─────────────────────────────────────────────────────────────────────┐
│  DADOS DO PRODUTO                                                   │
├─────────────────────────────────────────────────────────────────────┤
│  Código:        3680                                                │
│  Descrição:     PARAFUSO SEXTAVADO M10X30                          │
│  Complemento:   AÇO CARBONO ZINCADO                                │
│  Unidade:       UN                                                  │
│  Status:        ATIVO                                               │
│  Tipo Controle: S (Série/Lote)                                     │
├─────────────────────────────────────────────────────────────────────┤
│  RESUMO DO PERÍODO                                                  │
├─────────────────────────────────────────────────────────────────────┤
│  Saldo Inicial:     1.500 UN     │  Valor Inicial:    R$ 4.500,00  │
│  Total Compras:       800 UN     │  Valor Compras:    R$ 2.400,00  │
│  Total Consumo:     1.200 UN     │  Valor Consumo:    R$ 3.600,00  │
│  Saldo Final:       1.100 UN     │  Valor Final:      R$ 3.300,00  │
├─────────────────────────────────────────────────────────────────────┤
│  Média Consumo/Dia:    38,7 UN   │  Dias de Estoque:     28 dias   │
│  % Consumo no Período: 80%       │  Valor Médio Unit.:   R$ 3,00   │
└─────────────────────────────────────────────────────────────────────┘
```

**Campos obrigatórios:**
- `CODPROD` - Código do produto
- `DESCRPROD` - Descrição
- `COMPLDESC` - Complemento (se houver)
- `CODVOL` - Unidade de medida
- `ATIVO` - Status (S/N)
- `TIPCONTEST` - Tipo de controle (Série/Lote)

**Métricas calculadas:**
- Saldo inicial (quantidade e valor)
- Total de compras (quantidade e valor) - entradas de fornecedores
- Total de consumo (quantidade e valor) - requisições dos setores
- Saldo final (quantidade e valor)
- Média de consumo por dia
- Dias de estoque disponível (previsão de duração)
- Percentual de consumo no período
- Valor médio unitário (custo médio)

---

### 2.3 GRÁFICO DE CONSUMO EM LINHA (Seção 2)

```
┌─────────────────────────────────────────────────────────────────────┐
│  EVOLUÇÃO DO CONSUMO INTERNO - VISÃO DIÁRIA                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Qtd │                                                              │
│  150 │    ╭─╮                                                       │
│  120 │   ╱   ╲      ╭──╮                                           │
│   90 │  ╱     ╲    ╱    ╲   ╭─╮                                    │
│   60 │ ╱       ╲──╱      ╲─╱   ╲                                   │
│   30 │╱                         ╲──────                             │
│    0 │──────────────────────────────────────────                   │
│      └─────────────────────────────────────────                    │
│        01  05  10  15  20  25  30  (dias)                          │
│                                                                     │
│  ── Consumo Diário (Requisições)    ── Média do Período            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  HISTÓRICO DE CONSUMO - VISÃO MENSAL (últimos 6 meses)             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Qtd │                                                              │
│ 3000 │         ████                                                 │
│ 2500 │    ████ ████ ████                                           │
│ 2000 │    ████ ████ ████ ████                                      │
│ 1500 │ ████ ████ ████ ████ ████ ████                               │
│ 1000 │ ████ ████ ████ ████ ████ ████                               │
│  500 │ ████ ████ ████ ████ ████ ████                               │
│    0 │ ████ ████ ████ ████ ████ ████                               │
│      └─────────────────────────────────────                        │
│        Jul   Ago   Set   Out   Nov   Dez                           │
│                                                                     │
│  Requisições de Material pelos Setores                             │
└─────────────────────────────────────────────────────────────────────┘
```

**Dados para os gráficos:**

#### Gráfico Diário:
- Eixo X: Dias do período selecionado
- Eixo Y: Quantidade consumida
- Linha de consumo diário
- Linha tracejada de média do período

#### Gráfico Mensal:
- Eixo X: Últimos 6 meses (retroativo)
- Eixo Y: Quantidade total consumida no mês
- Barras de consumo mensal

**Query para dados diários:**
```sql
SELECT
    CAST(COALESCE(c.DTENTSAI, c.DTNEG) AS DATE) AS data_consumo,
    SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN i.QTDNEG ELSE 0 END) AS qtd_consumo
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
WHERE i.CODPROD = :codprod
    AND c.STATUSNOTA = 'L'
    AND i.ATUALESTOQUE < 0
    AND COALESCE(c.DTENTSAI, c.DTNEG) BETWEEN :dataInicio AND :dataFim
GROUP BY CAST(COALESCE(c.DTENTSAI, c.DTNEG) AS DATE)
ORDER BY data_consumo
```

**Query para dados mensais (6 meses):**
```sql
SELECT
    YEAR(COALESCE(c.DTENTSAI, c.DTNEG)) AS ano,
    MONTH(COALESCE(c.DTENTSAI, c.DTNEG)) AS mes,
    SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN i.QTDNEG ELSE 0 END) AS qtd_consumo
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
WHERE i.CODPROD = :codprod
    AND c.STATUSNOTA = 'L'
    AND i.ATUALESTOQUE < 0
    AND COALESCE(c.DTENTSAI, c.DTNEG) >= DATEADD(MONTH, -6, :dataFim)
GROUP BY YEAR(COALESCE(c.DTENTSAI, c.DTNEG)), MONTH(COALESCE(c.DTENTSAI, c.DTNEG))
ORDER BY ano, mes
```

---

### 2.4 CONSUMO POR SETOR/DEPARTAMENTO (Seção 3)

```
┌─────────────────────────────────────────────────────────────────────┐
│  CONSUMO INTERNO POR SETOR (Requisições de Material)               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  SETOR/DEPARTAMENTO     │  QTD REQUISITADA│  VALOR      │    %     │
│  ───────────────────────┼─────────────────┼─────────────┼──────────│
│  MANUTENÇÃO             │       450 UN    │  R$ 1.350   │   37,5%  │
│  PRODUÇÃO               │       380 UN    │  R$ 1.140   │   31,7%  │
│  ALMOXARIFADO           │       220 UN    │  R$   660   │   18,3%  │
│  ENGENHARIA             │       100 UN    │  R$   300   │    8,3%  │
│  OUTROS                 │        50 UN    │  R$   150   │    4,2%  │
│  ───────────────────────┼─────────────────┼─────────────┼──────────│
│  TOTAL CONSUMIDO        │     1.200 UN    │  R$ 3.600   │  100,0%  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  DISTRIBUIÇÃO DO CONSUMO POR SETOR                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                    ████████                                         │
│               █████        █████                                    │
│            ███   MANUTENÇÃO   ███                                  │
│           ██       37,5%        ██                                 │
│          █                        █   ████  PRODUÇÃO 31,7%         │
│          █                        █   ████  ALMOXARIFADO 18,3%     │
│           ██                    ██    ████  ENGENHARIA 8,3%        │
│            ███              ███       ████  OUTROS 4,2%            │
│               █████    █████                                        │
│                    ████████                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Lógica de agrupamento por setor:**

O setor/departamento é identificado pelo **grupo do usuário** que fez a requisição de material para consumo interno (TSIUSU.CODGRUPO -> TSIGRU.NOMEGRUPO).

Isso permite identificar:
- Quais setores mais consomem determinado material
- Distribuição do custo por departamento
- Padrões de consumo para planejamento de compras

**Query para consumo por departamento:**
```sql
SELECT
    COALESCE(g.NOMEGRUPO, 'SEM GRUPO') AS departamento,
    g.CODGRUPO,
    SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN i.QTDNEG ELSE 0 END) AS qtd_consumo,
    SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN i.VLRTOT ELSE 0 END) AS valor_consumo,
    COUNT(DISTINCT c.NUNOTA) AS qtd_requisicoes
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
LEFT JOIN TSIUSU u ON u.CODUSU = c.CODUSUINC
LEFT JOIN TSIGRU g ON g.CODGRUPO = u.CODGRUPO
WHERE i.CODPROD = :codprod
    AND c.STATUSNOTA = 'L'
    AND i.ATUALESTOQUE < 0
    AND i.RESERVA = 'N'
    AND COALESCE(c.DTENTSAI, c.DTNEG) BETWEEN :dataInicio AND :dataFim
GROUP BY g.CODGRUPO, g.NOMEGRUPO
ORDER BY qtd_consumo DESC
```

---

### 2.5 DETALHAMENTO DAS REQUISIÇÕES E COMPRAS (Seção 4)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  DETALHAMENTO DAS MOVIMENTAÇÕES                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  DATA       │ NOTA   │ TIPO   │ OPERAÇÃO           │ SETOR       │ QTD │ VALOR │
│  ───────────┼────────┼────────┼────────────────────┼─────────────┼─────┼───────│
│  01/12/2025 │ 123456 │ CONSUMO│ Req. Material      │ MANUTENÇÃO  │ -50 │ -150  │
│  01/12/2025 │ 123457 │ COMPRA │ NF Compra          │ -           │+200 │ +600  │
│  02/12/2025 │ 123458 │ CONSUMO│ Req. Material      │ PRODUÇÃO    │ -30 │  -90  │
│  03/12/2025 │ 123459 │ TRANSF │ Transf. Almox.     │ ALMOXARIF.  │ -80 │ -240  │
│  05/12/2025 │ 123460 │ CONSUMO│ Req. Material      │ ENGENHARIA  │ -25 │  -75  │
│  ...        │ ...    │ ...    │ ...                │ ...         │ ... │ ...   │
│  ───────────┼────────┼────────┼────────────────────┼─────────────┼─────┼───────│
│             │        │        │ TOTAL COMPRAS      │             │+200 │ +600  │
│             │        │        │ TOTAL CONSUMO      │             │-185 │ -555  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Colunas do detalhamento:**
- Data da movimentação
- Número da nota (NUNOTA)
- Tipo: COMPRA (entrada), CONSUMO (requisição), TRANSF (transferência)
- Descrição da operação (TGFTOP.DESCROPER)
- Setor/Departamento que requisitou (TSIGRU.NOMEGRUPO do usuário)
- Quantidade movimentada
- Valor movimentado
- Usuário responsável (quem fez a requisição)
- Observação (se houver)

---

### 2.6 RODAPÉ (Footer)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Página 1 de 3              API Sankhya Center v1.0                │
│  Relatório gerado automaticamente - Dados sujeitos a confirmação   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Arquitetura Técnica

### 3.1 Estrutura de Arquivos

**NOVO MÓDULO:** `relatorios/tgfpro/consumo`

```
src/
└── relatorios/                              # NOVO - Módulo de Relatórios
    ├── relatorios.module.ts                 # Módulo principal de relatórios
    └── tgfpro/
        └── consumo/
            ├── consumo-relatorio.module.ts  # Módulo do relatório de consumo
            ├── consumo-relatorio.controller.ts
            ├── consumo-relatorio.service.ts # Busca dados + gera PDF
            ├── dto/
            │   ├── consumo-relatorio-query.dto.ts
            │   └── consumo-relatorio-response.dto.ts
            └── utils/
                ├── pdf-generator.utils.ts   # Geração do PDF com PDFKit
                └── chart-generator.utils.ts # Geração dos gráficos
```

**Rota do Endpoint:** `GET /relatorios/tgfpro/consumo/:codprod`

### 3.2 Dependências Necessárias

```bash
npm install pdfkit @types/pdfkit --save
```

### 3.3 Serviços a Criar

#### 3.3.1 ConsumoPdfService

```typescript
@Injectable()
export class ConsumoPdfService {
  constructor(
    private readonly consumoV2Service: ConsumoV2Service,
    private readonly sankhyaApiService: SankhyaApiService,
  ) {}

  // Método principal
  async gerarRelatorioPdf(
    codprod: number,
    dataInicio: string,
    dataFim: string,
    usuario: string,
  ): Promise<Buffer>

  // Métodos auxiliares
  async fetchDadosProduto(codprod: number): Promise<ProdutoInfo>
  async fetchConsumoDiario(codprod: number, dataInicio: string, dataFim: string): Promise<ConsumoDiario[]>
  async fetchConsumoMensal(codprod: number, dataFim: string): Promise<ConsumoMensal[]>
  async fetchConsumoPorDepartamento(codprod: number, dataInicio: string, dataFim: string): Promise<ConsumoDepartamento[]>
  async fetchMovimentacoesDetalhadas(codprod: number, dataInicio: string, dataFim: string): Promise<Movimentacao[]>
}
```

### 3.4 Endpoint no Controller

```typescript
@Get(':codprod')
@ApiOperation({
  summary: 'Gerar relatório PDF de consumo do produto',
  description: 'Gera um relatório PDF completo com histórico de consumo, gráficos e análise por departamento',
})
@ApiParam({ name: 'codprod', description: 'Código do produto', example: 3680 })
@ApiQuery({ name: 'dataInicio', required: true, example: '2025-12-01' })
@ApiQuery({ name: 'dataFim', required: true, example: '2025-12-31' })
@ApiProduces('application/pdf')
async gerarRelatorioPdf(
  @Param('codprod') codprod: number,
  @Query() query: ConsumoRelatorioQueryDto,
  @Req() req: Request,
  @Res() res: Response,
): Promise<void> {
  const usuario = req.user?.nome || 'Sistema';
  const pdfBuffer = await this.consumoRelatorioService.gerarRelatorioPdf(
    codprod,
    query.dataInicio,
    query.dataFim,
    usuario,
  );

  const filename = `consumo-produto-${codprod}-${query.dataInicio}-a-${query.dataFim}.pdf`;

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length': pdfBuffer.length,
  });

  res.send(pdfBuffer);
}
```

---

## 4. Queries SQL Necessárias

### 4.1 Dados do Produto
```sql
SELECT
    CODPROD, DESCRPROD, COMPLDESC, CODVOL, ATIVO, TIPCONTEST
FROM TGFPRO
WHERE CODPROD = :codprod
```

### 4.2 Consumo Diário (para gráfico de linha)
```sql
SELECT
    CAST(COALESCE(c.DTENTSAI, c.DTNEG) AS DATE) AS data_consumo,
    SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN ABS(i.QTDNEG) ELSE 0 END) AS qtd_saida,
    SUM(CASE WHEN i.ATUALESTOQUE > 0 THEN i.QTDNEG ELSE 0 END) AS qtd_entrada
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
WHERE i.CODPROD = :codprod
    AND c.STATUSNOTA = 'L'
    AND i.ATUALESTOQUE <> 0
    AND i.RESERVA = 'N'
    AND COALESCE(c.DTENTSAI, c.DTNEG) BETWEEN :dataInicio AND :dataFim
GROUP BY CAST(COALESCE(c.DTENTSAI, c.DTNEG) AS DATE)
ORDER BY data_consumo
```

### 4.3 Consumo Mensal (últimos 6 meses)
```sql
SELECT
    YEAR(COALESCE(c.DTENTSAI, c.DTNEG)) AS ano,
    MONTH(COALESCE(c.DTENTSAI, c.DTNEG)) AS mes,
    SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN ABS(i.QTDNEG) ELSE 0 END) AS qtd_consumo,
    SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN ABS(i.VLRTOT) ELSE 0 END) AS valor_consumo
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
WHERE i.CODPROD = :codprod
    AND c.STATUSNOTA = 'L'
    AND i.ATUALESTOQUE < 0
    AND i.RESERVA = 'N'
    AND COALESCE(c.DTENTSAI, c.DTNEG) >= DATEADD(MONTH, -6, GETDATE())
GROUP BY YEAR(COALESCE(c.DTENTSAI, c.DTNEG)), MONTH(COALESCE(c.DTENTSAI, c.DTNEG))
ORDER BY ano, mes
```

### 4.4 Consumo por Departamento (Grupo de Usuário)
```sql
SELECT
    COALESCE(g.NOMEGRUPO, 'SEM DEPARTAMENTO') AS departamento,
    g.CODGRUPO,
    SUM(ABS(i.QTDNEG)) AS qtd_consumo,
    SUM(ABS(i.VLRTOT)) AS valor_consumo,
    COUNT(DISTINCT c.NUNOTA) AS qtd_requisicoes
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
LEFT JOIN TSIUSU u ON u.CODUSU = c.CODUSUINC
LEFT JOIN TSIGRU g ON g.CODGRUPO = u.CODGRUPO
WHERE i.CODPROD = :codprod
    AND c.STATUSNOTA = 'L'
    AND i.ATUALESTOQUE < 0
    AND i.RESERVA = 'N'
    AND COALESCE(c.DTENTSAI, c.DTNEG) BETWEEN :dataInicio AND :dataFim
GROUP BY g.CODGRUPO, g.NOMEGRUPO
ORDER BY qtd_consumo DESC
```

### 4.5 Movimentações Detalhadas
```sql
SELECT
    COALESCE(c.DTENTSAI, c.DTNEG) AS data_mov,
    c.NUNOTA,
    c.TIPMOV,
    t.DESCROPER AS tipo_operacao,
    CASE WHEN i.ATUALESTOQUE < 0 THEN -i.QTDNEG ELSE i.QTDNEG END AS qtd_mov,
    CASE WHEN i.ATUALESTOQUE < 0 THEN -i.VLRTOT ELSE i.VLRTOT END AS valor_mov,
    u.NOMEUSU AS usuario,
    COALESCE(g.NOMEGRUPO, 'N/D') AS departamento,
    c.OBSERVACAO
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
LEFT JOIN TGFTOP t ON t.CODTIPOPER = c.CODTIPOPER AND t.DHALTER = (
    SELECT MAX(DHALTER) FROM TGFTOP WHERE CODTIPOPER = c.CODTIPOPER
)
LEFT JOIN TSIUSU u ON u.CODUSU = c.CODUSUINC
LEFT JOIN TSIGRU g ON g.CODGRUPO = u.CODGRUPO
WHERE i.CODPROD = :codprod
    AND c.STATUSNOTA = 'L'
    AND i.ATUALESTOQUE <> 0
    AND i.RESERVA = 'N'
    AND COALESCE(c.DTENTSAI, c.DTNEG) BETWEEN :dataInicio AND :dataFim
ORDER BY data_mov DESC, c.NUNOTA DESC
```

---

## 5. Checklist de Implementação (Modo Ralph Loop)

### Fase 1: Configuração e Estrutura
- [ ] **TASK-001:** Instalar dependência `pdfkit` e `@types/pdfkit`
- [ ] **TASK-002:** Criar pasta `src/relatorios/`
- [ ] **TASK-003:** Criar `src/relatorios/relatorios.module.ts` (módulo principal)
- [ ] **TASK-004:** Criar pasta `src/relatorios/tgfpro/consumo/`
- [ ] **TASK-005:** Registrar RelatoriosModule no AppModule

### Fase 2: DTOs e Interfaces
- [ ] **TASK-006:** Criar `dto/consumo-relatorio-query.dto.ts` (dataInicio, dataFim)
- [ ] **TASK-007:** Criar `dto/consumo-relatorio-response.dto.ts` (metadados do PDF)
- [ ] **TASK-008:** Criar interfaces para dados do relatório (ProdutoInfo, ConsumoDiario, etc.)

### Fase 3: Serviço de Dados
- [ ] **TASK-009:** Criar `consumo-relatorio.service.ts` (estrutura base)
- [ ] **TASK-010:** Implementar `fetchDadosProduto()` - buscar TGFPRO
- [ ] **TASK-011:** Implementar `fetchResumoConsumo()` - saldos e totais
- [ ] **TASK-012:** Implementar `fetchConsumoDiario()` - dados para gráfico de linha
- [ ] **TASK-013:** Implementar `fetchConsumoMensal()` - últimos 6 meses
- [ ] **TASK-014:** Implementar `fetchConsumoPorDepartamento()` - agrupado por TSIGRU
- [ ] **TASK-015:** Implementar `fetchMovimentacoesDetalhadas()` - lista de requisições

### Fase 4: Utilitários de Geração PDF
- [ ] **TASK-016:** Criar `utils/pdf-generator.utils.ts` (classe PDFGenerator)
- [ ] **TASK-017:** Implementar método `criarCabecalho()` - header do PDF
- [ ] **TASK-018:** Implementar método `criarSecaoProduto()` - dados do produto
- [ ] **TASK-019:** Implementar método `criarResumoConsumo()` - box com métricas
- [ ] **TASK-020:** Implementar método `criarGraficoLinha()` - consumo diário
- [ ] **TASK-021:** Implementar método `criarGraficoBarras()` - consumo mensal
- [ ] **TASK-022:** Implementar método `criarTabelaDepartamentos()` - consumo por setor
- [ ] **TASK-023:** Implementar método `criarGraficoPizza()` - % por departamento
- [ ] **TASK-024:** Implementar método `criarTabelaMovimentacoes()` - detalhamento
- [ ] **TASK-025:** Implementar método `criarRodape()` - paginação

### Fase 5: Controller e Módulo
- [ ] **TASK-026:** Criar `consumo-relatorio.controller.ts` com endpoint GET
- [ ] **TASK-027:** Criar `consumo-relatorio.module.ts` registrando service e controller
- [ ] **TASK-028:** Integrar no `relatorios.module.ts`
- [ ] **TASK-029:** Configurar Swagger com ApiTags 'Relatórios - Consumo'

### Fase 6: Integração e Orquestração
- [ ] **TASK-030:** Implementar método principal `gerarRelatorioPdf()` no service
- [ ] **TASK-031:** Orquestrar busca de todos os dados necessários
- [ ] **TASK-032:** Chamar PDFGenerator para montar o documento
- [ ] **TASK-033:** Retornar Buffer do PDF

### Fase 7: Testes e Validação
- [ ] **TASK-034:** Testar endpoint com produto 3680
- [ ] **TASK-035:** Testar com período dezembro/2025
- [ ] **TASK-036:** Validar dados do cabeçalho
- [ ] **TASK-037:** Validar gráfico de linha (consumo diário)
- [ ] **TASK-038:** Validar gráfico de barras (consumo mensal)
- [ ] **TASK-039:** Validar tabela de departamentos
- [ ] **TASK-040:** Validar download e abertura do PDF
- [ ] **TASK-041:** Testar com produto sem movimentações (edge case)
- [ ] **TASK-042:** Testar com período grande (validar paginação)

---

## 6. Exemplo de Uso

### Request
```bash
curl -X GET "http://localhost:3000/relatorios/tgfpro/consumo/3680?dataInicio=2025-12-01&dataFim=2025-12-31" \
  -H "Authorization: Bearer {token}" \
  --output relatorio-consumo-3680.pdf
```

### Response
- Arquivo PDF com todas as seções descritas acima
- Nome: `consumo-produto-3680-2025-12-01-a-2025-12-31.pdf`

---

## 7. Considerações Técnicas

### 7.1 Performance
- Limitar movimentações detalhadas a 500 registros por página
- Cache dos dados de grupo/departamento
- Reutilizar dados já buscados pelo ConsumoV2Service

### 7.2 Segurança
- Validar token JWT antes de gerar relatório
- Sanitizar parâmetros de entrada
- Log de auditoria (quem gerou, quando, qual produto)

### 7.3 Formatação
- Números: formato brasileiro (1.234,56)
- Datas: dd/MM/yyyy
- Moeda: R$ 1.234,56
- Percentuais: 12,5%

---

## 8. Referências

- Endpoint existente: `GET /tgfpro/consumo-periodo-v2/:codprod`
- Service existente: `ConsumoV2Service`
- Tabelas: TGFPRO, TGFCAB, TGFITE, TGFTOP, TSIUSU, TSIGRU
