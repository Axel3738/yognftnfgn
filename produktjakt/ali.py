#!/usr/bin/env python3
"""AliExpress-klienten: sök och produktsida.

Varför AliExpress och inte Temu: Temu stryper containerns IP till ungefär EN hämtning i timmen
(mätt hela 2026-09-08 — fyra lyckade hämtningar på åtta timmar, resten tomma skal). En rutin som
ska hitta produkter varje natt kan inte bygga på det. AliExpress svarar utan strypning och säljer
samma leverantörsvaror; länkarna går dessutom att öppna, vilket Temus döda annonser ofta inte gör.

Två funktioner:
    sok(sokord, antal)   → lista med {product_id, titel, url, pris, valuta, pris_text, bild, sald}
    produkt(url_eller_id) → {product_id, titel, url, pris_text, bild}

Sökresultatsidan bär ett inbäddat JSON (`itemList.content`). Produktsidan svarar 302 till ett tomt
skal utan locale-kakan — den sätts i varje anrop.
"""
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/128.0 Safari/537.36")
KAKA = "aep_usuc_f=site=glo&c_tp=USD&region=SE&b_locale=en_US"


def _hamta(url, forsok=3):
    for i in range(forsok):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9", "Cookie": KAKA})
            with urllib.request.urlopen(req, timeout=45) as r:
                return r.read().decode("utf-8", "ignore"), r.geturl()
        except (urllib.error.URLError, TimeoutError) as e:
            if i == forsok - 1:
                raise
            time.sleep(3 * (i + 1))
    raise RuntimeError("oåtkomlig")


def _json_efter(html, nyckel):
    """Klipper ut ett balanserat JSON-block som börjar vid nyckeln. Regex räcker inte till nästlade objekt."""
    i = html.find(nyckel)
    if i < 0:
        return None
    start = i + len(nyckel)
    while start < len(html) and html[start] not in "[{":
        start += 1
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
            if c in "[{":
                djup += 1
            elif c in "]}":
                djup -= 1
                if djup == 0:
                    break
        k += 1
    try:
        return json.loads(html[start:k + 1])
    except Exception:
        return None


def sok(sokord, antal=8):
    slug = re.sub(r"[^a-z0-9]+", "-", sokord.lower()).strip("-")
    url = f"https://www.aliexpress.com/w/wholesale-{urllib.parse.quote(slug)}.html"
    html, _ = _hamta(url)
    rader = _json_efter(html, '"itemList":{"content":') or []
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
        ut.append({"product_id": str(pid), "titel": titel,
                   "url": f"https://www.aliexpress.com/item/{pid}.html",
                   "pris": sale.get("minPrice"), "valuta": sale.get("currencyCode"),
                   "pris_text": sale.get("formattedPrice"), "bild": bild,
                   "sald": (r.get("trade") or {}).get("realTradeCount") or "",
                   "sokord": sokord})
        if len(ut) >= antal:
            break
    return ut, url


def produkt(mal):
    url = f"https://www.aliexpress.com/item/{mal}.html" if str(mal).isdigit() else mal
    html, slut = _hamta(url)

    def meta(prop):
        m = (re.search(r'<meta[^>]+property="og:%s"[^>]+content="([^"]*)"' % prop, html)
             or re.search(r'<meta[^>]+content="([^"]*)"[^>]+property="og:%s"' % prop, html))
        return m.group(1) if m else None

    pid = re.search(r"/item/(\d+)\.html", slut)
    titel = meta("title")
    if titel:
        titel = re.sub(r"\s*[-|–]\s*AliExpress.*$", "", titel).strip()
    bild = meta("image")
    if bild and bild.startswith("//"):
        bild = "https:" + bild
    pris = None
    for pat in (r'"formatedActivityPrice"\s*:\s*"([^"]+)"', r'"formatedPrice"\s*:\s*"([^"]+)"',
                r'"formatedAmount"\s*:\s*"([^"]+)"'):
        m = re.search(pat, html)
        if m:
            pris = m.group(1)
            break
    return {"product_id": pid.group(1) if pid else None, "titel": titel,
            "url": f"https://www.aliexpress.com/item/{pid.group(1)}.html" if pid else slut,
            "pris_text": pris, "bild": bild}


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and (sys.argv[1].isdigit() or "aliexpress.com/item" in sys.argv[1]):
        print(json.dumps(produkt(sys.argv[1]), ensure_ascii=False, indent=1))
    else:
        rader, url = sok(" ".join(sys.argv[1:]) or "log splitter")
        print(url)
        for r in rader:
            print(f"  {str(r['pris_text']):12} {r['titel'][:70]}\n    {r['url']}")
