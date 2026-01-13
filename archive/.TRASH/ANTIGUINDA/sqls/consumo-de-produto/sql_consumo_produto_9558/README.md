Pasta: sql_consumo_produto_9558

Conteúdo:

- `consumo_9558_202510_202512.sql` — consultas para analisar pedidos confirmados que contêm o produto 9558 no período 2025-10-01 .. 2025-12-31.

Como executar (exemplo):

1. Obtenha token:
   TOKEN=$(curl -s -X POST 'https://api-dbexplorer-nestjs-production.gigantao.net/auth/login' -H 'Content-Type: application/json' -d '{"username":"CONVIDADO","password":"guest123"}' | jq -r '.access_token')
2. Execute a query (salvar output):
   curl -s -X POST 'https://api-dbexplorer-nestjs-production.gigantao.net/inspection/query' -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d @- <<'JSON' > consumo_9558_202510_202512_response.json
   {"query": "$(sed "s/\n/\\n/g" consumo_9558_202510_202512.sql | sed "s/\"/\\\"/g")", "params": []}
   JSON

OBS: O exemplo usa `sed` para embutir o SQL no JSON; pode ajustar conforme seu ambiente. Se quiser, eu executo e salvo o resultado para você.
