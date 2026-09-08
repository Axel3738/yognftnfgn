#!/usr/bin/env python3
"""rendera.py — bygger TankGuard-bilderna ur textplanen.

    python3 factory/brandswap/rendera.py --marknad SE [--bara IBC_RV_3_1]

Läser factory/brandswap/ibc-tankguard/plan.json, plockar rätt textfält per
marknad (`se_tg` för SE, `no_tg` för NO) och skriver en texter-fil per annons i
det format `pipeline/oversatt-bild.py --texter` vill ha. Sedan körs
oversatt-bild.py, som suddar den svenska texten och ritar den nya i samma ruta
med samma stil — noll krediter.

Planens `mal` blir en texter-post på ett av tre sätt:
    {"form": n, "rader": [...]}  → ett block: flera SE-rader som EN radbruten text
    {"form": n, "rad": k}        → en rad i sin egen ruta (behåller blandade stilar)
    {"box": [x0,y0,x1,y1], ...}  → egen ruta, för det detektorn missar

Utdata:
    factory/brandswap/ibc-tankguard/texter/<marknad>/<annons>.json
    factory/brandswap/ibc-tankguard/ut/<marknad>/TankGuard_<marknad>_<vinkel>.jpg
    factory/brandswap/ibc-tankguard/qa/<marknad>/TankGuard_<marknad>_<vinkel>.qa.jpg
"""
import argparse
import json
import shutil
import subprocess
import sys
from importlib.machinery import SourceFileLoader
from pathlib import Path

from PIL import Image

ROT = Path(__file__).resolve().parents[2]
MAPP = Path(__file__).resolve().parent / "ibc-tankguard"
BILD = ROT / "pipeline" / "oversatt-bild.py"
KALLBILDER = Path(".scratch/ibc-se")

# Fälten i en box-post som oversatt-bild.py:s rita_box förstår.
BOXFALT = ("fet", "storlek", "rader", "farg", "radavstand", "textljus", "vanster",
           "vanster_x", "fyll", "fyllning", "utvidga", "radie", "outline", "kant",
           "rita_ram", "bock")

_ob = None


def spara_qa(kalla_png, mal_jpg):
    """QA-bilden som JPEG. oversatt-bild.py och lagg-text.py skriver PNG, och 40
    QA-PNG:er blir 17 MB i repot — samma bilder som JPEG blir en bråkdel, och en
    granskningsbild behöver ingen förlustfri kodning."""
    Image.open(kalla_png).convert("RGB").save(mal_jpg, "JPEG", quality=88, optimize=True)
    Path(kalla_png).unlink()


def ob():
    """oversatt-bild.py som modul — filnamnet har bindestreck och går inte att
    importera med import-satsen. Vi lånar bara qa_bild härifrån."""
    global _ob
    if _ob is None:
        _ob = SourceFileLoader("oversatt_bild", str(BILD)).load_module()
    return _ob


def valj_enheter(enheter, sprakfalt):
    """Vilka enheter som ska ritas om.

    En enhet vars text är ORDAGRANT densamma som originalets rörs inte — att
    sudda och rita om en oförändrad rad kan bara göra den sämre (suddningen
    lämnar en svag skugga där den gamla texten var bredare än den nya, mätt på
    IBC_BOF_2_1 2026-09-08). På svenska är de flesta enheter oförändrade, så
    större delen av bilden blir bitidentisk med källan.

    Undantaget är former: oversatt-bild.py suddar HELA formen så fort någon rad
    i den ska skrivas om. Ändras en rad i en form måste alltså formens övriga
    rader ritas om också, annars försvinner de.
    """
    andrade = [e for e in enheter if e.get(sprakfalt) != e["se_kalla"]]
    berorda_former = {e["mal"]["form"] for e in andrade if "form" in e["mal"]}
    return [e for e in enheter
            if e in andrade or ("form" in e["mal"] and e["mal"]["form"] in berorda_former)]


def texter_for(enheter, sprakfalt, strykfalt):
    """Textplanens enheter → listan som oversatt-bild.py --texter läser."""
    ut = []
    for e in enheter:
        text = e.get(sprakfalt)
        if text is None:
            raise SystemExit(f"enheten '{e['id']}' saknar {sprakfalt} — planen är inte klar")
        stryk = e.get(strykfalt) or ""
        mal = e["mal"]
        if "box" in mal:
            post = {"box": mal["box"], "text": text}
            for f in BOXFALT:
                if f in mal:
                    post[f] = mal[f]
            if stryk:
                post["stryk"] = stryk
        elif "rader" in mal:
            post = {"form": mal["form"], "rader": mal["rader"], "text": text}
            if stryk:
                post["stryk"] = stryk
        else:
            post = {"form": mal["form"], "rad": mal["rad"], "text": text,
                    "se": e["se_kalla"]}
            if stryk:
                post["stryk"] = stryk
        ut.append(post)
    return ut


def main():
    p = argparse.ArgumentParser(description="Bygger TankGuard-bilderna ur textplanen.")
    p.add_argument("--marknad", required=True, choices=["SE", "NO"])
    p.add_argument("--bara", help="kör bara den här annonsen")
    p.add_argument("--plan", default=str(MAPP / "plan.json"))
    a = p.parse_args()

    sprakfalt = "se_tg" if a.marknad == "SE" else "no_tg"
    strykfalt = "stryk" if a.marknad == "SE" else "stryk_no"
    plan = json.loads(Path(a.plan).read_text(encoding="utf-8"))

    (MAPP / "texter" / a.marknad).mkdir(parents=True, exist_ok=True)
    (MAPP / "ut" / a.marknad).mkdir(parents=True, exist_ok=True)
    (MAPP / "qa" / a.marknad).mkdir(parents=True, exist_ok=True)

    resultat = {}
    for namn, post in plan.items():
        if namn.startswith("_") or (a.bara and namn != a.bara):
            continue
        kalla = KALLBILDER / f"{namn}.jpg"
        if not kalla.exists():
            raise SystemExit(f"källbilden saknas: {kalla}")

        malnamn = f"TankGuard_{a.marknad}_" + namn.replace("IBC_", "")
        utfil = MAPP / "ut" / a.marknad / f"{malnamn}.jpg"
        valda = valj_enheter(post["enheter"], sprakfalt)
        texterfil = MAPP / "texter" / a.marknad / f"{namn}.json"
        texterfil.write_text(
            json.dumps(texter_for(valda, sprakfalt, strykfalt), ensure_ascii=False, indent=1),
            encoding="utf-8")

        if not valda:
            # Inget i bilden är butiksbundet — annonsen går rakt igenom till
            # TankGuard. QA-bilden visar två identiska halvor, vilket är svaret.
            shutil.copyfile(kalla, utfil)
            qa_mal = MAPP / "qa" / a.marknad / f"{malnamn}.qa.jpg"
            bild = Image.open(kalla).convert("RGB")
            ob().qa_bild(bild, bild, str(qa_mal) + ".png")
            spara_qa(str(qa_mal) + ".png", str(qa_mal))
            resultat[namn] = {"status": "OFÖRÄNDRAD", "malnamn": malnamn,
                              "fil": str(utfil.relative_to(ROT)), "qa": str(qa_mal.relative_to(ROT)),
                              "utdata": "inget butiksbundet i bilden — källan används som den är"}
            print(f"= {namn} → {malnamn}  (oförändrad, inget butiksbundet)")
            continue

        r = subprocess.run([sys.executable, str(BILD), "--in", str(kalla),
                            "--ut", str(utfil), "--texter", str(texterfil)],
                           capture_output=True, text=True)
        # Exit 3 = oversatt-bild.py misstänker text direkt på fotot. Bilden är
        # ändå skriven; vi flaggar den för manuell koll i stället för att stoppa.
        if r.returncode not in (0, 3):
            resultat[namn] = {"status": "FEL", "meddelande": r.stderr.strip()[-300:]}
            print(f"❌ {namn}: {r.stderr.strip()[-200:]}")
            continue

        qa_kalla = Path(str(utfil) + ".qa.png")
        qa_mal = MAPP / "qa" / a.marknad / f"{malnamn}.qa.jpg"
        if qa_kalla.exists():
            spara_qa(str(qa_kalla), str(qa_mal))

        resultat[namn] = {
            "status": "OK" if r.returncode == 0 else "OK-FOTOTEXTVARNING",
            "malnamn": malnamn,
            "fil": str(utfil.relative_to(ROT)),
            "qa": str(qa_mal.relative_to(ROT)),
            "utdata": r.stdout.strip(),
        }
        print(f"✓ {namn} → {malnamn}  {r.stdout.strip()}")

    (MAPP / f"resultat-{a.marknad}.json").write_text(
        json.dumps(resultat, ensure_ascii=False, indent=1), encoding="utf-8")
    fel = [n for n, v in resultat.items() if v["status"] == "FEL"]
    print(f"\n{len(resultat) - len(fel)}/{len(resultat)} klara" + (f", FEL: {fel}" if fel else ""))


if __name__ == "__main__":
    main()
