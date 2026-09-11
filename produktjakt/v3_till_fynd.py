#!/usr/bin/env python3
"""Gör dagens V3-batch till en fynd.json som offert.py, sida.py och feedback.py redan förstår (V3, steg 6).

    python3 v3_till_fynd.py --batch korningar/<datum>/v3/batch.json [--ut korningar/<datum>/fynd.json]

Varje rad i batch.json (V3-KANDIDATSCHEMA.md) blir en produkt i det gamla schemat (product_id, titel, url, pris,
pris_text, bild, ekonomi{landad, forslag_pris, multipel, be_cpa}, taggar, namn_sv, poang, status, hook, huvudrisk …)
PLUS V3-fälten (koncept_id, arketyp, slot, sasong, varfor, konfidens, rank_forklaring, marknad, material, meta_tanke).
Konceptregistret får ett id per rad (koncept.py) och det skrivs tillbaka i batch.json.
Bevarar de gamla filerna orörda: offert.py, sida.py, feedback.py läser samma fält som förut.
"""
import argparse
import datetime
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import koncept as K  # noqa: E402


def mitt(x):
    if isinstance(x, list) and x:
        v = [a for a in x if a is not None]
        return round(sum(v) / len(v)) if v else None
    return x


def ta_in_koncept(k, datum):
    """Hitta eller skapa koncept för raden; returnera id."""
    d = K.las()
    ix = K._index(d)
    pid = str((k.get("listning") or {}).get("product_id") or "")
    kid = ix.get(pid) if pid else None
    if not kid:
        sak = K._sak(k.get("objekt"), k.get("form"), k.get("namn_sv"))
        for cid, c in d["koncept"].items():
            if c.get("sak") == sak and c["status"] not in ("dubblett",):
                kid = cid
                break
    if not kid:
        c = K.skapa(d, namn=k["namn_sv"], objekt=k.get("objekt"), form=k.get("form"), arketyp=k.get("arketyp"),
                    arketyp_sekundar=k.get("arketyp_sekundar"), taggar=k.get("taggar") or {}, datum=datum, kalla="produktjakt v3")
        kid = c["id"]
    c = d["koncept"][kid]
    c["namn"] = k["namn_sv"]; c["namn_sv"] = k["namn_sv"]
    c["arketyp"] = c.get("arketyp") or k.get("arketyp"); c["arketyp_sekundar"] = c.get("arketyp_sekundar") or k.get("arketyp_sekundar")
    if pid and not any(l.get("product_id") == pid for l in c["listningar"]):
        c["listningar"].append({"product_id": pid, "url": (k.get("listning") or {}).get("url"), "bild": ((k.get("listning") or {}).get("kontroll") or {}).get("hero_url") or k.get("bild"),
                                "pris_usd": (k.get("listning") or {}).get("pris_usd"), "forst_sedd": datum, "verifieringar": []})
    if pid:
        l = next(l for l in c["listningar"] if l.get("product_id") == pid)
        l.setdefault("verifieringar", []).append({"datum": datum, "verdict": (k.get("listning") or {}).get("verdict"),
                                                  "verifierad_at": (k.get("listning") or {}).get("verifierad_at"), "kalla": "v3 discovery"})
    if not any(x.get("datum") == datum and x.get("levererad") for x in c["leveranser"]):
        e = k.get("ekonomi") or {}
        c["leveranser"].append({"datum": datum, "levererad": True, "slot": k.get("slot"), "rank": k.get("rank"), "rank_poang": k.get("rank_poang"),
                                "poang_axlar": k.get("poang"), "konfidens": k.get("konfidens"), "pris": e.get("pris_sek"),
                                "landad": mitt(e.get("landad_sek")), "be_cpa": mitt(e.get("be_cpa_sek")), "hook": (k.get("meta_tanke") or {}).get("hook"),
                                "varfor": k.get("varfor"), "huvudrisk": k.get("huvudrisk"), "hypotes_id": k.get("hypotes_id"),
                                "per_kriterium": k.get("per_kriterium"), "kalla": "v3 batch"})
        if c["status"] in ("kandidat",):
            c["status"] = "levererad"
        K._handelse(c, datum, f"levererad på V3-arket (rank {k.get('rank')}, {k.get('slot')}, konfidens {k.get('konfidens')})")
    K.skriv(d)
    return kid


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--batch", required=True)
    ap.add_argument("--ut")
    a = ap.parse_args()
    b = json.load(open(a.batch, encoding="utf-8"))
    datum = b.get("datum") or datetime.date.today().isoformat()
    ut = a.ut or os.path.join(os.path.dirname(os.path.dirname(a.batch)), "fynd.json")
    produkter = []
    for k in b["batch"]:
        l = k.get("listning") or {}
        e = k.get("ekonomi") or {}
        m = k.get("marknad") or {}
        landad = mitt(e.get("landad_sek")); pris = e.get("pris_sek")
        kid = ta_in_koncept(k, datum)
        k["koncept_id"] = kid
        t = dict(k.get("taggar") or {})
        t.setdefault("objekt", k.get("objekt")); t.setdefault("form", k.get("form")); t.setdefault("arketyp", k.get("arketyp"))
        t.setdefault("deadline_typ", (k.get("sasong") or {}).get("deadline_typ"))
        t.setdefault("prisband", "<300" if (pris or 0) < 300 else "300–499" if pris < 500 else "500–999" if pris < 1000 else "≥ 1 000")
        kv = m.get("ankare_kvot")
        t.setdefault("ankare_klass", "ej mätt" if kv is None else "≥ 1,6×" if kv >= 1.6 else "1,3–1,6×" if kv >= 1.3 else "1,2–1,3×" if kv >= 1.2 else "golv utan ankare")
        t.setdefault("ankare_kalla", (m.get("premium_ankare") or {}).get("namn") or "ej mätt")
        produkter.append({
            "product_id": str(l.get("product_id") or kid), "titel": k.get("titel") or k["namn_sv"], "url": l.get("url"),
            "pris": l.get("pris_usd"), "valuta": "USD", "pris_text": f"US ${l.get('pris_usd')}" if l.get("pris_usd") is not None else "ej mätt",
            "bild": (l.get("kontroll") or {}).get("hero_url") or k.get("bild"), "bild_fil": (l.get("kontroll") or {}).get("hero_nedladdad"),
            "sald": l.get("sald") or "", "grupp": k.get("objekt"), "objekt": k.get("objekt"), "taggar": t,
            "ekonomi": {"landad": landad, "forslag_pris": pris, "multipel": round(pris / landad, 2) if (pris and landad) else None,
                        "be_cpa": mitt(e.get("be_cpa_sek")), "be_roas": e.get("be_roas"), "dom": "PASS", "orsak": "", "landad_intervall": e.get("landad_sek")},
            "namn_sv": k["namn_sv"], "status": {"exploitation": "bevisad struktur", "exploration": "utforskning", "sasong": "säsong"}.get(k.get("slot"), k.get("slot")),
            "poang": k.get("rank_poang"), "rank_slutlig": k.get("rank_poang"), "rank": k.get("rank"), "per_kriterium": k.get("per_kriterium"),
            "hook": (k.get("meta_tanke") or {}).get("hook"), "efter_bild": (k.get("meta_tanke") or {}).get("bevisas_visuellt"),
            "huvudrisk": k.get("huvudrisk"), "varfor": k.get("varfor"), "konfidens": k.get("konfidens"),
            # V3
            "koncept_id": kid, "arketyp": k.get("arketyp"), "arketyp_sekundar": k.get("arketyp_sekundar"), "slot": k.get("slot"),
            "hypotes_id": k.get("hypotes_id"), "sasong": k.get("sasong"), "vinnarlikhet": k.get("vinnarlikhet"), "rank_forklaring": k.get("rank_forklaring"),
            "asymmetrisk": k.get("asymmetrisk"), "marknad": m, "material": k.get("material"), "meta_tanke": k.get("meta_tanke"),
            "listning": l, "poang_axlar": k.get("poang"), "kallor": k.get("kallor"),
        })
    json.dump(b, open(a.batch, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    d = {"datum": datum, "version": "v3", "kalla": os.path.relpath(a.batch, HERE), "antal_kandidater": len(b.get("batch", [])) + len(b.get("strukna", [])) + len(b.get("utanfor_batch", [])),
         "per_slot": b.get("per_slot"), "produkter": produkter,
         "strukna": b.get("strukna"), "utanfor_batch": b.get("utanfor_batch")}
    os.makedirs(os.path.dirname(ut), exist_ok=True)
    json.dump(d, open(ut, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{ut}: {len(produkter)} produkter (koncept-id satta i batch.json)")
    for p in produkter:
        print(f"  {p['rank']:>2}. {p['koncept_id']} {p['slot'][:5]:5} {p['namn_sv'][:40]:40} {p['ekonomi']['forslag_pris']} kr · {p['konfidens']}")


if __name__ == "__main__":
    main()
