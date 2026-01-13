#!/usr/bin/env python3
import json
from pathlib import Path

base = Path('docs/sqls/estoque-locais')
loc_file = base / 'report_101010_loc_response.json'
prods_file = base / 'report_101010_products_response.json'
last_file = base / 'report_101010_lastpurchase_3706_response.json'

loc = json.loads(loc_file.read_text())
prods = json.loads(prods_file.read_text())
last = json.loads(last_file.read_text())

loc_row = loc.get('data',[{}])[0]
prod_rows = prods.get('data',[])
last_row = last.get('data',[{}])[0]

out = []
for p in prod_rows:
    row = {
        'CODLOCAL': loc_row.get('CODLOCAL'),
        'DESCRLOCAL': loc_row.get('DESCRLOCAL'),
        'CODLOCALPAI': loc_row.get('CODLOCALPAI'),
        'AD_DESCRBASE': loc_row.get('AD_DESCRBASE'),
        'UTILIZAWMS': loc_row.get('UTILIZAWMS'),
        'CAPACIDADEPRODUCAO': loc_row.get('CAPACIDADEPRODUCAO'),
        'PARTNER_CODPARC': loc_row.get('CODPARC'),
        'PARTNER_NOMEPARC': loc_row.get('NOMEPARC').strip() if loc_row.get('NOMEPARC') else None,
        'PARTNER_RAZAOSOCIAL': loc_row.get('RAZAOSOCIAL'),
        'PARTNER_CGC_CPF': loc_row.get('CGC_CPF'),
        'PARTNER_TELEFONE': loc_row.get('TELEFONE'),
        'PARTNER_EMAIL': loc_row.get('EMAIL'),
        'CODPROD': p.get('CODPROD'),
        'DESCRPROD': p.get('DESCRPROD'),
        'UNIDADE': p.get('UNIDADE'),
        'MARCA': p.get('MARCA'),
        'NCM': p.get('NCM'),
        'TOTAL_ESTOQUE': p.get('TOTAL_ESTOQUE'),
        'LAST_PURCHASE_UNIT': last_row.get('VLRUNIT'),
        'LAST_PURCHASE_DATE': last_row.get('DTNEG'),
        'LAST_PURCHASE_NUNOTA': last_row.get('NUNOTA'),
        'LAST_PURCHASE_CODEMP': last_row.get('CODEMP'),
    }
    out.append(row)

# write json
out_json = base / 'report_101010_full.json'
out_json.write_text(json.dumps(out, ensure_ascii=False, indent=2))

# write csv
import csv
out_csv = base / 'report_101010_full.csv'
with out_csv.open('w', newline='') as f:
    if out:
        writer = csv.DictWriter(f, fieldnames=list(out[0].keys()))
        writer.writeheader()
        writer.writerows(out)

# write pretty txt table
out_txt = base / 'report_101010_full.txt'
with out_txt.open('w') as f:
    if out:
        headers = list(out[0].keys())
        widths = {h: max(len(h), max((len(str(r.get(h,''))) for r in out))) for h in headers}
        # header
        f.write(' | '.join(h.ljust(widths[h]) for h in headers) + '\n')
        f.write('-+-'.join('-'*widths[h] for h in headers) + '\n')
        for r in out:
            f.write(' | '.join(str(r.get(h,'')).ljust(widths[h]) for h in headers) + '\n')

print('Wrote:', out_json, out_csv, out_txt)
