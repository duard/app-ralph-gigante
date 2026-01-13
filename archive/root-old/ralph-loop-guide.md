# Guia para Executar Ralph Loop

## Pré-requisitos

1. **Instalar o comando /ralph do OpenCode** (caso ainda não esteja instalado):

```bash
npx shadcn@latest add https://brennanmceachran.github.io/agent-utils/ralph-loop-opencode.json
```

2. **Reiniciar o OpenCode** após a instalação para registrar o comando `/ralph`

3. **Verificar se o comando está disponível** tentando usar `/ralph help`

## Estrutura do Projeto

```
/home/carloshome/z-ralph-code/
├── prd-app-produtos-sankhya.md          # PRD principal (para o Ralph Loop)
├── tasks-app-produtos-sankhya.md        # Lista detalhada de tasks (referência)
├── api-sankhya-center/                  # API existente (consumo)
└── shadcn-dashboard-landing-template/   # Template base (copiar)
    └── vite-version/                    # Versão Vite do template
```

## Como Executar o Ralph Loop

### Passo 1: Preparar o ambiente

```bash
# Navegar para o diretório do projeto
cd /home/carloshome/z-ralph-code

# Verificar se a API está rodando
curl http://localhost:3000/tgfpro/admin/test

# Se não estiver rodando, iniciar a API
cd api-sankhya-center
npm run start:dev
```

### Passo 2: Executar o Ralph Loop

No OpenCode, mude para o agente **Ralph** e execute:

```bash
/ralph @prd-app-produtos-sankhya.md 50
```

**Parâmetros:**

- `@prd-app-produtos-sankhya.md` - Caminho para o arquivo PRD
- `50` - Número máximo de iterações (pode ser ajustado)

### Passo 3: Acompanhar o progresso

O Ralph Loop irá:

1. Ler o PRD
2. Executar tasks progressivamente
3. Atualizar a seção **Progress** no PRD após cada iteração
4. Continuar até encontrar `RALPH_DONE` ou atingir o limite de iterações

### Passo 4: Interagir durante a execução (opcional)

Se precisar direcionar o agente:

1. Digite uma mensagem e pressione Enter
2. O OpenCode irá inserir sua mensagem na próxima oportunidade
3. O agente será guiado na direção correta

### Passo 5: Parar o loop

Pressione `Ctrl+C` ou execute:

```bash
/ralph stop
```

## Estrutura do PRD para o Ralph Loop

O arquivo `prd-app-produtos-sankhya.md` contém:

### Seções Obrigatórias (validadas pelo Ralph)

1. **TL;DR** - Resumo de uma frase do objetivo
2. **Goal** - Resultado esperado quando concluído
3. **Constraints** - Restrições técnicas
4. **Acceptance Criteria** - Lista de checklists observáveis
5. **Verification** - Testes e verificações para provar que funciona
6. **Progress** - Log de progresso atualizado a cada iteração

### Seções Adicionais

- **Notes** - Informações para o loop lembrar a cada iteração
- Detalhes da API
- Arquitetura sugerida
- Convenções de código
- Design System

## Template de Progresso

O Ralph atualizará a seção **Progress** seguindo este template:

```markdown
### Título da Task - Data

- Resumo do que foi feito
- Decisões tomadas
- Assunções feitas
- Riscos identificados
- Status (pending, in_progress, completed, cancelled)
- Próximos passos estimados e por quê:
  - Próxima tarefa
  - Próxima tarefa?
```

## Checklist de Verificação do Progresso

A cada iteração, verifique se:

- [ ] A seção **Progress** foi atualizada
- [ ] Decisões e assunções foram documentadas
- [ ] Status foi atualizado
- [ ] Próximos passos foram estimados
- [ ] Tasks foram marcadas como concluídas nos Acceptance Criteria

## Modelos Recomendados para o Ralph Loop

Use modelos com alto reasoning para melhores resultados:

- `gpt-5.2-codex` (extra high reasoning) - **Recomendado**
- `Opus 4.5` - **Boa opção alternativa**

## Dicas para Obter Melhores Resultados

### 1. Comece com poucas iterações

Primeira vez:

```bash
/ralph @prd-app-produtos-sankhya.md 5
```

Ajuste conforme necessário:

```bash
/ralph @prd-app-produtos-sankhya.md 25
# ou
/ralph @prd-app-produtos-sankhya.md 50
```

### 2. Seja específico nos Acceptance Criteria

Quanto mais específicos os critérios, melhor o Ralph executará as tasks.

### 3. Documente tudo nas Notes

Use a seção **Notes** para lembrar o loop sobre:

- API endpoints específicos
- Convenções de código
- Decisões arquiteturais
- Padrões a seguir

### 4. Mantenha o PRD atualizado

Se mudar os requisitos:

1. Pare o loop (`Ctrl+C`)
2. Atualize o PRD
3. Reinicie o loop

### 5. Revise o progresso regularmente

O Ralph pode executar por horas sem supervisão, mas é bom revisar:

- A cada 10-15 iterações
- Se encontrar erros repetidos
- Se o progresso parecer estagnado

## Solução de Problemas

### Problema: O Ralph não valida o PRD

**Causa**: Seções obrigatórias estão vazias ou faltando.

**Solução**: Verifique se as seguintes seções existem e não estão vazias:

- Goal
- Acceptance Criteria
- Verification
- Progress

### Problema: Loop não avança

**Causa**: Tasks muito grandes ou genéricas.

**Solução**: Divida as tasks em passos menores e mais específicos nos Acceptance Criteria.

### Problema: Erros repetidos

**Causa**: Dependências faltando ou ambiente não configurado.

**Solução**: Verifique se:

- A API está rodando em localhost:3000
- Node.js e pnpm/npm estão instalados
- Dependências do template foram instaladas

### Problema: Progresso não é atualizado

**Causa**: O modelo está pulando a atualização da seção Progress.

**Solução**: Reinicie o loop e lembre o modelo para sempre atualizar a seção Progress ao final de cada iteração.

## Fluxo de Trabalho Sugerido

### Iteração 1-5: Setup Inicial

- Copiar template
- Configurar projeto
- Instalar dependências
- Configurar estrutura base

### Iteração 6-15: Infraestrutura

- Configurar rotas
- Configurar temas
- Configurar componentes shadcn-ui
- Configurar Axios e stores

### Iteração 16-25: Autenticação

- Criar tipos
- Criar API client
- Criar hooks
- Criar página de login
- Testar autenticação

### Iteração 26-40: Produtos (Listagem)

- Criar tipos de produtos
- Criar API client de produtos
- Criar hooks de produtos
- Implementar tabela de produtos
- Implementar filtros

### Iteração 41-50: Detalhes e CRUD

- Implementar modal de detalhes
- Implementar formulário de produto
- Implementar edição e exclusão

### Iteração 51-60: Dashboard

- Criar cards de métricas
- Criar gráficos
- Criar tabelas de destaque

### Iteração 61-70: UX/UI

- Implementar dark mode
- Implementar animações
- Implementar loading states
- Implementar responsividade

### Iteração 71-80: Testes

- Configurar ambiente de testes
- Criar testes de componentes
- Criar testes de integração

### Iteração 81-85: Documentação

- Criar README
- Documentar API
- Criar Style Guide

### Iteração 86-90: Performance e Deploy

- Otimizar build
- Configurar deploy
- Configurar monitoramento

## Finalização

Quando o Ralph encontrar `RALPH_DONE` ou completar todas as tasks:

1. **Revise o Progresso**

   ```bash
   cat prd-app-produtos-sankhya.md
   ```

2. **Execute os testes de verificação**
   - Verifique se os Acceptance Criteria foram atendidos
   - Execute os testes listados em Verification
   - Teste manualmente as funcionalidades críticas

3. **Build de produção**

   ```bash
   cd sankhya-products-dashboard
   npm run build
   ```

4. **Deploy**
   - Siga o guia de deploy em tasks-app-produtos-sankhya.md (Fase 15)

## Recursos Adicionais

- [Ralph Loop Documentation](https://brennanmceachran.github.io/agent-utils/registry/ralph-loop/)
- [Shadcn UI Components](https://ui.shadcn.com/)
- [React Router v7](https://reactrouter.com/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Vite Documentation](https://vitejs.dev/)
