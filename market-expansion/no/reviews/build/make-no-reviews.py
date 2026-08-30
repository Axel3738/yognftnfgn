#!/usr/bin/env python3
"""Bygger norska Judge.me-importfiler ur de svenska REVIEWS-arken i Drive.

    python3 market-expansion/no/reviews/build/make-no-reviews.py [--bara <id>]

Fyra saker görs per rad, samma mönster som dk/uk-bygget:
  1. title/body/reply  -> norsk bokmål (translations.no.json)
  2. reviewer_name     -> norskt namn (names.no.json) + unik e-post, se epost()
  3. product_handle    -> produktens handle på beverbutikken.no (sources.json)
  4. location          -> norsk ort (Judge.me visar orten publikt)

Butiksbundna fält nollställs: product_id, ip_address, metaobject_handle.

Rader som INTE kan importeras skrivs inte ut i CSV:n utan listas i rapporten:
saknad översättning, okänt namn, eller tomt/ogiltigt betyg. Hellre en rad
mindre än en påhittad — Judge.me kräver ett betyg och en produkt.

Handlen verifieras mot https://beverbutikken.no/products.json vid varje körning,
så ett handle som bytts i butiken upptäcks här och inte först vid importen.
"""
import csv, hashlib, json, re, sys, urllib.request
from pathlib import Path

HÄR = Path(__file__).resolve().parent
UT = HÄR.parent / "output"
KÄLLOR = json.loads((HÄR / "sources.json").read_text(encoding="utf-8"))
ÖVERSÄTTNINGAR = json.loads((HÄR / "translations.no.json").read_text(encoding="utf-8"))
NAMN = {k: v for k, v in json.loads((HÄR / "names.no.json").read_text(encoding="utf-8")).items()
        if not k.startswith("_")}

NOLLSTÄLLDA = ["product_id", "ip_address", "metaobject_handle"]
NO_ORTER = ["Oslo, Norge", "Bergen, Vestland, Norge", "Trondheim, Trøndelag, Norge"]


def norska_produkter():
    """Alla handles + id på beverbutikken.no. Publik feed, ingen token behövs."""
    alla = []
    for sida in range(1, 6):
        url = f"https://beverbutikken.no/products.json?limit=250&page={sida}"
        with urllib.request.urlopen(url, timeout=40) as r:
            produkter = json.loads(r.read().decode()).get("products", [])
        if not produkter:
            break
        alla += produkter
    return {p["handle"]: p["id"] for p in alla}


def hämta_ark(sheet_id):
    url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv"
    with urllib.request.urlopen(url, timeout=60) as r:
        return r.read().decode("utf-8-sig")


def epost(namn, produkt_id):
    """Unik adress per recensent OCH produkt.

    Judge.me kopplar en recension till en recensentprofil via e-postadressen och
    skriver över namnet med profilens. En generisk adress som johan@example.com
    matchar då någon annans profil — vid importen 2026-08-30 blev "Johan"
    publicerad som "klaas hum" och två andra som "Customer". Suffixet tvingar
    fram en ny profil, samma knep som butikens tidigare lyckade importer
    (nora.nilsen+import1_xa6L@example.com).
    """
    s = namn.lower().replace("ø", "o").replace("æ", "ae").replace("å", "a")
    s = re.sub(r"[^a-z0-9]+", ".", s).strip(".")
    unikt = hashlib.sha1(f"{s}|{produkt_id}".encode()).hexdigest()[:6]
    return f"{s}+bevno{unikt}@example.com"


def main():
    bara = None
    if "--bara" in sys.argv:
        bara = sys.argv[sys.argv.index("--bara") + 1]

    butiken = norska_produkter()
    print(f"beverbutikken.no: {len(butiken)} produkter i feeden\n")
    UT.mkdir(parents=True, exist_ok=True)

    totalt_ut, totalt_bort, problem = 0, 0, []

    for p in KÄLLOR["produkter"]:
        if bara and p["id"] != bara:
            continue
        handle = p["no_handle"]
        if handle not in butiken:
            problem.append(f"{p['id']}: handlet {handle!r} finns INTE på beverbutikken.no — hoppas över")
            print(f"✗ {p['namn']}: handle saknas i butiken ({handle})")
            continue

        rader = list(csv.DictReader(hämta_ark(p["drive_sheet"]).splitlines()))
        kolumner = list(rader[0].keys())
        ut, bort, i_ort = [], [], 0

        for nr, r in enumerate(rader, start=2):
            betyg = (r.get("rating") or "").strip()
            if betyg not in {"1", "2", "3", "4", "5"}:
                bort.append(f"rad {nr}: betyg saknas eller ogiltigt ({betyg!r})")
                continue

            saknas = [t for t in ((r.get(k) or "").strip() for k in ("title", "body", "reply"))
                      if t and t not in ÖVERSÄTTNINGAR]
            if saknas:
                bort.append(f"rad {nr}: saknar översättning för {saknas[0]!r}")
                continue

            källnamn = (r.get("reviewer_name") or "").strip()
            if källnamn not in NAMN:
                bort.append(f"rad {nr}: okänt recensentnamn {källnamn!r}")
                continue

            ny = dict(r)
            for k in ("title", "body", "reply"):
                t = (r.get(k) or "").strip()
                ny[k] = ÖVERSÄTTNINGAR[t] if t else ""
            ny["reviewer_name"] = NAMN[källnamn]
            ny["reviewer_email"] = epost(NAMN[källnamn], p["id"])
            ny["product_handle"] = handle
            if (r.get("location") or "").strip():
                ny["location"] = NO_ORTER[i_ort % len(NO_ORTER)]
                i_ort += 1
            for k in NOLLSTÄLLDA:
                if k in ny:
                    ny[k] = ""
            ut.append(ny)

        totalt_ut += len(ut)
        totalt_bort += len(bort)

        # En CSV utan rader är inget att importera — skriv den inte, så att en
        # tom fil i output/ aldrig kan förväxlas med ett färdigt resultat.
        if not ut:
            print(f"✗ {p['namn']}: 0/{len(rader)} rader dugde — ingen fil skriven")
            for b in bort:
                print(f"      bortvald: {b}")
                problem.append(f"{p['id']}: {b}")
            problem.append(f"{p['id']}: HELA arket ratades — källarket behöver rättas")
            continue

        fil = UT / f"{p['id']}.no.csv"
        with fil.open("w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=kolumner)
            w.writeheader()
            w.writerows(ut)

        status = "✓" if not bort else "!"
        print(f"{status} {p['namn']}: {len(ut)}/{len(rader)} rader -> {fil.name}  (produkt {butiken[handle]})")
        for b in bort:
            print(f"      bortvald: {b}")
            problem.append(f"{p['id']}: {b}")

    print(f"\n{totalt_ut} recensioner klara för import, {totalt_bort} bortvalda.")
    if problem:
        print("\nAtt titta på:")
        for x in problem:
            print(f"  · {x}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
