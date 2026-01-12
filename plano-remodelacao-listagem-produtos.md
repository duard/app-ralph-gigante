# Plano: Remodelação Completa da Tela de Listagem de Produtos

## 📋 Visão Geral

Remodelar completamente a tela de listagem de produtos do sistema Sankhya Center com:

- **Design moderno** com toolbar de filtros (não sidebar)
- **Controle por local de estoque** (TGFLOC)
- **Filtros de controle de produto** (TIPCONTEST/LISCONTEST)
- **Interface completa** integrando todas as tabelas Sankhya
- **UX/UI aprimorada** com componentes shadcn/ui

## ⚠️ IMPORTANTE

**IGNORAR campo IMAGEM (BLOB)** - Este campo causa problemas de performance na API e NÃO deve ser incluído em queries ou interfaces.

## 🎯 Problemas Identificados

### 1. Backend - Interfaces Incompletas

**Problema:** Interface `Product` do frontend não tem campos críticos:

```typescript
// FALTANDO no frontend:
tipcontest?: string;        // Tipo de controle (ex: "MEDIDA", "PESO")
liscontest?: string[];      // Lista de controle (ex: ["500ML", "1KG"])
locais?: {                  // Estoque por local
  codlocal: number;
  descrlocal: string;
  controle: string;
  estoque: number;
}[];
```

### 2. Frontend - Sidebar ao invés de Toolbar

**Problema:** Filtros em sidebar lateral ocupam muito espaço
**Solução:** Mover para toolbar horizontal moderna

### 3. Falta Integração com TGFLOC

**Problema:** Não há endpoint que retorne estoque por local
**SQL necessário:**

```sql
SELECT DISTINCT
  LOC.DESCRLOCAL AS "Descrição_do_Local",
  EST.CODEMP AS "Cod_Empresa",
  PRO.CODPROD AS "CódProduto",
  PRO.DESCRPROD AS "Descrição_Produto",
  ISNULL(PRO.COMPLDESC,' ') AS "Complemento",
  EST.CONTROLE AS "Controle",
  PRO.CODVOL AS "Unidade",
  ISNULL(EST.ESTOQUE, 0) AS "Estoque"
FROM TGFPRO PRO
  INNER JOIN TGFEST EST ON PRO.CODPROD = EST.CODPROD
  INNER JOIN TGFLOC LOC ON EST.CODLOCAL = LOC.CODLOCAL
WHERE EST.CODPARC = 0
  AND (ISNULL(EST.ESTOQUE, 0) <> 0)
  AND PRO.ATIVO = 'S'
ORDER BY PRO.DESCRPROD
```

### 4. Faltam Filtros Críticos

**Faltando:**

- Filtro por local de estoque (TGFLOC)
- Filtro por tipo de controle (TIPCONTEST)
- Filtro por lista de controle (LISCONTEST)
- Filtro por empresa (CODEMP)

## 🚀 Tasks de Implementação

### FASE 1: Backend - Completar API com Locais e Controle

#### Task 1.1: Criar Endpoint para Listar Locais (TGFLOC)

**Arquivo:** `api-sankhya-center/src/sankhya/tgfloc/tgfpro.controller.ts` (CRIAR)

**O que fazer:**

1. Criar novo módulo `tgfloc/`
2. Implementar controller com endpoints:

   ```typescript
   @Controller('tgfloc')
   export class TgflocController {
     @Get()
     async findAll(): Promise<Tgfloc[]> {
       // Retornar todos os locais ativos
     }

     @Get(':codlocal')
     async findById(@Param('codlocal') codlocal: number): Promise<Tgfloc> {
       // Retornar local específico
     }

     @Get('with-stock/:codprod')
     async findByProduct(
       @Param('codprod') codprod: number
     ): Promise<LocalEstoque[]> {
       // Retornar locais que tem estoque do produto
     }
   }
   ```

3. Criar service `tgfloc.service.ts`:

   ```typescript
   async findAll(): Promise<Tgfloc[]> {
     const query = `
       SELECT CODLOCAL, DESCRLOCAL, ATIVO
       FROM TGFLOC WITH (NOLOCK)
       WHERE ATIVO = 'S'
       ORDER BY DESCRLOCAL
     `;
     return this.sankhyaApiService.executeQuery(query, []);
   }
   ```

4. Criar interface `models/tgfloc.interface.ts`:

   ```typescript
   export interface Tgfloc {
     codlocal: number;
     descrlocal: string;
     ativo: 'S' | 'N';
   }

   export interface LocalEstoque {
     codlocal: number;
     descrlocal: string;
     controle: string;
     estoque: number;
     estmin?: number;
     estmax?: number;
   }
   ```

**Arquivos a criar:**

- `src/sankhya/tgfloc/tgfloc.module.ts`
- `src/sankhya/tgfloc/tgfloc.controller.ts`
- `src/sankhya/tgfloc/tgfloc.service.ts`
- `src/sankhya/tgfloc/models/tgfloc.interface.ts`

**Critério de aceitação:**

- [ ] Endpoint `GET /tgfloc` retorna lista de locais
- [ ] Endpoint `GET /tgfloc/:codlocal` retorna local específico
- [ ] Endpoint `GET /tgfloc/with-stock/:codprod` retorna locais com estoque
- [ ] Swagger documentado
- [ ] Response time < 200ms

---

#### Task 1.2: Adicionar Endpoint de Produtos com Estoque por Local

**Arquivo:** `api-sankhya-center/src/sankhya/tgfpro/tgfpro.controller.ts` (ATUALIZAR)

**O que fazer:**

1. Adicionar novo endpoint no controller:

   ```typescript
   @Get('with-stock-locations')
   @ApiOperation({ summary: 'Listar produtos com estoque detalhado por local' })
   @ApiQuery({ name: 'codlocal', required: false, description: 'Filtrar por local específico' })
   async findAllWithStockLocations(
     @Query() dto: TgfproFindAllDto,
   ): Promise<PaginatedResult<TgfproWithLocations>> {
     return this.tgfproService.findAllWithStockLocations(dto);
   }
   ```

2. Implementar método no service:

   ```typescript
   async findAllWithStockLocations(dto: TgfproFindAllDto): Promise<PaginatedResult<TgfproWithLocations>> {
     const query = `
       SELECT
         PRO.CODPROD,
         PRO.DESCRPROD,
         PRO.COMPLDESC,
         PRO.REFERENCIA,
         PRO.CODVOL,
         PRO.ATIVO,
         PRO.TIPCONTEST,
         PRO.LISCONTEST,
         PRO.CODGRUPOPROD,
         GRU.DESCRGRUPOPROD,
         EST.CODLOCAL,
         LOC.DESCRLOCAL,
         EST.CONTROLE,
         ISNULL(EST.ESTOQUE, 0) AS ESTOQUE,
         ISNULL(EST.ESTMIN, 0) AS ESTMIN,
         ISNULL(EST.ESTMAX, 0) AS ESTMAX,
         EST.CODEMP
       FROM TGFPRO PRO WITH (NOLOCK)
       INNER JOIN TGFEST EST WITH (NOLOCK) ON PRO.CODPROD = EST.CODPROD
       INNER JOIN TGFLOC LOC WITH (NOLOCK) ON EST.CODLOCAL = LOC.CODLOCAL
       LEFT JOIN TGFGRU GRU WITH (NOLOCK) ON PRO.CODGRUPOPROD = GRU.CODGRUPOPROD
       WHERE EST.CODPARC = 0
         AND PRO.ATIVO = 'S'
         ${dto.codlocal ? `AND EST.CODLOCAL = ${dto.codlocal}` : ''}
       ORDER BY PRO.DESCRPROD, LOC.DESCRLOCAL
     `;

     const results = await this.sankhyaApiService.executeQuery(query, []);

     // Agrupar por produto com array de locais
     const productsMap = new Map<number, TgfproWithLocations>();

     for (const row of results) {
       const codprod = row.CODPROD;

       if (!productsMap.has(codprod)) {
         productsMap.set(codprod, {
           ...this.mapToEntity(row),
           locais: [],
         });
       }

       productsMap.get(codprod)!.locais.push({
         codlocal: row.CODLOCAL,
         descrlocal: row.DESCRLOCAL,
         controle: row.CONTROLE,
         estoque: row.ESTOQUE,
         estmin: row.ESTMIN,
         estmax: row.ESTMAX,
         codemp: row.CODEMP,
       });
     }

     return buildPaginatedResult({
       data: Array.from(productsMap.values()),
       total: productsMap.size,
       page: dto.page || 1,
       perPage: dto.perPage || 10,
     });
   }
   ```

3. Criar nova interface:
   ```typescript
   export interface TgfproWithLocations extends Tgfpro {
     locais: LocalEstoque[];
   }
   ```

**Arquivos a atualizar:**

- `src/sankhya/tgfpro/tgfpro.controller.ts`
- `src/sankhya/tgfpro/tgfpro.service.ts`
- `src/sankhya/tgfpro/models/tgfpro.interface.ts`
- `src/sankhya/tgfpro/models/tgfpro-find-all.dto.ts` (adicionar `codlocal?: number`)

**Critério de aceitação:**

- [ ] Endpoint retorna produtos agrupados com array de locais
- [ ] Filtro por `codlocal` funciona
- [ ] Campos `tipcontest` e `liscontest` incluídos
- [ ] Performance < 1s para 1000 produtos
- [ ] Swagger documentado

---

#### Task 1.3: Adicionar Filtros de Controle ao Ultra Search

**Arquivo:** `api-sankhya-center/src/sankhya/tgfpro/tgfpro.service.ts` (ATUALIZAR)

**O que fazer:**

1. Adicionar novos filtros no DTO:

   ```typescript
   // tgfpro-find-all.dto.ts
   export class TgfproFindAllDto {
     // ... existentes ...

     @ApiPropertyOptional({
       description: 'Filtrar por local de estoque (CODLOCAL)',
       example: 105001,
     })
     codlocal?: number;

     @ApiPropertyOptional({
       description: 'Filtrar produtos COM controle (TIPCONTEST não nulo)',
       example: true,
     })
     comControle?: boolean;

     @ApiPropertyOptional({
       description: 'Filtrar produtos SEM controle (TIPCONTEST nulo)',
       example: true,
     })
     semControle?: boolean;
   }
   ```

2. Atualizar lógica de filtros no `ultraSearch`:

   ```typescript
   // No whereClauses, adicionar:
   if (dto.codlocal) {
     fromAndJoins += ` INNER JOIN TGFEST EST ON PRO.CODPROD = EST.CODPROD AND EST.CODLOCAL = ${dto.codlocal}`;
   }

   if (dto.comControle) {
     whereClauses.push(`TGFPRO.TIPCONTEST IS NOT NULL`);
   }

   if (dto.semControle) {
     whereClauses.push(`TGFPRO.TIPCONTEST IS NULL`);
   }
   ```

**Arquivos a atualizar:**

- `src/sankhya/tgfpro/models/tgfpro-find-all.dto.ts`
- `src/sankhya/tgfpro/tgfpro.service.ts` (método `ultraSearch`)

**Critério de aceitação:**

- [ ] Filtro `codlocal` funciona
- [ ] Filtro `comControle` funciona
- [ ] Filtro `semControle` funciona
- [ ] Combinação de filtros funciona
- [ ] Swagger atualizado

---

### FASE 2: Frontend - Atualizar Interfaces e API Client

#### Task 2.1: Atualizar Interface Product com Campos Faltantes

**Arquivo:** `sankhya-products-dashboard/src/stores/products-store.ts` (ATUALIZAR)

**O que fazer:**

1. Adicionar campos faltantes na interface:

   ```typescript
   export interface Product {
     id: number;
     codprod: number;
     descrprod: string;
     compldesc?: string; // ✅ ADICIONAR
     reffab?: string;
     codvol?: string;
     vlrvenda?: number;
     vlrcusto?: number;
     estoque?: number;
     estmin?: number;
     ativo: 'S' | 'N';
     codgrupoprod?: number;
     descrgrupoprod?: string;
     codmarca?: number;
     ncm?: string;
     cest?: string;
     pesoliq?: number;
     pesobruto?: number;
     observacao?: string;
     dtcad?: string;
     dtalter?: string;

     // ✅ CAMPOS NOVOS DE CONTROLE
     tipcontest?: string; // Tipo de controle (ex: "MEDIDA", "PESO")
     liscontest?: string | string[]; // Lista de controle (pode ser string ou array)

     // ✅ ESTOQUE POR LOCAL
     locais?: LocalEstoque[]; // Array de locais com estoque
     estoqueTotal?: number; // Soma de estoque de todos os locais
   }

   // ✅ NOVA INTERFACE
   export interface LocalEstoque {
     codlocal: number;
     descrlocal: string;
     controle: string;
     estoque: number;
     estmin?: number;
     estmax?: number;
     codemp?: number;
   }
   ```

2. Atualizar `ProductFilters`:

   ```typescript
   export interface ProductFilters {
     search?: string;
     status?: 'all' | 'active' | 'inactive';
     category?: string;
     unit?: string;
     priceMin?: number;
     priceMax?: number;
     stockMin?: number;
     stockMax?: number;
     sortBy?: string;
     sortOrder?: 'asc' | 'desc';

     // ✅ FILTROS NOVOS
     codlocal?: number; // Filtrar por local de estoque
     comControle?: boolean; // Filtrar produtos COM controle
     semControle?: boolean; // Filtrar produtos SEM controle
     tipcontest?: string; // Filtrar por tipo de controle específico
   }
   ```

**Arquivos a atualizar:**

- `src/stores/products-store.ts`
- `src/types/product.types.ts` (se existir, ou criar)

**Critério de aceitação:**

- [ ] Interface `Product` completa com todos os campos
- [ ] Interface `LocalEstoque` criada
- [ ] Interface `ProductFilters` atualizada
- [ ] TypeScript compilando sem erros
- [ ] Nenhum campo `any` usado

---

#### Task 2.2: Criar API Client para TGFLOC

**Arquivo:** `sankhya-products-dashboard/src/lib/api/locations-api.ts` (CRIAR)

**O que fazer:**

1. Criar novo arquivo `locations-api.ts`:

   ```typescript
   import axios from 'axios';
   import { API_BASE_URL } from './config';
   import type { LocalEstoque } from '@/stores/products-store';

   export interface Tgfloc {
     codlocal: number;
     descrlocal: string;
     ativo: 'S' | 'N';
   }

   /**
    * API client para locais de estoque (TGFLOC)
    */
   export const locationsApi = {
     /**
      * Listar todos os locais ativos
      */
     async getAll(): Promise<Tgfloc[]> {
       const response = await axios.get(`${API_BASE_URL}/tgfloc`);
       return response.data;
     },

     /**
      * Buscar local por código
      */
     async getById(codlocal: number): Promise<Tgfloc> {
       const response = await axios.get(`${API_BASE_URL}/tgfloc/${codlocal}`);
       return response.data;
     },

     /**
      * Buscar locais que tem estoque de um produto
      */
     async getByProduct(codprod: number): Promise<LocalEstoque[]> {
       const response = await axios.get(
         `${API_BASE_URL}/tgfloc/with-stock/${codprod}`
       );
       return response.data;
     },
   };
   ```

2. Criar hook customizado `use-locations.ts`:

   ```typescript
   import { useQuery } from '@tanstack/react-query';
   import { locationsApi, type Tgfloc } from '@/lib/api/locations-api';

   /**
    * Hook para buscar todos os locais de estoque
    */
   export function useLocations() {
     return useQuery({
       queryKey: ['locations'],
       queryFn: () => locationsApi.getAll(),
       staleTime: 5 * 60 * 1000, // 5 minutos
       gcTime: 10 * 60 * 1000, // 10 minutos
     });
   }

   /**
    * Hook para buscar locais com estoque de um produto
    */
   export function useProductLocations(codprod: number) {
     return useQuery({
       queryKey: ['product-locations', codprod],
       queryFn: () => locationsApi.getByProduct(codprod),
       enabled: !!codprod,
       staleTime: 2 * 60 * 1000, // 2 minutos
     });
   }
   ```

**Arquivos a criar:**

- `src/lib/api/locations-api.ts`
- `src/hooks/use-locations.ts`

**Critério de aceitação:**

- [ ] API client implementado com todos os métodos
- [ ] Hooks com React Query configurados
- [ ] Cache de 5min configurado
- [ ] Error handling implementado
- [ ] TypeScript sem erros

---

#### Task 2.3: Atualizar Product API Client com Novos Endpoints

**Arquivo:** `sankhya-products-dashboard/src/lib/api/product-service.ts` (ATUALIZAR)

**O que fazer:**

1. Adicionar novos métodos ao `productService`:

   ```typescript
   export const productService = {
     // ... métodos existentes ...

     /**
      * Buscar produtos com estoque detalhado por local
      */
     async getProductsWithLocations(
       params: ProductSearchParams & { codlocal?: number }
     ) {
       const queryParams = new URLSearchParams({
         page: params.page?.toString() || '1',
         perPage: params.perPage?.toString() || '10',
         ...(params.search && { search: params.search }),
         ...(params.codlocal && { codlocal: params.codlocal.toString() }),
       });

       const response = await axios.get(
         `${API_BASE_URL}/tgfpro/with-stock-locations?${queryParams}`
       );
       return response.data;
     },

     /**
      * Buscar produtos com filtro de controle
      */
     async getProductsWithControl(comControle: boolean) {
       const response = await axios.get(
         `${API_BASE_URL}/tgfpro/ultra-search?comControle=${comControle}`
       );
       return response.data;
     },
   };
   ```

2. Atualizar hook `use-products.ts`:
   ```typescript
   /**
    * Hook para buscar produtos com locais de estoque
    */
   export function useProductsWithLocations(params: {
     page?: number;
     pageSize?: number;
     codlocal?: number;
   }) {
     return useQuery({
       queryKey: ['products-with-locations', params],
       queryFn: () =>
         productService.getProductsWithLocations({
           page: params.page,
           perPage: params.pageSize,
           codlocal: params.codlocal,
         }),
       staleTime: 5 * 60 * 1000,
     });
   }
   ```

**Arquivos a atualizar:**

- `src/lib/api/product-service.ts`
- `src/hooks/use-products.ts`
- `src/lib/react-query/product-queries.ts`

**Critério de aceitação:**

- [ ] Novos métodos implementados
- [ ] Hooks com React Query criados
- [ ] Params tipados corretamente
- [ ] Error handling implementado
- [ ] TypeScript sem erros

---

### FASE 3: Frontend - Remodelar Tela com Toolbar Moderna

#### Task 3.1: Criar Novo Componente de Toolbar com Filtros

**Arquivo:** `sankhya-products-dashboard/src/components/products/product-toolbar-filters.tsx` (CRIAR)

**O que fazer:**
Criar componente moderno de toolbar horizontal com:

- Busca rápida (input com ícone de lupa)
- Select de status (Todos/Ativos/Inativos)
- Select de local de estoque (integrado com API)
- Popover de filtros avançados (controle, categoria, etc.)
- Contador de filtros ativos
- Botão de limpar filtros

Ver código completo na seção anterior do plano.

**Arquivos a criar:**

- `src/components/products/product-toolbar-filters.tsx`

**Critério de aceitação:**

- [ ] Toolbar horizontal moderna
- [ ] Busca rápida funcionando
- [ ] Select de status funcionando
- [ ] Select de local de estoque funcionando
- [ ] Popover de filtros avançados funcionando
- [ ] Contador de filtros ativos
- [ ] Botão de limpar filtros
- [ ] Design responsivo mobile

---

#### Task 3.2: Adicionar Coluna de Locais na Tabela de Produtos

**Arquivo:** `sankhya-products-dashboard/src/components/products/product-list.tsx` (ATUALIZAR)

**O que fazer:**
Adicionar duas novas colunas na tabela:

1. **Locais c/ Estoque**: Botão com popover mostrando todos os locais
2. **Tipo Controle**: Badge com o TIPCONTEST

Ver código completo na seção anterior do plano.

**Arquivos a atualizar:**

- `src/components/products/product-list.tsx`

**Critério de aceitação:**

- [ ] Coluna "Locais c/ Estoque" adicionada
- [ ] Coluna "Tipo Controle" adicionada
- [ ] Popover de locais funcionando
- [ ] Badge de tipo de controle funcionando
- [ ] Integração com filtro de local
- [ ] Mobile responsive

---

#### Task 3.3: Remover Sidebar e Integrar Toolbar

**Arquivo:** `sankhya-products-dashboard/src/app/produtos/page.tsx` (ATUALIZAR)

**O que fazer:**

1. Remover sidebar e usar toolbar:

   ```typescript
   export default function Page() {
     return (
       <BaseLayout title="Produtos" description="Gerencie os produtos do sistema">
         <div className="@container/main">
           {/* Toolbar de filtros - sempre visível */}
           <ProductToolbarFilters />

           {/* Conteúdo principal sem sidebar */}
           <div className="px-4 lg:px-6 py-6">
             <ErrorBoundary title="Erro na Lista de Produtos">
               <DataBoundaryWrapper title="Erro ao carregar produtos">
                 <ProductList />
               </DataBoundaryWrapper>
             </ErrorBoundary>
           </div>
         </div>
       </BaseLayout>
     );
   }
   ```

2. Remover/deprecar componentes antigos:
   - `product-filters-sidebar.tsx` → manter por compatibilidade mas não usar
   - Documentar deprecação no arquivo

**Arquivos a atualizar:**

- `src/app/produtos/page.tsx`
- `src/components/products/product-filters-sidebar.tsx` (adicionar comentário de deprecação)

**Critério de aceitação:**

- [ ] Sidebar removida da página
- [ ] Toolbar integrada e funcionando
- [ ] Layout responsivo sem sidebar
- [ ] Mais espaço para tabela de produtos
- [ ] Design limpo e moderno

---

### FASE 4: Melhorias de UX/UI

#### Task 4.1: Adicionar Indicadores Visuais de Estoque Baixo

**Arquivo:** `sankhya-products-dashboard/src/components/products/product-list.tsx` (ATUALIZAR)

**O que fazer:**
Atualizar coluna de estoque com indicadores visuais:

- Ícone de alerta vermelho quando estoque < mínimo
- Tooltip explicativo
- Cor vermelha no texto quando crítico

Ver código completo na seção anterior do plano.

**Arquivos a atualizar:**

- `src/components/products/product-list.tsx`

**Critério de aceitação:**

- [ ] Indicador visual de estoque baixo
- [ ] Tooltip explicativo
- [ ] Cores semânticas (vermelho para baixo)
- [ ] Performance mantida

---

#### Task 4.2: Melhorar Modal de Detalhes com Abas de Locais

**Arquivo:** `sankhya-products-dashboard/src/components/products/product-details-modal.tsx` (ATUALIZAR)

**O que fazer:**
Adicionar nova aba "Locais de Estoque" no modal com:

- Lista de todos os locais com estoque
- Cards para cada local
- Alertas visuais para estoque baixo
- Informações de controle por local

Ver código completo na seção anterior do plano.

**Arquivos a atualizar:**

- `src/components/products/product-details-modal.tsx`

**Critério de aceitação:**

- [ ] Nova aba "Locais de Estoque"
- [ ] Cards para cada local
- [ ] Alertas de estoque baixo
- [ ] Design consistente
- [ ] Mobile responsive

---

## 📊 Resumo de Entregas

### Backend (API)

| Task | Arquivo                | Status     | Prioridade |
| ---- | ---------------------- | ---------- | ---------- |
| 1.1  | `tgfloc.controller.ts` | 🔄 A fazer | Alta       |
| 1.2  | `tgfpro.controller.ts` | 🔄 A fazer | Alta       |
| 1.3  | `tgfpro.service.ts`    | 🔄 A fazer | Alta       |

### Frontend (Dashboard)

| Task | Arquivo                       | Status     | Prioridade |
| ---- | ----------------------------- | ---------- | ---------- |
| 2.1  | `products-store.ts`           | 🔄 A fazer | Alta       |
| 2.2  | `locations-api.ts`            | 🔄 A fazer | Alta       |
| 2.3  | `product-service.ts`          | 🔄 A fazer | Alta       |
| 3.1  | `product-toolbar-filters.tsx` | 🔄 A fazer | Alta       |
| 3.2  | `product-list.tsx`            | 🔄 A fazer | Alta       |
| 3.3  | `produtos/page.tsx`           | 🔄 A fazer | Alta       |
| 4.1  | `product-list.tsx`            | 🔄 A fazer | Média      |
| 4.2  | `product-details-modal.tsx`   | 🔄 A fazer | Média      |

## 🎯 Critérios de Aceitação Gerais

### Backend

- [ ] Todos os endpoints documentados no Swagger
- [ ] Response time < 500ms para queries simples
- [ ] Response time < 1s para queries com locais
- [ ] Campos TIPCONTEST e LISCONTEST incluídos
- [ ] Join com TGFLOC funcionando
- [ ] Filtros por local funcionando

### Frontend

- [ ] Interface Product completa
- [ ] Toolbar moderna funcionando
- [ ] Filtros por local funcionando
- [ ] Coluna de locais na tabela
- [ ] Modal de detalhes com aba de locais
- [ ] Design responsivo mobile-first
- [ ] Loading states em todas as operações
- [ ] Error boundaries implementados
- [ ] TypeScript sem erros

## 📝 Preceitos Ralph Seguidos

### 1. ✅ Especificidade e Detalhe

- Tasks específicas com arquivos, funções e código exato
- SQL queries documentadas
- Interfaces TypeScript detalhadas

### 2. ✅ Funcionalidade Completa

- Implementação end-to-end (backend + frontend)
- Todos os campos necessários incluídos
- Integração completa com TGFLOC e controles

### 3. ✅ Melhores Práticas

- Seguindo padrões NestJS e React
- TypeScript strict mode
- React Query para cache
- Componentes reutilizáveis

### 4. ✅ Arquitetura e Padrões

- Reutilizando estrutura existente
- Mantendo convenções do projeto
- Separação de responsabilidades clara

### 5. ✅ Qualidade Enterprise

- Performance otimizada (< 1s)
- Error handling robusto
- Loading states consistentes
- Mobile responsive

### 6. ✅ Design Moderno

- Toolbar ao invés de sidebar
- Componentes shadcn/ui
- Indicadores visuais claros
- UX intuitiva

---

## 🔄 Ordem de Implementação

### Backend

1. Task 1.1 - Criar módulo TGFLOC
2. Task 1.2 - Endpoint produtos com locais
3. Task 1.3 - Filtros de controle

### Frontend Base

1. Task 2.1 - Atualizar interfaces
2. Task 2.2 - API client locais
3. Task 2.3 - Atualizar product API

### UI Remodelada

1. Task 3.1 - Toolbar moderna
2. Task 3.2 - Coluna de locais
3. Task 3.3 - Remover sidebar

### Refinamento

1. Task 4.1 - Indicadores visuais
2. Task 4.2 - Modal de detalhes

---

**Prioridade:** Alta
**Risco:** Baixo
**Complexidade:** Média
