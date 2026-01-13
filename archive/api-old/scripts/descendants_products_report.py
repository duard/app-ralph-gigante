#!/usr/bin/env python3
import json
import subprocess
import time
from pathlib import Path

base = Path('docs/sqls/estoque-locais')
paths_file = base / 'descendants_101000_paths.json'
paths = json.loads(paths_file.read_text())

token = Path(base / 'auth_token.txt').read_text().strip()

out_rows = []

for node in paths:
    cod = node['CODLOCAL']
    # per-product aggregates for this local
    q = f"SELECT P.CODPROD, LTRIM(RTRIM(P.DESCRPROD)) AS DESCRPROD, LTRIM(RTRIM(P.UNIDADE)) AS UNIDADE, LTRIM(RTRIM(P.MARCA)) AS MARCA, P.NCM, SUM(ISNULL(E.ESTOQUE,0)) AS TOTAL_ESTOQUE FROM [SANKHYA].[TGFEST] E JOIN [SANKHYA].[TGFPRO] P ON P.CODPROD = E.CODPROD WHERE E.CODLOCAL = {cod} GROUP BY P.CODPROD, P.DESCRPROD, P.UNIDADE, P.MARCA, P.NCM ORDER BY P.DESCRPROD;"
    cmd = [
        'curl','-s','-X','POST','https://api-dbexplorer-nestjs-production.gigantao.net/inspection/query',
        '-H','accept: application/json',
        '-H', f'Authorization: Bearer {token}',
        '-H','Content-Type: application/json',
        '-d', json.dumps({'query': q, 'params': []})
    ]
    tries = 0
    resp = None
    while tries < 4:
        p = subprocess.run(cmd, capture_output=True, text=True)
        try:
            resp = json.loads(p.stdout)
            if resp.get('statusCode') == 500:
                raise ValueError('500')
            break
        except Exception:
            tries += 1
            time.sleep(1 + tries)
    if not resp:
        print('Failed to fetch products for', cod)
        continue
    data = resp.get('data', [])
    if not data:
        # no products, but still add one row with zero
        out_rows.append({
            'CODLOCAL': cod,
            'DESCRLOCAL': node['DESCRLOCAL'],
            'LOCAL_PATH': node['LOCAL_PATH'],
            'LOCAL_PATH_CODES': node['LOCAL_PATH_CODES'],
            'LOCAL_DEPTH': node['LOCAL_DEPTH'],
            'CODPROD': None,
            'DESCRPROD': None,
            'UNIDADE': None,
            'MARCA': None,
            'NCM': None,
            'TOTAL_ESTOQUE': 0
        })
    else:
        for r in data:
            out_rows.append({
                'CODLOCAL': cod,
                'DESCRLOCAL': node['DESCRLOCAL'],
                'LOCAL_PATH': node['LOCAL_PATH'],
                'LOCAL_PATH_CODES': node['LOCAL_PATH_CODES'],
                'LOCAL_DEPTH': node['LOCAL_DEPTH'],
                'CODPROD': r.get('CODPROD'),
                'DESCRPROD': r.get('DESCRPROD'),
                'UNIDADE': r.get('UNIDADE'),
                'MARCA': r.get('MARCA'),
                'NCM': r.get('NCM'),
                'TOTAL_ESTOQUE': r.get('TOTAL_ESTOQUE')
            })

# write outputs
out_json = base / 'descendants_101000_products.json'
out_csv = base / 'descendants_101000_products.csv'
out_txt = base / 'descendants_101000_products.txt'
out_json.write_text(json.dumps(out_rows, ensure_ascii=False, indent=2))

# CSV
import csv
with out_csv.open('w', newline='') as f:
    if out_rows:
        writer = csv.DictWriter(f, fieldnames=list(out_rows[0].keys()))
        writer.writeheader()
        writer.writerows(out_rows)

# pretty txt
with out_txt.open('w') as f:
    if out_rows:
        headers = list(out_rows[0].keys())
        widths = {h: max(len(h), max((len(str(r.get(h,''))) for r in out_rows))) for h in headers}
        f.write(' | '.join(h.ljust(widths[h]) for h in headers) + '\n')
        f.write('-+-'.join('-'*widths[h] for h in headers) + '\n')
        for r in out_rows:
            f.write(' | '.join(str(r.get(h,'')).ljust(widths[h]) for h in headers) + '\n')

print('Wrote', out_json, out_csv, out_txt, 'rows:', len(out_rows))
