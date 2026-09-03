# Creative DNA — Gravstenspennan

Skapad 2026-09-03 av `/forsta-batch`-flödet (körning nr 1, automatisk rutinkörning
via `agent/rond.mjs`-behovet `ersatt`), loggad som `CS_BATCH_KLAR` (INTE
`FORSTA_BATCH_KLAR` — produkten har redan haft spend/annonser sedan launch, bara
inget minne i det här systemet innan idag). Datakälla: MagiBorsten
`1867947880635861`, kampanj `120250009539570291` ("Gravstenspennan | BE ROAS
1.60 | Launch 2026-08-29"), livstid 2026-08-29 → 2026-09-03 (`date_preset:
maximum`).

## Produktfakta (verifierade mot produktsidan 2026-09-03 — Shopify MCP är
kopplad till fel butik (TwinPillow, twinpillow.se), inte bäverbutiken.se, så
detta gjordes via direkt sidhämtning i stället)

- **Gravstenspenna – Återställer Blekt Text på Sten**
  (`gravstenspenna-aterstaller-blekt-text-pa-sten`), baverbutiken.se.
  SKU-prefix `TEMU-...` — Temu-sourcad produkt (launch-flödet i
  `docs/temu-launch-flow.md`).
- **Pris 269 kr, jämförpris 538 kr → 269 kr / 50 % rabatt** (verifierat i
  sidans JSON 2026-09-03: `price: 26900`, `compareAtPrice: 53800`, öre).
  **Kritiskt fynd:** alla fyra live-annonserna i CS-serien (`CS_1`, `CS_2`,
  `CS_3`, `CS_2_1`) påstår **"40% RABATT"** — i både `body`-texten och som
  inbränd bildtext på den statiska `CS_2_1`. Det är fel; verklig rabatt är
  50 %. Redovisas som offer-integritetsfel, ej rättat i kontot (kräver ny
  bild för `CS_2_1` eftersom texten är inbränd, inte overlay).
- Material: oljebaserad, väderbeständig färg, fin spets gjord för graverad
  text i sten. Torkar snabbt utan rinningar, tål regn/sol/frost. **6 nyanser:
  guld, svart, vit, silver, röd, blå. 20 ml per penna.**
- **Garanti: 30 dagars öppet köp, betalning med Klarna** (produktsidans egen
  text, verifierat 2026-09-03).
- **0 recensioner** — verifierat direkt mot Judge.me REST-API
  (`shop_domain=4snrw0-mg.myshopify.com`, `product_external_id
  16454828753245`, samt en sökning på handle `gravstenspenna...` i 500
  hämtade recensioner totalt över hela butiken): noll träffar. Produkten är 5
  dagar gammal — inga review-bilder kan byggas i den här batchen, och de två
  befintliga testcenter-voiceover-manusen ("SOCIAL PROOF", "GIFT") innehåller
  **påstådda kundcitat som INTE går att verifiera** (se Losing DNA nedan).
- Break-even-ROAS **1,60×** (ur kampanjnamnet).
- Meta Ad Library, svensk sökterm "gravstenspenna" (2026-09-03): minst 4
  konkurrenter säljer liknande produkter — **Gernhaben** ("Guldpenna för att
  återställa blekta gravinskriptioner"), **Goodssgo**, **FyndPoint**
  ("Memoria™ Grafpen Guld"), **Swedenfy shop**. Kategorin är validerad
  utifrån, men inget swipe-material hämtat än (bara rubriker synliga i
  Ad Library-träffen).

## Datakvalitet

`amount_spent × purchase_roas` kontrollerat per bedömbar annons mot
`omni_purchase_values` — stämmer inom 0,1 % på alla fyra (CS_1: 2 056,86 vs
2 056,90; CS_2: 2 186,83 vs 2 186,60; CS_3: 963,62 vs 963,60; CS_2_1: 1 738,85
vs 1 738,90). `omni_purchase_values`-fältet är INTE trasigt i den här
kampanjen — användes direkt. Videotumnaglar för `CS_1`/`PD_1` kunde bara
hämtas i 64×64 px (Facebooks cache) — tillräckligt för en grov bedömning
(se teardown), men för lite för en fullständig visuell granskning. Inga
video-manus/transkript fanns tillgängliga bortom `body`-texten (som fungerar
som on-screen text, inte nödvändigtvis exakt voiceover) — flaggat, ej
gissat.

## FAS 1b — upphämtning: ingen annons är faktiskt PAUSED

Ronden flaggade behovet som `ersatt` ("material pausat senaste veckan —
ersätt det som stängts av"), grundat i att `TRAPPA_STEG_1` loggades för denna
kampanj 2026-08-31 (kod som normalt betyder att en annons stängdes av).
**Verifierat mot Meta 2026-09-03: samtliga 17 annonser och alla 4 adset i
kampanjen har `effective_status: ACTIVE`. Ingen annons är eller har varit
PAUSED.** Den loggade raden själv säger varför: dess `motivering` var
"ingen dominant annons att pausa — [...] ligger under 50 %-tröskeln" — alltså
loggades trappkoden utan att någon annons faktiskt stängdes av. `ersatt`-
flaggan i ronden var alltså en förväxling mellan "trappkod skrevs" och
"något pausades". Ingen efterföljande trappa-rad (STANG_AV, TRAPPA_STEG_2/3)
finns heller för kampanjen. Detta är INTE hittat på — det är en direkt
avläsning av `agent/budgetlogg.jsonl` rad 94 och en färsk Meta-hämtning.

**Konsekvens för den här batchen:** eftersom inget konkret material är
pausat, byggdes batchen i stället kring de FAKTISKT svaga varianterna inom
varje koncept (se vinstbidragstabellen) — vilket är den substantiella
tolkningen av "ersätt det som stängts av" när inget bokstavligt stängdes av.
Ingen Meta-status ändrades av den här körningen.

## Siffrorna (bedömbara annonser, ≥300 kr + ≥3 köp; BE-ROAS 1,60)

Namnkoderna mappar exakt mot de 4 voiceover-koncepten i testcenter-sidan:
**CS = Clearance Sale, PD = Demo, SP = Social Proof, G = Gift.**

| Annons | Format | Koncept | Spend | Köp | CPA | ROAS | Vinstbidrag* |
|---|---|---|---|---|---|---|---|
| **Gravsten_CS_2_1** | Statisk | Clearance Sale | 477,77 kr | 4 | 119,44 kr | **3,64** | Starkast per krona |
| Gravsten_CS_1 | Video | Clearance Sale | 779,15 kr | 5 | 155,83 kr | 2,64 | Stark |
| **Gravsten_CS_2** | Video | Clearance Sale | 1 667,62 kr (**35,3 % av kampanjens spend — toppspendern**) | 6 | 277,94 kr | 1,31 | **Under break-even trots högst spend** |
| Gravsten_CS_3 | Video | Clearance Sale | 1 055,79 kr | 2† | 527,90 kr | 0,91 | **Förlust** |

*Vinstbidrag räknat kvalitativt (ROAS mot BE 1,60), inte i kr — AOV varierar
för mycket mellan annonserna (364–482 kr) för en enda break-even-CPA-siffra
att vara meningsfull på 4–6 köp per annons; se ANALYSMETOD steg 2c
(preliminära domar på 3–4 köp).
†CS_3 har bara 2 köp — klarar INTE den formella signifikansgrinden (≥3 köp)
trots 1 055,79 kr spend. Klassad som "nära gränsen, oroande trend", INTE
formellt dömd — men vägde tungt i beslutet att ge den nya hooken företräde.

**Kritiskt fynd — samma copy, olika visuellt:** `CS_1`, `CS_2`, `CS_3` har
**identisk** `body`/`title`-text ("40% RABATT – ENDAST IDAG" + samma brödtext),
skiljer sig bara på `video_id`. `CS_2_1` har samma text men är en **statisk
bild**, inte video. Ändå spänner ROAS från 0,91 till 3,64 — variabeln som
avgör är alltså **visuellt/format, inte copy**. Granskning av thumbnails
(64×64 px, grovt): `CS_1` (ROAS 2,64) öppnar på en riktig gravsten i
närbild med synlig gravyr — `CS_2_1` (ROAS 3,64, bäst) är en ren
produktbild på vit bakgrund med tjock svart typsnittstext, hög kontrast.
Det konkreta/verkliga vinner över abstrakt bildspråk — i linje med
`docs/hook-visual-rule-2026-08-04.md`.

**Koncept-nivå (aggregerat, alla 4 ads per koncept):**

| Koncept | Spend | Köp | Blandad ROAS | Dom |
|---|---|---|---|---|
| **Clearance Sale (CS)** | 3 980,33 kr (84 % av kampanjen) | 17 | **1,75** (över BE 1,60) | Lönsam i snitt, men 2 av 4 varianter under break-even |
| Demo (PD) | ~575,98 kr | 0 | — | 0 köp, CTR 0,72–1,79 % (lägst i kampanjen). Text-tung öppning (caption-kort), inte ett fysiskt objekt — matchar hook-visual-regelns diagnos för svaga hooks |
| Social Proof (SP) | ~135,98 kr | 0 | — | Nästan otestad, inte bevisat svag |
| Gift (G) | ~32,48 kr | 1 (brus, 3,32 kr spend) | — | Nästan otestad, inte bevisat svag |

**Top spendern (CS_2, 35,3 % av spenden) presterar UNDER break-even** —
i linje med ANALYSMETOD steg 5:s varning: hög spend ≠ automatiskt vinnare.
Den ska inte behandlas som benchmark här; det är CS-konceptet i aggregat
(ROAS 1,75) och de två starkaste enskilda varianterna (CS_1, CS_2_1) som är
benchmark.

## Kvalitetskontroll av befintligt material (obligatoriskt, FAS 0/regel 8)

- **Prisfel:** "40% RABATT" i `CS_1/2/3/2_1` — verklig rabatt är 50 %.
  `CS_2_1` har talet inbränt i själva bilden (ny bild krävs för att rätta).
- **Fabricerade citat:** testcenter-sidans "SOCIAL PROOF"-manus ("Jag trodde
  jag var tvungen att anlita en stenhuggare", "hundratals familjer") och
  "GIFT"-manus ("Den här presenten fick min mamma att tårar i ögonen") är
  skrivna som om de vore riktiga kundutsagor. **0 verifierade recensioner
  finns.** Dessa rader har INTE använts i den nya batchen och manusen i
  Notion-sidan har INTE redigerats (den är inte vår att ändra) — men de får
  inte användas ordagrant förrän riktiga recensioner finns.
- **Skrivfel i källmaterialet:** DEMO-konceptets hook-alternativ 3 i
  testcenter-sidan är bara "czz" (trasig platshållartext) — ignorerad, inte
  gissad.

## Winning DNA

- **Clearance Sale-vinkeln (rabatt + verklig stenhuggarjämförelse) fungerar**
  — enda konceptet med riktig spend och blandad ROAS över break-even.
- **Konkret visuellt objekt (riktig gravsten eller ren produktbild med hög
  kontrast) slår ett abstrakt/text-tungt öppningsklipp**, även med identisk
  copy — bekräftat genom en kontrollerad jämförelse (samma text, olika
  video/format) mellan `CS_1`/`CS_2_1` (vinner) och `CS_2`/`CS_3` (förlorar).
- Statisk kan slå video på samma copy (`CS_2_1`, ROAS 3,64 — kontots bästa).

## Losing DNA / Undvik

- Text-tung öppning utan fysiskt objekt inom första sekunden (PD-konceptets
  nuvarande hook, CTR 0,72–1,79 %, lägst i kampanjen).
- Felaktig rabattsats ("40 %" i stället för verkliga 50 %).
- Påstådda kundcitat utan verifierade recensioner (SP/G-manusens nuvarande
  form i testcenter-sidan).

## Obevisat (för tidigt att döma)

Social Proof och Gift-koncepten: <150 kr spend vardera, i praktiken aldrig
givna en riktig chans av algoritmen. Ny brief-runda ger dem en verklig
budget denna gång (se batch-log).

## Konkurrenter (Meta Ad Library, 2026-09-03, sökterm "gravstenspenna", SE)

Minst 4 aktiva konkurrenter: Gernhaben, Goodssgo, FyndPoint ("Memoria™
Grafpen Guld"), Swedenfy shop. Ingen fullständig swipe gjord denna gång
(bara rubrikträffar) — kandidat för nästa runda.
