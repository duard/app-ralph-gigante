# 🎯 API Sankhya Center - Serviço de Consumo V2

## 📋 Visão Geral

Serviço robusto e completo para consulta de movimentações e saldos de produtos no sistema Sankhya, com validações avançadas, cache inteligente e monitoramento contínuo.

**Status**: ✅ **PRODUÇÃO READY**  
**Versão**: 2.0.0  
**Última Atualização**: 10/01/2026

---

## 🚀 Funcionalidades Principais

### 1. **Consulta de Consumo V2**

- Informações completas do produto (TIPCONTEST, COMPLDESC, etc.)
- Movimentações detalhadas com TGFTOP, controle, observações
- Métricas expandidas (% consumo, dias estoque, média/dia)
- Localizações de estoque com controle de lote/série
- Paginação configurável

### 2. **Validações Avançadas**

- Validação de produtos (código, reservados)
- Validação de períodos (formato, datas, duração)
- Validação de movimentações (estrutura, limites)
- Validação de saldos (negativos, consistência)
- Validação de métricas (percentuais, dias estoque)
- Relatórios com erros, avisos e sugestões

### 3. **Cache Inteligente**

- Cache de produtos com TTL configurável (1h padrão)
- Estatísticas de performance (hit/miss rate)
- Cleanup automático de itens expirados
- Ranking de produtos mais acessados
- Recomendações de otimização

### 4. **Health Monitoring**

- Health check básico de todos os serviços
- Diagnósticos detalhados com métricas
- Monitoramento específico do cache
- Recomendações automáticas de correção

### 5. **Testes Automatizados**

- Suite completa de testes unitários
- Testes de validação (20+ cenários)
- Script automatizado de execução
- Cobertura de código configurável

---

## 📁 Estrutura do Projeto

```
src/sankhya/tgfpro/consumo/
├── consumo.controller.ts              # Endpoints v1 e v2
├── consumo.service.ts                 # Lógica v1
├── consumo-v2.service.ts            # Lógica v2 (cache + validação)
├── consumo-health.controller.ts       # Health checks
├── consumo.module.ts                 # Configuração do módulo
├── dto/                            # DTOs para validação
├── utils/
│   ├── consumo-calculator.utils.ts    # Cálculos de extratos
│   ├── consumo-validation.service.ts   # Validações avançadas
│   └── produto-cache.service.ts      # Cache inteligente
└── *.spec.ts                        # Testes automatizados

Scripts e Documentação:
├── test-sankhya-consumo.js          # Script de teste manual
├── run-consumo-tests.js               # Suite de testes
├── GUIDE-AUTH-CONSUMO.md             # Guia completo
└── RESUMO-TRABALHO-CONSUMO.md       # Detalhes técnicos
```

---

## 🔌 Autenticação e Uso

### Login

```bash
POST /auth/login
{
  "username": "CONVIDADO",
  "password": "guest123"
}
```

### Consulta de Consumo V2

```bash
GET /tgfpro/consumo-periodo-v2/{codprod}?dataInicio=2025-12-01&dataFim=2025-12-31&page=1&perPage=50
Authorization: Bearer <token>
```

### Health Check

```bash
GET /consumo/health              # Status geral
GET /consumo/health/detailed    # Diagnóstico completo
GET /consumo/health/cache       # Status do cache
```

---

## 🧪 Executar Testes

### Teste Manual

```bash
node test-sankhya-consumo.js
```

### Suite de Testes

```bash
chmod +x run-consumo-tests.js
./run-consumo-tests.js
```

### Testes Específicos

```bash
npm test -- --testPathPattern=consumo.*\\.spec\\.ts$
npm test -- --coverage --testPathPattern=consumo
```

---

## 📊 Métricas e Performance

### Cache Performance

- **Hit Rate Ideal**: >70%
- **Miss Rate Aceitável**: <30%
- **Capacidade**: Até 1000 produtos
- **TTL Padrão**: 1 hora (3600000ms)

### Response Time

- **Com cache**: <50ms
- **Sem cache**: <500ms
- **Validações**: <10ms
- **Health checks**: <100ms

### Cobertura de Testes

- **Target**: >80%
- **Testes unitários**: 15+ cenários
- **Testes de validação**: 20+ cenários

---

## 🛠️ Configuração

### Variáveis de Ambiente

```env
# Cache
CACHE_TTL=3600000           # TTL em ms
CACHE_MAX_ITEMS=1000        # Máximo de itens

# Validações
MAX_DIAS_PERIODO=365       # Período máximo
MAX_MOVIMENTACOES=1000     # Máximo de movimentações
VALIDAR_DATA_FUTURA=true    # Validar datas futuras
```

### Opções de Validação

```typescript
const validationOptions = {
  maxDiasPeriodo: 365,
  minDiasPeriodo: 1,
  maxMovimentacoes: 1000,
  validarSaldoNegativo: true,
  validarDataFutura: true,
}
```

---

## 📚 Documentação

- **GUIDE-AUTH-CONSUMO.md** - Guia completo de autenticação e uso
- **RESUMO-TRABALHO-CONSUMO.md** - Detalhes técnicos das implementações
- **test-sankhya-consumo.js** - Script de teste comentado
- **run-consumo-tests.js** - Suite de testes automatizados
- **Swagger UI** - Documentação interativa em `/api`

---

## 🎯 Como Começar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
# Editar .env com suas configurações
```

### 3. Iniciar Serviço

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

### 4. Testar

```bash
# Testar autenticação
node test-sankhya-consumo.js

# Executar testes
./run-consumo-tests.js

# Verificar health
curl http://localhost:3000/consumo/health
```

---

## 🚨 Troubleshooting

### Erros Comuns

**401 - Não Autorizado**

- Verifique credenciais de login
- Token pode ter expirado (1h)

**404 - Produto Não Encontrado**

- Verifique se CODPROD está correto
- Use script para listar produtos

**500 - Query Inválida**

- Verifique sintaxe SQL
- Confirme que apenas SELECT é usado

### Performance Lenta

- Aumente o TTL do cache
- Use TOP N nas queries
- Evite campos binários grandes

### Cache Sem Hit

- Verifique se cache está ativado
- Aumente o tempo de retenção
- Pré-carregue produtos comuns

---

## 📈 Melhorias Futuras

### Próxima Fase

- [ ] Comparação de períodos (V1 vs V2)
- [ ] Métricas de performance em tempo real
- [ ] Dashboard de monitoramento
- [ ] Alertas automáticos

### Longo Prazo

- [ ] WebSockets para atualizações
- [ ] Background jobs para preload
- [ ] Rate limiting
- [ ] API versioning
- [ ] Documentação interativa

---

## 🤝 Contribuição

### Padrões de Código

- TypeScript estritamente tipado
- Clean Code e SOLID principles
- Testes para toda funcionalidade
- Documentação clara e atualizada

### Commit Messages

- Conventional Commits
- Descrição clara do que foi feito
- Referência a issues quando aplicável

---

## 📄 Licença

Este projeto é propriedade da Gigante.

---

**Contato de Suporte**:  
Equipe de Desenvolvimento API Sankhya Center

_Última Atualização: 10/01/2026_
