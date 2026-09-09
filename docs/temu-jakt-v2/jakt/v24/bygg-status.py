#!/usr/bin/env python3
"""STATUS-<datum>.md — kvittot: allt som prövades i körningen, med orsak. Läser OMPROVNING-*.json,
live/<id>/data.json och dripp.log. Skriver aldrig om något — bara sammanställer.

    python3 bygg-status.py [--datum 2026-09-08]
"""
import glob
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def arg(flag, default):
    return sys.argv[sys.argv.index(flag) + 1] if flag in sys.argv else default


def main():
    datum = arg("--datum", "2026-09-08")
    rows = []
    disc = []
    for p in sorted(glob.glob(os.path.join(HERE, "OMPROVNING-*.json"))):
        d = json.load(open(p, encoding="utf-8"))
        tag = os.path.basename(p)[len("OMPROVNING-"):-5]
        for r in d.get("results", []):
            a = r.get("assessment")
            if not a:
                continue
            rows.append((tag, r))
        disc += d.get("discovered", [])
    live = {}
    for p in glob.glob(os.path.join(HERE, "live", "*", "data.json")):
        d = json.load(open(p, encoding="utf-8"))
        live[d["goods_id"]] = d
    lines = [f"# STATUS {datum} — kvittot för Q4-omprövningen", "",
             "Vad som prövades, i vilken ordning det föll, och vad som är live-verifierat. Slutlistan står i "
             f"`SLUTLISTA-{datum}.md`; regeln i `../../REGEL.md`.", ""]
    # Live
    lines += ["## Live-hämtningar i körningen (Temu SE-sajten)", "",
              "| Tid (UTC) | goods-id | Dom | Pris | Rec (SE) | Bilder/video | Lager | Titel |", "|---|---|---|---|---|---|---|---|"]
    for gid, d in sorted(live.items(), key=lambda x: x[1].get("fetched", "")):
        lines.append(f"| {d.get('fetched', '')[11:19]} | {gid} | **{d.get('verdict')}** | {d.get('price') or ''} {d.get('currency') or ''} | {d.get('review_count') or ''} | "
                     f"{len(d.get('images') or [])}/{'video' if d.get('video_url') else '–'} | {d.get('availability') or ''} | {(d.get('title') or '')[:60]} |")
    lines.append("")
    # Assessments
    order = {"STRONG": 0, "MEDIUM": 1, "UNVERIFIED": 2, "REFUTED": 3, "WEAK": 4, "MISSING": 5}
    rows.sort(key=lambda x: (order.get(x[1]["status"], 9), -x[1]["assessment"].get("hypothesis_score", 0)))
    lines += ["## Alla bedömda koncept", "", "Status = pipelinens dom (STRONG: stark + två skeptiker fällde inte · MEDIUM: en fällde · REFUTED: båda fällde · WEAK: inte stark). "
              "Skeptikernas skäl står i kolumnen när de fällde.", "",
              "| Poäng | Status | Koncept | Pris | Landad | Rec (US) | Annonsörer | Hylla golv / ankare | Publik | Största risk / fällande skäl |", "|---|---|---|---|---|---|---|---|---|---|"]
    for tag, r in rows:
        a = r["assessment"]; v = r.get("verdict") or {}
        sg = a["shelf_gate"]; ag = a["advertiser_gate"]; rg = a["reviews_gate"]
        skal = a["main_risk"]
        if v and (v.get("hylla_refuted") or v.get("dna_refuted")):
            skal = " ".join(((v.get("hylla_reasons") or [""])[0] if v.get("hylla_refuted") else "", (v.get("dna_reasons") or [""])[0] if v.get("dna_refuted") else ""))
        lines.append(f"| {a['hypothesis_score']} | {r['status']} | **{a['product_name_sv'][:55]}** (`{a['concept_id'][:30]}`) | {a['se_price_sek']} | {a.get('landed_low_sek') or '?'}–{a.get('landed_high_sek') or '?'} | "
                     f"{rg['count'] if rg['count'] is not None else '?'} | {ag['count'] if ag['count'] is not None else '?'} {ag['method'][:12]} | {(sg.get('floor_name') or '')[:30]} {sg.get('floor_price_sek') or ''} / {(sg.get('anchor_name') or '')[:30]} {sg.get('anchor_price_sek') or ''} | "
                     f"{a['audience'].get('size') or '?'} | {skal[:260].replace('|', '/').replace(chr(10), ' ')} |")
    lines.append("")
    if disc:
        lines += ["## Discovery-bottarnas kandidater (råa, före bedömning)", "", "| Vinkel | Koncept | goods-id | Pris (utdrag) | Rec | Q4 | Svenska säljare | Snabb hylla |", "|---|---|---|---|---|---|---|---|"]
        for c in disc:
            lines.append(f"| {c.get('angle_id', '')} | {c.get('concept_sv', '')[:50]} | {' '.join(c.get('goods_ids', [])[:3])} | {c.get('snippet_price_usd') or '?'} | {c.get('snippet_reviews') or '?'} | {c.get('q4_label', '')[:14]} | {c.get('swedish_sellers_seen') if c.get('swedish_sellers_seen') is not None else '?'} | {(c.get('quick_shelf') or '')[:90].replace('|', '/')} |")
        lines.append("")
    lp = os.path.join(HERE, "dripp.log")
    if os.path.exists(lp):
        lines += ["## Temu-budgeten (dripp.log)", "", "```"]
        lines += [l.rstrip() for l in open(lp, encoding="utf-8").read().splitlines()[-40:]]
        lines += ["```", ""]
    out = os.path.join(HERE, f"STATUS-{datum}.md")
    open(out, "w", encoding="utf-8").write("\n".join(lines) + "\n")
    from collections import Counter
    print(f"STATUS: {len(rows)} koncept {dict(Counter(r['status'] for _, r in rows))}, {len(live)} live-filer, {len(disc)} discovery-kandidater → {out}")


if __name__ == "__main__":
    main()
