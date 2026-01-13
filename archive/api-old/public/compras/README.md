# Busca de Produtos - Sistema de Compras

## 🚀 Acesso Rápido

**URL Principal**: http://localhost:5173/compras/resumo

## 📋 Pré-requisitos

1. **Backend rodando**: API Sankhya Center na porta 3000
2. **Token JWT**: Obter via endpoint `/auth/login`
3. **Navegador moderno**: Chrome, Firefox, Safari, Edge

## 🔧 Configuração Inicial

### 1. Obter Token JWT

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "seu-usuario", "password": "sua-senha"}'
```

### 2. Configurar Frontend

1. Abra http://localhost:5173/compras/resumo
2. Cole o token JWT no campo "Token JWT"
3. Clique em "Salvar Token"
4. Status deve mudar para "✅ Autenticado"

## 🎯 Casos de Uso

### Busca Simples

Digite "copo" no campo de busca → Todos os produtos com "copo" na descrição

### Busca Multi-campo

Digite "marte copo" → Produtos que contêm ambos "marte" E "copo"

### Filtros Combinados

1. Busque "marte"
2. Configure Estoque Mínimo = 10
3. Configure Status = "Ativo"
4. Clique em "Buscar"

### Paginação

- Use os botões de navegação ou números de página
- Ou altere "Itens por página" para 20, 50 ou 100

### Exportar Resultados

Após buscar, clique em "Exportar" → Download automático do arquivo CSV

## 🎨 Interface Responsiva

### Desktop (>1024px)

- 3 colunas de produtos
- Filtros visíveis lateralmente
- Modal centralizado

### Tablet (768px-1024px)

- 2 colunas de produtos
- Filtros reorganizados verticalmente
- Modal em tela cheia

### Mobile (<768px)

- 1 coluna de produtos
- Filtros stacked
- Touch-friendly buttons

## ⚡ Performance Tips

### Para Buscas Rápidas

- Use termos específicos em vez de genéricos
- Mínimo 2 caracteres para ativar busca
- Aproveite busca automática (debounce)

### Para Resultados Precisos

- Use exatidão em produtos: "COPO DESCARTÁVEL"
- Combine múltiplos termos
- Use filtros para refinar

### Para Grandes Volumes

- Reduza itens por página para 20
- Use filtros de estoque específicos
- Exporte resultados para análise offline

## 🔍 Algoritmo de Busca

### Como Funciona

1. **Multi-campo**: Busca em produto, grupo, fornecedor e local simultaneamente
2. **Relevância**: Prioriza produtos com termo exato no início
3. **Score**: Produto exato = 100pts, outros campos até 50pts
4. **Classificação**: Alta(100+), Média(50-99), Baixa(<50)

### Exemplo Prático

Busca: "marte copo"

| Produto                | Score | Classificação |
| ---------------------- | ----- | ------------- |
| MARTE COPO DESCARTÁVEL | 100   | Alta          |
| COPO MARTE VERMELHO    | 80    | Alta          |
| MARTE - ACESSORIO COPO | 70    | Média         |
| COPO TIPO MARTE        | 50    | Média         |

## 🚨 Solução de Problemas

### Não Encontra Resultados

✅ **Verifique**:

- Termos digitados corretamente
- Filtros muito restritivos
- Token válido

✅ **Tente**:

- Termos mais simples
- Limpar todos os filtros
- Usar sinônimos

### Erro de Autenticação

✅ **Sintomas**: "🔴 Não autenticado"

✅ **Solução**:

1. Obter novo token em `/auth/login`
2. Colar token no campo superior
3. Clicar "Salvar Token"

### Busca Muito Lenta

✅ **Verifique**:

- Conexão com internet
- Backend respondendo
- Muitos filtros ativos

✅ **Otimize**:

- Termos mais específicos
- Menos itens por página
- Use filtros de estoque

### Exportação Não Funciona

✅ **Verifique**:

- Pop-ups bloqueados no navegador
- Permissões de download
- Resultados encontrados

✅ **Solução**:

- Permitir pop-ups para localhost
- Tentar navegador diferente
- Verificar se há resultados

## 📊 Endpoints Técnicos

### Backend

```http
GET /sankhya/tgfest/search-avancado
Headers: Authorization: Bearer {token}
Params: q, page, perPage, estoqueMin, estoqueMax, ativo
```

### Exemplo de Requisição

```bash
curl -X GET "http://localhost:3000/sankhya/tgfest/search-avancado?q=marte&page=1&perPage=20&estoqueMin=10&ativo=S" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Estrutura da Resposta

```json
{
  "data": [...],
  "total": 156,
  "page": 1,
  "perPage": 20,
  "searchTime": "45ms",
  "query": "marte",
  "filters": {"ativo": "S", "estoqueMin": 10},
  "hasMore": true,
  "lastPage": 8
}
```

## 🎛️ Suporte Avançado

### Debug Mode

Abra o console do navegador (F12) para ver:

- Requisições de rede
- Logs de erros
- Performance de busca

### Customização

Os arquivos podem ser customizados:

- `resumo.html`: Layout e componentes
- `search.js`: Lógica de interação
- Estilos CSS podem ser modificados inline

### Integração

Para integrar com outros sistemas:

- Use o endpoint `/sankhya/tgfest/search-avancado`
- Formato de resposta padronizado JSON
- Autenticação via JWT Bearer Token

---

**Desenvolvido por**: API Sankhya Center Team  
**Versão**: 1.0.0  
**Última atualização**: 2026-01-02
