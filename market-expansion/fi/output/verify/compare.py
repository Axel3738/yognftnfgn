#!/usr/bin/env python3
import json, sys, unicodedata

CAT = '/home/user/yognftnfgn/market-expansion/fi/output/catalog.fi.json'
STORE = '/home/user/yognftnfgn/market-expansion/fi/output/verify/store.jsonl'

cat = {p['handle']: p['descriptionHtml'] for p in json.load(open(CAT))['products']}
store = {}
ids = {}
for line in open(STORE):
    o = json.loads(line)
    if 'handle' in o:
        store[o['handle']] = o.get('descriptionHtml') or ''
        ids[o['handle']] = o['id']

print(f"catalog handles: {len(cat)}  store handles: {len(store)}")
only_cat = sorted(set(cat) - set(store))
only_store = sorted(set(store) - set(cat))
if only_cat: print("ONLY IN CATALOG:", only_cat)
if only_store: print("ONLY IN STORE:", only_store)

def diffs(a, b):
    """Return list of (pos, ctx_a, ctx_b) minimal diff regions via difflib."""
    import difflib
    out = []
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal':
            continue
        out.append((tag, i1, i2, j1, j2))
    return out

bad = {}
for h in sorted(cat):
    if h not in store:
        continue
    c, s = cat[h], store[h]
    if c == s:
        continue
    ops = diffs(c, s)
    bad[h] = (ops, c, s)

print(f"\n=== {len(bad)} products with differences ===\n")
for h, (ops, c, s) in bad.items():
    print(f"--- {h}  ({len(ops)} diff region(s))  id={ids[h]}")
    print(f"    len catalog={len(c)} store={len(s)}")
    for tag, i1, i2, j1, j2 in ops:
        ctx_c = c[max(0,i1-40):i2+40]
        ctx_s = s[max(0,j1-40):j2+40]
        print(f"    [{tag}] catalog pos {i1}..{i2}: {c[i1:i2]!r}  ->  store: {s[j1:j2]!r}")
        print(f"      catalog ctx: ...{ctx_c}...")
        print(f"      store   ctx: ...{ctx_s}...")
    print()

json.dump(sorted(bad), open('/home/user/yognftnfgn/market-expansion/fi/output/verify/bad-handles.json','w'))
json.dump(ids, open('/home/user/yognftnfgn/market-expansion/fi/output/verify/ids.json','w'))
print(f"SUMMARY: {len(store)}/{len(cat)} checked, {len(bad)} differing")
