#!/usr/bin/env python3
"""rendera-foto.py — TankGuard-bilderna för de fyra annonser som har texten
bränd direkt på fotot.

    python3 factory/brandswap/rendera-foto.py --marknad SE [--bara IBC_SP_2_1]

Vägen är den som står i CLAUDE.md: kie.ai rensar bort all text ur fotot,
`factory/brandswap/lagg-text.py` lägger tillbaka skarp vektortext på de
uppmätta koordinaterna. Aldrig tvärtom — bildmodeller stavar fel på svenska
och norska.

Är annonsen märkt `se_orord: true` innehåller den svenska bilden inget
butiksbundet påstående. Då används källbilden precis som den är på den svenska
marknaden: den rensade bilden är en omgenerering av fotot, och att byta ut ett
bevisat creative mot en omgenererad kopia utan att texten ändras vore att
kasta bort kvalitet i onödan. Norska bygger alltid på den rensade bilden.

Läser plan-foto.json, skriver samma katalogstruktur som rendera.py:
    ut/<marknad>/TankGuard_<marknad>_<vinkel>.jpg
    qa/<marknad>/TankGuard_<marknad>_<vinkel>.qa.jpg
    texter/<marknad>/<annons>-foto.json   (specen som skickades till lagg-text.py)
"""
import argparse
import json
import shutil
import subprocess
import sys
from importlib.machinery import SourceFileLoader
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from rendera import spara_qa   # noqa: E402  (samma QA-format i båda renderarna)

HAR = Path(__file__).resolve().parent
ROT = HAR.parents[1]
MAPP = HAR / "ibc-tankguard"
LAGG = HAR / "lagg-text.py"
KALLBILDER = Path(".scratch/ibc-se")

# Fälten lagg-text.py ritar med — resten i planen är dokumentation.
ELEMENTFALT = ("typ", "box", "rader", "fet", "storlek", "farg", "just", "radavstand",
               "kontur", "konturbredd", "antal", "bockfarg", "textfarg", "radie")


def spec_for(element, sprakfalt, strykfalt):
    ut = []
    for e in element:
        post = {f: e[f] for f in ELEMENTFALT if f in e}
        post.setdefault("typ", "text")
        text = e.get(sprakfalt)
        if text is None:
            raise SystemExit(f"elementet '{e['id']}' saknar {sprakfalt} — planen är inte klar")
        if post["typ"] != "stjarnor":
            post["text"] = text
        if e.get(strykfalt):
            post["stryk"] = e[strykfalt]
        ut.append(post)
    return ut


def main():
    p = argparse.ArgumentParser(description="TankGuard-bilder för fototext-annonserna.")
    p.add_argument("--marknad", required=True, choices=["SE", "NO"])
    p.add_argument("--bara")
    p.add_argument("--plan", default=str(MAPP / "plan-foto.json"))
    a = p.parse_args()

    sprakfalt = "se" if a.marknad == "SE" else "no"
    strykfalt = "stryk_se" if a.marknad == "SE" else "stryk_no"
    plan = json.loads(Path(a.plan).read_text(encoding="utf-8"))
    qa_bild = SourceFileLoader("oversatt_bild", str(ROT / "pipeline" / "oversatt-bild.py")).load_module().qa_bild

    for d in ("texter", "ut", "qa"):
        (MAPP / d / a.marknad).mkdir(parents=True, exist_ok=True)

    resultat = {}
    for namn, post in plan.items():
        if namn.startswith("_") or (a.bara and namn != a.bara):
            continue
        kalla = KALLBILDER / f"{namn}.jpg"
        malnamn = f"TankGuard_{a.marknad}_" + namn.replace("IBC_", "")
        utfil = MAPP / "ut" / a.marknad / f"{malnamn}.jpg"
        qa_mal = MAPP / "qa" / a.marknad / f"{malnamn}.qa.jpg"

        if a.marknad == "SE" and post.get("se_orord"):
            shutil.copyfile(kalla, utfil)
            bild = Image.open(kalla).convert("RGB")
            qa_bild(bild, bild, str(qa_mal) + ".png")
            spara_qa(str(qa_mal) + ".png", str(qa_mal))
            resultat[namn] = {"status": "OFÖRÄNDRAD", "malnamn": malnamn,
                              "fil": str(utfil.relative_to(ROT)), "qa": str(qa_mal.relative_to(ROT)),
                              "utdata": "inget butiksbundet i bilden — källan används som den är"}
            print(f"= {namn} → {malnamn}  (oförändrad, ingen kie-körning behövdes)")
            continue

        ren = Path(post["ren"])
        if not ren.exists():
            raise SystemExit(f"den kie-rensade bilden saknas: {ren} — kör kie-rensningen först")

        specfil = MAPP / "texter" / a.marknad / f"{namn}-foto.json"
        specfil.write_text(
            json.dumps({"element": spec_for(post["element"], sprakfalt, strykfalt)},
                       ensure_ascii=False, indent=1), encoding="utf-8")

        r = subprocess.run([sys.executable, str(LAGG), "--bild", str(ren), "--spec", str(specfil),
                            "--ut", str(utfil), "--kalla", str(kalla)],
                           capture_output=True, text=True)
        if r.returncode != 0:
            resultat[namn] = {"status": "FEL", "meddelande": r.stderr.strip()[-300:]}
            print(f"❌ {namn}: {r.stderr.strip()[-200:]}")
            continue
        qa_kalla = Path(str(utfil) + ".qa.png")
        if qa_kalla.exists():
            spara_qa(str(qa_kalla), str(qa_mal))
        resultat[namn] = {"status": "OK", "malnamn": malnamn,
                          "fil": str(utfil.relative_to(ROT)), "qa": str(qa_mal.relative_to(ROT)),
                          "utdata": r.stdout.strip()}
        print(f"✓ {namn} → {malnamn}  {r.stdout.strip()}")

    (MAPP / f"resultat-foto-{a.marknad}.json").write_text(
        json.dumps(resultat, ensure_ascii=False, indent=1), encoding="utf-8")
    fel = [n for n, v in resultat.items() if v["status"] == "FEL"]
    print(f"\n{len(resultat) - len(fel)}/{len(resultat)} klara" + (f", FEL: {fel}" if fel else ""))


if __name__ == "__main__":
    main()
