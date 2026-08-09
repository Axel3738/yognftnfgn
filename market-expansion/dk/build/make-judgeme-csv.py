#!/usr/bin/env python3
"""Bygger Judge.me-importfilen för DK-marknaden ur den norska exporten.

Källa : no/output/judgeme-reviews-beverbutikken-no.csv
Utdata: dk/output/judgeme-reviews-baeverbutikken-dk.csv

Tre saker översätts eller byts ut:
  1. title/body/reply  -> naturlig danska (dk/build/judgeme-translations.json)
  2. reviewer_name     -> vanliga danska namn (dk/build/judgeme-names.json)
  3. product_handle    -> DK-handle via den gemensamma sourceHandle i katalogerna

Butiksspecifika fält nollställs, se NOLLSTALLDA nedan.
"""
import csv, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "no/output/judgeme-reviews-beverbutikken-no.csv"
OUT = ROOT / "dk/output/judgeme-reviews-baeverbutikken-dk.csv"

# Fält som är knutna till den norska butiken och inte får följa med
NOLLSTALLDA = ["metaobject_handle", "ip_address", "product_id"]

# Judge.me visar orten publikt, så den måste vara dansk
DK_ORTER = [
    "København, Hovedstaden, Danmark",
    "Aarhus, Midtjylland, Danmark",
    "Odense, Syddanmark, Danmark",
]


def ladda_katalog(p):
    d = json.loads(Path(p).read_text(encoding="utf-8"))
    return d["products"] if isinstance(d, dict) and "products" in d else d


def epost(namn):
    s = namn.lower().replace("ø", "o").replace("æ", "ae").replace("å", "a")
    s = re.sub(r"[^a-z0-9]+", ".", s).strip(".")
    return f"{s}@example.com"


def main():
    rader = list(csv.DictReader(SRC.open(encoding="utf-8")))
    kolumner = list(rader[0].keys())

    namnkarta = json.loads((ROOT / "dk/build/judgeme-names.json").read_text(encoding="utf-8"))
    oversattningar = json.loads((ROOT / "dk/build/judgeme-translations.json").read_text(encoding="utf-8"))

    # Unika strängar i exakt samma ordning som översättningslistan byggdes
    unika = {}
    for r in rader:
        for c in ("title", "body", "reply"):
            t = r[c].strip()
            if t and t not in unika:
                unika[t] = len(unika)
    if len(unika) != len(oversattningar):
        sys.exit(f"FEL: {len(unika)} unika strängar men {len(oversattningar)} översättningar")
    # Ankare som fångar om källfilen ändrats under fötterna på oss
    for text, vantad in [("Uleselig tekst.", "Ulæselig tekst."),
                         ("Dette er et svar fra administratoren", "Dette er et svar fra administratoren")]:
        if text in unika and oversattningar[unika[text]] != vantad:
            sys.exit(f"FEL: översättningslistan är ur fas vid {text!r}")
    tr = {t: oversattningar[i] for t, i in unika.items()}

    no2src = {p["handle"]: p["sourceHandle"] for p in ladda_katalog(ROOT / "no/output/catalog.no.json")}
    src2dk = {p["sourceHandle"]: p["handle"] for p in ladda_katalog(ROOT / "dk/output/catalog.dk.json")}

    ut, bortvalda, i_ort = [], [], 0
    for r in rader:
        no_handle = r["product_handle"].strip()
        dk_handle = src2dk.get(no2src.get(no_handle, ""), "")
        if not dk_handle:
            bortvalda.append(r)
            continue

        ny = dict(r)
        ny["product_handle"] = dk_handle
        for c in ("title", "body", "reply"):
            t = r[c].strip()
            ny[c] = tr[t] if t else ""

        namn = namnkarta[r["reviewer_name"]]
        ny["reviewer_name"] = namn
        ny["reviewer_email"] = epost(namn)

        if r["location"].strip():
            ny["location"] = DK_ORTER[i_ort % len(DK_ORTER)]
            i_ort += 1
        for c in NOLLSTALLDA:
            ny[c] = ""
        ut.append(ny)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=kolumner)
        w.writeheader()
        w.writerows(ut)

    print(f"skrev {len(ut)} recensioner -> {OUT.relative_to(ROOT)}")
    for r in bortvalda:
        print(f"  bortvald: handle={r['product_handle']!r} rating={r['rating']} body={r['body'][:40]!r}")


if __name__ == "__main__":
    main()
