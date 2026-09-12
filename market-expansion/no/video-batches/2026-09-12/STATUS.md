# NO-videobatch 2026-09-12 — status

Rutin: `/translate-no` (`.claude/commands/translate-no.md`). Källa: Drive-mappen
LAUNCHED (`1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`).

## Fas 0 — Inventering

LAUNCHED innehöll 7 produktmappar (minus WINNERS/LOSERS/MAKE TO NORWAY). Tre var
redan behandlade 2026-09-11 (Isolerad Utekattkoja, Taköverdrag Husvagn, Stegstöd
2-pack — alla har `NO <namn>` i MAKE TO NORWAY och kampanj i kontot). Fyra
kandidater kvar, varav de tre första i bokstavsordning kördes:

| Kandidat | Läge |
|---|---|
| 5.1 Lövblåsare | ✅ körd |
| 7 Solcellslarm 2-pack | ✅ körd |
| 7 Termoskydd Husbil 211 × 171 cm | ✅ körd |
| Staketstolpslagare | **i kö till nästa natt** (tredje natten i rad) |

MAKE TO NORWAY listad rekursivt (30 mappar i roten + 3 i undermappen WINNERS) —
ingen av de fyra kandidaterna fanns där. Kontot act_1050941584152547 hade 37
kampanjer, ingen med kandidaternas namn.

Alla tre produktmappar hade 12 annonsvideor vardera (CS/G/PD/SP × 3) = **36 videor**.

Priser och COGS verifierade mot beverbutikken.no och batch-sheet #5.1 (Jetvifte) /
#7 (Solcellslarm, Termoskydd), EUR→NOK 10,77704 (open.er-api.com, 2026-09-12):

| Produkt (norskt namn) | Pris | Jämförpris | COGS (NORWAY, Qty 1) | BE-ROAS |
|---|---|---|---|---|
| Jetvifte for Makita-batteri | 679 kr | 883 kr (23 %) | 24,36 EUR → 262,53 kr | 1,63 |
| Solcellealarm 2-pk | 719 kr | 1438 kr (50 %) | 25,56 EUR → 275,46 kr | 1,62 |
| Frontrutetrekk til Bobil | 509 kr | 849 kr (40 %) | 17,99 EUR → 193,88 kr | 1,62 |

**Prispolicyn tillämpad på två produkter** (Axels beslut 2026-08-29 — claimen ändras
aldrig, jämförpriset höjs): CS-copyns "50 %" respektive "40 %" stämde inte mot
butikens jämförpriser, så `tools/shopify-fix-compareat.mjs --market NO` höjde
Solcellslarm 939 → 1438 kr och Termoskydd 669 → 849 kr. Jetviftes 23 % stämde redan.
Ingen BE-ROAS påverkas — den räknas på försäljningspriset.

Inga produkter hoppades över: alla tre fanns på beverbutikken.no och hade
NORWAY-tal i sitt batch-sheet. Inget problemmeddelande skickat till `#problems-no`.

## Fas 1–2 — Lokalisering, rendering, captions

36 videor proofreadade och lokaliserade av tre parallella sonnet-subagenter.
Rättningar:

- **Jetvifte (CS_1–3):** HeyGen hade transkriberat det svenska källjudets SEK-belopp
  rakt av och dessutom förvanskat dem — "ordinær pris 924 kr, i dag bare 924 kr …
  tre prosent rabatt" (samma tal två gånger, ingen verklig rabatt). Rättat till
  verifierade 883 → 679 kr och 23 %. G/PD/SP nämner inga priser.
- **Solcellslarm (CS_1–3):** samma mönster, påhittade tal 1009/769/760 kr → 939 → 719 kr.
- **Termoskydd:** inga prisbelopp i källjudet alls (bara "redusert pris"), så inget
  tal lades till — att hitta på ett hade varit att uppfinna data. Två riktiga fel
  rättade: `SP_1` sa fortfarande det svenska produktnamnet "Termoskydd Husbil"
  → "Termobeskyttelse for bobil", och **samtliga 12 filer stavade butiken
  "Bäverbutiken"** (svensk stavning, fel butik för beverbutikken.no) → "Beverbutikken".
  Två filer hade dessutom rena felstavningar av samma namn ("Bäbebutiken", "Bävebutiken").

Timecodes och blockantal byte-för-byte identiska mot originalet i alla 36 filer
(verifierat programmatiskt av huvudsessionen, inte bara av subagenterna).

Alla 36 renderade och captionade med `no-captions.py` (band 1445–1613, sudd av
remsan under bandet). Automatkontrollen grön på 34 av 36.

**De två som flaggades var falsklarm, verifierade för hand:** `termoskydd_CS_3` och
`termoskydd_PD_2` rapporterade "text ovanför bandet" på rad 1320–1376 även efter att
bandet vidgats till 1380:1650. Granskning av alla sex QA-bilder visade ingen svensk
bokstav någonstans — det detektorn ser är produktens rutmönstrade, reflekterande
textil och husbilens egen engelska modellskylt ("FREEDOM ELITE"), inte källtext.
Samma falsklarmsmönster som tidigare batcher på ljusa motiv.

**Slutkortssvep:** sista sekunden granskad på 6 stickprov över alla tre produkter
och alla fyra koncept. Alla rena — ingen svensk domän, inget SEK-pris, och
butiksnamnet står korrekt som "Beverbutikken".

**Röstkollen (`rostkoll.py`) flaggade 35 av 36 för "avhugget slut".** Verifierat med
volymanalys att det är samma kända HeyGen-artefakt som 2026-09-10/11: renderingen
slutar 0,03–0,14 s före SRT:ns sluttid, men ljudet i den luckan ligger på −46 till
−62 dB, alltså redan naturligt avklingat. Åtgärdat med 0,3 s `tpad`/`apad` i stället
för omrendering (sparar HeyGen-krediter). **Omkörd röstkoll: 36 av 36 gröna.**

⚠️ Ingen människa har lyssnat på filerna — rutinen kör obevakad. Röstkollen mäter
tyst spår, längddrift, avhugget slut och tappat tal, men hör inte skillnad på bra
och keff röst. Det är den kända begränsningen i en nattkörning.

## Fas 3 — Launch i Magiborsten NO (act_1050941584152547)

Alla tre launchade ACTIVE, CBO 1000 kr/dag, adset per koncept (CS/G/PD/SP),
enhancements OPT_OUT, dubblettspärr körd (ingen fanns sedan tidigare):

- **Jetvifte NO | BE-ROAS 1,63 | 2026-09-12** — 4 adsets, 12 annonser ACTIVE.
- **Solcellealarm 2-pk NO | BE-ROAS 1,62 | 2026-09-12** — 4 adsets, 12 annonser ACTIVE.
- **Frontrutetrekk til Bobil NO | BE-ROAS 1,62 | 2026-09-12** — 4 adsets, 12 annonser ACTIVE.

⚠️ Kontot var hårt rate-limitat (Meta-fel 17) hela körningen — varje launch tog
15–25 minuter med inbyggd backoff, och verifieringsanropen mot API:t svarade
tidvis "User request limit reached" eller tom lista. Kampanjstatus och budget är
API-verifierade; annonsantalen kommer ur launchloggarna.

## Fas 3.2 — Bildannonser

**Gjord den här körningen** — steget hade hoppats över fem nätter i rad.
11 bildannonser (Jetvifte har 3 i källan, de andra två 4 vardera) lokaliserade:
Kie AI (`google/nano-banana-edit`) rensade den svenska texten, norsk text ritades
deterministiskt med PIL på positioner uppmätta ur källbilden med numpy. Varje bild
QA:ad visuellt. Två gjordes om: jetvifte_G behövde ett andra Kie-pass, termoskydd_SP
hade en trasig ikon.

⚠️ **Sakfel hittat i den SVENSKA källbilden** `Termoskydd Husbil_SP_2_1.png`:
kundcitatet säger "vet att **taket** klarar sig oavsett väder". Produkten är ett
frontrutetrekk som täcker vindrutan och mörklägger kupén — den skyddar inte taket.
Den norska versionen bär i stället produktens verkliga nytta ("helt mørkt uansett
vær"). **Den svenska bilden ligger fortfarande live med fel claim** — den bör
rättas av redigeraren.

## Fas 3.5 — Drive-leverans

Tre nya mappar skapade i MAKE TO NORWAY, allt uppladdat (12 videor + 4 adcopy-txt
+ bildannonserna per produkt):

- NO Lövblåsare: `1vsIMIrwzKkuf8fgQBlPa-Qy1fwrk5GdF`
- NO Solcellslarm 2-pack: `1lYtxOkZlnmI6oK4-Zj7iyspp4CPz7eDb`
- NO Termoskydd Husbil: `1B1U9v7qrMBed4KWXSXXhlYcopHG8RRYp`

Ingen chatt-leverans (zip): batchen är 185–322 MB per produkt, långt över
30 MiB-gränsen, och rutinen är obevakad. Drive + Meta är den faktiska leveransen.

## Krediter

Före: 10 008 api-krediter. Efter rendering: 8 938. **Förbrukat: 1 070** (411 på
36 proofreads, 659 på 36 renderingar).

## Sidospår: Norge-COGS för AdventLane-kalendern

Axel skrev in mitt i körningen att racerbilskalendern larmade om saknad Norge-COGS
och pekade ut källan. Hittad i batch-sheet #6, raden "car racing calendar":
NORWAY Qty 1 Total ex. tax = **15,69 EUR = 176,50 kr** (ECB 11,249083), ingen tull
eftersom Norge ligger utanför EU. BE-ROAS 1,55 vid 499 kr. Inskrivet i
`factory/produkter/adventskalender-racingbilar.yaml` med källa och datum, så
kalenderrutinen hittar det själv i stället för att larma. AdventLane-nattvakten
har sedan använt talet för att räkna BE-ROAS 1,63 mot NOK-priset 439 kr.
