#!/usr/bin/env python3
"""AF-pricerunner.py — läser svenska golvet ur PriceRunners söksida (lins AF, 2026-09-26).

Användning: python3 AF-pricerunner.py "<sökord>" [antal]
Skriver namn · lägsta pris · kategori · URL per träff. Bara det som faktiskt står på sidan.
"""
import json
import re
import subprocess
import sys
import urllib.parse

ord_ = sys.argv[1]
antal = int(sys.argv[2]) if len(sys.argv) > 2 else 12
url = "https://www.pricerunner.se/search?q=" + urllib.parse.quote(ord_)
html = subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", url], capture_output=True, text=True).stdout
i = html.find('"searchQuery":')
if i < 0:
    print(f"{url}\n  (ingen searchQuery i svaret — {len(html)} tecken)")
    sys.exit(0)
j = html.find('"products":[', i)
# balanserad klippning av listan
start = j + len('"products":')
djup, k, strang, esc = 0, start, False, False
while k < len(html):
    c = html[k]
    if esc:
        esc = False
    elif c == "\\":
        esc = True
    elif c == '"':
        strang = not strang
    elif not strang:
        if c == "[":
            djup += 1
        elif c == "]":
            djup -= 1
            if djup == 0:
                break
    k += 1
try:
    prods = json.loads(html[start:k + 1])
except Exception as e:
    print(f"{url}\n  (kunde inte tolka listan: {e})")
    sys.exit(0)
print(f"{url}  — {len(prods)} träffar")
for p in prods[:antal]:
    lp = (p.get("lowestPrice") or {}).get("amount")
    cat = (p.get("category") or {}).get("name")
    print(f"  {str(lp):>9} kr  {p.get('name','')[:70]}  [{cat}]  https://www.pricerunner.se{p.get('url','')}")
