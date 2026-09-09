#!/usr/bin/env python3
"""Läser EN AliExpress-produktsida och plockar namn, pris och bild-URL.

    python3 ali-produkt.py <url eller productId> [--json ut.json]

Produktsidan bär ett inbäddat `window._d_c_.DCData`/`data:` JSON. Vi går på de fält som finns i
alla varianter: og:title / <title> för namn, og:image för bild, och priset ur JSON:en när det finns.
Hittar aldrig på ett värde — saknas fältet blir det None.
"""
import argparse, json, re, urllib.request

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/128.0 Safari/537.36")


def las(url):
    """Följer omdirigeringen och sätter locale-kakan — utan den svarar AliExpress 302 till ett tomt skal."""
    if url.isdigit():
        url = f"https://www.aliexpress.com/item/{url}.html"
    req = urllib.request.Request(url, headers={
        "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9",
        "Cookie": "aep_usuc_f=site=glo&c_tp=USD&region=SE&b_locale=en_US"})
    with urllib.request.urlopen(req, timeout=45) as r:
        return r.read().decode("utf-8", "ignore"), r.geturl()


def plocka(html, url):
    pid = (re.search(r"/item/(\d+)\.html", url) or re.search(r'"productId"\s*:\s*"?(\d{8,})', html))
    pid = pid.group(1) if pid else None
    def meta(prop):
        m = re.search(r'<meta[^>]+property="og:%s"[^>]+content="([^"]*)"' % prop, html) or \
            re.search(r'<meta[^>]+content="([^"]*)"[^>]+property="og:%s"' % prop, html)
        return m.group(1) if m else None
    titel = meta("title")
    if not titel:
        m = re.search(r"<title>([^<]*)</title>", html)
        titel = m.group(1).strip() if m else None
    if titel:
        titel = re.sub(r"\s*[-|–]\s*AliExpress.*$", "", titel).strip()
    bild = meta("image")
    if bild and bild.startswith("//"):
        bild = "https:" + bild
    pris = None
    for pat in (r'"formatedActivityPrice"\s*:\s*"([^"]+)"', r'"formatedPrice"\s*:\s*"([^"]+)"',
                r'"formatedAmount"\s*:\s*"([^"]+)"', r'og:price:amount"[^>]+content="([^"]+)"',
                r'content="([^"]*US ?\$[0-9][0-9.,]*[^"]*)"[^>]*property="og:description"'):
        m = re.search(pat, html)
        if m:
            pris = m.group(1); break
    return {"product_id": pid, "url": f"https://www.aliexpress.com/item/{pid}.html" if pid else url,
            "titel": titel, "pris_text": pris, "bild": bild}


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("mal"); ap.add_argument("--json")
    a = ap.parse_args()
    html, slut = las(a.mal)
    d = plocka(html, slut)
    print(json.dumps(d, ensure_ascii=False, indent=1))
    if a.json:
        json.dump(d, open(a.json, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
