#!/usr/bin/env python3
"""Kopplar butikens nya produkter (katalog-live.txt) till konceptregistret (V3 steg 0A′).
    python3 butik_koppla.py --datum <YYYY-MM-DD> --koppla "Butikstitelprefix=K0123" [...]
För varje par: koncept.butik sätts, facit/launch-koppling.json får titelprefix → listningens product_id,
facit/historik-taggar.json får en rad byggd på konceptets taggar (så meta_facit/larande räknar den
när kampanjen dyker upp). Kör sedan `python3 koncept.py backfyll`.
"""
import argparse, datetime, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))


def prisband(p):
    return None if not p else "<300" if p < 300 else "300–499" if p < 500 else "500–999" if p < 1000 else "≥1000"


def nyckel(s):
    s = s.lower().replace("å", "a").replace("ä", "a").replace("ö", "o")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:40]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--datum", default=datetime.date.today().isoformat())
    ap.add_argument("--koppla", nargs="+", required=True, help='"Titelprefix=K0123"')
    a = ap.parse_args()
    kat = [r.split("\t") for r in open(os.path.join(HERE, "korningar", a.datum, "v3", "katalog-live.txt"), encoding="utf-8").read().splitlines() if r.startswith("ACTIVE")]
    kp = os.path.join(HERE, "koncept.json"); kc = json.load(open(kp, encoding="utf-8"))
    konc = kc["koncept"] if isinstance(kc, dict) and "koncept" in kc else kc
    items = list(konc.values()) if isinstance(konc, dict) else konc
    by_id = {k["id"]: k for k in items}
    lkp = os.path.join(HERE, "facit", "launch-koppling.json"); lk = json.load(open(lkp, encoding="utf-8"))
    htp = os.path.join(HERE, "facit", "historik-taggar.json"); ht = json.load(open(htp, encoding="utf-8"))
    befintliga = {r["nyckel"] for r in ht["produkter"]}
    n = 0
    for par in a.koppla:
        pre, kid = par.rsplit("=", 1)
        k = by_id.get(kid)
        rad = next((r for r in kat if r[3].lower().startswith(pre.lower())), None)
        if not k or not rad:
            print(f"  ✗ {par}: {'koncept saknas' if not k else 'ingen katalograd'}"); continue
        titel, pris = rad[3], float(rad[2])
        k["butik"] = {"titel": titel, "pris_sek": pris, "sedd": a.datum, "kalla": f"katalog-live {a.datum}"}
        pid = (k.get("listningar") or [{}])[0].get("product_id")
        if pid:
            lk[pre] = pid
            lk[titel.split(" – ")[0]] = pid
        t = k.get("taggar") or {}
        ny = nyckel(pre)
        if ny not in befintliga:
            ht["produkter"].append({
                "nyckel": ny, "namn": titel, "kampanj_monster": [pre, titel.split(" – ")[0]], "pris_sek": pris, "be_roas": None,
                "arketyp": k.get("arketyp"), "arketyp_sekundar": k.get("arketyp_sekundar"), "objekt": k.get("objekt"),
                "objekt_varde_band": t.get("objekt_varde_band"), "objekt_ute": t.get("objekt_ute"), "form": k.get("form"),
                "agare_55plus_smahus": True, "old_way": t.get("old_way"), "latent_behov": None, "deadline_typ": t.get("deadline_typ"),
                "timing_vid_launch": None, "kedjegolv_under_vart_pris": t.get("kedjegolv_under_vart_pris"), "markesankare_kvot": None,
                "material_klass": None, "montering_app": False, "variant_risk": None, "flerkop": t.get("flerkop"),
                "prisband": prisband(pris), "kalla": f"katalog-live {a.datum} (forskningsprodukt {kid})",
                "anteckning": f"I butiken {a.datum} — koncept {kid} ({k.get('svar') or k.get('status')}). Kampanj ej sedd vid kopplingen."})
            befintliga.add(ny)
        n += 1
        print(f"  ✓ {kid} ← {titel} ({pris:.0f} kr)")
    json.dump(kc, open(kp, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump(lk, open(lkp, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump(ht, open(htp, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{n} kopplade · launch-koppling {len(lk)} · historik-taggar {len(ht['produkter'])}")


if __name__ == "__main__":
    main()
