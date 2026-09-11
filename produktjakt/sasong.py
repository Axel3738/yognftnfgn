#!/usr/bin/env python3
"""Dagens säsongskarta — vilka efterfrågefönster ligger 2–16 veckor fram (V3, steg 0D).

    python3 sasong.py [--datum YYYY-MM-DD] [--ut korningar/<datum>/SASONG.md]
    python3 sasong.py --objekt "Snöslungan"        # fönstren för en objektrad

Läser sasong.json (fönster med start/topp/slut, region, objekt) och räknar per fönster:
    VECKOR_KVAR  = veckor till toppen (negativt = passerad topp)
    TIMING       = EARLY (topp > 16 v bort) · NOW (köpfönstret öppet: 0–16 v till toppen och slut ej passerat) ·
                   LATE (toppen passerad, slutet ej — sälj bara med pågående skada) · PASSERAD · EVERGREEN (inget fönster)
Skriver SASONG.md med fönstren i ordning (närmast topp först) och vilka objektrader de öppnar.
Används av rank.py (poäng sasong) och sida.py (chipet "NU / TIDIGT / SENT").
"""
import argparse
import datetime
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SASONG = os.path.join(HERE, "sasong.json")
HORISONT_MIN, HORISONT_MAX = 2, 16   # veckor (uppdraget 2026-09-11)


def las():
    return json.load(open(SASONG, encoding="utf-8"))


def _d(s):
    return datetime.date.fromisoformat(s)


def bedom(f, datum):
    """Ett fönster + dagens datum → dict med veckor_kvar, timing, kopfonster."""
    d = _d(datum)
    start, topp, slut = _d(f["start"]), _d(f["topp"]), _d(f["slut"])
    v_topp = round((topp - d).days / 7, 1)
    v_slut = round((slut - d).days / 7, 1)
    if d > slut:
        timing = "PASSERAD"
    elif v_topp > HORISONT_MAX:
        timing = "EARLY"
    elif d <= topp:
        timing = "NOW"
    else:
        timing = "LATE"
    lo, hi = f.get("kopfonster_veckor_fore") or [HORISONT_MIN, HORISONT_MAX]
    i_kopfonster = timing == "NOW" and lo <= v_topp <= max(hi, HORISONT_MAX)
    return {"id": f["id"], "namn": f["namn"], "deadline_typ": f["deadline_typ"], "kategori": f.get("kategori"), "region": f.get("region"),
            "start": f["start"], "topp": f["topp"], "slut": f["slut"], "veckor_till_topp": v_topp, "veckor_till_slut": v_slut,
            "timing": timing, "i_kopfonster": i_kopfonster, "objekt": f.get("objekt", []), "kalla": f.get("kalla", "")}


def karta(datum):
    return sorted((bedom(f, datum) for f in las()["fonster"]), key=lambda x: (x["timing"] != "NOW", abs(x["veckor_till_topp"])))


def for_objekt(objekt, datum):
    """Bästa fönstret för en objektrad (NOW före EARLY före LATE), eller EVERGREEN."""
    o = (objekt or "").lower()
    tr = [b for b in karta(datum) if any(o.startswith(x.lower()[:12]) or x.lower().startswith(o[:12]) for x in b["objekt"])]
    if not tr:
        return {"timing": "EVERGREEN", "veckor_till_topp": None, "namn": None, "id": None}
    ordning = {"NOW": 0, "EARLY": 1, "LATE": 2, "PASSERAD": 3}
    return sorted(tr, key=lambda b: (ordning[b["timing"]], abs(b["veckor_till_topp"])))[0]


def skriv_md(datum, ut):
    k = karta(datum)
    d = _d(datum)
    rader = [f"# Säsongskartan {datum} (vecka {d.isocalendar()[1]}) — fönster {HORISONT_MIN}–{HORISONT_MAX} veckor fram", "",
             "Skrivs av `sasong.py` ur `sasong.json`. NOW = köpfönstret är öppet nu · EARLY = toppen > 16 v bort (parkera) · LATE = toppen passerad, säsongen inte (bara pågående skada) · PASSERAD.", "",
             "| Timing | V till topp | Fönster | Topp | Slut | Region | Objektrader | Källa |", "|---|---:|---|---|---|---|---|---|"]
    for b in k:
        if b["timing"] == "PASSERAD":
            continue
        rader.append(f"| {b['timing']} | {b['veckor_till_topp']} | {b['namn']} | {b['topp']} | {b['slut']} | {b['region']} | {', '.join(b['objekt'][:4])}{' …' if len(b['objekt']) > 4 else ''} | {b['kalla'][:60]} |")
    passerade = [b for b in k if b["timing"] == "PASSERAD"]
    if passerade:
        rader += ["", "Passerade: " + ", ".join(b["namn"] for b in passerade)]
    os.makedirs(os.path.dirname(ut), exist_ok=True)
    open(ut, "w", encoding="utf-8").write("\n".join(rader) + "\n")
    return k


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--datum", default=datetime.date.today().isoformat())
    ap.add_argument("--ut")
    ap.add_argument("--objekt")
    a = ap.parse_args()
    if a.objekt:
        print(json.dumps(for_objekt(a.objekt, a.datum), ensure_ascii=False, indent=1)); return
    ut = a.ut or os.path.join(HERE, "korningar", a.datum, "SASONG.md")
    k = skriv_md(a.datum, ut)
    now = [b for b in k if b["timing"] == "NOW"]
    print(f"{a.datum}: {len(now)} fönster NOW, {sum(1 for b in k if b['timing'] == 'EARLY')} EARLY, {sum(1 for b in k if b['timing'] == 'LATE')} LATE → {ut}")
    for b in now:
        print(f"  NOW  {b['veckor_till_topp']:>5} v  {b['namn'][:50]:50} {b['region']:12} {', '.join(b['objekt'][:3])}")


if __name__ == "__main__":
    main()
