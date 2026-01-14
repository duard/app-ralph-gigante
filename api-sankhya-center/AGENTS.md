# Ralph Driven Development - Operational Guide

## Core Philosophy

**"Erecting Signs"**: Bad AI results = bad prompts, bad context, or bad data access. When Ralph fails, don't just fix the code - fix the prompt and add a sign to AGENTS.md.

## Important Notes

### Usuarios Module Bug

The `usuarios` model in Prisma schema does NOT have an `email` field. The existing UsuariosService code references `email` in the create method (for uniqueness check) and in select statements, which causes TypeScript errors. This is a pre-existing bug that should be fixed separately. The model only has: `usuario`, `nome`, `senha`, `ultimo`, `nivel`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`.

### Missing Components

The frontend Users module references `PasswordInput` component from `@/components/ui/password-input` but this component doesn't exist in the codebase. This causes build failures. The form should use regular Input component instead.

### Git Corruption Issue

The local git repository is currently corrupted with multiple empty/missing object files. `git fsck` shows corruption in .git/objects/ (files 18, 1e, 26, 2b, 96, ab, b2, b5, b6, d3, d5, f6). This prevents git operations like commit and push. Remote fetch also fails with "did not send all necessary objects". Human intervention required to:

1. Clone fresh from origin or
2. Run git gc --prune=now and/or
3. Remove .git folder and reinitialize from remote

## Quick Start

### Option 1: Official Ralph CLI (Recommended)

```bash
# Install
bun install -g @hona/ralph-cli

# Run in project directory
ralph

# Or with custom options
ralph --plan plan.md --model opencode/claude-opus-4-5
```

### Option 2: Shell Loop (Manual)

```bash
while :; do
  opencode run -m "opencode/claude-opus-4-5" "READ all of plan.md. Pick ONE task. If needed, verify via web/code search. Complete task. Commit change (update plan.md in same commit). Update plan.md. If you learn critical operational detail, update AGENTS.md. When ALL tasks complete, create .ralph-done and exit. Pushes are permitted after successful builds; the automated loop may remain commit-only."
done
```

### PowerShell (Windows)

```powershell
while ($true) {
  opencode run -m "opencode/claude-opus-4-5" "READ all of plan.md. Pick ONE task. If needed, verify via web/code search. Complete task. Commit change (update plan.md in same commit). Update plan.md. If you learn critical operational detail, update AGENTS.md. When ALL tasks complete, create .ralph-done and exit. NEVER GIT PUSH. ONLY COMMIT."
}
```

## Keybindings (Ralph CLI TUI)

| Key            | Action       |
| -------------- | ------------ |
| `p`            | Pause/resume |
| `q` / `Ctrl+C` | Quit         |

## Project Structure

```
pontal/
├── plan.md           # Backlog with checkboxes - source of truth
├── AGENTS.md         # This file - operational knowledge
├── api/              # NestJS backend
│   └── src/common/AGENTS.md  # Backend-specific patterns
├── front-erp/        # React/Vite frontend
├── docker-compose.yml
└── Makefile
```

## Files Managed by Ralph

| File                | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `.ralph-state.json` | Persisted state for resume after Ctrl+C    |
| `.ralph-lock`       | Prevents multiple instances                |
| `.ralph-done`       | Agent creates this when all tasks complete |
| `.ralph-pause`      | Created by `p` key to pause loop           |

Add to `.gitignore`:

```
.ralph-*
```

## Build Commands

```bash
# API
cd api && npm run start:dev        # Development
npm run build                      # Production build
npm run test                       # Unit tests
npx prisma migrate dev             # Database migration
npx prisma generate                # Generate Prisma client

# Frontend
cd front-erp && pnpm dev           # Development
pnpm build                         # Production build
pnpm lint                          # Run ESLint
pnpm test                          # Run tests

# All services
docker-compose up -d               # Start all services
make migrate                       # Run database migrations
make test-all                     # Test both projects
make build-all                    # Build both projects
```

## Verification Standards

### Backend Verification

- Run `npm run test` - all tests must pass
- Run `npm run lint` - no new warnings
- Verify Prisma schema: `npx prisma validate`
- Check Swagger docs: `http://localhost:3000/api`

### Frontend Verification

- Run `pnpm build` - build must succeed
- Run `pnpm lint` - no errors
- TypeScript check: `pnpm tsc --noEmit`

### Strictness Rules

- `<TreatWarningsAsErrors>true</TreatWarningsAsErrors>` equivalent enforcement
- Lint errors block commit
- TypeScript errors block commit
- Failing tests block commit

## Backpressure Checklist

Before committing, verify:

- [ ] Code compiles/builds successfully
- [ ] All tests pass
- [ ] No lint errors
- [ ] No TypeScript errors
- [ ] Follows existing code patterns
- [ ] plan.md updated with checkbox marked

## Git Workflow

1. **Commit & Push when builds pass**: After `front-erp` `pnpm build` succeeds (no errors) and `api` `pnpm build` or `npm run build` succeeds, commit and push to enable small, frequent progress.
2. **Loop behavior**: If running the headless loop, it may operate commit-only; pushes can be done manually after build verification.
3. **Review & PR**: Human reviews pushed commits; open PRs when appropriate.
4. **Conventional commits**: Use `feat:`, `fix:`, `docs:`, `refactor:` prefixes

## Context Management

### Before Each Task

1. READ `plan.md` - understand current state
2. READ `AGENTS.md` - review operational patterns
3. READ `progress.txt` - learn from past iterations
4. Verify via code search/web if needed

### After Each Task

1. Update `plan.md` - mark task as complete
2. Update `AGENTS.md` - add new operational knowledge
3. Commit changes
4. Move to next task

## Common Patterns

### TGFPRO2 Module (Produtos com Estoque por Local)

**Descobertas da implementação:**

1. **Paginação**:
   - `buildPaginatedResult` aceita objeto: `{ data, total, page, perPage }`
   - Não usar parâmetros separados (padrão antigo)
   - Sempre calcular `total` antes da paginação

2. **SankhyaApiService**:
   - Método correto: `executeQuery(query, params)`
   - NÃO usar: `executarQuery` (nomenclatura antiga)
   - **IMPORTANTE**: A API Sankhya externa NÃO processa placeholders (`?` ou `@nome`)
   - Usar concatenação direta de valores na query SQL
   - Para strings com LIKE: usar concatenação com escape de aspas: `str.replace(/'/g, "''")`
   - Para números: concatenar diretamente sem aspas
   - **Exemplo correto**: `WHERE CODPROD = ${codprod}` com `executeQuery(query, [])`
   - **Exemplo correto (string)**: `WHERE DESCRPROD LIKE '%${search.replace(/'/g, "''")}%'` com `executeQuery(query, [])`
   - **Exemplo ERRADO**: `WHERE CODPROD = ?` com `executeQuery(query, [codprod])` - API Sankhya não processa placeholders

3. **Estrutura de Módulos Sankhya**:
   ```
   tgfpro2/
   ├── interfaces/          # Tipos TypeScript
   │   ├── estoque-local.interface.ts
   │   ├── produto2.interface.ts
   │   ├── produto-kpi.interface.ts
   │   └── index.ts        # Barrel export
   ├── dtos/               # DTOs com validação
   │   ├── produto-find-all.dto.ts
   │   └── index.ts
   ├── tgfpro2.service.ts  # Lógica de negócio
   ├── tgfpro2.controller.ts
   └── tgfpro2.module.ts
   ```

4. **Estoque por Local (TGFEST)**:
   - Chave composta: `(CODPROD, CODLOCAL, CONTROLE)`
   - Filtrar sempre: `CODPARC = 0` (estoque próprio)
   - Filtrar sempre: `ATIVO = 'S'`
   - `CONTROLE` pode ser NULL ou vazio
   - Status calculado: NORMAL, BAIXO, CRITICO, EXCESSO

5. **Queries SQL - Boas Práticas**:
   - Usar parâmetros nomeados para evitar SQL injection
   - WITH (NOLOCK) em todas as tabelas para performance
   - Sempre fazer LEFT JOIN para relacionamentos opcionais
   - ORDER BY no final da query

6. **Enriquecimento de Dados**:
   - Fazer enriquecimento de estoque apenas se solicitado
   - Usar flags: `includeEstoque`, `includeEstoqueLocais`
   - Processar após paginação (não antes)

### Prisma

- Soft-delete uses `deleted_at DateTime? @default(dbgenerated("NULL")) @db.Timestamp(6)`
- Audit fields: `created_by Int?` and `updated_by Int?` reference `usuarios.usuario`
- Composite keys use `@@id([field1, field2])`

### NestJS

- Global filters use `APP_FILTER` provider token
- Module structure: `module.controller.ts`, `module.service.ts`, `module.module.ts`
- DTOs in `common/dto/`, filters in `common/filters/`

### Frontend

- React Query for data fetching
- TanStack Table for data grids
- Zod for validation
- Shadcn/ui components
- Components may have Next.js imports (e.g., `next/navigation`) that need to be replaced with `react-router-dom` for Vite compatibility. Change `Link` props from `href` to `to`.

## Brownfield Process

1. **Plan Phase**: Spend time on plan.md until solid
2. **Loop Phase**: Run headless execution loop
3. **Review Phase**: Human reviews each commit
4. **PR Phase**: Raise PR when satisfied

## Stop Conditions

Exit loop when:

- All tasks in plan.md are complete
- Critical error requires human intervention
- User manually stops

## Debugging

If agent fails repeatedly:

1. Check `progress.txt` for patterns
2. Add more specific instructions to AGENTS.md
3. Break task into smaller subtasks in plan.md
4. Provide more context in the prompt

## Learning from Failures

When Ralph falls off the slide:

1. Don't just fix the code
2. Add a "sign" to AGENTS.md
3. Update plan.md to be more specific
4. Prevent future failures with better context
