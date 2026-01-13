## Visão Geral

TGFCAB é a tabela central do Sankhya ERP para cabeçalhos de notas fiscais. Representa o documento fiscal principal, que evolui para NF-e (Nota Fiscal Eletrônica) quando emitido. Cada registro contém informações completas sobre uma transação fiscal, incluindo valores, datas, partes envolvidas e configurações tributárias.

**Importância**: É o coração das operações fiscais, conectando vendas, compras, transferências e devoluções. Sem TGFCAB, não há NF-e válida.

## Esquema da Tabela

TGFCAB possui **155+ campos** (baseado na inspeção via API Sankhya). Abaixo, os campos principais categorizados:

### Identificação

- **NUNOTA** (int, PK): Número único da nota. Chave primária global.
- **CODTIPOPER** (int): Código do tipo de operação (FK para TGFTOP).
- **NUMNOTA** (int?): Número da nota fiscal (pode ser null para rascunhos).
- **SERIENOTA** (char): Série da nota (e.g., "1" para NF-e).
- **TIPMOV** (char): Tipo de movimento (V=Venda, P=Compra, D=Devolução, A=Conhecimento, O=Pedido, etc.).

### Datas

- **DTNEG** (datetime): Data de negociação.
- **DTFATUR** (datetime): Data de faturamento.
- **DTENTSAI** (datetime): Data de entrada/saída.
- **DTMOV** (datetime): Data do movimento.
- **DTALT** (datetime): Data de alteração.

### Valores Monetários

- **VLRNOTA** (money): Valor total da nota.
- **VLRSEG** (float): Valor do seguro.
- **VLRFRETE** (float): Valor do frete.
- **VLRICMS** (float): Valor do ICMS.
- **VLRIPI** (float): Valor do IPI.
- **VLRSUBST** (float): Valor de substituição tributária.
- **VLRDESCTOT** (float): Valor total de desconto.

### Partes Envolvidas

- **CODEMP** (int): Código da empresa.
- **CODPARC** (int, FK para TGFPAR): Código do parceiro (cliente/fornecedor).
- **CODVEND** (int, FK para TGFVEN): Código do vendedor.
- **CODCONTATO** (int?): Código do contato.

### Configurações Fiscais/Tributárias

- **CODNAT** (int): Código da natureza da operação.
- **CODMODDOC** (int): Código do modelo do documento (55=NF-e, 01=NFS-e).
- **CFOP** (varchar?): CFOP (Código Fiscal de Operações e Prestações).
- **BASEICMS** (float): Base de cálculo do ICMS.
- **ALIQICMS** (float): Alíquota do ICMS.
- **BASEIPI** (float): Base do IPI.
- **ALIQIPI** (float): Alíquota do IPI.

### Logística

- **CODVEICULO** (int): Código do veículo.
- **PLACAVEICULO** (char): Placa do veículo.
- **PESOBRUTO** (decimal): Peso bruto.
- **PESOLIQ** (decimal): Peso líquido.
- **QTDVOL** (int): Quantidade de volumes.
- **LOCALCOLETA** (char): Local de coleta.
- **LOCALENTREGA** (char): Local de entrega.

### Status e Controle

- **STATUSNOTA** (char): Status da nota (L=Liberada, A=Aprovada, P=Pendente).
- **APROVADO** (char): Aprovado (S/N).
- **PENDENTE** (char): Pendente (S/N).
- **RATEADO** (char): Rateado (S/N).

### Campos Adicionais (Amostra)

- **OBSERVACAO** (text): Observações.
- **CHAVENFE** (varchar): Chave da NF-e.
- **DANFE** (varchar): DANFE (Documento Auxiliar da NF-e).
- **PROTOC** (varchar): Protocolo de autorização.
- **STATUSNFE** (varchar): Status da NF-e (Autorizada, Rejeitada, etc.).

_(Para lista completa de 155+ campos, consulte a API Sankhya: `/inspection/table-schema?tableName=TGFCAB`)_

## Relações (Foreign Keys)

TGFCAB conecta-se a múltiplas tabelas para formar a NF-e completa:

1. **TGFTOP** (CODTIPOPER): Tipos de operação (Venda, Compra, etc.).
2. **TGFPAR** (CODPARC): Parceiros (clientes, fornecedores).
3. **TGFVEN** (CODVEND): Vendedores.
4. **TGFITE** (NUNOTA): Itens da nota (produtos/serviços).
5. **TGFCUS** (CODCENCUS): Centros de custo.
6. **TGFPRO** (via TGFITE): Produtos.
7. **TGFVAR** (via TGFITE): Variáveis de produto.
8. **TGFTAB** (CODTAB): Tabelas de preço.
9. **TGFLOC** (CODLOCAL): Localizações de estoque.
10. **TGFEST** (via TGFITE): Saldos de estoque.

**Diagrama Simplificado**:

```
TGFCAB (Cabeçalho)
├── TGFTOP (Operação)
├── TGFPAR (Parceiro)
├── TGFVEN (Vendedor)
└── TGFITE[] (Itens)
    ├── TGFPRO (Produto)
    ├── TGFEST (Estoque)
    └── TGFTAB (Preço)
```

## Evolução para NF-e

1. **Criação**: TGFCAB é criado via interface Sankhya ou API.
2. **Validação**: Campos fiscais validados contra regras SEFAZ.
3. **Emissão**: Integra com SEFAZ para gerar NF-e (XML via CHAVENFE).
4. **Autorização**: PROTOC e STATUSNFE atualizados.
5. **Distribuição**: DANFE gerado, eventos registrados.

**Campos Críticos para NF-e**:

- CHAVENFE: Identificador único da NF-e.
- STATUSNFE: Controle de status (100=Autorizada).
- NUMNOTA/SERIENOTA: Numeração fiscal.
- CFOP: Classificação fiscal.

## Implementação no Código

### Interface (tgfcab.interface.ts)

- 155+ campos mapeados com tipos TypeScript.
- JSDoc para cada campo principal.
- Relações aninhadas (tgftop, tgfpar, tgfven).

### DTO (tgfcab-find-all.dto.ts)

- Filtros avançados: códigos, datas, valores, status, tipmov.
- Validações com class-validator.
- Suporte a paginação, ordenação, seleção de campos.

### Serviço (tgfcab.service.ts)

- **findAll**: Query com JOINs para relações, filtros dinâmicos.
- **findById**: Query com JOINs completos.
- **mapToEntity**: Mapeamento com relações aninhadas.
- JSDoc detalhado.

### Controller (tgfcab.controller.ts)

- Endpoints: GET /tgfcab, GET /tgfcab/:nunota, GET /tgfcab/admin/test.
- Swagger ultra documentado com exemplos reais.
- Autenticação JWT, cache, validação.

### Módulo (tgfcab.module.ts)

- Dependências: SharedModule para SankhyaApiService.

## API Endpoints

### GET /tgfcab

- **Descrição**: Lista paginada de notas.
- **Query Params**: page, perPage, sort, fields, filtros avançados.
- **Exemplo**: `GET /tgfcab?page=1&perPage=5&statusnota=L&tipmov=V`
- **Resposta**: PaginatedResult<Tgfcab> com relações.

### GET /tgfcab/:nunota

- **Descrição**: Nota específica com todos os dados.
- **Exemplo**: `GET /tgfcab/273248`
- **Resposta**: Tgfcab completo.

### GET /tgfcab/admin/test

- **Descrição**: Saúde do módulo.
- **Resposta**: `{"status": "Tgfcab module is working"}`

## Testes Curl (Com Dados Reais)

### Autenticação

```bash
TOKEN=$(curl -s -X 'POST' 'http://localhost:3000/auth/login' -H 'Content-Type: application/json' -d '{"username": "CONVIDADO","password": "guest123"}' | jq -r '.access_token')
```

### findAll com Filtros

```bash
curl -X 'GET' 'http://localhost:3000/tgfcab?page=1&perPage=2&tipmov=Q&statusnota=L' -H "Authorization: Bearer $TOKEN"
# Resposta: Dados reais com paginação
```

### findById

```bash
curl -X 'GET' 'http://localhost:3000/tgfcab/273248' -H "Authorization: Bearer $TOKEN"
# Resposta: Nota completa com tgftop, tgfpar, tgfven
```

## Business Rules

- **Validação Fiscal**: Campos tributários devem seguir regras SEFAZ.
- **Sequenciamento**: NUNOTA é auto-incremento global.
- **Integração**: Vincula a TGFITE para itens, formando NF-e completa.
- **Auditoria**: DTALT e CODUSU rastreiam mudanças.

## Potenciais Expansões

- **Integração SEFAZ**: Webhooks para eventos NF-e.
- **Relatórios**: Dashboards com métricas de vendas.
- **Auditoria**: Logs de emissões.
- **Multimodais**: Suporte a CT-e, MDF-e via TIPMOV.

TGFCAB é o pilar das operações fiscais no Sankhya. Esta documentação garante implementação poderosa e completa! 🚀
