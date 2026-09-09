#!/usr/bin/env python3
"""Produkthittaren: söker AliExpress på säsongens objekt och gallrar mot de gater som går att räkna.

    python3 hitta.py [--antal 12] [--manad 9] [--sokord 14] [--ut korningar/<datum>/fynd.json]

Vad den gör:
  1. Drar dagens sökord ur `sokord.json` — bara grupper vars `manader` innehåller körningsmånaden
     (kranskyddsfällan: sälj när skadan syns, inte innan) och viktat så att tunga grupper kommer oftare.
  2. Söker AliExpress per ord och samlar träffar.
  3. Gallrar på det som går att avgöra maskinellt:
       • STOPPORD — negativa rymden ur `docs/temu-vinnar-dna.md` avsnitt 6 (kläder, kit, lek, inomhus …)
       • ekonomin — landad kostnad ≈ pris × 1,5 (inköpspriset är i USD, kursen läses ur `kurs.json`),
         svenskt pris ≥ 2,4 × landad och ≥ 300 kr, landad ≤ 420 kr (annars spräcker 2,4× 1 000-kronorstaket)
       • dubbletter mot `sedda.json` — samma produkt föreslås aldrig två gånger
  4. Rangordnar på uppslaget (hur många gånger vi kan ta ut inköpspriset) och skriver fynd.json.

Vad den INTE gör: den svenska hyllan, annonsörsräkningen och materialbedömningen (REGEL.md G2, G4, G5).
De kräver läsning och görs av `/produktjakt`-kommandots agentsteg — här flaggas bara det som är räknat.
Ingen siffra hittas på: saknas priset hoppas raden över i stället för att gissas.
"""
import argparse
import datetime
import json
import os
import random
import re
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ali  # noqa: E402

# Negativa rymden — kategorier som aldrig vunnit i kontot (docs/temu-vinnar-dna.md avsnitt 6)
STOPPORD = [
    "shirt", "pants", "jacket", "hoodie", "sock", "shoe", "sneaker", "sandal", "slipper", "boot",
    "glove", "hat ", "cap ", "underwear", "bra ", "dress", "costume", "pajama", "clothing",
    "toy", "doll", "puzzle", "game set", "kids", "children", "baby", "infant",
    "phone case", "screen protector", "charger cable", "earbud", "headphone", "smart watch",
    "makeup", "cosmetic", "skin care", "shampoo", "supplement", "vitamin",
    "curtain rod", "bedding", "pillowcase", "duvet", "sofa cover", "tablecloth",
    "sticker pack", "keychain", "jewelry", "necklace", "bracelet", "ring set",
]
# Kalibrering mätt 2026-09-08 (docs/temu-jakt-v2/jakt/v22/DATAVAGAR.md avsnitt 6)
FRAKT_PASLAG = 1.5          # landad kostnad ≈ inköpspris × 1,5
KRAV_MULTIPEL = 2.4         # svenskt pris ≥ 2,4 × landad
GOLV_SEK = 300              # under 300 kr har aldrig vunnit
TAK_LANDAD_SEK = 420        # över det spräcker 2,4× 1 000-kronorstaket


def kurs():
    """USD→SEK. Läses ur kurs.json om den är färsk, annars ur ECB. Faller tillbaka på senast kända."""
    p = os.path.join(HERE, "kurs.json")
    idag = datetime.date.today().isoformat()
    if os.path.exists(p):
        d = json.load(open(p, encoding="utf-8"))
        if d.get("datum") == idag:
            return d["usd_sek"], f"kurs.json {d['datum']}"
    try:
        import urllib.request
        import xml.etree.ElementTree as ET
        with urllib.request.urlopen("https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml", timeout=25) as r:
            root = ET.fromstring(r.read())
        rates = {c.get("currency"): float(c.get("rate")) for c in root.iter()
                 if c.get("currency") and c.get("rate")}
        v = rates["SEK"] / rates["USD"]
        json.dump({"datum": idag, "usd_sek": round(v, 4), "kalla": "ECB eurofxref-daily"},
                  open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        return round(v, 4), f"ECB {idag}"
    except Exception:
        if os.path.exists(p):
            d = json.load(open(p, encoding="utf-8"))
            return d["usd_sek"], f"kurs.json {d['datum']} (ECB svarade inte)"
        raise SystemExit("Ingen valutakurs: ECB svarade inte och kurs.json saknas.")


def dagens_ord(katalog, manad, antal, frö):
    pool = []
    for g in katalog["grupper"]:
        if manad in g["manader"]:
            pool += [(o, g["grupp"]) for o in g["ord"]] * g.get("vikt", 1)
    if not pool:
        return []
    rnd = random.Random(frö)
    unika = list(dict.fromkeys(pool))
    rnd.shuffle(unika)
    # viktningen ligger i pool; dra ur den men behåll unika ord
    vald, sedda = [], set()
    for o, g in rnd.sample(pool, k=min(len(pool), antal * 4)):
        if o in sedda:
            continue
        sedda.add(o)
        vald.append((o, g))
        if len(vald) >= antal:
            break
    return vald


def stoppad(titel):
    t = titel.lower()
    return next((w.strip() for w in STOPPORD if w in t), None)


def ekonomi(pris_usd, k):
    """Returnerar (landad_sek, forslag_pris_sek, multipel) eller None när priset saknas."""
    if not pris_usd:
        return None
    landad = pris_usd * k * FRAKT_PASLAG
    if landad > TAK_LANDAD_SEK:
        return {"landad": round(landad), "dom": "FAIL", "orsak": f"landad {round(landad)} kr över taket {TAK_LANDAD_SEK}"}
    forslag = max(GOLV_SEK, round(landad * KRAV_MULTIPEL / 10) * 10)
    # priser sätts i praktiken på 9: 299, 399, 499 …
    forslag = int(round((forslag + 1) / 100) * 100 - 1) if forslag > 150 else forslag
    mult = forslag / landad if landad else 0
    dom = "PASS" if (mult >= KRAV_MULTIPEL and forslag >= GOLV_SEK) else "FAIL"
    orsak = "" if dom == "PASS" else f"uppslag {mult:.1f}× under {KRAV_MULTIPEL}×"
    return {"landad": round(landad), "forslag_pris": forslag, "multipel": round(mult, 2),
            "dom": dom, "orsak": orsak}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--antal", type=int, default=12, help="hur många produkter körningen ska leverera")
    ap.add_argument("--sokord", type=int, default=14, help="hur många sökord som körs")
    ap.add_argument("--manad", type=int, default=datetime.date.today().month)
    ap.add_argument("--datum", default=datetime.date.today().isoformat())
    ap.add_argument("--ut")
    ap.add_argument("--fro", type=int, help="slumpfrö (samma frö = samma sökord, för omkörning)")
    a = ap.parse_args()

    katalog = json.load(open(os.path.join(HERE, "sokord.json"), encoding="utf-8"))
    k, kurskalla = kurs()
    sedda_p = os.path.join(HERE, "sedda.json")
    sedda = set(json.load(open(sedda_p, encoding="utf-8"))["product_id"]) if os.path.exists(sedda_p) else set()

    fro = a.fro if a.fro is not None else int(a.datum.replace("-", ""))
    ord_lista = dagens_ord(katalog, a.manad, a.sokord, fro)
    print(f"månad {a.manad} · {len(ord_lista)} sökord · USD/SEK {k} ({kurskalla}) · {len(sedda)} sedda sedan tidigare")

    fynd, hoppade = [], {"stoppord": 0, "pris saknas": 0, "ekonomi": 0, "dubblett": 0}
    for i, (o, grupp) in enumerate(ord_lista, 1):
        try:
            traffar, sok_url = ali.sok(o, antal=8)
        except Exception as e:
            print(f"  {i:2}. {o[:44]:44} FEL {str(e)[:40]}")
            continue
        nya = 0
        for t in traffar:
            if t["product_id"] in sedda:
                hoppade["dubblett"] += 1
                continue
            s = stoppad(t["titel"])
            if s:
                hoppade["stoppord"] += 1
                continue
            if not t.get("pris"):
                hoppade["pris saknas"] += 1
                continue
            ek = ekonomi(t["pris"], k)
            if not ek or ek["dom"] != "PASS":
                hoppade["ekonomi"] += 1
                continue
            t.update({"grupp": grupp, "sok_url": sok_url, "ekonomi": ek, "usd_sek": k})
            fynd.append(t)
            sedda.add(t["product_id"])
            nya += 1
        print(f"  {i:2}. {o[:44]:44} {len(traffar):>2} träffar → {nya} nya")
        time.sleep(1.5)

    fynd.sort(key=lambda x: -x["ekonomi"]["multipel"])
    valda = fynd[:a.antal]
    ut = a.ut or os.path.join(HERE, "korningar", a.datum, "fynd.json")
    os.makedirs(os.path.dirname(ut), exist_ok=True)
    json.dump({"datum": a.datum, "manad": a.manad, "usd_sek": k, "kurskalla": kurskalla,
               "sokord": [{"ord": o, "grupp": g} for o, g in ord_lista],
               "hoppade": hoppade, "antal_kandidater": len(fynd), "produkter": valda},
              open(ut, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump({"product_id": sorted(sedda)}, open(sedda_p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    print(f"\n{len(fynd)} kandidater klarade ekonomin, {len(valda)} valda → {ut}")
    print(f"bortgallrade: {hoppade}")
    for p in valda:
        e = p["ekonomi"]
        print(f"  {e['multipel']:.1f}× | inköp {p['pris_text']:>10} → landad {e['landad']:>3} kr → "
              f"sälj {e['forslag_pris']:>4} kr | {p['titel'][:56]}")


if __name__ == "__main__":
    main()
