# Creative DNA — ATV-Kapellet 3XL 256 × 110 × 120 cm

Skapad 2026-09-24 av /rond-auto (andra körningen, 05:55 UTC) när behovet
`forsta_batch` stod i planen: produkten klarade testet (1 975 kr, 39,9 % vinst)
på två dygn. **Första riktiga batchen är INTE skriven** — se batch-log.md för
varför. Det här är FAS 0–6 ur `/forsta-batch`, så att briefsteget kan börja
direkt när lärdomarna finns.

Kampanj `120250320718080291` (MagiBorsten SE), launch 2026-09-22 02:30,
1 000 → 1 500 kr/dag (SKALA 2026-09-24 05:20). Break-even **1,52** ur
prissheetet (kostnad 16,77 USD + 2,9 EUR, pris 579 kr; kampanjnamnet säger
1.62 — sheetet vinner). Produkten kom via Product test center
("10 ATV-kapell 3XL", Ansvarig Josh, Drive-mapp `ATV-Kapell`
`1g8zYtpAlok3lXvwpR0eLhIl9uGmMvLwp`). Ingen Notion-hub ännu.

## FAS 0 — vad som faktiskt lästes (2026-09-24)

| Källa | Nådd | Not |
|---|---|---|
| Meta, annonsnivå (maximum + last_3d) | ✅ | 16 annonser: 11 ACTIVE, 5 PAUSED (`SP_1_H1/H2/H3`, `SP_2_1`, `G_2_1` — ingen loggrad, ronden pausade dem inte; troligen redan vid launch) |
| Hook rate / hold rate | ❌ | MCP-verktyget stöder inte `video_play_actions`/`video_view` på annonsnivå — bara `video_thruplay_watched_actions` (15 s). Hook rate går inte att räkna förrän etikettjobbet dag 7 hämtar det med `time_range` |
| Live copy (primärtext/rubrik) | ⚠️ | `ads_get_creatives` listar nyast först, 100 per sida — ATV:s creatives låg utanför första sidan. Copyn nedan är läst ur Joshs adcopy-dokument i Drive, inte ur den live annonsen |
| Videornas manus | ❌ | Videorna hämtades inte (qa-frames kördes inte). Drive bär `PD_1_H1/H2/H3`, `CS_1_H1/H2/H3`, `G_1_H1/H2/H3`, `SP_1_H1/H2/H3` — manusen är inte transkriberade |
| Statiska bilder | ⚠️ | `PD_2_1`, `CS_2_1`, `G_2_1`, `SP_2_1` (png i Drive) — inte visuellt granskade i den här körningen |
| Landningssida | ✅ | 579 kr / jämförpris 759 kr, en storlek (3XL), svart, 5 bilder + gif. Sidan lovar BARA: damm/löv/skräp lägger sig på kapellet i stället för lacken, heltäckande, 256 × 110 × 120 cm, diskret svart. "Livsstilsbilderna är AI-genererade illustrationer" står på sidan |
| Recensioner | ⚠️ | Sidan visar "10 recensioner" (Judge.me). Drive-arket `ATV-kapell_REVIEW` bär exakt de tio, alla 5 stjärnor, alla daterade 2026-09-21 (dagen före launch), alla med adresser `@example.com`. **De är launchflödets importrader, inte verifierade kundomdömen — får aldrig citeras i en annons.** Inga review-bilder förrän riktiga recensioner finns |
| Kommentarer på annonserna | ✅ | 1 kommentar på `PD_1_H1` (30 d): *"Min står inne"*. Inget kluster ≥ 3 — ingen INVAND-variant ur kommentarerna (`tools/annonskommentarer.mjs` 2026-09-24) |
| Annonsidéer (Axels databas) | ✅ | 0 rader med Status "Ny" 2026-09-24 — inget från Axel om produkten |
| Shopify-försäljning | ❌ | inte korsvalidered i den här körningen |

## FAS 1 — kampanjöversikt (2026-09-22 → 05:55 UTC 2026-09-24)

| | Värde |
|---|---|
| Spend sedan start | 1 975,49 kr |
| Köp | 11 |
| ROAS (kontots standardattribution) | 4,04 |
| CPA | 180 kr |
| AOV (spend × ROAS ÷ köp) | 726 kr — högre än priset 579 kr ⇒ en del ordrar bär mer än en enhet eller mer i korgen. Ingen datakvalitetsflagga: talet är räknat ur `amount_spent × purchase_roas`, aldrig ur `omni_purchase_values` |
| Break-even-CPA | 726 ÷ 1,52 = **479 kr** |
| Target-ROAS (25 % vinst) | 2,44 |
| Dygn | 22/9: 767 kr, 6 köp, ROAS 5,06 · 23/9: 1 061 kr, 4 köp, ROAS 2,95 (CPA 128 → 265 kr: en stigning, för tidigt att kalla trend) |

Funneln på `PD_1_H1` (enda annonsen med volym): 10 453 visningar → 287 klick
(CTR 2,7 %) → 172 LPV (60 % av klicken) → 11 köp (**6,4 % av LPV**). Läckan
sitter inte på sidan — 6,4 % LPV→köp är högt. Läckan är att 15 av 16 annonser
inte får spend.

## FAS 2 — klassificering (signifikansgrind ≥ 300 kr OCH ≥ 3 köp)

| Annons | Format | Spend | Andel | Köp | CPA | ROAS | Vinstbidrag (479 − CPA) × köp | Hög |
|---|---|---|---|---|---|---|---|---|
| `ATVKapell_PD_1_H1` | video | 1 409 kr | 71 % | 11 | 128 kr | 5,67 | **3 861 kr (100 %)** | **bedömbar — top spender = benchmark** |
| `ATVKapell_PD_1_H3` | video | 393 kr | 20 % | 0 | — | — | −393 kr | för tidigt (0 köp; 66 klick, 44 LPV, ingen konvertering) |
| `ATVKapell_CS_1_H3` | video | 40 kr | 2 % | 0 | — | — | — | för tidigt |
| `ATVKapell_G_1_H2` | video | 30 kr | 2 % | 0 | — | — | — | för tidigt |
| `ATVKapell_G_1_H3` | video | 29 kr | 1 % | 0 | — | — | — | för tidigt |
| `ATVKapell_PD_1_H2` | video | 26 kr | 1 % | 0 | — | — | — | för tidigt |
| `ATVKapell_PD_2_1` | bild | 15 kr | 1 % | 0 | — | — | — | för tidigt |
| `ATVKapell_CS_1_H2` | video | 15 kr | 1 % | 0 | — | — | — | för tidigt |
| `ATVKapell_CS_1_H1` | video | 13 kr | 1 % | 0 | — | — | — | för tidigt |
| `ATVKapell_CS_2_1` | bild | 13 kr | 1 % | 0 | — | — | — | för tidigt |
| `ATVKapell_G_1_H1` | video | 9 kr | 0 % | 0 | — | — | — | för tidigt |
| `SP_1_H1`, `SP_1_H2`, `SP_1_H3`, `SP_2_1`, `G_2_1` | video/bild | 0 kr | — | 0 | — | — | — | PAUSED sedan launch — ingen data |

**En enda bedömbar annons.** Allt annat är brus tills etiketten dag 7
(2026-09-29). Ingen får dömas som förlorare i dag — `INGEN_LEVERANS` sätts av
etikettjobbet, inte av mig.

## FAS 3 — teardown av `ATVKapell_PD_1_H1` (läst ur adcopy-dokumentet, inte ur videon)

Copyn (Drive `ATV-kapell_PD_adcopy_1`, "DEMO"):
> Din ATV förtjänar bättre än att stå ute och skadas av vädret. 🌧️ ✅ Vattentätt, vindtätt och UV-skyddat ✅ Passar de flesta märken – Polaris, Honda, Yamaha, Can-Am ✅ Ingen mer skrapning eller tvätt innan du kör. Dra bara på kapellet och glöm bort vädret. 👉 Beställ ditt ATV-Kapell idag.
> Rubrik: *Skydda din ATV – hela året*

| Komponent | Exakt rad (ur adcopy-dokumentet) | Valens | Awareness | Avatar |
|---|---|---|---|---|
| HOOK (text) | "Din ATV förtjänar bättre än att stå ute och skadas av vädret." | negativ → omsorg | problem-medveten | ATV-ägaren som parkerar ute |
| BRIDGE | "Vattentätt, vindtätt och UV-skyddat" | positiv | lösnings-medveten | samma |
| HOLD | "Passar de flesta märken – Polaris, Honda, Yamaha, Can-Am" / "Ingen mer skrapning eller tvätt innan du kör" | positiv, invändningen "passar den min?" | produkt-medveten | samma |
| CTA | "Dra bara på kapellet och glöm bort vädret. Beställ ditt ATV-Kapell idag." | neutral | — | samma |

⚠️ **Offer-integritet (regel 7 i /forsta-batch):** "vattentätt, vindtätt,
UV-skyddat", märkeslistan och "tre spännband"/"Oxford-tyg" (CS/SP-dokumenten)
**står inte på produktsidan.** Sidan lovar damm/löv/skräp och måtten. Nästa
batch får bara använda sidans egna löften tills Axel lagt in materialfakta på
sidan. Tillåtna tal: 579, 759, 256, 110, 120, 3XL.

**Bärande komponent = hypotes (gissning, 11 köp på två dygn):** VO-hooken i
H1 — samma koncept med annan hook (H2: 26 kr, H3: 393 kr utan köp) fick
ingen leverans respektive inga köp. Videon är inte läst, så vad i H1:s
öppning som skiljer går inte att säga än. Det är första saken etikettjobbet
och lärdomen ska läsa av (qa-frames på `ATV-kapell_PD_1_H1.mp4`, Drive-id
`1-8-ycjSrheQilknhRhfPfsbVAriiFPu-`).

## FAS 4 — förlorarna

Inga bedömbara förlorare än. Observation (ingen dom): `PD_1_H3` tar 20 % av
spenden med 44 LPV och 0 köp — samma koncept, samma sida, annan hook. Om
det håller till dag 7 är det hooken som väljer publik, inte sidan som tappar.

## FAS 5 — DNA (allt är hypotes till dag 7)

| | |
|---|---|
| **Behåll alltid** | PD-vinkeln (produkten i användning, "dra bara på kapellet"), priset 579 kr synligt, produkten i bild före sekund 4 |
| **Testa kontrollerat** | tre iterationer på `PD_1_H1` (ny hook, längre problemdel, in media res) — CS-KLART:s manuslista; SO-vinkeln höst/vinter (löv, snö — sidans egna ord) |
| **Undvik** | påhittade recensioner (de tio är importrader), materialpåståenden som inte står på sidan, "bara idag"-rabatt (CS-dokumentets mall bär `[X]% rabatt – bara idag` = påhittad brådska) |
| **Obevisat** | G (present), CS (prisankare) och SP (social proof) — tillsammans 149 kr spend, ingen leverans. Ingen dom |

## Variabeltabell (vinstbidrag per variabelvärde)

| Variabel | Värde | Annonser | Spend | Vinstbidrag | Slutsats |
|---|---|---|---|---|---|
| Vinkel | PD | 5 | 1 843 kr | 3 861 kr | bevisad som vinkel (11 köp), men på EN annons |
| Vinkel | CS / G / SP | 11 | 149 kr | 0 | obevisat — ingen leverans |
| Format | video | 12 | 1 957 kr | 3 861 kr | hypotes: video bär allt |
| Format | statisk | 4 | 28 kr | 0 | obevisat |
| Hook | PD H1 mot H2/H3 | 3 | 1 409 / 26 / 393 kr | 3 861 / 0 / −393 | **hypotes: hooken är variabeln** |

## Avatarer

1. **ATV-ägaren som parkerar ute** (regn, löv, damm på lacken) — källa: den
   live copyn "stå ute och skadas av vädret", 11 köp på två dygn.
2. **Den som parkerar inne** — källa: kommentaren *"Min står inne"* (1 st).
   Sidans eget svar finns redan: damm och skräp lägger sig i garaget också.
   Blir en OB-brief först när klustret når 3 eller Axel säger till.
3. **Anhörig som köper present** (G-vinkeln) — ingen data, 68 kr spend.

## Öppna frågor till Axel

- Materialfakta (vattentätt? tyg? spännband?) står inte på produktsidan men i
  Joshs copy — ska sidan uppdateras, eller ska copyn hålla sig till sidan?
