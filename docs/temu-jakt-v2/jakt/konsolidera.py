#!/usr/bin/env python3
# konsolidera.py — slår ihop klusteragenternas JSON till ett dataset, räknar tratten
# och listar Tier A/B. Hittar inte på något: fält som saknas förblir null.
import json, glob, os, csv, sys, collections
H = os.path.dirname(os.path.abspath(__file__))
GATES = ["object", "presence", "shelf", "material", "economics", "variant", "hook", "audience"]
rows = []
for f in sorted(glob.glob(os.path.join(H, "*.json"))):
    name = os.path.basename(f)
    if name in ("dataset.json",) or name.startswith("test-") or name.startswith("raw"):
        continue
    try:
        data = json.load(open(f, encoding="utf-8"))
    except Exception as e:
        print("FEL", name, e, file=sys.stderr); continue
    if isinstance(data, dict):
        data = data.get("candidates") or data.get("kandidater") or []
    for r in data:
        if isinstance(r, dict):
            r.setdefault("kluster", name.replace(".json", ""))
            rows.append(r)
# dedupe på goods_id (behåll den med flest ifyllda gates)
by = {}
for r in rows:
    gid = str(r.get("goods_id") or r.get("url_se") or id(r))
    score = sum(1 for g in GATES if (r.get("gates") or {}).get(g))
    if gid not in by or score > by[gid][0]:
        by[gid] = (score, r)
rows = [v[1] for v in by.values()]

def res(r, g):
    x = (r.get("gates") or {}).get(g) or {}
    v = str(x.get("result") or "").upper()
    if v.startswith("STRONG"): return "PASS"
    if v.startswith("PASS"): return "PASS"
    if v.startswith("FAIL"): return "FAIL"
    if v: return "UNCERTAIN"
    return None

funnel = collections.OrderedDict([("RAW", len(rows))])
alive = rows
for g in GATES:
    alive = [r for r in alive if res(r, g) in ("PASS", "UNCERTAIN")]
    funnel["AFTER " + g.upper()] = len(alive)
tiers = collections.Counter((r.get("tier") or "ELIM").upper() for r in rows)
funnel["FINAL TIER A (villkorad — gate 4/5 ej körda)"] = sum(v for k, v in tiers.items() if k.startswith("A"))

out = {"generated_from": sorted(set(r["kluster"] for r in rows)), "n": len(rows), "funnel": funnel,
       "tiers": dict(tiers), "candidates": rows}
json.dump(out, open(os.path.join(H, "dataset.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
with open(os.path.join(H, "dataset.csv"), "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    w.writerow(["kluster", "goods_id", "title", "temu_price_sek", "rating", "review_count", "object", "eliminated_at",
                "tier", "structure_match", "category_novelty", "video_checked", "hook", "se_price_est", "confidence", "url_se"] + ["gate_" + g for g in GATES])
    for r in rows:
        g = r.get("gates") or {}
        w.writerow([r.get("kluster"), r.get("goods_id"), r.get("title"), r.get("temu_price_sek"), r.get("rating"), r.get("review_count"),
                    r.get("object"), r.get("eliminated_at"), r.get("tier"), r.get("structure_match"), r.get("category_novelty"),
                    r.get("video_checked"), (g.get("hook") or {}).get("text"), (g.get("economics") or {}).get("se_price_est_sek"),
                    r.get("confidence"), r.get("url_se")] + [res(r, x) for x in GATES])
print(json.dumps({"n": len(rows), "funnel": funnel, "tiers": dict(tiers)}, ensure_ascii=False, indent=1))
print("\nTIER A/B:")
for r in sorted(rows, key=lambda r: -(r.get("structure_match") or 0)):
    if (r.get("tier") or "").upper() in ("A", "B"):
        g = r.get("gates") or {}
        print(f"  {r.get('tier')} {r.get('structure_match')}/{r.get('category_novelty')} [{r.get('kluster')}] {r.get('goods_id')} {str(r.get('title'))[:70]} · Temu {r.get('temu_price_sek')} kr · ★{r.get('rating')} ({r.get('review_count')}) · video={r.get('video_checked')} · mat={res(r,'material')} · hook={(g.get('hook') or {}).get('text')}")
