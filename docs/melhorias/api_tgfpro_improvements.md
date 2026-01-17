# Plano de Melhorias para a API de Produtos (TGFPRO)

## 1. Resumo Executivo

A análise do código-fonte da `api-sankhya-center`, especialmente em torno do módulo de produtos (conhecido como TGFPRO), revelou dois problemas principais:

1.  **Vulnerabilidade Crítica de Segurança (SQL Injection):** A forma como as consultas SQL são construídas, concatenando strings com dados de entrada do usuário, torna a aplicação altamente vulnerável a ataques de SQL Injection. **Esta é uma falha grave e deve ser corrigida com prioridade máxima.**
2.  **Decaimento Arquitetural:** Existem pelo menos cinco módulos de produtos sobrepostos e duplicados (`tgfpro`, `tgfpro2`, `produtos-v2`, `products2`, `produtos-simples-v2`). Essa fragmentação causa confusão, duplicação de código, APIs inconsistentes e dificulta a manutenção.

Este documento propõe um plano de refatoração claro para unificar a lógica de produtos em um novo módulo coeso, seguro e eficiente, eliminando o código legado e estabelecendo uma base sólida para futuras evoluções.

---

## 2. Problemas Críticos Detalhados

### 2.1. Vulnerabilidade Crítica: SQL Injection

O método `buildWhereClause` em `tgfpro2.service.ts` e a construção de queries em `tgfpro.service.ts` são exemplos claros desta vulnerabilidade. O código abaixo ilustra o problema, onde `dto.codprod` (um dado que vem do cliente) é diretamente inserido na query:

```typescript
// Exemplo de código vulnerável em tgfpro2.service.ts
if (dto.codprod) {
  whereClause += ` AND PRO.CODPROD IN (${dto.codprod})`; // RISCO DE SQL INJECTION!
}
```

Um atacante poderia enviar um valor malicioso no campo `codprod`, como `123) OR 1=1; --`, para manipular a consulta e extrair dados indevidos.

**Correção Imediata:** Todas as consultas SQL devem ser reescritas para usar **consultas parametrizadas (parameterized queries)**, onde os valores do usuário são passados como parâmetros e não concatenados diretamente na string da query.

### 2.2. Decaimento Arquitetural e Duplicação

O arquivo `sankhya.module.ts` expõe a fragmentação, importando múltiplos módulos para a mesma funcionalidade:

```typescript
// Exemplo em sankhya.module.ts
imports: [
  // ...
  TgfproModule,
  Tgfpro2Module,
  ProdutosV2Module,
  ProdutosSimplesV2Module,
  // ...
],
```

Essa abordagem resulta em:
*   **APIs Inconsistentes:** Endpoints como `/produtos`, `/v2/produtos`, `/produtos/simplified` têm filtros, paginação e formatos de resposta diferentes.
*   **Código Duplicado:** Lógicas de negócio e acesso a dados são copiados e colados entre os serviços.
*   **Dificuldade de Manutenção:** Corrigir um bug ou adicionar um campo exige intervenção em múltiplos locais, aumentando a chance de erros.

---

## 3. Plano de Refatoração Proposto

A refatoração será centrada na criação de um único módulo `products` que se tornará a fonte única de verdade.

### Passo 1: Unificar e Adotar `tgfpro2` como Base

O módulo `tgfpro2` é o mais bem estruturado, com um Controller RESTful e uso de DTOs. Ele será a fundação do novo módulo `products`. A lógica valiosa de outros módulos (como o serviço de cache de `consumo-v2.service.ts`) será migrada para dentro desta nova estrutura.

### Passo 2: Implementar o Padrão Repository para Segurança

Criaremos uma camada de acesso a dados dedicada (`ProductRepository`) que encapsulará toda a lógica SQL.

*   **Responsabilidade:** O `Repository` será o único local com código SQL.
*   **Segurança:** **Todas as queries serão parametrizadas** para eliminar o risco de SQL Injection.
*   **Exemplo (`ProductRepository`):**

```typescript
// Exemplo de método seguro no novo Repository
async findAll(filters: ProductFiltersDto) {
  const { codprod, ... } = filters;
  const whereClauses = [];
  const params = [];

  if (codprod) {
    whereClauses.push(`PRO.CODPROD = ?`); // Uso de placeholder
    params.push(codprod); // Parâmetro separado
  }
  
  const query = `SELECT ... FROM TGFPRO PRO WHERE ${whereClauses.join(' AND ')}`;
  
  return this.databaseService.query(query, params); //
}
```

O `Service` (`ProductsService`) conterá apenas a lógica de negócio e chamará o `Repository` para buscar ou modificar dados, sem nunca tocar em SQL.

### Passo 3: Desacoplar Serviços e Controladores

O monolítico `Tgfpro2Service` e `Tgfpro2Controller` serão divididos em componentes menores e focados, seguindo o Princípio da Responsabilidade Única:

*   `ProductsController` / `ProductsService`: Lógica principal de CRUD e listagem de produtos.
*   `ProductStockController` / `ProductStockService`: Endpoints e lógica para consulta de estoque.
*   `ProductConsumptionController` / `ProductConsumptionService`: Endpoints para análise de consumo.
*   `ProductDataQualityController` / `ProductDataQualityService`: Endpoints de "saúde" dos dados, como `sem-ncm`.

### Passo 4: Padronizar e Flexibilizar a API

Em vez de criar endpoints específicos como `/simplified` ou `/with-stock`, usaremos **query parameters** para controlar o formato da resposta, tornando a API mais flexível e limpa.

*   **Exemplo:**
    *   `GET /api/products?fields=simplified`: Retorna uma lista simplificada.
    *   `GET /api/products/123?include=stock,consumption`: Retorna o produto detalhado com informações de estoque e consumo.

### Passo 5: Depreciar e Remover Módulos Legados

Após a implementação e validação do novo módulo `products`, os módulos antigos (`TgfproModule`, `ProdutosV2Module`, etc.) serão marcados como `deprecated`. Um plano de migração para os clientes da API será comunicado e, finalmente, o código legado será removido.

---

## 4. Próximos Passos

1.  **Prioridade 1 (Imediata):** Iniciar a implementação do `ProductRepository` com queries parametrizadas para mitigar a vulnerabilidade de SQL Injection.
2.  **Prioridade 2:** Desenvolver o novo módulo `products` com base na estrutura do `tgfpro2`, mas com os serviços e controladores já desacoplados.
3.  **Prioridade 3:** Mapear e migrar a funcionalidade dos módulos legados para o novo módulo `products`.
4.  **Prioridade 4:** Comunicar o plano de depreciação e remover o código antigo.
