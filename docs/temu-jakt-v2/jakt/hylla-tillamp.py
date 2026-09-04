#!/usr/bin/env python3
# hylla-tillamp.py — skriver in hyllverifieringens (gate 3) domar i klusterfilerna.
# Läser hunt/hylla/h*.json, hittar varje goods_id i hunt/<kluster>.json och sätter
# gates.shelf = {result, reason, verified: true, chain_min_price_sek, anchor}.
# FAIL ⇒ eliminated_at = "shelf", tier = "ELIM". Hittar aldrig på något.
import json, glob, os
H = os.path.dirname(os.path.abspath(__file__))
verdicts = {}
for f in sorted(glob.glob(os.path.join(H, "hylla", "h*.json"))):
    for c in json.load(open(f, encoding="utf-8")):
        for gid in c.get("goods_ids") or []:
            verdicts[str(gid)] = (os.path.basename(f), c)
print("domar:", len(verdicts))
traffade = 0
for f in sorted(glob.glob(os.path.join(H, "*.json"))):
    if os.path.basename(f) == "dataset.json": continue
    try: data = json.load(open(f, encoding="utf-8"))
    except Exception: continue
    rows = data.get("candidates") or data.get("kandidater") if isinstance(data, dict) else data
    if not isinstance(rows, list): continue
    andrad = False
    for r in rows:
        if not isinstance(r, dict): continue
        gid = str(r.get("goods_id") or "")
        if gid not in verdicts: continue
        fil, c = verdicts[gid]
        v = str(c.get("verdict") or "UNCERTAIN").upper()
        g = r.setdefault("gates", {})
        g["shelf"] = {"result": v, "reason": c.get("reason"), "verified": True, "verified_by": fil,
                      "same_form_in_chain": c.get("same_form_in_chain"), "chain_min_price_sek": c.get("chain_min_price_sek"),
                      "anchor": c.get("anchor"), "adlib_active": c.get("adlib_active"), "concept": c.get("concept")}
        if c.get("anchor") and (c["anchor"].get("price_sek") is not None):
            r["brand_anchor"] = c["anchor"]
        if v == "FAIL":
            r["eliminated_at"] = "shelf"; r["tier"] = "ELIM"
        elif r.get("eliminated_at") == "shelf":
            # tidigare provisoriskt fälld på hyllan men nu verifierad PASS/UNCERTAIN: ta tillbaka till B
            r["eliminated_at"] = None; r["tier"] = r.get("tier") if (r.get("tier") or "").upper() in ("A", "B", "C") else "B"
        traffade += 1; andrad = True
    if andrad:
        json.dump(data, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("träffade rader:", traffade)
