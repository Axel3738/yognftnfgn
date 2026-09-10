#!/usr/bin/env python3
"""Bygger körningens sida: produkterna att titta på + knappen som laddar ner offertarket.

    python3 sida.py --fynd korningar/<datum>/fynd.json [--xlsx <fil>] [--ut korningar/<datum>/sida.html]

Sidan publiceras som artefakt med `capabilities: {downloads: true, db: {}}`. Arket ligger inbakat i sidan som
base64 och `claude.use("downloads")` → `save({filename, data})` lämnar det till Axel. Det är enda
vägen: en vanlig `<a download>` är död i artefaktens sandlåda, och ett ark på 15 KB ryms med marginal.
`db` bär Axels ja/kanske/nej per produkt (samlingen `feedback`, dokument `<datum>__<product_id>`) —
rutinen läser den nästa morgon med `Artifact read_db` och `feedback.py` räknar om vikterna.

Bilderna krymps och bakas in som data-URI — externa bilder blockeras av artefaktens CSP.
"""
import argparse
import base64
import json
import os
import re
import subprocess
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
KRYMP = os.path.join(os.path.dirname(HERE), "docs", "temu-jakt-v2", "jakt", "v24", "krymp-bild.cjs")
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}


def bild_data_uri(url, cachedir, pid):
    if not url:
        return None
    ra = os.path.join(cachedir, f"{pid}.jpg")
    liten = os.path.join(cachedir, f"{pid}-480.jpg")
    try:
        if not os.path.exists(ra):
            os.makedirs(cachedir, exist_ok=True)
            req = urllib.request.Request(url, headers=UA)
            open(ra, "wb").write(urllib.request.urlopen(req, timeout=40).read())
        if not os.path.exists(liten) and os.path.exists(KRYMP):
            env = dict(os.environ)
            env["NODE_PATH"] = subprocess.run(["npm", "root", "-g"], capture_output=True, text=True).stdout.strip()
            subprocess.run(["node", KRYMP, ra, liten, "480", "0.72"], capture_output=True, env=env, timeout=120)
        f = liten if os.path.exists(liten) and os.path.getsize(liten) > 0 else ra
        return "data:image/jpeg;base64," + base64.b64encode(open(f, "rb").read()).decode("ascii")
    except Exception as e:
        print(f"  bild {pid}: {str(e)[:50]}")
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fynd", required=True)
    ap.add_argument("--xlsx")
    ap.add_argument("--ut")
    a = ap.parse_args()

    d = json.load(open(a.fynd, encoding="utf-8"))
    katalog = os.path.dirname(a.fynd)
    datum = d["datum"]
    xlsx = a.xlsx or os.path.join(katalog, f"Leverantorsoffert-{datum}.xlsx")
    ut = a.ut or os.path.join(katalog, "sida.html")

    def kort_namn(t):
        """Leverantörstitlar är 100+ tecken av sökord. Kortet ska gå att läsa på en telefon."""
        t = re.sub(r"\s*[,|–-]\s*(for|with|suitable)\b.*$", "", t, flags=re.I).strip()
        return (t[:64].rsplit(" ", 1)[0] + "…") if len(t) > 68 else t

    kort = []
    for p in d["produkter"]:
        e = p["ekonomi"]
        # svenskt namn när körningen satt ett (DOA-raderna), annars leverantörens titel nedkortad
        kort.append({"product_id": str(p["product_id"]), "namn": p.get("namn_sv") or kort_namn(p["titel"]), "hela_namn": p["titel"],
                     "url": p["url"], "grupp": p.get("grupp", ""),
                     # taggarna följer med in i feedback-dokumentet så vikterna kan räknas utan fynd.json
                     "taggar": p.get("taggar", {}),
                     "inkop": p.get("pris_text"), "landad": e["landad"], "pris": e["forslag_pris"],
                     "multipel": e["multipel"], "sald": p.get("sald", ""),
                     # poängkortet (MASTERPROMPT §5): summa + launch-kandidat / offertrad / svag offertrad
                     "poang": p.get("poang"), "status": p.get("status", ""),
                     "bild": bild_data_uri(p.get("bild"), os.path.join(katalog, "bilder"), p["product_id"])})

    xlsx_b64 = base64.b64encode(open(xlsx, "rb").read()).decode("ascii")
    mall = open(os.path.join(HERE, "sida-mall.html"), encoding="utf-8").read()
    html = (mall.replace("/*__DATA__*/[]", json.dumps(kort, ensure_ascii=False))
                .replace('/*__XLSX__*/""', json.dumps(xlsx_b64))
                .replace('/*__DATUM__*/""', json.dumps(datum))
                .replace('/*__FILNAMN__*/""', json.dumps(os.path.basename(xlsx))))
    open(ut, "w", encoding="utf-8").write(html)
    print(f"{ut}: {len(kort)} produkter, ark {os.path.getsize(xlsx)//1024} KB, sida {os.path.getsize(ut)//1024} KB")


if __name__ == "__main__":
    main()
