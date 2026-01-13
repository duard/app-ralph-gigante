#!/usr/bin/env python3
"""Generate tree (pai→...→local) + per-local product aggregates for a given root local.
Usage: python3 scripts/generate_local_tree.py [ROOT_LOCAL]
Output: docs/sqls/estoque-locais/tree_{ROOT}.json/.csv/.txt
"""
import json
import subprocess
import sys
import time
from pathlib import Path

ROOT = int(sys.argv[1]) if len(sys.argv) > 1 else 101000
BASE = Path('docs/sqls/estoque-locais')
BASE.mkdir(parents=True, exist_ok=True)
TOKEN = Path(BASE / 'auth_token.txt').read_text().strip()

# 1) discover descendants (downwards)
def discover_descendants(root):
    seen = set([root])
    frontier = {root}
    nodes = {}
    while frontier:
        in_list = ','.join(str(x) for x in sorted(frontier))
        q = f"SELECT CODLOCAL, CODLOCALPAI, LTRIM(RTRIM(DESCRLOCAL)) AS DESCRLOCAL FROM [SANKHYA].[TGFLOC] WHERE CODLOCALPAI IN ({in_list}) ORDER BY CODLOCAL;"
        resp = call_inspection(q)
        data = resp.get('data', [])
        new_frontier = set()
        for r in data:
            nodes[r['CODLOCAL']] = r
            if r['CODLOCAL'] not in seen:
                seen.add(r['CODLOCAL'])
                new_frontier.add(r['CODLOCAL'])
        frontier = new_frontier
    # include root
    root_row = call_inspection(f"SELECT CODLOCAL, CODLOCALPAI, LTRIM(RTRIM(DESCRLOCAL)) AS DESCRLOCAL FROM [SANKHYA].[TGFLOC] WHERE CODLOCAL = {root};").get('data', [])[0]
    nodes[root] = root_row
    return nodes

# wrapper for calling inspection/query
def call_inspection(query):
    cmd = [
        'curl','-s','-X','POST','https://api-dbexplorer-nestjs-production.gigantao.net/inspection/query',
        '-H','accept: application/json',
        '-H', f'Authorization: Bearer {TOKEN}',
        '-H','Content-Type: application/json',
        '-d', json.dumps({'query': query, 'params': []})
    ]
    tries = 0
    while tries < 4:
        p = subprocess.run(cmd, capture_output=True, text=True)
        try:
            r = json.loads(p.stdout)
            if r.get('statusCode') == 500:
                raise ValueError('500')
            return r
        except Exception:
            tries += 1
            time.sleep(1 + tries)
    return {}

# 2) build paths (walk up parents)
def build_paths(nodes):
    parent_map = {}
    for n in nodes.values():
        pid = n.get('CODLOCALPAI')
        if pid and pid not in nodes and pid not in parent_map and pid != 0:
            parent_map[pid] = None
    # fetch missing parents
    if parent_map:
        in_list = ','.join(str(x) for x in parent_map.keys())
        resp = call_inspection(f"SELECT CODLOCAL, CODLOCALPAI, LTRIM(RTRIM(DESCRLOCAL)) AS DESCRLOCAL FROM [SANKHYA].[TGFLOC] WHERE CODLOCAL IN ({in_list});")
        for r in resp.get('data', []):
            parent_map[r['CODLOCAL']] = r
    # now assemble paths
    out = {}
    for cod, row in nodes.items():
        parts = [row['DESCRLOCAL']]
        codes = [str(cod)]
        depth = 0
        parent = row.get('CODLOCALPAI')
        while parent and parent != 0:
            p = nodes.get(parent) or parent_map.get(parent)
            if not p:
                break
            parts.insert(0, p['DESCRLOCAL'])
            codes.insert(0, str(p['CODLOCAL']))
            parent = p.get('CODLOCALPAI')
            depth += 1
        out[cod] = {'CODLOCAL': cod, 'DESCRLOCAL': row['DESCRLOCAL'], 'LOCAL_PATH': ' > '.join(parts), 'LOCAL_PATH_CODES': '.'.join(codes), 'LOCAL_DEPTH': depth}
    return out

# 3) fetch per-local aggregated products in a single query

def fetch_products_for_nodes(cod_list):
    if not cod_list:
        return []
    in_list = ','.join(str(x) for x in sorted(cod_list))
    q = f"SELECT P.CODPROD, LTRIM(RTRIM(P.DESCRPROD)) AS DESCRPROD, LTRIM(RTRIM(P.UNIDADE)) AS UNIDADE, LTRIM(RTRIM(P.MARCA)) AS MARCA, P.NCM, E.CODLOCAL, SUM(ISNULL(E.ESTOQUE,0)) AS TOTAL_ESTOQUE FROM [SANKHYA].[TGFEST] E JOIN [SANKHYA].[TGFPRO] P ON P.CODPROD = E.CODPROD WHERE E.CODLOCAL IN ({in_list}) GROUP BY P.CODPROD, P.DESCRPROD, P.UNIDADE, P.MARCA, P.NCM, E.CODLOCAL ORDER BY E.CODLOCAL, P.DESCRPROD;"
    resp = call_inspection(q)
    return resp.get('data', [])

# run
nodes = discover_descendants(ROOT)
paths = build_paths(nodes)
products = fetch_products_for_nodes(nodes.keys())

# assemble rows
rows = []
prod_by_local = {}
for p in products:
    prod_by_local.setdefault(p['CODLOCAL'], []).append(p)

for cod, info in sorted(paths.items()):
    prods = prod_by_local.get(cod, [])
    if not prods:
        rows.append({
            'CODLOCAL': cod,
            'DESCRLOCAL': info['DESCRLOCAL'],
            'LOCAL_PATH': info['LOCAL_PATH'],
            'LOCAL_PATH_CODES': info['LOCAL_PATH_CODES'],
            'LOCAL_DEPTH': info['LOCAL_DEPTH'],
            'CODPROD': None,
            'DESCRPROD': None,
            'TOTAL_ESTOQUE': 0
        })
    else:
        for pr in prods:
            rows.append({
                'CODLOCAL': cod,
                'DESCRLOCAL': info['DESCRLOCAL'],
                'LOCAL_PATH': info['LOCAL_PATH'],
                'LOCAL_PATH_CODES': info['LOCAL_PATH_CODES'],
                'LOCAL_DEPTH': info['LOCAL_DEPTH'],
                'CODPROD': pr.get('CODPROD'),
                'DESCRPROD': pr.get('DESCRPROD'),
                'UNIDADE': pr.get('UNIDADE'),
                'MARCA': pr.get('MARCA'),
                'NCM': pr.get('NCM'),
                'TOTAL_ESTOQUE': pr.get('TOTAL_ESTOQUE')
            })

# outputs
out_json = BASE / f'tree_{ROOT}_products.json'
out_csv = BASE / f'tree_{ROOT}_products.csv'
out_txt = BASE / f'tree_{ROOT}_products.txt'
out_json.write_text(json.dumps(rows, ensure_ascii=False, indent=2))
import csv
# determine full set of columns (some rows have UNIDADE/MARCA/NCM, others not)
all_keys = set()
for r in rows:
    all_keys.update(r.keys())
fieldnames = sorted(all_keys)
with out_csv.open('w', newline='') as f:
    if rows:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
with out_txt.open('w') as f:
    if rows:
        headers = fieldnames
        widths = {h: max(len(h), max((len(str(r.get(h,''))) for r in rows))) for h in headers}
        f.write(' | '.join(h.ljust(widths[h]) for h in headers) + '\n')
        f.write('-+-'.join('-'*widths[h] for h in headers) + '\n')
        for r in rows:
            f.write(' | '.join(str(r.get(h,'')).ljust(widths[h]) for h in headers) + '\n')

print('Wrote', out_json, out_csv, out_txt, 'rows:', len(rows))
