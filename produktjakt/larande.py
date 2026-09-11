#!/usr/bin/env python3
"""Lärandelagret — räknar vad kontot faktiskt belönar och skriver LEARNING_STATE.md (V3, steg 0C).

    python3 larande.py                # facit/kampanjer.json × facit/historik-taggar.json × koncept.json × hypoteser.json → LEARNING_STATE.md + larande.json
    python3 larande.py --visa         # bara signaltabellen i terminalen

Bevishierarkin (uppdraget 2026-09-11):
  1. Metas facit vid meningsfull spend (REAL_WINNER / REAL_LOSER ur meta_facit.py)   — väger allt
  2. Axels klick (ja/kanske/nej ur koncept.json)                                      — väger lite, visas bredvid
  3. Gamla modellens poäng (K0–K12) och DNA-hypoteser                                 — är bevis, inte sanning

UNTESTED och INSUFFICIENT_DATA räknas ALDRIG som förlorare: de står i egna kolumner.
Konfidens per signal: HÖG = ≥ 6 dömda och ≥ 75 % åt ett håll · MEDEL = ≥ 3 dömda och ≥ 75 % · LÅG = allt annat.
Auto-delen skrivs om varje körning; allt under '## Egna anteckningar' bevaras (samma mönster som LARDOMAR.md).
"""
import argparse
import datetime
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
KAMPANJER = os.path.join(HERE, "facit", "kampanjer.json")
HISTORIK = os.path.join(HERE, "facit", "historik-taggar.json")
KONCEPT = os.path.join(HERE, "koncept.json")
HYPOTESER = os.path.join(HERE, "hypoteser.json")
UT_MD = os.path.join(HERE, "LEARNING_STATE.md")
UT_JSON = os.path.join(HERE, "larande.json")

DIMENSIONER = ["arketyp", "arketyp_sekundar", "objekt_ute", "objekt_varde_band", "form", "agare_55plus_smahus", "old_way",
               "latent_behov", "deadline_typ", "timing_vid_launch", "kedjegolv_under_vart_pris", "markesankare_band",
               "material_klass", "montering_app", "variant_risk", "flerkop", "prisband"]
KLASSER = ["REAL_WINNER", "REAL_LOSER", "INSUFFICIENT_DATA", "UNTESTED"]
DOM = ["ja", "kanske", "nej"]


def las(p, default=None):
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else default


def ankare_band(kvot):
    if kvot is None:
        return "okänd"
    if kvot < 1.2:
        return "<1,2×"
    if kvot < 1.6:
        return "1,2–1,6×"
    return "≥1,6×"


def norm_prisband(s):
    s = str(s or "").replace(" ", "").replace("kr", "")
    if s.startswith("≥1000") or s.startswith(">=1000"):
        return "≥1000"
    if s in ("<300", "300–499", "500–999", "≥1000"):
        return s
    return s or "okänd"


def bygg_rader():
    """En rad per produkt i kontot med klass + variabler ur historik-taggar. Produkter utan taggrad tas med som 'okänd'."""
    facit = las(KAMPANJER, {"produkter": []})
    historik = {p["nyckel"]: p for p in las(HISTORIK, {"produkter": []}).get("produkter", [])}
    rader = []
    for p in facit["produkter"]:
        h = historik.get(p.get("produkt") or "", {})
        v = {d: h.get(d) for d in DIMENSIONER}
        v["markesankare_band"] = ankare_band(h.get("markesankare_kvot"))
        v["prisband"] = norm_prisband(h.get("prisband"))
        for b in ("objekt_ute", "agare_55plus_smahus", "latent_behov", "kedjegolv_under_vart_pris", "montering_app", "flerkop"):
            v[b] = {True: "ja", False: "nej"}.get(h.get(b), "okänd")
        v["material_klass"] = str(h.get("material_klass")) if h.get("material_klass") is not None else "okänd"
        rader.append({"namn": p["namn"], "nyckel": p.get("produkt"), "klass": p["klass"], "band": p["band"], "lutning": p.get("lutning"),
                      "spend": p["spend"], "kop": p["kop"], "roas": p.get("roas"), "be": p.get("be"), "vinstbidrag": p.get("vinstbidrag"),
                      "launch": p.get("forsta_launch"), "taggad": bool(h), **v})
    return rader, facit.get("datum")


def signaler(rader, koncept):
    """Per dimension × värde: vinnare/förlorare/otillräckligt/otestat + Axels klick."""
    sig = {}
    for r in rader:
        if not r["taggad"]:
            continue
        for d in DIMENSIONER:
            val = r.get(d)
            if val in (None, "", "okänd"):
                continue
            s = sig.setdefault(d, {}).setdefault(str(val), {k: 0 for k in KLASSER} | {k: 0 for k in DOM} | {"vinst_kr": 0.0, "spend": 0.0, "exempel_v": [], "exempel_f": []})
            s[r["klass"]] += 1
            s["spend"] += r["spend"]
            if r["klass"] == "REAL_WINNER":
                s["vinst_kr"] += r.get("vinstbidrag") or 0
                s["exempel_v"].append(r["namn"].split(" (")[0])
            elif r["klass"] == "REAL_LOSER":
                s["vinst_kr"] += r.get("vinstbidrag") or 0
                s["exempel_f"].append(r["namn"].split(" (")[0])
    # Axels klick (koncept.json) på de dimensioner som delar namn: arketyp, form, deadline_typ, prisband
    for k in koncept.values():
        if not k.get("feedback"):
            continue
        dom = sorted(k["feedback"], key=lambda f: f.get("ts") or "")[-1]["dom"]
        t = k.get("taggar") or {}
        for d, val in (("arketyp", k.get("arketyp")), ("form", t.get("form") or k.get("form")), ("deadline_typ", t.get("deadline_typ")), ("prisband", norm_prisband(t.get("prisband")))):
            if val in (None, "", "okänd"):
                continue
            s = sig.setdefault(d, {}).setdefault(str(val), {kk: 0 for kk in KLASSER} | {kk: 0 for kk in DOM} | {"vinst_kr": 0.0, "spend": 0.0, "exempel_v": [], "exempel_f": []})
            s[dom] += 1
    for d in sig:
        for val, s in sig[d].items():
            domda = s["REAL_WINNER"] + s["REAL_LOSER"]
            andel = s["REAL_WINNER"] / domda if domda else None
            if domda >= 6 and (andel >= 0.75 or andel <= 0.25):
                konf = "HÖG"
            elif domda >= 3 and (andel >= 0.75 or andel <= 0.25):
                konf = "MEDEL"
            else:
                konf = "LÅG"
            s.update({"domda": domda, "vinstandel": round(andel, 2) if andel is not None else None, "konfidens": konf,
                      "riktning": ("vinnare" if andel is not None and andel >= 0.6 else "förlorare" if andel is not None and andel <= 0.4 else "blandat" if andel is not None else "otestat")})
    return sig


def tolkning(d, val, s):
    if s["domda"] == 0:
        klick = ", ".join(f"{s[x]} {x}" for x in DOM if s[x])
        return f"otestat i kontot ({s['INSUFFICIENT_DATA']} för tidigt, {s['UNTESTED']} aldrig körda)" + (f"; Axel: {klick}" if klick else "")
    return f"{s['REAL_WINNER']} av {s['domda']} dömda vann" + (f" — t.ex. {', '.join(s['exempel_v'][:3])}" if s["exempel_v"] else "") + (f"; förlorare: {', '.join(s['exempel_f'][:3])}" if s["exempel_f"] else "")


def hypotesbevis(hyp, rader):
    """Räknar vinnare/förlorare bland kontots produkter som uppfyller hypotesens villkor."""
    v = hyp.get("villkor") or {}
    traff = []
    for r in rader:
        if not r["taggad"]:
            continue
        ok = True
        for falt, kravs in v.items():
            if falt == "markesankare_min":
                continue
            rv = r.get(falt)
            if isinstance(rv, bool):
                rv = "ja" if rv else "nej"
            if isinstance(kravs, bool):
                kravs = "ja" if kravs else "nej"
            if isinstance(kravs, list):
                if str(rv) not in [str(x) for x in kravs] and not (falt == "arketyp" and str(r.get("arketyp_sekundar")) in [str(x) for x in kravs]):
                    ok = False; break
            elif str(rv) != str(kravs):
                ok = False; break
        if ok:
            traff.append(r)
    vin = [r for r in traff if r["klass"] == "REAL_WINNER"]
    forl = [r for r in traff if r["klass"] == "REAL_LOSER"]
    otill = [r for r in traff if r["klass"] in ("INSUFFICIENT_DATA", "UNTESTED")]
    if len(vin) >= 3 and len(forl) <= 1:
        status = "stärkt"
    elif len(forl) >= 2 and len(vin) == 0:
        status = "försvagad"
    elif not traff:
        status = "aktiv (inget test än)"
    else:
        status = "aktiv"
    return {"vinnare": [r["namn"].split(" (")[0] for r in vin], "forlorare": [r["namn"].split(" (")[0] for r in forl], "otillrackligt": len(otill), "status": status}


def prediktion_vs_verklighet(koncept):
    ut = []
    for k in koncept.values():
        if not k.get("launch"):
            continue
        lev = k.get("leveranser") or []
        pred = lev[-1] if lev else {}
        fb = "/".join(f["dom"] for f in k.get("feedback") or []) or "—"
        m = k.get("meta") or {}
        ut.append({"id": k["id"], "namn": k["namn"], "arketyp": k.get("arketyp"),
                   "prediktion": pred.get("dom") or pred.get("status") or ("levererad" if lev else "ej researchad"),
                   "poang": pred.get("poang"), "axel": fb, "klass": m.get("klass") or "—", "band": m.get("band") or "—",
                   "spend": m.get("spend") or 0, "kop": m.get("kop") or 0, "roas": m.get("roas"),
                   "kommentar": pred.get("utfall_prediktion_vs_verklighet") or ""})
    return sorted(ut, key=lambda x: -x["spend"])


def skriv(rader, sig, koncept, hyp, datum, facitdatum):
    egna = "## Egna anteckningar (rutinen skriver här, en rad per körning)\n"
    if os.path.exists(UT_MD):
        txt = open(UT_MD, encoding="utf-8").read()
        if "<!-- auto:end -->" in txt:
            egna = txt.split("<!-- auto:end -->", 1)[1].lstrip("\n")
    n = {k: sum(1 for r in rader if r["klass"] == k) for k in KLASSER}
    vin = [r for r in rader if r["klass"] == "REAL_WINNER"]
    forl = [r for r in rader if r["klass"] == "REAL_LOSER"]
    L = ["# LEARNING STATE — vad Bäverbutikens konto faktiskt belönar", "",
         "Läses av `/produktjakt` FÖRE varje sökning. Auto-delen skrivs av `larande.py`; skriv aldrig i den för hand.",
         "Bevishierarki: Meta vid meningsfull spend > Axels klick > gamla poängkortet/DNA. UNTESTED tränas aldrig som förlorare.",
         "", "<!-- auto:start -->",
         f"Uppdaterad {datum}. Metas facit hämtat {facitdatum}: **{n['REAL_WINNER']} REAL WINNER · {n['REAL_LOSER']} REAL LOSER · {n['INSUFFICIENT_DATA']} INSUFFICIENT DATA · {n['UNTESTED']} UNTESTED** (per produkt, kampanjer ihopslagna). "
         f"{sum(1 for r in rader if not r['taggad'])} produkter saknar taggrad i `facit/historik-taggar.json` och räknas inte i signalerna.", ""]

    def profil(r):
        return (f"{r['arketyp'] or '—'} · objekt {r.get('objekt_ute')}/ute, {r.get('objekt_varde_band') or '—'} · form {r.get('form') or '—'} · old way {r.get('old_way') or '—'} · "
                f"deadline {r.get('deadline_typ') or '—'} ({r.get('timing_vid_launch') or '—'}) · golv under {r.get('kedjegolv_under_vart_pris')} · ankare {r.get('markesankare_band')} · "
                f"material {r.get('material_klass')} · variant {r.get('variant_risk') or '—'} · flerköp {r.get('flerkop')} · {r.get('prisband')}")

    L += ["## REAL WINNER PATTERNS", "", "| Produkt | Spend | Köp | ROAS/BE | Vinstbidrag | Profil |", "|---|---:|---:|---|---:|---|"]
    for r in sorted(vin, key=lambda r: -(r.get("vinstbidrag") or 0)):
        L.append(f"| {r['namn'][:40]} | {r['spend']:.0f} | {r['kop']} | {r['roas']}/{r['be']} | {r['vinstbidrag'] if r['vinstbidrag'] is not None else '—'} | {profil(r) if r['taggad'] else 'otaggad'} |")
    gem = []
    for d in DIMENSIONER:
        vals = [str(r.get(d)) for r in vin if r["taggad"] and r.get(d) not in (None, "", "okänd")]
        if len(vals) >= 4:
            top = max(set(vals), key=vals.count)
            if vals.count(top) / len(vals) >= 0.7:
                gem.append(f"{d} = **{top}** ({vals.count(top)} av {len(vals)})")
    L += ["", "**Gemensamt för ≥ 70 % av vinnarna:** " + ("; ".join(gem) if gem else "—"), ""]

    L += ["## REAL LOSER PATTERNS", "", "| Produkt | Spend | Köp | ROAS/BE | Vinstbidrag | Profil |", "|---|---:|---:|---|---:|---|"]
    for r in sorted(forl, key=lambda r: (r.get("vinstbidrag") or 0)):
        L.append(f"| {r['namn'][:40]} | {r['spend']:.0f} | {r['kop']} | {r['roas']}/{r['be'] or '—'} | {r['vinstbidrag'] if r['vinstbidrag'] is not None else '—'} | {profil(r) if r['taggad'] else 'otaggad'} |")
    gemf = []
    for d in DIMENSIONER:
        vals = [str(r.get(d)) for r in forl if r["taggad"] and r.get(d) not in (None, "", "okänd")]
        if len(vals) >= 4:
            top = max(set(vals), key=vals.count)
            if vals.count(top) / len(vals) >= 0.7:
                gemf.append(f"{d} = **{top}** ({vals.count(top)} av {len(vals)})")
    L += ["", "**Gemensamt för ≥ 70 % av förlorarna:** " + ("; ".join(gemf) if gemf else "—"), ""]

    # Signaler
    starka, svaga = [], []
    for d in DIMENSIONER:
        for val, s in sorted(sig.get(d, {}).items(), key=lambda x: -x[1]["domda"]):
            rad = (d, val, s)
            (starka if s["konfidens"] in ("HÖG", "MEDEL") else svaga).append(rad)
    for rubrik, lista in (("STRONG SIGNALS (konfidens HÖG/MEDEL)", starka), ("WEAK SIGNALS (LÅG — blandat eller för få dömda)", svaga)):
        L += [f"## {rubrik}", "", "| Signal | Vinnare | Förlorare | Otillr. | Otestat | Axel ja/kanske/nej | Konfidens | Tolkning |", "|---|---:|---:|---:|---:|---|---|---|"]
        for d, val, s in lista:
            if s["domda"] == 0 and not any(s[x] for x in DOM) and s["INSUFFICIENT_DATA"] + s["UNTESTED"] == 0:
                continue
            L.append(f"| {d} = {val} | {s['REAL_WINNER']} | {s['REAL_LOSER']} | {s['INSUFFICIENT_DATA']} | {s['UNTESTED']} | {s['ja']}/{s['kanske']}/{s['nej']} | {s['konfidens']} ({s['riktning']}) | {tolkning(d, val, s)[:140]} |")
        L.append("")

    L += ["## DISPROVEN ASSUMPTIONS", ""]
    for m in hyp.get("motbevisade", []):
        L.append(f"- ~~{m['antagande']}~~ — {m['bevis']} ({m['datum']})")
    L.append("")

    L += ["## ACTIVE HYPOTHESES", "", "| Id | Hypotes | Status | Vinnare | Förlorare | Otillr. | Så testas den |", "|---|---|---|---|---|---:|---|"]
    hyp_ut = []
    for h in hyp.get("hypoteser", []):
        b = hypotesbevis(h, rader)
        hyp_ut.append({"id": h["id"], "text": h["text"], **b})
        L.append(f"| {h['id']} | {h['text'][:110]} | **{b['status']}** | {', '.join(b['vinnare'][:4]) or '—'} | {', '.join(b['forlorare'][:4]) or '—'} | {b['otillrackligt']} | {h.get('test_sokning', '')[:110]} |")
    L.append("")

    L += ["## ARCHETYPE PERFORMANCE", "", "| Arketyp | Vinnare | Förlorare | Otillr. | Otestat | Spend | Vinstbidrag | Researchkoncept (lev./ja/kanske/nej/launch) |", "|---|---:|---:|---:|---:|---:|---:|---|"]
    for ark in ["A_AGARE_FRIKTION", "B_SKYDDA_DYRT", "C_LAGA_ISTALLET", "D_SNABBARE_METOD", "E_VADER_SASONG", "F_HOBBY_IDENTITET", "G_Q4_GAVA", "H_VISUELL_NYHET", "I_FLERKOP", "X_UTANFOR"]:
        s = sig.get("arketyp", {}).get(ark, {k: 0 for k in KLASSER} | {"spend": 0.0, "vinst_kr": 0.0})
        ks = [k for k in koncept.values() if k.get("arketyp") == ark]
        lev = sum(1 for k in ks if any(l.get("levererad") for l in k.get("leveranser") or []))
        dom = {x: sum(1 for k in ks if k.get("feedback") and sorted(k["feedback"], key=lambda f: f.get("ts") or "")[-1]["dom"] == x) for x in DOM}
        lau = sum(1 for k in ks if k.get("launch"))
        L.append(f"| {ark} | {s['REAL_WINNER']} | {s['REAL_LOSER']} | {s['INSUFFICIENT_DATA']} | {s['UNTESTED']} | {s['spend']:.0f} | {s['vinst_kr']:.0f} | {lev}/{dom['ja']}/{dom['kanske']}/{dom['nej']}/{lau} |")
    L.append("")

    pv = prediktion_vs_verklighet(koncept)
    L += ["## PREDICTION VS REALITY (researchade koncept som launchats)", "", "| Koncept | Arketyp | Researchen sa | Poäng | Axel | Meta-klass | Band | Spend | Köp | ROAS | Lärdom |", "|---|---|---|---:|---|---|---|---:|---:|---:|---|"]
    for p in pv:
        L.append(f"| {p['namn'][:36]} | {p['arketyp'] or '—'} | {p['prediktion']} | {p['poang'] if p['poang'] is not None else '—'} | {p['axel']} | {p['klass']} | {p['band']} | {p['spend']:.0f} | {p['kop']} | {p['roas'] or '—'} | {p['kommentar'][:150]} |")
    ratt = sum(1 for p in pv if p["klass"] == "REAL_WINNER" and str(p["prediktion"]).lower() in ("test now", "launch", "launch-kandidat", "offert"))
    fel = sum(1 for p in pv if p["klass"] == "REAL_WINNER" and str(p["prediktion"]).lower() in ("refuted", "kill (implicit)", "kill"))
    L += ["", f"Dömda launcher: {sum(1 for p in pv if p['klass'] in ('REAL_WINNER', 'REAL_LOSER'))} · researchen rätt på {ratt} vinnare, fel (refuterade/killade vinnare) på {fel}. "
          "Vinnare som modellen refuterade väger tyngst: de säger vilken regel som är fel.", ""]

    def korstabell(rubrik, dim):
        L.extend([f"## {rubrik}", "", "| Värde | Vinnare | Förlorare | Otillr. | Otestat | Exempel vinnare | Exempel förlorare |", "|---|---:|---:|---:|---:|---|---|"])
        for val, s in sorted(sig.get(dim, {}).items(), key=lambda x: -(x[1]["REAL_WINNER"] + x[1]["REAL_LOSER"])):
            L.append(f"| {dim} = {val} | {s['REAL_WINNER']} | {s['REAL_LOSER']} | {s['INSUFFICIENT_DATA']} | {s['UNTESTED']} | {', '.join(s['exempel_v'][:3])} | {', '.join(s['exempel_f'][:3])} |")
        L.append("")

    korstabell("SEASONAL LEARNINGS — timing vid launch", "timing_vid_launch")
    korstabell("SEASONAL LEARNINGS — deadline-typ", "deadline_typ")
    korstabell("CREATIVE LEARNINGS — materialklass (0 = katalogbild med text … 3 = video i bruk ≤ 3 s + hero i kontext)", "material_klass")
    L += ["Ur `docs/temu-vinnar-dna.md` (400 annonser, bevisat inom vinnarna): leverantörens råa video/foto var vinnaren i 7 av 9; captions 2,34 mot 1,11 utan; produkt före sekund 3; testimonial-kort, gåva i augusti, mekanismförklaring och curiosity förlorade.", ""]
    korstabell("MARKETPLACE LEARNINGS — kedjegolv under vårt pris", "kedjegolv_under_vart_pris")
    korstabell("MARKETPLACE LEARNINGS — märkesankare", "markesankare_band")
    L += ["<!-- auto:end -->", "", egna.rstrip("\n"), ""]
    open(UT_MD, "w", encoding="utf-8").write("\n".join(L))
    json.dump({"datum": datum, "facit_datum": facitdatum, "antal": n, "signaler": sig, "hypoteser": hyp_ut, "prediktion_vs_verklighet": pv},
              open(UT_JSON, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    return n, starka


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--visa", action="store_true")
    a = ap.parse_args()
    rader, facitdatum = bygg_rader()
    koncept = las(KONCEPT, {"koncept": {}}).get("koncept", {})
    hyp = las(HYPOTESER, {"hypoteser": [], "motbevisade": []})
    sig = signaler(rader, koncept)
    if a.visa:
        for d in DIMENSIONER:
            for val, s in sorted(sig.get(d, {}).items(), key=lambda x: -x[1]["domda"]):
                if s["domda"]:
                    print(f"  {d:28} {val:22} V {s['REAL_WINNER']:2} F {s['REAL_LOSER']:2} otill {s['INSUFFICIENT_DATA']:2} otest {s['UNTESTED']:2}  {s['konfidens']:5} {s['riktning']}")
        return
    n, starka = skriv(rader, sig, koncept, hyp, datetime.date.today().isoformat(), facitdatum)
    print(f"LEARNING_STATE.md: {n} · {len(starka)} starka signaler · {len(hyp.get('hypoteser', []))} hypoteser · {len(hyp.get('motbevisade', []))} motbevisade")


if __name__ == "__main__":
    main()
