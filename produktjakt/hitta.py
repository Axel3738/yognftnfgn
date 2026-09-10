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
KARANTAN_DAGAR = 14         # ett sökord vilar så här länge innan det får köras igen


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


def las_vikter():
    """Axels svar, räknade av feedback.py. Saknas filen är allt 0,5 och inget stoppas."""
    p = os.path.join(HERE, "vikter.json")
    if not os.path.exists(p):
        return {"dimensioner": {}, "stopp": [], "lyft": [], "antal_svar": 0}
    return json.load(open(p, encoding="utf-8"))


def vikt_for(kand, vikter):
    """Produkten av scorerna för kandidatens grupp och taggar; None om något värde är stoppat."""
    varden = {"grupp": kand.get("grupp", "")}
    varden.update(kand.get("taggar") or {})
    v = 1.0
    for dim, val in varden.items():
        for x in (val if isinstance(val, list) else [val]):
            if not x:
                continue
            if f"{dim}:{x}" in vikter.get("stopp", []):
                return None
            v *= vikter.get("dimensioner", {}).get(dim, {}).get(str(x), {}).get("score", 0.5)
    return round(v, 4)


def bygg_pool(katalog, objektkat, manad, undvik, vikter, kalla="bada"):
    """Sökfraserna att dra ur, viktade (en fras ligger i poolen lika många gånger som sin vikt).

    Två källor:
      • objekt.json — MASTERPROMPTENS väg: objektet som far illa × deadline-månaderna × skyddsformen.
        Frasen taggas med objekt + arketyp så Axels svar kan räknas på variabler, inte på nisch.
      • sokord.json — den gamla katalogen (objekt × tillbehör). Kvar som reserv; ger kedjevaror.
    undvik = fraser i karantän (körda de senaste KARANTAN_DAGAR dagarna). Samma fras ger samma hylla.
    vikter = Axels svar (feedback.py): ≥ 3 nej utan ja på en grupp/objekt/arketyp → söks inte alls.
    Ingen källa viktas UPP av ja — SIGNALER.md: att en vara gått bra säger inget om nischen."""
    stopp = set((vikter or {}).get("stopp", []))
    pool = []
    if kalla in ("bada", "objekt") and objektkat:
        for ob in objektkat.get("objekt", []):
            if manad not in ob.get("manader", []):
                continue
            taggar = {"objekt": ob["objekt"], "arketyp": ob.get("arketyp", ""), "form": ob.get("form", "")}
            if f"grupp:{ob['objekt']}" in stopp or any(f"{d}:{v}" in stopp for d, v in taggar.items() if v):
                continue
            if ob.get("parkerad_till_vecka"):
                continue
            pool += [(f, ob["objekt"], taggar, ob.get("ankare_sek")) for f in ob.get("sokfraser_en", []) if f not in undvik] * ob.get("vikt", 3)
    if kalla in ("bada", "sokord") and katalog:
        for g in katalog["grupper"]:
            if manad in g["manader"] and f"grupp:{g['grupp']}" not in stopp:
                pool += [(o, g["grupp"], {}, None) for o in g["ord"] if o not in undvik] * g.get("vikt", 1)
    return pool


def dagens_ord(katalog, manad, antal, frö, undvik=(), vikter=None, objektkat=None, kalla="bada"):
    """Drar dagens fraser ur poolen. Returnerar (fras, grupp, taggar)."""
    pool = bygg_pool(katalog, objektkat, manad, set(undvik), vikter, kalla)
    if not pool:  # alla fraser förbrukade — släpp karantänen hellre än att leverera tomt
        pool = bygg_pool(katalog, objektkat, manad, set(), vikter, kalla)
    if not pool:
        return []
    rnd = random.Random(frö)
    vald, sedda = [], set()
    for o, g, taggar, ankare in rnd.sample(pool, k=min(len(pool), antal * 4)):
        if o in sedda:
            continue
        sedda.add(o)
        vald.append((o, g, taggar, ankare))
        if len(vald) >= antal:
            break
    return vald


VITLISTA = ("shoe", "sneaker", "sandal", "slipper", "boot", "glove", "hat ", "cap ")   # A6 kroppsskydd, bara med --vitlista
ANKARE_KVOT = 0.7           # tänkt pris = 0,7 × fackhandelns märke (MASTERPROMPT steg 5: 0,4–0,85×)


def stoppad(titel, manad=None, vitlista=False):
    """Negativa rymden. Två smala undantag ur MASTERPROMPT.md avsnitt 6:
    A4 datumlådan — toy/kids/children släpps igenom för 'advent calendar'/'24' i månad 9–11;
    A6 kroppsskyddet — sko/handske/mössa släpps igenom bara när körningen uttryckligen ber om det."""
    t = titel.lower()
    kalender = manad in (9, 10, 11) and ("advent calendar" in t or " 24 " in f" {t} ")
    for w in STOPPORD:
        if w not in t:
            continue
        if kalender and w in ("toy", "kids", "children", "puzzle", "game set"):
            continue
        if vitlista and w in VITLISTA:
            continue
        return w.strip()
    return None


def pris_pa_9(x):
    """Priser sätts i praktiken på 9: 299, 399, 499 …"""
    return int(round((x + 1) / 100) * 100 - 1) if x > 150 else int(round(x))


def ekonomi(pris_usd, k, ankare_sek=None):
    """Landad kostnad, tänkt pris och uppslag — eller None när priset saknas.

    Två vägar (MASTERPROMPT steg 5):
      • med mätt ankare: tänkt pris = 0,7 × märket, max landad = pris ÷ 2,4 — taket 420 gäller inte
        (taköverdraget 1 129 kr hade fällts av taket; det är därför ankaret ska mätas FÖRE sökningen)
      • utan ankare: tänkt pris = landad × 2,4 (minst 300), landad ≤ 420 kr"""
    if not pris_usd:
        return None
    landad = pris_usd * k * FRAKT_PASLAG
    if ankare_sek:
        forslag = pris_pa_9(ankare_sek * ANKARE_KVOT)
        tak = forslag / KRAV_MULTIPEL
        if landad > tak:
            return {"landad": round(landad), "forslag_pris": forslag, "dom": "FAIL",
                    "orsak": f"landad {round(landad)} kr över {round(tak)} kr (pris {forslag} ÷ {KRAV_MULTIPEL})", "ankare_sek": ankare_sek}
    else:
        if landad > TAK_LANDAD_SEK:
            return {"landad": round(landad), "dom": "FAIL", "orsak": f"landad {round(landad)} kr över taket {TAK_LANDAD_SEK} (inget ankare mätt)"}
        forslag = pris_pa_9(max(GOLV_SEK, round(landad * KRAV_MULTIPEL / 10) * 10))
    mult = forslag / landad if landad else 0
    dom = "PASS" if (mult >= KRAV_MULTIPEL and forslag >= GOLV_SEK) else "FAIL"
    orsak = "" if dom == "PASS" else f"uppslag {mult:.1f}× under {KRAV_MULTIPEL}×"
    return {"landad": round(landad), "forslag_pris": forslag, "multipel": round(mult, 2),
            "be_cpa": round(forslag - landad), "dom": dom, "orsak": orsak, "ankare_sek": ankare_sek}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--antal", type=int, default=12, help="hur många produkter körningen ska leverera")
    ap.add_argument("--sokord", type=int, default=14, help="hur många sökord som körs")
    ap.add_argument("--manad", type=int, default=datetime.date.today().month)
    ap.add_argument("--datum", default=datetime.date.today().isoformat())
    ap.add_argument("--ut")
    ap.add_argument("--fro", type=int, help="slumpfrö (samma frö = samma sökord, för omkörning)")
    ap.add_argument("--kalla", choices=("bada", "objekt", "sokord"), default="objekt",
                    help="objekt.json (masterprompten, standard), sokord.json (gamla katalogen — ger kedjevaror) eller båda")
    ap.add_argument("--vitlista", action="store_true", help="släpp sko/handske/mössa igenom STOPPORD (A6 kroppsskydd)")
    a = ap.parse_args()

    katalog = json.load(open(os.path.join(HERE, "sokord.json"), encoding="utf-8"))
    objekt_p = os.path.join(HERE, "objekt.json")
    objektkat = json.load(open(objekt_p, encoding="utf-8")) if os.path.exists(objekt_p) else None
    k, kurskalla = kurs()
    sedda_p = os.path.join(HERE, "sedda.json")
    sedda = set(json.load(open(sedda_p, encoding="utf-8"))["product_id"]) if os.path.exists(sedda_p) else set()

    fro = a.fro if a.fro is not None else int(a.datum.replace("-", ""))
    logg_p = os.path.join(HERE, "anvanda-sokord.json")
    logg = json.load(open(logg_p, encoding="utf-8")) if os.path.exists(logg_p) else {}
    grans = (datetime.date.fromisoformat(a.datum) - datetime.timedelta(days=KARANTAN_DAGAR)).isoformat()
    undvik = {o for o, d in logg.items() if d >= grans}
    vikter = las_vikter()
    ord_lista = dagens_ord(katalog, a.manad, a.sokord, fro, undvik, vikter, objektkat, a.kalla)
    n_obj = sum(1 for _, _, t, _ in ord_lista if t)
    n_ank = sum(1 for _, _, _, an in ord_lista if an)
    print(f"månad {a.manad} · {len(ord_lista)} sökord ({n_obj} ur objekt.json, {n_ank} med mätt ankare) · USD/SEK {k} ({kurskalla}) · "
          f"{len(sedda)} sedda sedan tidigare · {vikter.get('antal_svar', 0)} svar från Axel, "
          f"{len(vikter.get('stopp', []))} stopp, {len(vikter.get('lyft', []))} lyft")
    if n_obj and not n_ank:
        print("  obs: inget ankare_sek i objekt.json — priset räknas som landad × 2,4 och taket 420 kr gäller (MASTERPROMPT steg 4–5 ogjorda)")

    fynd, hoppade = [], {"stoppord": 0, "pris saknas": 0, "ekonomi": 0, "dubblett": 0, "axel_nej": 0}
    for i, (o, grupp, taggar, ankare) in enumerate(ord_lista, 1):
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
            s = stoppad(t["titel"], a.manad, a.vitlista)
            if s:
                hoppade["stoppord"] += 1
                continue
            if not t.get("pris"):
                hoppade["pris saknas"] += 1
                continue
            ek = ekonomi(t["pris"], k, ankare)
            if not ek or ek["dom"] != "PASS":
                hoppade["ekonomi"] += 1
                continue
            t.update({"grupp": grupp, "taggar": taggar, "sok_url": sok_url, "ekonomi": ek, "usd_sek": k})
            v = vikt_for(t, vikter)
            if v is None:
                hoppade["axel_nej"] += 1
                continue
            t["vikt"] = v
            t["rank"] = round(ek["multipel"] * v, 3)
            fynd.append(t)
            sedda.add(t["product_id"])
            nya += 1
        print(f"  {i:2}. {o[:44]:44} {len(traffar):>2} träffar → {nya} nya")
        time.sleep(1.5)

    # uppslag × Axels vikt: en grupp han sagt nej till tre gånger är redan borta (stopp), resten sjunker/stiger
    fynd.sort(key=lambda x: -x["rank"])
    valda = fynd[:a.antal]
    ut = a.ut or os.path.join(HERE, "korningar", a.datum, "fynd.json")
    os.makedirs(os.path.dirname(ut), exist_ok=True)
    json.dump({"datum": a.datum, "manad": a.manad, "usd_sek": k, "kurskalla": kurskalla,
               "sokord": [{"ord": o, "grupp": g, "taggar": t, "ankare_sek": an} for o, g, t, an in ord_lista],
               "hoppade": hoppade, "antal_kandidater": len(fynd), "produkter": valda},
              open(ut, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump({"product_id": sorted(sedda)}, open(sedda_p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    logg.update({o: a.datum for o, _, _, _ in ord_lista})
    json.dump(logg, open(logg_p, "w", encoding="utf-8"), ensure_ascii=False, indent=1, sort_keys=True)

    print(f"\n{len(fynd)} kandidater klarade ekonomin, {len(valda)} valda → {ut}")
    print(f"bortgallrade: {hoppade}")
    for p in valda:
        e = p["ekonomi"]
        print(f"  {e['multipel']:.1f}× | inköp {p['pris_text']:>10} → landad {e['landad']:>3} kr → "
              f"sälj {e['forslag_pris']:>4} kr | {p['titel'][:56]}")


if __name__ == "__main__":
    main()
