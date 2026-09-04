#!/usr/bin/env python3
# slutdom.py — huvudsessionens slutliga tier per kandidat efter hyllverifiering (gate 3)
# och negativa-rymd-filtret (fas 4). Klusteragenternas tier sparas som tier_agent.
# Ingen kandidat kan bli skarp Tier A förrän gate 4 (material) och gate 5 (Temu-pris)
# är körda — därför heter toppgruppen "A (villkorad)". Hittar aldrig på data.
import json, glob, os
H = os.path.dirname(os.path.abspath(__file__))
D = {}
def s(tier, reason, *ids):
    for i in ids: D[str(i)] = (tier, reason)

# ---- Gate 4+5 körda på USA-data 2026-09-04 07:22 UTC (SE-sidan blockerad; galleri = SE, video okänd) ----
# Ingen av de fem villkorade A håller: varje har antingen en hård gate som faller på det som gick att se,
# eller en gate som fortfarande är osedd. Därför 0 Tier A. De står som "B — närmast A" med exakt vad som fattas.
s("B (närmast A)", "gate 5 PASS på US-pris (19,39 USD → landad 202–237 → 2,5–3,0× vid 599); gate 4 FAIL på det som syns: enda bilden är ett hopvikt överdrag framför ett BADKAR, ingen video på US-sidan (SE-video okänd). Blir A om en leverantörsvideo visar skyddet på ett riktigt spalock.", 601099619866532)
s("C (strukturellt: formens pris)", "V2.1-regel A: fem listningar av samma form (bröstväska med lock + sele + regnskydd) kostar 26,59 / 28,49 / 30,85 / 47,32 / 68,59 USD på Temu US — alla ger landad ≥ 280 kr och 2,4× ≥ 670 kr, över vad ankaret Blaser 999 bär (≤ 624). Materialet var godkänt villkorat på originalet (riktig jägare tar upp kikaren inom 3 s). Felet sitter i produktformen, inte listningen. Billigare 'resårsele utan väska' är en annan form som hyllan (Max-On 149) fäller.", 601099566089885)
s("B (närmast A)", "gate 5 PASS på US-pris (16,25 USD → landad 170–200 → 3,0× vid 599; frakt på gjutjärn kan äta det); gate 4 FAIL på det som syns: textfri packshot utan ved, klubba eller hand, ingen video på US-sidan. Blir A om en video visar slaget och stickan inom 3 s.", 601099583674464)
s("B (närmast A)", "gate 4 PASS på heron (överdraget på ett vedställ, röd text i nederkanten beskärbar), video okänd; gate 5 FAIL på US-pris för 8 ft-varianten (34,47 USD → landad 360–422 → 2,4× kräver 864–1 013 kr mot ankare 549). 4 ft-priset okänt. Blir A om 4 ft-varianten kostar ≤ ~110 kr på Temu SE.", 601099615828436)
s("C (ekonomi på US-pris)", "spa-räcke: 79,99 USD → SE-Temu 557–653 → landad 836–980 kr → 2,4× kräver 2 006–2 352 kr; ingen svensk prisnivå under 2 000 kr (Folkpool 2 995 är enda ankaret där). Heron PASS (räcket monterat på spabad, rendering). Lärdom: > 1 000 kr-taket slår före hyllan.", 601099575291512)

# ---- B: en meningsfull osäkerhet kvar ----
s("B (dubblett)", "dubblett av spa-lockskyddet 601099619866532 — välj den med bäst video när Temu går att läsa", 601099524126091, 601099527353718)
s("B (dubblett)", "dubblett av kikarselen 601099566089885", 601099523680456)
s("B", "vedställsöverdrag med öppningsbar front — passform mot ett specifikt (USA-)ställ", 601099588053506)
s("A (villkorad: publik)", "gate 4 PASS på heron (riktig katt sover i kojan utomhus i höstlöv, textfri) — videon är en studiodemo (hopfällning + vattenpärlning) och duger som bevisklipp, inte öppning; gate 5 PASS på US-pris (10,93 USD → landad 114–134 → 4,5–5,3× vid 599, ankare Supercat 1 799 / Kerbl 1 017); hylla verifierad PASS. Enda kvarvarande osäkerhet: publiken — köparen skev mot kvinna, fingeravtrycket säger man 45–70. Varianter: färger + troligen två storlekar (SKU-lista ej läst).", 601101118338671)
s("B (dubblett)", "dubblett av utekattkojan 601101118338671", 601099539458313, 601102077704284, 601104350112825, 601104350023541, 601105519310315)
s("B", "hängrännesats till lövblås: adapterpassform mot svenska blåsar; Husqvarna-sats 359–399 kr är ett lågt sekundärankare", 601103248788835, 601103296007046)
s("B", "väggstöd till stege: Wibe 779–974 / Bauhaus 1 195 som ankare; stegen förvaras inomhus (negativ rymd), U-bultsmontering, 1 m stålfrakt", 601099637369908)
s("B (dubblett)", "dubblett av väggstödet 601099637369908", 601099608814085, 601099758833312, 601100623182916, 601099675920422, 601100243969867, 601099601260136, 601099592830760, 601100130932624)
s("B", "rännstöd i plast till stegen: ingen svensk kanal hittad; ekonomi okänd (US 2-pack $37,99)", 601100858917684)
s("B", "jaktparaply: Ameristep 479 kr enda ankaret; stor/dyr frakt; många svenska torn har tak", 601103949421856)
s("B", "tornsits med spännrem: Carinthia 559 som ankare; ser den ut som ett 49-kronors sittunderlag vinner hyllan", 601099667428425)
s("B (dubblett)", "dubblett av tornsitsen 601099667428425", 601099904892660, 601099744439687, 601103482843682)
s("B", "sopkärlslocklås: Smartaskydd 459 som ankare, objektet bevisat (klistermärkena); Temu-pris troligen < 100 kr → 300-kronorsgränsen; låses upp varje hämtdag", 601101587576926)
s("B (dubblett)", "dubblett av sopkärlslocklåset 601101587576926", 601099601018284, 605655280787928)
s("B", "gevärshållare ATV: ekonomi PASS (34,52 AUD ≈ 218 kr → 849 kr); publik kan vara < 100 000; Temu-bilder visar ingen ATV", 601099522267692)
s("B", "husbil termoskydd utvändigt: Hindermann 1 565 som ankare; chassispecifik variant; 94 000 husbilar (strax under publiktröskeln); känslig kalkyl", 601102148404312)
s("B", "styrstolpar båttrailer: VEVOR 850 som ankare; bultmontering + 1,1 m frakt", 601102184182476)
s("B (dubblett)", "dubblett av styrstolparna 601102184182476", 601100131470883)
s("B", "spatrappa: Folkpool 1 290 / Bauhaus 1 495 som ankare; skrymmande frakt, pris nära 1 000 kr", 601099596495697)
s("B (dubblett)", "dubblett av spatrappan 601099596495697", 603097879412135)
s("B", "poolvärmepumpsskydd: Österlens 499 som ankare; 'passar de flesta' utan mått; publik troligen < 100 000", 601103300703848)
s("B", "hjulpiggar robotgräsklippare: ingen kedja; men SKU per märke/hjulmått och Temu-pris troligen < 100 kr", 601100183382557, 601099514177508, 601101022004142)
s("B", "kupolnät damm: kupolformen finns inte i Sverige (UNCERTAIN); dammens mått måste mätas; publik okänd", 601099601980879)
s("B", "hårdbottnat baksätesskydd hund: hylla verifierad PASS (Kleinmetall Bridge 1 059, kedjorna har bara hängmattor); 'universal' utan mått; skrymmande; jämförelsehandlad kategori", 601099578348331)
s("B (dubblett)", "dubblett av baksätesskyddet 601099578348331", 601101953587389, 601102892618171, 601102889652570, 606051709617623, 606422871955299)
s("B", "isolerad tyghundkoja: Trixie 2 199 som ankare; storlek efter hund; trovärdighet tyg mot svensk vinter", 601105490445990)

# ---- C: avslag som lär oss något ----
s("C (latent behov)", "transom saver-kil: skadan (hydrauliken) syns om år — 55 % av förlorarna hade latent behov; dessutom trimsystem-variant", 601100312972322, 601100200308437)
s("C (want, inte need)", "propellerskydd i tyg: ingen inträffad skada vid annonstillfället (kranskyddets svaghet) + propellerdiameter", 601099611345347)
s("C (< 199 kr)", "snap-förlängare 20-pack: smådel under 199 kr", 601099529754667)
s("C (överdrag + marketplace)", "kajaköverdrag: Lixada 380–436 kr i samma form på PriceRunner; sjätte överdraget i raden — kategorinovelty 35", 601099616420647)
s("C (ankare under vårt pris)", "klyvkon till borrmaskin: CDON/Elgiganten 279 kr i samma form är LÄGRE än vårt 399; vridmoment/säkerhet i recensionerna", 601099512512218, 601099547786201, 601099760920889)
s("C (> 1 000 kr + montering)", "hydraulisk locklyft: två negativa-rymd-flaggor samtidigt", 601101853422243)
s("C (lågt fackhandelsankare)", "filtertvätt: Spabadsbutiken 255 / Kuben 269 — lika dödligt som en kedja; US-gänga kräver adapter", 601101133629438)
s("C (generisk old way ∧ < 300)", "stormband: Biltema-spännband för 79 kr gör samma jobb", 601099592127596)
s("C (< 300 + osynligt objekt)", "pumpsäck: nätpåse för ~50 kr, pumpen känns inte igen i flödet", 601099537193860)
s("C (commodity)", "USB-värmedyna: samma form för 155 kr på PriceRunner; kräver powerbank", 601099898313877, 601099772450298)
s("C (publik + mått)", "bunk-glidpads: svenska trailers är rulltrailers; antal pads kräver mätning", 601100875031411)
s("C (< 300 + fel objekt)", "ekorrbaffel: hylla PASS men svagt ankare (Fyndiq 238); halva publiken har mataren i ett träd; under 300 kr", 606387388178611)
s("C (> 1 000 + spänning)", "uppvärmd vattenautomat höns: hylla UNCERTAIN (värmeplatta 259–389 täcker behovet); troligen > 1 000 kr, US-spänning måste verifieras, frost är framtid i september", 603266490408979)
# torkrock hund (601105260939830 m.fl.) och hinkfälla (601100216234049): FAIL i h5 — hylla-tillamp.py sätter ELIM
s("C (tre flaggor)", "automatisk hönslucka: hylla PASS (Kerbl 1 313–1 899) men montering + ström, förklaring och jämförelsehandlad kategori", 601103331613427, 601100041729214, 601100784585507)
s("C (omtest, inte ny produkt)", "kranskydd 2-pack: REDAN TESTAD (7 416 kr / 28 köp / ROAS 1,59 mot BE 1,49). Ett omtest i oktober är en annan fråga än produktjakten", 601099530394801)

ELIM_SHELF = {"601099548739091": "ATV-kapell: Biltema Helkapell 429 kr i samma form (h3 FAIL)"}

n = 0
for f in sorted(glob.glob(os.path.join(H, "*.json"))):
    if os.path.basename(f) == "dataset.json": continue
    try: data = json.load(open(f, encoding="utf-8"))
    except Exception: continue
    rows = (data.get("candidates") or data.get("kandidater")) if isinstance(data, dict) else data
    if not isinstance(rows, list): continue
    andrad = False
    for r in rows:
        if not isinstance(r, dict): continue
        gid = str(r.get("goods_id") or "")
        if gid in D:
            r.setdefault("tier_agent", r.get("tier"))
            r["tier"], r["tier_reason"] = D[gid]; n += 1; andrad = True
        elif gid in ELIM_SHELF:
            r.setdefault("tier_agent", r.get("tier"))
            r["tier"] = "ELIM"; r["eliminated_at"] = "shelf"; r["tier_reason"] = ELIM_SHELF[gid]; n += 1; andrad = True
    if andrad:
        json.dump(data, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("slutdomar satta:", n, "av", len(D) + len(ELIM_SHELF))
