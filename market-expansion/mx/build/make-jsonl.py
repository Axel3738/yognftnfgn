#!/usr/bin/env python3
"""Bygger productSet-JSONL för MX (GrillForge Co) från batchar + es-MX-översättningar.
Kör när alla 7 out/batch-N.es.json finns."""
import json, glob, os, sys

BASE = os.path.dirname(os.path.abspath(__file__))
SRC_COLLECTIONS = os.path.join(BASE, '../../grillkliniken/source-export/collections.bulk.jsonl')

# Källkollektion (handle) -> ny kollektions-GID i grillforgeco
COLLECTION_MAP = {
    'frontpage': 'gid://shopify/Collection/691005849940',
    'grillredskap': 'gid://shopify/Collection/712480915796',
    'forkladen': 'gid://shopify/Collection/712481046868',
    'knivar-skarbrador': 'gid://shopify/Collection/712481177940',
}
LOCATION = 'gid://shopify/Location/113005527380'

# 1. Kollektionsmedlemskap från källexporten: produkt-handle -> [collection-GID:er]
coll_handle_by_id = {}
membership = {}
for line in open(SRC_COLLECTIONS):
    o = json.loads(line)
    if o.get('id','').startswith('gid://shopify/Collection/') and '__parentId' not in o:
        coll_handle_by_id[o['id']] = o['handle']
    elif '__parentId' in o and o.get('handle'):
        src_handle = coll_handle_by_id.get(o['__parentId'])
        gid = COLLECTION_MAP.get(src_handle)
        if gid:
            membership.setdefault(o['handle'], []).append(gid)

# 2. Slå ihop batch + översättning
out_path = os.path.join(BASE, 'products.mx.jsonl')
n = 0
missing = []
with open(out_path, 'w') as out:
    for bi in range(7):
        batch = json.load(open(os.path.join(BASE, f'batches/batch-{bi}.json')))
        es = json.load(open(os.path.join(BASE, f'out/batch-{bi}.es.json')))
        for p in batch:
            h = p['handle']
            t = es.get(h)
            if not t:
                missing.append(h); continue
            optT = t.get('optionTranslations') or {}
            optVT = t.get('optionValueTranslations') or {}
            opts = []
            for o in (p.get('options') or []):
                name = o['name']
                if name == 'Title': continue
                opts.append({'name': optT.get(name, name),
                             'values': [{'name': optVT.get(v, v)} for v in o.get('values', [])]})
            variants = []
            for v in p['variants']:
                vo = []
                for so in (v.get('selectedOptions') or []):
                    if so['name'] == 'Title': continue
                    vo.append({'optionName': optT.get(so['name'], so['name']),
                               'name': optVT.get(so['value'], so['value'])})
                var = {'price': str(v['price_mxn']),
                       'inventoryPolicy': 'CONTINUE',
                       'inventoryQuantities': [{'locationId': LOCATION, 'name': 'available', 'quantity': 100}]}
                if v.get('compareAt_mxn'): var['compareAtPrice'] = str(v['compareAt_mxn'])
                if v.get('sku'): var['sku'] = v['sku']
                if vo: var['optionValues'] = vo
                variants.append(var)
            row = {
                'handle': h,
                'title': t['title'],
                'descriptionHtml': t.get('descriptionHtml') or '',
                'vendor': 'GrillForge Co',
                'status': p.get('status') or 'ACTIVE',
                'productType': p.get('productType') or '',
                'tags': t.get('tags') or [],
                'seo': t.get('seo'),
                'templateSuffix': p.get('templateSuffix') or '',
                'productOptions': opts if opts else None,
                'variants': variants,
                'media': [{'originalSource': m['url'], 'alt': (t.get('title') or ''), 'mediaContentType': 'IMAGE'}
                          for m in (p.get('media') or []) if m.get('url')],
                'collections': membership.get(h, []),
                'flags': t.get('flags') or [],
            }
            out.write(json.dumps(row, ensure_ascii=False) + '\n')
            n += 1
print(f'{n} produkter -> {out_path}')
if missing: print('SAKNAR ÖVERSÄTTNING:', missing); sys.exit(1)
