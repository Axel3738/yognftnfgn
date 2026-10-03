# Creative DNA — Värmesulorna med Fjärrkontroll

Skapad 2026-09-29 kväll av rond-auto-sessionen på Axels fråga samma kväll ("När får dom hubbar då??????"),
när `forsta_batch` stod i rondens annonsbehov (4 127 kr, 45,5 % vinst, veckokvot 3). Rutinen hade väntat
på dag 7-etiketterna (annonserna skapade 2026-09-26 ⇒ etikett 2026-10-03) — ägaren beställde hubben nu,
så lärdomen för föräldern är **förtida (dag 4) och preliminär**; etiketten dag 7 bekräftar eller river den.

Kampanj `120250377836130291` (MagiBorsten SE), launch 2026-09-26, 1 000 → 2 000 (SKALA 28/9) → 4 000 kr/dag
(SKALA 29/9). Break-even **1,52** ur prissheetet (kampanjnamnet säger 1.64 — sheetet vinner). Produkten kom via
Product test center ("11 Värmesulorna", Ansvarig Josh, Drive-mapp `11 Värmesulorna` `1QZwRqQ_AYLPUDdkWv6w8Ye4LBX4fpyfe`).
Notion-hub: **Heated insoles creative hub** `3ea270ab-908c-81fc-b44f-e26f3734a33f` (datakälla `7ff270ab-908c-821b-990e-074e579f3062`),
skapad 2026-09-29 kväll ur MALL, med batch #1 + fars dag-blocket i samma steg.

## FAS 0 — vad som faktiskt lästes (2026-09-29 kväll)

| Källa | Nådd | Not |
|---|---|---|
| Meta, annonsnivå (lifetime, Graph v21.0) | ✅ | 16 annonser, alla ACTIVE. Spend, köp, ROAS, impressions, klick, LPV, ATC, video plays/thruplay per annons |
| Hook rate / hold rate | ⚠️ | Bara thruplay ÷ plays (15 s) ur Graph — 8 % på vinnaren. Riktig hook rate (3 s) kommer med etikettjobbet dag 7 |
| Live copy (primärtext/rubrik) | ✅ | Läst ur `creative.object_story_spec`/`asset_feed_spec` på varje annons |
| Videornas manus | ❌ | Inte transkriberade (ffmpeg saknas i containern). Drive bär PD_1_H1/H2/H3, SP_1_H1–H3, G_1_H1–H3, CS_1_H1–H3 + fyra png |
| Statiska bilder | ⚠️ | PD_2_1V (230 kr), SP_2_1, G_2_1, CS_2_1 — inte visuellt granskade |
| Landningssida | ✅ | 869 kr / jämförpris 1 139 kr, en variant (klipps 41–46). Sidan lovar BARA: tre lägen (hög/medel/låg), fjärrkontroll i nyckelringsformat, klipps längs tryckta linjer 41–46, vanlig USB-kabel, 2000 mAh "enligt leverantören", 4–10 timmar "enligt leverantören" |
| Recensioner | ⚠️ | Drive-arket `Värmesulorna_REVIEW` = launchflödets importrader (som ATV-Kapellet 24/9). **Får aldrig citeras.** Inga review-bilder |
| Annonsidéer (Axels databas) | ✅ | 0 rader "Ny" för produkten (svepet 2026-09-29) |
| Shopify-försäljning | ❌ | inte korsvaliderad i den här körningen |

## FAS 1 — kampanjöversikt (2026-09-26 → 2026-09-29 kväll, lifetime)

| | Värde |
|---|---|
| Spend | 7 515 kr |
| Köp | 25 |
| Intäkt (spend × ROAS) | 27 070 kr |
| ROAS | 3,60 |
| CPA | 301 kr |
| AOV | 1 083 kr — över priset 869 kr ⇒ en del ordrar bär mer än ett par |
| Break-even-CPA | 1 083 ÷ 1,52 = **712 kr** |
| Target-ROAS (25 % vinst) | 2,46 (ur ronden) |
| CTR | 2,47 % · LPV/klick 62 % · köp/LPV 3,2 % |

Funneln läcker inte på sidan (3,2 % LPV→köp); läckan är att 15 av 16 annonser inte får spend — Meta
har valt PD_1_H2 (71 %) och SP_1_H3 (18 %).

## FAS 2 — klassificering (signifikansgrind ≥ 300 kr OCH ≥ 3 köp)

| Annons | Format | Spend | Andel | Köp | CPA | ROAS | Vinstbidrag (712 − CPA) × köp | Hög |
|---|---|---|---|---|---|---|---|---|
| `Värmesulorna_PD_1_H2` | video | 5 369 kr | 71 % | 24 | 224 kr | 4,88 | **11 728 kr** | **bedömbar — top spender = benchmark** (preliminär vinnare, dag 4) |
| `Värmesulorna_SP_1_H3` | video | 1 338 kr | 18 % | 1 | 1 338 kr | 0,65 | −626 kr | spend utan köp: preliminär förlorare (1 köp, under 3-köpsgrinden — ingen dom) |
| `Värmesulorna_PD_1_H3` | video | 420 kr | 6 % | 0 | — | — | −420 kr | för tidigt (0 köp) |
| `Värmesulorna_PD_2_1V` | bild | 230 kr | 3 % | 0 | — | — | — | för tidigt |
| 12 övriga (PD_1_H1, SP_1_H1/H2, SP_2_1, G_1_H1–H3, G_2_1, CS_1_H1–H3, CS_2_1) | | 0–64 kr | 2 % | 0 | — | — | — | ingen leverans |

## FAS 3 — teardown av `Värmesulorna_PD_1_H2` (läst ur den live copyn, inte ur videon)

Primärtext: *"Kalla fötter förstör hela dagen. 🥶 / Inte längre. / Värmesulor med fjärrkontroll ger dig varma
fötter — direkt, utan att ta av skorna. / ✅ 3 värmenivåer ✅ Upp till 8 timmars värme ✅ Styr allt med
fjärrkontrollen / Perfekt för skidbacken, jobbet eller matchen på söndag. / 👉 Beställ dina idag."*
Rubrik: *"Varma fötter — hela dagen, varje gång"*.

| Komponent | Rad / bild | Not |
|---|---|---|
| HOOK | VO 0–3 s: inte avläst. Primärtext rad 1: problemet ("Kalla fötter förstör hela dagen") | negativ → lättnad |
| BRIDGE | "utan att ta av skorna" — fjärrkontrollen | sidans egen mekanism |
| HOLD | "3 värmenivåer / Upp till 8 timmars värme / fjärrkontrollen" | ⚠️ "8 timmar" står inte på sidan (sidan: 4–10 timmar enligt leverantören) — får inte ärvas |
| CTA | "Beställ dina idag" | mjuk brådska |

**Bärande komponent = hypotes (preliminär, dag 4):** videons första tre sekunder. PD_1_H1 (64 kr), PD_1_H2
(5 369 kr, 24 köp) och PD_1_H3 (420 kr, 0 köp) bär IDENTISK text — bara öppningen skiljer. Samma mönster som
ATV-Kapellet (PD_1_H1 mot H2/H3). Vad i H2:s öppning som skiljer är oläst (videon inte transkriberad).

## FAS 4 — förlorarna (preliminärt)

| Element | Vinnare PD_1_H2 | SP_1_H3 (1 338 kr, 1 köp) | Trolig påverkan | Nästa test |
|---|---|---|---|---|
| Copy | problem → mekanism (fjärren) → tre lägen | femstjärnigt "citat" + "Tusentals svenskar" (importrader, får inte finnas) | SP-copyn lovar sådant sidan inte bär; CTR lika (2,5 %) men köp/LPV 0,9 % mot 3,9 % | ingen iteration på SP; SP-raderna stryks ur allt nytt |
| Öppning | oläst | oläst | — | etikett dag 7 + transkribering |

Inget pausas i kväll: SP_1_H3 har 1 köp (under grinden) och ronden dömer på dag 7 med spendtjuvsspärren.

## FAS 5 — DNA (allt är hypotes till dag 7)

**Behåll alltid (preliminärt):** demo-öppningen ur PD_1_H2; problem → fjärrkontrollen som mekanism; sidans egna
fakta (tre lägen, klipps 41–46, USB, nyckelring). **Testa kontrollerat:** hooken (sidans egen älgpass-scen;
mekanismen först), ny avatar (den som står stilla på jobbet). **Undvik:** "8 timmar", stjärnor/citat,
"tusentals", "idag/bara idag/få kvar" (CS_1/CS_2 bär allt detta och fick 0–34 kr), presentvinkeln G utan data.
**Obevisat:** statiska (PD_2_1V 230 kr, 0 köp), CS (pris), G (present).

## Variabeltabell (vinstbidrag per variabelvärde, preliminär)

| Variabel | Värde | Spend | Köp | Vinstbidrag |
|---|---|---|---|---|
| Vinkel | PD (demo) | 6 083 kr | 24 | 11 308 kr |
| Vinkel | SP (social proof) | 1 378 kr | 1 | −626 kr |
| Vinkel | CS / G | 54 kr | 0 | −54 kr |
| Format | video | 7 235 kr | 25 | 11 102 kr |
| Format | bild | 280 kr | 0 | −280 kr |

## Avatarer (taggar — `avatar=` i briefer)

| Tagg | Vem | Källa | Status |
|---|---|---|---|
| `jagaren-som-star-stilla-pa-passet` | Jägaren som står stilla timme efter timme på älgpasset och får de första kalla stötarna i tårna efter en kvart | sidans egen rad ("Kylan kryper uppåt innan passet ens är halvvägs") | sidans avatar; vinnarens copy säger "skidbacken, jobbet eller matchen" — vem som köpte är oläst |
| `den-som-star-stilla-pa-jobbet` | Den som står stilla på ett kallt golv eller ute på jobbet (lager, bygge, lift, torg) | vinnarens copy ("jobbet"); gissning | obevisad — PD_3_H1 |
| `partner-eller-barn-som-koper-present` | Presentköparen (G-vinkeln, fars dag) | G_1/G_2: 1–9 kr, ingen leverans; fars dag-blocket FD_3/FD_4 | obevisad |

## Öppna frågor till Axel

- Ingen. Break-even: sheetet (1,52) mot kampanjnamnet (1.64) — ronden läser namnet; briefen räknar på sheetet som produktkartan.

## Fars dag-blocket 2026-09-29 (BOF)

Invändningen "passar de i mina skor?" → klipps längs de tryckta linjerna 41–46, styrs med fjärren.
FD_3_H1–H3 + FD_4_1–4 i hubben (regel: `agent/farsdag.json`).

## Komponentkarta Värmesulorna_PD_1_H2 (BREAKTHROUGH, etikett 2026-10-03 — ANALYSMETOD steg 6b)

Raderna är **lästa ur den live annonsen (Meta Graph v21.0, 2026-10-03), inte ur brief** — lanseringsbriefen ligger i Product test center ("11 Värmesulorna", Josh), inte i repot. Videon (4393577100957766, skapad 2026-09-26) är inte transkriberad (VO och första bildruta okända). Den preliminära dag 4-läsningen (FAS 3 ovan, 2026-09-29) bekräftas av etiketten: samma copy, samma tre syskon.

**Datan, första veckan 26/9–2/10 (7d_click):** 13 888 kr (73 % av kampanjens 19 066 kr) · 32 köp · ROAS 2,48 mot kampanjens 2,19 · CPA 434 kr mot break-even-CPA ~707 kr (AOV 1 075 kr ÷ 1,52) · vinstbidrag (707 − 434) × 32 ≈ **8 700 kr** · konverteringsgrad 2,1 % (32 köp / 1 526 LPV) · hook rate 42 % · hold rate 8 % · budget dag 0 → dag 7: 1 000 → 4 000 kr/dag (ronden ×2 28/9 och ×2 29/9). Syskonen PD_1_H1 (1 %, LOSER) och PD_1_H3 (7 %, LOSER) bär ordagrant samma primärtext, rubrik och beskrivning — videons öppning är variabeln. Bedömbar förlorare bredvid: SP_1_H3 (18 %, 6 köp, ROAS 1,71, CPA 567 kr; copyn bär importcitat, "tusentals" och "30 dagars öppet köp" — ärvs aldrig). Lärdom `lardomar.md` → L-120250377855700291 (dag 7-blocket; det preliminära dag 4-blocket står kvar ovanför).

| Komponent | Exakt rad (läst ur annonsen, inte ur brief) | Valens | Awareness | Avatar |
|---|---|---|---|---|
| HOOK (text) | "Kalla fötter förstör hela dagen. 🥶" | smärta, igenkänning | problem-medveten | den som fryser om fötterna när hon står stilla (copyn: "skidbacken, jobbet eller matchen på söndag") |
| HOOK (bild) | okänd — videon inte transkriberad, thumbnailen inte läst; H1/H3 med samma text fick 1 % och 7 %, så öppningsklippet är det som skiljer | — | — | samma |
| BRIDGE | "Inte längre. / Värmesulor med fjärrkontroll ger dig varma fötter — direkt, utan att ta av skorna." ("direkt" är ett tidslöfte sidan inte gör) | lättnad | lösnings-medveten | samma |
| HOLD | "✅ 3 värmenivåer ✅ Upp till 8 timmars värme ✅ Styr allt med fjärrkontrollen" ("8 timmar" står inte på sidan — ärvs aldrig) · beskrivning "Ladda, lägg i skorna, tryck på knappen." | konkret inventarium | produkt-medveten | samma |
| CTA | "Perfekt för skidbacken, jobbet eller matchen på söndag. 👉 Beställ dina idag." · rubrik "Varma fötter — hela dagen, varje gång" | positiv, mjuk brådska | — | samma |

**Variabeltaggar (ANALYSMETOD 6b):** vinkel PD · hook-typ problem-påstående · format video, demo (VO okänd) · proof mekanismen (fjärrkontrollen) · offer inget pris i copyn · talare okänd · brådska mjuk ("idag") · tro "8 timmar" (obelagd siffra).

**Bärande komponent = hypotes (gissning):** videons öppning — tre annonser med identisk text, en tog 73 %, och hook rate 42 % mot hold rate 8 % säger att de första tre sekunderna väljer publiken medan kroppen tappar den; konverteringsgraden 2,1 % är hälften av Täljsetets (1,7 %/3,0 % på dag 2) och Värmesitsens (3,3 %), så det är auktionsvolym snarare än stängning som bär. Kampanjens CPA steg fem dygn i rad (161 → 935 kr) när budgeten gick till 4 000 kr/dag och öppningen ensam fick 73 % — spendtjuven dömde den som TROTT_VINNARE i morse (8 156 kr på 3 dygn, ROAS 1,00) och ronden kapade budgeten till 500 kr (livstidsspärren). Fixet är nya öppningar på samma kropp (CPA-regeln 2026-09-22), inte budget. Kundernas kommentarer: 0 leads (agent/leads.mjs --prefix Värmesulorna, 2026-10-03).

**Vidarebyggena (CS-KLART punkt 9, tre iterationer inom 14 dagar — deadline 2026-10-17):** `Värmesulorna_PD_1_H4` (ny hook: sidans älgpass-scen) och `Värmesulorna_PD_1_H5` (mekanismen först) — briefade 2026-09-29 i batch #1 (Draft i Heated insoles creative hub; ⚠️ utan BRIEF-rader i loggen, byggda på Axels order utan `lardom.mjs --brief`, så iterationsräknaren ser 0 av 3 tills H6 loggas); `Värmesulorna_PD_1_H6` (in media res: fjärren trycks och sulan ligger redan i skon i sekund 0) namngiven i lärdomen 2026-10-03 och briefas i nästa runda på produkten. Två rader ärvs aldrig: "Upp till 8 timmars värme" och "direkt".
