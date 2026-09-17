#!/usr/bin/env python3
"""oversatt-us.py — det amerikanska textlagret på termoskyddets batch #2 (fem bildannonser).

Basfotona (kie.ai-länkarna i factory/output/carashell/termoskyddet/bild-2026-09-17.json
svarade fortfarande 2026-09-17 14:18 UTC) ligger i bas/<SE-namn>.png. Därför ritas
det norska textlagret från grunden på det rena fotot med factory/bild-text.py — samma
väg som SE-bilden fick, samma typsnitt, storlekar, band och priskort. Ingen suddning,
ingen OCR (oversatt-batch.py tar husbilsväggar för plattor på de här fotona, mätt på
takskyddet 2026-09-16).

    python3 market-expansion/ops/carashell/2026-09-17-us-termoskyddet/oversatt-us.py [--bara <SE-namn>]

Läser se-texter.json (SE-elementen, för typkontrollen) och textlager-us.json
(subagentens norska element, samma typer i samma ordning), bas/<n>.png.
Skriver us/<US-namn>.png, us/<US-namn>.png.spec.json, us/<US-namn>.png.qa.png (SE | US)
och resultat-render.json. Stoppar en bild där svenska siffror/bokstäver eller "kr" är kvar.
"""
import argparse
import importlib.util
import json
import re
import sys
from pathlib import Path

from PIL import Image

HAR = Path(__file__).resolve().parent
ROT = HAR.parents[3]


def ladda(namn, fil):
    spec = importlib.util.spec_from_file_location(namn, fil)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


bt = ladda("bild_text", ROT / "factory" / "bild-text.py")

# Svenskt (och norskt) som inte får finnas kvar på en amerikansk bild: SE/NO-priser,
# SE-rabatten, nordiska bokstäver, "kr", nordiska villkorsord, brittisk stavning
# och den svenska domänen.
SVENSKT = re.compile(r"\b559\b|\b932\b|\b548\b|\b685\b|40 ?%|[äöåÄÖÅæøÆØ]|\bkr\b|arbetsdagar|ångerrätt|virkedager|angrerett|Sverige|Norge|carashell\.se|colour|centimetre")


def butiksfarger():
    """Samma fält som ops-bild.textFarger läser ur factory/butiker/carashell.yaml."""
    y = (ROT / "factory" / "butiker" / "carashell.yaml").read_text(encoding="utf-8")
    ut = {}
    for nyckel, ut_nyckel in (("mork", "mork"), ("accent", "accent"), ("text", "text"), ("yta", "yta"),
                              ("accent_text", "accent_text"), ("text_pa_mork", "text_pa_mork"), ("linje_stark", "dampad")):
        m = re.search(rf'^\s+{nyckel}:\s*"?(#[0-9A-Fa-f]{{6}})"?', y, re.M)
        if m:
            ut[ut_nyckel] = m.group(1)
    return ut


def qa(se_fil, no_fil, ut):
    a = Image.open(se_fil).convert("RGB"); c = Image.open(no_fil).convert("RGB")
    b = 540
    a = a.resize((b, int(a.height * b / a.width))); c = c.resize((b, int(c.height * b / c.width)))
    q = Image.new("RGB", (2 * b + 12, max(a.height, c.height)), "#202020")
    q.paste(a, (0, 0)); q.paste(c, (b + 12, 0)); q.save(ut)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--bara")
    a = p.parse_args()
    se = json.loads((HAR / "se-texter.json").read_text(encoding="utf-8"))
    no = json.loads((HAR / "textlager-us.json").read_text(encoding="utf-8"))
    farger = butiksfarger()
    (HAR / "us").mkdir(exist_ok=True)
    resultat = {}
    for namn in [k for k in se if not k.startswith("_")]:
        if a.bara and namn != a.bara:
            continue
        mal = namn.replace("CaraShellFront_", "CaraShellFront_US_")
        se_el = se[namn]["element"]
        no_el = (no.get(namn) or no.get(mal) or {}).get("element")
        if not no_el:
            resultat[namn] = {"status": "FEL", "skal": "saknas i textlager-us.json"}
        elif [e["typ"] for e in se_el] != [e["typ"] for e in no_el]:
            resultat[namn] = {"status": "FEL", "skal": f"typordning: SE {[e['typ'] for e in se_el]} ≠ NO {[e['typ'] for e in no_el]}"}
        else:
            kvar = [e["text"] for e in no_el if SVENSKT.search(e["text"])]
            if kvar:
                resultat[namn] = {"status": "FEL", "skal": f"svenskt kvar: {' | '.join(kvar)}"}
            else:
                bas = HAR / "bas" / f"{namn}.png"
                se_fil = HAR / "se" / namn / f"{namn}.png"
                ut = HAR / "us" / f"{mal}.png"
                if not bas.exists():
                    resultat[namn] = {"status": "FEL", "skal": f"basfoto saknas: {bas}"}
                else:
                    try:
                        spec = {"farger": farger, "element": no_el}
                        (HAR / "us" / f"{mal}.png.spec.json").write_text(json.dumps(spec, ensure_ascii=False, indent=2), encoding="utf-8")
                        info = bt.rita(str(bas), str(ut), spec)
                        qa(se_fil, ut, str(ut) + ".qa.png")
                        resultat[namn] = {"status": "OK", "mal": mal, "vag": "basfoto + textlager", "fil": f"us/{mal}.png",
                                          "placerade": info["placerade"], "okanda": info["okanda_typer"]}
                    except Exception as e:  # noqa: BLE001
                        resultat[namn] = {"status": "FEL", "skal": f"{type(e).__name__}: {e}"}
        r = resultat[namn]
        print(f"{namn} → {r.get('mal', '?')}: {r['status']} {r.get('vag', '')} {r.get('skal', '')} {', '.join(r.get('placerade', []))}")
    (HAR / "resultat-render.json").write_text(json.dumps(resultat, ensure_ascii=False, indent=2), encoding="utf-8")
    fel = [n for n, r in resultat.items() if r["status"] != "OK"]
    if fel:
        print("FEL:", fel, file=sys.stderr); sys.exit(1)


if __name__ == "__main__":
    main()
