#!/usr/bin/env python3
"""Läser en workflow-output (tasks/<id>.output, JSON med .result) och skriver OMPROVNING-<tag>.json + kort tabell."""
import json, sys
src, tag = sys.argv[1], sys.argv[2]
d = json.load(open(src))["result"]
json.dump(d, open(f"OMPROVNING-{tag}.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("summary", d.get("summary"), "n=", len(d.get("results", [])), "discovered=", len(d.get("discovered", [])))
for r in sorted(d["results"], key=lambda r: -(r["assessment"] or {}).get("hypothesis_score", 0)):
    a = r["assessment"]
    if not a: continue
    rg = a["reviews_gate"]; ag = a["advertiser_gate"]; sg = a["shelf_gate"]
    ec = (a.get("landed_low_sek"), a.get("landed_high_sek"), a.get("multiple_low"), a.get("multiple_high"))
    lc = a["listing_candidates"][0] if a["listing_candidates"] else {}
    v = r.get("verdict") or {}
    print(f"\n[{a['hypothesis_score']:>3}] {a['concept_id']} — {a['product_name_sv'][:60]} | {r['status']} | pris {a['se_price_sek']} | landad {ec[0]}–{ec[1]} ({ec[2]}–{ec[3]}×) | {a['q4_label']}")
    print(f"   rec: {rg['count']} {rg['verdict']} | annons: {ag['count']} {ag['method']} {ag['verdict']} | hylla: golv {str(sg['floor_name'])[:38]} {sg['floor_price_sek']} / ankare {str(sg['anchor_name'])[:38]} {sg['anchor_price_sek']} → {sg['verdict']} | publik {a['audience']['size']} {a['audience']['verdict']} | prio {a['priority_for_live_check']}")
    print(f"   listning: {lc.get('goods_id')} {lc.get('price_usd')} USD rec {lc.get('reviews')} | {str(lc.get('title',''))[:70]} | alt: {[x['goods_id'] for x in a['listing_candidates'][1:4]]}")
    print(f"   risk: {a['main_risk'][:230]}")
    if v: print(f"   skeptiker: hylla_refuted={v.get('hylla_refuted')} dna_refuted={v.get('dna_refuted')} | {'; '.join((v.get('hylla_reasons') or [])[:2])[:200]} | {'; '.join((v.get('dna_reasons') or [])[:2])[:200]}")
