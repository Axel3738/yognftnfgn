#!/usr/bin/env python3
"""Deterministisk textkontroll före rendering (ramverket steg 3.3).

Varje sträng som ska brännas in i en bildannons måste finnas ORDAGRANT i
briefen. Det fångar stavfel, omskrivningar och förbjudet innehåll gratis,
innan en enda krona bränns — till skillnad från att upptäcka det i bilden.

    python3 bildannonser/verifiera.py --spec textspec.json --briefar briefar/

Briefmappen ska innehålla en textfil per annons, döpt efter annonsnamnet
(`Beltgrinder_PD_4_1.txt`), med briefen ordagrant.

Exit 0 = allt grönt. Exit 1 = minst ett fynd; inget får renderas.
"""
import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

# Tecken utanför ASCII som är tillåtna i annonstext. Bäverbutiken kör svenska,
# norska och danska marknader, så øØæÆ hör hemma här. Allt annat är mojibake
# eller ett tecken modellen hittat på.
TILLATNA_ICKE_ASCII = set("åäöÅÄÖøØæÆôÔéÉüÜ–—·×→”“’…°✅✓•")

# Förbud ur CLAUDE.md och ramverkets steg 7. Träff = stoppfel, inte varning.
FORBUD = [
    (r"\d+\s*%", "procentsats i creativen kräver verifierbart jämförpris"),
    (r"\b(rea|REA|Rea)\b", "ordet rea"),
    (r"\brabatt\b|\bRABATT\b|\bRabatt\b", "ordet rabatt"),
    (r"lagret tar slut|snart slut|sista chansen|endast idag|bara idag",
     "påhittad knapphet"),
    (r"\b509 kr\b|\b636 kr\b", "förbjudet gammalt pris (axelbältet)"),
    (r"\b\d+\s*stjärn|★", "stjärnbetyg i creativen"),
]


def hitta_mojibake(text):
    fynd = []
    for tecken in text:
        if ord(tecken) < 128 or tecken in TILLATNA_ICKE_ASCII:
            continue
        namn = unicodedata.name(tecken, "okänt tecken")
        fynd.append(f"{tecken!r} ({namn})")
    return fynd


def normalisera(s):
    """Jämför utan att fastna på radbrytningar, dubbla mellanslag eller de
    citattecken briefen sätter runt varje rad. Stavning och ordval jämförs
    fortfarande exakt — det är hela poängen med kontrollen."""
    s = re.sub(r"[\"\u201c\u201d\u2018\u2019]", "", s)
    return re.sub(r"\s+", " ", s).strip()


def granska_block(namn, text, brieftext, pris_verifierat=False,
                  betyg_verifierat=False):
    """Kontrollerar ett textblock rad för rad — ett block kan innehålla flera
    rader (t.ex. en punktlista), och varje rad ska stå ordagrant i briefen.

    Två undantag finns, och båda kräver att avläsningen står skriven i briefen:
    `pris_verifierat` släpper igenom procentsatsen och ordet rabatt när de
    vilar på ett jämförpris körningen läst på produktsidan (briefen måste bära
    en rad som börjar med PRIS VERIFIERAT); ordet rea och påhittad knapphet
    stoppas fortfarande, för de påstår något annat än ett jämförpris, och `betyg_verifierat` släpper igenom ett
    stjärnbetyg som körningen räknat ur produktsidans egna recensioner (raden
    BETYG VERIFIERAT). Siffran går därmed alltid att spåra till avläsningen.
    Allt annat i FORBUD gäller oförändrat."""
    fel = []
    normaliserad_brief = normalisera(brieftext)

    for rad in [r for r in text.split("\n") if r.strip()]:
        if normalisera(rad) not in normaliserad_brief:
            fel.append(f'raden finns inte ordagrant i briefen: "{rad}"')

        for monster, skal in FORBUD:
            # Ett belagt jämförpris bär både procentsatsen och ordet rabatt.
            # "rea" och påhittad knapphet är andra påståenden och stoppas alltid.
            if pris_verifierat and skal.startswith(("procentsats", "ordet rabatt")):
                continue
            if betyg_verifierat and skal.startswith("stjärnbetyg"):
                continue
            if re.search(monster, rad):
                fel.append(f'förbjudet innehåll ({skal}) i: "{rad}"')

        mojibake = hitta_mojibake(rad)
        if mojibake:
            fel.append(f'okända tecken {", ".join(mojibake)} i: "{rad}"')

    return fel


def main():
    p = argparse.ArgumentParser(description="Verifierar annonstext mot briefen.")
    p.add_argument("--spec", required=True)
    p.add_argument("--briefar", required=True,
                   help="Mapp med en .txt per annons, döpt efter annonsnamnet")
    args = p.parse_args()

    specar = json.loads(Path(args.spec).read_text(encoding="utf-8"))
    if not isinstance(specar, list):
        specar = [specar]
    briefmapp = Path(args.briefar)

    totalt_fel = 0
    for spec in specar:
        namn = Path(spec["ut"]).stem
        brieffil = briefmapp / f"{namn}.txt"
        if not brieffil.exists():
            print(f"✗ {namn}: briefen saknas ({brieffil})")
            totalt_fel += 1
            continue

        brieftext = brieffil.read_text(encoding="utf-8")
        pris_verifierat = bool(spec.get("pris_verifierat"))
        betyg_verifierat = bool(spec.get("betyg_verifierat"))
        fel = []
        if pris_verifierat and not re.search(r"^PRIS VERIFIERAT", brieftext, re.M):
            fel.append("pris_verifierat är satt men briefen saknar en rad som "
                       "börjar med PRIS VERIFIERAT — utan avläsningen i skrift "
                       "får procentsatsen inte renderas")
            pris_verifierat = False
        if betyg_verifierat and not re.search(r"^BETYG VERIFIERAT", brieftext, re.M):
            fel.append("betyg_verifierat är satt men briefen saknar en rad som "
                       "börjar med BETYG VERIFIERAT — utan avläsningen i skrift "
                       "får stjärnbetyget inte renderas")
            betyg_verifierat = False
        for b in spec.get("block", []):
            fel += granska_block(namn, b["text"], brieftext,
                                 pris_verifierat, betyg_verifierat)

        if fel:
            totalt_fel += len(fel)
            print(f"✗ {namn}")
            for f in fel:
                print(f"    {f}")
        else:
            antal = len(spec.get("block", []))
            print(f"✓ {namn} — {antal} strängar ordagranna, inget förbjudet")

    if totalt_fel:
        print(f"\n{totalt_fel} fynd. Ingenting renderas.", file=sys.stderr)
        sys.exit(1)
    print("\nAllt grönt.")


if __name__ == "__main__":
    main()
