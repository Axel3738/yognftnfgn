#!/usr/bin/env python3
"""oversatt-batch.py — kör oversatt-bild.py på hela bildkön för en marknad.

    python3 pipeline/oversatt-batch.py --batch market-expansion/no/notion-batches/2026-09-03 [--bara <namn>]

Läser i batchmappen:
  jobb.json            (från tools/oversattningskon.mjs — målnamn per rad)
  se-texter.json       (svenska bildtexter, form för form — facit för strukturen)
  oversatt-output.json (norska texter per form, från copy-subagenten)
  overrides.json       (valfri: manuella box-poster per annons för det detektorn missar)
  se/<namn>.jpg        (källbilderna)
Skriver:
  no/<målnamn>.jpg + .qa.png, texter/<namn>.json (det som skickades till oversatt-bild.py),
  resultat.json (per annons: ok / MISMATCH / fel + vilka former som matchades).

Matchningen SE-form ↔ detekterad form: formerna tas i ordning uppifrån och ned;
en SE-form matchas mot nästa omatchade detekterade form med SAMMA antal rader.
Stämmer inte antalet är det MISMATCH — då behövs en override, inte en gissning.
"""
import argparse
import json
import numpy as np
import subprocess
import sys
from pathlib import Path

HÄR = Path(__file__).resolve().parent
BILD = HÄR / "oversatt-bild.py"


def analysera(fil):
    r = subprocess.run([sys.executable, str(BILD), "--in", str(fil), "--analys", "--json"],
                       capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.strip()[-300:])
    d = json.loads(r.stdout)
    return [x for x in d if "form" in x]


MORKA = {"knapp", "etikett"}


def _passar(sf, df, k, n_se, hojd, bredd=1080):
    """Typ- och zonkontroll så att en saknad form inte förskjuter matchningen tyst
    (checklistan får aldrig matchas mot rubrikplattan)."""
    typ = sf.get("typ", "platta")
    ljus = df["typ"] in ("platta", "band")
    if typ in MORKA and ljus:
        return False
    if typ not in MORKA and typ != "badge" and not ljus:
        return False
    y = df["y0"] / hojd
    if k == 0 and typ not in MORKA and y > 0.45:
        return False               # första plattan sitter alltid högst upp
    if typ == "knapp" and y < 0.7:
        return False               # knappen sitter alltid längst ned
    if typ in MORKA and np.mean(df["textfarg"]) < 180:
        return False               # knapp/etikett har alltid vit text — en mörk remsa
                                   # mellan band och knapp är inte knappen (Beltgrinder_REV_2_1)
    if typ in ("band", "platta"):
        # text.py:s plattor och band är alltid fullbreda (marginal 33 px) — en smal
        # "platta" är ett snöfält, en husvägg eller en halvdetekterad platta
        # (Overvakningskamera_SP_7_1: checklistan hamnade på huset, 2026-09-03)
        if (df["x1"] - df["x0"]) < 0.8 * bredd:
            return False
    return True


def matcha(se_former, det_former, hoppa=(), hojd=1350, bredd=1080):
    """Returnerar lista med (det-index, antal SE-rader) per SE-form; None = ingen träff.
    En detekterad form får ha FLER rader än SE om de extra ligger sist och är låga
    (skräprader vid formens kant) — de ritas inte om och suddas inte."""
    lediga = list(range(len(det_former)))
    ut = []
    n_se = len(se_former)
    for k, sf in enumerate(se_former):
        if k in hoppa:
            ut.append(None)
            continue
        n = len(sf["rader"])
        träff = None
        for i in lediga:
            df = det_former[i]
            if not _passar(sf, df, k, n_se, hojd, bredd):
                continue
            if df["rader"] == n:
                träff = i
                break
            if df["rader"] > n and all(r["hojd"] <= 26 for r in df["radinfo"][n:]):
                träff = i
                break
        if träff is None:
            ut.append(None)
        else:
            lediga = [i for i in lediga if i > träff]   # ordningen uppifrån och ned hålls
            ut.append(träff)
    return ut


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--batch", required=True)
    p.add_argument("--bara")
    a = p.parse_args()
    B = Path(a.batch)
    jobb = json.loads((B / "jobb.json").read_text(encoding="utf-8"))["jobb"]
    se = json.loads((B / "se-texter.json").read_text(encoding="utf-8"))
    no = json.loads((B / "oversatt-output.json").read_text(encoding="utf-8"))
    overrides = json.loads((B / "overrides.json").read_text(encoding="utf-8")) if (B / "overrides.json").exists() else {}
    (B / "no").mkdir(exist_ok=True)
    (B / "texter").mkdir(exist_ok=True)
    resultat = {}
    for j in jobb:
        if j.get("status") != "KÖR":
            continue
        namn = j["namn"]
        if a.bara and namn != a.bara:
            continue
        mål = j["mal"]["annonsNamn"]
        r = {"malnamn": mål}
        resultat[namn] = r
        try:
            sf = se[namn]["former"]
            nf = no[namn]["former"]
            if no[namn].get("hoppa"):
                r["status"] = "HOPPA"; r["skal"] = no[namn]["hoppa"]; continue
            if len(nf) != len(sf):
                r["status"] = "FEL"; r["skal"] = f"norska svaret har {len(nf)} former, svenska har {len(sf)}"; continue
            det = analysera(B / "se" / f"{namn}.jpg")
            ov = overrides.get(namn, {})
            from PIL import Image as _I
            _bild = _I.open(B / "se" / f"{namn}.jpg"); hojd, bredd = _bild.height, _bild.width
            overr = {int(k) for k in ov.get("box_for_form", {})}
            karta = matcha(sf, det, hoppa=overr, hojd=hojd, bredd=bredd)
            texter = []
            saknade = []
            for k, (s, n_, di) in enumerate(zip(sf, nf, karta)):
                if k in overr:
                    # Manuell ruta ersätter formen helt. "post" pekar på vilken norsk
                    # textpost (index i former[k].texter) som ska in i rutan.
                    for bx in ov["box_for_form"][str(k)]:
                        e = dict(bx)
                        if "post" in e:
                            e["text"] = n_["texter"][e.pop("post")].get("text", "")
                        texter.append(e)
                    continue
                if di is None:
                    saknade.append(k)
                    continue
                # Vänsterjustering ur SE-strukturen: hela formen, från rad k, eller bocklistor.
                def vanster_for(rad):
                    if s.get("vanster") or s.get("bock"):
                        return True
                    if "vanster_fran" in s and rad >= s["vanster_fran"]:
                        return True
                    if "bock_fran" in s and rad >= s["bock_fran"]:
                        return True
                    if "bock_till" in s and rad <= s["bock_till"]:
                        return True
                    # Ingen vänsterflagga i SE-strukturen = centrerad. Detektorns egen
                    # bedömning litar vi inte på här: en rad-bbox som smält ihop med
                    # plattkanten ser "vänster" ut (Batmotor_PD_5_1, mätt 2026-09-03).
                    return False
                n_rader = len(s["rader"])
                if det[di]["rader"] > n_rader:
                    texter.append({"form": di, "klipp_efter_rad": n_rader - 1, "rad": None})
                for post in n_["texter"]:
                    e = {"form": di, "text": post.get("text", "")}
                    if len(post["rader"]) == 1:
                        e["rad"] = post["rader"][0]
                        e["se"] = s["rader"][post["rader"][0]]
                    else:
                        e["rader"] = post["rader"]
                        e["se_rader"] = [s["rader"][k] for k in post["rader"]]
                    if post.get("stryk"):
                        e["stryk"] = post["stryk"]
                    v = vanster_for(post["rader"][0])
                    if v is not None:
                        e["vanster"] = v
                    texter.append(e)
            texter.extend(ov.get("extra_boxar", []))
            r["karta"] = karta
            if saknade:
                r["status"] = "MISMATCH"; r["skal"] = f"SE-former utan detekterad motsvarighet: {saknade} (detekterat: {[(x['typ'], x['rader']) for x in det]})"
                (B / "texter" / f"{namn}.json").write_text(json.dumps(texter, ensure_ascii=False, indent=1), encoding="utf-8")
                continue
            tf = B / "texter" / f"{namn}.json"
            tf.write_text(json.dumps(texter, ensure_ascii=False, indent=1), encoding="utf-8")
            ut = B / "no" / f"{mål}.jpg"
            pr = subprocess.run([sys.executable, str(BILD), "--in", str(B / "se" / f"{namn}.jpg"), "--ut", str(ut), "--texter", str(tf)],
                                capture_output=True, text=True)
            if pr.returncode != 0:
                r["status"] = "FEL"; r["skal"] = (pr.stderr or pr.stdout).strip()[-300:]; continue
            r["status"] = "OK"; r["fil"] = str(ut); r["qa"] = str(ut) + ".qa.png"
        except Exception as e:
            r["status"] = "FEL"; r["skal"] = str(e)[:300]
    (B / "resultat.json").write_text(json.dumps(resultat, ensure_ascii=False, indent=1), encoding="utf-8")
    ok = sum(1 for v in resultat.values() if v.get("status") == "OK")
    print(f"{ok} OK · {sum(1 for v in resultat.values() if v.get('status') == 'MISMATCH')} MISMATCH · "
          f"{sum(1 for v in resultat.values() if v.get('status') == 'FEL')} FEL · {sum(1 for v in resultat.values() if v.get('status') == 'HOPPA')} HOPPA")
    for n, v in resultat.items():
        if v.get("status") != "OK":
            print(f"  {v.get('status')}: {n} — {v.get('skal')}")


if __name__ == "__main__":
    main()
