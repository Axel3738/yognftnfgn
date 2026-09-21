# Matstrumpor — batch-log (annonser, hypoteser, utfall)

Matstrumpors motsvarighet till `products/<id>/batch-log.md` (ligger i docs/ —
`products/` är Bäverbutikens). Konto: **nya kungen** `730973156224390`.
Kampanj: `MATSTRUMP_SALES_20260825` (`120251184321350023`), ABO, 6 adsets à 200 kr/dag.

## Batch #1 — 2026-08-25, 17 UGC-videor (LIVE, aktiverade av Axel samma dag)

Struktur: ett adset per script, hookvarianter som annonser. Konstant över alla:
primärtext E1 (tvättmedelshooken), rubrik "Rolig i kväll. På fötterna i morgon.",
SHOP_NOW → /products/sushi-strumpor. Variabeln = scriptet, undervariabel = hooken.

**Variabeltaggar (gäller alla 17):** produkt=sushi · vinkel=gift · format=ugc-voiceover ·
offer i creative=nej (offer bara i primärtext/beskrivning) · talare=varierar per video.

| Annons | Hypotes | Utfall (fylls i av nästa /cs) |
|---|---|---|
| s001h1 | Grundarberättelse, panikletande → "praktiskt och oväntat". LUGN (positiv/låg intensitet) — mätpunkten för om låg intensitet funkar för oss | — |
| s002h1–h3 | Hypotes: ej loggad per script (brief-PDF:en ej delad med kopplingen) — sushi/gift-serien | — |
| s003h1–h3 | Hypotes: ej loggad per script (samma skäl) | — |
| s004h1–h4 | "Kuvertet vs paketet" — anti-pengar-i-kort, konfliktvinkel (medel-hög intensitet) | — |
| s006h1–h3 | Hypotes: ej loggad per script (samma skäl) | — |
| s007h1–h3 | Hypotes: ej loggad per script (samma skäl) | — |

Serieövergripande hypotes (loggad i förväg): **hög intensitet slår låg** för det
här varumärket — reaktionen/vändningen är det lediga hörnet (se konkurrentanalysen).
001 är kontrollen på motsatsen.

### Avläsning /cs 2026-08-25 (samma dag som launch) — NOLLRUNDA

Spend 0,23–80,84 kr per annons, **0 köp totalt**. Alla 17 i "för tidigt"-högen
(grind: ≥300 kr OCH ≥3 köp). Ingen dom, ingen ranking, inget teardown på utfall.
Notering utan dom: spendspridningen speglar att annonserna aktiverades vid olika
klockslag — inte prestanda.

**Flaggor från kontot:**
- Annonsen **"Kataloger påriktigt"** (`120251185633200023`) är ACTIVE utanför vår
  kampanj och har spenderat 40,68 kr — Axels egen? Stör inte testet strukturellt
  men spenderar parallellt.
- Gammal pausad "Ny Interaktion Annons" med 1 386,87 kr historisk spend ligger
  kvar i kontot (CAMPAIGN_PAUSED) — ingen åtgärd.

## Batch #2 — hos redigerarna (ej launchad)

Slideshows 010, 011, 013 + **012 v2** (ersätter 012 v1 efter valence/intensity-
analysen) + Sushi Haiku/Fable/opus/somnet + Meet matstrumpor (brand, EJ testABO)
+ 005/008/009 i hubben. Launchas → loggas här med hypoteser före aktivering.

## Nästa avläsning

När minst ett script nått ~300 kr (≈1,5–2 dygn per adset på 200 kr/dag) och köp
börjat ticka. Marginal-CPA-grinden: snapshots ≥3 dygn isär, ≥5 inkrementella köp.

---

# Avläsning 1 — 2026-08-28 (första riktiga `/cs`)

Konto `nya kungen` 730973156224390 · hela livstiden · sorterat på spend.

## Domen: ingen dom går att ge

**Noll annonser passerar signifikansgrinden.** Högsta antal köp på en enskild
annons är **2** — grinden kräver 3. Ingen ranking, ingen vinstbidragstabell,
ingen klassificering av någon creative. Det gäller alla 60 annonserna.

| Annons | Spend | Köp | CPA | ROAS | Läge |
|---|---|---|---|---|---|
| `…_haikuh2_v1` | 2 203,84 kr | 2 | 1 101,92 kr | **0,36** | för tidigt (köp<3) |
| `…_haikuh3_v1` | 679,87 kr | 2 | 339,94 kr | 1,76 | för tidigt |
| `…_s004h4_v1` | 524,29 kr | 2 | 262,15 kr | 1,52 | för tidigt |
| `…_s001h1_v2` | 480,72 kr | 0 | — | — | för tidigt |
| `…_s001h1_v1` | 377,31 kr | 2 | 188,66 kr | 2,11 | för tidigt |
| `…_s003h3_v1` | 359,80 kr | 0 | — | — | för tidigt |
| `…_offer_static_d3_v1` | 104,62 kr | 2 | 52,31 kr | 7,63 | för tidigt (spend<300) |

## Datakvalitet — ett fynd som motsäger ANALYSMETOD:s varning

`spend × purchase_roas` mot `omni_purchase_values`, alla fem rader med köp:
**0,00 % avvikelse på samtliga.** Fältet är alltså **inte** trasigt i det här
kontot. Varningen i `docs/os/ANALYSMETOD.md` gäller MagiBorsten — den ska inte
antas gälla `nya kungen`. Kontrollen körs ändå varje gång.

AOV = 438,90 kr (4 389 kr / 10 köp). Rimligt mot sortimentet (399 kr grundlåda,
en del multiköp) — ingen absurd AOV att flagga.

## Det som ÄR sägbart utan break-even

Break-even-ROAS saknas fortfarande, så vinstbidrag går inte att räkna. Men två
saker följer av ren aritmetik och kräver ingen COGS:

1. **Konto-ROAS för matstrumpor-annonserna: 0,696.** Intäkten är mindre än
   spenden. Break-even-ROAS är per definition alltid ≥ 1,0, så det här är en
   förlust oavsett kostnadsstruktur.
2. **`haikuh2_v1` har ätit 2 203,84 kr — 35 % av all matstrumpor-spend — på
   ROAS 0,36.** Steg 3:s kill-regel kräver ≥500 kr spend och ROAS under
   break-even. Båda är uppfyllda med marginal. Detta är ingen creative-dom
   (2 köp räcker inte för att döma manuset) utan ett spendbeslut.

## Spendläckage utanför testet

**2 045 kr — 24 % av kontots totala spend — ligger på två annonser utan
matstrumpor-namngivning och med noll köp:**

| Annons | Spend | Köp | Läge |
|---|---|---|---|
| `Ny Interaktion Annons med rekommenderade inställningar` | 1 386,87 kr | 0 | CAMPAIGN_PAUSED |
| `Kataloger påriktigt` | 658,13 kr | 0 | CAMPAIGN_PAUSED |

Båda är pausade nu. De ska aldrig räknas in i testets siffror.

## Pixeln — frisk, och den avslöjar något

`MATSTRUMPIRUMPIDUMPI` (1785935302094082): `is_active: true`,
`last_fired_time` 2026-08-28 10:33, `server_last_fired_time` 10:44. Både
webb och server fyrar. Köp bokförs.

**Tratten, 7 dygn:**

| Steg | Antal | Konvertering |
|---|---|---|
| PageView | 1 599 | — |
| ViewContent | 802 | 50,2 % |
| AddToCart | 59 | 7,4 % av ViewContent |
| InitiateCheckout | 36 | 61,0 % av AddToCart |
| Purchase | 20 | 55,6 % av Checkout |

**Pixeln räknar 20 köp. Meta attribuerar 10.** Hälften av försäljningen kommer
alltså inte från annonserna. Det betyder att butiken säljer mer än
annonsrapporten visar — men också att annonsernas verkliga bidrag är svårare att
läsa än ROAS-talet antyder.

## Metrik-diagnos

Hook rate ligger på 94–97 % för **varje** video — det är autoplay, inte kvalitet.
Den är oanvändbar som urskiljare i det här kontot. **Hold rate är där skillnaden
sitter**, och spridningen är stor:

| Annons | Hold | CTR | CPM | Spend |
|---|---|---|---|---|
| `…_s006h3_v1` | **17,9 %** | 2,64 % | 281 kr | 159,73 kr |
| `…_s007h3_v1` | 11,7 % | 1,97 % | 279 kr | 283,66 kr |
| `…_s002h1_v1` | 11,2 % | 1,97 % | 239 kr | 254,86 kr |
| `…_s001h1_v2` | 11,1 % | 2,37 % | 407 kr | 480,72 kr |
| `…_s004h4_v1` | 9,3 % | 1,86 % | 263 kr | 524,29 kr |
| `…_s001h1_v1` | 8,1 % | 3,00 % | 354 kr | 377,31 kr |
| `…_haikuh3_v1` | 8,0 % | 2,99 % | 254 kr | 679,87 kr |
| `…_haikuh2_v1` | **5,6 %** | 1,89 % | 208 kr | 2 203,84 kr |

**Annonsen med sämst hold är den som fått mest budget.** Förklaringen syns i
CPM: `haikuh2` har kontots lägsta CPM (208 kr), så Meta köper billiga
visningar åt den — men de tittar inte klart och de köper inte. Billig räckvidd
utan konvertering är den dyraste sortens spend.

⚠️ **Detta är en hypotes, inte ett bevisat mönster.** Ingen av annonserna har
tillräckligt med köp för att koppla hold till intäkt. Frekvens ligger på
1,0–1,2 överallt — ingen utmattning, publiken är fortfarande färsk.

## Beslut

1. **Pausa `haikuh2_v1`** (`120251218171220023`). Spendbeslut, inte creative-dom.
2. **COGS-frågan är inte längre valfri.** Utan break-even går ingen ranking att
   göra, och nu rör sig riktiga pengar.
3. **Ingen ny batch byggs på den här avläsningen.** Ingenting har passerat
   grinden, och att iterera på brus är precis det ANALYSMETOD finns för att
   förhindra.

## Nästa avläsning

När minst en annons nått ≥300 kr **och** ≥3 köp. Marginal-CPA kräver dessutom
snapshots ≥3 dygn isär och ≥5 inkrementella köp — den här avläsningen är
snapshot 1.

---

# Kontoläge 2026-09-14 (ingen avläsning — bara vad som finns, inför avläsning 2)

Lifetime per kampanj i `nya kungen`, sorterat på spend (`purchase_roas` rakt ur
Meta, okontrollerat): `MATSTRUMP_SALES_20260826` 22 526 kr / ROAS 1,19 ·
`MATSTRUMP_SALES AU` 9 656 kr / 0,97 · `MATSTRUMP_SALES_US_20260828` 6 193 kr /
0,76 · `MATSTRUMP_SALES UK` 5 845 kr / 1,07 · `MATSTRUMP_SALES_20260825`
2 293 kr / 0,70. **~46 000 kr har spenderats sedan avläsning 1**, i fyra kampanjer
varav tre (AU, US, UK) inte finns i något dokument här — de kör svenska
UGC-annonser med `MATSTRUMP_AU_`/`_US_`-prefix.

Största annonser lifetime: `haikuh3_v1` **12 863 kr**, `offer_static_d3_v1`
3 063 kr, `s001h1_v2` 1 721 kr, `012v2_v1` 910 kr. Alla fyra är långt förbi
spendgrinden — köp och vinstbidrag läses vid nästa `/cs`, break-even saknas
fortfarande.

**Upptagna AD-ID:n:** 010v2, 011v2, 012, 012v2, 013, 016, meet, s001–s009,
haiku h1–h3, somnet h1–h3, opus h1, trodde, julstrumpa, november, statics b001–b005,
c, d1–d4, f, **017v1 h1–h3, 017v2 h1–h3, 019 h1–h3, 020 h1–h3, 021 h1–h3** (de
senaste, 0–42 kr spend = just launchade). Nästa lediga nummer: **022.**

Fjolårets julvinnare (~100k spend, ROAS 3–5 enligt Axel) finns **inte** i något
konto kopplingen ser: `Sushi kanske?` (1550615276530638) innehåller
Grillklinikens NO-annonser, `Norge` och `Axel Odhner` är tomma, `Finland DK`
gick inte att läsa.

---

# A/B-test `sortval` — avläsning 1 (2026-09-21)

Testet: sushisidans paketkort. **A** = sidan som förut (en sort, sushins egna
nivåer). **B** = mixa och matcha, en dropdown per låda med alla fyra sorterna,
kollektionsvida koder `STRUMPOR-K1F1-P*` / `STRUMPOR-K2F2-P*`.

**Testfönster:** från order `#4786` 2026-09-18 07:31 (första ordern efter att
Axel publicerade temat) till 2026-09-21 18:49 = 3,5 dygn. Ordrar före `#4786`
är förköp och räknas inte — `#4785` 05:49 samma dag saknar stämpel och bär
A-kod, och hade blivit felräknad som A om fönstret satts till midnatt.

**Butiken:** matstrumpor.se (`1r46tp-qx`), verifierad. Trafik 30 d: 2 348
sessioner, 112 ordrar, 4,77 % konvertering, 78 besökare/dag, snittorder 461 kr.

## Utfall (analys.mjs, oförändrat)

| | A | B |
|---|---|---|
| Ordrar | 9 | 7 |
| Intäkt | 3 790 kr | 3 591 kr |
| Snittorder | 421 kr | 513 kr |

Skillnad i snittordervärde 92 kr (p = 0,292) · lyft B mot A −22,2 % ·
p = 0,8026 · konfidens 19,7 %.

**Beslut: för få köp — 7 av 25 per variant. Ingen dom förrän dess.**

## Vad som ändå är värt att notera

- **Fördelningen är rimlig.** 9 mot 7 på 16 köp är vad man väntar sig av en
  50/50-lottning i den här storleken. Inget tyder på att motorn snedfördelar.
- **B:s snittorder är högre** (513 mot 421 kr) — B står för de två enda
  798-kronorsordrarna (`#4790`, `#4791`, båda `STRUMPOR-K2F2-P4`). Det är exakt
  den mekanik mixläget ska driva, men p = 0,292 betyder att det lika gärna kan
  vara slumpen. **Får inte agera på.**
- **Efterstämplingen fungerar i skarp drift.** Av ordrarna före fixen
  (2026-09-18/19) saknade tre av sex stämpel; av de tio ordrarna efter fixen har
  **alla tio** stämpel. `#4788`, `#4790` och `#4791` härleddes ur rabattkoden
  enligt reservregeln i `.claude/commands/abtest.md`. Noll okända.
- ⚠️ **`#4793` kom från donutsidan** (`DONUT-K1F1`), inte sushisidan. Den bär
  stämpel `a` eftersom motorn stämplar på alla sidor, men kunden såg aldrig det
  som testas. Sådana köp späder ut båda armarna lika mycket (lottningen är
  slumpmässig) men gör effekten svagare att mäta. Vid nästa avläsning: överväg
  att räkna en sekundär tabell med bara sushisidans köp.
- ⚠️ **Konvertering per variant går inte att räkna.** Shopify mäter inte
  sessioner per variant, och motorn skriver bara stämpeln på ordern — inte på
  besöket. Verktygets "lyft" bygger därför på antal köp, inte på besökare.
  Vill vi ha äkta konvertering måste exponeringen loggas någonstans vi kan läsa.

## Nästa avläsning

Takten i fönstret: A 2,6 köp/dygn, B 2,0 köp/dygn. För att nå 25 per variant
behöver B ~9 dygn till och A ~6 — alltså **omkring 30 september**. Observera att
25 köp per variant bara är golvet för att matematiken ska gälla; temats egen
planering (`/abtest planera`, 78 besökare/dag) säger att även ett lyft på 50 %
kräver ~49 dygn. Räkna med att nästa avläsning säger "fortsätt".

**Rör ingenting under tiden** — inga pris-, frakt- eller budgetändringar, och
titta inte varje dag.

