#!/usr/bin/env python3
"""Bygger ALL-CANDIDATES.md + ALL-CANDIDATES.csv ur de tre agentfilerna (50 kandidater)
plus de 14 bänkprodukter som live-verifierades i Q4-sessionen 2026-09-05.

Slutstatus, felklass och orsak är huvudsessionens domar (live-hämtningar i v23/material/,
hyllkontroller i STATUS.md/PORTFOLJ.md) — agentens förslag står kvar i kolumnen "Agentens status".
"""
import csv, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
MAT = os.path.join(HERE, "material")

# ---------- huvudsessionens domar per goods_id (eller namn-nyckel för listningslösa) ----------
# status: TEST / VERIFY / WATCH / REJECT-INTRESSANT / HARD REJECT
# fel: CONCEPT / LISTING / PRICE / MARKETPLACE / MATERIAL / AUDIENCE / SEASONAL / UNKNOWN-BLOCKED / —
D = {
 # ---- present/hobby ----
 "601100910111663": ("VERIFY", "—", "Live 17,92 USD ★4,9 (39), video. 549 kr = 2,5–2,9×. Ingen kedja; Örjans färdiga spinnare 279–389 är annan form. Kvar: Fyndiq/Amazon-golv på byggsats oläst, Dovesun-märke på lådan.", "PASS — flat-lay-hero + video med färdiga drag vid vatten"),
 "601099528972078": ("REJECT-INTRESSANT", "PRICE", "Live 32,55 USD ★4,6 (5): landad 340–398 kr → 2,0–2,35× vid 799; BeaverCraft 599–799 lämnar inget ankarutrymme. Konceptet (täljpresent) håller, listningen är för dyr.", "2 bilder, ingen video — ej bedömt"),
 "601100211255328": ("HARD REJECT", "MARKETPLACE", "Live 24,78 USD ★4,0 (1): 1,7–1,9× vid 499. Fyndiq 250–361 identisk, Fladen 329, ≥ 9 Meta-annonsörer. Daterad 2025.", "1 bild, ingen video"),
 "601099516094068": ("WATCH", "LISTING", "Live 2,46 USD ★5,0 (**2 rec**), 1 bild, ingen video. Hero visar mannen som blåser på elden men nedre tredjedelen är inbränd engelsk text. 249 kr = 8× men ~220 kr vinst/köp. Bara som 2-pack (601105175249704, oläst).", "HALV — i bruk men textig"),
 "601099616169218": ("REJECT-INTRESSANT", "MARKETPLACE", "Pris oläst (Temu-budget). Fackhandeln säljer samma form 569–649 kr ≈ 1,1× vårt pris — inget ankarläge. Fosco emalj 299 golv.", "ej sett"),
 "601099529794599": ("REJECT-INTRESSANT", "LISTING", "Funnen listning är akrylplattor, inte 3D-drag — fel form. Konceptet (fiskedrag-pynt, 249 kr) bärs av klistermärkesvinnaren men fönstret är 5 veckor.", "ej sett"),
 "601105480032013": ("HARD REJECT", "MARKETPLACE", "Work Sharp-originalet 395 kr i svensk fackhandel = vår nivå; Jägarliv/Biltema knivslip 49 kr; 1 243 knivslipannonser i SE.", "ej sett"),
 "601099513997309": ("HARD REJECT", "MARKETPLACE", "Biltema har exakt formen (lip grip med våg) i butik.", "ej sett"),
 "601101390672416": ("HARD REJECT", "MARKETPLACE", "Jula Vildmarksgrill trefot + kedja + galler 449 kr, med eldfat.", "ej sett"),
 "601099761936638": ("HARD REJECT", "MARKETPLACE", "Clas, Jula och Kjell har formen; jämförelsehandlad commodity med app-jättar.", "ej sett"),
 "601103574007559": ("HARD REJECT", "MARKETPLACE", "Amazon.se, CDON och Fyndiq säljer identisk Temu-typ-kalender ~499 kr.", "ej sett"),
 "601099813456082": ("HARD REJECT", "MARKETPLACE", "Clas Ohlson 2-pack magnetisk handvärmare 299 kr — exakt formen. Perfekt Q4-klocka, fel hylla.", "ej sett"),
 "601099529585777": ("HARD REJECT", "MARKETPLACE", "21 USD → landad 219–257 kr; Malco.se identisk labyrint 199 kr. Temu är dyrare än svensk fackhandel.", "ej sett"),
 "601102412056295": ("HARD REJECT", "MARKETPLACE", "Jula Kayoba smörgåsjärn gjutjärn 199 kr.", "ej sett"),
 "601099610454170": ("HARD REJECT", "MARKETPLACE", "PriceRunner 49 isborradaptrar från 69 kr; isen lägger sig dec–jan (även säsong).", "ej sett"),
 "601099527328059": ("HARD REJECT", "MARKETPLACE", "Jula Kayoba digital fiskevåg med måttband 149 kr.", "ej sett"),
 "601099542754983": ("HARD REJECT", "MARKETPLACE", "Jula Meec Tools magnetarmband; kan inte prissättas över 199 kr.", "ej sett"),
 # ---- evergreen ----
 "601099523116633": ("REJECT-INTRESSANT", "PRICE", "Hämtning blockerad; familjen 89,75–107,33 USD → landad 937–1 314 kr, över taket. Amazon.se MHCABSR 1 050, Prylstaden 895, Camping4u 1 995. PTZ-arketypen håller — kräver listning ≤ 28 USD.", "ej sett"),
 "NAME:dacklyftrem": ("REJECT-INTRESSANT", "LISTING", "Ingen Temu-listning på 5+9 sökningar. Q4 NOW (däckbyte okt–nov), ingen svensk produkt i formen. Finns kanske inte som massprodukt.", "—"),
 "601099532135433": ("HARD REJECT", "MARKETPLACE", "Autodude 679 / Bilvårdsbutiken 749 i exakt formen ≈ vårt pris; payoffen (ingen rost) syns om fem år.", "ej sett"),
 "601101021099794": ("HARD REJECT", "PRICE", "101 USD → landad 1 054–1 236 kr, över 1 000 kr-taket. Strukturellt för formen.", "ej sett"),
 "602613789643197": ("HARD REJECT", "MARKETPLACE", "Biltema 'Trådlösa baklyktor med magnetfäste' samma form; latent behov.", "ej sett"),
 "601099623990583": ("HARD REJECT", "MARKETPLACE", "Trixie bagagerumsskydd med stötfångarflärp 499 kr i varje djurbutik.", "ej sett"),
 "606483873895498": ("HARD REJECT", "MARKETPLACE", "11 USD, men Fyndiq motorsågshållare 244 kr i samma form; objektet förvaras inomhus.", "ej sett"),
 "601099625618025": ("HARD REJECT", "MARKETPLACE", "Jula borrslip 269 kr; 45 USD-formen landar 470–551 kr = över taket.", "ej sett"),
 "601101646251756": ("HARD REJECT", "MARKETPLACE", "Fyndiq 6-pack Makita-hållare 260 kr i lager.", "ej sett"),
 "601104238416714": ("HARD REJECT", "MARKETPLACE", "Biltema egen TPMS-kategori; latent behov + montering.", "ej sett"),
 "606012115415615": ("HARD REJECT", "MARKETPLACE", "Clas Ohlson väderbeständigt nyckelskåp 299 kr.", "ej sett"),
 "605586158624069": ("HARD REJECT", "MARKETPLACE", "Rukka ISOFIX-bälte från 149 kr hos Hundliv; Biltema.", "ej sett"),
 "601100318211025": ("HARD REJECT", "MARKETPLACE", "Jula Hamron bagagerumslåda 199 kr.", "ej sett"),
 "601099525129373": ("HARD REJECT", "MARKETPLACE", "Fyndiq LED-belysning bil 186 kr; commodity under 199 kr.", "ej sett"),
 "601099584348061": ("HARD REJECT", "MARKETPLACE", "CDON skruvdragarhölster 119 kr.", "ej sett"),
 "601099613123375": ("HARD REJECT", "MARKETPLACE", "Jula 99,90 / CDON 10-pack 89 kr. Ingen ägarsignal.", "ej sett"),
 "601099537797127": ("HARD REJECT", "MARKETPLACE", "Biltema + Fyndiq 123–188 kr; commodity.", "ej sett"),
 "NAME:lyktskydd": ("HARD REJECT", "LISTING", "Ingen Temu-listning; Nettotrailer 173 kr i formen.", "—"),
 # ---- dolda pärlor ----
 "605583893712528": ("WATCH", "MARKETPLACE", "Live 13,26 USD ★4,9 (167), video visar riktig montering på stångtopp inom 3 s; heron bär amerikansk flagga. **Amazon.se Brubaker 344,99 kr i lager** och generisk 426,63 — samma form. Flaggmax 849 slutsåld = inget aktivt ankare. 399 kr = 2,5–2,9× men över golvet.", "PASS på videon, hero kräver byte av flagga"),
 "601105758637623": ("HARD REJECT", "MARKETPLACE", "Live 7,56 USD ★4,5 (67). Fyndiq 251 kr identisk 4-spöns sugkoppshållare i lager; Amazon.se, MyTrendyPhone, Sportfiskeprylar har kategorin.", "hero: hållaren på biltak med spön — ok, men irrelevant"),
 "NAME:barsele-utombordare": ("REJECT-INTRESSANT", "LISTING", "Ingen Temu-listning på tre fraser. Motorhöljets syskonprodukt i upptagningsveckan; kanske finns formen inte för att motorer bärs av två.", "—"),
 "606235185274302": ("HARD REJECT", "AUDIENCE", "Barnfamiljen är inte butikens publik; 7,76 USD för ett 4 m-överdrag är en tunn tarp; presenningen är köpt old way som funkar.", "ej sett"),
 "NAME:hjullyftrem": ("REJECT-INTRESSANT", "LISTING", "Ingen listning på fjärde sökrundan. Q4 NOW (däckbyte). Ett hjul har redan ett grepp — formen behövs kanske inte.", "—"),
 "601099770975699": ("HARD REJECT", "PRICE", "PVC-remsor $4–8 → landad 42–98 kr bär inte 300 kr; Ferplast på Amazon.se; nyare kojor har gardin; mätning = variantfriktion.", "ej sett"),
 "601100057690236": ("REJECT-INTRESSANT", "AUDIENCE", "13 USD, ekonomi PASS — men 35–70 000 hönsägare under golvet, och produkten är en generisk solcellslampa (Biltema 199 under annat namn). Andra produkt mot hönspubliken om hönsgårdshuven svarar.", "ej sett"),
 "NAME:ljusgran-flaggstang": ("HARD REJECT", "MARKETPLACE", "Clas Northlight flaggstångsbelysning 625 kr, full svensk hylla; solcell i december räcker inte till 300 LED.", "—"),
 "NAME:slapkapell": ("HARD REJECT", "MARKETPLACE", "Biltema 2000035998 och Jula säljer exakt formen i de två svenska standardmåtten.", "—"),
 "NAME:isfri-damm": ("HARD REJECT", "SEASONAL", "Skadan kommer i jan–feb (kranskyddsfällan); Oase IceFree i hela fackhandeln 799 kr.", "—"),
 "601099522307050": ("HARD REJECT", "MARKETPLACE", "Biltema egen elstängselkategori, Granngården, Lantkompaniet; typiskt < 200 kr.", "ej sett"),
 "601099638648365": ("HARD REJECT", "MARKETPLACE", "Clas, Biltema, Jula, Kjell; inget ägt objekt; gåvovinkel.", "ej sett"),
 "601101373614212": ("HARD REJECT", "CONCEPT", "Personlig passform (kläder) = negativ rymd; Jula tre egna modeller; Amazon.se fullt.", "ej sett"),
 "601099527947747": ("HARD REJECT", "CONCEPT", "Personlig passform; Jula Bluewear; Therm-ic/Heat Experience annonserar.", "ej sett"),
 "601099512737873": ("HARD REJECT", "MARKETPLACE", "Jula Hamron värmedyna 12 V 199 kr, Biltema, 73 modeller på PriceRunner.", "ej sett"),
}

# ---------- bänk: live-verifierade i Q4-sessionen, ingår i slutportföljen/avslagen ----------
BANK = [
 # namn, goods_id, status, fel, dna, q4, golv, pris, material, orsak
 ("Isolerad utekattkoja i Oxford-tyg, hopfällbar", "601101118338671", "TEST", "—", 79, "Q4 NOW",
  "Kedjan tom; look-alikes PriceRunner 157 / Fyndiq 395–504 / Shein 424; ankare i lager Kerbl 1 017, VEVOR 1 048, Supercat 1 799",
  "10,92 USD · ★4,9 (72) · 6 bilder · video", "PASS — riktig katt i kojan i höstlöv, textfri; videon studiodemo",
  "Alla nio gater PASS på verifierat underlag. 599 kr = 4,5–5,3×. Risk: look-alikes + 3 annonsörer sedan aug; sälj en SKU, ankaret i bild."),
 ("Staketstolps-reparationsbygel med markspett, 2/4-set", "601103866118857", "VERIFY", "—", 78, "Q4 NOW",
  "Ingen — Bauhaus 232 stolptillbehör utan reparationsbygel; kedjorna säljer stolpskor för nya stolpar; Ad Library 0",
  "16,95 USD · ★4,8 (109) · 3 bilder · video", "PASS — textfri hero med bygeln nedslagen intill stolpen; videon studiopackshot",
  "Formen är obevisad i Sverige (staket byggs med stolpsko/gjutning). 599 kr = 2,9–3,4×. Verifiera: beställ, laga en stolpe, filma."),
 ("Vinterhuv till hönsgården (klar väv med öljetter)", "601103333430208", "WATCH", "AUDIENCE", 82, "Q4 NOW",
  "Ingen huvform — PriceRunner 15 träffar, alla hela gårdar 2 377–15 558 kr",
  "21,60 USD · ★4,6 (127) · 2 bilder · video", "HALV — stark hero (gård i regn, textfri); videon visar en klar PE-presenning på ett golv",
  "35 000–70 000 hönsägare (351 167 hobbyhöns ÷ 5–10) under golvet 100 000; produkten är en presenning; 8 storlekar i tum. 799 kr = 3,0–3,5×."),
 ("Tändvedsklyv i gjutjärn (ring + kil)", "601099583674464", "WATCH", "MATERIAL", 72, "Q4 NOW",
  "Golv setrimmer.se 288/365 kr i lager; ankare Kindling Cracker 1 249 (9+ butiker), Jula/Clas 999; Aduro 295/Northix 419 slutsålda",
  "16,25 USD · ★4,9 (28) · 1 bild · ingen video", "FAIL på listningen — packshot av bultad ram; 601099561039096 (34,11 USD) och 601099702553211 (0 rec) lika svaga",
  "Marknaden är jaktens största (~1,1 M vedeldade eldstäder) och ingen av fyra listningar har material. 599 kr = 3,0–3,5×. Nytt listningssök i oktober."),
 ("Taköverdrag husvagn/husbil 5–12 m", "601101311828193", "WATCH", "MATERIAL", 72, "Q4 NOW",
  "Ingen kedja i tak-only-formen; Jula helöverdrag ~1 599–1 999; ankare i lager Campmaster takskydd från 1 495 (1,87×), EuroTrail 1 599–2 395, Brunner 2 999",
  "26,52 USD · ★4,6 (48) · 17 bilder · video", "FAIL — hero: amerikansk Class A-husbil på vit botten med inbränd text; video: röd pickup med skynke",
  "Motorhöljets struktur, 116 344 avställda husvagnar, meter som variant, 799 kr = 2,5–2,9× — men fel fordon i bild. Alternativ 51–60 USD. Sök 'caravan roof cover'."),
 ("Överdrag till hydraulisk vedklyv 15–45 ton", "601099603802865", "REJECT-INTRESSANT", "PRICE", 76, "Q4 NOW",
  "Ingen kedja, ingen marketplace i formen",
  "436,75 kr på SE-Temu (läst i karusellen 2026-09-04, ej hämtad med temu-ld)", "ej sett",
  "Landad 655–741 kr, över 420-taket. Rätt objekt (klyv värd 4 000–20 000 kr som står ute). Sök överdrag till liten el-klyv 5–7 ton."),
 ("Säkerhetsbom dörr/fönster, teleskopisk 52\"", "601099970240430", "HARD REJECT", "MARKETPLACE", None, "Q4 NOW",
  "Fyndiq 261 kr identisk i lager; Amazon.se Fishtec/Olympia; Skyddsfaktorns stålbommar 1 730–3 850 är annan klass",
  "20,75 USD · ★4,8 (425) · 3 bilder · video", "PASS — textfri hero med två kontextbilder; videon studio",
  "Marketplace-golvet under vårt pris. Konceptet (fritidshuset stängs) var batch 1:s enda TEST."),
 ("Grindhjul fjäderbelastat 4\"", "601102369829095", "HARD REJECT", "MARKETPLACE", 74, "EVERGREEN",
  "CDON 249 kr identisk (Nordmagasinet); Lantkompaniet VOSS 559 är en större gårdsgrindsmodell",
  "18,89 USD · ★4,8 (77) · 3 bilder · ingen video", "packshot på vitt",
  "Klyvkonsmönstret: identisk form på marketplace under vårt pris."),
 ("Solpanel 4W till åtelkamera", "601099525192346", "HARD REJECT", "PRICE", 71, "Q4 NOW",
  "Ankare Hunter 1 299 på jakt.se; Biltema saknar formen",
  "34,99 USD · ★3,8 (23) · 1 bild · ingen video", "1 bild, ej bedömt",
  "Landad 365–428 över taket; betyg 3,8; syskon 41 USD. Konceptet håller men Temu-formen är för dyr."),
 ("Rensbräda båt med spöhållarfäste", "601099564703752", "HARD REJECT", "PRICE", None, "OCTOBER",
  "Olssons Fiske rensbord till spöhållare 549 kr (ord. 659); Moory har kategorin",
  "53,23 USD · ★4,8 (117) · 1 bild · ingen video", "1 bild, ej bedömt",
  "Landad 556–651 kr. Formen är strukturellt för dyr på Temu."),
 ("Jaktparaply 58\" för torn/pass", "601103949421856", "HARD REJECT", "PRICE", 68, "Q4 NOW",
  "Ameristep 479 hos en svensk återförsäljare",
  "157,93 USD · 1 bild", "ej bedömt", "Långt över 1 000 kr-taket."),
 ("Tornsits med spännrem, camo", "601099667428425", "HARD REJECT", "PRICE", 60, "Q4 NOW",
  "Carinthia 559", "53,13 USD · ★4,7 (6) · 2 bilder · video", "ej bedömt", "Landad 555–650 — över taket."),
 ("Sopkärlslocklås med rem", "601101587576926", "HARD REJECT", "MARKETPLACE", 62, "Q4 NOW",
  "Smartaskydd 459 ≈ vårt pris — inget ankare",
  "15,63 USD · 0 rec · 1 bild · ingen video", "hero med tvättbjörn + ekorre på grönt kärl (amerikansk kod)",
  "499 kr ligger över ankaret; 0 recensioner; enkel rem."),
 ("Hängrännesats till lövblås", "601103248788835", "HARD REJECT", "PRICE", 68, "OCTOBER",
  "Stihl 745; Husqvarna 359–399", "134,68 USD · 1 bild", "ej bedömt", "Över taket; adapterpassform mot svenska blåsar."),
]

FEL_TXT = {"CONCEPT":"CONCEPT FAILURE","LISTING":"LISTING FAILURE","PRICE":"PRICE FAILURE","MARKETPLACE":"MARKETPLACE FAILURE",
           "MATERIAL":"MATERIAL FAILURE","AUDIENCE":"AUDIENCE FAILURE","SEASONAL":"SEASONAL FAILURE","UNKNOWN-BLOCKED":"UNKNOWN / BLOCKED","—":"—"}
GRUPP = {"TEST":"1. TEST","VERIFY":"2. VERIFY","WATCH":"3. WATCH","REJECT-INTRESSANT":"4. REJECTED — but concept still interesting","HARD REJECT":"5. HARD REJECT"}
ORDER = ["TEST","VERIFY","WATCH","REJECT-INTRESSANT","HARD REJECT"]

NAME_KEYS = {"Däcklyftrem":"NAME:dacklyftrem","Lyktskydd":"NAME:lyktskydd","Bärsele":"NAME:barsele-utombordare",
             "Hjullyftrem":"NAME:hjullyftrem","ljusgran":"NAME:ljusgran-flaggstang","Släpvagnskapell":"NAME:slapkapell","Isfrihållare":"NAME:isfri-damm"}


def live(gid):
    p = os.path.join(MAT, str(gid), "data.json")
    if not gid or not os.path.exists(p):
        return None
    d = json.load(open(p))
    if d.get("blocked"):
        return None
    imgs = len(dict.fromkeys(d.get("images") or []))
    return f"{d.get('price_sek')} USD · ★{d.get('rating') or '—'} ({d.get('review_count') or 0}) · {imgs} bilder · {'video' if d.get('video_url') else 'ingen video'}"


def key_for(r):
    gid = r.get("goods_id")
    if gid:
        return str(gid)
    for k, v in NAME_KEYS.items():
        if k.lower() in (r.get("product_name") or "").lower():
            return v
    return None


rows = []
for f, src in [("present-hobby.json", "present/hobby"), ("evergreen.json", "evergreen"), ("dolda-parlor.json", "dolda pärlor")]:
    d = json.load(open(os.path.join(HERE, f)))
    arr = d if isinstance(d, list) else next(v for v in d.values() if isinstance(v, list))
    for r in arr:
        k = key_for(r)
        st, fel, orsak, mat = D.get(k, ("HARD REJECT", "MARKETPLACE", str(r.get("main_risk") or "")[:200], "ej sett"))
        sh = r.get("swedish_shelf") or {}
        golv = sh.get("floor_name") or "—"
        if sh.get("floor_price_sek"):
            golv = f"{golv} — {sh['floor_price_sek']} kr"
        gid = str(r.get("goods_id")) if r.get("goods_id") else ""
        lv = live(gid)
        pris = lv if lv else (f"{r.get('price_usd')} USD ({r.get('price_source') or 'utdrag'})" if r.get("price_usd") not in (None, "") else "UNKNOWN")
        rows.append({
            "källa": src, "namn": r.get("product_name", ""), "goods_id": gid,
            "temu_url": (f"https://www.temu.com/se/g-{gid}.html" if gid else "—"),
            "status": st, "fel": FEL_TXT[fel], "dna": r.get("winner_dna_match_0_100"), "q4": r.get("q4_label", ""),
            "golv": golv[:220], "pris": pris, "material": mat, "orsak": orsak,
            "agent_status": str(r.get("status_suggestion") or "")[:160],
            "live": "ja" if lv else "nej",
        })

for (namn, gid, st, fel, dna, q4, golv, pris, mat, orsak) in BANK:
    rows.append({"källa": "bänk (fas 1 / V2.2 / batch 1)", "namn": namn, "goods_id": gid,
                 "temu_url": f"https://www.temu.com/se/g-{gid}.html", "status": st, "fel": FEL_TXT[fel], "dna": dna, "q4": q4,
                 "golv": golv, "pris": pris, "material": mat, "orsak": orsak, "agent_status": "—",
                 "live": "ja" if gid != "601099603802865" else "nej (SE-karusell 2026-09-04)"})

# ---------- CSV ----------
cols = ["status", "fel", "källa", "namn", "goods_id", "temu_url", "pris", "live", "dna", "q4", "golv", "material", "orsak", "agent_status"]
with open(os.path.join(HERE, "ALL-CANDIDATES.csv"), "w", newline="", encoding="utf-8") as fh:
    w = csv.DictWriter(fh, fieldnames=cols)
    w.writeheader()
    for r in sorted(rows, key=lambda r: (ORDER.index(r["status"]), -(r["dna"] or 0))):
        w.writerow({c: ("" if r.get(c) is None else r.get(c)) for c in cols})

# ---------- MD ----------
n_agent = sum(1 for r in rows if not r["källa"].startswith("bänk"))
n_bank = len(rows) - n_agent
out = [f"# ALLA KANDIDATER — Q4-jakten 2026-09-05", "",
       f"**{n_agent} kandidater från de tre agenterna** (present/hobby 17 · evergreen 18 · dolda pärlor 15) "
       f"**+ {n_bank} bänkprodukter** från fas 1 / V2.2 / batch 1 som live-verifierades i samma session och ingår i "
       f"slutportföljen eller dess avslag. Totalt {len(rows)} rader. CSV: `ALL-CANDIDATES.csv`.", "",
       "Statusen är huvudsessionens dom efter live-hämtning (`v23/material/<id>/data.json`, hero, video) och hyllkontroll "
       "(`STATUS.md`, `PORTFOLJ.md`). Agentens eget förslag står kvar i sista kolumnen. **Pris märkt \"live\" är läst ur "
       "Temus JSON-LD i dag**; övriga är sökutdrag (Seznam/Temu-söksida) eller UNKNOWN. Ingen siffra är gissad.", "",
       "Felklasser: CONCEPT (objekt/negativ rymd) · LISTING (ingen eller fel listning) · PRICE (landad kostnad spräcker 2,4× eller 1 000 kr-taket) · "
       "MARKETPLACE (svensk kedja eller marketplace säljer samma form under/vid vårt pris) · MATERIAL (leverantörsbilder/video duger inte) · "
       "AUDIENCE (ägarklass < 100 000 eller fel publik) · SEASONAL (skadan i nov–feb) · UNKNOWN / BLOCKED.", ""]

cnt = {s: sum(1 for r in rows if r["status"] == s) for s in ORDER}
out.append("| Grupp | Antal |\n|---|---|")
for s in ORDER:
    out.append(f"| {GRUPP[s]} | {cnt[s]} |")
out.append("")

for s in ORDER:
    grp = [r for r in rows if r["status"] == s]
    if not grp:
        continue
    out.append(f"\n## {GRUPP[s]} ({len(grp)})\n")
    for r in sorted(grp, key=lambda r: -(r["dna"] or 0)):
        out.append(f"### {r['namn']}")
        out.append(f"- **Källa:** {r['källa']}" + (f" · **Temu:** {r['temu_url']}" if r["goods_id"] else " · **Temu:** ingen listning funnen"))
        out.append(f"- **Status:** {r['status']} · **Felklass:** {r['fel']} · **DNA:** {r['dna'] if r['dna'] is not None else '—'} · **Q4:** {r['q4']}")
        out.append(f"- **Temu-pris:** {r['pris']}" + (" *(live)*" if r["live"].startswith("ja") else ""))
        out.append(f"- **Svenskt golv:** {r['golv']}")
        out.append(f"- **Material:** {r['material']}")
        out.append(f"- **Orsak:** {r['orsak']}")
        if r["agent_status"] != "—":
            out.append(f"- **Agentens status:** {r['agent_status']}")
        out.append("")

with open(os.path.join(HERE, "ALL-CANDIDATES.md"), "w", encoding="utf-8") as fh:
    fh.write("\n".join(out))
print(f"{len(rows)} rader", cnt)
