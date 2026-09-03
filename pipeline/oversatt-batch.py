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


def matcha(se_former, det_former):
    """Returnerar lista med detekterat form-index per SE-form (None = ingen träff)."""
    lediga = list(range(len(det_former)))
    ut = []
    for sf in se_former:
        n = len(sf["rader"])
        träff = None
        for i in lediga:
            if det_former[i]["rader"] == n:
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
            karta = matcha(sf, det)
            texter = []
            saknade = []
            for k, (s, n_, di) in enumerate(zip(sf, nf, karta)):
                if str(k) in ov.get("box_for_form", {}):
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
                for post in n_["texter"]:
                    e = {"form": di, "text": post.get("text", "")}
                    if len(post["rader"]) == 1:
                        e["rad"] = post["rader"][0]
                    else:
                        e["rader"] = post["rader"]
                    if post.get("stryk"):
                        e["stryk"] = post["stryk"]
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
