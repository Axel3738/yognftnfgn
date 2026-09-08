#!/usr/bin/env python3
"""Söker AliExpress och plockar riktiga, öppningsbara produktlänkar med pris och bild.

    python3 ali-sok.py "<sökord>" [--antal 4] [--json ut.json]

Varför AliExpress: Temu stryper containern till ~1 hämtning per timme (mätt 2026-09-08 hela dagen), så
en lista med kontrollerade Temu-länkar går inte att bygga. AliExpress svarar utan strypning och säljer
samma leverantörsprodukter. Sökresultatsidan bär ett inbäddat JSON (`itemList.content`) med
productId, titel, bild och pris — allt vi behöver för att ge Axel en länk som faktiskt öppnas.

Skriver inget i repot utom via --json. Priser läses som de står (USD på .com), aldrig omräknade i tysthet.
"""
import argparse
import json
import re
import urllib.parse
import urllib.request

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/128.0 Safari/537.36")


def hamta(sokord):
    slug = re.sub(r"[^a-z0-9]+", "-", sokord.lower()).strip("-")
    url = f"https://www.aliexpress.com/w/wholesale-{urllib.parse.quote(slug)}.html"
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "sv-SE,sv;q=0.9"})
    with urllib.request.urlopen(req, timeout=40) as r:
        return url, r.read().decode("utf-8", "ignore")


def plocka(html, antal):
    """Läser itemList.content ur sidans inbäddade JSON. Balanserar klamrar — regex räcker inte."""
    i = html.find('"itemList"')
    if i < 0:
        return []
    j = html.find('"content":[', i)
    if j < 0:
        return []
    start = j + len('"content":')
    djup, k, inne_strang, escape = 0, start, False, False
    while k < len(html):
        c = html[k]
        if escape:
            escape = False
        elif c == "\\":
            escape = True
        elif c == '"':
            inne_strang = not inne_strang
        elif not inne_strang:
            if c in "[{":
                djup += 1
            elif c in "]}":
                djup -= 1
                if djup == 0:
                    break
        k += 1
    try:
        rader = json.loads(html[start:k + 1])
    except Exception:
        return []
    ut = []
    for r in rader:
        pid = r.get("productId") or r.get("redirectedId")
        titel = ((r.get("title") or {}).get("displayTitle") or "").strip()
        if not pid or not titel:
            continue
        pr = r.get("prices") or {}
        sale = pr.get("salePrice") or pr.get("originalPrice") or {}
        bild = ((r.get("image") or {}).get("imgUrl") or "")
        if bild.startswith("//"):
            bild = "https:" + bild
        sald = (r.get("trade") or {}).get("realTradeCount") or ""
        ut.append({"product_id": str(pid), "titel": titel,
                   "url": f"https://www.aliexpress.com/item/{pid}.html",
                   "pris": sale.get("minPrice"), "valuta": sale.get("currencyCode"),
                   "pris_text": sale.get("formattedPrice"), "bild": bild, "sald": sald})
        if len(ut) >= antal:
            break
    return ut


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("sokord")
    ap.add_argument("--antal", type=int, default=4)
    ap.add_argument("--json")
    a = ap.parse_args()
    url, html = hamta(a.sokord)
    rader = plocka(html, a.antal)
    print(f"{a.sokord}: {len(rader)} träffar ({url})")
    for r in rader:
        print(f"  {r['pris_text'] or r['pris']} {r['valuta'] or ''} | {r['titel'][:78]}")
        print(f"    {r['url']}")
    if a.json:
        json.dump({"sokord": a.sokord, "sok_url": url, "traffar": rader},
                  open(a.json, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
