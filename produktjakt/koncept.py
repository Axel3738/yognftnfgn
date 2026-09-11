#!/usr/bin/env python3
"""Konceptregistret — produktjaktens minne per koncept (V3).

    python3 koncept.py backfyll          # bygger/uppdaterar koncept.json ur korningar/*/fynd*.json, feedback.json, utfall.json, facit/
    python3 koncept.py visa [--status ja|nej|launchad|…] [--alla]
    python3 koncept.py sok "<ord>"        # dubblettkoll: söker namn, objekt, form, sak
    python3 koncept.py satt <id> <fält> <värde>       # t.ex. satt K0007 status parkerad · satt K0007 aterupptas_om "pris under 15 USD"
    python3 koncept.py ny --namn … --objekt … --form … --arketyp … [--url …]   # manuellt koncept (t.ex. ur äldre research)

Varför: den gamla rutinen kände produkter på AliExpress-id (sedda.json) och svar på <datum>__<id>. Samma SAK
kom tillbaka under nytt id, och ett nej på en listning glömdes när listningen byttes. V3 ger varje koncept ett
beständigt id (K0001 …) som bär alla listningar, alla svar, förutsägelsen, launchen och Metas facit — och en
lista över vad som måste ändras för att ett nej ska prövas igen (`aterupptas_om`).

Ett koncept = objekt + form (t.ex. "snöslunga + överdrag"), inte en listning. Backfyllningen gör en rad per
AliExpress-id (det enda som fanns) och sätter `sak` så att lika rader kan slås ihop med `slaihop`.

Statusar: kandidat (sökt, aldrig levererad) · levererad · ja · kanske · nej · parkerad · launchad · vinnare ·
forlorare · dubblett. Metas facit (facit/kampanjer.json) skriver launchad/vinnare/forlorare; Axels klick skriver
ja/kanske/nej; ingen status raderas — allt ligger kvar i `historik`.
"""
import argparse
import datetime
import glob
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
KONCEPT = os.path.join(HERE, "koncept.json")
FEEDBACK = os.path.join(HERE, "feedback", "feedback.json")
UTFALL = os.path.join(HERE, "utfall.json")
KAMPANJER = os.path.join(HERE, "facit", "kampanjer.json")
LAUNCHKOPPLING = os.path.join(HERE, "facit", "launch-koppling.json")
FRO = os.path.join(HERE, "facit", "koncept-fro.json")

# Gamla arketyper (MASTERPROMPT A1–A6) → V3-arketyper (uppdraget 2026-09-11)
ARKETYP_V3 = {
    "A1": ("B_SKYDDA_DYRT", "E_VADER_SASONG"), "A2": ("A_AGARE_FRIKTION", "B_SKYDDA_DYRT"),
    "A3": ("E_VADER_SASONG", "B_SKYDDA_DYRT"), "A4": ("G_Q4_GAVA", "I_FLERKOP"), "A5": ("B_SKYDDA_DYRT", None),
    "A6": ("A_AGARE_FRIKTION", None), "verktyg": ("D_SNABBARE_METOD", None),
}
ARKETYPER = ["A_AGARE_FRIKTION", "B_SKYDDA_DYRT", "C_LAGA_ISTALLET", "D_SNABBARE_METOD", "E_VADER_SASONG",
             "F_HOBBY_IDENTITET", "G_Q4_GAVA", "H_VISUELL_NYHET", "I_FLERKOP", "X_UTANFOR"]


def idag():
    return datetime.date.today().isoformat()


def las():
    if os.path.exists(KONCEPT):
        return json.load(open(KONCEPT, encoding="utf-8"))
    return {"_om": "Konceptregistret (V3). Skrivs av koncept.py; feedback.py och meta_facit.py uppdaterar via koncept.py. Ett koncept = objekt + form, med alla listningar, svar, förutsägelser och Metas facit.",
            "nasta": 1, "koncept": {}}


def skriv(d):
    json.dump(d, open(KONCEPT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


def _sak(objekt, form, titel=""):
    """Normaliserad 'objekt+form' — det som gör två listningar till samma koncept."""
    o = (objekt or "").lower().split("—")[0].split("(")[0].strip()
    f = (form or "").lower().strip()
    if not o and titel:
        o = re.sub(r"[^a-z0-9 ]", " ", titel.lower())[:40].strip()
    return f"{o}+{f}".strip("+")


def _nytt_id(d):
    i = d["nasta"]
    d["nasta"] = i + 1
    return f"K{i:04d}"


def _index(d):
    ix = {}
    for kid, k in d["koncept"].items():
        for l in k.get("listningar", []):
            if l.get("product_id"):
                ix[str(l["product_id"])] = kid
    return ix


def _handelse(k, datum, text):
    k.setdefault("historik", []).append({"datum": datum, "handelse": text})


def _v3(arketyp_gammal):
    p, s = ARKETYP_V3.get(arketyp_gammal or "", (None, None))
    return p, s


def skapa(d, *, namn, objekt, form, arketyp_gammal=None, arketyp=None, arketyp_sekundar=None, taggar=None, datum=None, kalla="produktjakt"):
    kid = _nytt_id(d)
    p, s = _v3(arketyp_gammal)
    k = {"id": kid, "skapad": datum or idag(), "namn": namn, "objekt": objekt or "", "form": form or "",
         "sak": _sak(objekt, form, namn), "arketyp": arketyp or p, "arketyp_sekundar": arketyp_sekundar or s,
         "arketyp_gammal": arketyp_gammal, "taggar": taggar or {}, "kalla": kalla,
         "listningar": [], "leveranser": [], "feedback": [], "launch": None, "meta": None,
         "status": "kandidat", "aterupptas_om": [], "historik": []}
    _handelse(k, k["skapad"], f"skapat ({kalla})")
    d["koncept"][kid] = k
    return k


# ------------------------------------------------------------ backfyll
def backfyll():
    d = las()
    ix = _index(d)
    n_nya, n_lev, n_fb, n_launch = 0, 0, 0, 0

    # 0. Frön — koncept ur äldre research som launchades utan att gå via produktjakt/ (V1–V3 m.fl.)
    if os.path.exists(FRO):
        for f in json.load(open(FRO, encoding="utf-8")).get("koncept", []):
            if any(k.get("fro_nyckel") == f["fro_nyckel"] for k in d["koncept"].values()):
                continue
            k = skapa(d, namn=f["namn"], objekt=f.get("objekt"), form=f.get("form"), arketyp_gammal=f.get("arketyp_gammal"),
                      arketyp=f.get("arketyp"), arketyp_sekundar=f.get("arketyp_sekundar"), taggar=f.get("taggar"), datum=f.get("datum"), kalla=f.get("kalla", "fro"))
            k["fro_nyckel"] = f["fro_nyckel"]
            for l in f.get("listningar", []):
                k["listningar"].append({**l, "forst_sedd": l.get("forst_sedd") or f.get("datum")})
                if l.get("product_id"):
                    ix[str(l["product_id"])] = k["id"]
            if f.get("prediktion"):
                k["leveranser"].append({"datum": f.get("datum"), "kalla": f.get("kalla"), "levererad": False, **f["prediktion"]})
            if f.get("status"):
                k["status"] = f["status"]
            n_nya += 1

    # 1. Körningarna — varje fynd-fil. fynd.json = levererad till Axel; fynd-*.json = kandidat.
    filer = sorted(glob.glob(os.path.join(HERE, "korningar", "*", "fynd*.json")))
    for fil in filer:
        try:
            run = json.load(open(fil, encoding="utf-8"))
        except Exception:
            continue
        datum = run.get("datum") or os.path.basename(os.path.dirname(fil))
        levererad = os.path.basename(fil) == "fynd.json"
        for p in run.get("produkter", []):
            pid = str(p.get("product_id") or "")
            if not pid:
                continue
            t = p.get("taggar") or {}
            kid = ix.get(pid)
            if not kid:
                k = skapa(d, namn=p.get("namn_sv") or p.get("titel", "")[:90], objekt=t.get("objekt") or p.get("objekt") or p.get("grupp"),
                          form=t.get("form"), arketyp_gammal=t.get("arketyp"), taggar=t, datum=datum)
                kid = k["id"]; ix[pid] = kid; n_nya += 1
            k = d["koncept"][kid]
            if not any(l.get("product_id") == pid for l in k["listningar"]):
                k["listningar"].append({"product_id": pid, "url": p.get("url"), "bild": p.get("bild"), "pris_usd": p.get("pris"),
                                        "sald": p.get("sald"), "forst_sedd": datum, "verifieringar": []})
            l = next(l for l in k["listningar"] if l.get("product_id") == pid)
            l.setdefault("verifieringar", [])
            if not any(v.get("datum") == datum for v in l["verifieringar"]):
                l["verifieringar"].append({"datum": datum, "verdict": "SOKTRAFF" if not p.get("per_kriterium") else "SOKTRAFF+HERO",
                                           "kalla": os.path.relpath(fil, HERE)})
            if levererad and not any(x.get("datum") == datum for x in k["leveranser"]):
                e = p.get("ekonomi") or {}
                k["leveranser"].append({"datum": datum, "levererad": True, "poang": p.get("poang"), "status": p.get("status"),
                                        "rank_slutlig": p.get("rank_slutlig"), "pris": e.get("forslag_pris"), "landad": e.get("landad"),
                                        "be_cpa": e.get("be_cpa"), "hook": p.get("hook"), "huvudrisk": p.get("huvudrisk"),
                                        "per_kriterium": p.get("per_kriterium"), "kalla": os.path.relpath(fil, HERE)})
                if k["status"] == "kandidat":
                    k["status"] = "levererad"
                _handelse(k, datum, f"levererad på arket ({p.get('status') or 'utan dom'}, {p.get('poang') if p.get('poang') is not None else '—'}/100)")
                n_lev += 1
            if p.get("namn_sv") and not k.get("namn_sv"):
                k["namn_sv"] = p["namn_sv"]; k["namn"] = p["namn_sv"]
            if t and not k["taggar"]:
                k["taggar"] = t; k["objekt"] = k["objekt"] or t.get("objekt", ""); k["form"] = k["form"] or t.get("form", "")
                k["sak"] = _sak(k["objekt"], k["form"], k["namn"])
                if not k.get("arketyp"):
                    k["arketyp"], k["arketyp_sekundar"] = _v3(t.get("arketyp")); k["arketyp_gammal"] = t.get("arketyp")

    # 2. Axels svar
    if os.path.exists(FEEDBACK):
        for nyckel, s in json.load(open(FEEDBACK, encoding="utf-8")).get("svar", {}).items():
            pid = str(s.get("product_id") or "")
            kid = ix.get(pid)
            if not kid:
                k = skapa(d, namn=s.get("namn", "")[:90], objekt=(s.get("taggar") or {}).get("objekt") or s.get("grupp"),
                          form=(s.get("taggar") or {}).get("form"), arketyp_gammal=(s.get("taggar") or {}).get("arketyp"),
                          taggar=s.get("taggar"), datum=s.get("datum"), kalla="feedback")
                k["listningar"].append({"product_id": pid, "url": s.get("url"), "forst_sedd": s.get("datum"), "verifieringar": []})
                kid = k["id"]; ix[pid] = kid; n_nya += 1
            k = d["koncept"][kid]
            if not any(f.get("ts") == s.get("ts") for f in k["feedback"]):
                k["feedback"].append({"datum": s.get("datum"), "dom": s.get("dom"), "orsaker": s.get("orsaker") or [], "kalla": s.get("kalla"), "ts": s.get("ts")})
                _handelse(k, s.get("datum"), f"Axel: {s.get('dom')} {s.get('orsaker') or ''}")
                n_fb += 1
            senaste = sorted(k["feedback"], key=lambda f: f.get("ts") or "")[-1]
            if k["status"] in ("kandidat", "levererad", "ja", "kanske", "nej"):
                k["status"] = senaste["dom"]

    # 3. Launch + Metas facit. Koppling: utfall.json (product_id) → koncept; annars launch-koppling.json (kampanjmönster → product_id/fro_nyckel).
    koppling = json.load(open(LAUNCHKOPPLING, encoding="utf-8")) if os.path.exists(LAUNCHKOPPLING) else {}
    fro_ix = {k.get("fro_nyckel"): kid for kid, k in d["koncept"].items() if k.get("fro_nyckel")}

    def hitta_koncept(kampanjnamn, pid=None):
        if pid and str(pid) in ix:
            return ix[str(pid)]
        n = kampanjnamn.lower()
        for monster, mal in koppling.items():
            if monster.lower() in n:
                return ix.get(str(mal)) or fro_ix.get(mal)
        return None

    utfall = json.load(open(UTFALL, encoding="utf-8")).get("utfall", {}) if os.path.exists(UTFALL) else {}
    for namn, u in utfall.items():
        kid = hitta_koncept(namn, u.get("product_id"))
        if not kid:
            # launchad forskningsprodukt som aldrig stod i en fynd.json (Axel plockade den ur en sökomgång eller chatten)
            t = u.get("taggar") or {}
            k = skapa(d, namn=re.sub(r"\s*\|.*$", "", namn), objekt=t.get("objekt"), form=t.get("form"), arketyp_gammal=t.get("arketyp"),
                      taggar=t, datum=u.get("datum"), kalla="utfall.json")
            if u.get("product_id"):
                k["listningar"].append({"product_id": str(u["product_id"]), "url": f"https://www.aliexpress.com/item/{u['product_id']}.html", "forst_sedd": u.get("datum"), "verifieringar": []})
                ix[str(u["product_id"])] = k["id"]
            kid = k["id"]; n_nya += 1
        k = d["koncept"][kid]
        if not k.get("launch"):
            k["launch"] = {"kampanj": namn, "kampanj_id": u.get("kampanj_id"), "datum": u.get("datum")}
            _handelse(k, u.get("datum"), f"launchad i kontot: {namn}")
            n_launch += 1
        k["meta"] = {kk: u.get(kk) for kk in ("spend", "kop", "roas", "cpa", "be", "be_cpa", "vinstbidrag", "band", "klass", "lutning", "bekraftelse", "last", "utfall")}
        if k["meta"].get("klass") == "REAL_WINNER":
            k["status"] = "vinnare"
        elif k["meta"].get("klass") == "REAL_LOSER":
            k["status"] = "forlorare"
        elif k["status"] not in ("vinnare", "forlorare"):
            k["status"] = "launchad"
    # Facit direkt ur kontot (även för kampanjer som inte står i utfall.json)
    if os.path.exists(KAMPANJER):
        for kmp in json.load(open(KAMPANJER, encoding="utf-8")).get("kampanjer", []):
            kid = hitta_koncept(kmp["namn"])
            if not kid or kmp["namn"] in utfall:
                continue
            k = d["koncept"][kid]
            if not k.get("launch"):
                k["launch"] = {"kampanj": kmp["namn"], "kampanj_id": kmp["id"], "datum": kmp.get("launch")}
                _handelse(k, kmp.get("launch"), f"launchad i kontot: {kmp['namn']}")
                n_launch += 1
            k["meta"] = {kk: kmp.get(kk) for kk in ("spend", "kop", "roas", "cpa", "be", "be_cpa", "vinstbidrag", "band", "klass", "lutning", "bekraftelse")}
            k["meta"]["last"] = kmp.get("date_stop")
            k["status"] = {"REAL_WINNER": "vinnare", "REAL_LOSER": "forlorare"}.get(kmp["klass"], "launchad" if k["status"] not in ("vinnare", "forlorare") else k["status"])

    skriv(d)
    print(f"koncept.json: {len(d['koncept'])} koncept ({n_nya} nya) · {n_lev} leveranser · {n_fb} svar · {n_launch} launcher kopplade")


# ------------------------------------------------------------ visning
def visa(status=None, alla=False):
    d = las()
    rader = [k for k in d["koncept"].values() if (not status or k["status"] == status) and (alla or k["status"] != "kandidat")]
    print(f"{len(rader)} koncept" + (f" med status {status}" if status else "") + ("" if alla else " (kandidater dolda, --alla visar)"))
    for k in sorted(rader, key=lambda k: (k["status"], k["skapad"])):
        m = k.get("meta") or {}
        fb = "/".join(f["dom"] for f in k["feedback"]) or "—"
        meta = f"{m.get('klass')} {m.get('spend', 0):.0f} kr/{m.get('kop', 0)} köp" if m else "—"
        print(f"  {k['id']} {k['status']:10} {k['skapad']} {k['namn'][:44]:44} | {k.get('arketyp') or '—':18} | svar {fb:12} | {meta}")


def sok(ord_):
    d = las()
    o = ord_.lower()
    tr = [k for k in d["koncept"].values() if any(o in str(k.get(f, "")).lower() for f in ("namn", "namn_sv", "objekt", "form", "sak"))]
    print(f"{len(tr)} träffar på '{ord_}'")
    for k in tr:
        print(f"  {k['id']} {k['status']:10} {k['namn'][:60]} · {k['sak']} · launch: {(k.get('launch') or {}).get('kampanj', '—')}")
    return tr


def satt(kid, falt, varde):
    d = las()
    k = d["koncept"].get(kid)
    if not k:
        raise SystemExit(f"okänt koncept {kid}")
    if falt == "aterupptas_om":
        k["aterupptas_om"].append(varde)
    elif falt in ("arketyp", "arketyp_sekundar") and varde not in ARKETYPER:
        raise SystemExit(f"arketyp måste vara en av {ARKETYPER}")
    else:
        k[falt] = varde
    _handelse(k, idag(), f"{falt} = {varde}")
    skriv(d)
    print(f"{kid}: {falt} = {varde}")


def ny(a):
    d = las()
    k = skapa(d, namn=a.namn, objekt=a.objekt, form=a.form, arketyp=a.arketyp, datum=idag(), kalla="manuellt")
    if a.url:
        pid = re.search(r"/item/(\d+)", a.url)
        k["listningar"].append({"product_id": pid.group(1) if pid else None, "url": a.url, "forst_sedd": idag(), "verifieringar": []})
    skriv(d)
    print(f"{k['id']} skapat: {k['namn']} ({k['sak']})")


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("backfyll")
    s = sub.add_parser("visa"); s.add_argument("--status"); s.add_argument("--alla", action="store_true")
    s = sub.add_parser("sok"); s.add_argument("ord")
    s = sub.add_parser("satt"); s.add_argument("id"); s.add_argument("falt"); s.add_argument("varde")
    s = sub.add_parser("ny"); s.add_argument("--namn", required=True); s.add_argument("--objekt", required=True); s.add_argument("--form", required=True)
    s.add_argument("--arketyp", required=True, choices=ARKETYPER); s.add_argument("--url")
    a = ap.parse_args()
    if a.cmd == "backfyll":
        backfyll()
    elif a.cmd == "visa":
        visa(a.status, a.alla)
    elif a.cmd == "sok":
        sok(a.ord)
    elif a.cmd == "satt":
        satt(a.id, a.falt, a.varde)
    elif a.cmd == "ny":
        ny(a)


if __name__ == "__main__":
    main()
