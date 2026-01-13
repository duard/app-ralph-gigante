#!/usr/bin/env python3
import json
import subprocess
import time
from pathlib import Path

base = Path('docs/sqls/estoque-locais')
loc_file = base / 'report_101010_loc_response.json'
prods_file = base / 'report_101010_products_response.json'
paths_file = base / 'descendants_101000_paths.json'
token_file = base / 'auth_token.txt'

loc = json.loads(loc_file.read_text())
loc_row = (loc.get('data') or [{}])[0]
prods = json.loads(prods_file.read_text())
prod_rows = prods.get('data', [])
paths = json.loads(paths_file.read_text())
path_map = {p['CODLOCAL']: p for p in paths}

token = token_file.read_text().strip()

out = []
for p in prod_rows:
    codprod = p.get('CODPROD')
    last = None
    if codprod:
        q = f"SELECT TOP 1 T.VLRUNIT, C.DTNEG, C.NUNOTA, C.CODEMP FROM [SANKHYA].[TGFITE] T JOIN [SANKHYA].[TGFCAB] C ON C.NUNOTA = T.NUNOTA AND C.CODEMP = T.CODEMP WHERE T.CODPROD = {codprod} AND C.TIPMOV = 'O' AND C.STATUSNOTA = 'L' ORDER BY C.DTNEG DESC;"
        cmd = [
            'curl','-s','-X','POST','https://api-dbexplorer-nestjs-production.gigantao.net/inspection/query',
            '-H','accept: application/json',
            '-H', f'Authorization: Bearer {token}',
            '-H','Content-Type: application/json',
            '-d', json.dumps({'query': q, 'params': []})
        ]
        tries = 0
        while tries < 4:
            pproc = subprocess.run(cmd, capture_output=True, text=True)
            try:
                resp = json.loads(pproc.stdout)
                if resp.get('statusCode') == 500:
                    raise ValueError('500')
                data = resp.get('data', [])
                if data:
                    last = data[0]
                break
            except Exception:
                tries += 1
                time.sleep(1 + tries)
    path_info = path_map.get(101010, {})
    row = {
        'CODLOCAL': 101010,
        'DESCRLOCAL': loc_row.get('DESCRLOCAL'),
        'CODLOCALPAI': loc_row.get('CODLOCALPAI'),
        'AD_DESCRBASE': loc_row.get('AD_DESCRBASE'),
        'UTILIZAWMS': loc_row.get('UTILIZAWMS'),
        'CAPACIDADEPRODUCAO': loc_row.get('CAPACIDADEPRODUCAO'),
        'PARTNER_CODPARC': loc_row.get('CODPARC'),
        'PARTNER_NOMEPARC': (loc_row.get('NOMEPARC') or '').strip(),
        'LOCAL_PATH': path_info.get('LOCAL_PATH'),
        'LOCAL_PATH_CODES': path_info.get('LOCAL_PATH_CODES'),
        'LOCAL_DEPTH': path_info.get('LOCAL_DEPTH'),
        'CODPROD': codprod,
        'DESCRPROD': p.get('DESCRPROD'),
        'UNIDADE': p.get('UNIDADE'),
        'MARCA': p.get('MARCA'),
        'NCM': p.get('NCM'),
        'TOTAL_ESTOQUE': p.get('TOTAL_ESTOQUE'),
        'LAST_PURCHASE_UNIT': (last or {}).get('VLRUNIT'),
        'LAST_PURCHASE_DATE': (last or {}).get('DTNEG'),
        'LAST_PURCHASE_NUNOTA': (last or {}).get('NUNOTA'),
        'LAST_PURCHASE_CODEMP': (last or {}).get('CODEMP')
    }
    out.append(row)

# Save outputs
out_json = base / 'report_101010_everything.json'
out_csv = base / 'report_101010_everything.csv'
out_txt = base / 'report_101010_everything.txt'
out_json.write_text(json.dumps(out, ensure_ascii=False, indent=2))

import csv
with out_csv.open('w', newline='') as f:
    if out:
        writer = csv.DictWriter(f, fieldnames=list(out[0].keys()))
        writer.writeheader()
        writer.writerows(out)

with out_txt.open('w') as f:
    if out:
        headers = list(out[0].keys())
        widths = {h: max(len(h), max((len(str(r.get(h,''))) for r in out))) for h in headers}
        f.write(' | '.join(h.ljust(widths[h]) for h in headers) + '\n')
        f.write('-+-'.join('-'*widths[h] for h in headers) + '\n')
        for r in out:
            f.write(' | '.join(str(r.get(h,'')).ljust(widths[h]) for h in headers) + '\n')

print('Wrote:', out_json, out_csv, out_txt)
