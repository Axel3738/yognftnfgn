#!/usr/bin/env python3
# ekonomi.py — gate 5 på USA-priset när SE-sidan är blockerad.
# Kalibrering SE-pris/USD-pris på två kända vinnare (mätt 2026-09-04 07:22 UTC):
#   IBC-överdrag  SE 108,51 kr / US 15,60 USD = 6,96 kr per USD
#   motorhöljet   SE  71,22 kr / US  8,73 USD = 8,16 kr per USD
# Landad kostnad ≈ SE-Temu-pris × 1,5 (kalibrerat på IBC 108,51→165, motorhölje 71,22→116).
# Regel (fingeravtrycket punkt 4): svenskt pris ≥ 2,4 × landad och ≥ 300 kr; BE-CPA = pris − landad ≥ 190.
# Skriver gates.economics_us i klusterfilerna. Rör inte agentens gates.economics.
import json, glob, os
H = os.path.dirname(os.path.abspath(__file__))
KURS = (6.96, 8.16)
n = 0
for f in sorted(glob.glob(os.path.join(H, "*.json"))):
    if os.path.basename(f) == "dataset.json": continue
    try: data = json.load(open(f, encoding="utf-8"))
    except Exception: continue
    rows = (data.get("candidates") or data.get("kandidater")) if isinstance(data, dict) else data
    if not isinstance(rows, list): continue
    andrad = False
    for r in rows:
        us = r.get("temu_us") if isinstance(r, dict) else None
        if not us or us.get("price_usd") in (None, ""): continue
        try: usd = float(us["price_usd"])
        except Exception: continue
        se_lo, se_hi = round(usd * KURS[0]), round(usd * KURS[1])
        landed_lo, landed_hi = round(se_lo * 1.5), round(se_hi * 1.5)
        need_lo, need_hi = round(landed_lo * 2.4), round(landed_hi * 2.4)
        g = r.setdefault("gates", {})
        ec = g.get("economics") if isinstance(g.get("economics"), dict) else {}
        pris = ec.get("se_price_est_sek")
        try: pris = float(pris) if pris not in (None, "", "UNKNOWN") else None
        except Exception: pris = None
        anchor = (r.get("brand_anchor") or {}).get("price_sek") if isinstance(r.get("brand_anchor"), dict) else None
        # Frågan gate 5 ställer är: FINNS det ett pris som klarar både 2,4× och ankaret ≥ 1,6×?
        # Därför testas det högsta pris hyllan tillåter (ankare/1,6, tak 999 kr), inte agentens försiktiga gissning.
        if anchor:
            try: pris = min(round(float(anchor) / 1.6), 999)
            except Exception: pass
        if pris is None:
            result, reason = "UNKNOWN", f"US-pris {usd} USD → SE-Temu ≈ {se_lo}–{se_hi} kr → landad ≈ {landed_lo}–{landed_hi} kr → 2,4× kräver {need_lo}–{need_hi} kr; inget svenskt målpris satt"
        else:
            mult_lo, mult_hi = pris / landed_hi, pris / landed_lo
            be_lo = pris - landed_hi
            if pris >= need_hi and pris >= 300 and be_lo >= 190: result = "PASS"
            elif pris >= need_lo and pris >= 300: result = "BORDERLINE"
            else: result = "FAIL"
            reason = (f"US-pris {usd} USD → SE-Temu ≈ {se_lo}–{se_hi} kr → landad ≈ {landed_lo}–{landed_hi} kr. "
                      f"Vid {pris:.0f} kr: {mult_lo:.1f}–{mult_hi:.1f}× (krav 2,4×), BE-CPA {be_lo:.0f}–{pris - landed_lo:.0f} kr (krav ≥ 190). "
                      f"2,4× kräver {need_lo}–{need_hi} kr" + (f"; ankare {anchor} kr" if anchor else ""))
        g["economics_us"] = {"result": result, "reason": reason, "price_usd": usd, "se_temu_est_sek": [se_lo, se_hi],
                             "landed_est_sek": [landed_lo, landed_hi], "se_price_needed_sek": [need_lo, need_hi],
                             "se_price_used_sek": pris, "anchor_sek": anchor, "kurs_sek_per_usd": list(KURS),
                             "note": "USA-pris som proxy — SE-pris okänt (blockerat). Kalibrering på två punkter; frakt på tunga/skrymmande varor kan överstiga 1,5×."}
        n += 1; andrad = True
    if andrad:
        json.dump(data, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("economics_us satt på", n, "rader")
