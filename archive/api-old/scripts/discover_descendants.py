#!/usr/bin/env python3
import json
import subprocess
from pathlib import Path

base = Path('docs/sqls/estoque-locais')
base.mkdir(parents=True, exist_ok=True)
token = Path(base / 'auth_token.txt').read_text().strip()

start = 101000
seen = set([start])
frontier = {start}
all_nodes = {}

while frontier:
    # Query direct children for current frontier
    in_list = ','.join(str(x) for x in frontier)
    query = f"SELECT CODLOCAL, CODLOCALPAI, LTRIM(RTRIM(DESCRLOCAL)) AS DESCRLOCAL FROM [SANKHYA].[TGFLOC] WHERE CODLOCALPAI IN ({in_list}) ORDER BY CODLOCAL;"
    cmd = [
        'curl', '-s', '-X', 'POST', 'https://api-dbexplorer-nestjs-production.gigantao.net/inspection/query',
        '-H', 'accept: application/json',
        '-H', f'Authorization: Bearer {token}',
        '-H', 'Content-Type: application/json',
        '-d', json.dumps({'query': query, 'params': []})
    ]
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, check=True)
        resp = json.loads(p.stdout)
    except subprocess.CalledProcessError as e:
        print('curl failed:', e)
        break
    except json.JSONDecodeError:
        print('failed to decode response:', p.stdout[:200])
        break

    data = resp.get('data', [])
    new_frontier = set()
    for r in data:
        cod = r['CODLOCAL']
        all_nodes[cod] = r
        if cod not in seen:
            new_frontier.add(cod)
            seen.add(cod)
    frontier = new_frontier

# save result
out_file = base / f'descendants_{start}.json'
out = {'start_local': start, 'count': len(all_nodes), 'nodes': [all_nodes[k] for k in sorted(all_nodes)]}
out_file.write_text(json.dumps(out, ensure_ascii=False, indent=2))
print('Wrote', out_file, 'nodes:', len(all_nodes))
