#!/usr/bin/env python3
"""Metas facit — det enda som får överrösta modellen (V3, steg 0B).

    python3 meta_facit.py hamta            # alla kampanjer i MagiBorsten, livstid → facit/snapshots/<datum>.json + facit/kampanjer.json + facit/FACIT.md
    python3 meta_facit.py visa             # tabellen i terminalen (ur facit/kampanjer.json, inget nätanrop)
    python3 meta_facit.py utfall           # skriver om utfall.json (launchade forskningsprodukter) ur facit/kampanjer.json

Varför filen finns: den gamla rutinen läste kontot för hand varje morgon och skrev utfall.json ur minnet av
vad den såg. V3 hämtar ALLT, varje dag, med samma fält, och sparar en snapshot per dag så att
"två avläsningar ≥ 3 dygn isär" (ANALYSMETOD steg 2b) går att räkna maskinellt.

Konfidensbanden räknas mot produktens EGEN break-even-CPA (AOV ÷ BE-ROAS), aldrig mot en universell
spendgräns — 2 000 kr är 3 × BE-CPA för ett 299-kronorshölje men 1 × BE-CPA för ett taköverdrag på 1 129.
Golvet 300 kr / 3 köp (ANALYSMETOD steg 2) gäller alltid som absolut minimum.

    UNTESTED        spend < 300 kr — kampanjen har aldrig kommit igång
    TOO_EARLY       < 3 köp och spend < 2 × BE-CPA
    EARLY_SIGNAL    ≥ 3 köp men spend < 3 × BE-CPA, eller ≤ 2 köp med spend ≥ 2 × BE-CPA (negativ tidig signal)
    MEANINGFUL      spend ≥ 3 × BE-CPA och ≥ 5 köp, eller spend ≥ 5 × BE-CPA med ≤ 2 köp
    HIGH            spend ≥ 8 × BE-CPA och ≥ 10 köp, eller spend ≥ 10 000 kr och ≥ 20 köp
    (saknas BE-CPA: MEANINGFUL vid ≥ 2 000 kr och ≥ 5 köp, HIGH vid ≥ 8 000 kr och ≥ 15 köp)

Klass: REAL_WINNER = MEANINGFUL/HIGH och ROAS ≥ BE · REAL_LOSER = MEANINGFUL/HIGH och ROAS < BE ·
INSUFFICIENT_DATA = TOO_EARLY/EARLY_SIGNAL (med lutning positiv/negativ) · UNTESTED. En dom är
"bekräftad" först när en snapshot ≥ 3 dygn tidigare finns och säger samma sak; annars "preliminär".
UNTESTED tränas ALDRIG som förlorare (larande.py).

Fältnamnen är Graph-API:ets (spend, actions[omni_purchase], purchase_roas, cost_per_action_type) —
inte MCP:ns (amount_spent …). Verifierat 2026-09-11 mot act_1867947880635861.
Kräver META_ACCESS_TOKEN. Går genom HTTPS_PROXY automatiskt (urllib läser env).
"""
import argparse
import datetime
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
FACIT = os.path.join(HERE, "facit")
SNAP = os.path.join(FACIT, "snapshots")
KAMPANJER = os.path.join(FACIT, "kampanjer.json")
FACIT_MD = os.path.join(FACIT, "FACIT.md")
HISTORIK = os.path.join(FACIT, "historik-taggar.json")
BE_OVERRIDE = os.path.join(FACIT, "be-override.json")
UTFALL = os.path.join(HERE, "utfall.json")
KONTO = "1867947880635861"          # MagiBorsten = Bäverbutiken. ALDRIG 915422744950975 (OPS) eller 1346450049878358 (Grillkliniken).
API = "https://graph.facebook.com/v23.0"
GOLV_SPEND, GOLV_KOP = 300, 3       # ANALYSMETOD steg 2 — ingen dom under detta, någonsin
SNAPSHOT_DYGN = 3                   # ANALYSMETOD steg 2b


def idag():
    return datetime.date.today().isoformat()


# ------------------------------------------------------------------ Meta
def _get(path, forsok=4, **params):
    tok = os.environ.get("META_ACCESS_TOKEN")
    if not tok:
        raise SystemExit("META_ACCESS_TOKEN saknas i miljön.")
    params["access_token"] = tok
    url = f"{API}/{path}?{urllib.parse.urlencode(params)}"
    for i in range(forsok):
        try:
            with urllib.request.urlopen(url, timeout=120) as r:
                d = json.loads(r.read().decode())
            if d.get("error"):
                raise RuntimeError(d["error"].get("message"))
            return d
        except Exception as e:
            if i == forsok - 1:
                raise
            print(f"  Meta: {str(e)[:80]} — väntar {30 * (i + 1)} s")
            time.sleep(30 * (i + 1))


def _alla(path, **params):
    ut, d = [], _get(path, **params)
    ut += d.get("data", [])
    while d.get("paging", {}).get("next"):
        time.sleep(2)
        with urllib.request.urlopen(d["paging"]["next"], timeout=120) as r:
            d = json.loads(r.read().decode())
        if d.get("error"):
            raise RuntimeError(d["error"].get("message"))
        ut += d.get("data", [])
    return ut


def hamta_konto():
    """Alla kampanjer (namn, status, skapad) + livstidsinsikter per kampanj. Två anrop, båda pagade."""
    kamp = _alla(f"act_{KONTO}/campaigns", fields="id,name,status,effective_status,created_time,daily_budget,lifetime_budget", limit=100)
    time.sleep(2)
    ins = _alla(f"act_{KONTO}/insights", level="campaign", date_preset="maximum", limit=100,
                fields="campaign_id,campaign_name,spend,impressions,clicks,ctr,cpc,cpm,frequency,actions,action_values,purchase_roas,cost_per_action_type,date_start,date_stop")
    per_id = {i["campaign_id"]: i for i in ins}
    rader = []
    for k in kamp:
        i = per_id.get(k["id"], {})
        rader.append({"id": k["id"], "namn": k["name"], "status": k.get("status"), "effective_status": k.get("effective_status"),
                      "skapad": (k.get("created_time") or "")[:10], "daily_budget": k.get("daily_budget"),
                      **_las_insikt(i)})
    return rader


def _akt(lista, typ):
    for a in lista or []:
        if a.get("action_type") == typ:
            try:
                return float(a.get("value"))
            except (TypeError, ValueError):
                return None
    return None


def _las_insikt(i):
    spend = float(i.get("spend") or 0)
    kop = int(_akt(i.get("actions"), "omni_purchase") or 0)
    roas = _akt(i.get("purchase_roas"), "omni_purchase")
    cpa = _akt(i.get("cost_per_action_type"), "omni_purchase")
    varde = _akt(i.get("action_values"), "omni_purchase")
    # ANALYSMETOD steg 1: värdet ur action_values är opålitligt (100× för lågt på 5 av 8 rader 2026-08-05).
    # Intäkt = spend × ROAS är facit; värdefältet sparas bara för korskoll.
    intakt = round(spend * roas, 2) if roas else 0.0
    varde_ok = None
    if varde and intakt:
        varde_ok = abs(varde - intakt) / intakt <= 0.05
    return {"spend": round(spend, 2), "kop": kop, "roas": round(roas, 4) if roas else None,
            "cpa": round(cpa, 2) if cpa else (round(spend / kop, 2) if kop else None),
            "intakt": intakt, "action_value_ok": varde_ok,
            "impressions": int(i.get("impressions") or 0), "clicks": int(i.get("clicks") or 0),
            "ctr": float(i.get("ctr") or 0) or None, "cpc": float(i.get("cpc") or 0) or None,
            "cpm": float(i.get("cpm") or 0) or None, "frequency": float(i.get("frequency") or 0) or None,
            "date_start": i.get("date_start"), "date_stop": i.get("date_stop")}


# ------------------------------------------------------------ klassning
def be_ur_namn(namn):
    m = re.search(r"BE\s*ROAS\s*(\d+[.,]\d+)", namn, re.I)
    return float(m.group(1).replace(",", ".")) if m else None


def launch_ur_namn(namn):
    m = re.search(r"Launch\s*(\d{4}-\d{2}-\d{2})", namn, re.I)
    return m.group(1) if m else None


def las_json(p, default):
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else default


def produkt_for(namn, historik):
    """Längsta matchande kampanj_monster vinner. Ingen träff → None (kampanjen står ändå med i facit)."""
    n = namn.lower()
    basta, blen = None, 0
    for p in historik.get("produkter", []):
        for m in p.get("kampanj_monster", []):
            if m and m.lower() in n and len(m) > blen:
                basta, blen = p, len(m)
    return basta


def band(spend, kop, be_cpa):
    if spend < GOLV_SPEND:
        return "UNTESTED"
    if be_cpa:
        if (spend >= 8 * be_cpa and kop >= 10) or (spend >= 10000 and kop >= 20):
            return "HIGH"
        # negativ MEANINGFUL kräver ≥ 1 500 kr utöver 5 × BE-CPA — en BE-CPA räknad på listpriset kan vara liten
        if (spend >= 3 * be_cpa and kop >= 5) or (spend >= max(5 * be_cpa, 1500) and kop <= 2):
            return "MEANINGFUL"
        if kop >= GOLV_KOP or spend >= 2 * be_cpa:
            return "EARLY_SIGNAL"
        return "TOO_EARLY"
    # BE okänd — bara den absoluta grinden
    if spend >= 8000 and kop >= 15:
        return "HIGH"
    if spend >= 2000 and kop >= 5:
        return "MEANINGFUL"
    if spend >= 2000 and kop <= 2:
        return "MEANINGFUL"
    if kop >= GOLV_KOP:
        return "EARLY_SIGNAL"
    return "TOO_EARLY"


def klassa(r, be, pris=None):
    """Returnerar (klass, lutning, be_cpa, vinstbidrag, aov, band).

    AOV ur Meta (intäkt ÷ köp) bara vid ≥ 3 köp — ett enda köp ger ett värde som inte går att lita på
    (Stegstödet 1 189 kr visade AOV 238 på ett köp). Under 3 köp används listpriset ur historik-taggar."""
    spend, kop, roas = r["spend"], r["kop"], r["roas"]
    aov = round(r["intakt"] / kop, 2) if kop >= GOLV_KOP and r["intakt"] else None
    grund = aov or (pris if kop < GOLV_KOP else None)
    be_cpa = round(grund / be, 2) if (grund and be) else None
    b = band(spend, kop, be_cpa)
    over_be = (roas is not None and be is not None and roas >= be)
    marginell = (roas is not None and be is not None and abs(roas - be) / be < 0.05)
    vinst = round((be_cpa - r["cpa"]) * kop, 2) if (be_cpa and r["cpa"] and kop) else None
    if b == "UNTESTED":
        return "UNTESTED", None, be_cpa, vinst, aov, b
    if b in ("MEANINGFUL", "HIGH"):
        if be is None:
            # BE okänd: ROAS < 1,49 (lägsta kända BE i kontot) är förlust oavsett; ≥ 1,49 går inte att döma
            if roas is not None and roas < 1.49 or kop == 0:
                return "REAL_LOSER", "negativ", be_cpa, vinst, aov, b
            return "INSUFFICIENT_DATA", "be okänd", be_cpa, vinst, aov, b
        lut = "positiv" if over_be else "negativ"
        if marginell:
            lut += " (marginell, < 5 % från BE)"
        return ("REAL_WINNER" if over_be else "REAL_LOSER"), lut, be_cpa, vinst, aov, b
    lutning = "positiv" if over_be else ("negativ" if (roas is not None or kop == 0) else None)
    return "INSUFFICIENT_DATA", lutning, be_cpa, vinst, aov, b


def bekraftelse(kid, klass, snapshots_before):
    """Bekräftad = en snapshot ≥ SNAPSHOT_DYGN dygn tidigare gav samma klass."""
    for datum, snap in snapshots_before:
        rad = snap.get(kid)
        if rad and rad.get("klass") == klass and klass in ("REAL_WINNER", "REAL_LOSER"):
            return f"bekräftad (snapshot {datum})"
    return "preliminär"


def bygg(rader, datum):
    historik = las_json(HISTORIK, {"produkter": []})
    override = las_json(BE_OVERRIDE, {})
    # tidigare snapshots ≥ 3 dygn gamla
    aldre = []
    if os.path.isdir(SNAP):
        for f in sorted(os.listdir(SNAP)):
            d = f[:-5]
            try:
                if (datetime.date.fromisoformat(datum) - datetime.date.fromisoformat(d)).days >= SNAPSHOT_DYGN:
                    aldre.append((d, las_json(os.path.join(SNAP, f), {}).get("kampanjer", {})))
            except ValueError:
                continue
    ut = []
    for r in rader:
        p = produkt_for(r["namn"], historik)
        be = be_ur_namn(r["namn"]) or override.get(r["namn"]) or (p or {}).get("be_roas")
        klass, lutning, be_cpa, vinst, aov, b = klassa(r, be, (p or {}).get("pris_sek"))
        ut.append({**r, "be": be, "be_kalla": "kampanjnamn" if be_ur_namn(r["namn"]) else ("override" if override.get(r["namn"]) else ("historik" if p and p.get("be_roas") else None)),
                   "aov": aov, "be_cpa": be_cpa, "vinstbidrag": vinst, "band": b, "klass": klass, "lutning": lutning,
                   "bekraftelse": bekraftelse(r["id"], klass, aldre),
                   "launch": launch_ur_namn(r["namn"]) or r["skapad"],
                   "produkt": (p or {}).get("nyckel"), "produkt_namn": (p or {}).get("namn"),
                   "arketyp": (p or {}).get("arketyp"), "pris": (p or {}).get("pris_sek")})
    ut.sort(key=lambda x: -x["spend"])
    return ut


def per_produkt(kampanjer):
    """Slår ihop en produkts alla kampanjer (motorhöljet har fem). Klass räknas om på summan."""
    grupper = {}
    for k in kampanjer:
        nyckel = k["produkt"] or f"__{k['id']}"
        g = grupper.setdefault(nyckel, {"produkt": k["produkt"], "namn": k["produkt_namn"] or re.sub(r"\s*\|.*$", "", k["namn"]),
                                        "arketyp": k["arketyp"], "pris": k.get("pris"), "kampanjer": [], "spend": 0.0, "kop": 0, "intakt": 0.0,
                                        "be": None, "forsta_launch": None})
        g["kampanjer"].append(k["id"])
        g["spend"] += k["spend"]; g["kop"] += k["kop"]; g["intakt"] += k["intakt"]
        g["be"] = g["be"] or k["be"]
        if k["launch"] and (not g["forsta_launch"] or k["launch"] < g["forsta_launch"]):
            g["forsta_launch"] = k["launch"]
    for g in grupper.values():
        g["spend"] = round(g["spend"], 2); g["intakt"] = round(g["intakt"], 2)
        g["roas"] = round(g["intakt"] / g["spend"], 4) if g["spend"] else None
        g["cpa"] = round(g["spend"] / g["kop"], 2) if g["kop"] else None
        r = {"spend": g["spend"], "kop": g["kop"], "roas": g["roas"], "cpa": g["cpa"], "intakt": g["intakt"]}
        klass, lutning, be_cpa, vinst, aov, b = klassa(r, g["be"], g.get("pris"))
        g.update({"klass": klass, "lutning": lutning, "be_cpa": be_cpa, "vinstbidrag": vinst, "aov": aov, "band": b})
    return sorted(grupper.values(), key=lambda x: -x["spend"])


# ------------------------------------------------------------- utdata
def skriv_md(datum, kampanjer, produkter):
    n = {}
    for p in produkter:
        n[p["klass"]] = n.get(p["klass"], 0) + 1
    rader = [f"# Metas facit — MagiBorsten `{KONTO}`, livstid, hämtat {datum}", "",
             "Skrivs av `meta_facit.py hamta`. Ändra aldrig för hand — ändra `facit/historik-taggar.json` (produktkoppling, arketyp) eller `facit/be-override.json` (BE för kampanjer utan BE i namnet) och kör om.",
             "", f"**{len(kampanjer)} kampanjer → {len(produkter)} produkter.** " + " · ".join(f"{k}: {v}" for k, v in sorted(n.items())), "",
             "Band relativt produktens egen BE-CPA (AOV ÷ BE-ROAS): UNTESTED < 300 kr · TOO_EARLY · EARLY_SIGNAL · MEANINGFUL ≥ 3× BE-CPA & ≥ 5 köp · HIGH ≥ 8× BE-CPA & ≥ 10 köp. "
             "Vinstbidrag = (BE-CPA − CPA) × köp. Intäkt = spend × ROAS (action_values är opålitligt, ANALYSMETOD steg 1).", "",
             "## Per produkt (kampanjer ihopslagna)", "",
             "| Klass | Band | Produkt | Arketyp | Spend | Köp | CPA | ROAS | BE | BE-CPA | Vinstbidrag | Första launch |",
             "|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|"]
    for p in produkter:
        rader.append(f"| {p['klass']}{(' (' + p['lutning'] + ')') if p['klass'] == 'INSUFFICIENT_DATA' and p['lutning'] else ''} | {p['band']} | {p['namn'][:48]} | {p['arketyp'] or '—'} | {p['spend']:.0f} | {p['kop']} | "
                     f"{p['cpa'] or '—'} | {p['roas'] or '—'} | {p['be'] or '—'} | {p['be_cpa'] or '—'} | {p['vinstbidrag'] if p['vinstbidrag'] is not None else '—'} | {p['forsta_launch'] or '—'} |")
    rader += ["", "## Per kampanj", "", "| Klass | Bekräftelse | Kampanj | Status | Spend | Köp | CPA | ROAS | BE | Produkt |", "|---|---|---|---|---:|---:|---:|---:|---:|---|"]
    for k in kampanjer:
        rader.append(f"| {k['klass']} | {k['bekraftelse']} | {k['namn'][:70]} | {k['effective_status']} | {k['spend']:.0f} | {k['kop']} | {k['cpa'] or '—'} | {k['roas'] or '—'} | {k['be'] or '—'} | {k['produkt'] or '—'} |")
    okopplade = [k for k in kampanjer if not k["produkt"] and k["spend"] >= GOLV_SPEND]
    if okopplade:
        rader += ["", f"## Kampanjer med spend utan produktkoppling ({len(okopplade)}) — lägg in `kampanj_monster` i historik-taggar.json", ""]
        rader += [f"- {k['namn']} — {k['spend']:.0f} kr / {k['kop']} köp" for k in okopplade]
    open(FACIT_MD, "w", encoding="utf-8").write("\n".join(rader) + "\n")


def hamta():
    datum = idag()
    os.makedirs(SNAP, exist_ok=True)
    print(f"hämtar act_{KONTO} …")
    rader = hamta_konto()
    kampanjer = bygg(rader, datum)
    produkter = per_produkt(kampanjer)
    snap = {"datum": datum, "hamtad": datetime.datetime.utcnow().isoformat(timespec="seconds") + "Z",
            "kampanjer": {k["id"]: {"namn": k["namn"], "spend": k["spend"], "kop": k["kop"], "roas": k["roas"], "klass": k["klass"], "status": k["effective_status"]} for k in kampanjer}}
    json.dump(snap, open(os.path.join(SNAP, f"{datum}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump({"datum": datum, "konto": KONTO, "kampanjer": kampanjer, "produkter": produkter},
              open(KAMPANJER, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    skriv_md(datum, kampanjer, produkter)
    visa()
    print(f"\n→ {KAMPANJER}, {FACIT_MD}, snapshot {datum}")


def visa():
    d = las_json(KAMPANJER, None)
    if not d:
        print("inget facit hämtat än — kör `meta_facit.py hamta`"); return
    print(f"facit {d['datum']}: {len(d['kampanjer'])} kampanjer, {len(d['produkter'])} produkter")
    for p in d["produkter"]:
        if p["spend"] < GOLV_SPEND:
            continue
        print(f"  {p['klass']:17} {p['band']:12} {p['spend']:>8.0f} kr {p['kop']:>4} köp  ROAS {str(p['roas'] or '—'):>6}  BE {str(p['be'] or '—'):>5}  {p['namn'][:50]}")


# --------------------------------------------------------- utfall.json
def utfall():
    """Uppdaterar utfall.json för kampanjer som hör till en forskningsprodukt (koncept). Bakåtkompatibel med
    feedback.py (fälten utfall/taggar/snapshots) men lägger till band/klass/be_cpa/vinstbidrag."""
    d = las_json(KAMPANJER, None)
    if not d:
        raise SystemExit("kör `meta_facit.py hamta` först")
    u = las_json(UTFALL, {"utfall": {}})
    u.setdefault("utfall", {})
    for k in d["kampanjer"]:
        rad = u["utfall"].get(k["namn"])
        if not rad:
            continue
        gammal = rad.get("utfall")
        rad.update({"spend": k["spend"], "kop": k["kop"], "roas": k["roas"], "be": k["be"] or rad.get("be"),
                    "cpa": k["cpa"], "aov": k["aov"], "be_cpa": k["be_cpa"], "vinstbidrag": k["vinstbidrag"],
                    "band": k["band"], "klass": k["klass"], "lutning": k["lutning"], "bekraftelse": k["bekraftelse"],
                    "kampanj_id": k["id"], "status": k["effective_status"], "last": d["datum"]})
        snaps = rad.setdefault("snapshots", [])
        if not any(s.get("datum") == d["datum"] for s in snaps):
            snaps.append({"datum": d["datum"], "spend": k["spend"], "kop": k["kop"], "roas": k["roas"], "status": k["effective_status"]})
        # feedback.py:s vikter: launchad = 2 ja, >=BE = 3 ja, <BE = 3 nej, svalt = 0 — bara bekräftade domar får väga 3
        if k["klass"] == "REAL_WINNER" and k["bekraftelse"].startswith("bekräftad"):
            rad["utfall"] = ">=BE"
        elif k["klass"] == "REAL_LOSER" and k["bekraftelse"].startswith("bekräftad"):
            rad["utfall"] = "<BE"
        elif k["klass"] in ("REAL_WINNER", "REAL_LOSER"):
            rad["utfall"] = "launchad"
            rad["preliminart"] = f"{'>=BE' if k['klass'] == 'REAL_WINNER' else '<BE'} ({k['band']}, {k['spend']:.0f} kr, ROAS {k['roas']} — bekräftas vid snapshot ≥ {SNAPSHOT_DYGN} dygn senare)"
        else:
            rad["utfall"] = gammal or "launchad"
    u["last"] = d["datum"]
    u["_kommentar"] = ("Metas facit per launchad forskningsprodukt. Skrivs av meta_facit.py utfall ur facit/kampanjer.json. "
                       "utfall: launchad (2 ja) / >=BE (3 ja, bekräftad) / <BE (3 nej, bekräftad) / svalt (0). band+klass är V3-konfidensen; "
                       "en dom väger 3 först när två snapshots ≥ 3 dygn isär säger samma sak (ANALYSMETOD 2b).")
    json.dump(u, open(UTFALL, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"utfall.json: {len(u['utfall'])} launchade forskningsprodukter uppdaterade ({d['datum']})")
    for namn, r in u["utfall"].items():
        print(f"  {r.get('klass', '?'):17} {r.get('band', '?'):12} {r.get('utfall'):8} {r.get('spend', 0):>7.0f} kr {r.get('kop', 0):>3} köp  {namn[:55]}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=("hamta", "visa", "utfall"))
    a = ap.parse_args()
    {"hamta": hamta, "visa": visa, "utfall": utfall}[a.cmd]()


if __name__ == "__main__":
    main()
