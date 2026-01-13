# Entendimento Completo do Estoque Sankhya (TGFEST)

Este documento explica o módulo de estoque da API Sankhya, baseado na tabela TGFEST, incluindo estrutura, campos, relações e como usar via API.

## Visão Geral

TGFEST armazena informações de estoque de produtos no Sankhya. Cada registro representa o estoque de um produto em um local/empresa específico.

## Estrutura da Tabela

- **Nome da Tabela**: TGFEST
- **Chave Primária**: CODEMP (Empresa), CODPROD (Produto), CODLOCAL (Local), CONTROLE (Controle), CODPARC (Parceiro), TIPO (Tipo)
- **Campos Principais**:
  - CODEMP: Código da empresa (smallint)
  - CODLOCAL: Código do local (int)
  - CODPROD: Código do produto (int)
  - CONTROLE: Controle do lote (char(11))
  - RESERVADO: Quantidade reservada (float)
  - ESTMIN/ESTMAX: Estoque mínimo/máximo (float)
  - CODBARRA: Código de barras (varchar(25))
  - ATIVO: Produto ativo (char(1): 'S'/'N')
  - DTVAL: Data de validade (datetime)
  - TIPO: Tipo de estoque (char(1): 'P' padrão)
  - CODPARC: Código do parceiro (int)
  - ESTOQUE: Quantidade atual (float)
  - Outros: PERCPUREZA, PERCGERMIN, DTFABRICACAO, STATUSLOTE, MD5PAF, DTENTRADA, QTDPEDPENDENT, WMSBLOQUEADO, PERCVC, CODAGREGACAO

## Relações

TGFEST se relaciona com:

- **TGFPRO** (CODPROD): Produto (DESCRPROD)
- **TGFEMP** (CODEMP): Empresa (NOMEFANTASIA)
- **TGFLOC** (CODLOCAL): Local (NOME)
- **TGFPAR** (CODPARC): Parceiro (NOMPARC)

## Como Usar a API

### Endpoint

- **GET /tgfest**: Lista estoques com filtros/paginação.
- **GET /tgfest/:codemp/:codprod/:codlocal/:controle/:codparc/:tipo**: Busca estoque específico pela PK composta.

### Filtros Disponíveis (DTO)

- codemp: Filtrar por empresa
- codlocal: Filtrar por local
- codprod: Filtrar por produto
- controle: Filtrar por controle
- codparc: Filtrar por parceiro
- tipo: Filtrar por tipo
- estmin/estmax: Filtrar por estoque mínimo/máximo
- ativo: Filtrar por ativo ('S'/'N')
- estoqueMax: Filtrar produtos com estoque <= valor (ex: 5 para estoque baixo)
- page/perPage/sort/fields: Paginação e ordenação

### Exemplos de Uso

#### Listar Estoques de um Produto

```
GET /tgfest?codprod=1979&page=1&perPage=10
```

#### Buscar Estoque Específico

```
GET /tgfest/1/1979/1/ /0/P
```

## Tipos de Estoque

Existem vários tipos de estoque, cada um adequado a necessidades específicas:

### 1. Estoque Consignado

- **Características**: Mantido por terceiros (fornecedores/fabricantes) via contrato de consignação.
- **Uso**: Liberação mediante compra do cliente final.
- **Vantagens**: Agiliza distribuição, expande vendas (comum em e-commerce).

### 2. Estoque de Antecipação

- **Características**: Garante produtos com fornecimento flutuante ou demanda sazonal.
- **Uso**: Datas comemorativas (Natal, Páscoa), férias, volta às aulas.
- **Vantagens**: Evita faltas em períodos de alta demanda.

### 3. Estoque Mínimo

- **Características**: Quantidade mínima para emergências, cobrindo demanda até nova entrega.
- **Uso**: Empresas com demanda conhecida, pedidos de compra.
- **Vantagens**: Controle rigoroso; adequado para varejo ou indústria.

### 4. Estoque de Proteção

- **Características**: Margem de segurança contra demandas excessivas ou falhas de fornecimento.
- **Uso**: Prevenção de greves, mudanças legislativas, variações de preço.
- **Vantagens**: Reduz riscos; compensa inflação em matérias-primas.

### 5. Estoque de Ciclo

- **Características**: Armazena produtos por etapas do ciclo produtivo/vendas.
- **Uso**: Setores com ciclos sazonais (ex: moda por estação).
- **Vantagens**: Suporte a variações; atenção para não acumular excesso.

**Como Escolher?** Avalie segmento, espaço físico, sazonalidade, relação com fornecedores. Mantenha estoque equilibrado (não excessivo nem insuficiente).

## Métodos de Controle de Estoque

### PEPS (Primeiro a Entrar, Primeiro a Sair – FIFO)

- **Ideal para**: Produtos perecíveis (alimentos, medicamentos).
- **Funcionamento**: Itens mais antigos saem primeiro.
- **Benefícios**: Evita perdas, mantém qualidade.

### UEPS (Último a Entrar, Primeiro a Sair – LIFO)

- **Ideal para**: Produtos não perecíveis com variações de preço.
- **Funcionamento**: Itens mais recentes saem primeiro.
- **Nota**: Não aceito fiscalmente no Brasil.

### Custo Médio

- **Ideal para**: Grandes volumes de itens similares (atacadistas).
- **Funcionamento**: Média ponderada dos custos.
- **Benefícios**: Facilita controle e precificação.

### Curva ABC

- **Funcionamento**: Classifica produtos por importância:
  - **A**: Alto valor/giro (foco principal).
  - **B**: Intermediário.
  - **C**: Menor valor/giro.
- **Benefícios**: Otimiza recursos nos itens mais impactantes.

### Just in Time

- **Ideal para**: Processos bem definidos, fornecedores confiáveis.
- **Funcionamento**: Estoque mínimo, reposição sincronizada à demanda.
- **Benefícios**: Reduz custos de armazenagem, aumenta eficiência.

### Giro de Estoque

- **Indicador**: Quantas vezes o estoque é renovado por período.
- **Interpretação**: Alto giro = eficiência; baixo giro = excesso/perdas.

**Recomendação**: Combine métodos conforme perfil do negócio. ERP Sankhya automatiza esses controles.

## Controle de Estoque x Capital de Giro

- **Capital de Giro**: Reserva para operações curtas; fórmula: (Contas a Receber + Estoque) - Contas a Pagar.
- **Relação**: Estoque é ativo transformável em dinheiro; bom controle evita imobilização excessiva.

## Como Fazer Controle Eficiente

1. **Organize Espaço Físico**: Considere particularidades, acesso, limpeza.
2. **Faça Inventário**: Documente com data, mantenha backups.
3. **Use Fichas de Estoque (Kardex)**: Descrição, unidade, mínimo, localização, datas/qtd/valor/custo/saldo.

## Entendimento Completo

- **Estoque Atual**: Campo ESTOQUE indica quantidade disponível.
- **Reservado**: RESERVADO subtrai do disponível.
- **Lotes**: CONTROLE identifica lotes específicos.
- **Validade**: DTVAL para produtos com prazo.
- **Ativo**: Apenas estoques de produtos ativos (TGFPRO.ATIVO='S').
- **Relações Aninhadas**: Respostas incluem objetos de TGFPRO, TGFEMP, etc. (ex: tgfpro: { codprod, descrprod }).

## Insights dos Dados Investigados

- **Total de Registros**: ~26.564 estoques na empresa 7, local 101001.
- **Estoque Baixo**: ~23.628 produtos com estoque <=5 (muitos com 0-3 unidades).
- **Configuração Padrão**: ESTMIN/ESTMAX=0, ATIVO='S', TIPO='P', CONTROLE='', CODPARC=0.
- **Produtos Específicos**:
  - CODPROD 15253: Estoque 1, sem reservas.
  - Produtos com estoque 0: Ex: 13918 (precisa reposição).
- **Distribuição**: Maioria com estoque pequeno, indicando necessidade de monitoramento.

## Dicas para Desenvolvimento

- Use filtros como `estoqueMax=5` para alertas de baixo estoque.
- Para estoque total de um produto, some ESTOQUE de todos registros (por local/empresa).
- Verifique ATIVO='S' para estoques ativos.
- Campos padrão: ESTMIN/ESTMAX=0, ATIVO='S', TIPO='P'.

## Ferramentas para Controle de Estoque

Para um bom controle de estoque, além da API Sankhya, considere estas ferramentas:

### 1. Planilha de Controle de Estoque

- **Descrição**: Planilha Excel para organizar inventário básico.
- **Uso**: Registre características, quantidades, preços, armazenagem.
- **Vantagens**: Barata, para pequenas empresas sem ERP.
- **Limitações**: Manual, propenso a erros, não escala.

### 2. Planilha de Andamento de Estoque

- **Descrição**: Acompanha fluxo de entrada/saída, datas de movimentação.
- **Uso**: Monitore padrões de renovação, itens envelhecendo/faltando.
- **Vantagens**: Mostra tempo médio de permanência.
- **Limitações**: Requer atualização manual, erros humanos.

### 3. ERP – Sistema Integrado de Gestão (como Sankhya)

- **Descrição**: Sistema automatizado para centralizar dados e integrar setores.
- **Benefícios com Sankhya**:
  - Controle preciso de disponibilidade e divergências físico vs. controlado.
  - Estimação de custos, rastreio de desperdícios.
  - Agilidade em separação/carga, localização de produtos.
  - Dados para promoções, consignação, capital de giro.
  - Redução de perdas (furtos, falhas).
  - Apuração exata para inventários.
  - Precificação baseada em dados.
  - Otimização de espaço e análise de novos produtos.
  - Suporte a WMS para eficiência em armazéns (recebimento, separação, conferência, inventário).
- **Integração com API**: Nossa API expõe TGFEST para automação via apps/planilhas.

Use a API Sankhya para integrar com essas ferramentas, automatizando updates e reduzindo erros manuais.

## Testes

- Build: `pnpm build` (25/25 passed)
- Testes: `pnpm test`

Este módulo permite controle completo de estoques no Sankhya, integrado com produtos e locais.
