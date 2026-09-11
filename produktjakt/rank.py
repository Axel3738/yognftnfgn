#!/usr/bin/env python3
"""Rankningen — profil, inte totalpoäng (V3, steg 5).

    python3 rank.py --in korningar/<datum>/v3/kandidater-*.json --ut korningar/<datum>/v3/batch.json [--max 15]

Läser kandidater i V3-KANDIDATSCHEMA.md, slår ihop dubbletter på listning/koncept, tillämpar de tre hårda
grindarna (LIVE_VERIFIED · BE-CPA ≥ 190 · inte K0-dubblett), räknar tre profilpoäng och fyller dagens batch:

    exploitation  5–8   vinnarlikhet×2 + ekonomi + sasong + meta_creative + lucka + signalbonus
    exploration   2–4   hypotesvarde×2 + nyhet + meta_creative + ekonomi
    sasong        1–3   sasong×2 + efterfragan + ekonomi

Signalbonus (max ±2) kommer ur larande.json: för kandidatens arketyp/form/deadline_typ/prisband summeras
(vinstandel − 0,5) × 2 över de dimensioner som har ≥ 3 dömda. Den står utskriven i rank_forklaring — ingen svart låda.
Asymmetrisk = en trea på minst en axel men totalpoäng under slot-medianen → visas alltid, märkt.
Fyll aldrig ut: räcker de som klarar grindarna till 7, blir batchen 7.
"""
import argparse
import datetime
import glob
import json
import os
import statistics

HERE = os.path.dirname(os.path.abspath(__file__))
LARANDE = os.path.join(HERE, "larande.json")
SLOT_MAX = {"exploitation": 8, "exploration": 4, "sasong": 3}
SLOT_MIN = {"exploitation": 5, "exploration": 2, "sasong": 1}
BE_CPA_GOLV = 190
# Formtak (Axels signal 2026-09-11: "du har sneat in dig på överdrag för mycket"; uppdraget: "do not collapse into
# finding 20 covers because two covers won"). Skyddsformerna delar EN familj och får högst FORMTAK av batchen.
# 9 av kontots 18 REAL WINNERS är inte överdrag (spöklämma, kamera, bandslip, sele, damasker, shorts, klistermärken,
# kalender, tofflor) — strukturen "ägt objekt ute + hyllfrånvaro + material" bär, inte formen.
SKYDDSFORMER = {"överdrag", "kapell", "huv", "skydd", "tak", "lock", "hölje", "kåpa", "kapell/huv", "överdrag/kapell"}
FORMTAK = 0.4
ARKETYPTAK = 0.5   # högst hälften av batchen får ha samma primära arketyp


def ar_skyddsform(k):
    f = (k.get("form") or "").lower()
    return any(s in f for s in SKYDDSFORMER)


def las_kandidater(monster):
    ut = []
    for m in monster:
        for f in sorted(glob.glob(m)):
            d = json.load(open(f, encoding="utf-8"))
            for k in (d if isinstance(d, list) else d.get("kandidater", [])):
                k["_kalla"] = os.path.basename(f)
                ut.append(k)
    return ut


def signalbonus(k, larande):
    sig = (larande or {}).get("signaler", {})
    delar, tot = [], 0.0
    t = {"arketyp": k.get("arketyp"), "form": k.get("form"), "deadline_typ": (k.get("sasong") or {}).get("deadline_typ"),
         "prisband": prisband((k.get("ekonomi") or {}).get("pris_sek"))}
    for d, v in t.items():
        s = sig.get(d, {}).get(str(v)) if v else None
        if s and s.get("domda", 0) >= 3 and s.get("vinstandel") is not None:
            b = (s["vinstandel"] - 0.5) * 2
            tot += b
            delar.append(f"{d}={v} {s['REAL_WINNER']}V/{s['REAL_LOSER']}F ({b:+.1f})")
    return max(-2.0, min(2.0, round(tot, 1))), delar


def prisband(p):
    if not p:
        return None
    return "<300" if p < 300 else "300–499" if p < 500 else "500–999" if p < 1000 else "≥1000"


def be_cpa_min(k):
    e = k.get("ekonomi") or {}
    b = e.get("be_cpa_sek")
    if isinstance(b, list):
        return min(x for x in b if x is not None) if b else None
    return b


def grindar(k):
    fel = []
    if (k.get("listning") or {}).get("verdict") != "LIVE_VERIFIED":
        fel.append(f"listning {((k.get('listning') or {}).get('verdict') or 'saknas')}")
    b = be_cpa_min(k)
    if b is None or b < BE_CPA_GOLV:
        fel.append(f"BE-CPA {b if b is not None else 'ej mätt'} < {BE_CPA_GOLV}")
    if (k.get("k0") or {}).get("dubblett"):
        fel.append("K0 dubblett")
    for f in ("namn_sv", "objekt", "form", "arketyp", "slot", "varfor", "huvudrisk", "konfidens"):
        if not k.get(f):
            fel.append(f"saknar {f}")
    return fel


def profil(k, larande):
    p = {a: int((k.get("poang") or {}).get(a) or 0) for a in ("vinnarlikhet", "meta_creative", "efterfragan", "lucka", "ekonomi", "sasong", "leverantor", "nyhet", "hypotesvarde")}
    bonus, delar = signalbonus(k, larande)
    slot = k.get("slot") or "exploitation"
    if slot == "exploration":
        tot = p["hypotesvarde"] * 2 + p["nyhet"] + p["meta_creative"] + p["ekonomi"]
        fork = f"exploration: hypotesvärde {p['hypotesvarde']}×2 + nyhet {p['nyhet']} + creative {p['meta_creative']} + ekonomi {p['ekonomi']} = {tot}"
    elif slot == "sasong":
        tot = p["sasong"] * 2 + p["efterfragan"] + p["ekonomi"]
        fork = f"säsong: säsong {p['sasong']}×2 + efterfrågan {p['efterfragan']} + ekonomi {p['ekonomi']} = {tot}"
    else:
        tot = p["vinnarlikhet"] * 2 + p["ekonomi"] + p["sasong"] + p["meta_creative"] + p["lucka"] + bonus
        fork = f"exploitation: vinnarlikhet {p['vinnarlikhet']}×2 + ekonomi {p['ekonomi']} + säsong {p['sasong']} + creative {p['meta_creative']} + lucka {p['lucka']} + signalbonus {bonus:+.1f} [{'; '.join(delar) or 'inga dömda signaler'}] = {tot:.1f}"
    return round(tot, 1), fork, p


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="inn", nargs="+", required=True)
    ap.add_argument("--ut", required=True)
    ap.add_argument("--max", type=int, default=15)
    a = ap.parse_args()
    larande = json.load(open(LARANDE, encoding="utf-8")) if os.path.exists(LARANDE) else {}
    kand = las_kandidater(a.inn)

    # dubbletter på listning eller (objekt+form)
    sedda, unika = {}, []
    for k in kand:
        nyckel = str((k.get("listning") or {}).get("product_id") or "") or f"{(k.get('objekt') or '').lower()}+{(k.get('form') or '').lower()}"
        if nyckel in sedda:
            sedda[nyckel].setdefault("_dubbletter", []).append(k.get("_kalla"))
            continue
        sedda[nyckel] = k
        unika.append(k)

    godkanda, strukna = [], []
    for k in unika:
        fel = grindar(k)
        if fel:
            k["_struken"] = fel
            strukna.append(k)
            continue
        k["rank_poang"], k["rank_forklaring"], k["_p"] = profil(k, larande)
        godkanda.append(k)

    batch, rest = [], []
    for slot in ("exploitation", "exploration", "sasong"):
        rader = sorted((k for k in godkanda if (k.get("slot") or "exploitation") == slot), key=lambda k: -k["rank_poang"])
        med = statistics.median([k["rank_poang"] for k in rader]) if rader else 0
        for k in rader:
            k["asymmetrisk"] = any(v == 3 for v in k["_p"].values()) and k["rank_poang"] < med
        tagna = rader[:SLOT_MAX[slot]]
        # asymmetriska utanför cut-off följer med som "visas alltid" om det finns plats i totalen
        batch += tagna
        rest += [k for k in rader[SLOT_MAX[slot]:]]
    for k in rest:
        if k.get("asymmetrisk") and len(batch) < a.max:
            batch.append(k)
    batch = batch[:a.max]

    # Formtak + arketyptak: lyft ut de lägst rankade i den överrepresenterade gruppen och fyll på med nästa
    # kandidat utanför gruppen (om det finns någon). Aldrig utfyllnad med rader som inte klarat grindarna.
    import math
    formtak_ut = []
    def tak(grupp_fn, andel, namn):
        nonlocal batch
        while batch and sum(1 for k in batch if grupp_fn(k)) > math.ceil(andel * len(batch)):
            i_grupp = sorted((k for k in batch if grupp_fn(k)), key=lambda k: k["rank_poang"])
            bort = i_grupp[0]
            batch.remove(bort)
            bort["_utanfor"] = f"{namn}: {int(andel * 100)} % av batchen"
            formtak_ut.append(bort)
            ersattare = [k for k in rest if k not in batch and k not in formtak_ut and not grupp_fn(k)]
            if ersattare:
                b = max(ersattare, key=lambda k: k["rank_poang"])
                batch.append(b)
    tak(ar_skyddsform, FORMTAK, "formtak skyddsform")
    for ark in {k.get("arketyp") for k in batch}:
        tak(lambda k, _a=ark: k.get("arketyp") == _a, ARKETYPTAK, f"arketyptak {ark}")
    batch.sort(key=lambda k: -k["rank_poang"])
    for i, k in enumerate(batch, 1):
        k["rank"] = i
        k.pop("_p", None)
    ut = {"datum": datetime.date.today().isoformat(), "antal": len(batch),
          "per_slot": {s: sum(1 for k in batch if k.get("slot") == s) for s in SLOT_MAX},
          "under_minimum": {s: SLOT_MIN[s] - sum(1 for k in batch if k.get("slot") == s) for s in SLOT_MAX if sum(1 for k in batch if k.get("slot") == s) < SLOT_MIN[s]},
          "batch": batch,
          "skyddsformer_i_batch": sum(1 for k in batch if ar_skyddsform(k)),
          "strukna": [{"namn_sv": k.get("namn_sv"), "objekt": k.get("objekt"), "orsak": k["_struken"], "kalla": k.get("_kalla")} for k in strukna],
          "utanfor_batch": [{"namn_sv": k.get("namn_sv"), "slot": k.get("slot"), "rank_poang": k.get("rank_poang"), "orsak": k.get("_utanfor") or "plats"}
                            for k in rest + formtak_ut if k not in batch]}
    os.makedirs(os.path.dirname(a.ut), exist_ok=True)
    json.dump(ut, open(a.ut, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{len(kand)} kandidater → {len(unika)} unika → {len(godkanda)} klarade grindarna → batch {len(batch)} {ut['per_slot']}"
          + (f" · under minimum: {ut['under_minimum']}" if ut["under_minimum"] else ""))
    for k in batch:
        print(f"  {k['rank']:2}. {k['slot'][:5]:5} {k['rank_poang']:>5} {'ASYM ' if k.get('asymmetrisk') else '     '}{k['namn_sv'][:38]:38} {k['konfidens']:5} {k['arketyp']}")
    for k in strukna:
        print(f"  ✗ {str(k.get('namn_sv'))[:40]:40} {k['_struken']}")
    for k in formtak_ut:
        print(f"  ↓ {str(k.get('namn_sv'))[:40]:40} {k['_utanfor']}")
    print(f"skyddsformer i batch: {ut['skyddsformer_i_batch']} av {len(batch)} (tak {int(FORMTAK * 100)} %)")


if __name__ == "__main__":
    main()
