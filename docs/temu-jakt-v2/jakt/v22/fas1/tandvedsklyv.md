# Tändvedsklyv i gjutjärn (Kindling Cracker-typ) — FAS 1, 2026-09-04

**concept_id:** `tandvedsklyv-i-gjutjarn-kindling-cracker-typ`
**Koncept:** PASS · **Listning:** ALTERNATIVE_LISTING_REQUIRED · **Vinnar-DNA:** 72/100
**Status:** TEST IF VERIFIED

---

## Kort svar på de två frågorna

**A) Hittade jag en listning vars material duger som annons? Nej — och det är ett tekniskt fel, inte ett kommersiellt.**
23 nya kandidatlistningar är identifierade (10 ur `alt/tandvedsklyv.json` + 13 nya), men **ingen gick att hämta**. temu.com svarar med tomt skal på `/se` och med bot-skalet "This item was discontinued" på USA-vägen — samma titel för fyra olika goods-id, även för listningar som Google indexerar med normal titel. Googlebot-UA gav samma resultat. Ingen JSON-LD, inga bild-URL:er, ingen video. Alla nya listningar står som `BLOCKED_SOURCE`.

Den enda listning vars material faktiskt är sett är den redan granskade **601099583674464**: 1 bild, ingen video, textfri packshot på vit bakgrund. Bilden visar dessutom en **bultad hexagonal ram** — alltså montering, som ligger i negativ rymd (30 % av förlorarna).

**B) Dödar frakten på gjutjärn ekonomin? Nej — inte vid 599 kr. Men den dödar 499 kr.**

| Extra fraktkostnad | Landad | 499 kr | 599 kr | 699 kr |
|---|---|---|---|---|
| +0 kr | 170–199 kr | 2,51–2,94× ✅ | **3,01–3,53× ✅** | 3,51–4,12× ✅ |
| +50 kr | 220–249 kr | 2,00–2,27× ❌ | **2,41–2,73× ✅** | 2,81–3,18× ✅ |
| +100 kr | 270–299 kr | 1,67–1,85× ❌ | **2,00–2,22× ❌** | 2,34–2,59× ⚠️ |

2,4×-gränsen kräver landad ≤ 208 kr (499), ≤ 250 kr (599), ≤ 291 kr (699).
Marginalen vid 599 kr är **+51 till +80 kr**. Vid 499 kr är den **+9 kr** — alltså obefintlig.
Stoppregeln (landad > 420 kr) nås aldrig, inte ens med +100 kr.

**Verklighetskontroll på frakten:** setrimmer.se lagerhåller och säljer samma form i Sverige för **288 kr** (standard) och **365 kr** (stor, 2,62 kg), med 1–3 dagars leverans. En svensk aktör kan alltså landa, lagerhålla *och* sälja med marginal på 288 kr — det sätter ett praktiskt tak på fraktkostnaden i den viktklassen.
På AliExpress ligger däremot de **enstyckesgjutna gjutjärnsringarna** (4–8 kg) på 65–90 USD levererat, medan 10–25 USD-artiklarna är lättare svetsad kolstålskonstruktion.
**Slutsats: köp 3–5 kg-versionen, inte 8 kg-versionen, och sätt priset till 599 kr.**

---

## Vad som faktiskt är den största risken

Inte frakten. **Materialet**, och strax därefter **prispositionen**.

**setrimmer.se** (svensk butik, Klarna, 1–3 dagars leverans) säljer i lager:

| Produkt | Pris | Ord. pris | Betyg |
|---|---|---|---|
| Vedklyv för tändved – Standard | **288 kr** | 339 kr | 4,8 |
| Vedklyv för tändved – Stor | **365 kr** | 429 kr | 4,33 |
| Standard vedklyv + Klubba | 449 kr | 558 kr | — |
| Stor vedklyv + Klubba | 539 kr | 648 kr | — |
| Stor vedklyv + Kaminfläkt + Klubba | 729 kr | 947 kr | — |

En kund som googlar "vedklyv tändved" hittar alltså samma sak för halva priset. Det är exakt mönstret som fällde klyvkonen till borrmaskin på CDON 279 kr.

**Två saker gör att det ändå inte fäller konceptet:**

1. Trippeln i negativ rymd är *"old way funkar ∧ jämförelsehandlad ∧ under 300 kr"*. Vårt pris är 599 kr, så trippeln slår inte till.
2. Bundlingen 729 kr hos setrimmer bevisar tvärtom att svenskar betalar över 700 kr för den här produkten när den paketeras rätt.

**Motmedlet:** spela mot ankaret 1 249 kr, aldrig mot 288 kr. Sälj 3–5 kg-versionen som *ser ut som* Kindling Cracker.

---

## Hyllan (gate 3) — verifierad och uppdaterad

**Kedjorna säljer samma form men aldrig under 999 kr.**

| Ankare | Pris | Butiker | Lager |
|---|---|---|---|
| Kindling Cracker Standard | **1 249 kr** | 9+ | ✅ |
| Kindling Cracker Manuell Tändvedsklyvskil | 1 395 kr | 1 | ✅ |
| Kindling Cracker King | 1 799 kr | 9+ | ✅ |
| VEDKLYV HOYLA (K-Bygg) | 1 279 kr | — | ✅ |
| Jula Manuell vedklyv Ø16 cm | 999 kr | — | okänt |
| Clas Ohlson Manuell vedklyv med slägga | 999 kr | — | okänt |

1 249 / 599 = **2,08×** — kravet är ≥ 1,6×. Undantagsregeln (Crocs/Husqvarna/Kjell-mönstret) är uppfylld.

**Nytt sedan h1.json:** de två sub-500-kopiorna som förra hyllkörningen oroade sig för — **Aduro 295 kr** och **Northix 419 kr** — står båda som **Ej i lager** på PriceRunner, alltså 0 butiker. De är inte längre ett alternativ i kundens hand. Kvar som verkligt sub-500-hot är setrimmer.se.

**Ad Library SE, aktiva annonser:** 0 annonsörer på ring+kil-formen.
`vedklyv` ger 68 träffar men alla är bolist.se-katalogannonser (hydraulklyv AL-KO) och VaruZone.se:s klyvkon till borrmaskin (299 kr, en annan form). En svensk aktör, **Viking FireTools**, körde "40 % rabatt idag!" på tändved-klyvning 15 okt–19 nov 2025 — men ingen kör nu.
Internationellt kör **IToolMax** tung annonsering på *väggmodellen* (40–48 % OFF, hundratals annonser sedan januari 2026). Formen är alltså bevisad som annonsprodukt, men det är väggvarianten, inte ringen.

---

## Publik och säsong

**Publik: PASS.** MSB:s nationella register: fler än **1,7 miljoner vedeldade eldstäder** i Sverige, varav ca 600 000 registrerade som oanvända → **~1,1 miljoner i bruk**. Kravet är ≥ ~100 000. Klarat med tiofaldig marginal även om siffran vore halverad. *(MEDIUM konfidens på det exakta talet — sekundärkälla; HIGH på att publiken är stor nog.)*
Profil: man 45–70, småhus/fritidshus, kamin eller vedspis. Huggkubb och vedhög är omisskännliga i flödet. Kroppslig riskkomponent (fingrarna nära eggen) ger samma rädslavinkel som axelbältet och kameran vann på.

**Säsong: PASS, ≥ 12 veckor kvar.** I dag 2026-09-04; eldningssäsongen toppar oktober–november och tändved klyvs hela vintern. Extern bekräftelse: den svenska konkurrenten annonserade mitt i det fönstret förra året. Rätt sida av säsongen — inte "fel/sen säsong", som fällde 25 % av förlorarna.

---

## Vinnar-DNA, steg för steg

| Steg | Utfall |
|---|---|
| 0 Objektet | ✅ veden/vedboden/kaminen ägs redan, står ute, används kroppsligt |
| 1 Presens | ✅ huggkubb + yxa går att fotografera i en svensk vedbod i september |
| 2 Hyllan | ✅ villkorad — ankare 2,08×, 0 svenska annonsörer på formen |
| 3 Materialet | ⛔ **BLOCKED_SOURCE** — hålet i konceptet |
| 4 Priset | ✅ 3,01–3,53× vid 599 kr, BE-CPA 400–429 kr |
| 5 Varianten | ✅ en variant, inget mått ägaren måste ta |
| 6 Hooken | ✅ "Klyver du tändved med yxa?" — 5 ord |
| 7 Publiken | ✅ man 45–70, ~1,1 M eldstäder i bruk |
| Bonus | ✅ flerköp (villa + fritidshus), old way = yxa, säsong ≥ 12 v |

---

## Nästa steg för att lyfta status till TEST NOW

1. **Hämta material** för fem id när Temu-blocket släpper, i den här prioriteringen:
   - `601099702553211` — skyddshandskar ingår, alltså med största sannolikhet en **hand i bild**
   - `601099595396016` — GoPlus, enda **märkeslistningen**; märkesleverantörer har oftare riktig video
   - `601099561039096` — 9 lbs, "one-piece", halv-ring, XL-öppning (bästa strukturella matchning)
   - `601099600046272` — 6,5 tums öppning, 3,9 kg (bästa fraktprofil)
   - `601099555665183` — "solid cast", 9 lbs
2. **Bekräfta vikt ≤ 5 kg och ett riktigt fraktpris** hos leverantören. Undvik `601099811562065` (8,2 kg) tills fraktpriset är känt.
3. **Sätt priset till 599 kr.** Aldrig 499 kr — där finns ingen fraktmarginal alls.

---

*Fullständiga siffror, källor och konfidens per påstående: `tandvedsklyv.json` i samma mapp.*
