#!/usr/bin/env python3
"""Bygger Judge.me-importfilen för UK-marknaden ur den norska exporten.

Källa : no/output/judgeme-reviews-beverbutikken-no.csv
Utdata: uk/output/judgeme-reviews-beavershop-uk.csv

Tre saker översätts eller byts ut:
  1. title/body/reply  -> brittisk engelska (uk/build/judgeme-translations.json)
  2. reviewer_name     -> vanliga brittiska namn (uk/build/judgeme-names.json)
  3. product_handle    -> UK-handle via den gemensamma sourceHandle i katalogerna

Butiksspecifika fält nollställs, se NOLLSTALLDA nedan.
"""
import csv, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "no/output/judgeme-reviews-beverbutikken-no.csv"
OUT = ROOT / "uk/output/judgeme-reviews-beavershop-uk.csv"

# Fält som är knutna till den norska butiken och inte får följa med
NOLLSTALLDA = ["metaobject_handle", "ip_address", "product_id"]

# Judge.me visar orten publikt, så den måste vara brittisk
UK_ORTER = [
    "Manchester, England, United Kingdom",
    "Leeds, England, United Kingdom",
    "Bristol, England, United Kingdom",
]


def ladda_katalog(p):
    d = json.loads(Path(p).read_text(encoding="utf-8"))
    return d["products"] if isinstance(d, dict) and "products" in d else d


def epost(namn):
    s = re.sub(r"[^a-z0-9]+", ".", namn.lower().replace("ø", "o").replace("æ", "ae")).strip(".")
    return f"{s}@example.com"


def main():
    rader = list(csv.DictReader(SRC.open(encoding="utf-8")))
    kolumner = list(rader[0].keys())

    namnkarta = json.loads((ROOT / "uk/build/judgeme-names.json").read_text(encoding="utf-8"))
    oversattningar = json.loads((ROOT / "uk/build/judgeme-translations.json").read_text(encoding="utf-8"))

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
    for text, vantad in [("Uleselig tekst.", "Illegible text."),
                         ("Dette er et svar fra administratoren", "This is a reply from the administrator")]:
        if text in unika and oversattningar[unika[text]] != vantad:
            sys.exit(f"FEL: översättningslistan är ur fas vid {text!r}")
    tr = {t: oversattningar[i] for t, i in unika.items()}

    no2src = {p["handle"]: p["sourceHandle"] for p in ladda_katalog(ROOT / "no/output/catalog.no.json")}
    src2uk = {p["sourceHandle"]: p["handle"] for p in ladda_katalog(ROOT / "uk/output/catalog.uk.json")}

    ut, bortvalda, i_ort = [], [], 0
    for r in rader:
        no_handle = r["product_handle"].strip()
        uk_handle = src2uk.get(no2src.get(no_handle, ""), "")
        if not uk_handle:
            bortvalda.append(r)
            continue

        ny = dict(r)
        ny["product_handle"] = uk_handle
        for c in ("title", "body", "reply"):
            t = r[c].strip()
            ny[c] = tr[t] if t else ""

        namn = namnkarta[r["reviewer_name"]]
        ny["reviewer_name"] = namn
        ny["reviewer_email"] = epost(namn)

        if r["location"].strip():
            ny["location"] = UK_ORTER[i_ort % len(UK_ORTER)]
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
