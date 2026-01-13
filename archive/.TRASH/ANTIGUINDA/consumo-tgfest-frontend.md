# Consumo do módulo TGFEST (Estoque) via Frontend

## Endpoints principais

- **Pesquisa poderosa (busca global):**
  - `GET /sankhya/tgfest?search=palavra`
  - Retorna todos os itens de estoque cujo produto corresponde ao termo informado (busca por código, descrição, referência, marca, etc). Ideal para quando o usuário digita qualquer coisa no campo de busca.

- **Listar estoque paginado:**
  - `GET /sankhya/tgfest?perPage=10&page=1`
  - Retorna os últimos produtos cadastrados ou movimentados no estoque (ordem decrescente de cadastro/movimentação), cada um com dados completos do produto (`tgfpro`).

- **Filtrar por produto:**
  - `GET /sankhya/tgfest?codprod=12345`
  - Retorna estoque apenas do produto informado.

- **Filtros avançados (por campos do produto):**
  - `GET /sankhya/tgfest?descrprod=PARAFUSO&marca=GENERICO&codgrupoprod=20102`
  - Permite buscar por descrição, marca, grupo, etc.

- **Buscar por chave composta:**
  - `GET /sankhya/tgfest/:codemp/:codprod/:codlocal/:controle/:codparc/:tipo`
  - Retorna um item de estoque específico.

## Exemplo de resposta

```json
{
  "data": [
    {
      "codemp": 7,
      "nome_empresa": "EMPRESA EXEMPLO LTDA",
      "codlocal": 101001,
      "nome_local": "ALMOXARIFADO CENTRAL",
      "codprod": 15253,
      ...,
      "tgfpro": {
        "codprod": 15253,
        "descrprod": "TOMADA DE FORÇA TAKARADA 902411",
        "codgrupoprod": 20102,
        "descgrupoprod": "TRANSMISSÃO E TOMADA DE FORÇA",
        "marca": "TAKARADA"
      }
    }
  ],
  "total": 26621,
  "page": 1,
  "perPage": 10,
  "lastPage": 2663,
  "hasMore": true
}
```

## Autenticação

- Todos os endpoints exigem JWT Bearer Token no header:
  - `Authorization: Bearer <token>`

## Dicas para o frontend

- Sempre exiba `tgfpro.descrprod` e `tgfpro.marca` para fácil identificação.
- Use filtros combinados para buscas avançadas.
- Paginação: use os campos `page`, `perPage`, `total`, `lastPage` para navegação.
- Para dashboards, utilize endpoints agregados (saldo por grupo, curva ABC, etc) conforme forem expostos.

## Exemplos de uso com fetch (JS)

```js
// Listar estoque
fetch('/sankhya/tgfest?perPage=10&page=1', {
  headers: { Authorization: 'Bearer <token>' },
})
  .then((r) => r.json())
  .then(console.log)

// Filtrar por descrição
fetch('/sankhya/tgfest?descrprod=PARAFUSO', {
  headers: { Authorization: 'Bearer <token>' },
})
  .then((r) => r.json())
  .then(console.log)
```

Consulte a documentação Swagger para mais detalhes de parâmetros e respostas.
