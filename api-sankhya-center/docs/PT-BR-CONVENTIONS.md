# Convenções pt-BR - Gerente de Dados

## 📋 Contexto

Nosso **gerente de dados é em português brasileiro (pt-BR)**. Portanto, toda comunicação com o usuário final deve estar em português, incluindo:

- Descrições de campos
- Mensagens de erro
- Documentação Swagger
- Comentários relevantes
- Logs de aplicação

## 🎯 Regras de Nomenclatura

### Código (Inglês)

```typescript
// ✅ CORRETO - Código em inglês
interface ProductBasic {
  codprod: number;
  descrprod: string;
  ativo: 'S' | 'N';
}

class ProductService {
  async findAll() {}
  async findById() {}
}
```

### Comentários e Descrições (Português)

```typescript
// ✅ CORRETO - Comentários em português
export interface ProductBasic {
  codprod: number;              // Código do produto
  descrprod: string;            // Descrição do produto
  referencia?: string;          // Referência interna
  ativo: 'S' | 'N';            // Ativo (S=Sim, N=Não)
  vlrultcompra?: number;        // Valor última compra em R$
}
```

### Mensagens de Erro (Português)

```typescript
// ✅ CORRETO - Mensagens em português
throw new NotFoundException(
  `Produto com código ${codprod} não encontrado`
);

throw new BadRequestException(
  'O código do produto deve ser um número positivo'
);

throw new UnauthorizedException(
  'Token de autenticação inválido ou expirado'
);
```

## 📝 Swagger/OpenAPI (Português)

### Controllers

```typescript
@ApiTags('Produtos')  // Em português
@Controller('products')  // Rota em inglês
export class ProductsController {

  @Get()
  @ApiOperation({
    summary: 'Listar produtos ativos',  // Português
    description: `
      Retorna uma lista paginada de produtos ativos de consumo.

      **Casos de Uso:**
      - Listagem de produtos na página principal
      - Busca e autocomplete
      - Seleção de produtos em dropdowns

      **Performance:**
      - Tempo típico: 200-300ms (primeira requisição)
      - Com cache: ~50ms
      - TTL do cache: 5 minutos
    `
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página (padrão: 1)',  // Português
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Produtos recuperados com sucesso',  // Português
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros inválidos',  // Português
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: ['página deve ser um número positivo'],
          error: 'Requisição Inválida'
        }
      }
    }
  })
  async findAll() {}
}
```

### DTOs

```typescript
export class FindProductsDto {
  @ApiPropertyOptional({
    description: 'Número da página para paginação',  // Português
    minimum: 1,
    default: 1,
    example: 1
  })
  @IsInt({ message: 'Página deve ser um número inteiro' })  // Português
  @Min(1, { message: 'Página deve ser maior que zero' })  // Português
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Termo de busca na descrição do produto',  // Português
    example: 'FOLHA'
  })
  @IsString({ message: 'Busca deve ser um texto' })  // Português
  @IsOptional()
  search?: string;
}

export class ProductBasicDto {
  @ApiProperty({
    description: 'Código único do produto',  // Português
    example: 3680
  })
  codprod: number;

  @ApiProperty({
    description: 'Descrição do produto',  // Português
    example: 'FOLHAS A4 SULFITE 75G 210X297MM'
  })
  descrprod: string;

  @ApiProperty({
    description: 'Status ativo (S=Sim, N=Não)',  // Português
    enum: ['S', 'N'],
    example: 'S'
  })
  ativo: 'S' | 'N';

  @ApiPropertyOptional({
    description: 'Valor da última compra em R$',  // Português
    example: 23.44
  })
  vlrultcompra?: number;
}
```

## 🔍 Validação (Português)

```typescript
import { IsInt, IsString, Min, Max } from 'class-validator';

export class FindProductsDto {
  @IsInt({ message: 'Página deve ser um número inteiro' })
  @Min(1, { message: 'Página deve ser no mínimo 1' })
  @IsOptional()
  page?: number = 1;

  @IsInt({ message: 'Itens por página deve ser um número inteiro' })
  @Min(1, { message: 'Mínimo de 1 item por página' })
  @Max(100, { message: 'Máximo de 100 itens por página' })
  @IsOptional()
  perPage?: number = 20;

  @IsString({ message: 'Busca deve ser um texto' })
  @IsOptional()
  search?: string;

  @IsInt({ message: 'Código do grupo deve ser um número inteiro' })
  @Min(1, { message: 'Código do grupo deve ser positivo' })
  @IsOptional()
  codgrupoprod?: number;
}
```

## 📊 Mensagens de Log (Português)

```typescript
// Logs de aplicação em português
this.logger.log('Iniciando busca de produtos...');
this.logger.warn(`Query lenta detectada: ${duration}ms`);
this.logger.error('Erro ao buscar produto do database', error.stack);
this.logger.debug(`Cache hit para chave: ${cacheKey}`);
```

## 🗄️ Comentários SQL (Português)

```sql
-- Buscar produtos ativos de consumo
SELECT
    CODPROD,          -- Código do produto
    DESCRPROD,        -- Descrição
    VLRULTCOMPRA,     -- Valor última compra (R$)
    ATIVO             -- Status (S=Sim, N=Não)
FROM TGFPRO WITH (NOLOCK)
WHERE ATIVO = 'S'     -- Apenas produtos ativos
  AND USOPROD = 'C'   -- Tipo consumo
ORDER BY CODPROD DESC;
```

## 🎨 Exemplos de Respostas

### Sucesso

```json
{
  "data": [
    {
      "codprod": 3680,
      "descrprod": "FOLHAS A4 SULFITE 75G 210X297MM",
      "vlrultcompra": 23.44,
      "ativo": "S"
    }
  ],
  "total": 150,
  "page": 1,
  "perPage": 20,
  "lastPage": 8,
  "hasMore": true
}
```

### Erro 400 - Validação

```json
{
  "statusCode": 400,
  "message": [
    "página deve ser um número positivo",
    "itens por página não pode ser maior que 100"
  ],
  "error": "Requisição Inválida"
}
```

### Erro 404 - Não Encontrado

```json
{
  "statusCode": 404,
  "message": "Produto com código 3680 não encontrado",
  "error": "Não Encontrado"
}
```

### Erro 401 - Não Autorizado

```json
{
  "statusCode": 401,
  "message": "Token de autenticação inválido ou expirado",
  "error": "Não Autorizado"
}
```

### Erro 500 - Erro Interno

```json
{
  "statusCode": 500,
  "message": "Erro ao processar requisição. Tente novamente mais tarde.",
  "error": "Erro Interno do Servidor"
}
```

## 📖 Documentação Swagger Principal

```typescript
const config = new DocumentBuilder()
  .setTitle('API Sankhya Center')
  .setDescription(`
    ## API para Gestão de Produtos e Estoque

    Esta API fornece acesso aos dados do ERP Sankhya com foco em:
    - Gestão de produtos (TGFPRO)
    - Controle de estoque (TGFEST)
    - Análise de compras e preços
    - KPIs e dashboards

    ### Autenticação
    Use o endpoint \`/auth/login\` para obter um token JWT.

    **Credenciais de teste:**
    - Usuário: CONVIDADO
    - Senha: guest123

    ### Limitações de Taxa
    - 100 requisições por minuto por IP
    - Cache implementado para otimização

    ### Performance
    - API usa gateway para database
    - Tempo típico: 200-500ms (primeira requisição)
    - Com cache: 10-100ms
    - Todas as queries otimizadas com cache Redis

    ### Suporte
    - Documentação: /docs
    - Exemplos: /docs/examples
    - Issues: github.com/org/repo/issues
  `)
  .setVersion('2.0.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Insira o token JWT obtido no endpoint /auth/login'
    },
    'JWT-auth'
  )
  .addTag('Autenticação', 'Login e gestão de tokens')
  .addTag('Produtos', 'Gestão e listagem de produtos')
  .addTag('Estoque', 'Controle de estoque e locais')
  .addTag('Preços', 'Análise de preços e histórico')
  .addTag('Analytics', 'Relatórios e KPIs')
  .addTag('Dicionário', 'Inspeção de metadados do database')
  .build();
```

## 🌐 Traduções Comuns

### Status HTTP

| Inglês | Português |
|--------|-----------|
| Bad Request | Requisição Inválida |
| Unauthorized | Não Autorizado |
| Forbidden | Proibido |
| Not Found | Não Encontrado |
| Internal Server Error | Erro Interno do Servidor |
| Service Unavailable | Serviço Indisponível |

### Mensagens Comuns

| Contexto | Mensagem pt-BR |
|----------|----------------|
| Campo obrigatório | "{campo} é obrigatório" |
| Tipo inválido | "{campo} deve ser {tipo}" |
| Fora do intervalo | "{campo} deve estar entre {min} e {max}" |
| Formato inválido | "{campo} está em formato inválido" |
| Não encontrado | "{recurso} com {identificador} {valor} não encontrado" |
| Já existe | "{recurso} já existe" |
| Operação proibida | "Você não tem permissão para {ação}" |
| Token inválido | "Token de autenticação inválido ou expirado" |
| Erro genérico | "Erro ao processar requisição. Tente novamente." |

## ✅ Checklist de Internacionalização

Ao criar novos endpoints:

- [ ] Tags do Swagger em português
- [ ] `summary` e `description` em português
- [ ] Descrições de `@ApiProperty` em português
- [ ] Mensagens de validação em português
- [ ] Mensagens de erro customizadas em português
- [ ] Exemplos com dados em português (quando aplicável)
- [ ] Comentários de código importantes em português
- [ ] Logs em português
- [ ] Documentação em markdown em português

## 🚫 O que NÃO traduzir

- Nomes de variáveis, funções, classes (manter inglês)
- Nomes de rotas/endpoints (manter inglês)
- Nomes de arquivos (manter inglês)
- Chaves de JSON em APIs REST (manter inglês)
- Código TypeScript/JavaScript (manter inglês)
- Comandos SQL (manter inglês - SELECT, WHERE, etc)
- Nomes de tabelas/campos do database (manter original Sankhya)

## 💡 Exemplo Completo

```typescript
// ✅ BOM EXEMPLO - Mix correto de inglês e português

import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Produtos')  // pt-BR
@Controller('products')  // inglês
export class ProductsController {
  constructor(private productService: ProductService) {}  // inglês

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar produto por código',  // pt-BR
    description: 'Retorna informações detalhadas de um produto específico'  // pt-BR
  })
  @ApiParam({
    name: 'id',
    description: 'Código do produto (CODPROD)',  // pt-BR
    example: 3680
  })
  @ApiResponse({
    status: 200,
    description: 'Produto encontrado com sucesso'  // pt-BR
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado'  // pt-BR
  })
  async findOne(@Param('id') id: number) {  // inglês
    const product = await this.productService.findById(id);  // inglês

    if (!product) {
      throw new NotFoundException(
        `Produto com código ${id} não encontrado`  // pt-BR
      );
    }

    return product;
  }
}
```

---

**Última atualização**: 2026-01-13
