#!/usr/bin/env python3
import json
import subprocess
from pathlib import Path

base = Path('docs/sqls/estoque-locais')
start = 101000
desc_file = base / f'descendants_{start}.json'
desc = json.loads(desc_file.read_text())
nodes = {n['CODLOCAL']: n for n in desc['nodes']}

# collect parents to fetch
parent_ids = set(n['CODLOCALPAI'] for n in nodes.values() if n.get('CODLOCALPAI'))
parent_map = {}

token = Path(base / 'auth_token.txt').read_text().strip()

# iteratively fetch parents until no new
while parent_ids:
    batch = sorted(pid for pid in parent_ids if pid not in parent_map and pid != 0)
    if not batch:
        break
    in_list = ','.join(str(x) for x in batch)
    query = f"SELECT CODLOCAL, CODLOCALPAI, LTRIM(RTRIM(DESCRLOCAL)) AS DESCRLOCAL FROM [SANKHYA].[TGFLOC] WHERE CODLOCAL IN ({in_list});"
    cmd = [
        'curl', '-s', '-X', 'POST', 'https://api-dbexplorer-nestjs-production.gigantao.net/inspection/query',
        '-H', 'accept: application/json',
        '-H', f'Authorization: Bearer {token}',
        '-H', 'Content-Type: application/json',
        '-d', json.dumps({'query': query, 'params': []})
    ]
    p = subprocess.run(cmd, capture_output=True, text=True)
    try:
        resp = json.loads(p.stdout)
    except Exception as e:
        print('Error parsing response:', e)
        print(p.stdout[:500])
        break
    data = resp.get('data', [])
    new_parent_ids = set()
    for r in data:
        cid = r['CODLOCAL']
        parent_map[cid] = r
        if r.get('CODLOCALPAI') and r['CODLOCALPAI'] not in parent_map and r['CODLOCALPAI'] != 0:
            new_parent_ids.add(r['CODLOCALPAI'])
    parent_ids = new_parent_ids

# Now for each node, walk up to build path (collecting any parent names available)
out = []
for cod, row in nodes.items():
    parts = [row['DESCRLOCAL']]
    codes = [str(cod)]
    depth = 0
    parent = row.get('CODLOCALPAI')
    while parent and parent != 0:
        # look for parent in nodes or parent_map
        p = nodes.get(parent) or parent_map.get(parent)
        if not p:
            # fetch on demand
            query = f"SELECT CODLOCAL, CODLOCALPAI, LTRIM(RTRIM(DESCRLOCAL)) AS DESCRLOCAL FROM [SANKHYA].[TGFLOC] WHERE CODLOCAL = {parent};"
            cmd = [
                'curl', '-s', '-X', 'POST', 'https://api-dbexplorer-nestjs-production.gigantao.net/inspection/query',
                '-H', 'accept: application/json',
                '-H', f'Authorization: Bearer {token}',
                '-H', 'Content-Type: application/json',
                '-d', json.dumps({'query': query, 'params': []})
            ]
            pproc = subprocess.run(cmd, capture_output=True, text=True)
            try:
                resp = json.loads(pproc.stdout)
                data = resp.get('data', [])
                if not data:
                    break
                p = data[0]
                parent_map[p['CODLOCAL']] = p
            except Exception as e:
                break
        parts.insert(0, p['DESCRLOCAL'])
        codes.insert(0, str(p['CODLOCAL']))
        parent = p.get('CODLOCALPAI')
        depth += 1
    out.append({
        'CODLOCAL': cod,
        'DESCRLOCAL': row['DESCRLOCAL'],
        'LOCAL_PATH': ' > '.join(parts),
        'LOCAL_PATH_CODES': '.'.join(codes),
        'LOCAL_DEPTH': depth
    })

out_file = base / f'descendants_{start}_paths.json'
out_file.write_text(json.dumps(out, ensure_ascii=False, indent=2))
print('Wrote', out_file)
