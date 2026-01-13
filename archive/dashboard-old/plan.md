# Plano de Integração com API Sankhya Center

## Visão Geral

Este documento descreve como o front-end deve integrar com a API Sankhya Center para autenticação, busca de produtos, consumo de estoque e dashboards.

## Autenticação

### Login

**Endpoint:** `POST /auth/login`

**Headers:**

- `Content-Type: application/json`

**Body:**

```json
{
  "username": "CONVIDADO",
  "password": "guest123"
}
```

**Resposta de Sucesso:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Exemplo com cURL:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "CONVIDADO", "password": "guest123"}'
```

### Uso do Token

Para todas as requisições autenticadas, inclua o header:

```
Authorization: Bearer {access_token}
```

O token expira em 1 hora. Implemente refresh automático ou relogin quando necessário.

## Rotas Principais

### Produtos

#### Buscar Produto por Código

**Endpoint:** `GET /tgfpro/{codprod}`

**Exemplo:**

```bash
curl -X GET "http://localhost:3000/tgfpro/3680" \
  -H "Authorization: Bearer {token}"
```

#### Buscar Produtos com Filtros

**Endpoint:** `GET /tgfpro`

**Query Params:**

- `page`: Página (padrão: 1)
- `perPage`: Itens por página (padrão: 10)
- `descrprod`: Filtro por descrição
- `codgrupoprod`: Filtro por grupo
- `includeEstoque`: Incluir estoque ('S' para sim)

**Exemplo:**

```bash
curl -X GET "http://localhost:3000/tgfpro?page=1&perPage=20&descrprod=papel" \
  -H "Authorization: Bearer {token}"
```

#### Busca Avançada

**Endpoint:** `GET /tgfpro/search/{termo}`

**Exemplo:**

```bash
curl -X GET "http://localhost:3000/tgfpro/search/papel" \
  -H "Authorization: Bearer {token}"
```

### Consumo de Estoque

#### Consumo Detalhado por Período (V2)

**Endpoint:** `GET /tgfpro/consumo-periodo-v2/{codprod}`

**Query Params obrigatórios:**

- `dataInicio`: Data início (YYYY-MM-DD)
- `dataFim`: Data fim (YYYY-MM-DD)
- `page`: Página (opcional, padrão: 1)
- `perPage`: Itens por página (opcional, padrão: 50)

**Exemplo:**

```bash
curl -X GET "http://localhost:3000/tgfpro/consumo-periodo-v2/3680?dataInicio=2025-12-01&dataFim=2025-12-31" \
  -H "Authorization: Bearer {token}"
```

**Resposta inclui:**

- Informações do produto
- Saldo anterior
- Movimentações detalhadas
- Métricas de consumo
- Localizações de estoque

### Dashboards

#### Dashboard de Produtos - Resumo

**Endpoint:** `GET /sankhya/dashboards/produtos/resumo`

#### Dashboard de Produtos - Filtros

**Endpoint:** `GET /sankhya/dashboards/produtos/filtros`

#### Dashboard de Produtos - Estoque Baixo

**Endpoint:** `GET /sankhya/dashboards/produtos/estoque-baixo`

#### Dashboard de RH - Estatísticas

**Endpoint:** `GET /sankhya/rh-dashboard/estatisticas`

### Dicionário de Dados

#### Listar Tabelas

**Endpoint:** `GET /dicionario/tabelas`

#### Metadados de Tabela

**Endpoint:** `GET /dicionario/metadados/{nomeTabela}`

## Integração com Front-End

### Axios Setup

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Exemplo de Uso

```javascript
import api from './api';

// Login
const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    return access_token;
  } catch (error) {
    throw new Error('Credenciais inválidas');
  }
};

// Buscar produtos
const buscarProdutos = async (filtros = {}) => {
  try {
    const response = await api.get('/tgfpro', { params: filtros });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
};

// Obter consumo
const obterConsumo = async (codprod, dataInicio, dataFim) => {
  try {
    const response = await api.get(`/tgfpro/consumo-periodo-v2/${codprod}`, {
      params: { dataInicio, dataFim },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao obter consumo:', error);
    throw error;
  }
};
```

## Tratamento de Erros

### Códigos de Status Comuns

- **200**: Sucesso
- **400**: Bad Request (dados inválidos)
- **401**: Unauthorized (token inválido/expirado)
- **403**: Forbidden (acesso negado)
- **404**: Not Found
- **500**: Internal Server Error

### Estrutura de Erro

```json
{
  "statusCode": 403,
  "timestamp": "2026-01-11T12:39:33.238Z",
  "path": "/tgfpro/consumo-periodo-v2/3680",
  "error": "Erro ao validar token: invalid signature"
}
```

## Desenvolvimento e Testes

### Ambiente Local

- **API:** http://localhost:3000
- **Front-end:** http://localhost:5174
- **Swagger:** http://localhost:3000/api

### Credenciais de Teste

- **Username:** CONVIDADO
- **Password:** guest123

### Produto de Exemplo

- **Código:** 3680
- **Descrição:** PAPEL SULFITE A4 500 FOLHAS

## Próximos Passos

1. Implementar autenticação no front-end
2. Criar páginas para listagem de produtos
3. Implementar busca e filtros
4. Desenvolver visualização de consumo
5. Integrar dashboards
6. Adicionar tratamento de erros e loading states
