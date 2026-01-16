# Como Testar o Sistema de Ordens de Serviço

**Guia passo a passo para testar o sistema completo**

---

## 🚀 INICIANDO OS SERVIÇOS

### 1. Backend (API)

```bash
cd /home/carloshome/z-ralph-code/api-sankhya-center

# Instalar dependências (se necessário)
npm install

# Iniciar em modo desenvolvimento
npm run start:dev

# Ou em produção
npm run build
npm run start:prod
```

**Verificar:** Backend rodando em `http://localhost:3100`

### 2. Frontend (Dashboard)

```bash
cd /home/carloshome/z-ralph-code/sankhya-products-dashboard

# Instalar dependências (se necessário)
pnpm install

# Iniciar em modo desenvolvimento
pnpm run dev
```

**Verificar:** Frontend rodando em `http://localhost:5173`

---

## 🧪 TESTANDO O BACKEND

### Via Swagger UI

1. Acessar: `http://localhost:3100/api`
2. Procurar pela seção **"tcfoscab"**
3. Testar cada endpoint:

#### Test 1: Listar OS
```
GET /tcfoscab
Query params:
  - status: E
  - perPage: 10
```
**Resultado esperado:** Lista de 10 OS em execução

#### Test 2: OS por ID
```
GET /tcfoscab/12345
```
**Resultado esperado:** Detalhes completos de uma OS

#### Test 3: Estatísticas
```
GET /tcfoscab/stats/geral
```
**Resultado esperado:**
```json
{
  "totalOS": 150,
  "finalizadas": 120,
  "emExecucao": 20,
  "preventivas": 80,
  ...
}
```

### Via cURL

```bash
# Obter token
TOKEN=$(node src/utils/getToken.js)

# Listar OS
curl -X GET "http://localhost:3100/tcfoscab?status=E&perPage=10" \
  -H "Authorization: Bearer $TOKEN"

# Detalhes de uma OS
curl -X GET "http://localhost:3100/tcfoscab/12345" \
  -H "Authorization: Bearer $TOKEN"

# Estatísticas
curl -X GET "http://localhost:3100/tcfoscab/stats/geral" \
  -H "Authorization: Bearer $TOKEN"

# OS Ativas
curl -X GET "http://localhost:3100/tcfoscab/stats/ativas" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🌐 TESTANDO O FRONTEND

### 1. Fazer Login

1. Acessar: `http://localhost:5173`
2. Se não estiver logado, será redirecionado para `/auth/entrar`
3. Fazer login com credenciais válidas

### 2. Acessar Dashboard de OS

1. Navegar para: `http://localhost:5173/ordens-servico`
2. **Verificar:**
   - [ ] 8 cards de estatísticas aparecem
   - [ ] Tabela de OS ativas carrega
   - [ ] Gráfico de produtividade renderiza
   - [ ] Gráfico de produtos renderiza
   - [ ] Botão "Atualizar" funciona
   - [ ] Loading states aparecem

### 3. Testar Listagem

1. Click em "Ver Todas" ou navegar para `/ordens-servico/listagem`
2. **Testar filtros:**
   - [ ] Buscar por placa (ex: "ABC")
   - [ ] Filtrar por Status "Em Execução"
   - [ ] Filtrar por Manutenção "Corretiva"
   - [ ] Limpar filtros
3. **Testar paginação:**
   - [ ] Click em "Próxima"
   - [ ] Click em número de página
   - [ ] Verificar contador de resultados

### 4. Testar Detalhes

1. Click em uma OS da listagem
2. **Verificar página de detalhes:**
   - [ ] Cabeçalho com OS#, badges de status
   - [ ] Informações do veículo
   - [ ] Datas (abertura, início, previsão)
   - [ ] Cards de totais (serviços, horas, produtos, custo)

3. **Testar Tab Serviços:**
   - [ ] Lista de serviços carrega
   - [ ] Valores aparecem formatados
   - [ ] Total calculado corretamente

4. **Testar Tab Apontamentos:**
   - [ ] Lista de apontamentos carrega
   - [ ] Horas formatadas (Xh Ym)
   - [ ] Cards de totais aparecem
   - [ ] Lista de executores aparece

5. **Testar Tab Produtos:**
   - [ ] Lista de produtos carrega
   - [ ] Quantidades e valores corretos
   - [ ] Totalizadores funcionam

---

## 🔍 TESTES DE PERFORMANCE

### Cache do React Query

1. Acessar `/ordens-servico/listagem`
2. Abrir DevTools → Network
3. Click em uma OS
4. **Voltar** para listagem
5. **Verificar:** Dados aparecem instantaneamente (cache)
6. Aguardar 30 segundos
7. Verificar que faz nova requisição (staleTime)

### Auto-refresh

1. Acessar `/ordens-servico`
2. Abrir DevTools → Network
3. Observar requisições
4. **Verificar:**
   - Requisição para `/stats/ativas` a cada ~60 segundos
   - Outras queries não refazem automaticamente

---

## 🐛 TESTES DE EDGE CASES

### 1. OS sem dados

```bash
# Criar OS mock vazia
# Navegar para detalhes
# Verificar mensagens "Nenhum serviço cadastrado"
```

### 2. Erros de rede

```bash
# Parar o backend
# Tentar acessar dashboard
# Verificar:
# - Error boundaries funcionam
# - Mensagens de erro aparecem
# - Não quebra a aplicação
```

### 3. Token expirado

```bash
# Aguardar token expirar (1h)
# Tentar fazer requisição
# Verificar redirect para login
```

### 4. Responsividade

```
# Abrir DevTools
# Alternar entre:
# - Mobile (375px)
# - Tablet (768px)
# - Desktop (1920px)
# Verificar layout adapta corretamente
```

---

## 📊 TESTES DE DADOS

### Consultas SQL Diretas

```sql
-- Verificar total de OS
SELECT COUNT(*) FROM TCFOSCAB WITH(NOLOCK)

-- Verificar OS ativas
SELECT COUNT(*)
FROM TCFOSCAB WITH(NOLOCK)
WHERE STATUS IN ('E', 'A')

-- Verificar apontamentos de uma OS específica
SELECT *
FROM TCFSERVOSATO WITH(NOLOCK)
WHERE NUOS = 12345

-- Verificar cálculo de horas
SELECT
  NUOS,
  DATEDIFF(MINUTE, DHINI, DHFIN) AS MINUTOS_TOTAIS,
  INTERVALO,
  DATEDIFF(MINUTE, DHINI, DHFIN) -
    CASE
      WHEN INTERVALO >= 100 AND (INTERVALO % 100) < 60
        THEN (INTERVALO / 100) * 60 + (INTERVALO % 100)
      ELSE INTERVALO
    END AS MINUTOS_LIQUIDOS
FROM TCFSERVOSATO WITH(NOLOCK)
WHERE NUOS = 12345
```

### Comparar Backend vs Frontend

1. Buscar estatísticas via API:
```bash
curl -X GET "http://localhost:3100/tcfoscab/stats/geral" \
  -H "Authorization: Bearer $TOKEN" | jq
```

2. Acessar frontend e comparar valores nos cards

3. **Verificar:** Números batem exatamente

---

## ✅ CHECKLIST DE TESTES

### Backend
- [ ] Todos os 9 endpoints respondem
- [ ] Filtros funcionam corretamente
- [ ] Paginação retorna dados corretos
- [ ] Joins estão funcionando (veiculo, usuario, produto)
- [ ] Cálculos de horas estão corretos
- [ ] Queries executam em < 1s
- [ ] Swagger documenta corretamente

### Frontend
- [ ] Dashboard carrega sem erros
- [ ] Todos os cards aparecem
- [ ] Gráficos renderizam
- [ ] Filtros funcionam
- [ ] Paginação funciona
- [ ] Detalhes carregam
- [ ] Todas as tabs funcionam
- [ ] Loading states aparecem
- [ ] Error boundaries funcionam
- [ ] Responsivo em mobile
- [ ] Cache funciona
- [ ] Auto-refresh funciona

### Integração
- [ ] Login persiste entre páginas
- [ ] Token é enviado em todas requisições
- [ ] Dados batem entre backend e frontend
- [ ] Navegação entre páginas funciona
- [ ] Links diretos funcionam (deep linking)
- [ ] Botão voltar funciona
- [ ] Refresh da página mantém estado

---

## 🔥 TESTES AVANÇADOS

### Performance

```javascript
// Console do navegador
// Medir tempo de carregamento
performance.mark('start')
// Navegar para /ordens-servico
performance.mark('end')
performance.measure('pageLoad', 'start', 'end')
console.log(performance.getEntriesByName('pageLoad'))

// Target: < 2 segundos
```

### Memory Leaks

```javascript
// 1. Abrir DevTools → Memory
// 2. Take Heap Snapshot
// 3. Navegar entre páginas 10x
// 4. Take Heap Snapshot novamente
// 5. Comparar snapshots
// Verificar: Não deve crescer significativamente
```

### Network

```
# DevTools → Network
# Disable cache
# Reload página
# Verificar:
# - Total de requests < 50
# - Total size < 2MB
# - DOMContentLoaded < 1s
# - Load < 3s
```

---

## 📝 REPORT DE BUGS

Se encontrar bugs, documentar:

```markdown
### Bug: [Título]
**Severidade:** Crítico/Alto/Médio/Baixo
**Página:** /ordens-servico/listagem
**Passos para reproduzir:**
1. Acessar listagem
2. Filtrar por status "E"
3. Click em paginação
**Resultado esperado:** ...
**Resultado atual:** ...
**Console errors:** ...
**Screenshot:** [anexar]
```

---

## 🎯 CENÁRIOS DE TESTE

### Cenário 1: Gestor de Manutenção
```
1. Login como gestor
2. Acessar dashboard
3. Verificar quantas OS estão atrasadas
4. Click em OS atrasada
5. Verificar dias em manutenção
6. Ver quem está executando
7. Verificar progresso (serviços concluídos)
```

### Cenário 2: Executor
```
1. Acessar listagem
2. Filtrar por "Em Execução"
3. Buscar pela placa do veículo
4. Abrir detalhes
5. Ver próximo serviço a executar
6. Verificar produtos necessários
```

### Cenário 3: Analista
```
1. Acessar dashboard
2. Ver gráfico de produtividade
3. Identificar top executores
4. Ver produtos mais utilizados
5. Planejar estoque
```

---

## 🚀 APÓS OS TESTES

### Se tudo estiver OK:

1. **Documentar resultados:**
```bash
echo "✅ Todos os testes passaram" > /tmp/test-results.txt
date >> /tmp/test-results.txt
```

2. **Preparar para produção:**
```bash
# Build frontend
cd sankhya-products-dashboard
pnpm run build

# Build backend
cd api-sankhya-center
npm run build
```

3. **Deploy:**
```bash
# Seguir processo de deploy da empresa
# Atualizar DNS
# Configurar SSL
# Monitorar logs
```

### Se houver erros:

1. Verificar logs do backend
2. Verificar console do navegador
3. Verificar Network tab
4. Documentar bug
5. Corrigir
6. Re-testar

---

**Happy Testing! 🧪✨**
