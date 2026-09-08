#!/usr/bin/env python3
"""Bygger swipe-vyn ur URVAL.json + bästa tillgängliga hero och Temu-data.

    python3 bygg-swipe.py [--runda r1]

Till skillnad från bygg-slutlista.py (som VÄGRAR allt som inte är live-verifierat i dag) är swipe-vyn
ett BESLUTSVERKTYG över koncept: Axel svarar ja/nej på vad som ska testas. Varje kort bär därför en
ärlig verifieringsstämpel:
  LIVE i dag      live/<id>/data.json hämtad i dag, hero sedd
  SEDD <datum>    hero och pris lästa den dagen (v23/material eller CDN), listningen inte omkollad
Ingen rad får stå utan hero — en produkt utan bild går inte att bedöma på en telefon.

Bildkälla i fallande ordning: v24/live/<id>/hero.jpg → v23/material/<id>/hero.jpg → v24/cdn-hero/<id>.jpg.
Bilderna krymps till 640 px via krymp-bild.cjs (Chromium — ingen PIL/sharp i miljön) och bakas in som
data-URI så sidan fungerar utan externa anrop.
"""
import base64
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
JAKT = os.path.dirname(HERE)
KRYMP = os.path.join(HERE, "krymp-bild.cjs")


def arg(flag, default):
    return sys.argv[sys.argv.index(flag) + 1] if flag in sys.argv else default


def hero_for(gid):
    for p in (os.path.join(HERE, "live", gid, "hero.jpg"),
              os.path.join(JAKT, "v23", "material", gid, "hero.jpg"),
              os.path.join(HERE, "cdn-hero", f"{gid}.jpg")):
        if os.path.exists(p) and os.path.getsize(p) > 0:
            return p
    return None


def temu_data(gid):
    """(pris_sek, valuta, rec, verifiering, datum) ur bästa kända källa."""
    p = os.path.join(HERE, "live", gid, "data.json")
    if os.path.exists(p):
        d = json.load(open(p, encoding="utf-8"))
        if d.get("verdict") == "LIVE":
            return d.get("price"), d.get("currency"), d.get("review_count"), "LIVE", d["fetched"][:16].replace("T", " ")
    p = os.path.join(JAKT, "v23", "material", gid, "data.json")
    if os.path.exists(p):
        d = json.load(open(p, encoding="utf-8"))
        return d.get("price_sek"), d.get("currency"), d.get("review_count"), "SEDD", (d.get("fetched") or "")[:10]
    p = os.path.join(JAKT, "v22", "material", f"{gid}.json")
    if os.path.exists(p):
        d = json.load(open(p, encoding="utf-8"))
        return d.get("price_sek"), d.get("currency"), d.get("review_count"), "SEDD", (d.get("fetched") or "")[:10]
    return None, None, None, "OKÄND", ""


def krymp(src, dst):
    if os.path.exists(dst) and os.path.getsize(dst) > 0:
        return dst
    env = dict(os.environ)
    env["NODE_PATH"] = subprocess.run(["npm", "root", "-g"], capture_output=True, text=True).stdout.strip()
    subprocess.run(["node", KRYMP, src, dst, "640", "0.78"], capture_output=True, text=True, env=env, timeout=180)
    if not os.path.exists(dst):
        raise RuntimeError(f"krymp misslyckades för {src}")
    return dst


def main():
    runda = arg("--runda", "r1")
    urval = json.load(open(os.path.join(HERE, "URVAL.json"), encoding="utf-8"))
    kort, utan = [], []
    os.makedirs(os.path.join(HERE, "sma"), exist_ok=True)
    for u in urval:
        gid = str(u["goods_id"])
        h = hero_for(gid)
        if not h:
            utan.append((gid, u["namn"], "ingen hero"))
            continue
        small = krymp(h, os.path.join(HERE, "sma", f"{gid}-640.jpg"))
        b64 = base64.b64encode(open(small, "rb").read()).decode("ascii")
        pris, cur, rec, verif, datum = temu_data(gid)
        temu_sek = None
        if pris is not None:
            temu_sek = round(float(pris)) if (cur or "SEK") == "SEK" else round(float(pris) * 7.56)
        kort.append({"id": gid, "namn": u["namn"], "pris_sek": u["pris_sek"], "temu_pris_sek": temu_sek,
                     "temu_valuta": cur or "", "rec": rec, "verif": verif, "verif_datum": datum,
                     "temu_url": f"https://www.temu.com/se/g-{gid}.html", "q4": u.get("q4", ""),
                     "hypotes": u["hypotes"], "print": u["print"], "risk": u["risk"], "hook": u.get("hook", ""),
                     "koncept_id": u.get("koncept_id", ""), "poang": u.get("poang"),
                     "hero": "data:image/jpeg;base64," + b64})
    mall = open(os.path.join(HERE, "swipe-mall.html"), encoding="utf-8").read()
    html = mall.replace("/*__DATA__*/[]", json.dumps(kort, ensure_ascii=False)).replace('/*__ROUND__*/""', json.dumps(runda))
    p = os.path.join(HERE, f"swipe-{runda}.html")
    open(p, "w", encoding="utf-8").write(html)
    json.dump([{k: v for k, v in c.items() if k != "hero"} for c in kort],
              open(os.path.join(HERE, f"swipe-{runda}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"swipe-{runda}.html: {len(kort)} kort, {os.path.getsize(p)//1024} KB")
    for c in kort:
        print(f"  {c['verif']:5} {c['verif_datum']:10} {c['id']} {c['namn'][:48]:48} {c['pris_sek']} kr (Temu {c['temu_pris_sek']} kr, {c['rec']} rec)")
    for g, n, why in utan:
        print(f"  UTAN BILD {g} {n}: {why}")


if __name__ == "__main__":
    main()
