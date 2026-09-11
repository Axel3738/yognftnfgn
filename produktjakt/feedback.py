#!/usr/bin/env python3
"""Axels feedback → vikter. Det här är loopen som gör rutinen bättre för varje varv.

    python3 feedback.py samla [--db feedback/db]        # dokumenten ur Artifact read_db → feedback.json
    python3 feedback.py svar <datum> <product_id> ja|nej|kanske [orsak ...]   # svar givet i chatten
    python3 feedback.py vikter                           # feedback.json → vikter.json + LARDOMAR.md
    python3 feedback.py visa                             # läget i terminalen

Var svaren kommer ifrån:
  • Sidan (sida-mall.html) skriver ett dokument per produkt i artefaktens db, samlingen `feedback`,
    id `<datum>__<product_id>`, med dom (ja/kanske/nej), orsaker (etiketter) och produktens taggar.
    Rutinen hämtar dem med `Artifact read_db` (db_op list, collection feedback, out_dir feedback/db)
    och kör `samla`.
  • Chatten: skriver Axel "nej på 3, verktyg" svarar rutinen med `svar`.

Hur vikterna räknas (vikter.json):
  För varje dimension (grupp, och varje nyckel i produktens `taggar`: objekt, arketyp, form …) och
  varje värde: score = (ja + 0,5·kanske + 1) / (ja + kanske + nej + 2). Laplace-utjämnat: ett enda
  svar flyttar lite, fem svar flyttar mycket. hitta.py rangordnar på uppslag × produkten av scorerna.
  STOPP: ett värde med ≥ 3 nej och 0 ja stoppas helt i nästa körning. LYFT: ≥ 3 ja markerar variabeln
  som bevisad — men aldrig en grupp/nisch (SIGNALER.md: att en vara gått bra säger inget om nischen).
  Orsakerna (etiketterna) räknas för sig och styr LARDOMAR.md — de är det rutinen läser innan den söker.

Ingen siffra gissas: saknas svar är score 0,5 för allt, och vikter.json säger "0 svar".
"""
import argparse
import datetime
import glob
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
FEEDBACK = os.path.join(HERE, "feedback", "feedback.json")
VIKTER = os.path.join(HERE, "vikter.json")
LARDOMAR = os.path.join(HERE, "LARDOMAR.md")
DOM = ("ja", "kanske", "nej")
# Samma etiketter som i sida-mall.html (ORSAKER_NEJ / ORSAKER_JA). Ändra på båda ställena.
ORSAKER = ["Verktyg / pryl", "Kedjan har den", "Fel kund", "Syns inget i bild", "Har redan", "Fel säsong",
           "För dyr", "Lågt upplevt värde", "Inget far illa", "Nöjd med det han har", "Fel datum, rätt vara", "Tråkig",  # nej
           "Osäker på priset", "Tveksam bild", "Kan bli bra",               # kanske
           "Skyddar något", "Deadline nu", "Bra ankare", "Snygg bild", "Känns rätt"]  # ja
STOPP_NEJ = 3
LYFT_JA = 3
UTFALL = os.path.join(HERE, "utfall.json")
# Systemsignaler ur kontot väger tyngre än ett klick (MASTERPROMPT 8.3): launchad = 2 ja, >=BE = 3 ja, <BE = 3 nej
VIKT_UTFALL = {"launchad": ("ja", 2), ">=BE": ("ja", 3), "<BE": ("nej", 3), "svalt": (None, 0)}


def las():
    if os.path.exists(FEEDBACK):
        return json.load(open(FEEDBACK, encoding="utf-8"))
    return {"svar": {}}


def skriv(d):
    os.makedirs(os.path.dirname(FEEDBACK), exist_ok=True)
    json.dump(d, open(FEEDBACK, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


def samla(dbdir):
    """read_db med out_dir skriver <out_dir>/feedback/<doc_id>.json. Nyare ts vinner över äldre."""
    d = las()
    nya, upp = 0, 0
    for fil in sorted(glob.glob(os.path.join(dbdir, "**", "*.json"), recursive=True)):
        try:
            doc = json.load(open(fil, encoding="utf-8"))
        except Exception:
            continue
        body = doc.get("data", doc)  # read_db kan lägga dokumentet under "data"
        if not isinstance(body, dict) or body.get("dom") not in DOM or not body.get("product_id"):
            continue
        nyckel = f"{body.get('datum', '')}__{body['product_id']}"
        gammal = d["svar"].get(nyckel)
        if gammal and gammal.get("ts", "") >= body.get("ts", ""):
            continue
        d["svar"][nyckel] = body
        nya += 0 if gammal else 1
        upp += 1 if gammal else 0
    skriv(d)
    print(f"samlade {nya} nya och {upp} uppdaterade svar → {len(d['svar'])} totalt")


def svar(datum, pid, dom, orsaker):
    d = las()
    fynd_p = os.path.join(HERE, "korningar", datum, "fynd.json")
    prod = {}
    if os.path.exists(fynd_p):
        for p in json.load(open(fynd_p, encoding="utf-8"))["produkter"]:
            if str(p["product_id"]) == str(pid):
                prod = p
                break
    okanda = [o for o in orsaker if o not in ORSAKER]
    if okanda:
        print(f"obs: orsaker utanför listan sparas som fritext: {okanda}")
    d["svar"][f"{datum}__{pid}"] = {
        "datum": datum, "product_id": str(pid), "namn": prod.get("titel", ""), "url": prod.get("url", ""),
        "grupp": prod.get("grupp", ""), "taggar": prod.get("taggar", {}),
        "pris": (prod.get("ekonomi") or {}).get("forslag_pris"), "landad": (prod.get("ekonomi") or {}).get("landad"),
        "dom": dom, "orsaker": orsaker, "ts": datetime.datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "kalla": "chatt",
    }
    skriv(d)
    print(f"sparat: {datum} {pid} {dom} {orsaker} ({prod.get('titel', '?')[:50]})")


def score(ja, kanske, nej):
    return round((ja + 0.5 * kanske + 1) / (ja + kanske + nej + 2), 3)


def vikter():
    d = las()
    dims, orsak_r = {}, {}
    tot = {k: 0 for k in DOM}
    def rakna(varden, dom, vikt=1):
        for dim, v in varden.items():
            for val in (v if isinstance(v, list) else [v]):
                if not val:
                    continue
                r = dims.setdefault(dim, {}).setdefault(str(val), {"ja": 0, "kanske": 0, "nej": 0})
                r[dom] += vikt

    for s in d["svar"].values():
        dom = s.get("dom")
        if dom not in DOM:
            continue
        tot[dom] += 1
        varden = {"grupp": s.get("grupp") or ""}
        varden.update(s.get("taggar") or {})
        rakna(varden, dom)
        for o in s.get("orsaker") or []:
            r = orsak_r.setdefault(o, {"ja": 0, "kanske": 0, "nej": 0})
            r[dom] += 1
    # Metas facit: launchade produkter och deras utfall, skrivna av rutinen i utfall.json med produktens taggar
    n_utfall = 0
    if os.path.exists(UTFALL):
        for kamp, u in (json.load(open(UTFALL, encoding="utf-8")).get("utfall") or {}).items():
            dom, vikt = VIKT_UTFALL.get(u.get("utfall"), (None, 0))
            if not dom or not u.get("taggar"):
                continue
            rakna(u["taggar"], dom, vikt)
            n_utfall += 1
    stopp, lyft = [], []
    for dim, rader in dims.items():
        for val, r in rader.items():
            r["score"] = score(r["ja"], r["kanske"], r["nej"])
            if r["nej"] >= STOPP_NEJ and r["ja"] == 0:
                stopp.append(f"{dim}:{val}")
            # Lyft gäller aldrig grupp/nisch — SIGNALER.md: att Axel gillar en vara i husvagnsgruppen
            # säger inget om att husvagnsnischen är öppen. Lyft räknas bara på variabler (arketyp, form …).
            if r["ja"] >= LYFT_JA and dim != "grupp":
                lyft.append(f"{dim}:{val}")
    ut = {"datum": datetime.date.today().isoformat(), "antal_svar": sum(tot.values()), "per_dom": tot,
          "antal_utfall": n_utfall,
          "score_regel": "(ja + 0.5*kanske + 1) / (ja + kanske + nej + 2); 0.5 = inget svar; launchad = 2 ja, >=BE = 3 ja, <BE = 3 nej",
          "dimensioner": dims, "orsaker": orsak_r, "stopp": sorted(stopp), "lyft": sorted(lyft)}
    json.dump(ut, open(VIKTER, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    skriv_lardomar(ut)
    print(f"vikter.json: {ut['antal_svar']} svar ({tot}), {len(stopp)} stopp, {len(lyft)} lyft")
    return ut


def skriv_lardomar(v):
    """Auto-delen mellan markörerna skrivs om; allt under 'Egna anteckningar' bevaras."""
    egna = "## Egna anteckningar (rutinen skriver här, en rad per körning)\n"
    if os.path.exists(LARDOMAR):
        txt = open(LARDOMAR, encoding="utf-8").read()
        if "<!-- auto:end -->" in txt:
            egna = txt.split("<!-- auto:end -->", 1)[1].lstrip("\n")
    rader = [f"# Lärdomar från Axels svar", "",
             "Läses av `/produktjakt` INNAN sökningen. Auto-delen räknas av `feedback.py vikter`; skriv aldrig i den för hand.",
             "", "<!-- auto:start -->",
             f"Uppdaterad {v['datum']}. **{v['antal_svar']} svar** — ja {v['per_dom']['ja']}, kanske {v['per_dom']['kanske']}, nej {v['per_dom']['nej']}.", ""]
    if v["antal_svar"] == 0:
        rader += ["Inga svar än. Alla vikter står på 0,5 — rutinen söker som vanligt.", ""]
    else:
        ja = sorted(((dim, val, r) for dim, rr in v["dimensioner"].items() for val, r in rr.items() if r["ja"] > 0),
                    key=lambda x: (-x[2]["ja"], x[2]["nej"]))
        nej = sorted(((dim, val, r) for dim, rr in v["dimensioner"].items() for val, r in rr.items() if r["nej"] > 0),
                     key=lambda x: (-x[2]["nej"], x[2]["ja"]))
        rader += ["## Det Axel säger ja till", ""]
        rader += [f"- {dim} **{val}**: {r['ja']} ja, {r['kanske']} kanske, {r['nej']} nej → score {r['score']}" for dim, val, r in ja[:15]] or ["- inget ja än"]
        rader += ["", "## Det Axel säger nej till", ""]
        rader += [f"- {dim} **{val}**: {r['nej']} nej, {r['ja']} ja → score {r['score']}" for dim, val, r in nej[:15]] or ["- inget nej än"]
        if v["orsaker"]:
            rader += ["", "## Orsakerna han anger", ""]
            for o, r in sorted(v["orsaker"].items(), key=lambda x: -(x[1]["nej"] + x[1]["ja"])):
                rader.append(f"- **{o}**: {r['nej']} nej, {r['ja']} ja, {r['kanske']} kanske")
        rader += ["", "## Stoppas i nästa körning (≥ 3 nej, 0 ja)", ""]
        rader += [f"- {s}" for s in v["stopp"]] or ["- inget"]
        rader += ["", "## Lyfts i nästa körning (≥ 3 ja)", ""]
        rader += [f"- {s}" for s in v["lyft"]] or ["- inget"]
    rader += ["", "<!-- auto:end -->", "", egna.rstrip("\n"), ""]
    open(LARDOMAR, "w", encoding="utf-8").write("\n".join(rader))


def visa():
    d = las()
    print(f"{len(d['svar'])} svar i feedback.json")
    for k, s in sorted(d["svar"].items()):
        print(f"  {s.get('datum')} {s.get('dom'):6} {', '.join(s.get('orsaker') or []):30} {str(s.get('namn'))[:50]}")
    if os.path.exists(VIKTER):
        v = json.load(open(VIKTER, encoding="utf-8"))
        print(f"vikter.json {v['datum']}: stopp {v['stopp']} lyft {v['lyft']}")


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("samla"); s.add_argument("--db", default=os.path.join(HERE, "feedback", "db"))
    s = sub.add_parser("svar"); s.add_argument("datum"); s.add_argument("product_id"); s.add_argument("dom", choices=DOM)
    s.add_argument("orsak", nargs="*")
    sub.add_parser("vikter"); sub.add_parser("visa")
    a = ap.parse_args()
    if a.cmd == "samla":
        samla(a.db); vikter(); _koncept()
    elif a.cmd == "svar":
        svar(a.datum, a.product_id, a.dom, a.orsak); vikter(); _koncept()
    elif a.cmd == "vikter":
        vikter()
    else:
        visa()


def _koncept():
    """V3: varje svar skrivs också in på konceptet (koncept.json), så nej/ja följer SAKEN och inte bara listningen."""
    try:
        import sys
        sys.path.insert(0, HERE)
        import koncept
        koncept.backfyll()
    except Exception as e:
        print(f"obs: koncept.json uppdaterades inte ({str(e)[:80]}) — kör python3 koncept.py backfyll")


if __name__ == "__main__":
    main()
