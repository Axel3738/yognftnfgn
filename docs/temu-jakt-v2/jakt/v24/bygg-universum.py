#!/usr/bin/env python3
"""Omprövningsuniversumet under de nya gaterna (FYND 2026-09-08: recensioner först, hyllan = varning).

Läser ALLA kandidatfiler från V2.1, V2.2 (fas 1 + fas 2), batch 1 och Q4-jakten v23, normaliserar dem
till en rad per (fil, kandidat) och räknar ett förpoäng som säger i vilken ordning kandidaterna ska
omprövas — inte om de vinner. Skriver UNIVERSUM.csv (allt) och UNIVERSUM-topp.md (de som ska omprövas).

    python3 bygg-universum.py [--topp 80]

Ingen siffra hittas på: saknas ett fält blir det tomt. Recensionsantal från sökutdrag märks 'snippet'.
"""
import csv
import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
JAKT = os.path.dirname(HERE)
USD_SEK_MID = 7.56          # mitt i det uppmätta spannet 6,96–8,16
STRUKTURELLA_KILLS = {"object", "presence", "negative_space"}   # de här ändras inte av fyndet


def num(x):
    if x is None:
        return None
    if isinstance(x, (int, float)):
        return float(x)
    m = re.search(r"[\d][\d\s.,]*", str(x))
    if not m:
        return None
    s = m.group(0).replace(" ", "").replace(" ", "")
    if s.count(",") == 1 and s.count(".") == 0:
        s = s.replace(",", ".")
    else:
        s = s.replace(",", "")
    try:
        return float(s)
    except ValueError:
        return None


def revcount(x):
    """'99+' → 99 (märks plus), '1 781' → 1781, None → None."""
    if x is None:
        return None, ""
    s = str(x)
    n = num(s)
    return (int(n) if n is not None else None), ("+" if "+" in s else "")


def rad(**k):
    base = {"src": "", "kluster": "", "namn": "", "koncept": "", "goods_id": "", "url_se": "", "alt_ids": "",
            "dna": None, "tier": "", "elim": "", "orsak": "", "rec": None, "rec_kalla": "", "pris_usd": None,
            "temu_pris_sek": None, "golv_namn": "", "golv_pris": None, "ankare_namn": "", "ankare_pris": None,
            "se_pris": None, "q4": "", "hook": "", "risk": "", "temu_hamtad": False, "v23_status": "", "v23_fel": ""}
    base.update(k)
    return base


def las_dataset():
    p = os.path.join(JAKT, "dataset.json")
    d = json.load(open(p, encoding="utf-8"))
    out = []
    for r in d["candidates"]:
        g = r.get("gates") or {}
        elim = r.get("eliminated_at") or ""
        reason = ""
        if elim and isinstance(g.get(elim), dict):
            reason = g[elim].get("reason") or ""
        se = r.get("swedish_equivalent") or {}
        an = r.get("brand_anchor") or {}
        rc, plus = revcount(r.get("review_count"))
        out.append(rad(src="dataset(V2.1)", kluster=r.get("kluster") or "", namn=(r.get("title") or r.get("title_from_search") or "")[:120],
                       koncept=r.get("object") or "", goods_id=str(r.get("goods_id") or ""), url_se=r.get("url_se") or "",
                       dna=num(r.get("structure_match")), tier=str(r.get("tier") or ""), elim=elim, orsak=reason[:300],
                       rec=rc, rec_kalla=("temu" if r.get("temu_fetch_status") == "ok" else "snippet") + plus if rc is not None else "",
                       pris_usd=None, temu_pris_sek=num(r.get("temu_price_sek")),
                       golv_namn=(se.get("retailer") or "")[:80], golv_pris=num(se.get("price_sek")),
                       ankare_namn=(an.get("name") or "")[:80], ankare_pris=num(an.get("price_sek")),
                       risk=(r.get("biggest_risk") or "")[:200], temu_hamtad=r.get("temu_fetch_status") == "ok"))
    return out


def las_fas2():
    out = []
    for p in sorted(glob.glob(os.path.join(JAKT, "v22", "fas2", "*.json"))):
        for r in json.load(open(p, encoding="utf-8")):
            g = r.get("gates") or {}
            sh = r.get("swedish_shelf") or {}
            ec = r.get("economics") or {}
            rc, plus = revcount(r.get("review_count"))
            elim = r.get("eliminated_at") or ""
            reason = ""
            if elim:
                gv = g.get(elim)
                reason = gv if isinstance(gv, str) else (gv or {}).get("reason", "") if isinstance(gv, dict) else ""
            out.append(rad(src="v22/fas2/" + os.path.basename(p), kluster=r.get("kluster") or "", namn=(r.get("title") or "")[:120],
                           koncept=r.get("concept") or "", goods_id=str(r.get("goods_id") or ""), url_se=r.get("url") or "",
                           dna=num(r.get("winner_dna_match_0_100")), tier=str(r.get("tier") or ""), elim=elim,
                           orsak=(str(reason) or str(sh.get("verdict") or ""))[:300], rec=rc,
                           rec_kalla=("snippet" + plus) if rc is not None else "", pris_usd=num(r.get("price_usd")),
                           golv_namn=str(sh.get("chain_same_form"))[:80] if isinstance(sh.get("chain_same_form"), str) and sh.get("chain_same_form") not in ("UNKNOWN", "") else "",
                           golv_pris=num(sh.get("floor_price_sek")), ankare_namn=(sh.get("anchor_name") or "")[:80],
                           ankare_pris=num(sh.get("anchor_price_sek")), se_pris=num(ec.get("se_price_sek")),
                           hook=r.get("hook_sv") or "", risk=(r.get("main_risk") or "")[:200]))
    return out


def las_batch1():
    out = []
    for p in sorted(glob.glob(os.path.join(JAKT, "batch1", "*.json"))):
        for r in json.load(open(p, encoding="utf-8")):
            sh = r.get("shelf") or {}
            ec = r.get("economics") or {}
            ls = r.get("listings") or []
            ids = [str(l.get("goods_id") if isinstance(l, dict) else l) for l in ls]
            ids = [i for i in ids if i and i != "None"]
            first = ls[0] if ls and isinstance(ls[0], dict) else {}
            rc, plus = revcount(first.get("review_count") or first.get("reviews"))
            out.append(rad(src="batch1/" + os.path.basename(p), kluster=os.path.basename(p).replace(".json", ""),
                           namn=(r.get("concept") or "")[:120], koncept=r.get("object") or "", goods_id=ids[0] if ids else "",
                           url_se=f"https://www.temu.com/se/g-{ids[0]}.html" if ids else "", alt_ids=" ".join(ids[1:]),
                           dna=num(r.get("dna_match")), tier=str(r.get("status") or ""), elim="shelf" if "hyll" in str(r.get("status", "")).lower() or str(sh.get("verdict", "")).upper() == "FAIL" else "",
                           orsak=(str(sh.get("verdict") or "") + " " + str(sh.get("note") or sh.get("floor_source") or ""))[:300],
                           rec=rc, rec_kalla=("snippet" + plus) if rc is not None else "", pris_usd=num(first.get("price_usd")),
                           golv_namn=(str(sh.get("floor_name") or sh.get("floor_source") or ""))[:80], golv_pris=num(sh.get("floor_sek")),
                           ankare_namn=(str(sh.get("anchor_name") or ""))[:80], ankare_pris=num(sh.get("anchor_sek") or sh.get("anchor_price_sek")),
                           se_pris=num(ec.get("se_price_sek") or ec.get("price_sek")), hook=r.get("hook") or "",
                           risk=(r.get("why_it_could_fail") or "")[:200]))
    return out


def las_v23():
    out = []
    for p in sorted(glob.glob(os.path.join(JAKT, "v23", "*.json"))):
        for r in json.load(open(p, encoding="utf-8")):
            sh = r.get("swedish_shelf") or {}
            ec = r.get("economics") or {}
            rc, plus = revcount(r.get("review_count"))
            out.append(rad(src="v23/" + os.path.basename(p), kluster=r.get("uppdrag") or "", namn=(r.get("product_name") or "")[:120],
                           koncept=r.get("concept") or "", goods_id=str(r.get("goods_id") or ""), url_se=r.get("temu_url") or "",
                           alt_ids=" ".join(str(x) for x in (r.get("alt_goods_ids") or [])), dna=num(r.get("winner_dna_match_0_100")),
                           tier=str(r.get("status_suggestion") or ""), elim="", orsak=str(sh.get("verdict") or "")[:300], rec=rc,
                           rec_kalla=("snippet" + plus) if rc is not None else "", pris_usd=num(r.get("price_usd")),
                           golv_namn=(sh.get("floor_name") or "")[:80], golv_pris=num(sh.get("floor_price_sek")),
                           ankare_namn=(sh.get("anchor_name") or "")[:80], ankare_pris=num(sh.get("anchor_price_sek")),
                           se_pris=num(ec.get("se_price")), q4=r.get("q4_label") or "", hook=r.get("hook_sv") or "",
                           risk=(r.get("main_risk") or "")[:200]))
    return out


def las_fas1():
    out = []
    for p in sorted(glob.glob(os.path.join(JAKT, "v22", "fas1", "*.json"))):
        d = json.load(open(p, encoding="utf-8"))
        ls = d.get("listings") or d.get("kandidater") or []
        for r in ls:
            if not isinstance(r, dict):
                continue
            rc, plus = revcount(r.get("review_count"))
            out.append(rad(src="v22/fas1/" + os.path.basename(p), kluster="fas1", namn=(r.get("title") or r.get("title_se") or "")[:120],
                           koncept=d.get("concept") or "", goods_id=str(r.get("goods_id") or ""), url_se=r.get("url_se") or "",
                           tier=str(d.get("verdict_concept") or ""), orsak=str(r.get("verdict") or r.get("listing_verdict") or "")[:300],
                           rec=rc, rec_kalla=("temu" if "cache" in str(r.get("price_source", "")) else "snippet") + plus if rc is not None else "",
                           pris_usd=num(r.get("price_usd")), hook=d.get("hook") or ""))
    return out


def las_allcandidates():
    p = os.path.join(JAKT, "v23", "ALL-CANDIDATES.csv")
    m = {}
    for r in csv.DictReader(open(p, encoding="utf-8")):
        if r.get("goods_id"):
            m[r["goods_id"]] = r
    return m


def vart_pris(r):
    if r["se_pris"]:
        return r["se_pris"]
    if r["temu_pris_sek"]:
        return round(r["temu_pris_sek"] * 1.5 * 2.4)
    if r["pris_usd"]:
        return round(r["pris_usd"] * USD_SEK_MID * 1.5 * 2.4)
    return None


def bedom(r):
    """Nya gaterna där datan räcker. Returnerar (rec_gate, hylla_ny, forpoang, struktur_kill)."""
    rec = r["rec"]
    if rec is None:
        rg = "?"
    elif rec > 800:
        rg = "KILL"
    elif rec >= 300:
        rg = "WARN"
    elif rec >= 150:
        rg = "OK"
    else:
        rg = "GREEN"
    vp = vart_pris(r)
    golv_under = bool(r["golv_pris"] and vp and r["golv_pris"] < vp)
    ankare_ok = bool(r["ankare_pris"] and vp and r["ankare_pris"] >= 1.6 * vp)
    if not golv_under:
        hy = "PASS" if (r["golv_pris"] or r["ankare_pris"]) else "?"
    elif ankare_ok:
        hy = "WARN+ankare"
    else:
        hy = "WARN-utan-ankare"
    struktur = r["elim"] in STRUKTURELLA_KILLS
    base = r["dna"] if r["dna"] is not None else {"shelf": 55, "economics": 30, "variant": 40, "audience": 25, "material": 45}.get(r["elim"], 35)
    t = r["tier"].upper()
    if r["dna"] is None:
        if t.startswith("A"):
            base = 80
        elif t.startswith("B"):
            base = 65
        elif t.startswith("C"):
            base = 45
    p = base
    p += {"KILL": -40, "WARN": -10, "GREEN": 5, "OK": 0, "?": 0}[rg]
    p += {"WARN-utan-ankare": -15, "WARN+ankare": -5, "PASS": 5, "?": 0}[hy]
    if r["pris_usd"] and r["pris_usd"] > 60:
        p -= 30
    if r["pris_usd"] and r["pris_usd"] < 3:
        p -= 10
    if r["v23_status"] in ("TEST", "VERIFY", "WATCH"):
        p += 10
    if struktur:
        p -= 100
    return rg, hy, p, struktur


def main():
    topp_n = int(sys.argv[sys.argv.index("--topp") + 1]) if "--topp" in sys.argv else 80
    rows = las_dataset() + las_fas2() + las_batch1() + las_v23() + las_fas1()
    ac = las_allcandidates()
    for r in rows:
        a = ac.get(r["goods_id"])
        if a:
            r["v23_status"], r["v23_fel"] = a.get("status", ""), a.get("fel", "")
    for r in rows:
        r["rec_gate"], r["hylla_ny"], r["forpoang"], r["struktur_kill"] = bedom(r)
        r["vart_pris"] = vart_pris(r)
    # dedupe på goods_id: behåll raden med flest ifyllda fält
    best = {}
    for r in rows:
        k = r["goods_id"] or ("koncept:" + r["namn"][:40])
        score = sum(1 for v in r.values() if v not in (None, "", False))
        if k not in best or score > best[k][0]:
            best[k] = (score, r)
    uniq = [v[1] for v in best.values()]
    cols = ["forpoang", "rec_gate", "hylla_ny", "struktur_kill", "v23_status", "v23_fel", "src", "kluster", "namn", "koncept", "goods_id",
            "url_se", "alt_ids", "dna", "tier", "elim", "orsak", "rec", "rec_kalla", "pris_usd", "temu_pris_sek", "vart_pris",
            "golv_namn", "golv_pris", "ankare_namn", "ankare_pris", "se_pris", "q4", "hook", "risk", "temu_hamtad"]
    with open(os.path.join(HERE, "UNIVERSUM.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        for r in sorted(uniq, key=lambda x: -x["forpoang"]):
            w.writerow(r)
    from collections import Counter
    print(f"rader: {len(rows)}  unika: {len(uniq)}")
    print("källor:", Counter(r["src"].split("/")[0] for r in uniq).most_common())
    print("elim:", Counter(r["elim"] for r in uniq).most_common(10))
    print("rec_gate:", Counter(r["rec_gate"] for r in uniq).most_common())
    print("hylla_ny:", Counter(r["hylla_ny"] for r in uniq).most_common())
    kand = [r for r in uniq if not r["struktur_kill"] and r["rec_gate"] != "KILL"]
    kand.sort(key=lambda x: -x["forpoang"])
    print(f"omprövningsbara (ej strukturkill, ej rec-KILL): {len(kand)}")
    lines = ["# Omprövningsuniversum — topp %d av %d omprövningsbara (förpoäng, inte dom)" % (topp_n, len(kand)), "",
             "| # | poäng | rec | hylla ny | v23 | namn | goods-id | dna | tier/elim | pris USD | vårt pris | golv | ankare | orsak |",
             "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|"]
    for i, r in enumerate(kand[:topp_n], 1):
        lines.append("| %d | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s |" % (
            i, r["forpoang"], f"{r['rec']}{r['rec_kalla']}" if r["rec"] is not None else "?", r["hylla_ny"], r["v23_status"] or "",
            r["namn"][:60].replace("|", "/"), r["goods_id"], r["dna"] if r["dna"] is not None else "", (r["tier"] + " / " + r["elim"]).strip(" /")[:30],
            r["pris_usd"] or "", r["vart_pris"] or "", (f"{r['golv_namn'][:25]} {r['golv_pris'] or ''}").strip(), (f"{r['ankare_namn'][:25]} {r['ankare_pris'] or ''}").strip(),
            r["orsak"][:90].replace("|", "/").replace("\n", " ")))
    open(os.path.join(HERE, "UNIVERSUM-topp.md"), "w", encoding="utf-8").write("\n".join(lines) + "\n")
    print("skrev UNIVERSUM.csv + UNIVERSUM-topp.md")


if __name__ == "__main__":
    main()
