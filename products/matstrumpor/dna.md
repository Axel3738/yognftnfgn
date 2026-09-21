# Creative DNA — Matstrumpor (Sushi-Strumpor)

**Skapad 2026-09-21, körning 1 av 1.** Allt nedan är avläst ur kontot
"nya kungen" `730973156224390`, Shopify och Notion samma dag. Ingen siffra är
hämtad ur en tidigare chatt, och ingen är uppskattad.

Uppladdaren: `/matstrumpor`. Ronden: `/matstrumporkungen`. Facit för tal:
`matstrumpor/konfig.json`.

---

## Produkten

| | |
|---|---|
| Butik | https://matstrumpor.se (Shopify `1r46tp-qx`) |
| Huvudprodukt | Sushi-Strumpor — **5-pack 399 kr**, 3-pack 369 kr (avläst 2026-09-21) |
| Övriga | Pizza 449 kr, Hamburgare 299 kr, Donut 299 kr, presentkort 150 kr |
| AOV | **462,10 kr** (110 betalda ordrar / 30 dagar) |
| Ordern | 90 av 110 ordrar bär **exakt 2 strumpprodukter**. Ätpinnar ligger på 246 av raderna — nästan varje order |
| Kostnad | 120,92 kr för 2 par + 2,9 EUR tull = **153,62 kr** (Axels siffra + ECB-kurs 11,275) |
| Break-even-ROAS | **1,498 utan moms** · **2,139 med moms** — ⚠️ öppen fråga |

⚠️ **Kostnaden saknar tre poster:** fraktkostnaden till kund, betalväxelns
avgift och svinn/returer. Break-even ovan är alltså i bästa fall. När de
siffrorna finns: skriv in dem i konfigen och räkna om.

---

## Läget i kontot (14 dagar till 2026-09-21)

Kampanjen `MATSTRUMP_SALES_20260826`, CBO 1 000 kr/dag:
**17 031 kr spend · ROAS 1,392.** Det är under break-even på **båda**
momslinjerna. Produkten går alltså back i dag, inte plus.

**De fem bedömbara annonserna, rangordnade på vinstbidrag (utan moms — den
mest generösa linjen):**

| Vinstbidrag | Annons | Spend | Köp | CPA | Ordervärde | ROAS |
|---|---|---|---|---|---|---|
| **+1 055 kr** | `MATSTRUMP_sushi_offer_static_d3_v1` | 2 873 kr | 10 | 287 kr | 589 kr | 2,05 |
| +431 kr | `MATSTRUMP_sushi_gift_ugc_s001h1_v2` | 901 kr | 3 | 300 kr | 665 kr | 2,21 |
| +286 kr | `MATSTRUMP_sushi_gift_ugc_haikuh2_v1` | 2 577 kr | 10 | 258 kr | 429 kr | 1,66 |
| −708 kr | `MATSTRUMP_sushi_gift_ugc_012v2_v1` | 1 740 kr | 4 | 435 kr | 387 kr | 0,89 |
| **−2 968 kr** | `MATSTRUMP_sushi_gift_ugc_haikuh3_v1` | 7 776 kr | 17 | 457 kr | 424 kr | 0,93 |

Resten av kontots 60 aktiva annonser ligger under 100 kr och är inte bedömbara.

### Tre mönster som datan faktiskt bär

1. **Top spendern är kampanjens problem, inte dess motor.** `haikuh3` äter
   **46 % av all spend** och tappar ~3 000 kr på 14 dagar även på den
   generösaste linjen. Den är kampanjens *riktmärke* (mest spend) men bär
   noll vinst — alltså **inte skyddad** av benchmark-regeln. Utan den hade
   kampanjen legat på plus.
2. **Bild slår video på pengarna.** Adsetet `broad_advplus_purchase_bilder`
   gör ROAS 2,20 mot `nya16`:s 1,18, och den enskilt lönsammaste annonsen är
   en STATISK erbjudandebild (`offer_static_d3`, +1 055 kr). Tolv av
   kontots femton bäst spenderande annonser är däremot UGC-video. Vi lägger
   alltså pengarna där avkastningen är sämst.
   ⚠️ Bygger på 10 köp. Ett mönster, inte ett bevis.
3. **Ordervärdet skiljer sig kraftigt mellan annonser** — 387 kr till 665 kr
   per order. Annonser som drar köpare till 5-packet är värda mer per köp än
   CPA:n ensam visar. Därför räknas break-even-CPA på annonsens EGET
   ordervärde i `matstrumpor/ekonomi.mjs`, inte på kampanjens AOV.

---

## Vinklar och format i kontot

**Vinklar som körts:** `gift` (dominerar), `offer`, `curiosity`, `identity`,
`social`, `pain`, `conflict`, `fomo`, `vandning`, `anvandning`, `pris`,
`skamt`, `position`.
**Format:** `ugc`, `static`, `product`, `beforeafter`, `comparison`,
`lifestyle`, `textheavy`, `anim`.

`gift` (present) är den vinkel som fått nästan all spend. Den fungerar —
men den är också den enda som testats på riktigt, så "gift vinner" är
obevisat: den har inte haft någon motståndare med budget.

**`jul` är en ny vinkel från 2026-09-21** och är samtidigt routingnyckeln:
julmaterial hamnar i jul-adseten. En julstrumpa har redan körts
(`MATSTRUMP_sushi_gift_ugc_julstrumpa_v1`, 17,55 kr — ingen leverans) och
Axels egen `Sofie H2 julstrumpa …` ligger på 8,68 kr. Ingen av dem har data.

---

## Avatarer

*Ännu inte skrivna.* Ingen avatarlista finns i repot för den här produkten,
och en påhittad avatar är värre än ingen. Skriv listan (max 4, var och en med
källa) innan nästa briefrond — `/matstrumporkungen` steg 6 kräver
`avatar`-taggen på varje brief.

Det som GÅR att säga ur datan: ordern är nästan alltid 2 produkter och
ätpinnar följer med i de flesta ordrar — det ser ut som present- eller
samlarbeteende, inte som ett behovsköp. Kolla det mot kommentarerna
(`node tools/annonskommentarer.mjs`) innan det skrivs som en avatar.

---

## Nästa steg (i ordning, vinst snabbast först)

1. **Momsfrågan till Axel.** Hela skillnaden mellan "sänk budgeten" och
   "skala" ligger i den. 1,50 eller 2,14 — ingenting kan avgöras däremellan.
2. **`haikuh3`.** 46 % av spenden, −2 968 kr. Ska den pausas eller är den
   medvetet igång? Det är en 7 776-kronors fråga per 14 dagar.
3. **Fler statiska erbjudandebilder** — den enda bevisat lönsamma formen i
   kontot, och den billigaste att producera.
4. **Lärdomarna.** Noll skrivna. Brieftaket är därför 0 tills de finns:
   ingen brief får skrivas förrän lärdomen bakom den är skriven.
