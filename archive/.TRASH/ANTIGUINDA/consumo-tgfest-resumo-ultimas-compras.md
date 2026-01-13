# Consumo do Endpoint de Resumo de Estoque e Últimas Compras

Este documento explica como consumir o endpoint `/sankhya/tgfest/resumo-ultimas-compras` da API, que retorna um resumo de estoque dos produtos, incluindo informações da última compra.

## Endpoint

```
GET /sankhya/tgfest/resumo-ultimas-compras
```

### Parâmetros de Query

- `page` (opcional): número da página (padrão: 1)
- `perPage` (opcional): itens por página (padrão: 50)

Exemplo:

```
GET /sankhya/tgfest/resumo-ultimas-compras?page=1&perPage=10
```

## Autenticação

Este endpoint requer autenticação JWT. Inclua o token no header:

```
Authorization: Bearer <seu_token_jwt>
```

## Exemplo de Requisição (fetch)

```js
fetch(
  'https://<sua-api>/sankhya/tgfest/resumo-ultimas-compras?page=1&perPage=10',
  {
    headers: {
      Authorization: 'Bearer SEU_TOKEN_JWT',
    },
  },
)
  .then((res) => res.json())
  .then((data) => console.log(data))
```

## Exemplo de Resposta

```json
{
  "data": [
    {
      "codprod": 2572,
      "descrprod": "COPO DESCARTAVEL",
      "codgrupoprod": 20301,
      "descrgrupoprod": "COPA E COZINHA",
      "estoque": 22500,
      "data_ultima_compra": "2023-04-25T00:00:00.000Z",
      "preco_ultima_compra": 0.0435,
      "nota_ultima_compra": 48295,
      "fornecedor_ultima_compra": 201
    }
  ],
  "total": 50,
  "page": 1,
  "perPage": 10
}
```

## Campos Retornados

- `codprod`: Código do produto
- `descrprod`: Descrição do produto
- `codgrupoprod`: Código do grupo
- `descrgrupoprod`: Nome do grupo
- `estoque`: Quantidade em estoque
- `data_ultima_compra`: Data da última compra
- `preco_ultima_compra`: Preço unitário da última compra
- `nota_ultima_compra`: Número da nota da última compra
- `fornecedor_ultima_compra`: Código do fornecedor da última compra

## Observações

- O endpoint suporta paginação.
- Sempre envie o token JWT válido.
- Os campos retornados podem variar conforme a base de dados.

---

Dúvidas? Consulte a documentação Swagger em `/api` ou entre em contato com o backend.
