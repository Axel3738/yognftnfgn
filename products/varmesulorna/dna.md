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
