#!/usr/bin/env python3
"""Engångsskript för den manuella DOA-körningen 2026-09-10 (Axel: "den gav mig bara 3 produkter").

Slår ihop rutinens fynd.json (vilthiss + solcellsladdare, Axels ja) med de kandidater ur
fynd-doa.json / fynd-doa2.json som klarade K0–K12, och skriver per_kriterium + åtta taggar +
poäng + status + rank_slutlig på varje rad (MASTERPROMPT 8.4). Ekonomin räknas med hitta.ekonomi
så landad/pris blir samma som rutinens. Körs från produktjakt/.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hitta  # noqa: E402

KAT = os.path.join("korningar", "2026-09-10")
# Rutinens ursprungliga fynd.json läses ur git (HEAD), så skriptet går att köra om efter att det skrivit över filen.
import subprocess  # noqa: E402
rutin = json.loads(subprocess.run(["git", "show", f"HEAD:produktjakt/{KAT}/fynd.json"], capture_output=True, text=True, check=True).stdout)
doa = {p["product_id"]: p for p in json.load(open(os.path.join(KAT, "fynd-doa.json"), encoding="utf-8"))["produkter"]}
doa2_fil = os.path.join(KAT, "fynd-doa2.json")
if os.path.exists(doa2_fil):
    for p in json.load(open(doa2_fil, encoding="utf-8"))["produkter"]:
        doa.setdefault(p["product_id"], p)
k = rutin["usd_sek"]

# ---- de nya raderna (poängsatta för hand mot MASTERPROMPT §5, ankare mätta 2026-09-10) ----
NYA = [
    {
        "product_id": "1005012847791765",
        "namn_sv": "Frontskydd husvagn 200 × 160 cm (towing cover)",
        "ankare_sek": 1145,
        "ankare": "Hindermann Wintertime 100 € ≈ 1 145 kr (getcamping.eu, 3 kvar) = 1,43× · Hindermann Universal 2 114 kr (campingvaruhuset.se, < 5 i lager) = 2,65× · Kampa 1 999 kr (fortaltsbutiken.se, utgått) · golv: GoCamp 250×150 1 814 kr (campingvaruhuset.se) — inget under oss · annonsörer ej mätt",
        "taggar": {"objekt": "Husvagn — fronten", "arketyp": "A1", "form": "skydd", "deadline_typ": "uppställning",
                   "deadline_klass": "2–6 v", "ankare_klass": "≥ 1,6×", "ankare_kalla": "getcamping.eu/campingvaruhuset.se", "prisband": "500–999"},
        "per_kriterium": {"K0": 0, "K1": 14, "K2": 14, "K3": 10, "K4": 8, "K5": 8, "K6": 14, "K7": 8, "K8": 5, "K9": 5, "K10": 2, "K11": 3, "K12": 0},
        "kill": None,
        "objektet": "Husvagnen, 150 000–400 000 kr, tar skada av stenskott vid flytten och is/UV på frontfönstret i oktober–mars — i dag ingenting, fronten står bar hela vintern",
        "deadline": "uppställning sept–okt [F] = 2–6 veckor kvar",
        "hook": "Står husvagnen ute i vinter?",
        "efter_bild": "Svart huv över fronten, torrt fönster",
        "huvudrisk": "200 cm bred — svenska vagnar är 230–250 cm (Hindermann säljer 140–240). Be leverantören om 220/240-bredd. Hero är render på vit botten (K10 = 2).",
        "forra_svaret": "objekt Husvagn — fronten: inget · arketyp A1: V1 launchad 09-09",
        "syskon": "A5-syskon till V1 Taköverdraget (samma ägare, annan yta)",
        "alternativ": ["1005012891325536 (30,39 USD, samma mått)", "1005007959509974 (16,85 USD, med LED-skydd som Kampa)"],
    },
    {
        "product_id": "1005009353851718",
        "namn_sv": "Lockskydd runt spabad / badtunna (cover cap)",
        "ankare_sek": 995,
        "ankare": "Spabadsbutiken Skyddsöverdrag till Runt Spalock 210 cm 995 kr = 1,42× · Cover Cap deLuxe Round Ø 200–220 1 295 kr = 1,85× · Kuben.se Runt skyddande överdrag 1 290 kr · Folkpool ProClass 1 990–2 190 kr (helöverdrag) · golv: Hemson Oxford Spa Cover Cap 210×210 499 kr (fyrkantig, i lager) → −2 · annonsörer ej mätt",
        "taggar": {"objekt": "Spabadet — locket", "arketyp": "A1", "form": "skydd", "deadline_typ": "första snö",
                   "deadline_klass": "6–12 v", "ankare_klass": "≥ 1,6×", "ankare_kalla": "spabadsbutiken.se/kuben.se", "prisband": "500–999"},
        "per_kriterium": {"K0": 0, "K1": 14, "K2": 14, "K3": 10, "K4": 8, "K5": 8, "K6": 12, "K7": 8, "K8": 5, "K9": 5, "K10": 2, "K11": 1, "K12": 0},
        "kill": None,
        "objektet": "Spalocket, 4 000–8 000 kr (spabadsbutiken.se), spabadet 40 000+ kr, tar skada av snötyngd, is och UV i november–mars; vattenmättat lock = förlorad isolering — i dag ingenting, eller en presenning som blåser av",
        "deadline": "första snö v 46 [K] = 9–10 veckor kvar; höstregn och löv pågår",
        "hook": "Står spabadet ute i vinter?",
        "efter_bild": "Huv över locket, snön glider av",
        "huvudrisk": "Rund form — de flesta svenska spabad är fyrkantiga 200×200/210×210. Be leverantören om fyrkantig variant. 12,95 USD är troligen minsta storleken. Antal runda spa/badtunnor ej mätt (K11 = 1).",
        "forra_svaret": "objekt Spabadet — locket: inget · arketyp A1: V1 launchad 09-09",
        "syskon": None,
        "alternativ": [],
    },
    {
        "product_id": "1005011836511820",
        "namn_sv": "Överdrag till vedställ, 8 ft (244 cm), uppfällbar front",
        "ankare_sek": None,   # ankaret är ställ + överdrag, inte överdraget ensamt → priset räknas landad × 2,4 (899), kvot mot ankaret 0,62
        "ankare": "CDON '8,5 ft vedställ utomhus med lock, 600D Oxford' 1 449 kr (ställ + överdrag) = 1,61× · '12,7 ft' 1 666 kr · hillvert vedställ med tak 2 273–2 990 kr · separat överdrag till vedställ: ingen svensk butik hittad (Jula 403, Hornbach laddade inte) · annonsörer ej mätt",
        "taggar": {"objekt": "Vedstapeln", "arketyp": "A1", "form": "överdrag", "deadline_typ": "första snö",
                   "deadline_klass": "6–12 v", "ankare_klass": "1,3–1,6×", "ankare_kalla": "cdon.se", "prisband": "500–999"},
        "per_kriterium": {"K0": 0, "K1": 14, "K2": 6, "K3": 10, "K4": 8, "K5": 8, "K6": 10, "K7": 8, "K8": 5, "K9": 5, "K10": 2, "K11": 2, "K12": 0},
        "kill": None,
        "objektet": "Vintervedens 4–5 m³, 6 000–10 000 kr (3–10× priset → K2 = 6), blir blöt av höstregn och snö i oktober–mars — i dag en presenning som blåser av",
        "deadline": "första snö v 46 [K] = 9–10 veckor kvar; höstregnet pågår",
        "hook": "Står veden ute i regnet?",
        "efter_bild": "Torr ved under svart huv, fronten uppfälld",
        "huvudrisk": "Passform: sydd för 8 ft-ställ (244 × 122 × 61 cm), svenska vedställ varierar → köparen måste mäta (K11). Veden är billig i förhållande till priset (K2 = 6) — offertrad, inte launch.",
        "forra_svaret": "objekt Vedstapeln: inget · grupp ved och eldning: 1 kanske 09-09 (vedklyvborr)",
        "syskon": None,
        "alternativ": ["1005007370684941 (27,87 USD, samma form, helsvart)"],
    },
]

# ---- rutinens två rader: Axels ja står, men DOA-poängkortet skrivs ärligt (8.6: båda står) ----
RUTIN_EXTRA = {
    "1005012116406743": {
        "namn_sv": "Vilthiss med block och bock, 700 lbs",
        "taggar": {"objekt": "Älgjakten — slaktplatsen", "arketyp": "utanför modellen", "form": "verktyg", "deadline_typ": "jaktstart",
                   "deadline_klass": "pågående", "ankare_klass": "golv utan ankare", "ankare_kalla": "widforss.se/swedol.se (Grey Oak/Stabilotherm 400–499)", "prisband": "500–999"},
        "per_kriterium": {"K0": 0, "K1": 14, "K2": 6, "K3": 0},
        "kill": "K3 verktyg (block/galge i förrådet kl 08; pris 599 < 900) — Axel svarade JA 09-10, raden står (MASTERPROMPT 8.6)",
        "status": "offertrad (Axels ja)",
        "huvudrisk": "Listningsbilden visar ett stativ med vinsch; paketet är repblock + galge. Fråga leverantören vad som ingår. Svensk tvilling 400–499 kr → vårt 599 är över ankaret (K7).",
        "forra_svaret": "Axel JA 2026-09-10 (Känns rätt)",
    },
    "1005011707131795": {
        "namn_sv": "Solcellsladdare 10 W MPPT, batteriunderhåll",
        "taggar": {"objekt": "Husvagn/båt — batteriet", "arketyp": "A1", "form": "elektronik", "deadline_typ": "uppställning",
                   "deadline_klass": "2–6 v", "ankare_klass": "golv utan ankare", "ankare_kalla": "biltema.se/pricerunner.se (ECO-WORTHY)", "prisband": "500–999"},
        "per_kriterium": {"K0": 0, "K1": 14, "K2": 0},
        "kill": "K2 skadan är inuti batteriet (sulfatering, syns i maj) — Axel svarade JA 09-10, raden står (MASTERPROMPT 8.6)",
        "status": "offertrad (Axels ja)",
        "huvudrisk": "Payoffen syns inte i bild; Biltema/ECO-WORTHY ligger under 899 kr.",
        "forra_svaret": "Axel JA 2026-09-10",
    },
}

vikter = hitta.las_vikter()


def rank_slutlig(poang, taggar):
    v = 1.0
    for dim, val in taggar.items():
        v *= vikter.get("dimensioner", {}).get(dim, {}).get(str(val), {}).get("score", 0.5)
    return round((poang or 0) * v, 3)


ut = []
for n in NYA:
    p = dict(doa[n["product_id"]])
    ek = hitta.ekonomi(p["pris"], k, n["ankare_sek"], 650)
    poang = sum(n["per_kriterium"].values())
    pk = n["per_kriterium"]
    launch = poang >= 75 and pk["K1"] >= 10 and pk["K2"] >= 10 and pk["K6"] >= 10
    status = "launch-kandidat" if launch else ("offertrad" if poang >= 55 else "svag offertrad")
    p.update({k2: v for k2, v in n.items() if k2 != "product_id"})
    p.update({"ekonomi": ek, "poang": poang, "status": status, "rank_slutlig": rank_slutlig(poang, n["taggar"]),
              "hero": "sedd", "grupp": n["taggar"]["objekt"]})
    ut.append(p)

for p in rutin["produkter"]:
    x = RUTIN_EXTRA[p["product_id"]]
    p = dict(p)
    p.update(x)
    p.update({"poang": None, "rank_slutlig": None, "hero": "sedd", "grupp": x["taggar"]["objekt"]})
    ut.append(p)

ut.sort(key=lambda p: (p["status"] != "launch-kandidat", -(p["poang"] or 0)))
rutin.update({"produkter": ut, "antal_kandidater": rutin["antal_kandidater"], "regel": "DOA v3.1 manuell körning (Axel 09-10: 'den gav mig bara 3 produkter')",
              "kandidater_doa": len(doa), "vikter_datum": vikter.get("datum")})
json.dump(rutin, open(os.path.join(KAT, "fynd.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for p in ut:
    print(p["status"], p.get("poang"), p.get("rank_slutlig"), p["ekonomi"]["landad"], p["ekonomi"]["forslag_pris"], p["namn_sv"])
