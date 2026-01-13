# 📖 Documentação - API Sankhya Center

## Índice de Documentação

Este diretório contém toda a documentação necessária para trabalhar com o database Sankhya, desde inspeção básica até queries avançadas de produção.

---

## 🤖 Agents Especializados

Temos agents especializados para ajudar no desenvolvimento:

### [TypeScript Pro](../.claude/agents/typescript-pro.md)
Especialista em TypeScript 5.0+, type systems avançados, NestJS patterns

**Quando usar**: Implementar services, DTOs, interfaces com type safety completo

### [SQL Pro](../.claude/agents/sql-pro.md)
Especialista em SQL Server, otimização de queries, Sankhya database

**Quando usar**: Escrever queries complexas, otimizar performance, analytics

📖 [Veja exemplos de uso dos agents](../.claude/agents/README.md)

---

## 📚 Guias Principais

### 1. [DATABASE-INSPECTION-GUIDE.md](./DATABASE-INSPECTION-GUIDE.md)
**Guia Completo de Inspeção do Database**

Documento principal que ensina TUDO sobre como inspecionar o database Sankhya:
- ✅ Como usar o Dicionário de Dados (TDDTAB, TDDCAM, TDDOPC, TDDPCO)
- ✅ Como usar Inspection Query API
- ✅ Como descobrir tabelas, campos e relacionamentos
- ✅ Como descobrir valores válidos de campos
- ✅ Workflow completo de descoberta
- ✅ Naming conventions do Sankhya

**Quando usar**: Sempre que precisar entender uma tabela nova ou descobrir estruturas do database.

---

### 2. [INSPECTION-QUICK-REFERENCE.md](./INSPECTION-QUICK-REFERENCE.md)
**Quick Reference - Queries Prontas**

Referência rápida com queries SQL prontas para copiar e usar:
- 🚀 Templates de autenticação
- 🚀 Queries para listar tabelas
- 🚀 Queries para listar campos
- 🚀 Queries para descobrir valores válidos
- 🚀 Queries para descobrir relacionamentos
- 🚀 Templates de JOIN comuns
- 🚀 Curl templates

**Quando usar**: Quando você já sabe o que quer fazer e precisa de uma query pronta.

---

### 3. [INSPECTION-EXAMPLES.md](./INSPECTION-EXAMPLES.md)
**Exemplos Práticos de Inspeção**

Casos de uso reais passo-a-passo mostrando como descobrir estruturas:
- 📋 Exemplo 1: Descobrir estrutura de TGFPRO
- 📋 Exemplo 2: Descobrir relacionamento CAB-ITE
- 📋 Exemplo 3: Descobrir estrutura de estoque (TGFEST)
- 📋 Exemplo 4: Calcular preço médio de um produto
- 📋 Exemplo 5: Descobrir grupos de produtos
- 📋 Exemplo 6: Descobrir tabelas adicionais
- 📋 Checklist completo de descoberta

**Quando usar**: Quando você está aprendendo o processo ou trabalhando em algo similar aos exemplos.

---

### 4. [PRODUCTS-MODULE-COMPLETE.md](./PRODUCTS-MODULE-COMPLETE.md)
**Guia Completo do Módulo de Produtos (TGFPRO/TGFPRO2)**

Documentação massiva e detalhada do módulo de produtos:
- 📊 Arquitetura completa do database
- 🗂️ Modelo de dados com 200+ campos documentados
- 📝 Valores válidos e enums descobertos
- 🔗 Relacionamentos entre tabelas
- 💻 Queries essenciais e avançadas
- 📈 Estratégias de precificação
- 🎯 KPIs e dashboard analytics
- ⚙️ Implementation patterns para NestJS

**Quando usar**: Referência completa para desenvolver qualquer feature relacionada a produtos.

---

## 📁 Arquivos SQL

### [../TGFPRO2-IMPLEMENTATION-GUIDE.md](../TGFPRO2-IMPLEMENTATION-GUIDE.md)
**Guia de Implementação TGFPRO2**

Documentação específica sobre:
- Como trabalhar com produtos
- TIPMOV e STATUSNOTA
- Estratégias de cálculo de preço
- Estrutura de locais
- Como testar queries via `/inspection/query`

---

### [../sql/06_tgfpro_queries_production.sql](../../sql/06_tgfpro_queries_production.sql)
**Queries de Produção - TGFPRO**

12 queries prontas para produção descobertas via dicionário:
1. Listagem básica de produtos ativos
2. Produtos com informações de preço
3. Produtos por grupo
4. Produtos com estoque detalhado por local
5. Produtos com última compra
6. Produtos com preço médio ponderado
7. Histórico de compras de um produto
8. Produtos sem estoque
9. Produtos abaixo do estoque mínimo
10. Resumo geral por grupo
11. Produtos com movimentação recente
12. Dashboard KPIs completo

---

## 🔄 Workflow Recomendado

### Para Entender uma Nova Tabela

```
1. DATABASE-INSPECTION-GUIDE.md
   ↓ (Ler seções: "Como Inspecionar Tabelas" e "Como Inspecionar Campos")

2. INSPECTION-QUICK-REFERENCE.md
   ↓ (Copiar queries da seção "Tabelas do Dicionário")

3. Executar queries via /inspection/query
   ↓

4. INSPECTION-EXAMPLES.md
   ↓ (Seguir exemplo similar ao seu caso)

5. Documentar descobertas
```

### Para Construir uma Nova Query

```
1. INSPECTION-QUICK-REFERENCE.md
   ↓ (Descobrir campos disponíveis)

2. Verificar valores válidos (TDDOPC)
   ↓

3. Identificar relacionamentos
   ↓

4. Testar com TOP 10
   ↓

5. Ajustar e documentar
```

### Para Implementar um Novo Módulo (ex: TGFPRO2)

```
1. DATABASE-INSPECTION-GUIDE.md
   ↓ (Entender workflow completo)

2. INSPECTION-EXAMPLES.md
   ↓ (Seguir exemplo passo-a-passo)

3. Descobrir estrutura via dicionário
   ↓

4. Criar queries SQL de produção
   ↓ (Usar como base: 06_tgfpro_queries_production.sql)

5. Testar queries via /inspection/query
   ↓

6. Implementar service e controller NestJS
   ↓

7. Documentar (criar guide como TGFPRO2-IMPLEMENTATION-GUIDE.md)
```

---

## 🛠️ Ferramentas Disponíveis

### 1. API de Dicionário

```bash
# Listar todas as tabelas
GET http://localhost:3100/dicionario/tabelas

# Detalhes de uma tabela
GET http://localhost:3100/dicionario/tabelas/TGFPRO

# Campos de uma tabela
GET http://localhost:3100/dicionario/campos/tabela/TGFPRO
```

### 2. Inspection Query API

```bash
# Obter token
POST http://localhost:3100/auth/login
{
  "username": "CONVIDADO",
  "password": "guest123"
}

# Executar query
POST http://localhost:3100/inspection/query
Authorization: Bearer {token}
{
  "query": "SELECT ... FROM ... WHERE ..."
}
```

### 3. Tabelas do Dicionário

```sql
-- Tabelas
SELECT * FROM TDDTAB WITH (NOLOCK) WHERE NOMETAB = 'TGFPRO'

-- Campos
SELECT * FROM TDDCAM WITH (NOLOCK) WHERE NOMETAB = 'TGFPRO'

-- Opções válidas
SELECT * FROM TDDOPC WITH (NOLOCK) WHERE NUCAMPO = 12345

-- Propriedades
SELECT * FROM TDDPCO WITH (NOLOCK) WHERE NUCAMPO = 12345
```

---

## 📖 Conceitos Importantes

### Naming Conventions Sankhya

- `TGF*` = Tabelas Gerais de Faturamento
- `TDD*` = Tabelas de Dicionário de Dados
- `CAB` = Cabeçalho
- `ITE` = Item
- `COD*` = Código (geralmente FK)
- `DESCR*` = Descrição
- `DT*` = Data
- `VLR*` = Valor
- `QTD*` = Quantidade
- `NU*` = Número único

### Tipos de Campo (TIPCAMPO)

- `I` = Integer
- `S` = String
- `F` = Float
- `H` = DateTime
- `B` = Binary
- `C` = Character

### Padrões Comuns

**CAB-ITE (Cabeçalho-Item)**:
```sql
TGFCAB (Cabeçalho) ←NUNOTA→ TGFITE (Itens)
```

**Produto-Estoque-Local**:
```sql
TGFPRO ←CODPROD→ TGFEST ←CODLOCAL→ TGFLOC
```

**Produto-Grupo**:
```sql
TGFPRO ←CODGRUPOPROD→ TGFGRU
```

---

## 🎯 Melhores Práticas

### Performance

- ✅ Sempre use `WITH (NOLOCK)` em queries de leitura
- ✅ Use `TOP N` para limitar resultados
- ✅ Especifique campos explicitamente (nunca `SELECT *`)
- ✅ Use índices em WHERE quando disponível

### Segurança

- ✅ Sempre filtre por `ATIVO = 'S'` quando disponível
- ✅ Use `STATUSNOTA = 'L'` para movimentações aprovadas
- ✅ Evite campos binários (IMAGEM, etc)
- ✅ Valide valores de input contra TDDOPC

### Organização

- ✅ Documente campos descobertos em comentários SQL
- ✅ Crie queries reutilizáveis para relacionamentos comuns
- ✅ Mantenha lista de valores válidos documentada
- ✅ Use workflow de descoberta consistente

---

## 🔍 Checklist Rápido

Ao trabalhar com uma nova tabela:

- [ ] Verificar se tabela existe (TDDTAB)
- [ ] Listar todos os campos (TDDCAM)
- [ ] Identificar chave primária
- [ ] Descobrir campos com opções (TDDOPC)
- [ ] Identificar possíveis FKs (COD*)
- [ ] Buscar campos ocultos (TDDPCO)
- [ ] Testar query com TOP 10
- [ ] Documentar descobertas

---

## 📞 Referências Externas

- [Código base antigo](../archive/api-old/) - Implementações antigas para referência
- [Test API Guide](../archive/api-old/TEST-API-GUIDE.md) - Como testar com curl

---

## 🚀 Quick Start

### 1. Descobrir estrutura de uma tabela

```bash
# 1. Obter token
TOKEN=$(curl -s -X POST http://localhost:3100/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"CONVIDADO","password":"guest123"}' \
  | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# 2. Listar campos
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT NOMECAMPO, DESCRCAMPO, TIPCAMPO FROM TDDCAM WITH (NOLOCK) WHERE NOMETAB = '\''TGFPRO'\'' ORDER BY ORDEM"
  }'
```

### 2. Testar uma query simples

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT TOP 5 CODPROD, DESCRPROD, ATIVO FROM TGFPRO WITH (NOLOCK) WHERE ATIVO = '\''S'\''"
  }'
```

---

**Última atualização**: 2026-01-13

**Versão**: 1.0

**Autor**: Carlos Home Team

**Suporte**: Consulte os guias acima ou verifique exemplos práticos
