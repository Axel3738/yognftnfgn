#!/usr/bin/env python3
# material-tillamp.py — skriver in materialgranskningens (gate 4) domar i klusterfilerna.
# Läser hunt/material/*.json (a-kandidater.json + agenternas filer), matchar goods_id och sätter
# gates.material = {result, reason, source, sec_0_3, hero_alone_viable, raw_plus_captions_viable, …}
# samt video_checked = true där en video faktiskt granskats. Hittar aldrig på något.
import json, glob, os
H = os.path.dirname(os.path.abspath(__file__))
dom = {}
for f in sorted(glob.glob(os.path.join(H, "material", "*.json"))):
    try: arr = json.load(open(f, encoding="utf-8"))
    except Exception as e: print("hoppar", f, e); continue
    for c in arr if isinstance(arr, list) else []:
        if c.get("goods_id"): dom[str(c["goods_id"])] = (os.path.basename(f), c)
print("materialdomar:", len(dom))
n = 0
for f in sorted(glob.glob(os.path.join(H, "*.json"))):
    if os.path.basename(f) == "dataset.json": continue
    try: data = json.load(open(f, encoding="utf-8"))
    except Exception: continue
    rows = (data.get("candidates") or data.get("kandidater")) if isinstance(data, dict) else data
    if not isinstance(rows, list): continue
    andrad = False
    for r in rows:
        gid = str(r.get("goods_id") or "") if isinstance(r, dict) else ""
        if gid not in dom: continue
        fil, c = dom[gid]
        g = r.setdefault("gates", {})
        g["material"] = {"result": c.get("material_result"), "reason": c.get("material_reason"), "source": c.get("source"),
                         "verified_by": fil, "video_len_s": c.get("video_len_s"), "sec_0_3": c.get("sec_0_3"),
                         "product_in_use_by_3s": c.get("product_in_use_by_3s"), "same_product_as_hero": c.get("same_product_as_hero"),
                         "burned_text": c.get("burned_text"), "muted_ok": c.get("muted_ok"),
                         "owner_or_object_visible": c.get("owner_or_object_visible"), "clean_framing": c.get("clean_framing"),
                         "raw_plus_captions_viable": c.get("raw_plus_captions_viable"), "hero_alone_viable": c.get("hero_alone_viable")}
        r["video_checked"] = bool(c.get("video_len_s"))
        n += 1; andrad = True
    if andrad:
        json.dump(data, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("träffade rader:", n)
