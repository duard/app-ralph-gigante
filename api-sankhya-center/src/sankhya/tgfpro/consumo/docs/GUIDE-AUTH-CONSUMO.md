# Guia de Autenticação e Teste da API Sankhya Center

Este guia explica como usar autenticação, inspect query e testar o serviço de consumo V2.

## 📋 Pré-requisitos

- Node.js instalado
- Serviço da API rodando em `http://localhost:3000`
- Credenciais válidas do Sankhya (padrão: CONVIDADO/guest123)

## 🔐 Padrão de Autenticação

### 1. Login para obter token

```bash
POST /auth/login
Content-Type: application/json

{
  "username": "CONVIDADO",
  "password": "guest123"
}
```

**Resposta:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### 2. Usar token em requisições

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

O token é válido por 1 hora e renovado automaticamente pelo sistema.

## 🔍 Inspect Query para Estudos

### Schema de tabelas

```bash
GET /inspection/table-schema?tableName=TGFPRO
```

### Executar queries SQL

```bash
POST /inspection/query
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "SELECT TOP 10 CODPROD, DESCRPROD FROM TGFPRO ORDER BY CODPROD DESC",
  "params": []
}
```

### Queries úteis para estudo

**Verificar produtos com controle de estoque:**

```sql
SELECT TOP 5 CODPROD, DESCRPROD, TIPCONTEST
FROM TGFPRO
WHERE TIPCONTEST IS NOT NULL
ORDER BY CODPROD
```

**Verificar tipos de operação:**

```sql
SELECT TOP 3 CODTIPOPER, DESCROPER, ATUALEST
FROM TGFTOP
ORDER BY CODTIPOPER
```

**Verificar movimentações recentes:**

```sql
SELECT TOP 3 NUNOTA, CODPROD, DTNEG, TIPMOV
FROM TGFCAB
WHERE STATUSNOTA = 'L'
ORDER BY NUNOTA DESC
```

## 🛒 Testar Consumo V2

### Endpoint principal

```bash
GET /tgfpro/consumo-periodo-v2/{codprod}?dataInicio=2025-12-01&dataFim=2025-12-31&page=1&perPage=50
Authorization: Bearer <token>
```

### Exemplo completo

```bash
GET /tgfpro/consumo-periodo-v2/3680?dataInicio=2025-12-01&dataFim=2025-12-31&page=1&perPage=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚀 Script de Teste Automático

### Executar testes completos

```bash
# Instalar dependências se necessário
npm install axios

# Executar script de teste
node test-sankhya-consumo.js
```

O script executa automaticamente:

1. ✅ Autenticação e obtenção de token
2. ✅ Inspect queries para estudo das tabelas
3. ✅ Teste completo do endpoint de consumo V2

### Personalizar o script

Edite `test-sankhya-consumo.js` para alterar:

**URL base:**

```javascript
const BASE_URL = 'http://localhost:3000' // Altere para sua URL
```

**Credenciais:**

```javascript
const USERNAME = 'CONVIDADO'
const PASSWORD = 'guest123'
```

**Parâmetros de teste:**

```javascript
const codprod = 3680 // Código do produto
const dataInicio = '2025-12-01'
const dataFim = '2025-12-31'
```

## 📊 Estrutura do Consumo V2

O serviço de consumo V2 retorna:

### Produto completo

- Informações básicas (CODPROD, DESCRPROD)
- Dados complementares (COMPLDESC, CODVOL)
- Tipo de controle (TIPCONTEST)

### Movimentações detalhadas

- Dados da nota fiscal (NUNOTA, DTNEG, DTENTSAI)
- Tipo de operação (TGFTOP com descrição)
- Controle (lote/série)
- Observações (nota e item)
- Status de pendências

### Métricas expandidas

- Total de entradas e saídas (quantidade e valor)
- Percentual de consumo
- Média de consumo por dia
- Dias de estoque disponível

### Saldos e localizações

- Saldo anterior e atual
- Localizações de estoque com controle
- Valores formatados em BRL

## ⚠️ Limitações Importantes

### Queries SQL

- Apenas `SELECT` é permitido
- `SELECT *` não é permitido (especifique campos)
- Campos binários grandes são proibidos (IMAGEM, FOTO, BLOB)
- `ORDER BY DTCREATED` pode falhar - use `ORDER BY ID DESC`

### Performance

- Use `TOP N` para limitar resultados
- Evite campos muito grandes em queries
- Prefira índices existentes (CODPROD, NUNOTA, ID)

## 🔧 Arquitetura do Módulo de Consumo

```
src/sankhya/tgfpro/consumo/
├── consumo.controller.ts      # Endpoints v1 e v2
├── consumo.service.ts         # Lógica v1 (básica)
├── consumo-v2.service.ts      # Lógica v2 (completa)
├── dto/                       # Tipos e validação
├── utils/                     # Cálculos reutilizáveis
└── docs/                      # Documentação
```

### Integração

- V2 reutiliza métodos do v1 para evitar duplicação
- `ConsumoCalculatorUtils` para processamento de extratos
- `SankhyaApiService` para queries SQL
- Cache de TGFTOP para performance

## 📝 Exemplos Práticos

### 1. Verificar se produto existe

```sql
SELECT CODPROD, DESCRPROD, ATIVO
FROM TGFPRO
WHERE CODPROD = 3680
```

### 2. Verificar controle de estoque

```sql
SELECT CODLOCAL, CONTROLE, ESTOQUE
FROM TGFEST
WHERE CODPROD = 3680
  AND CODPARC = 0
  AND ATIVO = 'S'
```

### 3. Verificar movimentações

```sql
SELECT TOP 10
  c.NUNOTA, c.DTNEG, c.TIPMOV,
  i.CODPROD, i.QTDNEG, i.CONTROLE
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
WHERE i.CODPROD = 3680
  AND c.STATUSNOTA = 'L'
ORDER BY c.DTNEG DESC
```

## 🆘 Troubleshooting

### Erro 401 - Não autorizado

- Verifique credenciais de login
- Token pode ter expirado (faça login novamente)

### Erro 404 - Produto não encontrado

- Use script para listar produtos disponíveis
- Verifique se CODPROD está correto

### Erro 500 - Query inválida

- Verifique sintaxe SQL
- Confirme que apenas SELECT é usado
- Especifique campos (evite SELECT \*)

### Performance lenta

- Use TOP N para limitar resultados
- Evite campos grandes (IMAGEM, etc.)
- Prefira índices existentes

## 📚 Documentação Adicional

- [Swagger UI](http://localhost:3000/api) - Documentação interativa
- [Plano de consumo](src/sankhya/tgfpro/consumo/docs/plan-consumo-por-produto.md)
- [Exemplos SQL](src/sankhya/tgfpro/consumo/exemplos/consumo-do-produto-exemplo.sql)
