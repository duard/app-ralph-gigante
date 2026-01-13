# Executar queries via API (Inspection Query)

Este documento descreve, passo-a-passo, como autenticar na API local e executar queries SQL usando o endpoint `/inspection/query` (útil para validar as queries da pasta `valor-estoque-por-periodo`). Compartilhe este procedimento com os colegas.

## 1) Autenticar e obter token

Executar (exemplo):

curl -s -X POST 'http://localhost:3000/auth/login' \
 -H 'accept: application/json' \
 -H 'Content-Type: application/json' \
 -d '{"username":"CONVIDADO","password":"guest123"}'

Resposta de sucesso (exemplo):

{
"access_token": "<TOKEN>",
"token_type": "Bearer",
"expires_in": 3600
}

Salve o token em uma variável de ambiente na sessão do terminal:

TOKEN="<TOKEN>"

> Nota: o token expira (ex: 3600s). Repeita o login se necessário.

## 2) Executar uma query simples

Exemplo rápido:

curl -s -X POST 'http://localhost:3000/inspection/query' \
 -H "accept: application/json" \
 -H "Authorization: Bearer $TOKEN" \
 -H 'Content-Type: application/json' \
 -d '{"query":"SELECT TOP 10 ID, ACAO, TABELA, NOMEUSU FROM AD_GIG_LOG ORDER BY ID DESC","params": []}'

A resposta será em JSON com os resultados.

## 3) Executar um arquivo SQL (recomendado)

Para evitar problemas de escaping, use `jq` para transformar o arquivo em string JSON e enviar como `query`:

# Recomendado (Unix/Linux):

QUERY=$(jq -Rs . valor-estoque-por-periodo.test.sql)
curl -s -X POST 'http://localhost:3000/inspection/query' \
 -H "Authorization: Bearer $TOKEN" \
 -H 'Content-Type: application/json' \
 -d "{\"query\": $QUERY, \"params\": []}"

Isso evita problemas de aspas e caracteres especiais.

## 4) Validar saída e erros

- Se a resposta for um array JSON: sucesso (rows retornadas). Veja as primeiras linhas para inspecionar.
- Se retornar `{ "message": "..." }` ou código 4xx/5xx: cole o erro e cheque o SQL (sintaxe e permissões).
- Salve a saída em arquivo para compartilhar: `> resultado.json`.

## 5) Boas práticas / notas

- Não exponha tokens em canais públicos. Use variáveis de ambiente e remova o token após os testes.
- Para scripts de CI: gere token temporário com login programático e limpe após uso.
- Se a consulta for longa, prefira enviar o conteúdo do arquivo SQL com `jq -Rs` como mostrado.

## 6) Exemplo real de execução (registro que fiz agora)

1. Autentiquei com `CONVIDADO/guest123` e recebi token.
2. Executei o comando de inspeção com:
   - Query: `SELECT TOP 10 ID, ACAO, TABELA, NOMEUSU FROM AD_GIG_LOG ORDER BY ID DESC`
3. Resultado (exemplo):
   - 10 linhas retornadas (ACAO: UPDATE, tabelas: TGFITE/TGFCAB/TGFEST, nomes de usuário)

---

1.  faz login, 2) executa um arquivo SQL selecionado e 3) salva o resultado em um arquivo JSON, pronto para compartilhar.
