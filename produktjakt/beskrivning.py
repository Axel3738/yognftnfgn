#!/usr/bin/env python3
"""Hämtar en AliExpress-produktsidas läsbara text — titeln, egenskapstabellen och säljarens
beskrivning — så att mekanismen går att bedöma på riktigt i stället för att gissas ur rubriken.

    python3 beskrivning.py <url-eller-product_id> [...]

Varför den behövs: `ali.py produkt()` ger bara titel, pris och bild. En titel är sökordsstoppad
och säger ingenting om HUR varan löser problemet. Mekanismen — det som gör den annorlunda mot
kedjans variant — står i egenskaperna och i beskrivningen, och den avgör om varan är värd att
testa. *(Axels besked 2026-09-09: leta gemensamma variabler i mekanik och funktion, inte i nisch.)*

Beskrivningen ligger inte i sidan utan bakom `descriptionModule.descriptionUrl`, som hämtas separat.
"""
import html
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ali  # noqa: E402


def _text(h, tak=6000):
    h = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", h)
    h = re.sub(r"(?s)<[^>]+>", " ", h)
    h = html.unescape(h)
    h = re.sub(r"[ \t\xa0]+", " ", h)
    h = re.sub(r"\n\s*\n+", "\n", h).strip()
    return h[:tak]


def beskriv(mal):
    pid = str(mal).strip()
    m = re.search(r"/item/(\d+)", pid)
    if m:
        pid = m.group(1)
    url = f"https://www.aliexpress.com/item/{pid}.html"
    sida, _ = ali._hamta(url)

    ut = {"product_id": pid, "url": url}
    titel = re.search(r'"subject"\s*:\s*"([^"]{10,300})"', sida)
    if titel:
        ut["titel"] = html.unescape(titel.group(1))

    # Egenskapstabellen: name/value-par i specificationModule
    par = re.findall(r'"attrName"\s*:\s*"([^"]{1,60})"\s*,\s*"attrValue"\s*:\s*"([^"]{1,120})"', sida)
    if par:
        ut["egenskaper"] = {html.unescape(k): html.unescape(v) for k, v in par[:40]}

    # Säljarens beskrivning ligger bakom en egen URL
    d = re.search(r'"descriptionUrl"\s*:\s*"([^"]+)"', sida)
    if d:
        durl = d.group(1).replace("\\u002F", "/").replace("\\/", "/")
        if durl.startswith("//"):
            durl = "https:" + durl
        try:
            ut["beskrivning"] = _text(ali._hamta(durl, forsok=2)[0])
        except Exception as e:
            ut["beskrivning_fel"] = str(e)[:80]
    return ut


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    for mal in sys.argv[1:]:
        try:
            print(json.dumps(beskriv(mal), ensure_ascii=False, indent=1))
        except Exception as e:
            print(json.dumps({"mal": mal, "fel": str(e)[:120]}, ensure_ascii=False))
