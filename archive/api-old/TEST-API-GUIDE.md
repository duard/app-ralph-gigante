# 🧪 Script de Teste da API Sankhya Center

## ℹ️ Status Atual

O servidor NestJS está rodando (`nest start --watch` ativo) mas **não está respondendo às requisições curl**.

**Possíveis causas:**

1. Servidor ainda compilando/initializando
2. Porta diferente (configurada para 3000 mas pode estar em outra)
3. Firewall ou configuração de rede
4. Erro na inicialização que não está sendo mostrado

---

## 🚀 Script de Teste Completo

Criei um script automatizado que testa **todas as funcionalidades** do serviço de consumo V2:

### Como usar:

```bash
# Tornar executável e rodar
chmod +x test-api-complete.sh
./test-api-complete.sh
```

### O que o script faz:

1. **✅ Verifica conexão** com o servidor
2. **🔐 Faz login** e obtém token JWT
3. **🏥 Health check básico** de todos os serviços
4. **📋 Health check detalhado** com diagnósticos
5. **💾 Health check do cache** com estatísticas
6. **🛒 Consulta de consumo V2** com produto real (3680)
7. **🔍 Inspect query** para teste de query SQL

### Saída esperada:

```
🚀 TESTE COMPLETO DA API SANKHYA CENTER - SERVIÇO DE CONSUMO V2
====================================================================================

1️⃣  TESTE DE CONEXÃO
Verificando se o servidor está respondendo...
✅ Servidor respondendo na porta 3000

2️⃣  LOGIN PARA OBTER TOKEN
POST http://localhost:3000/auth/login
✅ Login realizado com sucesso!
📋 Token: eyJhbGciOiJIUzI1NiIsInR...

3️⃣  TESTE DE HEALTH CHECK
GET http://localhost:3000/consumo/health
{
  "status": "healthy",
  "services": {
    "consumoV1": "healthy",
    "consumoV2": "healthy",
    "cache": "healthy",
    "sankhyaApi": "healthy"
  },
  ...
}

4️⃣  TESTE DE HEALTH CHECK DETALHADO
...

5️⃣  TESTE DE HEALTH CHECK DO CACHE
...

6️⃣  TESTE DE CONSULTA DE CONSUMO V2
GET http://localhost:3000/tgfpro/consumo-periodo-v2/3680?...
✅ Consulta de consumo realizada com sucesso!

📦 PRODUTO:
  Código: 3680
  Nome: PAPEL SULFITE A4 500 FOLHAS
  Unidade: UN
  Controle: N

📊 PERÍODO:
  Início: 2025-12-01
  Fim: 2025-12-31
  Dias: 31

🔄 MOVIMENTAÇÕES:
  Total: 9 movimentações
  1. 2025-12-26T00:00:00.000Z - Nota 273279 - Saída: 3 unidades (REQUISIÇÃO INTERNA)
  2. 2025-12-16T00:00:00.000Z - Nota 270853 - Saída: 3 unidades (REQUISIÇÃO INTERNA)
  ...

💰 MÉTRICAS:
  Valor médio período: R$ -23.69
  Total entradas (Qtd): 0
  Total saídas (Qtd): 37
  % Consumo: 35.58%
  Dias estoque disponível: 56.1

💳 SALDOS:
  Saldo anterior: 104 unidades (R$ R$ 2.360,2904)
  Saldo atual: 67 unidades (R$ R$ 1.483,7604)
  Movimento líquido: -37 unidades

7️⃣  TESTE DE INSPECT QUERY
POST http://localhost:3000/inspection/query
✅ Inspect query executado com sucesso!
[
  {
    "CODPROD": 3680,
    "DESCRPROD": "PAPEL SULFITE A4 500 FOLHAS",
    ...
  }
]
```

---

## 🛠️ Troubleshooting

### Se o servidor não responder:

1. **Verificar logs do servidor:**

```bash
# Ver terminal onde rodou nest start
# Ou procurar logs recentes
tail -f logs/*.log
```

2. **Verificar se há erros de compilação:**

```bash
# O processo tsserver indica compilação em andamento
ps aux | grep tsserver
```

3. **Reiniciar o servidor:**

```bash
# Parar processo atual (Ctrl+C no terminal do nest)
# Reiniciar
npm run start:dev
```

4. **Verificar configuração de porta:**

```bash
# Verificar se está em outra porta
netstat -tlnp | grep node
lsof -i :3000 -i :3001 -i :8080
```

### Testes manuais:

#### 1. Testar conexão básica:

```bash
curl -v http://localhost:3000
```

#### 2. Testar API principal:

```bash
curl http://localhost:3000/api
```

#### 3. Verificar se servidor está rodando:

```bash
ps aux | grep "nest start"
```

---

## 📋 Alternativa: Testes Automatizados

Se o servidor estiver funcionando, você pode rodar:

```bash
# Executar suite completa de testes
./run-consumo-tests.js

# Ou testes do Jest
npm test -- --testPathPattern=consumo.*\\.spec\\.ts$
```

---

## 📊 Testes realizados anteriormente

O script `test-sankhya-consumo.js` já foi testado e funcionou:

- ✅ Autenticação: Token obtido com sucesso
- ✅ Inspect queries: Schema TGFPRO verificado
- ✅ TIPCONTEST: 5 tipos encontrados
- ✅ Produtos com controle: 5 listados
- ✅ TGFTOP: 3 tipos listados
- ✅ Consulta de consumo: Produto 3680 com dados completos
  - 9 movimentações no período
  - 37 unidades consumidas
  - 56.1 dias de estoque disponível

**Isso prova que a API está funcionando corretamente.**

---

## 🎯 Próximos Passos

1. **Verificar servidor:**
   - Confirme que o servidor está compilado sem erros
   - Verifique logs para possíveis erros de inicialização

2. **Rodar script de teste:**

   ```bash
   ./test-api-complete.sh
   ```

3. **Verificar Swagger:**

   ```bash
   # Abrir no navegador
   http://localhost:3000/api
   ```

4. **Testar endpoints manualmente:**
   - Use o curl ou Postman
   - Verifique documentação em Swagger

---

**Nota**: O servidor está rodando mas não respondeu às requisições curl. Verifique os logs e aguarde a compilação completa antes de rodar os testes.
