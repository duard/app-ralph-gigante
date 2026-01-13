You are a senior TypeScript programmer with experience in the NestJS framework and a preference for clean programming and design patterns.

Generate code, corrections, and refactorings that comply with the basic principles and nomenclature.

## TypeScript General Guidelines

### Basic Principles

- Use portuguese brasilian for all code and documentation.
- Always declare the type of each variable and function (parameters and return value).
  - Avoid using any.
  - Create necessary types.
- Use JSDoc to document public classes and methods.
- Don't leave blank lines within a function.
- One export per file.

### Nomenclature

- Use PascalCase for classes.
- Use camelCase for variables, functions, and methods.
- Use kebab-case for file and directory names.
- Use UPPERCASE for environment variables.
  - Avoid magic numbers and define constants.
- Start each function with a verb.
- Use verbs for boolean variables. Example: isLoading, hasError, canDelete, etc.
- Use complete words instead of abbreviations and correct spelling.
  - Except for standard abbreviations like API, URL, etc.
  - Except for well-known abbreviations:
    - i, j for loops
    - err for errors
    - ctx for contexts
    - req, res, next for middleware function parameters

### Functions

- In this context, what is understood as a function will also apply to a method.
- Write short functions with a single purpose. Less than 20 instructions.
- Name functions with a verb and something else.
  - If it returns a boolean, use isX or hasX, canX, etc.
  - If it doesn't return anything, use executeX or saveX, etc.
- Avoid nesting blocks by:
  - Early checks and returns.
  - Extraction to utility functions.
- Use higher-order functions (map, filter, reduce, etc.) to avoid function nesting.
  - Use arrow functions for simple functions (less than 3 instructions).
  - Use named functions for non-simple functions.
- Use default parameter values instead of checking for null or undefined.
- Reduce function parameters using RO-RO
  - Use an object to pass multiple parameters.
  - Use an object to return results.
  - Declare necessary types for input arguments and output.
- Use a single level of abstraction.

### Data

- Don't abuse primitive types and encapsulate data in composite types.
- Avoid data validations in functions and use classes with internal validation.
- Prefer immutability for data.
  - Use readonly for data that doesn't change.
  - Use as const for literals that don't change.

### Classes

- Follow SOLID principles.
- Prefer composition over inheritance.
- Declare interfaces to define contracts.
- Write small classes with a single purpose.
  - Less than 200 instructions.
  - Less than 10 public methods.
  - Less than 10 properties.

### Exceptions

- Use exceptions to handle errors you don't expect.
- If you catch an exception, it should be to:
  - Fix an expected problem.
  - Add context.
  - Otherwise, use a global handler.

### Testing

- Follow the Arrange-Act-Assert convention for tests.
- Name test variables clearly.
  - Follow the convention: inputX, mockX, actualX, expectedX, etc.
- Write unit tests for each public function.
  - Use test doubles to simulate dependencies.
    - Except for third-party dependencies that are not expensive to execute.
- Write acceptance tests for each module.
  - Follow the Given-When-Then convention.

## Specific to NestJS

### Basic Principles

- Use modular architecture
- Encapsulate the API in modules.
  - One module per main domain/route.
  - One controller for its route.
    - And other controllers for secondary routes.
  - A models folder with data types.
    - DTOs validated with class-validator for inputs.
    - Declare simple types for outputs.
  - A services module with business logic and persistence.
    - Entities with MikroORM for data persistence.
    - One service per entity.
- A core module for nest artifacts
  - Global filters for exception handling.
  - Global middlewares for request management.
  - Guards for permission management.
  - Interceptors for request management.
- A shared module for services shared between modules.
  - Utilities
  - Shared business logic

### Testing

- Use the standard Jest framework for testing.
- Write tests for each controller and service.
- Write end to end tests for each api module.
- Add a admin/test method to each controller as a smoke test.

### Authentication

você sempre precisará de um token para consumir a api externa sankhya, você pode semprusar CURL,
para obter o token como abaixo

```
curl -X 'POST' \
  'https://api-nestjs-sankhya-read-producao.gigantao.net/auth/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "username": "SEU_USERNAME",
  "password": "SUA_SENHA"
}'
```

**Nota de Segurança**: Nunca use credenciais reais em código ou documentação. Os valores acima são apenas exemplos. As credenciais devem ser fornecidas dinamicamente pelo usuário.

### inspect tables and extract fields to construct types

você sempre deverá criar os types ou interfaces para nossas tables do banco de dados SANKHYA, você pode
inspecionar tabelas utilizando CURL da seguinte maneira

```
curl -X 'GET' \
  'https://api-nestjs-sankhya-read-producao.gigantao.net/inspection/table-schema?tableName=TFPFUN' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkNPTlZJREFETyIsInN1YiI6MzExLCJub21lIjoiQ09OVklEQURPIiwiZW1haWwiOiIiLCJjb2RlbXAiOjAsInJhemFvU29jaWFsIjoiTkFUQUxJQSBMT0NBRE9SQSAgICAgICAgICAgICAgICAgICAgICAgICIsImNvZGZ1bmMiOjAsIm5vbWVGdW5jaW9uYXJpbyI6IiIsImNnYyI6IjE1NjMyMjIyMDAwMTAyIiwiaWF0IjoxNzY2NTc3OTU5LCJleHAiOjE3NjY1ODE1NTl9.BHK4HVtie4cixAQNflfxrgVpZSuOxjSiQrOWiAlasqY'
```

após inspecionar os campos da tabela, você deve então criar todo o modulo dela em nossa api.

### Paginação

deve se criar um sistema global de paginação para todos os modulos, dado que todos terão routes findAll

### Filtros

deve se sempre verificar os relagions para criar poderosos filtros tanto pelos fields da tabela em si,
quanto por fields relation. Você pode consultar os relarions da tabela usando

```
curl -X 'GET' \
'https://api-nestjs-sankhya-read-producao.gigantao.net/inspection/table-relations?tableName=TFPFUN' \
-H 'accept: application/json' \
-H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkNPTlZJREFETyIsInN1YiI6MzExLCJub21lIjoiQ09OVklEQURPIiwiZW1haWwiOiIiLCJjb2RlbXAiOjAsInJhemFvU29jaWFsIjoiTkFUQUxJQSBMT0NBRE9SQSAgICAgICAgICAgICAgICAgICAgICAgICIsImNvZGZ1bmMiOjAsIm5vbWVGdW5jaW9uYXJpbyI6IiIsImNnYyI6IjE1NjMyMjIyMDAwMTAyIiwiaWF0IjoxNzY2NTc3OTU5LCJleHAiOjE3NjY1ODE1NTl9.BHK4HVtie4cixAQNflfxrgVpZSuOxjSiQrOWiAlasqY'
```

### find by id

deve sempre existir um metodo para find by id e para isso você pode encontrar as chaves primarias da tabela
usando

curl -X 'GET' \
 'https://api-nestjs-sankhya-read-producao.gigantao.net/inspection/primary-keys/TFPFUN' \
 -H 'accept: application/json' \
 -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkNPTlZJREFETyIsInN1YiI6MzExLCJub21lIjoiQ09OVklEQURPIiwiZW1haWwiOiIiLCJjb2RlbXAiOjAsInJhemFvU29jaWFsIjoiTkFUQUxJQSBMT0NBRE9SQSAgICAgICAgICAgICAgICAgICAgICAgICIsImNvZGZ1bmMiOjAsIm5vbWVGdW5jaW9uYXJpbyI6IiIsImNnYyI6IjE1NjMyMjIyMDAwMTAyIiwiaWF0IjoxNzY2NTc3OTU5LCJleHAiOjE3NjY1ODE1NTl9.BHK4HVtie4cixAQNflfxrgVpZSuOxjSiQrOWiAlasqY'

### obter dados

para obter dados você sempre deverá usar a rota de query da api Sankhya, da seguinte maneira

curl -X 'POST' \
 'https://api-nestjs-sankhya-read-producao.gigantao.net/inspection/query' \
 -H 'accept: application/json' \
 -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkNPTlZJREFETyIsInN1YiI6MzExLCJub21lIjoiQ09OVklEQURPIiwiZW1haWwiOiIiLCJjb2RlbXAiOjAsInJhemFvU29jaWFsIjoiTkFUQUxJQSBMT0NBRE9SQSAgICAgICAgICAgICAgICAgICAgICAgICIsImNvZGZ1bmMiOjAsIm5vbWVGdW5jaW9uYXJpbyI6IiIsImNnYyI6IjE1NjMyMjIyMDAwMTAyIiwiaWF0IjoxNzY2NTc3OTU5LCJleHAiOjE3NjY1ODE1NTl9.BHK4HVtie4cixAQNflfxrgVpZSuOxjSiQrOWiAlasqY' \
 -H 'Content-Type: application/json' \
 -H 'd' '{
"query": "SELECT TOP 10\n F.CODEMP,\n F.CODFUNC,\n F.NOMEFUNC,\n F.DTNASC,\n F.DTADM,\n F.CPF,\n F.CELULAR,\n F.EMAIL,\n F.SITUACAO,\n U.CODUSU,\n U.NOMEUSU,\n U.EMAIL AS EMAILUSU,\n U.AD_TELEFONECORP,\n P.CODPARC,\n P.NOMEPARC\nFROM TFPFUN F\nLEFT JOIN TSIUSU U\n ON F.CODEMP = U.CODEMP AND F.CODFUNC = U.CODFUNC\nLEFT JOIN TGFPAR P\n ON F.CODPARC = P.CODPARC\nORDER BY F.DTADM DESC;",
"params": []
}'

esta rota query é uma rota para execução de SQLs, sempre tome cuidado, nunca execute comandos destrutivos.

### fonte de dados

nossa fonte de dados é sempre nossa route https://api-nestjs-sankhya-read-producao.gigantao.net/inspection/query, para isso sempre
devemos ter um token, ou seja, sempre devemos estar authenticados.

### Centralização de Queries

- Utilize o SankhyaQueryService para todas as consultas à API Sankhya.
- Este serviço centraliza a autenticação e execução de queries SQL.
- Exemplo de uso: `await this.sankhyaQueryService.executeQuery('SELECT * FROM TABELA WHERE ID = 1', []);`

### Tratamento de Dados

- Sempre valide e transforme os dados retornados da API Sankhya.
- Datas vêm como strings ISO; converta para objetos Date quando necessário.
- Campos numéricos e booleanos devem ser tipados corretamente.
- Trate valores null/undefined de acordo com a interface.
- Use trimStrings de src/common/utils/string.utils.ts para remover espaços em branco de strings recursivamente.
- Inclua contagem de funcionários admitidos (DTDEM IS NULL) em TFPCAR e TFPDEP.

### Receita para Criar um Novo Módulo de Tabela Sankhya

Para criar um novo módulo para uma tabela Sankhya, siga estes passos para garantir consistência e evitar desentendimentos:

1. **Inspecionar a Tabela**:
   - Use o endpoint `GET /inspection/table-schema?tableName=NOME_TABELA` para obter os campos.
   - Use `GET /inspection/primary-keys/NOME_TABELA` para a chave primária.
   - Use `GET /inspection/table-relations?tableName=NOME_TABELA` para relações.

2. **Criar a Interface**:
   - Arquivo: `src/NOME_MODULO/models/NOME_TABELA.interface.ts`
   - Defina uma interface com todos os campos, incluindo objetos aninhados para relações (ex: `tfpcbo?: { codcbo: number; descrcbo: string }`).

3. **Criar o DTO de Busca**:
   - Arquivo: `src/NOME_MODULO/models/NOME_TABELA-find-all.dto.ts`
   - Extenda ou crie baseado em `TfpcarFindAllDto`, com paginação, filtros e campo `fields` para seleção.

4. **Criar a Entidade (opcional)**:
   - Arquivo: `src/NOME_MODULO/entities/NOME_TABELA.entity.ts`
   - Use MikroORM se precisar de persistência local.

5. **Criar o Serviço**:
   - Arquivo: `src/NOME_MODULO/NOME_TABELA.service.ts`
   - Estenda `SankhyaBaseService<T>`.
   - Implemente métodos abstratos: `getTableName()`, `getPrimaryKey()`, `mapToEntity()`, `getRelationsQuery()`.
   - Sobrescreva `findAll()` se precisar de filtros customizados.

6. **Criar o Controller**:
   - Arquivo: `src/NOME_MODULO/NOME_TABELA.controller.ts`
   - Use decorators @ApiTags, @ApiOperation, etc.
   - Endpoints: GET / (findAll), GET /:id (findById), GET /admin/test (smoke test).

7. **Criar o Módulo**:
   - Arquivo: `src/NOME_MODULO/NOME_TABELA.module.ts`
   - Importe SharedModule e declare provider, controller.

8. **Registrar no AppModule**:
   - Adicione o novo módulo em `src/app.module.ts`.

9. **Testar e Documentar**:
   - Execute `pnpm build` e teste os endpoints.
   - Atualize AGENTS.md se houver padrões novos.
   - Garanta que relações sejam incluídas como objetos aninhados.

### Padrões de Implementação de Módulos

- Para cada tabela Sankhya, crie um módulo completo: interface, DTO, entidade, serviço e controlador.
- Implemente paginação global com PaginatedResult<T> (page, perPage, total, lastPage, hasMore).
- Adicione filtros baseados nos campos da tabela, incluindo fields para seleção de campos (separados por vírgula ou \* para todos), sort para ordenação (padrão último inserido primeiro) e joins com tabelas relacionadas.
- Para findById, use a chave primária.
- Inclua um método admin/test para smoke test.

### Segurança e Boas Práticas

- Evite SQL injection inlining valores apenas para consultas internas.
- Use try/catch em métodos que chamam APIs externas.
- Log erros para debug, mas não exponha detalhes sensíveis.
- Sempre valide inputs com class-validator.

### Testes

- Escreva testes unitários para serviços.
- Testes de integração para controladores.
- Use mocks para SankhyaQueryService.

### Documentação

- Documente métodos públicos com JSDoc.
- Use @nestjs/swagger para documentar APIs com OpenAPI/Swagger.
- Adicione @ApiTags, @ApiOperation, @ApiResponse em controladores.
- Use @ApiProperty em DTOs.
- Configure Swagger no main.ts com DocumentBuilder.
- Mantenha AGENTS.md atualizado com novos padrões.

### Melhorias de Reusabilidade e Qualidade

- **Base Controller**: `SankhyaBaseController` abstrato com métodos comuns (findById, admin/test) para reduzir repetição.
- **Base DTO**: `BaseFindAllDto` com campos comuns (page, perPage, sort, fields) para padronização.
- **Serviço de Autenticação**: `SankhyaAuthService` separado para gerenciamento de tokens com cache.
- **Filtro de Campos Avançado**: Suporte a modo include (padrão) e exclude (prefixo -) para seleção poderosa de campos.
- **Serviço Base**: Métodos compartilhados como `filterObjectKeys` para evitar duplicação.
- **Case Sensitivity**: Campos da API Sankhya retornados em minúsculo (TFPCAR, TFPDEP, TFPFUN) ou maiúsculo (TGFPAR), filtros ajustados para compatibilidade.
- **Rate Limiting**: 100 req/min global para prevenir abuso.
- **Cache de Respostas**: 5 min TTL para queries frequentes.
- **Tratamento de Erros**: Respostas padronizadas com filtro global.
- **Testes**: Unitários implementados para TFPFUN.
- **Autenticação JWT**: Proteção em todas as rotas com login em /auth/login.
- **Módulos**: TFPCAR (cargos), TFPDEP (departamentos), TGFPAR (parceiros), TFPFUN (funcionários) com filtros avançados e paginação. TFPFUN ordenado por data de admissão decrescente (últimos admitidos primeiro).
- **Relações**: Incluídas em findById; em findAll, estrutura presente mas dados só em findById devido a limitações da API Sankhya.
- **Módulo Sankhya**: `SankhyaModule` agrupa todos os módulos Sankhya (Auth, Shared, TFPCAR, TFPDEP, TGFPAR, TFPFUN) para organização no AppModule.
- **Estado Atual**: Build e testes (25/25) passando. Endpoints autenticados prontos para uso. Import paths corrigidos após reorganização.
- **Interceptors**: LoggingInterceptor global para logar requests/responses com usuário, método, URL, status e duração.
- **Logging**: Sistema de logs excelente com informações do usuário autenticado.
- **Timezone**: Aplicação configurada para America/Sao_Paulo.
- **Testes**: Sempre executar `pnpm test` após mudanças para garantir qualidade.

### Regras de Desenvolvimento

- Sempre execute `pnpm build` após mudanças significativas no código para verificar erros de compilação.
- Corrija todos os erros de TypeScript antes de commitar.
- Sempre execute `pnpm test` para rodar todos os testes e garantir qualidade.
- Mantenha o código limpo seguindo as diretrizes TypeScript e NestJS.
- Priorize reutilização: use classes base, serviços compartilhados e padrões consistentes.
