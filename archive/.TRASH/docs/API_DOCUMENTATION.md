# API Sankhya Center - Documentação Completa

## Autenticação

### POST /auth/login

- **Descrição**: Autentica o usuário na API Sankhya externa e retorna um token JWT.
- **Corpo da Requisição**:
  ```json
  {
    "username": "CONVIDADO",
    "password": "guest123"
  }
  ```
- **Exemplo cURL**:
  ```bash
  curl -X 'POST' 'http://localhost:3000/auth/login' \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{
      "username": "CONVIDADO",
      "password": "guest123"
    }'
  ```
- **Resposta de Sucesso (200)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Resposta de Sucesso (201)**: Retorna access_token e refresh_token.
- **Resposta de Erro (401)**:
  ```json
  {
    "statusCode": 401,
    "message": "Unauthorized"
  }
  ```

### POST /auth/refresh

- **Descrição**: Renova o token de acesso usando o refresh token.
- **Corpo da Requisição**:
  ```json
  {
    "refreshToken": "refresh_token_here"
  }
  ```
- **Exemplo cURL**:
  ```bash
  curl -X 'POST' 'http://localhost:3000/auth/refresh' \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{
      "refreshToken": "refresh_token_here"
    }'
  ```
- **Resposta de Sucesso (201)**:
  ```json
  {
    "access_token": "new_access_token",
    "refresh_token": "new_refresh_token"
  }
  ```
- **Resposta de Erro (401)**:
  ```json
  {
    "statusCode": 401,
    "message": "Invalid refresh token"
  }
  ```

### GET /auth/me

- **Descrição**: Retorna os dados básicos do usuário logado extraídos do token JWT.
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/auth/me' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  ```
- **Resposta de Sucesso (200)**:
  ```json
  {
    "userId": 311,
    "username": "CONVIDADO",
    "nome": "CONVIDADO",
    "email": "",
    "codemp": 0,
    "razaoSocial": "NATALIA LOCADORA                        ",
    "codfunc": 0,
    "nomeFuncionario": "",
    "cgc": "15632222000102"
  }
  ```
- **Resposta de Erro (401)**:
  ```json
  {
    "statusCode": 401,
    "error": "Unauthorized"
  }
  ```

## Perfil do Usuário

### GET /profile/me

- **Descrição**: Retorna o perfil completo do usuário logado, incluindo dados pessoais, funcionário, estrutura organizacional, gestor e empresa.
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/profile/me' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer <token>'
  ```
- **Resposta de Sucesso (200)**:
  ```json
  {
    "funcionario": {
      "CODFUNC": 393,
      "CODEMP": 1,
      "NOMEFUNC": "LEVI CELIO ALVES TOSTA",
      "funcionarioDataNascimento": "03/04/1989",
      "funcionarioIdade": 36,
      "funcionarioCPF": "104.544.696-32",
      "CELULAR": "34 9 84217117",
      "EMAIL": "levi.tosta89@gmail.com",
      "funcionarioDataAdmissao": "18/12/2025",
      "funcionarioDiasEmpresa": 8,
      "SITUACAO": "1",
      "funcionarioSituacaoDescricao": "Ativo"
    },
    "usuario": {
      "CODUSU": 446,
      "NOMEUSU": "LEVI.ALVES",
      "usuarioEmail": null,
      "FOTO": null,
      "usuarioTelefoneCorp": null
    },
    "estruturaOrganizacional": {
      "cargaHorariaDescricao": "07:00 - 11:00/12:00 - 16:00 E SABADOS 07:00 AS 11:00",
      "departamentoDescricao": "OPERAÇÃO",
      "cargoDescricao": "MOTORISTA DE CARRETA III",
      "centroResultadoDescricao": "OPERADORES"
    },
    "gestor": {
      "gestorCodigoUsuario": 10513,
      "gestorNome": "GESTOR EXEMPLO",
      "gestorEmail": "gestor@empresa.com",
      "gestorFormatado": "010513 GESTOR EXEMPLO",
      "gestorDataNascimento": "01/01/1980",
      "gestorIdade": 45,
      "gestorCPF": "123.456.789-00",
      "gestorCelular": "34 9 99999999",
      "gestorDepartamento": "GESTÃO",
      "gestorCargo": "GERENTE",
      "gestorCentroResultado": "ADMINISTRATIVO",
      "gestorDataAdmissao": "01/01/2020",
      "gestorDiasEmpresa": 2100
    },
    "empresa": {
      "CODEMP": 1,
      "NOMEFANTASIA": "GIGANTAO LOCADORA",
      "empresaCNPJ": "23.981.517/0001-04",
      "empresaFormatada": "001 GIGANTAO LOCADORA"
    }
  }
  ```
- **Resposta de Erro (401)**: Não autorizado.
- **Resposta de Erro (404)**: Perfil não encontrado.
- **Resposta de Sucesso (200)**:
  ```json
  {
    "userId": 311,
    "username": "CONVIDADO",
    "nome": "CONVIDADO",
    "email": "",
    "codemp": 0,
    "razaoSocial": "NATALIA LOCADORA                        ",
    "codfunc": 0,
    "nomeFuncionario": "",
    "cgc": "15632222000102"
  }
  ```
- **Resposta de Erro (401)**:
  ```json
  {
    "statusCode": 401,
    "error": "Unauthorized"
  }
  ```

## Inspeção Sankhya

### GET /inspection/table-schema

- **Descrição**: Obtém o schema da tabela especificada.
- **Parâmetros de Query**: `tableName` (obrigatório)
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/inspection/table-schema?tableName=TFPFUN' \
    -H 'accept: application/json'
  ```
- **Resposta de Sucesso (200)**: Lista de campos com tipos e descrições.

### GET /inspection/table-relations

- **Descrição**: Obtém as relações da tabela especificada.
- **Parâmetros de Query**: `tableName` (obrigatório)
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/inspection/table-relations?tableName=TFPFUN' \
    -H 'accept: application/json'
  ```
- **Resposta de Sucesso (200)**: Array de tabelas relacionadas.

### GET /inspection/primary-keys/:tableName

- **Descrição**: Obtém as chaves primárias da tabela.
- **Parâmetros de Path**: `tableName`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/inspection/primary-keys/TFPFUN' \
    -H 'accept: application/json'
  ```
- **Resposta de Sucesso (200)**:
  ```json
  ["CODEMP", "CODFUNC"]
  ```

### POST /inspection/query

- **Descrição**: Executa uma query SQL na base Sankhya.
- **Corpo da Requisição**:
  ```json
  {
    "query": "SELECT TOP 10 * FROM TFPFUN",
    "params": []
  }
  ```
- **Exemplo cURL**:
  ```bash
  curl -X 'POST' 'http://localhost:3000/inspection/query' \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{
      "query": "SELECT TOP 10 * FROM TFPFUN",
      "params": []
    }'
  ```
- **Resposta de Sucesso (200)**: Resultado da query em formato JSON.

## Funcionários (TFPFUN)

### GET /tfpfun

- **Descrição**: Lista funcionários com paginação, filtros e ordenação.
- **Parâmetros de Query**: page (padrão 1), perPage (padrão 10), sort (ex: "DTADM DESC"), fields (seleção de campos), nomefunc, situacao, coddep, codcargo, dtadmFrom, dtadmTo, idadeMin, idadeMax, etc.
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tfpfun?page=1&perPage=10&sort=DTADM DESC' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer <token>'
  ```
- **Resposta de Sucesso (200)**:
  ```json
  {
    "data": [
      {
        "codfunc": 393,
        "nomefunc": "LEVI CELIO ALVES TOSTA",
        "idade": 36,
        "situacaoLegivel": "Ativo",
        "tgfpar": {
          "codparc": 100173,
          "nomeparc": "LEVI CELIO ALVES TOSTA"
        },
        "empresa": {
          "codemp": 1,
          "nomefantasia": "GIGANTAO LOCADORA",
          "cnpjFormatado": "23.981.517/0001-04"
        }
      }
    ],
    "total": 1085,
    "page": 1,
    "perPage": 10,
    "lastPage": 109,
    "hasMore": true
  }
  ```

### GET /tfpfun/:codemp/:codfunc

- **Descrição**: Busca funcionário por empresa e código.
- **Parâmetros de Path**: codemp, codfunc
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tfpfun/1/393' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer <token>'
  ```
- **Resposta de Sucesso (200)**: Objeto completo do funcionário.
- **Resposta de Erro (404)**:
  ```json
  {
    "statusCode": 404,
    "message": "Not Found"
  }
  ```

### GET /tfpfun/admin/test

- **Descrição**: Teste de saúde do módulo.
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tfpfun/admin/test' \
    -H 'accept: application/json'
  ```
- **Resposta de Sucesso (200)**:
  ```json
  {
    "status": "TfpfunModule module is working"
  }
  ```

## Cargos (TFPCAR)

### GET /tfpcar

- **Descrição**: Lista cargos com contagem de funcionários.
- **Parâmetros de Query**: page, perPage, sort, descrcargo, ativo, codgrupocargo
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tfpcar?page=1&perPage=10' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer <token>'
  ```
- **Resposta de Sucesso (200)**:
  ```json
  {
    "data": [
      {
        "codcargo": 448,
        "descrcargo": "MOTORISTA DE CARRETA III",
        "ativo": "S",
        "funcionariosCount": 10
      }
    ],
    "total": 50,
    "page": 1,
    "perPage": 10,
    "lastPage": 5,
    "hasMore": true
  }
  ```

### GET /tfpcar/:codcargo

- **Descrição**: Busca cargo por código.
- **Parâmetros de Path**: codcargo
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tfpcar/448' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer <token>'
  ```
- **Resposta de Sucesso (200)**: Objeto completo do cargo.
- **Resposta de Erro (404)**: Cargo não encontrado.

### GET /tfpcar/admin/test

- **Descrição**: Teste de saúde do módulo.
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tfpcar/admin/test' \
    -H 'accept: application/json'
  ```
- **Resposta de Sucesso (200)**:
  ```json
  {
    "status": "TfpcarModule module is working"
  }
  ```

## Departamentos (TFPDEP)

### GET /tfpdep

- **Descrição**: Lista departamentos.
- **Parâmetros de Query**: page, perPage, sort, descrdep, ativo
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tfpdep?page=1&perPage=10' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer <token>'
  ```
- **Resposta de Sucesso (200)**: Lista paginada de departamentos.

### GET /tfpdep/:coddep

- **Descrição**: Busca departamento por código.
- **Parâmetros de Path**: coddep
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tfpdep/1140000' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer <token>'
  ```
- **Resposta de Sucesso (200)**: Objeto departamento.
- **Resposta de Erro (404)**: Não encontrado.

### GET /tfpdep/admin/test

- **Resposta de Sucesso (200)**:
  ```json
  {
    "status": "TfpdepModule module is working"
  }
  ```

## Parceiros (TGFPAR)

### GET /tgfpar

- **Descrição**: Lista parceiros.
- **Parâmetros de Query**: page, perPage, sort, nomeparc, codparc
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tgfpar?page=1&perPage=10' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer <token>'
  ```
- **Resposta de Sucesso (200)**: Lista paginada de parceiros.

### GET /tgfpar/:id

- **Descrição**: Busca parceiro por ID.
- **Parâmetros de Path**: id
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tgfpar/100173' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer <token>'
  ```
- **Resposta de Sucesso (200)**: Objeto parceiro.
- **Resposta de Erro (404)**: Não encontrado.

### GET /tgfpar/admin/test

- **Resposta de Sucesso (200)**:
  ```json
  {
    "status": "TgfparModule module is working"
  }
  ```

## Cabeçalhos (TGFCAB)

### GET /tgfcab

- **Descrição**: Lista cabeçalhos.
- **Parâmetros de Query**: page, perPage, sort
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tgfcab?page=1&perPage=10' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer <token>'
  ```
- **Resposta de Sucesso (200)**: Lista paginada de cabeçalhos.

### GET /tgfcab/:nunota

- **Descrição**: Busca cabeçalho por número da nota.
- **Parâmetros de Path**: nunota
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tgfcab/12345' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer <token>'
  ```
- **Resposta de Sucesso (200)**: Objeto cabeçalho.
- **Resposta de Erro (404)**: Não encontrado.

### GET /tgfcab/admin/test

- **Resposta de Sucesso (200)**:
  ```json
  {
    "status": "TgfcabModule module is working"
  }
  ```

## Tipos de Operação (TGFTOP)

### GET /tgftop

- **Descrição**: Lista tipos de operação.
- **Parâmetros de Query**: page, perPage, sort
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tgftop?page=1&perPage=10' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer <token>'
  ```
- **Resposta de Sucesso (200)**: Lista paginada de tipos de operação.

### GET /tgftop/:codtipoper

- **Descrição**: Busca tipo de operação por código.
- **Parâmetros de Path**: codtipoper
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tgftop/1' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer <token>'
  ```
- **Resposta de Sucesso (200)**: Objeto tipo de operação.
- **Resposta de Erro (404)**: Não encontrado.

### GET /tgftop/admin/test

- **Resposta de Sucesso (200)**:
  ```json
  {
    "status": "TgftopModule module is working"
  }
  ```

## Itens (TGFITE)

### GET /tgfite

- **Descrição**: Lista itens.
- **Parâmetros de Query**: page, perPage, sort
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tgfite?page=1&perPage=10' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer <token>'
  ```
- **Resposta de Sucesso (200)**: Lista paginada de itens.

### GET /tgfite/:nunota/:sequencia

- **Descrição**: Busca item por nota e sequência.
- **Parâmetros de Path**: nunota, sequencia
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tgfite/12345/1' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer <token>'
  ```
- **Resposta de Sucesso (200)**: Objeto item.
- **Resposta de Erro (404)**: Não encontrado.

### GET /tgfite/admin/test

- **Resposta de Sucesso (200)**:
  ```json
  {
    "status": "TgfiteModule module is working"
  }
  ```

## Grupos (TGFGRU)

### GET /tgfgru/admin/test

- **Descrição**: Teste de saúde do módulo.
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tgfgru/admin/test' \
    -H 'accept: application/json'
  ```
- **Resposta de Sucesso (200)**:
  ```json
  {
    "status": "TgfgruModule module is working"
  }
  ```

## Produtos (TGFPRO)

### GET /tgfpro

- **Descrição**: Lista produtos.
- **Parâmetros de Query**: page, perPage, sort
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tgfpro?page=1&perPage=10' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer <token>'
  ```
- **Resposta de Sucesso (200)**: Lista paginada de produtos.

### GET /tgfpro/:codprod

- **Descrição**: Busca produto por código.
- **Parâmetros de Path**: codprod
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tgfpro/123' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer <token>'
  ```
- **Resposta de Sucesso (200)**: Objeto produto.
- **Resposta de Erro (404)**: Não encontrado.

### GET /tgfpro/admin/test

- **Resposta de Sucesso (200)**:
  ```json
  {
    "status": "TgfproModule module is working"
  }
  ```

## Vendedores (TGFVEN)

### GET /tgfven

- **Descrição**: Lista vendedores.
- **Parâmetros de Query**: page, perPage, sort
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tgfven?page=1&perPage=10' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer <token>'
  ```
- **Resposta de Sucesso (200)**: Lista paginada de vendedores.

### GET /tgfven/:codvend

- **Descrição**: Busca vendedor por código.
- **Parâmetros de Path**: codvend
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tgfven/123' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer <token>'
  ```
- **Resposta de Sucesso (200)**: Objeto vendedor.
- **Resposta de Erro (404)**: Não encontrado.

### GET /tgfven/admin/test

- **Resposta de Sucesso (200)**:
  ```json
  {
    "status": "TgfvenModule module is working"
  }
  ```

## Tabelas (TGFTAB)

### GET /tgftab

- **Descrição**: Lista tabelas.
- **Parâmetros de Query**: page, perPage, sort
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tgftab?page=1&perPage=10' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer <token>'
  ```
- **Resposta de Sucesso (200)**: Lista paginada de tabelas.

### GET /tgftab/:codtab

- **Descrição**: Busca tabela por código.
- **Parâmetros de Path**: codtab
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Exemplo cURL**:
  ```bash
  curl -X 'GET' 'http://localhost:3000/tgftab/1' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer <token>'
  ```
- **Resposta de Sucesso (200)**: Objeto tabela.
- **Resposta de Erro (404)**: Não encontrado.

### GET /tgftab/admin/test

- **Resposta de Sucesso (200)**:
  ```json
  {
    "status": "TgftabModule module is working"
  }
  ```

## Guia para o Frontend

### Autenticação e Autorização

1. **Login Inicial**: Use `POST /auth/login` para obter access_token e refresh_token.
2. **Armazenamento**: Guarde ambos os tokens no localStorage/sessionStorage.
3. **Uso**: Inclua `Authorization: Bearer <access_token>` em todos os requests protegidos.
4. **Renovação Automática**: Quando access_token expirar (401), use `POST /auth/refresh` com refresh_token para obter novos tokens.
5. **Perfil do Usuário**: Use `GET /profile/me` para obter dados completos do usuário logado.
6. **Logout**: Remova os tokens do armazenamento.

### Paginação

- Use `page` e `perPage` para navegar.
- Responses incluem `total`, `lastPage`, `hasMore`.

### Filtros e Ordenação

- Passe filtros como query params (ex: `nomefunc=JOÃO`).
- Use `sort` para ordenação (ex: `DTADM DESC`).
- `fields` para seleção de campos.

### Tratamento de Erros

- **401**: Token inválido/expirado.
- **403**: Acesso negado.
- **404**: Recurso não encontrado.
- **500**: Erro interno.

### Rate Limiting

- Máximo 100 requests por minuto globalmente.

### Cache

- Responses são cacheadas por 5 minutos.

### WebSocket

- Conecte em `/health` para monitoramento em tempo real.
