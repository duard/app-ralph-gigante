# Plano de Melhorias - Frontend Sankhya Products Dashboard

**Data de Criação:** 2026-01-15
**Status:** Em Progresso
**Baseado em:** Análise completa do codebase (379 arquivos TypeScript/TSX)

---

## ✅ CRÍTICO - CONCLUÍDO

### 1. Corrigir endpoint de busca 404
- **Status:** ✅ CONCLUÍDO
- **Arquivo:** `src/lib/api/product-service.ts`
- **Problema:** Endpoint `/tgfpro/search` não existia
- **Solução:** Alterado para `/tgfpro2/produtos` com parâmetros corretos
- **Commit:** 39c8ff75

### 2. Remover logging de tokens (SEGURANÇA)
- **Status:** ✅ CONCLUÍDO
- **Arquivo:** `src/lib/api/client.ts`
- **Problema:** Tokens expostos no console.log em produção
- **Solução:** Todos os logs protegidos com `import.meta.env.DEV`
- **Impacto:** Elimina risco de segurança XSS
- **Commit:** 39c8ff75

### 3. Corrigir rotas do command-search
- **Status:** ✅ CONCLUÍDO
- **Arquivo:** `src/components/command-search.tsx`
- **Problema:** Rotas apontavam para páginas inexistentes
- **Solução:**
  - `/produtos/detalhados` → `/produtos-v2/dashboard`
  - `/qualidade/produtos-sem-ncm` → `/produtos-v2/qualidade/sem-ncm`
  - `/produtos/analise-consumo` → `/produtos-v2/consumo`
- **Commit:** 39c8ff75

### 4. Remover arquivos .bak
- **Status:** ✅ CONCLUÍDO
- **Arquivos removidos:**
  - `src/app/produtos-v2/qualidade/sem-ncm/page.tsx.bak`
  - `src/lib/api/product-service.ts.bak`
- **Commit:** 39c8ff75

### 5. Remover sidebar e adicionar menu de usuário
- **Status:** ✅ CONCLUÍDO
- **Arquivos:**
  - `src/components/layouts/base-layout.tsx` - Sidebar removida
  - `src/components/site-header.tsx` - Menu de usuário adicionado
  - `src/components/header-user-menu.tsx` - Novo componente criado
- **Commit:** 0090fb3f

---

## 🔴 CRÍTICO - PENDENTE

### 6. Adicionar testes críticos (Cobertura <2%)
- **Prioridade:** 🔴 CRÍTICA
- **Status:** PENDENTE
- **Problema:** Apenas 5 arquivos de teste para 379 arquivos
- **Meta:** Atingir 60% de cobertura em 2 sprints
- **Ações:**
  1. Configurar Jest + React Testing Library adequadamente
  2. Adicionar testes para fluxos críticos:
     - Autenticação (login, logout, refresh token)
     - CRUD de produtos
     - Busca e filtros
     - Command menu navigation
  3. Configurar CI/CD com mínimo de cobertura
- **Arquivos prioritários:**
  - `src/hooks/use-products.ts`
  - `src/lib/api/client.ts`
  - `src/components/command-search.tsx`
  - `src/stores/auth-store.ts`

### 7. Consolidar hooks de produtos (11 → 3)
- **Prioridade:** 🔴 ALTA
- **Status:** PENDENTE
- **Problema:** 11 variações de hooks de produtos causam confusão
- **Hooks existentes:**
  - `use-products.ts`
  - `use-products-complete.ts`
  - `use-products-simplified.ts`
  - `use-products-with-cache.ts`
  - `use-product.ts`
  - `use-product-filters.ts`
  - `use-search-products.ts`
  - `use-create-product.ts`
  - `use-update-product.ts`
  - + 5 mais em `produtos-v2/`
- **Solução proposta:**
  ```typescript
  // Hook principal para queries
  useProducts(filters?: ProductFilters)

  // Hook para mutations (create, update, delete)
  useProductMutations()

  // Hook para state de filtros
  useProductFilters()
  ```
- **Impacto:** Reduz confusão, melhora manutenibilidade

---

## 🟠 ALTA PRIORIDADE

### 8. Remover 54 console.log restantes
- **Prioridade:** 🟠 ALTA
- **Status:** PENDENTE
- **Arquivos afetados:** 28 arquivos
- **Solução:**
  - Remover completamente ou
  - Proteger com `if (import.meta.env.DEV)`
- **Principais arquivos:**
  - `src/hooks/produtos-v2/*.ts`
  - `src/app/produtos-v2/consumo/*.tsx`
  - `src/lib/utils/*.ts`

### 9. Resolver route versioning (v2, v3)
- **Prioridade:** 🟠 ALTA
- **Status:** PENDENTE
- **Problema:** Múltiplas versões ativas sem clareza
- **Rotas duplicadas:**
  - `/produtos` vs `/produtos-v2`
  - `/produtos/:id/consumo` vs `/produtos/:id/consumo-v2` vs `/produtos/:id/consumo-v3`
  - `/dashboard` vs `/dashboard-2` vs `/dashboard-3`
- **Solução:**
  1. Escolher versão oficial para cada rota
  2. Adicionar redirects das versões antigas
  3. Marcar rotas deprecated com avisos
  4. Remover código não usado após 1 sprint

### 10. Corrigir 24 arquivos com `any` types
- **Prioridade:** 🟠 ALTA
- **Status:** PENDENTE
- **Problema:** Perda de type safety
- **Arquivos críticos:**
  - `src/types/consumo.ts`
  - `src/lib/utils/debounce.ts`
  - `src/app/produtos-v2/consumo/consulta-produto/*.tsx`
  - `src/app/seguranca/permissoes/page.tsx`
- **Solução:** Criar interfaces adequadas para cada caso

### 11. Implementar TODOs pendentes
- **Prioridade:** 🟠 ALTA
- **Status:** PENDENTE
- **TODOs encontrados:**
  1. **ALTA** - `src/App.tsx:17`: Fix route preloader (404 errors)
  2. **MÉDIA** - `src/app/produtos/produtos-page-container.tsx:215`: Abrir modal de locais
  3. **MÉDIA** - `src/app/produtos/produtos-page-container.tsx:220`: Abrir modal de detalhes
  4. **BAIXA** - `src/app/auth/sign-in/components/login-form-1.tsx:51`: Add remember me checkbox
  5. **BAIXA** - `src/hooks/produtos-v2/use-dashboard-charts.ts:203`: Integrar endpoint de movimentações

---

## 🟡 MÉDIA PRIORIDADE

### 12. Dividir componentes grandes (>500 linhas)
- **Prioridade:** 🟡 MÉDIA
- **Status:** PENDENTE
- **Componentes para refatorar:**
  1. `product-filters-sidebar.tsx` (827 linhas) → Dividir em 3-4 componentes
  2. `product-form.tsx` (715 linhas) → Separar seções do form
  3. `product-details-modal.tsx` (565 linhas) → Extrair tabs
  4. `product-list-complete.tsx` (553 linhas) → Separar table logic
- **Benefício:** Melhor testabilidade e manutenção

### 13. Consolidar componentes de filtro (7 → 1)
- **Prioridade:** 🟡 MÉDIA
- **Status:** PENDENTE
- **Componentes duplicados:**
  - `product-filters.tsx`
  - `product-filters-sidebar.tsx`
  - `product-filters-toolbar.tsx`
  - `stock-filters.tsx`
  - `active-filters.tsx`
  - `filter-panel.tsx`
  - `multi-select-filter.tsx`
- **Solução:** Criar componente unificado com composition pattern

### 14. Adicionar React.memo em componentes
- **Prioridade:** 🟡 MÉDIA
- **Status:** PENDENTE
- **Problema:** Nenhum componente usa React.memo
- **Alvos:**
  - Componentes de lista (ProductCard, ProductRow)
  - Leaf components em árvores grandes
  - Componentes com cálculos pesados

### 15. Melhorar tratamento de erros
- **Prioridade:** 🟡 MÉDIA
- **Status:** PENDENTE
- **Problema:** Tratamento inconsistente
- **Estratégias usadas:**
  - Toast notifications
  - Error boundaries
  - Nenhum tratamento
- **Solução:** Padronizar com error boundaries + toast

### 16. Adicionar atributos de acessibilidade
- **Prioridade:** 🟡 MÉDIA
- **Status:** PENDENTE
- **Problema:** Poucos componentes têm aria-*
- **Ações:**
  - Adicionar aria-labels em botões
  - Melhorar navegação por teclado
  - Testar com screen readers

---

## 🟢 BAIXA PRIORIDADE

### 17. Otimizar bundle size (22MB)
- **Prioridade:** 🟢 BAIXA
- **Status:** PENDENTE
- **Tamanho atual:** 22MB (dist/)
- **Ações:**
  1. Analisar com `vite-bundle-visualizer`
  2. Revisar dependências pesadas (jspdf, xlsx)
  3. Implementar lazy loading adicional
  4. Otimizar imagens e assets
- **Meta:** Reduzir para <10MB

### 18. Adicionar mais useMemo/useCallback
- **Prioridade:** 🟢 BAIXA
- **Status:** PENDENTE
- **Atual:** Usado em 15 arquivos
- **Adicionar em:** Componentes de lista sem otimização

### 19. Melhorar documentação
- **Prioridade:** 🟢 BAIXA
- **Status:** PENDENTE
- **README atual:** Básico
- **Adicionar:**
  - Decisões de arquitetura
  - Guias de componentes
  - Estratégia de testes
  - Processo de deploy
  - Guidelines de contribuição

### 20. Adicionar JSDoc comments
- **Prioridade:** 🟢 BAIXA
- **Status:** PENDENTE
- **Alvos:** Todos componentes e hooks exportados

### 21. Criar .env.example
- **Prioridade:** 🟢 BAIXA
- **Status:** PENDENTE
- **Problema:** `.env` existe mas sem template
- **Solução:** Criar `.env.example` com valores dummy

### 22. Consolidar state management
- **Prioridade:** 🟢 BAIXA
- **Status:** PENDENTE
- **Problema:** Duplicação entre Zustand e React Query
- **Solução:** Escolher uma fonte de verdade (React Query recomendado)

---

## 📊 MÉTRICAS ATUAIS

| Métrica | Valor | Meta |
|---------|-------|------|
| Total de Arquivos | 379 | - |
| Componentes | 130 | - |
| Páginas | 48 | Consolidar para ~30 |
| Hooks | 36 | Consolidar para ~20 |
| Stores | 5 | OK |
| Arquivos de Teste | 5 | 200+ |
| Cobertura de Testes | <2% | 60% |
| console.log | 54 | 0 (produção) |
| TypeScript any | 24 arquivos | 0 |
| Bundle Size | 22MB | <10MB |
| TODOs Críticos | 3 | 0 |

---

## 🗓️ CRONOGRAMA SUGERIDO

### Sprint 1 (Semana 1-2): Crítico
- ✅ Fix search endpoint 404
- ✅ Remove token logging
- ✅ Fix command-search routes
- ✅ Remove .bak files
- ⏳ Adicionar testes críticos (auth, products CRUD)
- ⏳ Consolidar hooks de produtos
- ⏳ Remover console.log restantes

### Sprint 2 (Semana 3-4): Alta Prioridade
- Resolver route versioning
- Corrigir TypeScript `any` types
- Implementar TODOs pendentes
- Dividir componentes grandes

### Sprint 3 (Semana 5-6): Média Prioridade
- Consolidar componentes de filtro
- Adicionar React.memo
- Padronizar error handling
- Melhorar acessibilidade

### Sprint 4 (Semana 7-8): Baixa Prioridade
- Otimizar bundle size
- Melhorar documentação
- Adicionar JSDoc
- Consolidar state management

---

## 🎯 QUICK WINS (Fazer Primeiro)

1. ✅ Remove .bak files (5 min)
2. ✅ Fix search endpoint (10 min)
3. ✅ Fix command-search routes (15 min)
4. ✅ Secure token logging (15 min)
5. ⏳ Create .env.example (5 min)
6. ⏳ Remove remaining console.logs (30 min)
7. ⏳ Fix ESLint disable warning (10 min)

---

## 📝 NOTAS IMPORTANTES

- **Priorizar testes:** A baixa cobertura é o maior risco
- **Não quebrar produção:** Todas mudanças devem ser backwards compatible
- **Code review rigoroso:** Especialmente para consolidação de hooks
- **Documentar decisões:** Criar ADRs (Architecture Decision Records)
- **Medir impacto:** Antes e depois das otimizações de performance

---

## 🔗 REFERÊNCIAS

- Análise completa do codebase: Ver relatório detalhado em `/docs`
- PRODUTOS-V2-README.md: Excelente exemplo de documentação
- TypeScript Strict Mode: Considerar habilitar gradualmente
- React 19 Best Practices: Revisar novas features

---

**Última Atualização:** 2026-01-15
**Próxima Revisão:** Após Sprint 1
