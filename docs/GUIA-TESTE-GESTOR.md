# Guia de Testes - Sistema Completo

**Data:** 2026-01-16
**Versão:** 1.0
**Status:** ✅ APLICAÇÕES RODANDO

---

## 🚀 APLICAÇÕES DISPONÍVEIS

### ✅ Backend API (NestJS)
- **URL:** http://localhost:3100
- **Swagger:** http://localhost:3100/api
- **Health:** http://localhost:3100/health
- **Status:** 🟢 Online
- **PM2:** `api-sankhya-center`

### ✅ Frontend Dashboard (React)
- **URL:** http://localhost:5173
- **Status:** 🟢 Online
- **PM2:** `sankhya-dashboard`

---

## 📋 CHECKLIST DE TESTES

### 1️⃣ ORDENS DE SERVIÇO (NOVO! ✨)

#### Dashboard de OS
**URL:** http://localhost:5173/ordens-servico

**O que testar:**
- [ ] Cards de estatísticas aparecem (8 cards coloridos)
- [ ] Gráfico de produtividade renderiza (Top 10 executores)
- [ ] Gráfico de produtos mais utilizados aparece
- [ ] Tabela de OS ativas carrega
- [ ] Botão "Atualizar" funciona
- [ ] Botão "Ver Todas" navega para listagem

**Números esperados:**
- Total de OS: ~12,837
- Finalizadas: ~12,784
- Em Execução: ~31
- Abertas: ~20

---

#### Listagem de OS
**URL:** http://localhost:5173/ordens-servico/listagem

**O que testar:**
- [ ] Filtro por Status funciona (F, E, A, R)
- [ ] Filtro por Tipo de Manutenção (C, P, O)
- [ ] Filtro por Tipo (I, E)
- [ ] Busca por placa funciona
- [ ] Paginação funciona (Próxima/Anterior)
- [ ] Badges de status aparecem coloridos
- [ ] Click em OS navega para detalhes

**Como testar filtros:**
1. Selecionar "Em Execução" → Deve mostrar ~31 OS
2. Selecionar "Corretiva" → Deve mostrar ~7,239 OS
3. Buscar "ABC" → Filtra por placa

---

#### Detalhes da OS
**URL:** http://localhost:5173/ordens-servico/:nuos
(Acessar clicando em uma OS da listagem)

**O que testar:**

**Cabeçalho:**
- [ ] Número da OS aparece grande
- [ ] Badges de status coloridos
- [ ] Informações do veículo (placa, modelo)
- [ ] Datas formatadas (abertura, início, previsão)
- [ ] Cards de totais (serviços, horas, produtos, custo)

**Tab Serviços:**
- [ ] Lista de serviços carrega
- [ ] Valores aparecem formatados (R$)
- [ ] Status de cada serviço
- [ ] Total calculado no final

**Tab Apontamentos:**
- [ ] Lista de apontamentos carrega
- [ ] Horas formatadas (Xh Ym)
- [ ] Cálculo de horas líquidas
- [ ] Cards de totais de horas
- [ ] Lista de executores únicos

**Tab Produtos:**
- [ ] Lista de produtos/peças
- [ ] Quantidades e valores
- [ ] Totalizadores (qtd, valor)
- [ ] Referências e marcas

---

### 2️⃣ PRODUTOS (CORRIGIDO! 🔧)

#### Dashboard de Produtos
**URL:** http://localhost:5173/produtos-v2

**O que verificar:**
- [ ] ✅ NÃO há erros 404 no console
- [ ] ✅ Métricas de estoque carregam
- [ ] ✅ Filtros por local funcionam
- [ ] Cards de estatísticas aparecem
- [ ] Gráficos renderizam

**Erros corrigidos:**
- ✅ `/tgfloc` → Agora funciona
- ✅ `/estoque/metrics-comprehensive` → Agora funciona

---

### 3️⃣ BACKEND API (Swagger)

#### Testar via Swagger
**URL:** http://localhost:3100/api

**Endpoints para testar:**

**TCFOSCAB - Ordens de Serviço:**
- [ ] `GET /tcfoscab` - Lista OS
- [ ] `GET /tcfoscab/{nuos}` - Detalhes de uma OS
- [ ] `GET /tcfoscab/stats/geral` - Estatísticas
- [ ] `GET /tcfoscab/stats/ativas` - OS ativas

**TGFLOC - Locais (NOVO!):**
- [ ] `GET /tgfloc` - Lista locais
- [ ] `GET /tgfloc/{codlocal}` - Detalhes do local

**ESTOQUE - Métricas (NOVO!):**
- [ ] `GET /estoque/metrics-comprehensive` - Métricas de estoque

**Como testar no Swagger:**
1. Expandir seção
2. Click em "Try it out"
3. Preencher parâmetros (se necessário)
4. Click "Execute"
5. Verificar Response body

---

## 🎯 CENÁRIOS DE TESTE COMPLETOS

### Cenário 1: Gestor de Manutenção
```
1. Acessar http://localhost:5173/ordens-servico
2. Verificar quantas OS estão em execução (card azul)
3. Ver na tabela quais veículos estão em manutenção
4. Identificar OS atrasadas (badge vermelho "Crítico")
5. Click em uma OS atrasada
6. Ver detalhes → quantos dias em manutenção
7. Verificar progresso (serviços concluídos/total)
8. Ver quem está executando (tab Apontamentos)
```

### Cenário 2: Analista de Produtividade
```
1. Acessar dashboard de OS
2. Ver gráfico de produtividade
3. Identificar Top 3 executores
4. Ver gráfico de produtos mais utilizados
5. Planejar estoque baseado nos dados
6. Acessar listagem → Exportar relatório (preparado)
```

### Cenário 3: Mecânico/Executor
```
1. Acessar listagem de OS
2. Filtrar por "Em Execução"
3. Buscar pela placa do veículo
4. Abrir detalhes da OS
5. Ver próximo serviço a executar
6. Verificar produtos necessários (tab Produtos)
7. Ver histórico de trabalho (tab Apontamentos)
```

---

## 🔍 VERIFICAÇÕES DE CONSOLE

### Abrir DevTools (F12) → Console

**Não deve aparecer:**
- ❌ Erros 404
- ❌ Erros de CORS
- ❌ Token expirado

**Pode aparecer (normal):**
- ℹ️ Logs de requisições
- ℹ️ React Query cache updates
- ℹ️ Navigation logs

---

## 📊 DADOS ESPERADOS (Baseado em Investigação Real)

### Ordens de Serviço:
- **Total no sistema:** 12,837 OS
- **Status:**
  - Finalizadas (F): 12,784
  - Em Execução (E): 31
  - Abertas (A): 20
  - Reabertas (R): 2

- **Tipos:**
  - Corretiva (C): 7,239
  - Preventiva (P): 3,825
  - Outros (O): 1,198

- **Veículos:** 220
- **Executores:** ~50

### Produtos:
- **Total:** ~15,000 produtos
- **Locais:** ~10 depósitos
- **Com estoque:** ~12,000
- **Sem estoque:** ~3,000

---

## 🚨 SOLUÇÃO DE PROBLEMAS

### Problema: Frontend não carrega

**Solução:**
```bash
pm2 restart sankhya-dashboard
pm2 logs sankhya-dashboard --lines 50
```

### Problema: Backend retorna 500

**Solução:**
```bash
pm2 restart api-sankhya-center
pm2 logs api-sankhya-center --lines 50
```

### Problema: Erro 404 em endpoints

**Verificar:**
```bash
# Ver se backend está rodando
curl http://localhost:3100/health

# Ver Swagger
# Abrir: http://localhost:3100/api
# Verificar se endpoint existe
```

### Problema: Token expirado

**Solução:**
1. Fazer logout no frontend
2. Fazer login novamente
3. Token vale por 1 hora

---

## 📱 ACESSOS RÁPIDOS

### URLs Principais:
- 🏠 **Dashboard:** http://localhost:5173
- 🔧 **Ordens de Serviço:** http://localhost:5173/ordens-servico
- 📦 **Produtos:** http://localhost:5173/produtos-v2
- 📊 **API Docs:** http://localhost:3100/api

### Login:
- **Usuário:** CONVIDADO
- **Senha:** guest123

### Comandos PM2:
```bash
# Ver status
pm2 status

# Ver logs
pm2 logs

# Reiniciar tudo
pm2 restart all

# Parar tudo
pm2 stop all
```

---

## ✅ CHECKLIST FINAL

### Antes de reportar bug:
- [ ] Aplicações estão rodando (pm2 status)
- [ ] Backend health está OK (http://localhost:3100/health)
- [ ] Frontend carrega (http://localhost:5173)
- [ ] Fez logout/login se token expirou
- [ ] Limpou cache do navegador (Ctrl+Shift+R)
- [ ] Verificou console do navegador (F12)
- [ ] Verificou logs do PM2

### Se tudo OK:
- [ ] Dashboard de OS carrega
- [ ] Listagem de OS funciona
- [ ] Detalhes de OS aparecem
- [ ] Produtos carregam sem erro 404
- [ ] Métricas aparecem
- [ ] Navegação funciona

---

## 📞 CONTATO

**Em caso de dúvidas:**
1. Verificar logs: `pm2 logs`
2. Ver documentação: `/docs/`
3. Testar Swagger: http://localhost:3100/api

---

## 🎉 NOVIDADES DESTA VERSÃO

### ✨ Sistema de Ordens de Serviço (NOVO!)
- Dashboard completo com estatísticas
- Listagem avançada com filtros
- Detalhes com 3 tabs (Serviços, Apontamentos, Produtos)
- Gráficos de produtividade
- Cálculo automático de homem-hora

### 🔧 Correções
- Endpoint `/tgfloc` criado
- Endpoint `/estoque/metrics-comprehensive` implementado
- Produtos agora carregam sem erros 404

### 📊 Métricas
- ~3000 linhas de código criadas
- 20 arquivos novos
- 9 endpoints RESTful
- 100% TypeScript
- Performance otimizada

---

**Bons testes! 🚀**

*Todas as aplicações estão rodando e prontas para uso!*
